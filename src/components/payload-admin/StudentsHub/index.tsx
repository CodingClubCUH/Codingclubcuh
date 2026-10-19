"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  RefreshCw,
  GraduationCap,
  BookOpen,
  ExternalLink,
  ChevronRight,
  X,
} from "lucide-react";

interface StudentUser {
  id: string | number;
  name?: string;
  email: string;
  username?: string; // Roll number
  course?: string;
  semester?: string;
  department?: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  enrollmentsCount?: number;
  certificatesCount?: number;
  enrolledCourses?: Array<{ id: string | number; title: string; status: string }>;
  certificates?: Array<{ id: string | number; certificateId: string; courseTitle: string; issueDate: string }>;
}

interface RawUser {
  id: string | number;
  name?: string;
  email?: string;
  username?: string;
  course?: string;
  semester?: string;
  department?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RawEnrollment {
  id: string | number;
  student?: { id: string | number } | string | number | null;
  course?: { id: string | number; title?: string } | string | number | null;
  status?: string;
}

interface RawCertificate {
  id: string | number;
  student?: { id: string | number } | string | number | null;
  certificateId?: string;
  course?: { title?: string } | string | number | null;
  courseTitle?: string;
  issueDate?: string;
  createdAt?: string;
}

interface ClubCourseItem {
  id: string | number;
  title?: string;
  slug?: string;
}

// Normalizes degree casing (e.g. "Bba" -> "BBA")
function formatDegree(degree?: string): string {
  if (!degree || !degree.trim()) return "Not Specified";
  const trimmed = degree.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "bba") return "BBA";
  if (lower === "bca") return "BCA";
  if (lower === "mca") return "MCA";
  if (lower === "b.tech" || lower === "btech") return "B.Tech";
  if (lower === "m.tech" || lower === "mtech") return "M.Tech";
  if (lower.startsWith("msc") || lower.startsWith("m.sc")) {
    return trimmed.replace(/^msc\.?/i, "M.Sc.");
  }
  if (lower.startsWith("ma ") || lower.startsWith("m.a.")) {
    return trimmed.replace(/^ma\.?\s+/i, "M.A. ");
  }
  return trimmed;
}

const STYLES = `
  .sh-root {
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #f1f5f9;
    box-sizing: border-box;
    padding: 4px 0 24px 0;
  }
  .sh-glass {
    background: rgba(15, 17, 26, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }
  .sh-header-card {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 24px 28px;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  }
  .sh-stat-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 16px 20px;
    transition: all 0.2s ease;
  }
  .sh-stat-card:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(59, 130, 246, 0.05);
    transform: translateY(-2px);
  }
  .sh-filter-input {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: #ffffff;
    padding: 9px 14px;
    font-size: 13px;
    outline: none;
    transition: all 0.2s ease;
  }
  .sh-filter-input:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
  }
  .sh-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }
  .sh-btn-primary {
    background: linear-gradient(135deg, #0284c7, #2563eb);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
  }
  .sh-btn-primary:hover {
    background: linear-gradient(135deg, #0369a1, #1d4ed8);
    transform: translateY(-1px);
  }
  .sh-btn-secondary {
    background: rgba(255, 255, 255, 0.07);
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  .sh-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }
  .sh-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  .sh-table th {
    background: rgba(15, 23, 42, 0.95);
    padding: 13px 18px;
    font-size: 11.5px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    text-align: left;
  }
  .sh-table td {
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 13px;
    color: #e2e8f0;
    vertical-align: middle;
  }
  .sh-table tr:hover td {
    background: rgba(56, 189, 248, 0.03);
  }
  .sh-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
  }
  .sh-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(10px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
`;

