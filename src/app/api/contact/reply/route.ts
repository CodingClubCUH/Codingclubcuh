import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'
import { getContactMessageById, updateContactMessage } from '@/lib/contactStorage'
import { sendContactReplyEmail } from '@/lib/email'

async function checkIsAdmin(): Promise<boolean> {
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

    if (!user) return false
    return user.role === 'admin' || user.email === 'ajays.sharma27@gmail.com'
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { id, replyText } = body

    if (!id || !replyText || !replyText.trim()) {
      return NextResponse.json(
        { error: 'Inquiry ID and reply content are required.' },
        { status: 400 }
      )
    }

    const message = await getContactMessageById(id)
    if (!message) {
      return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 })
    }

    // Send email reply
    const emailResult = await sendContactReplyEmail({
      to: message.email,
      recipientName: message.name,
      originalSubject: message.subject,
      replyMessage: replyText.trim(),
      originalMessage: message.message,
    })

    if (!emailResult.success && !emailResult.simulated) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to dispatch email reply.' },
        { status: 500 }
      )
    }

    // Mark inquiry as replied and save the reply text
    const updated = await updateContactMessage(id, {
      status: 'replied',
      replyMessage: replyText.trim(),
      repliedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: emailResult.simulated
        ? 'Reply recorded (Email delivery simulated: SMTP credentials not set).'
        : 'Reply sent successfully to ' + message.email,
      inquiry: updated,
    })
  } catch (error) {
    console.error('Error replying to contact inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to send reply.' },
      { status: 500 }
    )
  }
}
