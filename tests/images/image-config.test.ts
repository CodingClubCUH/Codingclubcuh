import { describe, it, expect } from 'vitest'
import type { NextConfig } from 'next'

describe('Issue 9: Next.js Image Optimization Configuration', () => {
  it('enables image optimization and configures modern formats without global unoptimized flag', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextConfigModule: any = await import('@/../next.config')
    const config: NextConfig = nextConfigModule.default

    expect(config.images).toBeDefined()
    // unoptimized must NOT be true
    expect(config.images?.unoptimized).toBeFalsy()
    // formats must include modern webp and avif
    expect(config.images?.formats).toContain('image/webp')
    expect(config.images?.formats).toContain('image/avif')
  })

  it('includes all necessary remote image hostnames in remotePatterns', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextConfigModule: any = await import('@/../next.config')
    const config: NextConfig = nextConfigModule.default

    const hostnames = config.images?.remotePatterns?.map(
      (p: { hostname: string }) => p.hostname
    )

    expect(hostnames).toContain('res.cloudinary.com')
    expect(hostnames).toContain('codingclubcuh.online')
    expect(hostnames).toContain('www.codingclubcuh.online')
    expect(hostnames).toContain('raw.githubusercontent.com')
    expect(hostnames).toContain('localhost')
    expect(hostnames).toContain('127.0.0.1')
  })
})
