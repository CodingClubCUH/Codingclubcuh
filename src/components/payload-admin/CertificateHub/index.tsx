"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Users,
  AlertCircle,
  Eye,
} from "lucide-react";
import SignatureAdjusterPreview from "@/components/payload-admin/SignatureAdjusterPreview";

interface CourseBatch {
  id: string | number;
  title: string;
  batchName: string; // e.g. "C Programming (Sept 2026)"
  batchLabel: string; // e.g. "Sept 2026"
  monthName: string;
  yearNumber: number;
  department?: string;
  instructorName?: string;
  startingDate?: string;
  completionDate?: string;
  status: string;
  totalEnrolled: number;
  issuedCount: number;
  pendingCount: number;
}

interface StudentEnrollment {
  enrollmentId: string | number;
  studentId: string | number;
  studentName: string;
  studentEmail: string;
  department: string;
  enrolledAt: string;
  status: string;
  selectedForCertificate: boolean;
  hasCertificate: boolean;
  certificateId: string | null;
  certificateDbId: string | number | null;
  issueDate: string | null;
  certificateSent: boolean;
  certificateSentAt: string | null;
}

const HUB_STYLES = `
  .ch-root {
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #f1f5f9;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .ch-root * {
    box-sizing: border-box;
  }
  .ch-card {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  }
  .ch-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 20px;
  }
  .ch-header-title-box {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .ch-header-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #137558 0%, #10b981 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
    flex-shrink: 0;
  }
  .ch-title {
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;
    margin: 0;
    letter-spacing: -0.02em;
  }
  .ch-subtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 4px 0 0 0;
  }
  .ch-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .ch-banner-warning {
    background: rgba(120, 53, 15, 0.25);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    color: #fef3c7;
    font-size: 13px;
    margin-bottom: 20px;
  }
  .ch-banner-success {
    background: rgba(6, 78, 59, 0.3);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #d1fae5;
    font-size: 13px;
    margin-bottom: 20px;
  }
  .ch-layout-grid {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 1024px) {
    .ch-layout-grid {
      grid-template-columns: 1fr;
    }
    .ch-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  .ch-filter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
  .ch-input-label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    display: block;
    margin-bottom: 4px;
  }
  .ch-select, .ch-input {
    width: 100%;
    background: #1e293b;
    border: 1px solid #334155;
    color: #f8fafc;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    outline: none;
    transition: border-color 0.2s;
  }
  .ch-select:focus, .ch-input:focus {
    border-color: #10b981;
  }
  .ch-search-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 14px;
  }
  .ch-search-wrapper input {
    padding-left: 32px;
  }
  .ch-search-icon {
    position: absolute;
    left: 10px;
    top: 9px;
    color: #64748b;
    pointer-events: none;
  }
  .ch-course-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 580px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .ch-course-card {
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(30, 41, 59, 0.5);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  .ch-course-card:hover {
    background: #1e293b;
    border-color: rgba(16, 185, 129, 0.4);
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.1);
  }
  .ch-course-card.active {
    background: rgba(16, 185, 129, 0.12);
    border-color: #10b981;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
  }
  .ch-course-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ch-course-card-title {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }
  .ch-course-card-subtitle {
    font-size: 11px;
    color: #94a3b8;
    margin: 4px 0 0 0;
  }
  .ch-course-card-footer {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
  }
  .ch-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    text-decoration: none;
  }
  .ch-btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  .ch-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .ch-btn-primary {
    background: linear-gradient(135deg, #137558 0%, #10b981 100%);
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
  }
  .ch-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #0f6249 0%, #059669 100%);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    transform: translateY(-1px);
  }
  .ch-btn-outline {
    background: #1e293b;
    border: 1px solid #334155;
    color: #e2e8f0 !important;
  }
  .ch-btn-outline:hover:not(:disabled) {
    background: #334155;
    border-color: rgba(255, 255, 255, 0.2);
    color: #ffffff !important;
    transform: translateY(-1px);
  }
  .ch-btn-warning {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid #f59e0b;
    color: #fbbf24 !important;
  }
  .ch-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .ch-badge-issued {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  .ch-badge-pending {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  .ch-badge-active {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }
  .ch-metrics-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ch-metric-box {
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 6px 14px;
    text-align: center;
    min-width: 68px;
  }
  .ch-metric-label {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
  }
  .ch-metric-val {
    font-size: 15px;
    font-weight: 800;
    color: #ffffff;
  }
  .ch-table-wrapper {
    background: #090d16;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow-x: auto;
    margin-top: 14px;
  }
  .ch-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 12px;
  }
  .ch-table th {
    background: #1e293b;
    color: #cbd5e1;
    font-weight: 700;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.04em;
  }
  .ch-table td {
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
    vertical-align: middle;
  }
  .ch-table tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
  .ch-table tr.selected td {
    background: rgba(16, 185, 129, 0.06);
  }
  .ch-tab-pill {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    background: transparent;
    color: #94a3b8;
    transition: all 0.15s;
  }
  .ch-tab-pill.active {
    background: #334155;
    color: #ffffff;
  }
  .ch-tab-pill.active-amber {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.4);
  }
  .ch-tab-pill.active-emerald {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.4);
  }
`;

