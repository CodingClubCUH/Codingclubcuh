import { NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const identifier = (body.identifier || body.email || body.username || '').trim()

    if (!identifier) {
      return NextResponse.json(
        { error: 'Please provide your  email or roll number.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    const isEmail = identifier.includes('@')

    // Explicitly type whereQuery as Where to satisfy Payload's find parameter
    const whereQuery: Where = isEmail
      ? { email: { equals: identifier.toLowerCase() } }
      : { username: { equals: identifier.toLowerCase() } }

    const userQuery = await payload.find({
      collection: 'users',
      where: whereQuery,
      limit: 1,
    })

    const user = userQuery.docs?.[0]

    // Fail silently to prevent user enumeration attacks
    if (!user || !user.email) {
      return NextResponse.json({
        success: true,
        message:
          'If an account matches those details, a password reset link has been sent to the registered email address.',
      })
    }

    const token = await payload.forgotPassword({
      collection: 'users',
      data: {
        email: user.email,
      },
    })

    payload.logger.info(`Password reset requested for user: ${user.email || user.username}`)

    // In development mode, return token for fast local testing
    const isDev = process.env.NODE_ENV === 'development'

    return NextResponse.json({
      success: true,
      message:
        'If an account matches those details, a password reset link has been sent to the registered email address.',
      ...(isDev && token ? { devResetUrl: `/auth/reset-password?token=${token}` } : {}),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again later.' },
      { status: 500 },
    )
  }
}
