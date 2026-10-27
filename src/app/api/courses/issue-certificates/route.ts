import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'
import { sendCertificateEmail } from '@/lib/email'

// Helper to format Month and Year, e.g. "Sept 2026" or "June 2025"
function formatMonthYear(dateString?: string | null): { batchLabel: string; monthName: string; yearNumber: number } {
  if (!dateString) {
    const now = new Date()
    return {
      batchLabel: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthName: now.toLocaleDateString('en-US', { month: 'long' }),
      yearNumber: now.getFullYear(),
    }
  }
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return { batchLabel: 'General', monthName: 'All', yearNumber: new Date().getFullYear() }
  }
  return {
    batchLabel: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    monthName: date.toLocaleDateString('en-US', { month: 'long' }),
    yearNumber: date.getFullYear(),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: Fetch Courses & Batches or Enrolled Students with Issuance Status
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function authenticateAdmin(payload: any) {
  const headersList = await headers()
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  let authResult = await payload.auth({ headers: headersList })
  let user = authResult.user

  if (!user && token) {
    try {
      const customHeaders = new Headers(headersList)
      customHeaders.set('Authorization', `JWT ${token}`)
      authResult = await payload.auth({ headers: customHeaders })
      user = authResult.user
    } catch {
      // Fallback failed
    }
  }

  const isAdmin = user?.role === 'admin'
  if (!user || !isAdmin) {
    return null
  }
  return user
}

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await authenticateAdmin(payload)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can access certificate and student data.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    // 1. Fetch details & enrolled students for a specific course/batch
    if (courseId) {
      const course = await payload.findByID({
        collection: 'courses',
        id: courseId,
      })

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      const { batchLabel, monthName, yearNumber } = formatMonthYear(course.startingDate)
      const fullBatchName = `${course.title} (${batchLabel})`

      // Fetch all student enrollments for this course
      const enrollmentsRes = await payload.find({
        collection: 'enrollments',
        where: {
          course: { equals: course.id },
        },
        depth: 2,
        limit: 1000,
        sort: '-enrolledAt',
      })

      const students = enrollmentsRes.docs.map((doc) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const studentUser = doc.student as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cert = doc.certificate as any

        return {
          enrollmentId: doc.id,
          studentId: studentUser?.id || '',
          studentName: studentUser?.name || studentUser?.username || 'Student',
          studentEmail: studentUser?.email || '',
          department: studentUser?.department || course.department || 'Computer Science and IT',
          course: studentUser?.course || 'Other',
          semester: studentUser?.semester || 'Completed',
          enrolledAt: doc.enrolledAt,
          status: doc.status,
          selectedForCertificate: Boolean(doc.selectedForCertificate),
          hasCertificate: Boolean(cert && cert.id),
          certificateId: cert?.certificateId || null,
          certificateDbId: cert?.id || null,
          issueDate: cert?.issueDate || null,
          certificateSent: Boolean(doc.certificateSent),
          certificateSentAt: doc.certificateSentAt || null,
        }
      })

      // Deduplicate students by studentId in case duplicate enrollments exist
      const studentMap = new Map<string | number, (typeof students)[0]>()
      for (const s of students) {
        if (!s.studentId) continue
        const existing = studentMap.get(s.studentId)
        if (!existing) {
          studentMap.set(s.studentId, s)
        } else if (!existing.hasCertificate && s.hasCertificate) {
          studentMap.set(s.studentId, s)
        }
      }
      const uniqueStudents = Array.from(studentMap.values())

      const totalEnrolled = uniqueStudents.length
      const issuedCount = uniqueStudents.filter((s) => s.hasCertificate).length
      const pendingCount = totalEnrolled - issuedCount

      return NextResponse.json({
        success: true,
        course: {
          id: course.id,
          title: course.title,
          batchName: fullBatchName,
          batchLabel,
          monthName,
          yearNumber,
          department: course.department,
          instructorName: course.instructorName,
          instructorEmail: course.instructorEmail,
          startingDate: course.startingDate,
          completionDate: course.completionDate,
          status: course.status,
          isEnrollmentOpen: course.isEnrollmentOpen,
          totalEnrolled,
          issuedCount,
          pendingCount,
        },
        students: uniqueStudents,
      })
    }

    // 2. Fetch all courses grouped with Batch labels, months, years, and metrics
    const coursesRes = await payload.find({
      collection: 'courses',
      limit: 500,
      sort: '-startingDate',
    })

    // Also get enrollment counts per course
    const enrollmentsCountRes = await payload.find({
      collection: 'enrollments',
      limit: 5000,
      depth: 1,
    })

    // Check Global Certificate Settings for signatures status
    let hasGlobalSignatures = false
    try {
      const settings = await payload.findGlobal({ slug: 'certificate-settings' })
      if (settings && (settings.signatureInstructor || settings.signatureCoordinator || settings.signatureStudentCoordinator)) {
        hasGlobalSignatures = true
      }
    } catch {
      // ignore
    }

    const availableYears = new Set<number>()
    const availableMonths = new Set<string>()

    const coursesWithMetrics = coursesRes.docs.map((course) => {
      const { batchLabel, monthName, yearNumber } = formatMonthYear(course.startingDate)
      availableYears.add(yearNumber)
      availableMonths.add(monthName)

      const fullBatchName = `${course.title} (${batchLabel})`

      const courseEnrollments = enrollmentsCountRes.docs.filter((e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cId = typeof e.course === 'object' ? (e.course as any)?.id : e.course
        return String(cId) === String(course.id)
      })

      const uniqueStudentIds = new Set<string | number>()
      let issuedCount = 0
      for (const e of courseEnrollments) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sId = typeof e.student === 'object' ? (e.student as any)?.id : e.student
        if (sId && !uniqueStudentIds.has(sId)) {
          uniqueStudentIds.add(sId)
          if (e.certificate) {
            issuedCount++
          }
        }
      }
      const totalEnrolled = uniqueStudentIds.size
      const pendingCount = totalEnrolled - issuedCount

      return {
        id: course.id,
        title: course.title,
        batchName: fullBatchName,
        batchLabel,
        monthName,
        yearNumber,
        department: course.department,
        instructorName: course.instructorName,
        startingDate: course.startingDate,
        completionDate: course.completionDate,
        status: course.status,
        totalEnrolled,
        issuedCount,
        pendingCount,
      }
    })

    return NextResponse.json({
      success: true,
      courses: coursesWithMetrics,
      availableYears: Array.from(availableYears).sort((a, b) => b - a),
      availableMonths: Array.from(availableMonths),
      hasGlobalSignatures,
    })
  } catch (error) {
    console.error('Failed to fetch courses and certificate data:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching course certificate data.' },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: 1-Click Generate Certificate, Bulk Generate, or Resend Email
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const headersList = await headers()
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    // 1. Authenticate user
    let authResult = await payload.auth({ headers: headersList })
    let user = authResult.user

    if (!user && token) {
      try {
        const customHeaders = new Headers(headersList)
        customHeaders.set('Authorization', `JWT ${token}`)
        authResult = await payload.auth({ headers: customHeaders })
        user = authResult.user
      } catch {
        // Fallback failed
      }
    }

    const isAdmin = user?.role === 'admin'
    if (!user || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can issue or manage certificates.' },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { action, enrollmentId, enrollmentIds, courseId } = body
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://codingclubcuh.online'

    // Fetch Global Certificate Settings once for signatures and settings
    const globalSignatures: {
      signatureInstructor?: number
      signatureCoordinator?: number
      signatureStudentCoordinator?: number
    } = {}
    let autoSendEmail = true

    try {
      const settings = await payload.findGlobal({ slug: 'certificate-settings' })
      if (settings) {
        if (settings.signatureInstructor) {
          const rawId = typeof settings.signatureInstructor === 'object'
            ? (settings.signatureInstructor as { id: number | string }).id
            : settings.signatureInstructor
          if (rawId) globalSignatures.signatureInstructor = Number(rawId)
        }
        if (settings.signatureCoordinator) {
          const rawId = typeof settings.signatureCoordinator === 'object'
            ? (settings.signatureCoordinator as { id: number | string }).id
            : settings.signatureCoordinator
          if (rawId) globalSignatures.signatureCoordinator = Number(rawId)
        }
        if (settings.signatureStudentCoordinator) {
          const rawId = typeof settings.signatureStudentCoordinator === 'object'
            ? (settings.signatureStudentCoordinator as { id: number | string }).id
            : settings.signatureStudentCoordinator
          if (rawId) globalSignatures.signatureStudentCoordinator = Number(rawId)
        }
        if (typeof settings.autoSendEmailOnIssue === 'boolean') {
          autoSendEmail = settings.autoSendEmailOnIssue
        }
      }
    } catch {
      // Global settings optional fallback
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Action A: Resend Email Notification
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'resend_email' && enrollmentId) {
      const enrollment = await payload.findByID({
        collection: 'enrollments',
        id: enrollmentId,
        depth: 2,
      })

      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment record not found.' }, { status: 404 })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const certDoc = enrollment.certificate as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentObj = enrollment.student as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const courseObj = enrollment.course as any

      if (!certDoc || !certDoc.certificateId) {
        return NextResponse.json(
          { error: 'No certificate has been generated for this student yet.' },
          { status: 400 }
        )
      }

      const emailTo = studentObj?.email
      if (!emailTo) {
        return NextResponse.json(
          { error: 'Student does not have a registered email address.' },
          { status: 400 }
        )
      }

      const emailResult = await sendCertificateEmail({
        to: emailTo,
        studentName: studentObj?.name || studentObj?.username || certDoc.studentName || 'Student',
        courseTitle: courseObj?.title || certDoc.internship || 'Course',
        certificateId: certDoc.certificateId,
        issueDate: certDoc.issueDate
          ? new Date(certDoc.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
          : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        serverUrl,
      })

      if (emailResult.success && !emailResult.simulated) {
        await payload.update({
          collection: 'enrollments',
          id: enrollment.id,
          data: {
            certificateSent: true,
            certificateSentAt: new Date().toISOString(),
          },
        })

        return NextResponse.json({
          success: true,
          message: `Certificate email successfully sent to ${emailTo}.`,
          simulated: false,
        })
      } else if (emailResult.simulated) {
        return NextResponse.json(
          {
            error:
              'Email could not be delivered: SMTP password is not configured. Please set SMTP_PASS in .env or configure in Payload Admin under Certificate Settings > Signatures & Email Settings.',
            simulated: true,
          },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: `Failed to dispatch email: ${emailResult.error}` },
          { status: 500 }
        )
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Action B: 1-Click Generate Certificate (Single or Bulk)
    // ─────────────────────────────────────────────────────────────────────────
    const targetEnrollmentIds: Array<string | number> = []

    if (enrollmentId) {
      targetEnrollmentIds.push(enrollmentId)
    } else if (Array.isArray(enrollmentIds) && enrollmentIds.length > 0) {
      targetEnrollmentIds.push(...enrollmentIds)
    } else if (courseId) {
      // Find all enrollments for this course
      const allCourseEnrollments = await payload.find({
        collection: 'enrollments',
        where: {
          course: { equals: courseId },
        },
        limit: 1000,
      })
      for (const e of allCourseEnrollments.docs) {
        targetEnrollmentIds.push(e.id)
      }
    }

    if (targetEnrollmentIds.length === 0) {
      return NextResponse.json(
        { error: 'Please specify an enrollmentId, enrollmentIds, or courseId to issue certificates.' },
        { status: 400 }
      )
    }

    const results = {
      totalRequested: targetEnrollmentIds.length,
      certificatesCreated: 0,
      certificatesUpdated: 0,
      emailsSent: 0,
      simulatedEmails: 0,
      errors: [] as string[],
      details: [] as Array<{
        enrollmentId: string | number
        studentName: string
        email: string
        certificateId: string
        status: string
        emailSent: boolean
      }>,
    }

    for (const targetId of targetEnrollmentIds) {
      try {
        const enrollment = await payload.findByID({
          collection: 'enrollments',
          id: targetId,
          depth: 2,
        })

        if (!enrollment) {
          results.errors.push(`Enrollment ${targetId} not found`)
          continue
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const studentObj = enrollment.student as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const courseObj = enrollment.course as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let certDoc = enrollment.certificate as any

        if (!studentObj || !studentObj.id) {
          results.errors.push(`Enrollment ${targetId} has no linked student user`)
          continue
        }
        if (!courseObj || !courseObj.id) {
          results.errors.push(`Enrollment ${targetId} has no linked course`)
          continue
        }

        const studentName = studentObj.name || studentObj.username || 'Student'
        const studentEmail = studentObj.email
        const courseTitle = courseObj.title || 'Course'
        let certificateId = ''
        let isNewCert = false

        // 1. Create Certificate if not exists, or retrieve existing
        if (!certDoc || !certDoc.id) {
          const year = new Date().getFullYear()
          const randomNum = Math.floor(1000 + Math.random() * 9000)
          certificateId = `CCCUH-CRS-${year}-${randomNum}`
          isNewCert = true

          // Build certificate document with auto-extracted details, today's issue date, and global signatures
          certDoc = await payload.create({
            collection: 'certificates',
            context: { fromIssueRoute: true },
            data: {
              student: studentObj.id,
              studentName,
              department: studentObj.department || ((courseObj.department === 'Computer Science' || courseObj.department === 'Information Technology' || courseObj.department === 'Other')
                ? courseObj.department
                : 'Computer Science and IT'),
              course: studentObj.course || 'Other',
              semester: studentObj.semester || 'Completed',
              internship: courseTitle,
              startDate: courseObj.startingDate || new Date().toISOString(),
              endDate: courseObj.completionDate || new Date().toISOString(),
              issueDate: new Date().toISOString(), // automatically fetched current day
              isIssued: true,
              certificateId,
              courseRef: courseObj.id,
              ...(globalSignatures.signatureInstructor ? { signatureInstructor: globalSignatures.signatureInstructor } : {}),
              ...(globalSignatures.signatureCoordinator ? { signatureCoordinator: globalSignatures.signatureCoordinator } : {}),
              ...(globalSignatures.signatureStudentCoordinator ? { signatureStudentCoordinator: globalSignatures.signatureStudentCoordinator } : {}),
            },
          })

          results.certificatesCreated++
        } else {
          certificateId = certDoc.certificateId
          results.certificatesUpdated++
        }

        // 2. Link Certificate and mark enrollment status as completed
        let emailDispatched = false

        if (studentEmail && autoSendEmail && !enrollment.certificateSent) {
          const emailResult = await sendCertificateEmail({
            to: studentEmail,
            studentName,
            courseTitle,
            certificateId,
            issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            serverUrl,
          })

          if (emailResult.success && !emailResult.simulated) {
            emailDispatched = true
            results.emailsSent++
          } else if (emailResult.simulated) {
            results.simulatedEmails++
          }
        }

        await payload.update({
          collection: 'enrollments',
          id: enrollment.id,
          data: {
            certificate: certDoc.id,
            status: 'completed',
            selectedForCertificate: true,
            ...(emailDispatched
              ? { certificateSent: true, certificateSentAt: new Date().toISOString() }
              : {}),
          },
        })

        results.details.push({
          enrollmentId: enrollment.id,
          studentName,
          email: studentEmail || 'No email',
          certificateId,
          status: isNewCert ? 'created' : 'already_existed',
          emailSent: emailDispatched || Boolean(enrollment.certificateSent),
        })
      } catch (err) {
        results.errors.push(`Error processing enrollment ${targetId}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const simulatedNote = results.simulatedEmails > 0
      ? ` (${results.simulatedEmails} email(s) pending SMTP configuration: please set Google App Password in .env or Certificate Settings)`
      : ''

    return NextResponse.json({
      success: true,
      message: `Processed ${results.totalRequested} student(s): ${results.certificatesCreated} certificate(s) generated, ${results.emailsSent} email(s) dispatched.${simulatedNote}`,
      results,
    })
  } catch (error) {
    console.error('Certificate issuance API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during certificate issuance.' },
      { status: 500 }
    )
  }
}
