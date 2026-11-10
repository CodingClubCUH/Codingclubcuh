import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getAuthUser } from '@/payload/utilities/getAuthUser'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await getAuthUser(payload)

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in as a student to enroll in courses.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const courseId = body.courseId

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required for enrollment.' },
        { status: 400 }
      )
    }

    // Verify course exists
    let course
    try {
      course = await payload.findByID({
        collection: 'courses',
        id: courseId,
      })
    } catch {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    if (course.isEnrollmentOpen === false) {
      return NextResponse.json(
        { error: 'Enrollment for this course is currently closed.' },
        { status: 400 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollments = await payload.find({
      collection: 'enrollments',
      where: {
        and: [
          { student: { equals: user.id } },
          { course: { equals: course.id } },
        ],
      },
      limit: 1,
    })

    if (existingEnrollments.docs && existingEnrollments.docs.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        message: 'You are already enrolled in this course!',
        enrollment: existingEnrollments.docs[0],
      })
    }

    // Create new enrollment record
    const enrollment = await payload.create({
      collection: 'enrollments',
      data: {
        student: user.id,
        course: course.id,
        status: 'enrolled',
        selectedForCertificate: false,
        certificateSent: false,
        enrolledAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${course.title}!`,
      enrollment,
    })
  } catch (error) {
    console.error('Course enrollment error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing enrollment.' },
      { status: 500 }
    )
  }
}
