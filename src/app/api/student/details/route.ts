import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'

// GET: Fetch currently logged-in student's details
export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
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

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to view your details.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const queryStudentId = searchParams.get('studentId')
    const isAdmin = user.role === 'admin'

    // Block non-admins during maintenance mode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const siteSettings: any = await (payload as any).findGlobal({ slug: 'site-settings' }).catch(() => null)
    if (siteSettings?.maintenanceMode && !isAdmin) {
      return NextResponse.json(
        { error: siteSettings?.maintenanceMessage || 'Student portal is currently offline for maintenance.' },
        { status: 503 }
      )
    }

    const targetId = (isAdmin && queryStudentId) ? queryStudentId : user.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userDoc: any = await payload.findByID({
      collection: 'users',
      id: targetId,
    })

    if (!userDoc) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      isAdmin,
      isEditingOther: isAdmin && Boolean(queryStudentId && String(queryStudentId) !== String(user.id)),
      student: {
        id: userDoc.id,
        name: userDoc.name || '',
        username: userDoc.username || '',
        email: userDoc.email || '',
        course: userDoc.course || '',
        semester: userDoc.semester || '',
        department: userDoc.department || '',
      },
    })
  } catch (error) {
    console.error('Failed to get student details:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching details.' },
      { status: 500 }
    )
  }
}

// POST: Save/update student academic details & sync with certificates
export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const headersList = await headers()
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    // Authenticate user
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

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to update your details.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { course, semester, department, name, studentId } = body

    const isAdmin = user.role === 'admin'

    // Block non-admins during maintenance mode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const siteSettings: any = await (payload as any).findGlobal({ slug: 'site-settings' }).catch(() => null)
    if (siteSettings?.maintenanceMode && !isAdmin) {
      return NextResponse.json(
        { error: siteSettings?.maintenanceMessage || 'Student portal is currently offline for maintenance.' },
        { status: 503 }
      )
    }

    const targetUserId = (isAdmin && studentId) ? studentId : user.id

    if (!course || !course.trim()) {
      return NextResponse.json({ error: 'Course is required.' }, { status: 400 })
    }
    if (!semester || !semester.trim()) {
      return NextResponse.json({ error: 'Semester is required.' }, { status: 400 })
    }
    if (!department || !department.trim()) {
      return NextResponse.json({ error: 'Department is required.' }, { status: 400 })
    }

    const trimmedCourse = course.trim()
    const trimmedSemester = semester.trim()
    const trimmedDepartment = department.trim()
    const trimmedName = typeof name === 'string' && name.trim() ? name.trim() : null

    // 1. Update student user record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      course: trimmedCourse,
      semester: trimmedSemester,
      department: trimmedDepartment,
    }
    if (trimmedName) {
      updateData.name = trimmedName
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: targetUserId,
      data: updateData,
    })

    // 2. Retroactively update all certificates linked to this student
    // so any verified certificate immediately reflects their updated details
    const existingCerts = await payload.find({
      collection: 'certificates',
      where: {
        student: {
          equals: targetUserId,
        },
      },
      limit: 200,
    })

    let syncedCertCount = 0
    for (const cert of existingCerts.docs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const certUpdate: any = {
          course: trimmedCourse,
          semester: trimmedSemester,
          department: trimmedDepartment,
        }
        if (trimmedName) {
          certUpdate.studentName = trimmedName
        }
        await payload.update({
          collection: 'certificates',
          id: cert.id,
          data: certUpdate,
        })
        syncedCertCount++
      } catch (certErr) {
        console.error(`Failed to update certificate ${cert.id}:`, certErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Academic details saved successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        course: updatedUser.course,
        semester: updatedUser.semester,
        department: updatedUser.department,
      },
      syncedCertificates: syncedCertCount,
    })
  } catch (error) {
    console.error('Failed to update student details:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving details.' },
      { status: 500 }
    )
  }
}
