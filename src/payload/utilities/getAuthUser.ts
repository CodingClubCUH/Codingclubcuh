import { headers, cookies } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import type { User } from '@/payload-types'

export interface AuthResult {
  user: User | null
  isAdmin: boolean
  token?: string
}

/**
 * Shared in-process authentication helper.
 * Reads Next.js request headers and cookies, verifies authentication via Payload,
 * and handles JWT fallback and invalid/expired tokens safely.
 */
export async function getAuthUser(payloadInstance?: Payload | null): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value
    const headersList = await headers()

    // Return unauthenticated if no token cookie and no authorization header
    if (!token && !headersList.get('authorization')) {
      return { user: null, isAdmin: false }
    }

    const payload = payloadInstance || (await getPayload({ config: configPromise }))
    let user: User | null = null

    try {
      const authResult = await payload.auth({ headers: headersList })
      user = (authResult?.user as User) || null
    } catch {
      // payload.auth may throw on malformed/expired tokens
    }

    if (!user && token) {
      try {
        const customHeaders = new Headers(headersList)
        customHeaders.set('Authorization', `JWT ${token}`)
        const tokenAuth = await payload.auth({ headers: customHeaders })
        user = (tokenAuth?.user as User) || null
      } catch {
        // Fallback failed or token invalid/expired
      }
    }

    const isAdmin = Boolean(user && user.role === 'admin')
    return { user, isAdmin, token }
  } catch {
    return { user: null, isAdmin: false }
  }
}
