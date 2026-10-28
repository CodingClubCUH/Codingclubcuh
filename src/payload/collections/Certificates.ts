import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'
import { sendCertificateEmail } from '@/lib/email'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: {
    useAsTitle: 'studentName',
    defaultColumns: ['studentName', 'certificateId', 'certificateType', 'internship', 'isIssued'],
    group: 'Club Core',
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, req: { payload } }) => {
        if (!data.issueDate) {
          data.issueDate = new Date().toISOString();
        }

        // Satisfy DB constraints and provide sane defaults for date ranges
        if (!data.startDate) {
          data.startDate = data.issueDate;
        }
        if (!data.endDate) {
          data.endDate = data.issueDate;
        }

        // Hard-copy certificates are issued by default unless explicitly unchecked
        if (data.certificateType === 'hard_copy') {
          if (typeof data.isIssued === 'undefined') {
            data.isIssued = true;
          }

          // Auto-sync direct hardCopyUrl from linked media if provided
          if (data.hardCopyFile) {
            try {
              const fileId =
                typeof data.hardCopyFile === 'object'
                  ? (data.hardCopyFile as { id?: string | number })?.id
                  : data.hardCopyFile;
              if (fileId) {
                const mediaDoc = await payload.findByID({
                  collection: 'media',
                  id: fileId,
                });
                if (mediaDoc && mediaDoc.url) {
                  data.hardCopyUrl = mediaDoc.url;
                }
              }
            } catch {
              // Ignore lookup error
            }
          }
        }

        // Fall back to global default signatures if any signature is not provided (for digital certs)
        if (!data.signatureInstructor || !data.signatureCoordinator || !data.signatureStudentCoordinator) {
          try {
            const settings = await payload.findGlobal({
              slug: 'certificate-settings',
            });
            if (settings) {
              if (!data.signatureInstructor && settings.signatureInstructor) {
                const sId = typeof settings.signatureInstructor === 'object'
                  ? (settings.signatureInstructor as { id: number | string }).id
                  : settings.signatureInstructor;
                if (sId) data.signatureInstructor = Number(sId);
              }
              if (!data.signatureCoordinator && settings.signatureCoordinator) {
                const sId = typeof settings.signatureCoordinator === 'object'
                  ? (settings.signatureCoordinator as { id: number | string }).id
                  : settings.signatureCoordinator;
                if (sId) data.signatureCoordinator = Number(sId);
              }
              if (
                !data.signatureStudentCoordinator &&
                settings.signatureStudentCoordinator
              ) {
                const sId = typeof settings.signatureStudentCoordinator === 'object'
                  ? (settings.signatureStudentCoordinator as { id: number | string }).id
                  : settings.signatureStudentCoordinator;
                if (sId) data.signatureStudentCoordinator = Number(sId);
              }
            }
          } catch {
            // Ignore if settings global not initialized yet
          }
        }
        return data;
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        // Default certificateType if missing on legacy documents
        if (!doc.certificateType) {
          doc.certificateType = doc.hardCopyFile || doc.hardCopyUrl ? 'hard_copy' : 'digital';
        }

        // Populate hardCopyUrl if hardCopyFile is populated as media object
        if (doc.hardCopyFile && typeof doc.hardCopyFile === 'object' && (doc.hardCopyFile as { url?: string }).url) {
          doc.hardCopyUrl = doc.hardCopyUrl || (doc.hardCopyFile as { url?: string }).url;
        }

        if (!doc.signatureInstructor || !doc.signatureCoordinator || !doc.signatureStudentCoordinator) {
          try {
            const settings = await req.payload.findGlobal({
              slug: 'certificate-settings',
              depth: 1,
            });
            if (settings) {
              if (!doc.signatureInstructor && settings.signatureInstructor) {
                doc.signatureInstructor = settings.signatureInstructor;
              }
              if (!doc.signatureCoordinator && settings.signatureCoordinator) {
                doc.signatureCoordinator = settings.signatureCoordinator;
              }
              if (!doc.signatureStudentCoordinator && settings.signatureStudentCoordinator) {
                doc.signatureStudentCoordinator = settings.signatureStudentCoordinator;
              }
            }
          } catch {
            // Fallback gracefully
          }
        }
        return doc;
      },
    ],
    afterChange: [
      async ({ doc, req, previousDoc, operation }) => {
        // Prevent duplicate sending if called from issue-certificates route
        if (req?.context?.skipEmailHook || req?.context?.fromIssueRoute) {
          return
        }

        // Hard-copy certificates without student account do not require email dispatch
        if (doc.certificateType === 'hard_copy' && !doc.student) {
          return
        }

        // Automatically email certificate link to student when issued
        const isNowIssued = Boolean(doc.isIssued)
        const wasIssued = Boolean(previousDoc?.isIssued)

        if (isNowIssued && (!wasIssued || operation === 'create')) {
          try {
            // Check global setting
            let autoSendEmail = true
            try {
              const settings = await req.payload.findGlobal({
                slug: 'certificate-settings',
              })
              if (settings && typeof settings.autoSendEmailOnIssue === 'boolean') {
                autoSendEmail = settings.autoSendEmailOnIssue
              }
            } catch {
              // Ignore if settings global not initialized yet
            }

            if (!autoSendEmail) {
              return
            }

            let studentEmail = ''
            let studentName = doc.studentName || 'Student'

            if (doc.student) {
              const studentId = typeof doc.student === 'object' ? doc.student.id : doc.student
              if (studentId) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const studentUser: any = await req.payload.findByID({
                  collection: 'users',
                  id: studentId,
                })
                if (studentUser?.email) {
                  studentEmail = studentUser.email
                  if (!doc.studentName && studentUser.name) {
                    studentName = studentUser.name
                  }
                }
              }
            }

            if (studentEmail) {
              const emailResult = await sendCertificateEmail({
                to: studentEmail,
                studentName,
                courseTitle: doc.internship || 'Course',
                certificateId: doc.certificateId,
                issueDate: doc.issueDate
                  ? new Date(doc.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                  : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'https://codingclubcuh.online',
              })

              if (emailResult.success && !emailResult.simulated) {
                req.payload.logger.info(`[CERTIFICATE EMAIL] Successfully emailed ${doc.certificateId} to ${studentEmail}`)
                // Also update enrollment record if linked
                if (doc.courseRef && doc.student) {
                  const studentId = typeof doc.student === 'object' ? doc.student.id : doc.student
                  const courseId = typeof doc.courseRef === 'object' ? doc.courseRef.id : doc.courseRef
                  try {
                    const enrollments = await req.payload.find({
                      collection: 'enrollments',
                      where: {
                        and: [
                          { student: { equals: studentId } },
                          { course: { equals: courseId } },
                        ],
                      },
                      limit: 1,
                    })
                    if (enrollments.docs.length > 0) {
                      await req.payload.update({
                        collection: 'enrollments',
                        id: enrollments.docs[0].id,
                        data: {
                          certificateSent: true,
                          certificateSentAt: new Date().toISOString(),
                        },
                      })
                    }
                  } catch (enrollErr) {
                    req.payload.logger.error(`[CERTIFICATE ENROLLMENT UPDATE ERROR] ${enrollErr}`)
                  }
                }
              } else if (emailResult.simulated) {
                req.payload.logger.warn(`[CERTIFICATE EMAIL] Simulated email for ${doc.certificateId} to ${studentEmail} (Configure SMTP_PASS to deliver)`)
              } else {
                req.payload.logger.error(`[CERTIFICATE EMAIL ERROR] Failed to email ${studentEmail}: ${emailResult.error}`)
              }
            }
          } catch (err) {
            req.payload.logger.error(`[CERTIFICATE EMAIL ERROR] Failed to dispatch email for certificate ${doc.id}: ${err}`)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'isIssued',
      type: 'checkbox',
      label: 'Issue Certificate (Make visible to user)',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'certificateType',
      type: 'select',
      label: 'Certificate Type',
      defaultValue: 'digital',
      options: [
        { label: 'Digitally Generated', value: 'digital' },
        { label: 'Hard-Copy Upload', value: 'hard_copy' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Digitally generated certificate or uploaded physical hard-copy.',
      },
    },
    {
      name: 'certificateId',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Certificate Number / ID (e.g. CCCUH-INT-2026-XXXX or custom hard-copy number)',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              const year = new Date().getFullYear();
              const randomNum = Math.floor(1000 + Math.random() * 9000);
              return `CCCUH-INT-${year}-${randomNum}`;
            }
            return value.trim();
          }
        ]
      }
    },
    {
      name: 'hardCopyFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Hard-Copy Certificate File (Image or PDF)',
      admin: {
        description: 'Uploaded original scanned copy (JPG, PNG, WEBP, or PDF).',
      },
    },
    {
      name: 'hardCopyUrl',
      type: 'text',
      label: 'Hard-Copy File Direct URL',
      admin: {
        position: 'sidebar',
        description: 'Direct link to the uploaded certificate document.',
      },
    },
    {
      name: 'student',
      label: 'Student (User Account)',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        description: 'Link this certificate to the student\'s login account so they can see it in their dashboard.',
      },
    },
    {
      name: 'courseRef',
      label: 'Linked Course',
      type: 'relationship',
      relationTo: 'courses',
      admin: {
        position: 'sidebar',
        description: 'Associated course if issued as part of a club course offering.',
      },
    },
    {
      name: 'studentName',
      type: 'text',
      required: true,
    },
    {
      name: 'department',
      type: 'text',
      label: 'Department',
      defaultValue: 'Computer Sciences & Information Technology',
      required: false,
      admin: {
        components: {
          Field: '@/components/payload-admin/AcademicFields/DepartmentSelectField#default',
        },
      },
    },
    {
      name: 'course',
      type: 'text',
      label: 'Course',
      defaultValue: 'Master of Computer Applications (M.C.A.)',
      required: false,
      admin: {
        components: {
          Field: '@/components/payload-admin/AcademicFields/CourseSelectField#default',
        },
      },
    },
    {
      name: 'semester',
      type: 'text',
      label: 'Semester',
      defaultValue: '1st Semester',
      required: false,
      admin: {
        components: {
          Field: '@/components/payload-admin/AcademicFields/SemesterSelectField#default',
        },
      },
    },
    {
      name: 'internship',
      label: 'Programme / Event Name',
      type: 'text',
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      required: false,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: false,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'issueDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        position: 'sidebar'
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              return new Date().toISOString();
            }
            return value;
          }
        ]
      }
    },
    {
      type: 'collapsible',
      label: 'Signatures (for digitally generated certificates)',
      admin: {
        description: 'Upload signature images. These appear on digitally rendered certificates.',
      },
      fields: [
        {
          name: 'signatureInstructor',
          label: 'Convener (Dr. Sunil Kumar) Signature',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'signatureCoordinator',
          label: 'Co-convener (Dr. Prithi Maratha) Signature',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'signatureStudentCoordinator',
          label: 'Co-convener (Dr. Nitin Goyal) Signature',
          type: 'upload',
          relationTo: 'media',
        },
      ]
    }
  ],
}
