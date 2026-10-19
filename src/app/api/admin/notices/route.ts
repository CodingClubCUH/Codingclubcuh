import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'
import { sendNoticeEmail } from '@/lib/email'
import { getAllSentNotices, saveSentNotice } from '@/lib/noticeStorage'

async function checkIsAdmin(): Promise<{ isAdmin: boolean; user?: { id?: string | number; role?: string; email?: string } | null }> {
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
        // Fallback
      }
    }

    if (!user) return { isAdmin: false, user: null }
    const isAdmin = user.role === 'admin' || user.email === 'ajays.sharma27@gmail.com'
    return { isAdmin, user }
  } catch {
    return { isAdmin: false, user: null }
  }
}

// GET: Fetch all student recipients and past broadcast notices
export async function GET() {
  try {
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Fetch all users with email addresses
    const usersRes = await payload.find({
      collection: 'users',
      limit: 5000,
      sort: '-createdAt',
    })

    // Filter and map to recipients list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const students = (usersRes.docs || []).map((u: any) => ({
      id: u.id,
      name: u.name || 'Student',
      email: u.email || '',
      username: u.username || '',
      course: u.course || 'Not Specified',
      department: u.department || 'Not Specified',
      semester: u.semester || 'Not Specified',
      role: u.role || 'student',
      createdAt: u.createdAt,
    })).filter((s) => s.email && s.email.includes('@'))

    const sentNotices = await getAllSentNotices()

    return NextResponse.json({
      success: true,
      totalStudents: students.length,
      students,
      sentNotices,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/notices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student directory and notice history.' },
      { status: 500 }
    )
  }
}

// POST: Broadcast notice to selected student emails at once
export async function POST(req: Request) {
  try {
    const { isAdmin, user } = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { recipients, subject, message, category } = body

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one recipient email address.' },
        { status: 400 }
      )
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'Notice subject / title is required.' },
        { status: 400 }
      )
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Notice content / message is required.' },
        { status: 400 }
      )
    }

    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()
    const noticeCategory = category || 'Club Announcement'

    // Deduplicate valid emails
    const uniqueRecipients = Array.from(
      new Set(
        recipients
          .map((r: string | { email: string }) => (typeof r === 'string' ? r.trim() : r.email.trim()))
          .filter((e: string) => e && e.includes('@'))
      )
    )

    if (uniqueRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipient email addresses found in selection.' },
        { status: 400 }
      )
    }

    // Concurrently dispatch emails in chunks of 5
    const CHUNK_SIZE = 5
    let sentCount = 0
    let failedCount = 0
    let isSimulated = false
    const errors: string[] = []

    for (let i = 0; i < uniqueRecipients.length; i += CHUNK_SIZE) {
      const chunk = uniqueRecipients.slice(i, i + CHUNK_SIZE)
      await Promise.all(
        chunk.map(async (email) => {
          try {
            const res = await sendNoticeEmail({
              to: email,
              subject: trimmedSubject,
              noticeContent: trimmedMessage,
              category: noticeCategory,
            })

            if (res.success) {
              sentCount++
              if (res.simulated) isSimulated = true
            } else {
              failedCount++
              errors.push(`${email}: ${res.error || 'Unknown error'}`)
            }
          } catch (err) {
            failedCount++
            errors.push(`${email}: ${err instanceof Error ? err.message : String(err)}`)
          }
        })
      )
    }

    // Save record of notice to history
    const savedNotice = await saveSentNotice({
      subject: trimmedSubject,
      message: trimmedMessage,
      category: noticeCategory,
      recipientsCount: uniqueRecipients.length,
      recipients: uniqueRecipients,
      sentBy: user?.email || 'Admin',
      status: failedCount === 0 ? (isSimulated ? 'simulated' : 'sent') : (sentCount > 0 ? 'partially_sent' : 'failed'),
      failedCount,
      errors: errors.slice(0, 10), // Store first 10 errors if any
    })

    return NextResponse.json({
      success: true,
      message: isSimulated
        ? `Notice dispatched to ${sentCount} recipient(s) [Simulated mode: Set SMTP_PASS in .env or CMS to deliver live emails].`
        : `Notice successfully broadcasted to ${sentCount} recipient(s) at once!`,
      totalRecipients: uniqueRecipients.length,
      sentCount,
      failedCount,
      isSimulated,
      notice: savedNotice,
    })
  } catch (error) {
    console.error('Error in POST /api/admin/notices:', error)
    return NextResponse.json(
      { error: 'Failed to broadcast notice.' },
      { status: 500 }
    )
  }
}
