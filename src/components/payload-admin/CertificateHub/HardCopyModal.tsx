"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Plus,
} from "lucide-react";

interface HardCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HardCopyModal({
  isOpen,
  onClose,
  onSuccess,
}: HardCopyModalProps) {
  const [certificateId, setCertificateId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [eventName, setEventName] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [department, setDepartment] = useState(
    "Computer Sciences & Information Technology"
  );
  const [course, setCourse] = useState(
    "Master of Computer Applications (M.C.A.)"
  );
  const [semester, setSemester] = useState("1st Semester");
  const [showAcademicDetails, setShowAcademicDetails] = useState(false);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Duplicate check state
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    certificateId: string;
    studentName: string;
    verifyUrl: string;
    viewUrl: string;
  } | null>(null);

  // Clean up preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Check duplicate certificate ID
  const checkDuplicateId = async (idToCheck: string) => {
    const trimmed = idToCheck.trim();
    if (!trimmed) {
      setDuplicateWarning(null);
      return;
    }
    setCheckingDuplicate(true);
    try {
      const res = await fetch(
        `/api/admin/certificates/hard-copy?checkId=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      if (data.exists) {
        setDuplicateWarning(
          `Certificate ID "${trimmed}" is already registered${
            data.matchingCert ? ` (issued to ${data.matchingCert.studentName})` : ""
          }. Please enter a unique certificate number.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      // Ignore network hiccup on passive duplicate check
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage(null);
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");
    const isImage =
      selectedFile.type.startsWith("image/") ||
      selectedFile.name.toLowerCase().endsWith(".jpg") ||
      selectedFile.name.toLowerCase().endsWith(".jpeg") ||
      selectedFile.name.toLowerCase().endsWith(".png") ||
      selectedFile.name.toLowerCase().endsWith(".webp");

    if (!isPdf && !isImage) {
      setErrorMessage(
        "Invalid file type. Please upload a JPG, PNG, WEBP, or PDF certificate document."
      );
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setErrorMessage("File exceeds 25MB maximum limit. Please upload a smaller file.");
      return;
    }

    setFile(selectedFile);
    if (isImage) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleResetForm = () => {
    setCertificateId("");
    setStudentName("");
    setEventName("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setFile(null);
    setFilePreview(null);
    setDuplicateWarning(null);
    setErrorMessage(null);
    setSuccessData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!certificateId.trim()) {
      setErrorMessage("Certificate Number / ID is required.");
      return;
    }
    if (!studentName.trim()) {
      setErrorMessage("Student Name is required.");
      return;
    }
    if (!eventName.trim()) {
      setErrorMessage("Event / Programme Name is required.");
      return;
    }
    if (!issueDate) {
      setErrorMessage("Issue Date is required.");
      return;
    }
    if (!file) {
      setErrorMessage("Please upload the original certificate image or PDF.");
      return;
    }
    if (duplicateWarning) {
      setErrorMessage("Cannot submit: " + duplicateWarning);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("certificateId", certificateId.trim());
      formData.append("studentName", studentName.trim());
      formData.append("eventName", eventName.trim());
      formData.append("issueDate", issueDate);
      formData.append("department", department.trim());
      formData.append("course", course.trim());
      formData.append("semester", semester.trim());
      formData.append("file", file);

      const res = await fetch("/api/admin/certificates/hard-copy", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to upload hard-copy certificate.");
        return;
      }

      setSuccessData({
        certificateId: data.certificate.certificateId,
        studentName: data.certificate.studentName,
        verifyUrl: data.verifyUrl,
        viewUrl: data.viewUrl,
      });

      onSuccess();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Network error during upload."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "92vh",
          overflowY: "auto",
          backgroundColor: "#0b1120",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9)",
          padding: "24px 28px",
          color: "#f8fafc",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #137558 0%, #10b981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                flexShrink: 0,
              }}
            >
              <Upload size={22} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                }}
              >
                Add Hard-Copy Certificate
              </h2>
              <p
                style={{
                  margin: "3px 0 0 0",
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                Upload physical scanned certificates or PDFs into the official verification portal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "6px",
              color: "#94a3b8",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── SUCCESS STATE ── */}
        {successData ? (
          <div style={{ textAlign: "center", padding: "20px 10px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "2px solid #10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#34d399",
                margin: "0 auto 16px auto",
              }}
            >
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
              Certificate Successfully Uploaded & Verified!
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "8px auto 20px auto", maxWidth: "440px" }}>
              Hard-copy certificate for <strong style={{ color: "#ffffff" }}>{successData.studentName}</strong> has been registered under ID:{" "}
              <span style={{ fontFamily: "monospace", color: "#34d399", fontWeight: 700 }}>
                {successData.certificateId}
              </span>
              . Anyone can now verify this certificate online.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <a
                href={successData.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, #137558 0%, #10b981 100%)",
                  color: "#ffffff",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                <ShieldCheck size={16} />
                Test Verification Page ↗
              </a>

              <a
                href={successData.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#e2e8f0",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={15} />
                View in Portal
              </a>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={handleResetForm}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#cbd5e1",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} /> Add Another Hard-Copy Certificate
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "#334155",
                  border: "none",
                  color: "#ffffff",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── FORM ── */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {errorMessage && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#fca5a5",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Grid 1: Certificate Number & Issue Date */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Certificate Number / ID *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    value={certificateId}
                    onChange={(e) => {
                      setCertificateId(e.target.value);
                      if (duplicateWarning) setDuplicateWarning(null);
                    }}
                    onBlur={(e) => checkDuplicateId(e.target.value)}
                    placeholder="e.g. CCCUH-HACK-2024-001"
                    style={{
                      width: "100%",
                      backgroundColor: "#1e293b",
                      border: duplicateWarning
                        ? "1.5px solid #f59e0b"
                        : "1px solid #334155",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {checkingDuplicate && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "10px",
                        color: "#94a3b8",
                      }}
                    />
                  )}
                </div>
                {duplicateWarning ? (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#fbbf24",
                      margin: "4px 0 0 0",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ {duplicateWarning}
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#64748b",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Exact certificate number on physical document.
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    color: "#ffffff",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Grid 2: Student Name & Event / Programme Name */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  style={{
                    width: "100%",
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    color: "#ffffff",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Event / Programme Name *
                </label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Annual Hackathon 2024"
                  style={{
                    width: "100%",
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "9px 12px",
                    color: "#ffffff",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Optional Academic Details Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAcademicDetails(!showAcademicDetails)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: 0,
                }}
              >
                <span>{showAcademicDetails ? "▼" : "▶"}</span>
                <span>Optional Academic Details (Department, Course, Semester)</span>
              </button>

              {showAcademicDetails && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "10px",
                    marginTop: "10px",
                    padding: "12px",
                    backgroundColor: "rgba(30, 41, 59, 0.4)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div>
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        color: "#ffffff",
                        fontSize: "11px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                      Course
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        color: "#ffffff",
                        fontSize: "11px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                      Semester
                    </label>
                    <input
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        color: "#ffffff",
                        fontSize: "11px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* File Upload Zone */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#cbd5e1",
                  marginBottom: "6px",
                }}
              >
                Original Scanned Certificate File (Image or PDF) *
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: isDragOver
                      ? "2px dashed #10b981"
                      : "2px dashed #334155",
                    backgroundColor: isDragOver
                      ? "rgba(16, 185, 129, 0.08)"
                      : "rgba(30, 41, 59, 0.4)",
                    borderRadius: "14px",
                    padding: "28px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px auto",
                      color: "#94a3b8",
                    }}
                  >
                    <Upload size={22} />
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                    Click to browse or drag and drop certificate file
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                    Supports JPG, PNG, WEBP, and PDF documents (up to 25MB)
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "rgba(30, 41, 59, 0.7)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    {filePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "8px",
                          backgroundColor: file.type.includes("pdf") ? "rgba(225, 29, 72, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: file.type.includes("pdf") ? "#fb7185" : "#34d399",
                          flexShrink: 0,
                        }}
                      >
                        {file.type.includes("pdf") ? <FileText size={24} /> : <ImageIcon size={24} />}
                      </div>
                    )}

                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#ffffff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {file.name}
                      </p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.includes("pdf") ? "PDF Document" : "Certificate Image"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "none",
                      color: "#94a3b8",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  background: "transparent",
                  border: "1px solid #334155",
                  color: "#cbd5e1",
                  borderRadius: "9px",
                  padding: "9px 18px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || Boolean(duplicateWarning)}
                style={{
                  background: isSubmitting || Boolean(duplicateWarning)
                    ? "#334155"
                    : "linear-gradient(135deg, #137558 0%, #10b981 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "9px",
                  padding: "9px 22px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: isSubmitting || Boolean(duplicateWarning) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Uploading & Saving...</span>
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    <span>Save Hard-Copy Certificate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
