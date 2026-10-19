"use client"

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
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
            .catch(() => {})
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Determine if they are logging in with email or roll number
        const isEmail = identifier.includes('@')
        const loginData = isEmail 
            ? { email: identifier, password }
            : { username: identifier, password }

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
                    // Destroy cookie
                    await fetch('/api/users/logout', { method: 'POST' }).catch(() => {})
                    toast.error(
                        maintenanceMessage || 'Student portal is currently under maintenance. Only administrators can log in.'
                    )
                    setLoading(false)
                    return
                }

                toast.success('Login successful!')
                if (isAdmin) {
                    router.push('/admin')
                } else {
                    router.push('/student')
                }
                router.refresh() // Force refresh layout to pick up cookie
            } else {
                toast.error(data.errors?.[0]?.message || 'Invalid email or password.')
            }
        } catch {
            toast.error('An error occurred during login. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen bg-background relative px-4 py-16 md:py-32 overflow-hidden">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative z-10 bg-card glass-card m-auto h-fit w-full max-w-md overflow-hidden rounded-2xl border border-border shadow-xl">
                {/* Subtle top gradient accent */}
                <div className={`h-1 w-full ${maintenanceMode ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-primary to-accent'}`} />
                
                <div className="p-8 pb-6">
                    <div className="text-center">
                        <Link href="/" aria-label="go home" className="mx-auto block w-fit">
                            <Logo />
                        </Link>
                        <h1 className="mb-1 mt-4 text-3xl font-semibold font-handjet tracking-wider text-gradient">Coding Club CUH</h1>
                        <p className="text-sm text-muted-foreground">Sign in to your member account</p>
                    </div>

                    {/* Maintenance Mode Warning Notice */}
                    {maintenanceMode && (
                        <div className="mt-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2.5">
                            <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
                            <div>
                                <div className="font-semibold text-amber-300">Maintenance Mode Active</div>
                                <div className="mt-0.5 text-zinc-300">
                                    {maintenanceMessage || 'Student access is temporarily disabled for maintenance. Club administrators may still log in.'}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="identifier" className="text-foreground">University Email or Roll Number</Label>
                            <Input 
                                id="identifier" 
                                type="text" 
                                placeholder="student@example.com or 2109..." 
                                required 
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="focus:ring-primary/50 focus:border-primary bg-background border-border text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-foreground">Password</Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-muted-foreground hover:text-primary text-sm font-medium underline-offset-4 hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="focus:ring-primary/50 focus:border-primary bg-background border-border text-foreground"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity border-0" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>

                        <div className="flex justify-center pt-2">
                            <Button type="button" variant="outline" asChild className="w-full border-border text-foreground hover:bg-muted transition-colors">
                                <Link href="/admin">
                                    <ShieldCheck size={16} className="mr-1.5" />
                                    Admin Portal Login
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-muted/50 border-t border-border">
                    <p className="text-muted-foreground text-center text-sm">
                        Not a member yet?
                        <Button asChild variant="link" className="px-2 text-primary hover:text-accent transition-colors">
                            <Link href="/auth/signup">Register</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}
