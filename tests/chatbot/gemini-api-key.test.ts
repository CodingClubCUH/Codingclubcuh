import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/chat/route'

describe('Issue 6: Gemini API Key Security & Server-Side Execution', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('Server-Side Key Resolution & Execution', () => {
    it('executes server-side Gemini request using GEMINI_API_KEY with x-goog-api-key header and no URL key', async () => {
      process.env.GEMINI_API_KEY = 'test-secret-gemini-key'
      delete process.env.NEXT_PUBLIC_GEMINI_API_KEY

      let calledUrl = ''
      let calledHeaders: Record<string, string> = {}

      const mockFetch = vi.fn().mockImplementation(async (url: string, init: RequestInit) => {
        calledUrl = url
        calledHeaders = (init.headers as Record<string, string>) || {}
        return {
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Hello from mocked Gemini AI!' }],
                },
              },
            ],
          }),
        }
      })
      vi.stubGlobal('fetch', mockFetch)

      const req = new NextRequest('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What is coding club?' }],
          persona: 'mentor',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.provider).toBe('ai')
      expect(json.message.content).toBe('Hello from mocked Gemini AI!')

      // Verify key is NOT passed as a URL query parameter
      expect(calledUrl).not.toContain('?key=')
      expect(calledUrl).not.toContain('test-secret-gemini-key')

      // Verify key is securely sent via server header
      expect(calledHeaders['x-goog-api-key']).toBe('test-secret-gemini-key')
    })
  })

  describe('Missing-Key Handling', () => {
    it('gracefully falls back to smart assistant response when GEMINI_API_KEY is not set', async () => {
      delete process.env.GEMINI_API_KEY
      delete process.env.NEXT_PUBLIC_GEMINI_API_KEY

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      const req = new NextRequest('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Tell me about upcoming events' }],
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.provider).toBe('assistant')
      expect(json.message.content).toBeDefined()
      // Zero external network calls should be made when key is missing
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('gracefully falls back when GEMINI_API_KEY is only whitespace', async () => {
      process.env.GEMINI_API_KEY = '   '

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      const req = new NextRequest('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'How do I verify certificate?' }],
        }),
      })

      const res = await POST(req)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.provider).toBe('assistant')
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Upstream Error Handling', () => {
    it('falls back to smart assistant response without crashing when upstream Gemini API fails', async () => {
      process.env.GEMINI_API_KEY = 'test-failing-key'

      const mockFetch = vi.fn().mockImplementation(async () => ({
        ok: false,
        status: 403,
        text: async () => 'API key expired or invalid',
      }))
      vi.stubGlobal('fetch', mockFetch)

      const req = new NextRequest('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)

      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.provider).toBe('assistant')
    })
  })

  describe('Client Input Security & Validation', () => {
    it('returns 400 when no messages are provided', async () => {
      const req = new NextRequest('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.error).toBe('No messages provided')
    })

    it('ignores client-supplied apiKey in body and does not use client keys', async () => {
      delete process.env.GEMINI_API_KEY

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      const req = new NextRequest('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Help' }],
          apiKey: 'client-injected-api-key',
        }),
      })

      const res = await POST(req)
      const json = await res.json()
      // Because server GEMINI_API_KEY was deleted, it should fall back to assistant and NOT use client-supplied key
      expect(json.provider).toBe('assistant')
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })
})
