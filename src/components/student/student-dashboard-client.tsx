"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  Award,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Filter,
  GraduationCap,
  Code2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Certificate } from "@/payload-types";

interface StudentDashboardClientProps {
  user: {
    id: string | number;
    name: string;
    email: string;
    username?: string | null;
    course?: string | null;
    semester?: string | null;
    department?: string | null;
  };
  certificates: Certificate[];
  enrollmentsCount: number;
  upcomingEventsCount?: number;
}

export function StudentDashboardClient({
  user,
  certificates,
  enrollmentsCount,
}: StudentDashboardClientProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const issuedCerts = certificates.filter((c) => c.isIssued);

  const filteredCerts = issuedCerts.filter((cert) => {
    if (filterType === "all") return true;
    const title = (cert.internship || "").toLowerCase();
    if (filterType === "workshop")
      return (
        title.includes("workshop") ||
        title.includes("class") ||
        title.includes("masterclass")
      );
    if (filterType === "hackathon")
      return title.includes("hackathon") || title.includes("sprint");
    if (filterType === "bootcamp")
      return title.includes("bootcamp") || title.includes("training");
    return true;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAskAI = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("cccuh:open_chat", {
        detail: { prompt },
      })
    );
  };

  // Gamification badges calculation
  const hasCertificate = issuedCerts.length > 0;
  const isEnrolled = enrollmentsCount > 0;

  return (
    <div className="space-y-6">
      {/* AI Assistant Quick Help Strip with Aceternity glow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-foreground text-sm">
                CUH AI Student Copilot
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ask questions about upcoming hackathons, campus courses, or coding
              help.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() =>
              handleAskAI(
                `Suggest a study plan for ${user.course || "CSE"} Semester ${user.semester || "1"}`
              )
            }
            className="text-xs px-3 py-1.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles size={12} className="text-primary" />
            <span>Study Plan</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() =>
              handleAskAI(
                "What upcoming workshops and hackathons should I prepare for?"
              )
            }
            className="text-xs px-3 py-1.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Code2 size={12} className="text-violet-400" />
            <span>Next Event Prep</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() =>
              handleAskAI(
                "Explain the Certificate Verification process for Coding Club CUH"
              )
            }
            className="text-xs px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary/20"
          >
            <span>Ask AI</span>
            <ArrowRight size={12} />
          </motion.button>
        </div>
      </motion.div>

      {/* Gamification / Membership Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="rounded-3xl border border-border/80 dark:border-white/10 bg-card/80 p-5 backdrop-blur-xl shadow-sm"
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-primary" />
            <span className="font-bold text-sm text-foreground">
              Club Advancement Milestones
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {hasCertificate
              ? "Tier: Certified Developer"
              : isEnrolled
                ? "Tier: Active Learner"
                : "Tier: Registered Member"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3 transition-colors hover:border-emerald-500/50"
          >
            <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Member Onboarded</p>
              <p className="text-[10px] text-muted-foreground">CUH Portal Active</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
              isEnrolled
                ? "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50"
                : "border-border/60 bg-muted/20 opacity-60"
            }`}
          >
            <div
              className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                isEnrolled
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BookOpen size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Course Participant</p>
              <p className="text-[10px] text-muted-foreground">
                {isEnrolled ? `${enrollmentsCount} Enrolled` : "Enroll in 1 Bootcamp"}
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
              hasCertificate
                ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                : "border-border/60 bg-muted/20 opacity-60"
            }`}
          >
            <div
              className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                hasCertificate
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Award size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Certified Builder</p>
              <p className="text-[10px] text-muted-foreground">
                {hasCertificate
                  ? `${issuedCerts.length} Verified Credentials`
                  : "Earn 1 Certificate"}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Certificate Filters with Aceternity sliding pill */}
      {issuedCerts.length > 0 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-semibold">
              Filter Credentials:
            </span>
          </div>
          <div className="flex items-center gap-1 bg-muted/70 dark:bg-zinc-900 p-1 rounded-xl border border-border/50">
            {(["all", "workshop", "hackathon", "bootcamp"] as const).map(
              (tab) => {
                const isActive = filterType === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className="relative px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="studentFilterPill"
                        className="absolute inset-0 bg-card text-foreground rounded-lg shadow-sm border border-border/60 -z-0"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.35,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${isActive ? "text-foreground font-bold" : ""}`}
                    >
                      {tab}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Render Filtered Certificates with Staggered Framer Motion Reveal */}
      <AnimatePresence mode="popLayout">
        {filteredCerts.length > 0 ? (
          <div className="grid gap-3">
            {filteredCerts.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -3, scale: 1.006 }}
                className="group rounded-2xl border border-border/80 dark:border-white/10 bg-card hover:border-primary/40 hover:shadow-lg dark:hover:shadow-primary/5 transition-all p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      <CheckCircle2 size={10} /> Verified Credential
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(cert.certificateId, "Certificate ID")
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground bg-muted px-2 py-0.5 rounded-md transition-colors cursor-pointer hover:bg-muted/80"
                      title="Click to copy ID"
                    >
                      {copiedId === cert.certificateId ? (
                        <Check size={10} className="text-emerald-400" />
                      ) : (
                        <Copy size={10} />
                      )}
                      <span>{cert.certificateId}</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                    {cert.internship}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground font-mono">
                    {cert.issueDate && (
                      <span>
                        Issued:{" "}
                        {new Date(cert.issueDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 sm:flex-initial"
                  >
                    <Link
                      href={`/certificate/${cert.certificateId}`}
                      className="block text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 text-center"
                    >
                      View & Download
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 sm:flex-initial"
                  >
                    <Link
                      href={`/verify/${cert.certificateId}`}
                      className="block text-xs font-medium border border-border hover:border-primary text-foreground px-3.5 py-2.5 rounded-xl hover:bg-primary/5 transition-all text-center"
                    >
                      Verify
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : issuedCerts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-2xl"
          >
            No certificates matching filter &quot;{filterType}&quot;.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
