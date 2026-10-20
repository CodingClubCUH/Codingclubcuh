"use client"

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, ShieldCheck, User, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

function LoginForm() {
    const searchParams = useSearchParams()
    const redirectParam = searchParams.get('redirect')
    const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'student'

    const [activeTab, setActiveTab] = useState<'student' | 'admin'>(initialRole)
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [redirecting, setRedirecting] = useState(false)
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [maintenanceMessage, setMaintenanceMessage] = useState('')

    useEffect(() => {
        fetch('/api/maintenance')
            .then((res) => res.json())
            .then((data) => {
                if (data && typeof data.maintenanceMode === 'boolean') {
                    setMaintenanceMode(data.maintenanceMode)
                    if (data.maintenanceMessage) {
                        setMaintenanceMessage(data.maintenanceMessage)
                    }
                }
            })
            .catch(() => { })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!identifier.trim() || !password) {
            toast.error('Please enter both your identifier and password.')
            return
        }

        setLoading(true)
        setRedirecting(false)

        // Determine if they are logging in with email or roll number
        const isEmail = identifier.includes('@')
        const loginData = isEmail
            ? { email: identifier.trim(), password }
            : { username: identifier.trim(), password }

        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            })

            const data = await res.json()

            if (res.ok && data.user) {
                const isAdmin = data.user.role === 'admin'

                // If maintenance mode is ON and user is NOT admin: BLOCK LOGIN
                if (maintenanceMode && !isAdmin) {
                    await fetch('/api/users/logout', { method: 'POST' }).catch(() => { })
                    toast.error(
                        maintenanceMessage || 'Student portal is currently under maintenance. Only administrators can log in.'
                    )
                    setLoading(false)
                    return
                }

                setRedirecting(true)

                if (activeTab === 'admin' && !isAdmin) {
                    toast.info('Student credentials verified. Redirecting to Student Dashboard...')
                } else if (activeTab === 'student' && isAdmin) {
                    toast.success('Admin account recognized! Opening Admin Dashboard...')
                } else {
                    toast.success('Login successful!')
                }

                // Determine destination
                const destination = isAdmin ? '/admin' : (redirectParam || '/student')

                // Hard navigation to guarantee fresh cookies and root layout switch
                window.location.href = destination
                return
            } else {
                toast.error(data.errors?.[0]?.message || 'Invalid email/roll number or password.')
                setLoading(false)
                setRedirecting(false)
            }
        } catch {
            toast.error('An error occurred during login. Please try again.')
            setLoading(false)
            setRedirecting(false)
        }
    }

    return (
        <section className="flex min-h-screen bg-background relative px-4 py-16 md:py-28 overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            <div className="relative z-10 bg-card glass-card m-auto h-fit w-full max-w-md overflow-hidden rounded-2xl border border-border shadow-xl">
                {/* Subtle top gradient accent */}
                <div
                    className={cn(
                        'h-1 w-full transition-colors',
                        maintenanceMode
                            ? 'bg-gradient-to-r from-amber-500 to-red-500'
                            : activeTab === 'admin'
                            ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-primary'
                            : 'bg-gradient-to-r from-primary to-accent'
                    )}
                />

                <div className="p-6 sm:p-8 pb-6">
                    <div className="text-center">
                        <Link href="/" aria-label="go home" className="mx-auto block w-fit">
                            <Logo />
                        </Link>
                        <h1 className="mb-1 mt-4 text-3xl font-semibold font-handjet tracking-wider text-gradient">
                            Coding Club CUH
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {activeTab === 'admin'
                                ? 'Sign in with club administrator credentials'
                                : 'Sign in to access your student dashboard & certificates'}
                        </p>
                    </div>

                    {/* Role Selection Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl border border-border mt-5 mb-5">
                        <button
                            type="button"
                            onClick={() => {
                                if (!loading) setActiveTab('student')
                            }}
                            className={cn(
                                'flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all',
                                activeTab === 'student'
                                    ? 'bg-background text-foreground shadow-sm border border-border/80'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <User size={14} className={activeTab === 'student' ? 'text-primary' : ''} />
                            <span>Student Sign In</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!loading) setActiveTab('admin')
                            }}
                            className={cn(
                                'flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all',
                                activeTab === 'admin'
                                    ? 'bg-background text-foreground shadow-sm border border-border/80'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <ShieldCheck size={14} className={activeTab === 'admin' ? 'text-indigo-400' : ''} />
                            <span>Admin Sign In</span>
                        </button>
                    </div>

                    {/* Maintenance Mode Warning Notice */}
                    {maintenanceMode && activeTab === 'student' && (
                        <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2.5">
                            <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
                            <div>
                                <div className="font-semibold text-amber-300">Maintenance Mode Active</div>
                                <div className="mt-0.5 text-zinc-300 leading-relaxed">
                                    {maintenanceMessage ||
                                        'Student access is temporarily disabled for maintenance. Club administrators may still log in.'}
                                </div>
                            </div>
                        </div>
                    )}

                    {maintenanceMode && activeTab === 'admin' && (
                        <div className="mb-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2">
                            <ShieldCheck size={16} className="shrink-0 text-blue-400 mt-0.5" />
                            <div>
                                <div className="font-semibold text-blue-200">Admin Bypass Enabled</div>
                                <div className="mt-0.5 text-zinc-300 text-[11px]">
                                    Site maintenance is active for students, but administrators may sign in normally.
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="identifier" className="text-foreground text-xs sm:text-sm font-medium">
                                {activeTab === 'admin' ? 'Admin Email or Username' : 'Email or University Roll Number'}
                            </Label>
                            <Input
                                id="identifier"
                                type="text"
                                placeholder={
                                    activeTab === 'admin'
                                        ? 'admin@cuh.ac.in or username'
                                        : 'student@example.com or 2109...'
                                }
                                required
                                disabled={loading}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="focus:ring-primary/50 focus:border-primary bg-background border-border text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-foreground text-xs sm:text-sm font-medium">
                                    Password
                                </Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-muted-foreground hover:text-primary text-xs font-medium underline-offset-4 hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="focus:ring-primary/50 focus:border-primary bg-background border-border text-foreground"
                            />
                        </div>

                        {/* Interactive Loading Button for Admin and Student */}
                        <Button
                            type="submit"
                            className={cn(
                                'w-full py-2.5 font-semibold text-sm text-white transition-all shadow-md border-0 flex items-center justify-center gap-2 mt-2',
                                activeTab === 'admin'
                                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-90'
                                    : 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                            )}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin shrink-0" />
                                    <span>
                                        {redirecting
                                            ? activeTab === 'admin'
                                                ? 'Opening Admin Dashboard...'
                                                : 'Opening Student Portal...'
                                            : activeTab === 'admin'
                                            ? 'Signing in as Admin...'
                                            : 'Signing in as Student...'}
                                    </span>
                                </>
                            ) : (
                                <>
                                    {activeTab === 'admin' ? (
                                        <ShieldCheck size={16} className="shrink-0" />
                                    ) : (
                                        <User size={16} className="shrink-0" />
                                    )}
                                    <span>
                                        {activeTab === 'admin' ? 'Sign in as Admin' : 'Sign in as Student'}
                                    </span>
                                    <ArrowRight size={14} className="shrink-0 opacity-70" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer Navigation */}
                <div className="p-4 bg-muted/50 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
                    {activeTab === 'student' ? (
                        <>
                            <span>Not an official club member yet?</span>
                            <Button asChild variant="link" className="p-0 h-auto text-primary font-semibold hover:text-accent transition-colors">
                                <Link href="/auth/signup" className="flex items-center gap-1">
                                    <span>Register Now</span>
                                    <Sparkles size={12} />
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <span>Need administrative access?</span>
                            <Button asChild variant="link" className="p-0 h-auto text-primary font-semibold hover:text-accent transition-colors">
                                <Link href="/contact">
                                    Contact Coordinator
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <section className="flex min-h-screen bg-background items-center justify-center p-4">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-xs text-muted-foreground animate-pulse">Loading sign in portal...</p>
                    </div>
                </section>
            }
        >
            <LoginForm />
        </Suspense>
    )
}
