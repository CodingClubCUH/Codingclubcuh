"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Calendar,
  User,
  Award,
  Building,
  Maximize2,
  X,
} from "lucide-react";
import Link from "next/link";

interface HardCopyMedia {
  id?: string | number;
  url?: string;
  filename?: string;
  mimeType?: string;
  filesize?: number;
}

interface CertificateData {
  certificateId: string;
  studentName: string;
  department: string;
  course: string;
  semester: string;
  internship: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  isIssued: boolean;
  certificateType?: "digital" | "hard_copy";
  hardCopyUrl?: string | null;
  hardCopyFile?: HardCopyMedia | string | number | null;
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = params.certificateId as string;

  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    async function verifyCertificate() {
      try {
        const res = await fetch(
          `/api/certificates?where[certificateId][equals]=${encodeURIComponent(certificateId)}&depth=1`
        );
        const data = await res.json();

        if (data.docs && data.docs.length > 0) {
          const cert = data.docs[0];
          // Only verified if isIssued is true
          if (cert.isIssued) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const studentObj: any = typeof cert.student === "object" ? cert.student : null;
            const finalCourse =
              cert.course && cert.course !== "Other"
                ? cert.course
                : studentObj?.course || cert.course || "";
            const finalSemester =
              cert.semester && cert.semester !== "Completed"
                ? cert.semester
                : studentObj?.semester || cert.semester || "";
            const finalDept =
              cert.department || studentObj?.department || "Computer Sciences & Information Technology";
            const finalStudentName = cert.studentName || studentObj?.name || "Student";

            const hardCopyMedia =
              typeof cert.hardCopyFile === "object" ? (cert.hardCopyFile as HardCopyMedia) : null;
            const resolvedHardCopyUrl = cert.hardCopyUrl || hardCopyMedia?.url || null;
            const certType = cert.certificateType || (resolvedHardCopyUrl ? "hard_copy" : "digital");

            setCertData({
              ...cert,
              studentName: finalStudentName,
              department: finalDept,
              course: finalCourse,
              semester: finalSemester,
              certificateType: certType,
              hardCopyUrl: resolvedHardCopyUrl,
              hardCopyFile: hardCopyMedia || cert.hardCopyFile,
            });
          }
        }
      } catch (e) {
        console.error("Error verifying certificate", e);
      } finally {
        setLoading(false);
      }
    }

    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  function formatDate(dateInput: string) {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Detect file type for hard-copy certificates
  const hardCopyMedia =
    typeof certData?.hardCopyFile === "object" ? (certData?.hardCopyFile as HardCopyMedia) : null;
  const hardCopyUrl = certData?.hardCopyUrl || hardCopyMedia?.url || null;
  const mimeType = (hardCopyMedia?.mimeType || "").toLowerCase();
  const isPdf = Boolean(
    mimeType.includes("pdf") ||
      hardCopyUrl?.toLowerCase().endsWith(".pdf") ||
      hardCopyUrl?.includes("/pdf/") ||
      hardCopyUrl?.includes(".pdf?")
  );
  const isHardCopy = certData?.certificateType === "hard_copy" || Boolean(hardCopyUrl);

  // Deliverable image URL for crisp preview without Cloudinary 401 ACL/delivery restrictions on .pdf
  const previewImageUrl = hardCopyUrl
    ? hardCopyUrl.includes("res.cloudinary.com") && isPdf
      ? hardCopyUrl.replace(/\.pdf($|\?)/i, ".jpg$1")
      : hardCopyUrl
    : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">CODING CLUB CUH</h1>
          <p className="text-sm text-slate-500 font-medium">Certificate Verification System</p>
        </div>
        <Link
          href="/verify"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors"
        >
          Verify Another
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-3xl">
          <button
            onClick={() => router.push("/verify")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Search
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Certificate Header Banner */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#1a365d]" size={30} />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                  Certificate Verification
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
                <p className="text-slate-600 font-mono bg-slate-100 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-slate-200">
                  ID: {certificateId}
                </p>
                {certData && (
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                      isHardCopy
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    {isHardCopy ? <FileText size={13} /> : <Award size={13} />}
                    {isHardCopy ? "Hard-Copy Document" : "Digitally Generated"}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-slate-50/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1a365d] rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 font-medium animate-pulse">Verifying certificate credentials...</p>
                </div>
              ) : certData ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                  {/* Verified Badge */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col items-center text-center shadow-xs">
                    <CheckCircle className="text-emerald-500 mb-2" size={46} />
                    <h3 className="text-xl font-bold text-emerald-800">Certificate Verified</h3>
                    <p className="text-emerald-700 text-sm mt-1 max-w-md">
                      {isHardCopy
                        ? "This physical hard-copy certificate has been authenticated and officially archived by Coding Club CUH."
                        : "This digital certificate is genuine and has been verified against the official records of Coding Club CUH."}
                    </p>
                  </div>

                  {/* Certificate Information Grid */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Award size={14} className="text-[#1a365d]" /> Official Credential Details
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Coding Club CUH</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                      <div className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <User size={13} /> Student Name
                        </p>
                        <p className="text-slate-800 font-bold text-lg">{certData.studentName}</p>
                      </div>

                      <div className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Award size={13} /> Event / Programme
                        </p>
                        <p className="text-slate-800 font-bold text-lg text-[#1a365d]">{certData.internship}</p>
                      </div>

                      <div className="p-4 sm:p-5 hover:bg-slate-50 transition-colors border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Building size={13} /> Department
                        </p>
                        <p className="text-slate-800 font-medium">{certData.department || "Computer Science & IT"}</p>
                      </div>

                      <div className="p-4 sm:p-5 hover:bg-slate-50 transition-colors border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Calendar size={13} /> Date of Issue
                        </p>
                        <p className="text-slate-800 font-semibold">{formatDate(certData.issueDate)}</p>
                        {certData.startDate && certData.endDate && certData.startDate !== certData.issueDate && (
                          <p className="text-xs text-slate-500 mt-1">
                            Duration: {formatDate(certData.startDate)} - {formatDate(certData.endDate)}
                          </p>
                        )}
                      </div>

                      {(certData.course || certData.semester) && (
                        <div className="p-4 sm:p-5 hover:bg-slate-50 transition-colors border-t border-slate-100 sm:col-span-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Course & Academic Term
                          </p>
                          <p className="text-slate-800 font-medium">
                            {[certData.course, certData.semester].filter(Boolean).join(" • ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────── */}
                  {/* HARD-COPY DOCUMENT EMBEDDED PREVIEW & ACTIONS               */}
                  {/* ─────────────────────────────────────────────────────────── */}
                  {isHardCopy && (hardCopyUrl || previewImageUrl) && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 sm:p-5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isPdf ? (
                            <FileText className="text-rose-600" size={20} />
                          ) : (
                            <ImageIcon className="text-[#137558]" size={20} />
                          )}
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">
                              Original Hard-Copy Certificate
                            </h4>
                            <p className="text-xs text-slate-500">
                              {isPdf ? "Official Archived PDF Document" : "Scanned High-Resolution Certificate"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setLightboxOpen(true)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Maximize2 size={13} />
                            Enlarge
                          </button>
                          <a
                            href={previewImageUrl || hardCopyUrl || "#"}
                            download={`Certificate_${certData.studentName.replace(/[^a-zA-Z0-9]/g, "_")}_${certData.certificateId}.${isPdf ? "pdf" : "jpg"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#1a365d] text-white px-3 py-1.5 rounded-lg hover:bg-[#112340] transition-colors shadow-2xs"
                          >
                            <Download size={13} />
                            Download
                          </a>
                          {hardCopyUrl && (
                            <a
                              href={hardCopyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              <ExternalLink size={13} />
                              Open Original
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Document Viewer Container */}
                      <div className="p-4 sm:p-6 bg-slate-100/40 flex flex-col items-center justify-center">
                        <div className="relative group max-w-full">
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewImageUrl || hardCopyUrl || ""}
                              alt={`Official Certificate for ${certData.studentName}`}
                              className="w-full max-h-[580px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                            />
                            <button
                              onClick={() => setLightboxOpen(true)}
                              className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md backdrop-blur-xs cursor-pointer"
                              title="Expand image"
                            >
                              <Maximize2 size={14} /> Enlarge
                            </button>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 px-1">
                            <span>
                              {isPdf
                                ? "Official PDF Certificate archived in Cloudinary storage."
                                : "Scanned hard-copy certificate archived in Cloudinary storage."}
                            </span>
                            <span className="font-medium text-emerald-700">✓ Authenticated Record</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      href={`/certificate/${encodeURIComponent(certificateId)}`}
                      className="w-full flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#137558] text-white font-bold rounded-xl hover:bg-[#0e5641] transition-colors shadow-md text-sm"
                    >
                      🎓 View in Official Certificate Portal
                    </Link>
                    <button
                      onClick={() => router.push("/verify")}
                      className="w-full sm:w-auto px-6 py-3.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm cursor-pointer"
                    >
                      Verify Another
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-8 flex flex-col items-center">
                    <XCircle className="text-red-500 mb-4" size={56} />
                    <h3 className="text-2xl font-bold text-red-800 mb-2">Certificate Not Found</h3>
                    <p className="text-red-600 max-w-sm">
                      The certificate ID <span className="font-mono font-bold">{certificateId}</span> is invalid or has not been verified in our official system. Please verify the ID and try again.
                    </p>
                    <button
                      onClick={() => router.push("/verify")}
                      className="mt-6 px-6 py-2.5 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-colors text-sm cursor-pointer"
                    >
                      Try Another Certificate ID
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal for Hard-Copy Document */}
      {lightboxOpen && (previewImageUrl || hardCopyUrl) && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2 flex items-center gap-1 font-semibold text-sm cursor-pointer"
            >
              <X size={20} /> Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageUrl || hardCopyUrl || ""}
              alt="Full-size Certificate Document"
              className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