export default function StudentsHub() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [clubCourses, setClubCourses] = useState<ClubCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("ALL");
  const [selectedClubCourse, setSelectedClubCourse] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);

  // Load all students and related metrics
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersRes = await fetch("/api/users?limit=1000&sort=-createdAt").then((r) => r.json()).catch(() => null);
      const allUsers: RawUser[] = usersRes?.docs || [];

      // 2. Fetch Enrollments
      const enrollmentsRes = await fetch("/api/enrollments?limit=1000&depth=1").then((r) => r.json()).catch(() => null);
      const allEnrollments: RawEnrollment[] = enrollmentsRes?.docs || [];

      // 3. Fetch Certificates
      const certsRes = await fetch("/api/certificates?limit=1000&depth=1").then((r) => r.json()).catch(() => null);
      const allCerts: RawCertificate[] = certsRes?.docs || [];

      // 4. Fetch Actual Club Courses
      const coursesRes = await fetch("/api/courses?limit=100").then((r) => r.json()).catch(() => null);
      const allClubCourses: ClubCourseItem[] = coursesRes?.docs || [];
      setClubCourses(allClubCourses);

      // Filter for students (role === 'student' or all users)
      const mappedStudents: StudentUser[] = allUsers.map((u) => {
        const studentEnrollments = allEnrollments.filter((e) => {
          const sId = typeof e.student === "object" ? e.student?.id : e.student;
          return String(sId) === String(u.id);
        });

        const studentCerts = allCerts.filter((c) => {
          const sId = typeof c.student === "object" ? c.student?.id : c.student;
          return String(sId) === String(u.id);
        });

        return {
          id: u.id,
          name: u.name || "Student",
          email: u.email || "",
          username: u.username || "",
          course: formatDegree(u.course),
          semester: u.semester || "",
          department: u.department || "",
          role: u.role || "student",
          createdAt: u.createdAt || new Date().toISOString(),
          updatedAt: u.updatedAt,
          enrollmentsCount: studentEnrollments.length,
          certificatesCount: studentCerts.length,
          enrolledCourses: studentEnrollments.map((e) => ({
            id: (typeof e.course === "object" ? e.course?.id : e.course) ?? "",
            title: (typeof e.course === "object" ? e.course?.title : undefined) || "Course",
            status: e.status || "enrolled",
          })),
          certificates: studentCerts.map((c) => ({
            id: c.id,
            certificateId: c.certificateId || String(c.id),
            courseTitle: (typeof c.course === "object" ? c.course?.title : c.courseTitle) || "Certificate",
            issueDate: c.issueDate || c.createdAt || "",
          })),
        };
      });

      setStudents(mappedStudents);
    } catch (err) {
      console.error("Failed to load students directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter options derived from data (Normalized Academic Degrees)
  const degreesList = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => {
      const raw = s.course?.trim();
      if (raw && raw !== "Not Specified") {
        const lower = raw.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, raw);
        }
      }
    });
    return Array.from(map.values()).sort();
  }, [students]);

  const semestersList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.semester && s.semester.trim()) set.add(s.semester.trim());
    });
    return Array.from(set).sort();
  }, [students]);

  const yearsList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.createdAt) {
        const y = new Date(s.createdAt).getFullYear();
        if (!isNaN(y)) set.add(String(y));
      }
    });
    return Array.from(set).sort().reverse();
  }, [students]);

  const monthsList = [
    { num: "01", name: "January" },
    { num: "02", name: "February" },
    { num: "03", name: "March" },
    { num: "04", name: "April" },
    { num: "05", name: "May" },
    { num: "06", name: "June" },
    { num: "07", name: "July" },
    { num: "08", name: "August" },
    { num: "09", name: "September" },
    { num: "10", name: "October" },
    { num: "11", name: "November" },
    { num: "12", name: "December" },
  ];

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = s.name?.toLowerCase().includes(q);
        const matchesEmail = s.email?.toLowerCase().includes(q);
        const matchesUsername = s.username?.toLowerCase().includes(q);
        const matchesDept = s.department?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesUsername && !matchesDept) return false;
      }

      // Academic Degree filter (case-insensitive normalized)
      if (selectedDegree !== "ALL") {
        if (s.course?.trim().toLowerCase() !== selectedDegree.toLowerCase()) return false;
      }

      // Club Course filter
      if (selectedClubCourse !== "ALL") {
        if (selectedClubCourse === "ENROLLED") {
          if ((s.enrollmentsCount || 0) === 0) return false;
        } else if (selectedClubCourse === "NOT_ENROLLED") {
          if ((s.enrollmentsCount || 0) > 0) return false;
        } else {
          const match = s.enrolledCourses?.some(
            (c) => String(c.id) === String(selectedClubCourse) || c.title === selectedClubCourse
          );
          if (!match) return false;
        }
      }

      // Semester / Batch filter
      if (selectedSemester !== "ALL" && s.semester?.trim() !== selectedSemester) return false;

      // Year filter
      if (selectedYear !== "ALL") {
        const y = String(new Date(s.createdAt).getFullYear());
        if (y !== selectedYear) return false;
      }

      // Month filter
      if (selectedMonth !== "ALL") {
        const m = String(new Date(s.createdAt).getMonth() + 1).padStart(2, "0");
        if (m !== selectedMonth) return false;
      }

      return true;
    });
  }, [students, search, selectedDegree, selectedClubCourse, selectedSemester, selectedYear, selectedMonth]);

  // Export Filtered Students to CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Roll Number / Username", "Email", "Degree Program", "Semester", "Department", "Role", "Club Courses Enrolled", "Certificates Earned", "Joined Date"];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.name || ""}"`,
      `"${s.username || ""}"`,
      `"${s.email || ""}"`,
      `"${s.course || ""}"`,
      `"${s.semester || ""}"`,
      `"${s.department || ""}"`,
      s.role,
      s.enrollmentsCount || 0,
      s.certificatesCount || 0,
      `"${new Date(s.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `codingclub_students_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="sh-root">
      <style>{STYLES}</style>

      {/* Top Header Card */}
      <div className="sh-header-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 16px rgba(14, 165, 233, 0.4)",
                }}
              >
                <Users size={22} color="#ffffff" />
              </div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
                Student Directory & Academic Roster
              </h1>
            </div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
              Filter, search, and view registered students by academic degree, club course enrollment, batch semester, and join date.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                loadData();
              }}
              className="sh-btn sh-btn-secondary"
              title="Refresh Student List"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExportCSV();
              }}
              className="sh-btn sh-btn-primary"
            >
              <Download size={15} />
              Export CSV ({filteredStudents.length})
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginTop: "24px" }}>
          <div className="sh-stat-card">
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Total Registered Students</div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>
              {students.length}
            </div>
          </div>
          <div className="sh-stat-card">
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Filtered View</div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#a78bfa", marginTop: "4px" }}>
              {filteredStudents.length}
            </div>
          </div>
          <div className="sh-stat-card">
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Coding Club Courses</div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
              {clubCourses.length}
            </div>
          </div>
          <div className="sh-stat-card">
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Enrolled in Club Courses</div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#fbbf24", marginTop: "4px" }}>
              {students.filter((s) => (s.enrollmentsCount || 0) > 0).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="sh-glass" style={{ padding: "18px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "12px", top: "11px" }} />
            <input
              type="text"
              className="sh-filter-input"
              style={{ width: "100%", paddingLeft: "36px" }}
              placeholder="Search by name, roll no, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Coding Club Course Dropdown (Primary Filter) */}
          <div style={{ flex: "1 1 200px" }}>
            <select
              className="sh-filter-input"
              style={{ width: "100%", borderColor: "rgba(56, 189, 248, 0.4)", background: "rgba(15, 23, 42, 0.95)" }}
              value={selectedClubCourse}
              onChange={(e) => setSelectedClubCourse(e.target.value)}
            >
              <option value="ALL">All Club Courses ({clubCourses.length})</option>
              <option value="ENROLLED">Enrolled in Club Courses</option>
              <option value="NOT_ENROLLED">Not Enrolled</option>
              {clubCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  Course: {c.title || `Course #${c.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Degree Dropdown (Normalized) */}
          <div style={{ flex: "1 1 150px" }}>
            <select
              className="sh-filter-input"
              style={{ width: "100%" }}
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
            >
              <option value="ALL">All Degree Programs</option>
              {degreesList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Semester / Batch Dropdown */}
          <div style={{ flex: "1 1 130px" }}>
            <select
              className="sh-filter-input"
              style={{ width: "100%" }}
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="ALL">All Semesters</option>
              {semestersList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div style={{ flex: "1 1 100px" }}>
            <select
              className="sh-filter-input"
              style={{ width: "100%" }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="ALL">All Years</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Dropdown */}
          <div style={{ flex: "1 1 110px" }}>
            <select
              className="sh-filter-input"
              style={{ width: "100%" }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="ALL">All Months</option>
              {monthsList.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(search || selectedDegree !== "ALL" || selectedClubCourse !== "ALL" || selectedSemester !== "ALL" || selectedYear !== "ALL" || selectedMonth !== "ALL") && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSearch("");
                setSelectedDegree("ALL");
                setSelectedClubCourse("ALL");
                setSelectedSemester("ALL");
                setSelectedYear("ALL");
                setSelectedMonth("ALL");
              }}
              className="sh-btn sh-btn-secondary"
              style={{ fontSize: "12px", padding: "6px 10px" }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="sh-glass" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: "0 auto 12px auto", color: "#0ea5e9" }} />
            <div>Loading student directory...</div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
            <Users size={36} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#e2e8f0" }}>No students found</div>
            <div style={{ fontSize: "13px", marginTop: "4px" }}>Try adjusting your search query or filter options.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="sh-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Degree & Semester</th>
                  <th>Department</th>
                  <th>Club Course Enrollment</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(99, 102, 241, 0.25))",
                            border: "1px solid rgba(14, 165, 233, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color: "#38bdf8",
                            fontSize: "14px",
                          }}
                        >
                          {s.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#ffffff" }}>{s.name}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8" }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", color: "#cbd5e1", fontSize: "12.5px" }}>
                        {s.username || "—"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span className="sh-badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                          <GraduationCap size={12} />
                          {s.course || "Not Specified"}
                        </span>
                        {s.semester && (
                          <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>
                            {s.semester}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: "#cbd5e1", fontSize: "12.5px" }}>
                        {s.department || "—"}
                      </span>
                    </td>
                    <td>
                      {s.enrolledCourses && s.enrolledCourses.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {s.enrolledCourses.map((c, i) => (
                            <span
                              key={i}
                              className="sh-badge"
                              style={{
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "#34d399",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                              }}
                            >
                              <BookOpen size={11} /> {c.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Not Enrolled</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                        {new Date(s.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedStudent(s);
                        }}
                        className="sh-btn sh-btn-secondary"
                        style={{ padding: "5px 12px", fontSize: "12px" }}
                      >
                        View Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="sh-modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div
            className="sh-glass"
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "28px",
              position: "relative",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#ffffff",
                  }}
                >
                  {selectedStudent.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
                    {selectedStudent.name}
                  </h2>
                  <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
                    {selectedStudent.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedStudent(null);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Academic Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 14px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Roll Number</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px", fontFamily: "monospace" }}>
                  {selectedStudent.username || "Not assigned"}
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 14px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Degree Program</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                  {selectedStudent.course || "Not specified"}
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 14px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Batch / Semester</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                  {selectedStudent.semester || "Not specified"}
                </div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 14px", borderRadius: "10px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Department</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                  {selectedStudent.department || "Not specified"}
                </div>
              </div>
            </div>

            {/* Club Course Enrollments */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Club Course Enrollments ({selectedStudent.enrolledCourses?.length || 0})
              </div>
              {selectedStudent.enrolledCourses && selectedStudent.enrolledCourses.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedStudent.enrolledCourses.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#34d399", fontSize: "13px" }}>{c.title}</span>
                      <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "capitalize" }}>{c.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#64748b", padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                  No active club course enrollments.
                </div>
              )}
            </div>

            {/* Earned Certificates */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Earned Certificates ({selectedStudent.certificates?.length || 0})
              </div>
              {selectedStudent.certificates && selectedStudent.certificates.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedStudent.certificates.map((cert, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(245, 158, 11, 0.08)",
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "#fbbf24", fontSize: "13px" }}>{cert.courseTitle}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>ID: {cert.certificateId}</div>
                      </div>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#64748b", padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                  No certificates issued yet.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Link
                href={`/student/details?studentId=${selectedStudent.id}`}
                className="sh-btn sh-btn-secondary"
                target="_blank"
                style={{ background: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8' }}
              >
                Edit Academic Details <ExternalLink size={14} />
              </Link>
              <Link
                href={`/admin/collections/users/${selectedStudent.id}`}
                className="sh-btn sh-btn-secondary"
                target="_blank"
              >
                Edit in Admin <ExternalLink size={14} />
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedStudent(null);
                }}
                className="sh-btn sh-btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
