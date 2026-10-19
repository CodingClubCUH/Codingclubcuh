"use client"

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [devUrl, setDevUrl] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setSubmitted(true)
                if (data.devResetUrl) {
                    setDevUrl(data.devResetUrl)
                }
                toast.success('Password reset instructions initiated!')
            } else {
                toast.error(data.error || 'Failed to process request. Please try again.')
            }
        } catch {
            toast.error('An error occurred. Please check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen bg-background relative px-4 py-16 md:py-32 overflow-hidden">
            {/* Background gradient light */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            <div className="relative z-10 bg-card glass-card m-auto h-fit w-full max-w-md overflow-hidden rounded-2xl border border-border shadow-xl">
                {/* Top gradient accent */}
                <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />

                <div className="p-8 pb-6">
                    <div className="text-center">
                        <Link href="/" aria-label="go home" className="mx-auto block w-fit">
                            <Logo />
                        </Link>
                        <h1 className="mb-1 mt-4 text-3xl font-semibold font-handjet tracking-wider text-gradient">
                            Reset Password
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials to receive a password reset link
                        </p>
                    </div>

                    {submitted ? (
                        <div className="mt-8 text-center space-y-4">
                            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">Check Your Email</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    If an account matches <strong className="text-foreground">{identifier}</strong>, we have sent a secure password reset link to your registered email.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Be sure to check your spam or junk folder if you don&apos;t see it within a few minutes.
                                </p>
                            </div>

                            {devUrl && (
                                <div className="mt-4 p-3 rounded-lg bg-muted text-left border border-border text-xs">
                                    <p className="font-semibold text-primary mb-1">Local Testing Link:</p>
                                    <Link href={devUrl} className="underline text-blue-500 break-all">
                                        Click here to reset password directly
                                    </Link>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/auth/login" className="flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Return to Sign In
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="identifier" className="text-foreground">
                                    Email or Roll Number
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="identifier"
                                        type="text"
                                        placeholder="student@example.com or 2109..."
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="focus:ring-primary/50 focus:border-primary bg-background border-border text-foreground pl-10"
                                    />
                                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    We will send a password reset link to your registered email address.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 glow-hover transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending Link...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>

                            <div className="pt-2 text-center">
                                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <Link href="/auth/login" className="flex items-center gap-1.5">
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        Back to Sign In
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-4 bg-muted/40 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        Need help?{' '}
                        <Link href="/contact" className="text-primary hover:underline">
                            Contact Club Coordinators
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