export default function CertificateHub() {
  const [courses, setCourses] = useState<CourseBatch[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [hasGlobalSignatures, setHasGlobalSignatures] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Selected filters
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected course & enrolled students
  const [selectedCourseId, setSelectedCourseId] = useState<string | number | null>(null);
  const [selectedCourseData, setSelectedCourseData] = useState<CourseBatch | null>(null);
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Student list search & filter
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState<"all" | "pending" | "issued">("all");
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<(string | number)[]>([]);

  // Action states
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAdjusterModal, setShowAdjusterModal] = useState(false);

  // 1. Fetch all courses summary
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch("/api/courses/issue-certificates");
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses || []);
        setAvailableYears(data.availableYears || []);
        setAvailableMonths(data.availableMonths || []);
        setHasGlobalSignatures(Boolean(data.hasGlobalSignatures));

        if (!selectedCourseId && data.courses?.length > 0) {
          selectCourse(data.courses[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Select course and load its student roster
  const selectCourse = async (courseId: string | number) => {
    setSelectedCourseId(courseId);
    setLoadingStudents(true);
    setSelectedEnrollmentIds([]);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/courses/issue-certificates?courseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCourseData(data.course);
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Failed to load course students", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filtered courses based on Year, Month, Search
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (selectedYear !== "all" && String(c.yearNumber) !== selectedYear) return false;
      if (selectedMonth !== "all" && c.monthName.toLowerCase() !== selectedMonth.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          c.batchName.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          (c.instructorName && c.instructorName.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [courses, selectedYear, selectedMonth, searchQuery]);

  // Filtered students inside selected course
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (studentFilter === "pending" && s.hasCertificate) return false;
      if (studentFilter === "issued" && !s.hasCertificate) return false;
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        return (
          s.studentName.toLowerCase().includes(q) ||
          s.studentEmail.toLowerCase().includes(q) ||
          (s.certificateId && s.certificateId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [students, studentFilter, studentSearch]);

  // Toggle selection for bulk actions
  const toggleSelectStudent = (id: string | number) => {
    setSelectedEnrollmentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEnrollmentIds.length === filteredStudents.length) {
      setSelectedEnrollmentIds([]);
    } else {
      setSelectedEnrollmentIds(filteredStudents.map((s) => s.enrollmentId));
    }
  };

  // 1-Click Generate Certificate for Single Student
  const handleGenerateSingle = async (enrollmentId: string | number) => {
    setProcessingId(enrollmentId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/courses/issue-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: "success",
          text: data.message || `Certificate generated successfully!`,
        });
        if (selectedCourseId) selectCourse(selectedCourseId);
        fetchCourses();
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Failed to generate certificate.",
        });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: (err as Error).message || "Network error occurred.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Bulk Generate Certificates for Selected Students
  const handleGenerateBulk = async () => {
    if (selectedEnrollmentIds.length === 0) return;
    setProcessingId("bulk");
    setActionMessage(null);

    try {
      const res = await fetch("/api/courses/issue-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentIds: selectedEnrollmentIds }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: "success",
          text: `Batch processed: ${data.results?.certificatesCreated ?? 0} certificate(s) generated, ${data.results?.emailsSent ?? 0} email(s) dispatched.`,
        });
        setSelectedEnrollmentIds([]);
        if (selectedCourseId) selectCourse(selectedCourseId);
        fetchCourses();
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Failed to generate certificates.",
        });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: (err as Error).message || "Network error occurred.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Resend Email for existing certificate
  const handleResendEmail = async (enrollmentId: string | number) => {
    setProcessingId(enrollmentId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/courses/issue-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_email", enrollmentId }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: "success",
          text: data.message || "Certificate email resent successfully!",
        });
        if (selectedCourseId) selectCourse(selectedCourseId);
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Failed to resend email.",
        });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: (err as Error).message || "Network error occurred.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="ch-root">
      <style dangerouslySetInnerHTML={{ __html: HUB_STYLES }} />

      {/* ── Page Header ── */}
      <div className="ch-header">
        <div className="ch-header-title-box">
          <div className="ch-header-icon">
            <Award size={24} />
          </div>
          <div>
            <h1 className="ch-title">Course Certificate Hub</h1>
            <p className="ch-subtitle">
              Browse courses by month & year, manage batches, and issue official certificates with 1 click.
            </p>
          </div>
        </div>

        <div className="ch-header-actions">
          <button
            type="button"
            onClick={() => setShowAdjusterModal(true)}
            className="ch-btn ch-btn-outline"
            style={{
              background: "rgba(19, 117, 88, 0.2)",
              borderColor: "rgba(16, 185, 129, 0.4)",
              color: "#34d399",
            }}
            title="Preview live certificate and fine-tune signature sizes/positions"
          >
            <Eye size={16} />
            <span>Preview & Adjust Signatures</span>
          </button>
          <Link
            href="/admin/globals/certificate-settings"
            className="ch-btn ch-btn-outline"
          >
            <ShieldCheck size={16} color={hasGlobalSignatures ? "#10b981" : "#f59e0b"} />
            <span>{hasGlobalSignatures ? "Signatures Configured" : "Upload Signatures"}</span>
          </Link>
          <button
            onClick={() => {
              fetchCourses();
              if (selectedCourseId) selectCourse(selectedCourseId);
            }}
            disabled={loadingCourses || loadingStudents}
            className="ch-btn ch-btn-outline"
          >
            <RefreshCw size={14} className={loadingCourses || loadingStudents ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Global Signatures Banner (if missing) ── */}
      {!hasGlobalSignatures && (
        <div className="ch-banner-warning">
          <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Official Signatures Not Uploaded Yet:</strong> Please upload the 3 signatures once in{" "}
            <Link
              href="/admin/globals/certificate-settings"
              style={{ color: "#fbbf24", textDecoration: "underline", fontWeight: 700 }}
            >
              Certificate Settings & Signatures
            </Link>
            . All generated certificates will automatically inherit them without needing to upload per certificate.
          </div>
        </div>
      )}

      {/* ── Action Notification Message ── */}
      {actionMessage && (
        <div
          className={actionMessage.type === "success" ? "ch-banner-success" : "ch-banner-warning"}
          style={{
            borderColor: actionMessage.type === "success" ? "#10b981" : "#ef4444",
            background: actionMessage.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: actionMessage.type === "success" ? "#34d399" : "#fca5a5",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {actionMessage.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "11px",
              textTransform: "uppercase",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Main Two-Column Layout ── */}
      <div className="ch-layout-grid">
        {/* ── Left Column: Course & Batch Browser (360px) ── */}
        <div className="ch-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <Calendar size={18} color="#10b981" />
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Course Batches ({filteredCourses.length})
            </h2>
          </div>

          {/* Filter Controls: Month, Year, Status */}
          <div className="ch-filter-grid">
            <div>
              <label className="ch-input-label">Filter by Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="ch-select"
              >
                <option value="all">All Years</option>
                {availableYears.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="ch-input-label">Filter by Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="ch-select"
              >
                <option value="all">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input for Courses */}
          <div className="ch-search-wrapper">
            <Search size={14} className="ch-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course or instructor..."
              className="ch-input"
            />
          </div>

          {/* Course Batch Cards List */}
          <div className="ch-course-list">
            {loadingCourses ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#64748b", fontSize: "12px", border: "1px dashed #334155", borderRadius: "10px" }}>
                No courses found matching the selected month/year filter.
              </div>
            ) : (
              filteredCourses.map((c) => {
                const isSelected = selectedCourseId === c.id;
                const percentIssued =
                  c.totalEnrolled > 0 ? Math.round((c.issuedCount / c.totalEnrolled) * 100) : 0;

                return (
                  <div
                    key={c.id}
                    onClick={() => selectCourse(c.id)}
                    className={`ch-course-card ${isSelected ? "active" : ""}`}
                  >
                    <div className="ch-course-card-top">
                      <h3 className="ch-course-card-title">{c.batchName}</h3>
                      <span className="ch-badge ch-badge-active">{c.status}</span>
                    </div>

                    <p className="ch-course-card-subtitle">
                      Instructor: {c.instructorName || "Coding Club CUH"}
                    </p>

                    {/* Progress Bar & Stats */}
                    <div className="ch-course-card-footer">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8" }}>
                        <Users size={13} />
                        <span>{c.totalEnrolled} Enrolled</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                        <span style={{ color: c.issuedCount > 0 ? "#34d399" : "#94a3b8" }}>
                          {c.issuedCount} Issued
                        </span>
                        {c.pendingCount > 0 && (
                          <span style={{ color: "#fbbf24" }}>({c.pendingCount} Pending)</span>
                        )}
                      </div>
                    </div>

                    {c.totalEnrolled > 0 && (
                      <div style={{ width: "100%", background: "#1e293b", height: "5px", borderRadius: "999px", overflow: "hidden", marginTop: "8px" }}>
                        <div
                          style={{
                            background: "#10b981",
                            height: "100%",
                            width: `${percentIssued}%`,
                            borderRadius: "999px",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Column: Selected Batch Student Roster & Issuance Table ── */}
        <div className="ch-card">
          {selectedCourseData ? (
            <>
              {/* Batch Header Bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <span className="ch-badge ch-badge-issued" style={{ marginBottom: "6px" }}>
                    Active Batch
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: "4px 0 2px 0" }}>
                    {selectedCourseData.batchName}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                    {selectedCourseData.department} • Instructor: {selectedCourseData.instructorName}
                  </p>
                </div>

                {/* Summary Metric Badges */}
                <div className="ch-metrics-row">
                  <div className="ch-metric-box">
                    <div className="ch-metric-label">Total</div>
                    <div className="ch-metric-val">{selectedCourseData.totalEnrolled}</div>
                  </div>
                  <div className="ch-metric-box" style={{ background: "rgba(16, 185, 129, 0.12)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                    <div className="ch-metric-label" style={{ color: "#34d399" }}>Issued</div>
                    <div className="ch-metric-val" style={{ color: "#34d399" }}>{selectedCourseData.issuedCount}</div>
                  </div>
                  <div className="ch-metric-box" style={{ background: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.3)" }}>
                    <div className="ch-metric-label" style={{ color: "#fbbf24" }}>Pending</div>
                    <div className="ch-metric-val" style={{ color: "#fbbf24" }}>{selectedCourseData.pendingCount}</div>
                  </div>
                </div>
              </div>

              {/* Student Table Controls: Search, Tabs, Bulk Button */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => setStudentFilter("all")}
                    className={`ch-tab-pill ${studentFilter === "all" ? "active" : ""}`}
                  >
                    All ({students.length})
                  </button>
                  <button
                    onClick={() => setStudentFilter("pending")}
                    className={`ch-tab-pill ${studentFilter === "pending" ? "active-amber" : ""}`}
                  >
                    Pending ({students.filter((s) => !s.hasCertificate).length})
                  </button>
                  <button
                    onClick={() => setStudentFilter("issued")}
                    className={`ch-tab-pill ${studentFilter === "issued" ? "active-emerald" : ""}`}
                  >
                    Issued ({students.filter((s) => s.hasCertificate).length})
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="ch-search-wrapper" style={{ margin: 0, width: "220px" }}>
                    <Search size={14} className="ch-search-icon" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search student or email..."
                      className="ch-input"
                    />
                  </div>

                  {/* Bulk Generate Action Button */}
                  {selectedEnrollmentIds.length > 0 && (
                    <button
                      onClick={handleGenerateBulk}
                      disabled={processingId === "bulk"}
                      className="ch-btn ch-btn-primary"
                    >
                      {processingId === "bulk" ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <GraduationCap size={15} />
                      )}
                      <span>Issue Selected ({selectedEnrollmentIds.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Enrolled Students Table */}
              <div className="ch-table-wrapper">
                <table className="ch-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={
                            filteredStudents.length > 0 &&
                            selectedEnrollmentIds.length === filteredStudents.length
                          }
                          onChange={toggleSelectAll}
                          style={{ cursor: "pointer", width: "15px", height: "15px" }}
                        />
                      </th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Email Notification</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                          Loading students for {selectedCourseData.batchName}...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                          No enrolled students match the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const isProcessing = processingId === s.enrollmentId;
                        const isChecked = selectedEnrollmentIds.includes(s.enrollmentId);

                        return (
                          <tr
                            key={s.enrollmentId}
                            className={isChecked ? "selected" : ""}
                          >
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectStudent(s.enrollmentId)}
                                style={{ cursor: "pointer", width: "15px", height: "15px" }}
                              />
                            </td>

                            <td>
                              <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "13px" }}>
                                {s.studentName}
                              </div>
                              <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>
                                {s.studentEmail || "No registered email"}
                              </div>
                            </td>

                            <td style={{ color: "#cbd5e1" }}>
                              {s.department}
                            </td>

                            <td>
                              {s.hasCertificate ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <span className="ch-badge ch-badge-issued">
                                    <CheckCircle size={11} /> Issued
                                  </span>
                                  <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}>
                                    {s.certificateId}
                                  </span>
                                </div>
                              ) : (
                                <span className="ch-badge ch-badge-pending">
                                  <Clock size={11} /> Pending
                                </span>
                              )}
                            </td>

                            <td>
                              {s.certificateSent ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#34d399", fontSize: "11px", fontWeight: 600 }}>
                                  <Mail size={13} color="#34d399" />
                                  Emailed
                                </span>
                              ) : s.hasCertificate ? (
                                <span style={{ color: "#64748b", fontSize: "11px" }}>Not Sent</span>
                              ) : (
                                <span style={{ color: "#475569", fontSize: "11px" }}>—</span>
                              )}
                            </td>

                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                                {s.hasCertificate ? (
                                  <>
                                    <Link
                                      href={`/certificate/${s.certificateId}`}
                                      target="_blank"
                                      className="ch-btn ch-btn-outline"
                                      style={{ padding: "6px 10px" }}
                                      title="View Official Certificate"
                                    >
                                      <ExternalLink size={13} />
                                      <span>View</span>
                                    </Link>

                                    <button
                                      onClick={() => handleResendEmail(s.enrollmentId)}
                                      disabled={isProcessing}
                                      className="ch-btn ch-btn-outline"
                                      style={{ padding: "6px 10px" }}
                                      title="Resend email from codingclub@cuh.ac.in"
                                    >
                                      {isProcessing ? (
                                        <RefreshCw size={12} className="animate-spin" />
                                      ) : (
                                        <Send size={12} />
                                      )}
                                      <span>Resend</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleGenerateSingle(s.enrollmentId)}
                                    disabled={isProcessing}
                                    className="ch-btn ch-btn-primary"
                                    style={{ padding: "6px 14px" }}
                                  >
                                    {isProcessing ? (
                                      <RefreshCw size={13} className="animate-spin" />
                                    ) : (
                                      <GraduationCap size={14} />
                                    )}
                                    <span>Generate</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
              <GraduationCap size={40} style={{ margin: "0 auto 10px auto", opacity: 0.4 }} />
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Select a Course Batch</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Choose a course on the left to view enrolled students and issue certificates with 1 click.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Signature Adjuster & Preview Modal ── */}
      {showAdjusterModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAdjusterModal(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1320px",
              maxHeight: "94vh",
              overflowY: "auto",
              backgroundColor: "#0b1120",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9)",
              position: "relative",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Eye size={20} color="#34d399" />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  Certificate Live Preview & Signature Sizing Manager
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdjusterModal(false)}
                className="ch-btn ch-btn-outline"
                style={{ padding: "6px 14px", fontWeight: 700, borderColor: "rgba(255,255,255,0.2)" }}
              >
                ✕ Close Modal
              </button>
            </div>
            <SignatureAdjusterPreview />
          </div>
        </div>
      )}
    </div>
  );
}
