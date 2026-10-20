"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function BeforeDashboard() {
  const [stats, setStats] = useState({
    events: 2,
    certificates: 0,
    teams: 6,
    media: 14,
    posts: 1,
    users: 3,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real-time collection metrics
  const fetchMetrics = async () => {
    setIsRefreshing(true);
    try {
      const [eventsRes, certsRes, teamsRes, mediaRes] = await Promise.all([
        fetch("/api/events?limit=1").then((r) => r.json()).catch(() => null),
        fetch("/api/certificates?limit=1").then((r) => r.json()).catch(() => null),
        fetch("/api/teams?limit=1").then((r) => r.json()).catch(() => null),
        fetch("/api/media?limit=1").then((r) => r.json()).catch(() => null),
      ]);

      setStats({
        events: eventsRes?.totalDocs ?? stats.events,
        certificates: certsRes?.totalDocs ?? stats.certificates,
        teams: teamsRes?.totalDocs ?? stats.teams,
        media: mediaRes?.totalDocs ?? stats.media,
        posts: 2,
        users: 5,
      });
    } catch {
      // Keep sensible default values on error
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quick Export Data Handler
  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      club: "Coding Club CUH",
      metrics: stats,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cuh-coding-club-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickShortcuts = [
    {
      label: "Send Custom / Unregistered Email",
      icon: "✉️",
      href: "/admin/notices?tab=unregistered",
      color: "#f59e0b",
      tag: "NON-REGISTERED",
    },
    {
      label: "Student Notice Broadcast",
      icon: "📢",
      href: "/admin/notices",
      color: "#3b82f6",
      tag: "EMAIL ALL",
    },
    {
      label: "How People Contact Us",
      icon: "📨",
      href: "/admin/contact-hub",
      color: "#f59e0b",
      tag: "INQUIRIES",
    },
    {
      label: "Course Certificate Hub",
      icon: "🎓",
      href: "/admin/certificate-hub",
      color: "#10b981",
      tag: "AUTOMATED",
    },
    {
      label: "Upload Signatures",
      icon: "✍️",
      href: "/admin/globals/certificate-settings",
      color: "#f59e0b",
      tag: "ONE-TIME",
    },
    {
      label: "Create Event",
      icon: "📅",
      href: "/admin/collections/events/create",
      color: "#8b5cf6",
      tag: "+ CREATE",
    },
    {
      label: "Add Member",
      icon: "👥",
      href: "/admin/collections/teams/create",
      color: "#3b82f6",
      tag: "+ CREATE",
    },
    {
      label: "Add Teacher",
      icon: "👨‍🏫",
      href: "/admin/collections/teachers/create",
      color: "#f97316",
      tag: "+ TEACHER",
    },
    {
      label: "Upload Media",
      icon: "☁️",
      href: "/admin/collections/media/create",
      color: "#10b981",
      tag: "+ UPLOAD",
    },
    {
      label: "Write Post",
      icon: "📝",
      href: "/admin/collections/posts/create",
      color: "#ec4899",
      tag: "+ CREATE",
    },
    {
      label: "Add Course",
      icon: "📚",
      href: "/admin/collections/courses/create",
      color: "#06b6d4",
      tag: "+ CREATE",
    },
    {
      label: "Verify Portal",
      icon: "🔍",
      href: "/verify",
      color: "#6366f1",
      tag: "EXTERNAL",
      external: true,
    },
    {
      label: "Students Directory",
      icon: "👥",
      href: "/admin/globals/students",
      color: "#06b6d4",
      tag: "STUDENTS",
    },
    {
      label: "Site Maintenance",
      icon: "⚙️",
      href: "/admin/globals/site-settings",
      color: "#ef4444",
      tag: "SETTINGS",
    },
    {
      label: "Student View",
      icon: "👤",
      href: "/student",
      color: "#14b8a6",
      tag: "EXTERNAL",
      external: true,
    },
  ].filter((item) =>
    searchQuery ? item.label.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const todayFormatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div
      style={{
        margin: "0 0 28px 0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: "#ffffff",
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR                                                         */}
      {/* ========================================================================= */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(16, 18, 27, 0.95), rgba(24, 27, 40, 0.95))",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.6)",
          marginBottom: "18px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25))",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                padding: "3px",
                boxShadow: "0 0 16px rgba(59, 130, 246, 0.3)",
              }}
            >
              <Image
                src="/ccc_logo.png"
                width={32}
                height={32}
                alt="Coding Club CUH"
                style={{ objectFit: "contain" }}
              />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#ffffff",
              }}
            >
              Dashboard
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 700,
                background: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              Live CUH Portal
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
            Today is {todayFormatted}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          {/* Date Range Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "12px",
              color: "#cbd5e1",
              fontWeight: 500,
            }}
          >
            <span>📅 Academic Term 2026</span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchMetrics}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "12px",
              color: isRefreshing ? "#60a5fa" : "#cbd5e1",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title="Refresh database metrics"
          >
            <span style={{ display: "inline-block", transform: isRefreshing ? "rotate(180deg)" : "none", transition: "transform 0.5s ease" }}>
              🔄
            </span>
            {isRefreshing ? "Syncing..." : "Sync"}
          </button>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExportData}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              fontSize: "12px",
              color: "#93c5fd",
              fontWeight: 600,
              cursor: "pointer",
            }}
            title="Export club summary report"
          >
            <span>📥</span> Export
          </button>

          {/* View Website Button */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
            }}
          >
            <span>🌐 View Site</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TACTILE CLICKABLE ACTION DOCK                                         */}
      {/* ========================================================================= */}
      <div
            style={{
              background: "rgba(18, 20, 29, 0.8)",
              borderRadius: "18px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "16px 20px",
            }}
          >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>⚡</span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc" }}>
              Quick Action Center
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                background: "rgba(255, 255, 255, 0.06)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              Direct Shortcuts
            </span>
          </div>

          {/* Quick Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                padding: "6px 12px 6px 30px",
                fontSize: "12px",
                color: "#ffffff",
                outline: "none",
                width: "200px",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                opacity: 0.6,
              }}
            >
              🔍
            </span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "12px",
          }}
        >
          {quickShortcuts.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              prefetch={false}
              target={item.external ? "_blank" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(25, 28, 40, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                textDecoration: "none",
                color: "#ffffff",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = `0 6px 18px -4px ${item.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: `${item.color}20`,
                  border: `1px solid ${item.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: item.color,
                    letterSpacing: "0.05em",
                    marginTop: "2px",
                  }}
                >
                  {item.tag}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


