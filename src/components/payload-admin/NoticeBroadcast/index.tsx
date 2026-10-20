"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Send,
  Users,
  Search,
  CheckSquare,
  Square,
  RefreshCw,
  Mail,
  CheckCircle2,
  Eye,
  History,
  Info,
  UserPlus,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DEPARTMENTS, COURSES, SEMESTERS } from "@/lib/academicPrograms";
import type { SentNotice } from "@/lib/noticeStorage";

interface StudentRecipient {
  id: string | number;
  name: string;
  email: string;
  username: string;
  course: string;
  department: string;
  semester: string;
  role: string;
  createdAt?: string;
}

interface CustomRecipient {
  email: string;
  name?: string;
  addedAt: string;
}

const NOTICE_CATEGORIES = [
  "📢 General Announcement",
  "🎓 Registration & Membership",
  "🚨 Urgent / Important",
  "💻 Workshop & Bootcamp",
  "🏆 Hackathon & Competition",
  "🎓 Certificate & Standing",
  "🎉 Event Update",
];

const STYLES = `
  .nb-root {
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #f1f5f9;
    box-sizing: border-box;
    padding: 8px 0 32px 0;
  }
  .nb-header-card {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 24px 28px;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .nb-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .nb-stat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 14px;
    padding: 16px 20px;
    transition: all 0.2s ease;
  }
  .nb-stat-card:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(59, 130, 246, 0.05);
    transform: translateY(-2px);
  }
  .nb-filter-bar {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .nb-filter-input, .nb-filter-select {
    background: rgba(10, 14, 26, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 10px;
    color: #ffffff;
    padding: 9px 13px;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    width: 100%;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  .nb-filter-input:focus, .nb-filter-select:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25);
  }
  .nb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    text-decoration: none;
    font-family: inherit;
  }
  .nb-btn-primary {
    background: linear-gradient(135deg, #0284c7, #2563eb);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
  }
  .nb-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #0369a1, #1d4ed8);
    transform: translateY(-1px);
  }
  .nb-btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  .nb-btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.2);
  }
  .nb-btn-amber {
    background: linear-gradient(135deg, #d97706, #b45309);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
  }
  .nb-btn-amber:hover:not(:disabled) {
    background: linear-gradient(135deg, #b45309, #92400e);
    transform: translateY(-1px);
  }
  .nb-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .nb-table-container {
    background: rgba(10, 14, 26, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;
    max-height: 520px;
    overflow-y: auto;
  }
  .nb-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
  }
  .nb-table th {
    position: sticky;
    top: 0;
    background: rgba(15, 23, 42, 0.95);
    padding: 12px 14px;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    text-align: left;
    z-index: 5;
  }
  .nb-table td {
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    vertical-align: middle;
    color: #e2e8f0;
  }
  .nb-table tr {
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .nb-table tr:hover td {
    background: rgba(56, 189, 248, 0.04);
  }
  .nb-table tr.selected td {
    background: rgba(59, 130, 246, 0.12);
  }
  .nb-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
  }
  .nb-workspace {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    gap: 24px;
    align-items: start;
  }
  .nb-tab-pill {
    padding: 7px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .nb-tab-pill-active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    color: #93c5fd;
  }
  .nb-tab-pill-inactive {
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    border-color: rgba(255, 255, 255, 0.06);
  }
  .nb-tab-pill-inactive:hover {
    color: #f1f5f9;
    background: rgba(255, 255, 255, 0.08);
  }
  .nb-template-btn {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #cbd5e1;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s ease;
  }
  .nb-template-btn:hover {
    background: rgba(56, 189, 248, 0.12);
    border-color: rgba(56, 189, 248, 0.3);
    color: #38bdf8;
    transform: translateY(-1px);
  }
  .nb-custom-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 11px;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #fde68a;
  }
  @media (max-width: 1024px) {
    .nb-workspace {
      grid-template-columns: 1fr;
    }
  }
`;

