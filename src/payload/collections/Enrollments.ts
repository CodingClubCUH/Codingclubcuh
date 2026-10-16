import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { sendCertificateEmail } from '@/lib/email'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    defaultColumns: ['student', 'course', 'status', 'selectedForCertificate', 'certificateSent', 'enrolledAt'],
    group: 'Club Core',
    description: 'Track student course registrations and select eligible students for certificate issuance and emailing.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data?.student && data?.course) {
          const studentId = typeof data.student === 'object' ? data.student.id : data.student
          const courseId = typeof data.course === 'object' ? data.course.id : data.course

          if (studentId && courseId) {
            const existing = await req.payload.find({
              collection: 'enrollments',
              where: {
                and: [
                  { student: { equals: studentId } },
                  { course: { equals: courseId } },
                ],
              },
              limit: 1,
            })

            if (existing.docs.length > 0) {
              throw new Error('This student is already enrolled in this course.')
            }
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req: { payload } }) => {
        // If admin selected the student for a certificate and a certificate hasn't been generated yet
        if (doc.selectedForCertificate && !doc.certificate) {
          try {
            const courseId = typeof doc.course === 'object' ? doc.course?.id : doc.course
            const studentId = typeof doc.student === 'object' ? doc.student?.id : doc.student

            if (!courseId || !studentId) return

            const course = await payload.findByID({
              collection: 'courses',
              id: courseId,
            })

            const student = await payload.findByID({
              collection: 'users',
              id: studentId,
            })

            if (!course || !student) return

            const year = new Date().getFullYear()
            const randomNum = Math.floor(1000 + Math.random() * 9000)
            const certificateId = `CCCUH-CRS-${year}-${randomNum}`
            const studentName = student.name || student.username || 'Student'

            // Create official certificate document
            const certDoc = await payload.create({
              collection: 'certificates',
              data: {
                student: student.id,
                studentName,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                department: (student as any).department || ((course.department === 'Computer Science' || course.department === 'Information Technology' || course.department === 'Other') ? course.department : 'Computer Science and IT'),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                course: (student as any).course || 'Other',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                semester: (student as any).semester || 'Completed',
                internship: course.title,
                startDate: course.startingDate,
                endDate: course.completionDate || new Date().toISOString(),
                issueDate: new Date().toISOString(),
                isIssued: true,
                certificateId,
                courseRef: course.id,
              },
            })

            let certificateSent = false
            let certificateSentAt: string | undefined = undefined

            // Send notification email from cuhcodingclub@gmail.com
            if (student.email) {
              const emailResult = await sendCertificateEmail({
                to: student.email,
                studentName,
                courseTitle: course.title,
                certificateId,
                issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'https://codingclubcuh.online',
              })

              if (emailResult.success) {
                certificateSent = true
                certificateSentAt = new Date().toISOString()
              }
            }

            // Link certificate back to enrollment
            await payload.update({
              collection: 'enrollments',
              id: doc.id,
              data: {
                certificate: certDoc.id,
                status: 'completed',
                certificateSent,
                ...(certificateSentAt ? { certificateSentAt } : {}),
              },
            })

            payload.logger.info(`[CERTIFICATE AUTOMATION] Generated ${certificateId} and emailed to ${student.email || studentName}`)
          } catch (err) {
            payload.logger.error(`[CERTIFICATE AUTOMATION ERROR] Failed to issue certificate for enrollment ${doc.id}: ${err}`)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'student',
      label: 'Student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The enrolled student user account.',
      },
    },
    {
      name: 'course',
      label: 'Course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        description: 'The course the student is enrolled in.',
      },
    },
    {
      name: 'status',
      label: 'Enrollment Status',
      type: 'select',
      defaultValue: 'enrolled',
      required: true,
      options: [
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'In Progress', value: 'active' },
        { label: 'Course Completed', value: 'completed' },
        { label: 'Dropped', value: 'dropped' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'selectedForCertificate',
      label: 'Selected for Certificate (Admin Decision)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check to select this student for certificate issuance upon course completion.',
      },
    },
    {
      name: 'certificate',
      label: 'Issued Certificate',
      type: 'relationship',
      relationTo: 'certificates',
      admin: {
        position: 'sidebar',
        description: 'Automatically linked when certificate is generated and issued.',
      },
    },
    {
      name: 'certificateSent',
      label: 'Certificate Emailed to Student',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Indicates whether the certificate notification was emailed from codingclub@cuh.ac.in.',
      },
    },
    {
      name: 'certificateSentAt',
      label: 'Email Sent At',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'enrolledAt',
      label: 'Enrolled At',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'remarks',
      label: 'Notes / Performance Remarks',
      type: 'text',
      admin: {
        description: 'Optional admin notes (e.g. Excellent Capstone Project, Top 5 Performer).',
      },
    },
  ],
  timestamps: true,
}
