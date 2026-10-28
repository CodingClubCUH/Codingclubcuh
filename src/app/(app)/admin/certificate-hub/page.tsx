import React, { Suspense } from "react";
import CertificateHub from "@/components/payload-admin/CertificateHub";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Course Certificate Hub - Coding Club CUH",
  description: "Browse batches by month & year, manage students, and issue official certificates.",
};

export default function CertificateHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </Link>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading Certificate Hub...</div>}>
        <CertificateHub />
      </Suspense>
    </div>
  );
}
