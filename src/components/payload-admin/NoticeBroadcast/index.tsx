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

const NOTICE_CATEGORIES = [
  "📢 General Announcement",
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
  @media (max-width: 1024px) {
    .nb-workspace {
      grid-template-columns: 1fr;
    }
  }
`;

export default function NoticeBroadcast() {
  const [students, setStudents] = useState<StudentRecipient[]>([]);
  const [sentNotices, setSentNotices] = useState<SentNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");

  // Selection state
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedSem, setSelectedSem] = useState("ALL");

  // Notice form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("📢 General Announcement");
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
  }, []);

  // Filtered students
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

  const areAllFilteredSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => selectedEmails.has(s.email));
  }, [filteredStudents, selectedEmails]);

  const handleToggleSelectAll = () => {
    const next = new Set(selectedEmails);
    if (areAllFilteredSelected) {
      filteredStudents.forEach((s) => next.delete(s.email));
      setSelectedEmails(next);
      toast.info("Deselected filtered students.");
    } else {
      filteredStudents.forEach((s) => {
        if (s.email && s.email.includes("@")) next.add(s.email);
      });
      setSelectedEmails(next);
      toast.success(`Selected ${filteredStudents.length} students.`);
    }
  };

  const handleSelectAllInDatabase = () => {
    const next = new Set<string>();
    students.forEach((s) => {
      if (s.email && s.email.includes("@")) next.add(s.email);
    });
    setSelectedEmails(next);
    toast.success(`Selected all ${next.size} registered student emails!`);
  };

  const handleClearSelection = () => {
    setSelectedEmails(new Set());
    toast.info("Cleared recipient selection.");
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

  // Broadcast dispatch
  const handleBroadcastNotice = async () => {
    if (selectedEmails.size === 0) {
      toast.error("Please select at least one student email recipient.");
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
    const confirmPrompt = `Broadcast this notice to ${count} student email${
      count > 1 ? "s" : ""
    } at once?\n\nSubject: "${subject.trim()}"`;

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
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.message || `Notice dispatched to ${data.sentCount || count} recipients!`
        );
        setSubject("");
        setMessage("");
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
              <span>Mass Email Dispatcher & Announcer</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
              Student Notice Broadcast
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Select all student emails with one click or filter by department/course, compose official notices, and dispatch branded announcements directly to their inboxes at once.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
        <div className="nb-stat-card" style={{ borderColor: "rgba(59, 130, 246, 0.3)", background: "rgba(59, 130, 246, 0.08)" }}>
          <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: 600 }}>Selected Recipients</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#60a5fa", marginTop: "4px", display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span>{selectedEmails.size}</span>
            <span style={{ fontSize: "13px", color: "#93c5fd", fontWeight: 500 }}>/ {students.length}</span>
          </div>
        </div>
        <div className="nb-stat-card" style={{ borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.08)" }}>
          <span style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 600 }}>Active Email IDs</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
            {students.filter((s) => s.email?.includes("@")).length}
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

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#64748b" }}>
                    <div>Sent by: <strong style={{ color: "#cbd5e1" }}>{n.sentBy || "Admin"}</strong></div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubject(n.subject);
                        setMessage(n.message);
                        setCategory(n.category);
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
          {/* Left Column: Student Recipient Selection Table */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={17} color="#38bdf8" />
                <span>Select Recipients ({filteredStudents.length} matching)</span>
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleSelectAllInDatabase}
                  className="nb-btn nb-btn-primary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  ✓ Select All ({students.length})
                </button>
                {selectedEmails.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="nb-btn nb-btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            <div className="nb-filter-bar">
              <div style={{ position: "relative" }}>
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

            {/* Students Selection Table */}
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
            <div style={{ fontSize: "11px", color: "#64748b", paddingLeft: "4px" }}>
              Showing {filteredStudents.length} of {students.length} students. Click any row or checkbox to select.
            </div>
          </div>

          {/* Right Column: Notice Composer & Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={17} color="#38bdf8" />
                <span>Compose Notice</span>
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
                  rows={9}
                  placeholder={`Write your official message to the students here...\n\nExample:\nWe are excited to announce our upcoming hands-on workshop on Web Development scheduled for this Saturday at 10:00 AM.\n\nPlease bring your laptops and make sure to register from the events section.`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="nb-filter-input"
                  style={{ resize: "none", lineHeight: 1.6, minHeight: "180px", fontFamily: "inherit" }}
                />
              </div>

              {/* Recipient Confirmation Box */}
              <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(10, 14, 26, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                    Target Broadcast Size
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
                    {selectedEmails.size} student{selectedEmails.size === 1 ? "" : "s"} selected
                  </span>
                </div>
                {selectedEmails.size === 0 ? (
                  <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>None selected</span>
                ) : (
                  <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={14} /> Ready to send
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
                    <span>Broadcasting to {selectedEmails.size} Recipients...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Notice to {selectedEmails.size} Emails at Once</span>
                  </>
                )}
              </button>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "11px", color: "#94a3b8" }}>
                <Info size={14} color="#38bdf8" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  Notice is formatted with the official Coding Club CUH header, verification branding, and direct links to the student portal.
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
                    <div style={{ textAlign: "center", paddingTop: "12px" }}>
                      <span style={{ display: "inline-block", padding: "10px 24px", borderRadius: "8px", background: "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: "12px" }}>
                        Go to Student Portal &rarr;
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
