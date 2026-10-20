"use client"

import { LogOut, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/users/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      window.location.href = '/auth/login'
    } catch {
      toast.error('Failed to log out')
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-red-50 hover:text-red-600 text-zinc-700 rounded-lg transition-colors font-medium disabled:opacity-50"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
      {loading ? 'Signing Out...' : 'Sign Out'}
    </button>
  )
}
