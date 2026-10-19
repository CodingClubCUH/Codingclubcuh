"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Send,
  Building,
  Bot,
  Globe,
  X,
  AlertCircle,
  FileText,
  Download,
  ShieldCheck,
  CornerDownRight,
} from "lucide-react";
import { toast } from "sonner";
import type { ContactMessage } from "@/lib/contactStorage";

const STYLES = `
  .chub-root {
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #f1f5f9;
    box-sizing: border-box;
    padding: 8px 0 32px 0;
  }
  .chub-header-card {
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
  .chub-channels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .chub-channel-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .chub-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .chub-stat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 14px;
    padding: 16px 20px;
    transition: all 0.2s ease;
  }
  .chub-stat-card:hover {
    border-color: rgba(245, 158, 11, 0.4);
    background: rgba(245, 158, 11, 0.05);
    transform: translateY(-2px);
  }
  .chub-filter-bar {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 14px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 20px;
  }
  .chub-input, .chub-select, .chub-textarea {
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
  .chub-input:focus, .chub-select:focus, .chub-textarea:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
  }
  .chub-btn {
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
  .chub-btn-primary {
    background: linear-gradient(135deg, #d97706, #f59e0b);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
  }
  .chub-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #b45309, #d97706);
    transform: translateY(-1px);
  }
  .chub-btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  .chub-btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.2);
  }
  .chub-table-container {
    background: rgba(10, 14, 26, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;
  }
  .chub-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
  }
  .chub-table th {
    background: rgba(15, 23, 42, 0.95);
    padding: 13px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    text-align: left;
  }
  .chub-table td {
    padding: 13px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    vertical-align: middle;
    color: #e2e8f0;
  }
  .chub-table tr:hover td {
    background: rgba(245, 158, 11, 0.03);
  }
  .chub-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
  }
  .chub-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  }
  .chub-modal-card {
    background: #0c101c;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 20px;
    max-width: 680px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 28px;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

export default function ContactHub() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "unread" | "read" | "replied">("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Quick reply modal state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Admin notes editor state
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      toast.error("Could not load contact inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (selectedStatus !== "all" && m.status !== selectedStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = (m.name || "").toLowerCase().includes(q);
        const matchesEmail = (m.email || "").toLowerCase().includes(q);
        const matchesSubj = (m.subject || "").toLowerCase().includes(q);
        const matchesMsg = (m.message || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSubj && !matchesMsg) return false;
      }
      return true;
    });
  }, [messages, selectedStatus, search]);

  const handleUpdateStatus = async (id: string, newStatus: "unread" | "read" | "replied") => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Inquiry marked as ${newStatus}`);
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev: ContactMessage | null) => (prev ? { ...prev, status: newStatus } : null));
        }
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Network error while updating status.");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message record?")) return;

    try {
      const res = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Message removed from contact desk.");
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.error || "Failed to delete message");
      }
    } catch {
      toast.error("Network error while deleting message.");
    }
  };

  const handleOpenReply = (m: ContactMessage) => {
    setSelectedMessage(m);
    setReplySubject(`Re: ${m.subject}`);
    setReplyBody(`Hi ${m.name},\n\nThank you for reaching out to Coding Club CUH regarding "${m.subject}".\n\n\nBest regards,\nCoding Club CUH Desk\nCentral University of Haryana`);
    setAdminNotes(m.adminNotes || "");
    setReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage) return;
    if (!replySubject.trim() || !replyBody.trim()) {
      toast.error("Please enter a subject and reply message body.");
      return;
    }

    setSendingReply(true);
    try {
      const res = await fetch("/api/contact/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          to: selectedMessage.email,
          recipientName: selectedMessage.name,
          originalSubject: selectedMessage.subject,
          replySubject: replySubject.trim(),
          replyMessage: replyBody.trim(),
          originalMessage: selectedMessage.message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Reply email dispatched to ${selectedMessage.email}!`);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id
              ? { ...m, status: "replied", repliedAt: new Date().toISOString() }
              : m
          )
        );
        setReplyModalOpen(false);
      } else {
        toast.error(data.error || "Failed to send email reply.");
      }
    } catch {
      toast.error("Network error while sending email reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    setSavingNotes(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedMessage.id, adminNotes }),
      });
      if (res.ok) {
        toast.success("Internal note saved.");
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMessage.id ? { ...m, adminNotes } : m))
        );
        setSelectedMessage((prev: ContactMessage | null) => (prev ? { ...prev, adminNotes } : null));
      } else {
        toast.error("Failed to save note.");
      }
    } catch {
      toast.error("Failed to save note.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleExportCSV = () => {
    if (messages.length === 0) {
      toast.error("No messages to export.");
      return;
    }
    const headers = ["ID", "Date", "Name", "Email", "Subject", "Status", "Channel", "Message", "AdminNotes"];
    const rows = messages.map((m) => [
      m.id,
      new Date(m.createdAt).toLocaleString(),
      `"${m.name.replace(/"/g, '""')}"`,
      m.email,
      `"${m.subject.replace(/"/g, '""')}"`,
      m.status,
      m.channel || "website",
      `"${m.message.replace(/"/g, '""')}"`,
      `"${(m.adminNotes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cuh-contact-inquiries-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="chub-root">
      <style>{STYLES}</style>

      {/* Top Banner Header */}
      <div className="chub-header-card">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(249, 115, 22, 0.25))",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              boxShadow: "0 0 20px -4px rgba(245, 158, 11, 0.4)",
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
              style={{ objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(245, 158, 11, 0.5))" }}
            />
          </div>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "9999px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#fcd34d", fontSize: "11px", fontWeight: 700, marginBottom: "6px" }}>
              <Mail size={13} />
              <span>Inquiry Management & Contact Channels</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
              How People Contact Us
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Track, inspect, and reply to all student questions, workshop inquiries, and collaboration proposals submitted through our contact desk, official email, and online channels.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="chub-btn chub-btn-secondary"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            onClick={loadMessages}
            disabled={loading}
            className="chub-btn chub-btn-primary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Contact Channels Overview Cards */}
      <div className="chub-channels-grid">
        <div className="chub-channel-card">
          <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Globe size={18} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Public Form</div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>/contact Form</div>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>Website general inquiry desk</p>
          </div>
        </div>

        <div className="chub-channel-card">
          <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mail size={18} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Official Email</div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>codingclub@cuh.ac.in</div>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>Institutional CUH email desk</p>
          </div>
        </div>

        <div className="chub-channel-card">
          <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building size={18} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Campus Support</div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>cuhcodingclub@gmail.com</div>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>Dept. of CS & IT, Mahendergarh</p>
          </div>
        </div>

        <div className="chub-channel-card">
          <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Automated Bot</div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>Telegram & AI Chat</div>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>Instant telegram notifications</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="chub-stat-grid">
        <div className="chub-stat-card">
          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Total Messages</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>{stats.total}</div>
        </div>
        <div className="chub-stat-card" style={{ borderColor: "rgba(245, 158, 11, 0.3)", background: "rgba(245, 158, 11, 0.08)" }}>
          <span style={{ fontSize: "12px", color: "#fcd34d", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            Unread / New
          </span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#fbbf24", marginTop: "4px" }}>{stats.unread}</div>
        </div>
        <div className="chub-stat-card" style={{ borderColor: "rgba(56, 189, 248, 0.3)", background: "rgba(56, 189, 248, 0.08)" }}>
          <span style={{ fontSize: "12px", color: "#7dd3fc", fontWeight: 700 }}>Under Review / Read</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>{stats.read}</div>
        </div>
        <div className="chub-stat-card" style={{ borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.08)" }}>
          <span style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 700 }}>Replied & Resolved</span>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>{stats.replied}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="chub-filter-bar">
        <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search inquiries by name, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="chub-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {(["all", "unread", "read", "replied"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className="chub-btn chub-btn-secondary"
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                background: selectedStatus === status ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.05)",
                borderColor: selectedStatus === status ? "rgba(245, 158, 11, 0.5)" : "rgba(255, 255, 255, 0.1)",
                color: selectedStatus === status ? "#fbbf24" : "#94a3b8",
                fontWeight: selectedStatus === status ? 800 : 500,
              }}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="chub-table-container">
        {loading ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px", color: "#f59e0b" }} />
            <span style={{ fontSize: "13px" }}>Loading inquiries...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
            <MessageSquare size={36} color="#475569" style={{ margin: "0 auto 10px" }} />
            <p style={{ margin: 0, fontWeight: 700, color: "#cbd5e1" }}>No inquiries found</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px" }}>Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <table className="chub-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sender</th>
                <th>Subject & Snippet</th>
                <th>Channel</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((m) => (
                <tr key={m.id}>
                  <td style={{ color: "#94a3b8", fontSize: "12px", whiteSpace: "nowrap" }}>
                    {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "#ffffff" }}>{m.name}</div>
                    <a href={`mailto:${m.email}`} style={{ fontSize: "11px", color: "#38bdf8", textDecoration: "none", fontFamily: "monospace" }}>
                      {m.email}
                    </a>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "#ffffff", maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.subject}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", maxWidth: "260px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.message}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.08)", color: "#cbd5e1" }}>
                      {m.channel || "website"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background:
                          m.status === "unread" ? "rgba(245, 158, 11, 0.15)" :
                          m.status === "read" ? "rgba(56, 189, 248, 0.15)" :
                          "rgba(16, 185, 129, 0.15)",
                        color:
                          m.status === "unread" ? "#fcd34d" :
                          m.status === "read" ? "#7dd3fc" :
                          "#6ee7b7",
                        border: `1px solid ${
                          m.status === "unread" ? "rgba(245, 158, 11, 0.3)" :
                          m.status === "read" ? "rgba(56, 189, 248, 0.3)" :
                          "rgba(16, 185, 129, 0.3)"
                        }`,
                      }}
                    >
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenReply(m)}
                        className="chub-btn chub-btn-primary"
                        style={{ padding: "5px 10px", fontSize: "11px" }}
                      >
                        <Send size={12} />
                        <span>Reply</span>
                      </button>

                      {m.status === "unread" ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(m.id, "read")}
                          className="chub-btn chub-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "11px" }}
                          title="Mark as Read"
                        >
                          Mark Read
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(m.id, "unread")}
                          className="chub-btn chub-btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "11px" }}
                          title="Mark as Unread"
                        >
                          Mark Unread
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        className="chub-btn chub-btn-secondary"
                        style={{ padding: "5px 8px", fontSize: "11px", color: "#f87171" }}
                        title="Delete Inquiry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reply & Details Modal */}
      {replyModalOpen && selectedMessage && (
        <div className="chub-modal-backdrop" onClick={() => setReplyModalOpen(false)}>
          <div className="chub-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mail size={18} color="#fbbf24" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
                    Reply to {selectedMessage.name}
                  </h3>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{selectedMessage.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Original Message Preview */}
            <div style={{ background: "rgba(10, 14, 26, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>
                Original Message &bull; {selectedMessage.subject}
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {selectedMessage.message}
              </p>
            </div>

            {/* Reply Subject */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "6px" }}>
                Reply Subject
              </label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="chub-input"
              />
            </div>

            {/* Reply Body */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", marginBottom: "6px" }}>
                Email Reply Message
              </label>
              <textarea
                rows={7}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="chub-textarea"
                style={{ resize: "none", lineHeight: 1.6 }}
              />
            </div>

            {/* Internal Admin Note */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FileText size={13} /> Internal Staff Notes
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "11px", fontWeight: 700, cursor: "pointer", padding: 0 }}
                >
                  {savingNotes ? "Saving..." : "Save Note"}
                </button>
              </div>
              <input
                type="text"
                placeholder="Internal memo regarding this inquiry..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="chub-input"
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => setReplyModalOpen(false)}
                className="chub-btn chub-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={sendingReply}
                className="chub-btn chub-btn-primary"
              >
                {sendingReply ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Sending Reply...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Email Reply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
