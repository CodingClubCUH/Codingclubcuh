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
    const isAdmin = user.role === 'admin'
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
    const {
      recipients,
      customEmails,
      subject,
      message,
      category,
      ctaText,
      ctaUrl,
      recipientName,
    } = body

    // 1. Gather all raw emails from recipients array and customEmails field
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const rawList: (string | { email: string; name?: string })[] = []

    if (Array.isArray(recipients)) {
      rawList.push(...recipients)
    }

    if (typeof customEmails === 'string') {
      const matches = customEmails.match(emailRegex) || []
      rawList.push(...matches)
    } else if (Array.isArray(customEmails)) {
      for (const item of customEmails) {
        if (typeof item === 'string') {
          const matches = item.match(emailRegex) || []
          rawList.push(...matches)
        }
      }
    }

    if (rawList.length === 0) {
      return NextResponse.json(
        { error: 'Please provide or select at least one recipient email address.' },
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

    const payload = await getPayload({ config: configPromise })

    // 2. Fetch existing users to determine registration status & real names
    const allUsers = await payload.find({
      collection: 'users',
      limit: 10000,
    })

    const registeredMap = new Map<string, string>() // lowerEmail -> name
    for (const u of allUsers.docs) {
      if (u.email) {
        registeredMap.set(u.email.toLowerCase().trim(), u.name || 'Student')
      }
    }

    // 3. Deduplicate and classify each recipient as registered or unregistered
    interface ParsedRecipient {
      email: string
      name: string
      isUnregistered: boolean
    }

    const uniqueRecipients: ParsedRecipient[] = []
    const seenEmails = new Set<string>()

    for (const item of rawList) {
      const emailRaw = typeof item === 'string' ? item : item?.email
      if (!emailRaw || typeof emailRaw !== 'string') continue
      const email = emailRaw.toLowerCase().trim()
      if (!email.includes('@') || seenEmails.has(email)) continue
      seenEmails.add(email)

      const isRegistered = registeredMap.has(email)
      const explicitName = typeof item === 'object' && item?.name ? item.name : recipientName
      const name = isRegistered
        ? (registeredMap.get(email) || explicitName || 'Student')
        : (explicitName || 'Student')

      uniqueRecipients.push({
        email,
        name,
        isUnregistered: !isRegistered,
      })
    }

    if (uniqueRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipient email addresses found.' },
        { status: 400 }
      )
    }

    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()
    const noticeCategory = category || 'Club Announcement'

    const unregisteredCount = uniqueRecipients.filter((r) => r.isUnregistered).length
    const registeredCount = uniqueRecipients.length - unregisteredCount

    // Concurrently dispatch emails in chunks of 5
    const CHUNK_SIZE = 5
    let sentCount = 0
    let failedCount = 0
    let isSimulated = false
    const errors: string[] = []

    for (let i = 0; i < uniqueRecipients.length; i += CHUNK_SIZE) {
      const chunk = uniqueRecipients.slice(i, i + CHUNK_SIZE)
      await Promise.all(
        chunk.map(async (recipient) => {
          try {
            const res = await sendNoticeEmail({
              to: recipient.email,
              studentName: recipient.name,
              subject: trimmedSubject,
              noticeContent: trimmedMessage,
              category: noticeCategory,
              ctaText,
              ctaUrl,
              isUnregistered: recipient.isUnregistered,
            })

            if (res.success) {
              sentCount++
              if (res.simulated) isSimulated = true
            } else {
              failedCount++
              errors.push(`${recipient.email}: ${res.error || 'Unknown error'}`)
            }
          } catch (err) {
            failedCount++
            errors.push(`${recipient.email}: ${err instanceof Error ? err.message : String(err)}`)
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
      recipients: uniqueRecipients.map((r) => r.email),
      unregisteredCount,
      registeredCount,
      ctaText,
      ctaUrl,
      sentBy: user?.email || 'Admin',
      senderEmail: process.env.SMTP_USER || 'codingclub@cuh.ac.in',
      status: failedCount === 0 ? (isSimulated ? 'simulated' : 'sent') : (sentCount > 0 ? 'partially_sent' : 'failed'),
      failedCount,
      errors: errors.slice(0, 10),
    })

    const breakdownText = unregisteredCount > 0
      ? ` (${registeredCount} registered member${registeredCount === 1 ? '' : 's'}, ${unregisteredCount} unregistered invite${unregisteredCount === 1 ? '' : 's'})`
      : ''

    return NextResponse.json({
      success: true,
      message: isSimulated
        ? `Notice dispatched to ${sentCount} recipient(s)${breakdownText} [Simulated mode: Set SMTP_PASS in .env or CMS to deliver live emails].`
        : `Notice successfully dispatched to ${sentCount} recipient(s)${breakdownText}!`,
      totalRecipients: uniqueRecipients.length,
      sentCount,
      failedCount,
      registeredCount,
      unregisteredCount,
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