export default function NoticeBroadcast() {
  const [students, setStudents] = useState<StudentRecipient[]>([]);
  const [customRecipients, setCustomRecipients] = useState<CustomRecipient[]>([]);
  const [sentNotices, setSentNotices] = useState<SentNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");

  // Recipient directory view tabs: "registered" or "unregistered"
  const [audienceTab, setAudienceTab] = useState<"registered" | "unregistered">("registered");

  // Selection state
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Filter state for registered roster
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedSem, setSelectedSem] = useState("ALL");

  // Custom / Unregistered recipient entry state
  const [customEmailInput, setCustomEmailInput] = useState("");
  const [customNameInput, setCustomNameInput] = useState("");

  // Notice form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("📢 General Announcement");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [showCtaConfig, setShowCtaConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  // Load students and past notices
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notices");
      if (!res.ok) throw new Error("Failed to load students");
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
        setSentNotices(data.sentNotices || []);
      }
    } catch {
      toast.error("Could not load student recipient directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "unregistered" || tabParam === "custom") {
        setAudienceTab("unregistered");
      }
    }
  }, []);

  // Filtered registered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedDept !== "ALL" && s.department !== selectedDept) return false;
      if (selectedCourse !== "ALL" && s.course !== selectedCourse) return false;
      if (selectedSem !== "ALL" && s.semester !== selectedSem) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (s.name || "").toLowerCase().includes(q);
        const matchesEmail = (s.email || "").toLowerCase().includes(q);
        const matchesRoll = (s.username || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRoll) return false;
      }

      return true;
    });
  }, [students, selectedDept, selectedCourse, selectedSem, search]);

  // Breakdown of selected registered vs custom/unregistered recipients
  const selectedRegisteredCount = useMemo(() => {
    const regSet = new Set(students.map((s) => s.email.toLowerCase()));
    let count = 0;
    selectedEmails.forEach((email) => {
      if (regSet.has(email.toLowerCase())) count++;
    });
    return count;
  }, [students, selectedEmails]);

  const selectedUnregisteredCount = useMemo(() => {
    const regSet = new Set(students.map((s) => s.email.toLowerCase()));
    let count = 0;
    selectedEmails.forEach((email) => {
      if (!regSet.has(email.toLowerCase())) count++;
    });
    return count;
  }, [students, selectedEmails]);

  const areAllFilteredSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => selectedEmails.has(s.email));
  }, [filteredStudents, selectedEmails]);

  const handleToggleSelectAll = () => {
    const next = new Set(selectedEmails);
    if (areAllFilteredSelected) {
      filteredStudents.forEach((s) => next.delete(s.email));
      setSelectedEmails(next);
      toast.info("Deselected filtered registered students.");
    } else {
      filteredStudents.forEach((s) => {
        if (s.email && s.email.includes("@")) next.add(s.email);
      });
      setSelectedEmails(next);
      toast.success(`Selected ${filteredStudents.length} registered students.`);
    }
  };

  const handleSelectAllInDatabase = () => {
    const next = new Set<string>(selectedEmails);
    students.forEach((s) => {
      if (s.email && s.email.includes("@")) next.add(s.email);
    });
    setSelectedEmails(next);
    toast.success(`Selected all ${students.length} registered student emails!`);
  };

  const handleClearSelection = () => {
    setSelectedEmails(new Set());
    toast.info("Cleared all recipient selections.");
  };

  const handleToggleSingle = (email: string) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.add(email);
    }
    setSelectedEmails(next);
  };

  // Add Custom / Unregistered Email Recipients
  const handleAddCustomEmails = () => {
    if (!customEmailInput.trim()) {
      toast.error("Please enter or paste at least one email address.");
      return;
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = customEmailInput.match(emailRegex) || [];

    if (matches.length === 0) {
      toast.error("No valid email addresses found in input.");
      return;
    }

    const newCustom: CustomRecipient[] = [...customRecipients];
    const nextSelected = new Set(selectedEmails);
    let addedCount = 0;

    for (const raw of matches) {
      const cleanEmail = raw.toLowerCase().trim();
      if (!newCustom.some((c) => c.email === cleanEmail)) {
        newCustom.push({
          email: cleanEmail,
          name: customNameInput.trim() || undefined,
          addedAt: new Date().toISOString(),
        });
        nextSelected.add(cleanEmail);
        addedCount++;
      } else if (!nextSelected.has(cleanEmail)) {
        nextSelected.add(cleanEmail);
      }
    }

    setCustomRecipients(newCustom);
    setSelectedEmails(nextSelected);
    setCustomEmailInput("");
    setCustomNameInput("");

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} unregistered / custom recipient(s)!`);
    } else {
      toast.info("All entered emails are already in the recipient list.");
    }
  };

  const handleRemoveCustomRecipient = (email: string) => {
    setCustomRecipients((prev) => prev.filter((c) => c.email !== email));
    const next = new Set(selectedEmails);
    next.delete(email);
    setSelectedEmails(next);
  };

  const handleClearAllCustom = () => {
    if (customRecipients.length === 0) return;
    const next = new Set(selectedEmails);
    customRecipients.forEach((c) => next.delete(c.email));
    setSelectedEmails(next);
    setCustomRecipients([]);
    toast.info("Cleared all custom recipients.");
  };

  // Quick Template Presets
  const handleApplyTemplate = (type: "registration" | "event" | "announcement") => {
    if (type === "registration") {
      setCategory("🎓 Registration & Membership");
      setSubject("Invitation to Join Coding Club CUH - Register Your Student Account");
      setMessage(
`Dear Student,

You are invited to join the official Coding Club of Central University of Haryana (CUH)!

As an official club member, you will get access to:
• Hands-on coding bootcamps & peer workshops (Web Development, Python, Cloud, AI & Data Structures)
• Verified digital event & course completion certificates with cryptographic QR verification
• Campus hackathons, algorithmic coding challenges & project showcases
• Collaborative student tech community & mentorship

Please complete your student registration using the button below to activate your account and join upcoming activities!`
      );
      setCtaText("Register & Activate Student Account →");
      setCtaUrl("https://codingclubcuh.online/auth/signup");
      setShowCtaConfig(true);
      setAudienceTab("unregistered");
      toast.success("Applied 'Registration Invitation' template! Ready for unregistered students.");
    } else if (type === "event") {
      setCategory("💻 Workshop & Bootcamp");
      setSubject("Open Invitation: Upcoming Tech Workshop - Coding Club CUH");
      setMessage(
`Hello,

Coding Club CUH is organizing an upcoming interactive workshop open to all university students!

Whether you are a beginner taking your first steps into programming or looking to advance your software engineering skills, everyone is welcome.

Check out the full schedule and session details on our events portal. If you do not have a club account yet, registering takes less than a minute!`
      );
      setCtaText("Explore Events & Register →");
      setCtaUrl("https://codingclubcuh.online/events");
      setShowCtaConfig(true);
      toast.success("Applied 'Event Workshop' template!");
    } else if (type === "announcement") {
      setCategory("📢 General Announcement");
      setSubject("");
      setMessage("");
      setCtaText("");
      setCtaUrl("");
      toast.info("Cleared form for custom announcement.");
    }
  };

  // Broadcast dispatch
  const handleBroadcastNotice = async () => {
    if (selectedEmails.size === 0) {
      toast.error("Please select or add at least one email recipient.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please provide a notice subject / title.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter the notice content.");
      return;
    }

    const count = selectedEmails.size;
    const breakdown =
      selectedUnregisteredCount > 0
        ? `\n• Registered Students: ${selectedRegisteredCount}\n• Unregistered / Custom Recipients: ${selectedUnregisteredCount}`
        : `\n• Total: ${count} registered students`;

    const confirmPrompt = `Broadcast this email to ${count} recipient${
      count > 1 ? "s" : ""
    }?${breakdown}\n\nSubject: "${subject.trim()}"`;

    if (!window.confirm(confirmPrompt)) return;

    setBroadcasting(true);
    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: Array.from(selectedEmails),
          subject: subject.trim(),
          message: message.trim(),
          category,
          ctaText: ctaText.trim() || undefined,
          ctaUrl: ctaUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.message || `Notice dispatched to ${data.sentCount || count} recipients!`
        );
        setSubject("");
        setMessage("");
        setCtaText("");
        setCtaUrl("");
        setSelectedEmails(new Set());
        loadData();
        setActiveTab("history");
      } else {
        toast.error(data.error || "Failed to broadcast notice.");
      }
    } catch {
      toast.error("An error occurred during broadcasting.");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="nb-root">
      <style>{STYLES}</style>

      {/* Top Banner Header */}
      <div className="nb-header-card">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25))",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              boxShadow: "0 0 20px -4px rgba(59, 130, 246, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "6px",
              flexShrink: 0,
            }}
          >
            <Image
              src="/ccc_logo.png"
              width={38}
              height={38}
              alt="Coding Club CUH"
              style={{ objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(59, 130, 246, 0.5))" }}
            />
          </div>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "9999px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#93c5fd", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>
              <Mail size={13} />
              <span>Mass Email & Custom Notice Dispatcher</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
              Student Notice & Custom Email Hub
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Send branded notices to registered student rosters OR dispatch custom invitations and notices to unregistered students anytime.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab("compose");
              setAudienceTab("unregistered");
            }}
            className="nb-btn nb-btn-amber"
          >
            <UserPlus size={14} />
            <span>✉️ Unregistered / Custom Emails</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "compose" ? "history" : "compose")}
            className="nb-btn nb-btn-secondary"
          >
            <History size={14} />
            <span>{activeTab === "compose" ? `Past Broadcasts (${sentNotices.length})` : "Compose Notice"}</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="nb-btn nb-btn-primary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="nb-stat-grid">
        <div className="nb-stat-card">
          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Registered Students</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>
            {students.length}
          </div>
        </div>

        <div className="nb-stat-card" style={{ borderColor: "rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.08)" }}>
          <span style={{ fontSize: "12px", color: "#fde68a", fontWeight: 600 }}>Custom / Unregistered</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#fbbf24", marginTop: "4px", display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span>{customRecipients.length}</span>
            <span style={{ fontSize: "12px", color: "#fde68a", fontWeight: 500 }}>added</span>
          </div>
        </div>

        <div className="nb-stat-card" style={{ borderColor: "rgba(59, 130, 246, 0.3)", background: "rgba(59, 130, 246, 0.08)" }}>
          <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: 600 }}>Selected Target</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#60a5fa", marginTop: "4px", display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span>{selectedEmails.size}</span>
            <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: 500 }}>
              ({selectedRegisteredCount} reg + {selectedUnregisteredCount} unreg)
            </span>
          </div>
        </div>

        <div className="nb-stat-card" style={{ borderColor: "rgba(168, 85, 247, 0.3)", background: "rgba(168, 85, 247, 0.08)" }}>
          <span style={{ fontSize: "12px", color: "#d8b4fe", fontWeight: 600 }}>Broadcasts Sent</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#c084fc", marginTop: "4px" }}>
            {sentNotices.length}
          </div>
        </div>
      </div>

      {activeTab === "history" ? (
        /* Sent Notices History View */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <History size={18} color="#38bdf8" />
              <span>Past Broadcast History</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className="nb-btn nb-btn-primary"
            >
              + Compose New Notice
            </button>
          </div>

          {sentNotices.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", background: "rgba(15, 23, 42, 0.6)", border: "1px dashed rgba(255, 255, 255, 0.12)", borderRadius: "16px" }}>
              <Mail size={36} color="#64748b" style={{ margin: "0 auto 10px" }} />
              <p style={{ margin: 0, fontWeight: 700, color: "#cbd5e1" }}>No notices broadcasted yet</p>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748b" }}>
                When you dispatch an announcement, it will be logged here with recipient metrics.
              </p>
            </div>
          ) : (
            <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px", overflow: "hidden" }}>
              {sentNotices.map((n) => (
                <div key={n.id} style={{ padding: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#93c5fd" }}>
                        {n.category}
                      </span>
                      {typeof n.unregisteredCount === "number" && n.unregisteredCount > 0 && (
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#fde68a", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <UserPlus size={11} /> {n.unregisteredCount} Unregistered Recipient{n.unregisteredCount > 1 ? "s" : ""}
                        </span>
                      )}
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>{n.subject}</h3>
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{new Date(n.sentAt).toLocaleString()}</span>
                      <span>&bull;</span>
                      <span style={{ color: "#34d399", fontWeight: 700 }}>
                        {n.recipientsCount} recipient{n.recipientsCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", background: "rgba(10, 14, 26, 0.7)", padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                    {n.message}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#64748b", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span>Official Sender: <strong style={{ color: "#38bdf8" }}>{n.senderEmail || "codingclub@cuh.ac.in"}</strong></span>
                      <span style={{ color: "#475569" }}>&bull;</span>
                      <span>Dispatched by: <strong style={{ color: "#cbd5e1" }}>{n.sentBy || "Admin"}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubject(n.subject);
                        setMessage(n.message);
                        setCategory(n.category);
                        if (n.ctaText) setCtaText(n.ctaText);
                        if (n.ctaUrl) setCtaUrl(n.ctaUrl);
                        setActiveTab("compose");
                        toast.info("Notice loaded into composer for re-use.");
                      }}
                      style={{ background: "none", border: "none", color: "#38bdf8", fontWeight: 700, cursor: "pointer", padding: 0 }}
                    >
                      Re-use in composer &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Compose & Select Roster Layout */
        <div className="nb-workspace">
          {/* Left Column: Recipient Selection (Registered Directory + Custom/Unregistered Panel) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Audience View Switcher Tabs */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setAudienceTab("registered")}
                  className={`nb-tab-pill ${audienceTab === "registered" ? "nb-tab-pill-active" : "nb-tab-pill-inactive"}`}
                >
                  <Users size={14} />
                  <span>Registered Students ({students.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceTab("unregistered")}
                  className={`nb-tab-pill ${audienceTab === "unregistered" ? "nb-tab-pill-active" : "nb-tab-pill-inactive"}`}
                  style={audienceTab === "unregistered" ? { borderColor: "rgba(245, 158, 11, 0.5)", color: "#fde68a", background: "rgba(245, 158, 11, 0.15)" } : {}}
                >
                  <UserPlus size={14} />
                  <span>Custom / Unregistered ({customRecipients.length})</span>
                </button>
              </div>

              {selectedEmails.size > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="nb-btn nb-btn-secondary"
                  style={{ padding: "5px 10px", fontSize: "11px" }}
                >
                  Clear Selection ({selectedEmails.size})
                </button>
              )}
            </div>

            {audienceTab === "registered" ? (
              <>
                {/* Registered Students Filter Bar */}
                <div className="nb-filter-bar">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                      <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                      <input
                        type="text"
                        placeholder="Search students by name, roll no, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="nb-filter-input"
                        style={{ paddingLeft: "36px" }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAllInDatabase}
                      className="nb-btn nb-btn-primary"
                      style={{ padding: "7px 12px", fontSize: "11.5px" }}
                    >
                      ✓ Select All ({students.length})
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>
                        Department
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="nb-filter-select"
                      >
                        <option value="ALL">All Departments</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>
                        Course / Degree
                      </label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="nb-filter-select"
                      >
                        <option value="ALL">All Courses</option>
                        {COURSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>
                        Semester
                      </label>
                      <select
                        value={selectedSem}
                        onChange={(e) => setSelectedSem(e.target.value)}
                        className="nb-filter-select"
                      >
                        <option value="ALL">All Semesters</option>
                        {SEMESTERS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Registered Students Selection Table */}
                <div className="nb-table-container">
                  {loading ? (
                    <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px", color: "#38bdf8" }} />
                      <span style={{ fontSize: "13px" }}>Loading registered students...</span>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div style={{ padding: "48px 20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                      No students match your filter criteria.
                    </div>
                  ) : (
                    <table className="nb-table">
                      <thead>
                        <tr>
                          <th style={{ width: "40px", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={handleToggleSelectAll}
                              style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", padding: 0 }}
                              title={areAllFilteredSelected ? "Deselect All Filtered" : "Select All Filtered"}
                            >
                              {areAllFilteredSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                          </th>
                          <th>Student Name</th>
                          <th>Email Address</th>
                          <th>Course / Sem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((s) => {
                          const isSelected = selectedEmails.has(s.email);
                          return (
                            <tr
                              key={s.id}
                              onClick={() => handleToggleSingle(s.email)}
                              className={isSelected ? "selected" : ""}
                            >
                              <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSingle(s.email)}
                                  style={{ background: "none", border: "none", color: isSelected ? "#38bdf8" : "#64748b", cursor: "pointer", padding: 0 }}
                                >
                                  {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                </button>
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, color: "#ffffff" }}>{s.name}</div>
                                {s.username && (
                                  <div style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "monospace" }}>
                                    Roll: {s.username}
                                  </div>
                                )}
                              </td>
                              <td>
                                <span style={{ fontFamily: "monospace", color: "#cbd5e1", fontSize: "12px" }}>{s.email}</span>
                              </td>
                              <td>
                                <div style={{ fontSize: "12px", color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                                  {s.course}
                                </div>
                                <div style={{ fontSize: "10px", color: "#64748b" }}>{s.semester}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Inline link to switch to unregistered */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#64748b", paddingLeft: "4px" }}>
                  <span>Showing {filteredStudents.length} of {students.length} registered students.</span>
                  <button
                    type="button"
                    onClick={() => setAudienceTab("unregistered")}
                    style={{ background: "none", border: "none", color: "#fbbf24", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Plus size={12} /> Add Unregistered / Custom Emails &rarr;
                  </button>
                </div>
              </>
            ) : (
              /* Custom & Unregistered Recipients Panel */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#fef3c7" }}>
                        Send to Unregistered / Custom Recipients
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#94a3b8" }}>
                        Paste single or multiple email addresses for students who are not registered on the portal yet.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#cbd5e1", marginBottom: "6px" }}>
                      Email Address(es) <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste one or multiple emails separated by comma, space, or newline...&#10;e.g. rohit.cuh@gmail.com, 230911@cuh.ac.in, priya.sharma@yahoo.com"
                      value={customEmailInput}
                      onChange={(e) => setCustomEmailInput(e.target.value)}
                      className="nb-filter-input"
                      style={{ resize: "vertical", minHeight: "80px", fontFamily: "monospace", fontSize: "12px", lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", alignItems: "flex-end" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#cbd5e1", marginBottom: "4px" }}>
                        Default Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Student / Prospective Member"
                        value={customNameInput}
                        onChange={(e) => setCustomNameInput(e.target.value)}
                        className="nb-filter-input"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomEmails}
                      className="nb-btn nb-btn-amber"
                      style={{ height: "40px", padding: "0 18px", whiteSpace: "nowrap" }}
                    >
                      <Plus size={15} /> Add to List
                    </button>
                  </div>
                </div>

                {/* List of Custom Recipients Added */}
                <div style={{ background: "rgba(10, 14, 26, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "16px", minHeight: "220px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>Added Unregistered Recipients ({customRecipients.length})</span>
                    </div>
                    {customRecipients.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllCustom}
                        style={{ background: "none", border: "none", color: "#ef4444", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Trash2 size={12} /> Clear Custom List
                      </button>
                    )}
                  </div>

                  {customRecipients.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b", textAlign: "center", padding: "28px" }}>
                      <UserPlus size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#cbd5e1" }}>No custom emails added yet</p>
                      <p style={{ margin: "4px 0 0", fontSize: "11px" }}>
                        Paste student emails above to send notices or invitations to unregistered students.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "300px", overflowY: "auto", padding: "4px 0" }}>
                      {customRecipients.map((c) => {
                        const isSelected = selectedEmails.has(c.email);
                        return (
                          <div
                            key={c.email}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: isSelected ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 255, 255, 0.04)",
                              border: isSelected ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                              fontSize: "12px",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSingle(c.email)}
                              style={{ cursor: "pointer" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontFamily: "monospace", color: isSelected ? "#fef3c7" : "#94a3b8", fontSize: "11.5px" }}>
                                {c.email}
                              </span>
                              {c.name && (
                                <span style={{ fontSize: "10px", color: "#64748b" }}>{c.name}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomRecipient(c.email)}
                              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                              title="Remove"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Notice Composer & Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={17} color="#38bdf8" />
                <span>Notice & Email Composer</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Eye size={13} />
                <span>{showPreview ? "Back to Edit" : "Live Email Preview"}</span>
              </button>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}>
              {/* Audience Mode Switch Bar */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background:
                    audienceTab === "unregistered"
                      ? "rgba(245, 158, 11, 0.12)"
                      : "rgba(59, 130, 246, 0.1)",
                  border:
                    audienceTab === "unregistered"
                      ? "1px solid rgba(245, 158, 11, 0.3)"
                      : "1px solid rgba(59, 130, 246, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                  {audienceTab === "unregistered" ? (
                    <>
                      <UserPlus size={15} color="#fbbf24" />
                      <span style={{ color: "#fde68a", fontWeight: 700 }}>
                        Audience: Unregistered / Custom Recipients ({customRecipients.length} added)
                      </span>
                    </>
                  ) : (
                    <>
                      <Users size={15} color="#60a5fa" />
                      <span style={{ color: "#93c5fd", fontWeight: 700 }}>
                        Audience: Registered Student Directory ({students.length} students)
                      </span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAudienceTab(audienceTab === "registered" ? "unregistered" : "registered")
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: audienceTab === "registered" ? "#fbbf24" : "#38bdf8",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {audienceTab === "registered"
                    ? "Switch to Custom / Unregistered Tab →"
                    : "Switch to Registered Students Tab →"}
                </button>
              </div>

              {/* Quick Template Presets */}
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  ⚡ Quick Templates & Presets
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("registration")}
                    className="nb-template-btn"
                    style={{ borderColor: "rgba(245, 158, 11, 0.3)", color: "#fde68a", background: "rgba(245, 158, 11, 0.08)" }}
                  >
                    <Sparkles size={12} color="#fbbf24" />
                    <span>Invite Unregistered to Join</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("event")}
                    className="nb-template-btn"
                  >
                    <span>💻 Open Workshop Invite</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("announcement")}
                    className="nb-template-btn"
                  >
                    <span>Clear / Freeform</span>
                  </button>
                </div>
              </div>

              {/* Category Pill */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Notice Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="nb-filter-select"
                >
                  {NOTICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Input */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em" }}>
                    Notice Title / Subject <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>{subject.length} chars</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Schedule for Next Masterclass & Bootcamps"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="nb-filter-input"
                />
              </div>

              {/* Notice Content */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.05em" }}>
                    Notice Content / Message Body <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>Supports line breaks</span>
                </div>
                <textarea
                  rows={8}
                  placeholder={`Write your official message to the students here...\n\nExample:\nWe are excited to announce our upcoming hands-on workshop on Web Development scheduled for this Saturday at 10:00 AM.\n\nPlease bring your laptops and make sure to register from the events section.`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="nb-filter-input"
                  style={{ resize: "vertical", lineHeight: 1.6, minHeight: "160px", fontFamily: "inherit" }}
                />
              </div>

              {/* Call-to-Action (CTA) Settings Collapsible */}
              <div style={{ border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", background: "rgba(10, 14, 26, 0.6)", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setShowCtaConfig((prev) => !prev)}
                  style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", color: "#cbd5e1", fontSize: "12px", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ExternalLink size={14} color="#38bdf8" />
                    <span>Call-to-Action (CTA) Button Settings</span>
                    {ctaText && (
                      <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "rgba(59, 130, 246, 0.2)", color: "#93c5fd" }}>
                        Customized
                      </span>
                    )}
                  </div>
                  {showCtaConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showCtaConfig && (
                  <div style={{ padding: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(10, 14, 26, 0.9)" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>
                        Button Text / Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Register & Join Club Now → (or leave empty for default)"
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        className="nb-filter-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px" }}>
                        Button Destination URL
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. https://codingclubcuh.online/auth/signup or /events"
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        className="nb-filter-input"
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
                      Unregistered students receive a &quot;Register &amp; Join Coding Club CUH&quot; button by default, while registered members receive a &quot;Go to Student Portal&quot; button.
                    </p>
                  </div>
                )}
              </div>

              {/* Recipient Breakdown Confirmation Box */}
              <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(10, 14, 26, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                    Target Broadcast Size
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
                      {selectedEmails.size} total recipient{selectedEmails.size === 1 ? "" : "s"}
                    </span>
                    {selectedUnregisteredCount > 0 && (
                      <span className="nb-badge" style={{ background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#fde68a" }}>
                        {selectedUnregisteredCount} Unregistered
                      </span>
                    )}
                  </div>
                </div>
                {selectedEmails.size === 0 ? (
                  <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>No recipients chosen</span>
                ) : (
                  <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={14} /> Ready to dispatch
                  </span>
                )}
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleBroadcastNotice}
                disabled={broadcasting || selectedEmails.size === 0}
                className="nb-btn nb-btn-primary"
                style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 700 }}
              >
                {broadcasting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Dispatching to {selectedEmails.size} Recipients...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Email Notice to {selectedEmails.size} Recipient{selectedEmails.size === 1 ? "" : "s"}</span>
                  </>
                )}
              </button>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "11px", color: "#94a3b8" }}>
                <Info size={14} color="#38bdf8" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  Notice is formatted with official branding and delivered through your official Google Workspace address (<strong>codingclub@cuh.ac.in</strong>).
                </span>
              </div>
            </div>

            {/* Live Email Preview Drawer */}
            {showPreview && (
              <div style={{ background: "#0c101c", border: "1px solid rgba(56, 189, 248, 0.4)", borderRadius: "16px", padding: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Eye size={14} /> Live Email Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}
                  >
                    Close Preview
                  </button>
                </div>

                <div style={{ borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)", background: "#0b0c10", overflow: "hidden", fontSize: "12px" }}>
                  <div style={{ padding: "10px 16px", background: "rgba(15, 23, 42, 0.95)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "11.5px", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "3px" }}>
                    <div><span style={{ color: "#64748b" }}>From:</span> <strong style={{ color: "#f8fafc" }}>Coding Club CUH &lt;codingclub@cuh.ac.in&gt;</strong></div>
                    <div><span style={{ color: "#64748b" }}>Reply-To:</span> <span style={{ color: "#38bdf8" }}>codingclub@cuh.ac.in</span></div>
                  </div>
                  <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #38bdf8 100%)", padding: "24px 20px", textAlign: "center", color: "#ffffff" }}>
                    <div style={{ width: "44px", height: "44px", margin: "0 auto 10px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.15)", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Image
                        src="/ccc_logo.png"
                        width={34}
                        height={34}
                        alt="Coding Club CUH"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "9999px", background: "rgba(255, 255, 255, 0.2)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>
                      {category}
                    </span>
                    <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Coding Club CUH</h4>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255, 255, 255, 0.85)" }}>Central University of Haryana &bull; Official Student Notice</p>
                  </div>
                  <div style={{ padding: "20px", background: "#12141c", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "10px" }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>{subject || "Notice Subject Placeholder"}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Published Today</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#ffffff" }}>Dear Student,</div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                      {message || "Your announcement message will be rendered here with formatted paragraphs."}
                    </div>

                    {(selectedUnregisteredCount > 0 || ctaUrl.includes("/auth/signup") || category.includes("Registration")) && (
                      <div style={{ margin: "8px 0", padding: "12px 14px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.3)", fontSize: "11.5px", color: "#93c5fd", lineHeight: 1.5 }}>
                        <strong style={{ color: "#60a5fa" }}>💡 Note for Non-Registered Students:</strong> You have received this invitation as an official student of Central University of Haryana. Registering gives you full access to upcoming workshops, hackathons, and cryptographic certificates.
                      </div>
                    )}

                    <div style={{ textAlign: "center", paddingTop: "12px" }}>
                      <span style={{ display: "inline-block", padding: "10px 24px", borderRadius: "8px", background: "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: "12px" }}>
                        {ctaText || (selectedUnregisteredCount > 0 ? "Register & Join Coding Club CUH →" : "Go to Student Portal →")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
