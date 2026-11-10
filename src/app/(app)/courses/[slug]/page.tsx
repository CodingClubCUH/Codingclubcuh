import React from "react";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import Link from "next/link";
import { getAuthUser } from "@/payload/utilities/getAuthUser";
import { Calendar, User, BookOpen, Award, ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { EnrollButton } from "./enroll-button";
import type { Course } from "@/payload-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  // 1. Fetch course by slug or id
  let course: Course | null = null;
  try {
    const courseQuery = await payload.find({
      collection: "courses",
      where: {
        or: [
          { slug: { equals: slug } },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(!isNaN(Number(slug)) ? [{ id: { equals: Number(slug) as any } }] : []),
        ],
      },
      limit: 1,
    });
    course = courseQuery.docs?.[0] || null;
  } catch (err) {
    console.error("Error fetching course detail:", err);
  }

  if (!course) {
    notFound();
  }

  // 2. Check if current user is logged in and already enrolled
  let isAlreadyEnrolled = false;
  const { user } = await getAuthUser(payload);

  if (user) {
    try {
      const enrollmentCheck = await payload.find({
        collection: "enrollments",
        where: {
          and: [
            { student: { equals: user.id } },
            { course: { equals: course.id } },
          ],
        },
        limit: 1,
      });
      isAlreadyEnrolled = (enrollmentCheck.docs?.length || 0) > 0;
    } catch {
      // Ignore check errors
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isFree = !course.price || course.price === 0;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to All Courses</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Content Area (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {course.status === "completed"
                    ? "Cohort Concluded"
                    : course.status === "active"
                    ? "In Progress"
                    : "Registration Open"}
                </span>
                {course.department && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {course.department}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6">
                {course.title}
              </h1>

              {/* Course Meta Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-zinc-800/80 text-sm text-zinc-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Instructor</p>
                    <p className="font-semibold text-white">{course.instructorName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Starts On</p>
                    <p className="font-semibold text-white">{formatDate(course.startingDate)}</p>
                  </div>
                </div>
              </div>

              {/* Description & Syllabus */}
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-400" />
                  Course Overview & Syllabus
                </h3>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/60">
                  {course.description ||
                    "This comprehensive hands-on course is designed and mentored by the Coding Club CUH to equip students with practical industry skills, live project execution, and algorithmic problem-solving."}
                </div>
              </div>

              {/* What You Will Earn */}
              <div className="mt-8 bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/40 p-6 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Award size={26} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Official Certificate of Completion</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Selected candidates will be awarded a cryptographically verifiable certificate from Coding Club CUH.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold flex-shrink-0">
                  <ShieldCheck size={16} />
                  <span>Verifiable Credentials</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Sidebar (1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl sticky top-28">
              <div className="mb-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tuition / Fee</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {isFree ? "Free" : `₹${course.price}`}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    CUH Student Access
                  </span>
                </div>
              </div>

              {/* Interactive Enrollment Action */}
              <EnrollButton
                courseId={course.id}
                courseTitle={course.title}
                isEnrollmentOpen={course.isEnrollmentOpen !== false}
                isCompleted={course.status === "completed"}
                isAlreadyEnrolled={isAlreadyEnrolled}
              />

              {/* Details List */}
              <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-3.5 text-xs text-zinc-400">
                <div className="flex items-center justify-between">
                  <span>Certificate Delivery</span>
                  <strong className="text-zinc-200">Official Email + PDF</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Issuing Organization</span>
                  <strong className="text-zinc-200">Coding Club CUH</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Host Institution</span>
                  <strong className="text-zinc-200">Central University of Haryana</strong>
                </div>
                {course.completionDate && (
                  <div className="flex items-center justify-between">
                    <span>Expected Completion</span>
                    <strong className="text-zinc-200">{formatDate(course.completionDate)}</strong>
                  </div>
                )}
              </div>

              {/* Support info */}
              <div className="mt-6 pt-4 border-t border-zinc-900 text-center">
                <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                  <Mail size={12} />
                  <span>Queries: <a href="mailto:cuhcodingclub@gmail.com" className="text-blue-400 hover:underline">cuhcodingclub@gmail.com</a></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
