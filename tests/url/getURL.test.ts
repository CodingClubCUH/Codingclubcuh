import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Issue 8: Development Port & URL Resolution (getURL)', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getServerSideURL', () => {
    it('defaults to http://localhost:3001 in development when env variables are unset', async () => {
      vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
      vi.stubEnv('URL', '')
      vi.stubEnv('PORT', '')
      vi.stubEnv('NODE_ENV', 'development')

      const { getServerSideURL } = await import('@/payload/utilities/getURL')
      expect(getServerSideURL()).toBe('http://localhost:3001')
    })

    it('respects process.env.PORT in development if custom port is specified', async () => {
      vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
      vi.stubEnv('URL', '')
      vi.stubEnv('PORT', '3005')
      vi.stubEnv('NODE_ENV', 'development')

      const { getServerSideURL } = await import('@/payload/utilities/getURL')
      expect(getServerSideURL()).toBe('http://localhost:3005')
    })

    it('returns NEXT_PUBLIC_SERVER_URL when set', async () => {
      vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://custom-domain.com')

      const { getServerSideURL } = await import('@/payload/utilities/getURL')
      expect(getServerSideURL()).toBe('https://custom-domain.com')
    })

    it('returns URL when NEXT_PUBLIC_SERVER_URL is unset', async () => {
      vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
      vi.stubEnv('URL', 'https://netlify-branch-url.app')

      const { getServerSideURL } = await import('@/payload/utilities/getURL')
      expect(getServerSideURL()).toBe('https://netlify-branch-url.app')
    })

    it('defaults to https://codingclubcuh.online in production when env variables are unset', async () => {
      vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
      vi.stubEnv('URL', '')
      vi.stubEnv('NODE_ENV', 'production')

      const { getServerSideURL } = await import('@/payload/utilities/getURL')
      expect(getServerSideURL()).toBe('https://codingclubcuh.online')
    })
  })

  describe('getClientSideURL', () => {
    it('delegates to getServerSideURL during SSR', async () => {
      vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
      vi.stubEnv('URL', '')
      vi.stubEnv('NODE_ENV', 'development')

      const { getClientSideURL } = await import('@/payload/utilities/getURL')
      expect(getClientSideURL()).toBe('http://localhost:3001')
    })
  })
})
