import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'

interface SiteSettingsGlobal {
  maintenanceMode?: boolean
  maintenanceMessage?: string
}

interface MaintenancePayloadClient {
  findGlobal: (args: { slug: string }) => Promise<SiteSettingsGlobal | null>
  updateGlobal: (args: {
    slug: string
    data: Partial<SiteSettingsGlobal>
  }) => Promise<SiteSettingsGlobal>
  auth: (args: { headers: Headers }) => Promise<{
    user?: { role?: string; email?: string } | null
  }>
}

export async function GET() {
  try {
    const payload = (await getPayload({ config: configPromise })) as unknown as MaintenancePayloadClient
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    }).catch(() => null)

    return NextResponse.json({
      success: true,
      maintenanceMode: Boolean(settings?.maintenanceMode),
      maintenanceMessage:
        settings?.maintenanceMessage ||
        'The student portal is currently undergoing scheduled maintenance. Please check back later!',
    })
  } catch {
    return NextResponse.json({
      success: false,
      maintenanceMode: false,
      maintenanceMessage: '',
    })
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await getPayload({ config: configPromise })) as unknown as MaintenancePayloadClient
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
        // Auth fallback failed
      }
    }

    const isAdmin = user?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { maintenanceMode, maintenanceMessage } = body

    const updated = await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        ...(typeof maintenanceMode === 'boolean' ? { maintenanceMode } : {}),
        ...(typeof maintenanceMessage === 'string' && maintenanceMessage.trim()
          ? { maintenanceMessage: maintenanceMessage.trim() }
          : {}),
      },
    })

    return NextResponse.json({
      success: true,
      maintenanceMode: Boolean(updated.maintenanceMode),
      maintenanceMessage: updated.maintenanceMessage,
    })
  } catch (error) {
    console.error('Failed to update maintenance settings:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance settings.' },
      { status: 500 }
    )
  }
}
