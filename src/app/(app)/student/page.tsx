import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  User,
  ShieldCheck,
  Edit3,
  AlertCircle,
  Calendar,
  MapPin,
  ExternalLink,
  BookOpen,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'
import type { Certificate } from '@/payload-types'
import { getEffectiveEventStatus, sortEvents } from '@/payload/utilities/eventStatus'
import { StudentDashboardClient } from '@/components/student/student-dashboard-client'

export default async function StudentDashboard() {
  const payload = await getPayload({ config: configPromise })

  const headersList = await headers()
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    redirect('/auth/login')
  }

  let user = null
  try {
    // 1. Authenticate in-process via Payload using request headers (cookie payload-token)
    const authResult = await payload.auth({ headers: headersList })
    user = authResult?.user

    // 2. If cookie from headersList didn't resolve, verify using explicit JWT Authorization header
    if (!user && token) {
      const customHeaders = new Headers(headersList)
      customHeaders.set('Authorization', `JWT ${token}`)
      const tokenAuth = await payload.auth({ headers: customHeaders })
      user = tokenAuth?.user
    }
  } catch (error) {
    console.error('Failed to authenticate student session via payload.auth', error)
  }

  // 3. Robust fallback to local API route if in-process auth didn't return user
  if (!user && token) {
    try {
      const serverUrl =
        process.env.NEXT_PUBLIC_SERVER_URL ||
        process.env.URL ||
        'http://localhost:3001'
      const meReq = await fetch(`${serverUrl}/api/users/me`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
        cache: 'no-store',
      }).catch(() => null)

      if (meReq?.ok) {
        const meData = await meReq.json()
        user = meData?.user
      }
    } catch (err) {
      console.error('Failed fallback fetch user session', err)
    }
  }

  if (!user) {
    redirect('/auth/login')
  }

  // Check Site Maintenance Settings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const siteSettings: any = await (payload as any)
    .findGlobal({
      slug: 'site-settings',
    })
    .catch(() => null)

  const isMaintenanceActive = Boolean(siteSettings?.maintenanceMode)
  const isAdmin = user.role === 'admin'

  if (isMaintenanceActive && !isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/15 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold font-handjet tracking-wider text-amber-400 mb-2">
            Portal Under Maintenance
          </h1>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {siteSettings?.maintenanceMessage ||
              'The student dashboard is currently offline for scheduled maintenance. Please check back later!'}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-semibold transition-colors"
            >
              Back to Home Page
            </Link>
            <div className="flex justify-center pt-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if academic profile details are missing
  const isDetailsMissing = !user.course || !user.semester || !user.department

  // Fetch certificates linked to this user account
  const userCerts = await payload.find({
    collection: 'certificates',
    where: {
      student: {
        equals: user.id,
      },
    },
  })

  // Fetch enrollments linked to this user account
  const userEnrollments = await payload.find({
    collection: 'enrollments',
    where: {
      student: {
        equals: user.id,
      },
    },
    depth: 2,
    sort: '-enrolledAt',
  })

  // Fetch events from CMS
  const eventsRes = await payload
    .find({
      collection: 'events',
      limit: 20,
      sort: '-date',
    })
    .catch(() => null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawEvents: any[] = eventsRes?.docs || []
  const sortedEvents = sortEvents(rawEvents)

  const issuedCertsCount = userCerts.docs.filter((c) => c.isIssued).length
  const activeEnrollmentsCount = userEnrollments.docs?.length || 0
  const upcomingEventsCount = sortedEvents.filter(
    (e) => getEffectiveEventStatus(e) === 'upcoming'
  ).length

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8 selection:bg-primary selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 border border-border/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative size-16 sm:size-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold font-handjet shadow-lg shadow-indigo-500/20 border border-white/20">
                {String(user.name)?.charAt(0)?.toUpperCase() || 'U'}
                <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary border border-primary/20">
                    CUH Student Portal
                  </span>
                  {user.course && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                      {user.course}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-handjet">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span>{user.email}</span>
                  {user.username && (
                    <>
                      <span>&bull;</span>
                      <span className="font-mono text-xs text-foreground/80">
                        Roll: {user.username}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/student/details"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </Link>
              <div className="shrink-0">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner if Profile is Missing Details */}
        {isDetailsMissing && (
          <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">
                  Action Required: Complete Academic Profile
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-2xl">
                  Please specify your Course, Semester, and Department so they appear accurately on your official certificates and credential verification records.
                </p>
              </div>
            </div>
            <Link
              href="/student/details"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/20 shrink-0 flex items-center gap-1.5"
            >
              <span>Fill Details Now</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Quick Bento Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl p-5 bg-card/80 backdrop-blur-md border border-border shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <Award className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold font-handjet text-foreground tracking-wide">
                {issuedCertsCount}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Issued Certificates</p>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-card/80 backdrop-blur-md border border-border shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold font-handjet text-foreground tracking-wide">
                {activeEnrollmentsCount}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Enrolled Courses</p>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-card/80 backdrop-blur-md border border-border shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center shrink-0">
              <Calendar className="size-6" />
            </div>
            <div>
              <p className="text-2xl font-bold font-handjet text-foreground tracking-wide">
                {upcomingEventsCount}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Upcoming Events</p>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-card/80 backdrop-blur-md border border-border shadow-sm flex items-center gap-4">
            <div className="size-12 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-base font-bold font-handjet text-foreground truncate max-w-[120px]">
                {user.department || 'CUH CS & IT'}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {user.semester ? `Semester ${user.semester}` : 'Academic Profile'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid: Profile Column + Certificates Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Academic Profile & Verify Center) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Student Profile Card */}
            <div className="rounded-3xl bg-card/90 backdrop-blur-xl border border-border p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-border/60">
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  Academic Profile
                </h3>
                <Link
                  href="/student/details"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </Link>
              </div>

              <div className="space-y-3.5 text-xs text-muted-foreground">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="font-medium text-foreground">Full Name:</span>
                  <span className="font-semibold text-foreground">{user.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="font-medium text-foreground">Roll No:</span>
                  <span className="font-mono text-foreground">{user.username || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="font-medium text-foreground">Course:</span>
                  <span className="font-semibold text-foreground">
                    {user.course || <span className="text-amber-500 italic">Not set</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="font-medium text-foreground">Semester:</span>
                  <span className="font-semibold text-foreground">
                    {user.semester ? `Sem ${user.semester}` : <span className="text-amber-500 italic">Not set</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="font-medium text-foreground">Department:</span>
                  <span className="font-semibold text-foreground truncate max-w-[150px] text-right">
                    {user.department || <span className="text-amber-500 italic">Not set</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium text-foreground">Member Status:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    <CheckCircle2 size={10} /> Verified Member
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Verification Center Card */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-900/30 via-primary/20 to-blue-900/30 border border-primary/30 p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <ShieldCheck size={120} />
              </div>
              <div className="relative z-10 space-y-3">
                <div className="size-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-lg font-bold text-foreground">Verify Center</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cryptographically verify any official certificate issued by Coding Club CUH using its unique ID or QR code.
                </p>
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-md shadow-primary/20"
                >
                  <span>Go to Public Verifier</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (Certificates Showcase) */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl bg-card/90 backdrop-blur-xl border border-border p-6 sm:p-8 shadow-sm h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Your Certificates & Activity</h3>
                    <p className="text-xs text-muted-foreground">
                      Official credentials, interactive actions, and club milestones
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  {issuedCertsCount} Issued
                </span>
              </div>

              {issuedCertsCount > 0 ? (
                <StudentDashboardClient
                  user={{
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    course: user.course,
                    semester: user.semester,
                    department: user.department,
                  }}
                  certificates={userCerts.docs as Certificate[]}
                  enrollmentsCount={activeEnrollmentsCount}
                  upcomingEventsCount={upcomingEventsCount}
                />
              ) : (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <StudentDashboardClient
                    user={{
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      username: user.username,
                      course: user.course,
                      semester: user.semester,
                      department: user.department,
                    }}
                    certificates={[]}
                    enrollmentsCount={activeEnrollmentsCount}
                    upcomingEventsCount={upcomingEventsCount}
                  />

                  <div className="p-8 text-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/20">
                    <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-3">
                      <Award size={28} />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">
                      No certificates issued yet
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-4 leading-relaxed">
                      Enroll in hands-on bootcamps or participate in campus hackathons to earn your verified credentials!
                    </p>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                      <span>Browse Active Courses</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bento: Courses & Events Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Enrolled Courses */}
          <div className="rounded-3xl bg-card/90 backdrop-blur-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <h3 className="font-bold text-foreground text-base">Enrolled Courses</h3>
              </div>
              <Link
                href="/courses"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Browse All</span>
                <ArrowRight size={11} />
              </Link>
            </div>

            {userEnrollments.docs && userEnrollments.docs.length > 0 ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {userEnrollments.docs.map((enrollment: any) => {
                  const courseObj =
                    typeof enrollment.course === 'object' ? enrollment.course : null
                  const certObj =
                    typeof enrollment.certificate === 'object' ? enrollment.certificate : null
                  const certId = certObj?.certificateId

                  return (
                    <div
                      key={enrollment.id}
                      className="rounded-2xl border border-border/70 p-4 bg-muted/30 hover:bg-muted/60 transition-all flex justify-between items-start gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate">
                          {courseObj?.title || 'Coding Bootcamp'}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Instructor: {courseObj?.instructorName || 'Coding Club Mentor'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 capitalize">
                            {enrollment.status === 'completed'
                              ? 'Cohort Completed'
                              : enrollment.status === 'active'
                              ? 'In Progress'
                              : 'Enrolled'}
                          </span>
                          {enrollment.selectedForCertificate && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                              Selected for Certificate
                            </span>
                          )}
                        </div>
                      </div>

                      {certId ? (
                        <Link
                          href={`/certificate/${certId}`}
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap shadow-xs"
                        >
                          Certificate
                        </Link>
                      ) : (
                        <Link
                          href={`/courses/${courseObj?.slug || courseObj?.id}`}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
                        >
                          Details
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-44 text-center rounded-2xl border-2 border-dashed border-border/60 p-4">
                <p className="font-medium text-foreground text-sm">No active enrollments</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Join upcoming peer-led bootcamps and classes!
                </p>
                <Link
                  href="/courses"
                  className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Explore Courses
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="rounded-3xl bg-card/90 backdrop-blur-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <h3 className="font-bold text-foreground text-base">Upcoming Events</h3>
              </div>
              <Link
                href="/events"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Browse All</span>
                <ArrowRight size={11} />
              </Link>
            </div>

            {sortedEvents.length > 0 ? (
              <div className="space-y-3">
                {sortedEvents.slice(0, 4).map((event) => {
                  const effectiveStatus = getEffectiveEventStatus(event)
                  const dateStr = new Date(event.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })

                  return (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-border/70 p-4 bg-muted/30 hover:bg-muted/60 transition-all flex justify-between items-start gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-sm truncate">
                          {event.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                            <Clock size={11} className="text-primary" />
                            {dateStr}
                          </span>
                          {event.location && (
                            <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                              <MapPin size={11} className="text-muted-foreground" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              effectiveStatus === 'upcoming'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : effectiveStatus === 'ongoing'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {effectiveStatus}
                          </span>
                          {effectiveStatus !== 'completed' && event.isRegistrationOpen !== false && (
                            <span className="text-[10px] font-medium text-emerald-400">
                              Registration Open
                            </span>
                          )}
                        </div>
                      </div>

                      {effectiveStatus !== 'completed' &&
                      event.isRegistrationOpen !== false &&
                      event.registrationLink ? (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Register</span>
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <Link
                          href="/events"
                          className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
                        >
                          Details
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-44 text-center rounded-2xl border-2 border-dashed border-border/60 p-4">
                <p className="font-medium text-foreground text-sm">No upcoming events right now</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Stay tuned for coding contests and hackathons!
                </p>
                <Link
                  href="/events"
                  className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Explore Events Timeline
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
