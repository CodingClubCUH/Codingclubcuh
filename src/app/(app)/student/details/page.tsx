"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { AcademicDropdowns } from "@/components/student/AcademicDropdowns";

function StudentDetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewlyRegistered = searchParams.get("registered") === "true";
  const studentIdParam = searchParams.get("studentId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isEditingOther, setIsEditingOther] = useState(false);

  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    async function loadStudent() {
      try {
        const fetchUrl = studentIdParam
          ? `/api/student/details?studentId=${encodeURIComponent(studentIdParam)}`
          : "/api/student/details";
        const res = await fetch(fetchUrl);
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/auth/login?redirect=/student/details${studentIdParam ? `?studentId=${studentIdParam}` : ''}`);
            return;
          }
          if (res.status === 503) {
            router.push('/student');
            return;
          }
          throw new Error("Failed to load details");
        }
        const data = await res.json();
        if (data.student) {
          setName(data.student.name || "");
          setRollNo(data.student.username || "");
          setEmail(data.student.email || "");
          setCourse(data.student.course || "");
          setSemester(data.student.semester || "");
          setDepartment(data.student.department || "");
          setIsAdminUser(Boolean(data.isAdmin));
          setIsEditingOther(Boolean(data.isEditingOther));
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
        toast.error("Could not load student profile.");
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [router, studentIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.trim() || !semester.trim() || !department.trim()) {
      toast.error("Please fill in Course, Semester, and Department.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/student/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(studentIdParam ? { studentId: studentIdParam } : {}),
          name: name.trim(),
          course: course.trim(),
          semester: semester.trim(),
          department: department.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          data.message || (isEditingOther ? "Student details updated by admin!" : "Academic details saved! You are all set.")
        );
        if (isEditingOther) {
          router.push("/admin/collections/users");
        } else {
          router.push("/student");
        }
        router.refresh();
      } else {
        toast.error(data.error || "Failed to save details. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please check your network and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <section className="flex min-h-screen bg-background relative px-4 py-12 md:py-20 overflow-hidden">
      {/* Background gradient decorative glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="relative z-10 m-auto w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-start mb-4">
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-muted border border-border"
            >
              <ArrowLeft size={13} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <Link href="/" aria-label="Coding Club CUH" className="mx-auto block w-fit">
            <Logo />
          </Link>
          {isEditingOther ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mt-4 mb-2">
              <ShieldCheck size={14} />
              <span>Admin Mode: Editing Student Profile</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mt-4 mb-2">
              <Sparkles size={14} />
              <span>Step 2: Complete Your Academic Profile</span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold font-handjet tracking-wider text-foreground">
            {isEditingOther
              ? `Edit Details: ${name || "Student"}`
              : isNewlyRegistered
              ? "Welcome to Coding Club CUH!"
              : "Academic Profile Details"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-1">
            {isEditingOther
              ? `You are editing academic credentials for ${name || "this student"}. Saving will automatically update their profile and sync any existing issued certificates.`
              : "Please fill in your academic details below. These values will be printed directly on your event & course certificates and displayed on official verification pages."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card glass-card rounded-2xl border border-border shadow-2xl overflow-hidden"
        >
          {/* Subtle top accent gradient */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#137558] via-primary to-accent" />

          <div className="p-6 md:p-8 space-y-6">
            {/* Certificate Preview Callout */}
            <div className="rounded-xl bg-slate-900/40 border border-border p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
                <ShieldCheck size={16} />
                <span>Live Certificate Verification Preview</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-background/80 rounded-lg p-3 border border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase font-semibold">
                    Student Name
                  </span>
                  <span className="text-foreground font-bold text-sm">
                    {name || "Student Name"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase font-semibold">
                    Department
                  </span>
                  <span className="text-foreground font-semibold text-sm">
                    {department || "Computer Science and IT"}
                  </span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-border/40">
                  <span className="text-muted-foreground block text-[11px] uppercase font-semibold">
                    Course / Semester
                  </span>
                  <span className="text-foreground font-semibold text-sm">
                    {course || "MCA"}, {semester || "1st Semester"}
                  </span>
                </div>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="space-y-4">
              {/* Full Name & Roll Number row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-sm text-foreground flex items-center gap-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    id="fullname"
                    placeholder="e.g. Ajay Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus:ring-primary/50 focus:border-primary bg-background border-border text-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Name that appears on your certificate
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollno" className="text-sm text-foreground">
                    University Roll No
                  </Label>
                  <Input
                    type="text"
                    id="rollno"
                    disabled
                    value={rollNo}
                    className="bg-muted/50 border-border text-muted-foreground cursor-not-allowed font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Registered university roll number
                  </p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email" className="text-sm text-foreground">
                    Registered Email
                  </Label>
                  <Input
                    type="text"
                    id="email"
                    disabled
                    value={email}
                    className="bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Your official student account email
                  </p>
                </div>
              </div>

              {/* Academic Dropdowns: Department, Course, Semester */}
              <AcademicDropdowns
                department={department}
                setDepartment={setDepartment}
                course={course}
                setCourse={setCourse}
                semester={semester}
                setSemester={setSemester}
                disabled={saving}
                required
              />
            </div>

            {/* Information Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
              <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                You can update these details anytime from your Student Dashboard as you advance through semesters.
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full py-6 text-base font-bold bg-gradient-to-r from-[#137558] to-primary hover:opacity-90 text-white rounded-xl shadow-lg border-0 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving Academic Details...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{isEditingOther ? "Save Student Details (Admin)" : "Save Details & Go to Dashboard"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-muted/40 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            {isEditingOther ? (
              <>
                <Link
                  href="/admin/collections/users"
                  className="hover:text-foreground underline transition-colors"
                >
                  &larr; Back to Admin Users List
                </Link>
                <Link
                  href="/admin/certificate-hub"
                  className="hover:text-foreground underline transition-colors"
                >
                  Go to Certificate Hub &rarr;
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span>Coding Club CUH &bull; Student Portal</span>
                  {isAdminUser && (
                    <Link
                      href="/admin"
                      className="text-primary hover:underline font-semibold transition-colors"
                    >
                      Admin Portal
                    </Link>
                  )}
                </div>
                <Link
                  href="/student"
                  className="hover:text-foreground underline transition-colors"
                >
                  Skip to Dashboard for now &rarr;
                </Link>
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default function StudentDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <StudentDetailsForm />
    </Suspense>
  );
}
