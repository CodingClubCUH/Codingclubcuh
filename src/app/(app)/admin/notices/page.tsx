import React from "react";
import NoticeBroadcast from "@/components/payload-admin/NoticeBroadcast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Student Notice Broadcast - Coding Club CUH Admin",
  description: "Select student emails and broadcast announcements, updates, and workshop notices at once.",
};

export default function NoticesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto mb-6 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <Logo />
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </Link>
      </div>
      <div className="max-w-[1440px] mx-auto">
        <NoticeBroadcast />
      </div>
    </div>
  );
}
