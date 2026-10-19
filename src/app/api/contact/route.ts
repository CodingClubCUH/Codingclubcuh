import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'
import { Telegraf } from 'telegraf'
import {
  getAllContactMessages,
  createContactMessage,
  updateContactMessage,
  deleteContactMessage,
  getContactStats,
} from '@/lib/contactStorage'

async function checkIsAdmin(): Promise<{ isAdmin: boolean; user?: unknown }> {
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

    if (!user) return { isAdmin: false }
    const isAdmin = user.role === 'admin'
    return { isAdmin, user }
  } catch {
    return { isAdmin: false }
  }
}

// GET: Admin fetch all contact inquiries
export async function GET(req: Request) {
  try {
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')?.toLowerCase()

    let messages = await getAllContactMessages()

    if (status && status !== 'all') {
      messages = messages.filter((m) => m.status === status)
    }

    if (search) {
      messages = messages.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search) ||
          m.subject.toLowerCase().includes(search) ||
          m.message.toLowerCase().includes(search)
      )
    }

    const stats = await getContactStats()

    return NextResponse.json({
      success: true,
      messages,
      stats,
    })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact inquiries.' },
      { status: 500 }
    )
  }
}

// POST: Public submission from /contact page
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { name, email, subject, message, channel } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 })
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 })
    }

    const newInquiry = await createContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      channel: channel || 'website',
    })

    // Optionally notify admins on Telegram if configured
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      const chatId = process.env.TELEGRAM_CHAT_ID

      if (botToken && chatId) {
        const bot = new Telegraf(botToken)
        const tgMessage = `📬 *NEW CONTACT INQUIRY - CODING CLUB CUH*\n\n` +
          `👤 *From:* ${name.trim()}\n` +
          `📧 *Email:* ${email.trim()}\n` +
          `📌 *Subject:* ${subject.trim()}\n\n` +
          `💬 *Message:*\n${message.trim().substring(0, 500)}${message.length > 500 ? '...' : ''}\n\n` +
          `🔗 _View in Admin Dashboard: /admin/contact-hub_`

        await bot.telegram.sendMessage(chatId, tgMessage, { parse_mode: 'Markdown' })
      }
    } catch (tgError) {
      console.warn('[CONTACT BOT] Telegram dispatch skipped or failed:', tgError)
    }

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been submitted successfully! The team will reach out soon.',
      inquiry: newInquiry,
    })
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

// PATCH: Admin update message status or add notes
export async function PATCH(req: Request) {
  try {
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { id, status, adminNotes } = body

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 })
    }

    const updated = await updateContactMessage(id, {
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    })

    if (!updated) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 })
    }

    const stats = await getContactStats()

    return NextResponse.json({
      success: true,
      message: 'Inquiry updated successfully.',
      inquiry: updated,
      stats,
    })
  } catch (error) {
    console.error('Error updating contact message:', error)
    return NextResponse.json(
      { error: 'Failed to update inquiry.' },
      { status: 500 }
    )
  }
}

// DELETE: Admin remove an inquiry
export async function DELETE(req: Request) {
  try {
    const { isAdmin } = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 })
    }

    const deleted = await deleteContactMessage(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 })
    }

    const stats = await getContactStats()

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully.',
      stats,
    })
  } catch (error) {
    console.error('Error deleting contact message:', error)
    return NextResponse.json(
      { error: 'Failed to delete inquiry.' },
      { status: 500 }
    )
  }
}
