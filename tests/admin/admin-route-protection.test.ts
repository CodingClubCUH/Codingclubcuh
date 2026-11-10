import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

// Mock next/navigation redirect
const mockRedirect = vi.fn((url: string) => {
  const err = new Error(`NEXT_REDIRECT:${url}`)
  ;(err as any).url = url
  ;(err as any).digest = `NEXT_REDIRECT;replace;${url};307;`
  throw err
})

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}))

// Mock getAuthUser helper
const mockGetAuthUser = vi.fn()
vi.mock('@/payload/utilities/getAuthUser', () => ({
  getAuthUser: () => mockGetAuthUser(),
}))

// Mock client components rendered on the pages
vi.mock('@/components/payload-admin/CertificateHub', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-certificate-hub' }),
}))
vi.mock('@/components/payload-admin/ContactHub', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-contact-hub' }),
}))
vi.mock('@/components/payload-admin/NoticeBroadcast', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-notice-broadcast' }),
}))
vi.mock('@/components/logo', () => ({
  Logo: () => React.createElement('div', { 'data-testid': 'mock-logo' }),
}))

// Import the layout and pages
import AdminLayout from '@/app/(app)/admin/layout'
import CertificateHubPage from '@/app/(app)/admin/certificate-hub/page'
import ContactHubPage from '@/app/(app)/admin/contact-hub/page'
import NoticesPage from '@/app/(app)/admin/notices/page'

describe('Issue 12: Admin Dashboard Server-Side Route Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AdminLayout Server Protection', () => {
    it('redirects unauthenticated users to /admin/login before rendering children', async () => {
      mockGetAuthUser.mockResolvedValue({ user: null, isAdmin: false })

      await expect(
        AdminLayout({
          children: React.createElement('div', null, 'Protected Content'),
        })
      ).rejects.toThrow('NEXT_REDIRECT:/admin/login')

      expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
    })

    it('redirects authenticated students (non-admin) to /student before rendering children', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 42, email: 'student@cuh.ac.in', role: 'student' },
        isAdmin: false,
      })

      await expect(
        AdminLayout({
          children: React.createElement('div', null, 'Protected Content'),
        })
      ).rejects.toThrow('NEXT_REDIRECT:/student')

      expect(mockRedirect).toHaveBeenCalledWith('/student')
    })

    it('allows authenticated admin users full access to render protected children', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 1, email: 'admin@cuh.ac.in', role: 'admin' },
        isAdmin: true,
      })

      const testChild = React.createElement('div', { 'data-testid': 'admin-dashboard' }, 'Admin Secret Hub')
      const result = await AdminLayout({ children: testChild })

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('CertificateHubPage Server Protection (/admin/certificate-hub)', () => {
    it('redirects unauthenticated users directly to /admin/login', async () => {
      mockGetAuthUser.mockResolvedValue({ user: null, isAdmin: false })

      await expect(CertificateHubPage()).rejects.toThrow('NEXT_REDIRECT:/admin/login')
      expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
    })

    it('redirects authenticated students directly to /student', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 10, email: 'learner@cuh.ac.in', role: 'student' },
        isAdmin: false,
      })

      await expect(CertificateHubPage()).rejects.toThrow('NEXT_REDIRECT:/student')
      expect(mockRedirect).toHaveBeenCalledWith('/student')
    })

    it('renders the Certificate Hub page for verified administrators', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 1, email: 'admin@cuh.ac.in', role: 'admin' },
        isAdmin: true,
      })

      const page = await CertificateHubPage()
      expect(mockRedirect).not.toHaveBeenCalled()
      expect(page).toBeDefined()
    })
  })

  describe('ContactHubPage Server Protection (/admin/contact-hub)', () => {
    it('redirects unauthenticated users directly to /admin/login', async () => {
      mockGetAuthUser.mockResolvedValue({ user: null, isAdmin: false })

      await expect(ContactHubPage()).rejects.toThrow('NEXT_REDIRECT:/admin/login')
      expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
    })

    it('redirects authenticated students directly to /student', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 25, email: 'applicant@cuh.ac.in', role: 'student' },
        isAdmin: false,
      })

      await expect(ContactHubPage()).rejects.toThrow('NEXT_REDIRECT:/student')
      expect(mockRedirect).toHaveBeenCalledWith('/student')
    })

    it('renders the Contact Hub page for verified administrators', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 1, email: 'admin@cuh.ac.in', role: 'admin' },
        isAdmin: true,
      })

      const page = await ContactHubPage()
      expect(mockRedirect).not.toHaveBeenCalled()
      expect(page).toBeDefined()
    })
  })

  describe('NoticesPage Server Protection (/admin/notices)', () => {
    it('redirects unauthenticated users directly to /admin/login', async () => {
      mockGetAuthUser.mockResolvedValue({ user: null, isAdmin: false })

      await expect(NoticesPage()).rejects.toThrow('NEXT_REDIRECT:/admin/login')
      expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
    })

    it('redirects authenticated students directly to /student', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 33, email: 'user@cuh.ac.in', role: 'student' },
        isAdmin: false,
      })

      await expect(NoticesPage()).rejects.toThrow('NEXT_REDIRECT:/student')
      expect(mockRedirect).toHaveBeenCalledWith('/student')
    })

    it('renders the Notices Broadcast page for verified administrators', async () => {
      mockGetAuthUser.mockResolvedValue({
        user: { id: 1, email: 'admin@cuh.ac.in', role: 'admin' },
        isAdmin: true,
      })

      const page = await NoticesPage()
      expect(mockRedirect).not.toHaveBeenCalled()
      expect(page).toBeDefined()
    })
  })
})
