"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Download,
  Eye,
  Sliders,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Move,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import jsPDF from "jspdf";

// Sample fallback handwriting signature SVGs if no media uploaded yet
const SAMPLE_INSTRUCTOR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" fill="none" stroke="%231e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M25 70 C40 30, 50 20, 65 50 C75 75, 85 45, 95 35 C110 20, 115 65, 135 60 C150 55, 160 40, 180 45 C200 50, 210 65, 230 55 C250 45, 270 35, 295 40"/><path d="M50 78 C90 75, 150 78, 280 72"/></svg>`;

const SAMPLE_COORDINATOR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" fill="none" stroke="%231e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 65 L55 25 L75 75 L95 35 L120 60 C135 45, 145 35, 160 55 C175 70, 190 30, 210 45 C230 60, 245 40, 265 50 L290 45"/><path d="M40 82 C100 80, 180 82, 275 79"/></svg>`;

const SAMPLE_STUDENT_COORD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" fill="none" stroke="%231e293b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M35 55 C55 25, 70 70, 90 40 C105 20, 115 60, 135 45 C150 35, 170 55, 190 35 C205 25, 225 50, 250 40 C265 35, 280 45, 295 30"/><path d="M60 75 C110 74, 180 73, 260 76"/></svg>`;

interface SignatureSettingsState {
  signatureBaseHeight: number;
  signatureScale: number;
  signatureInstructorScale: number;
  signatureInstructorOffsetY: number;
  signatureInstructorOffsetX: number;
  signatureCoordinatorScale: number;
  signatureCoordinatorOffsetY: number;
  signatureCoordinatorOffsetX: number;
  signatureStudentCoordinatorScale: number;
  signatureStudentCoordinatorOffsetY: number;
  signatureStudentCoordinatorOffsetX: number;
}

const DEFAULT_SETTINGS: SignatureSettingsState = {
  signatureBaseHeight: 95,
  signatureScale: 130,
  signatureInstructorScale: 130,
  signatureInstructorOffsetY: 0,
  signatureInstructorOffsetX: 0,
  signatureCoordinatorScale: 130,
  signatureCoordinatorOffsetY: 0,
  signatureCoordinatorOffsetX: 0,
  signatureStudentCoordinatorScale: 130,
  signatureStudentCoordinatorOffsetY: 0,
  signatureStudentCoordinatorOffsetX: 0,
};

export default function SignatureAdjusterPreview() {
  const [settings, setSettings] = useState<SignatureSettingsState>(DEFAULT_SETTINGS);
  const [instructorUrl, setInstructorUrl] = useState<string | null>(null);
  const [coordinatorUrl, setCoordinatorUrl] = useState<string | null>(null);
  const [studentCoordinatorUrl, setStudentCoordinatorUrl] = useState<string | null>(null);

  const [zoom, setZoom] = useState<number>(0.85);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch current global settings on mount
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/globals/certificate-settings?depth=1");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          signatureBaseHeight: Number(data.signatureBaseHeight) || 95,
          signatureScale: Number(data.signatureScale) || 130,
          signatureInstructorScale: Number(data.signatureInstructorScale) || Number(data.signatureScale) || 130,
          signatureInstructorOffsetY: Number(data.signatureInstructorOffsetY) || 0,
          signatureInstructorOffsetX: Number(data.signatureInstructorOffsetX) || 0,
          signatureCoordinatorScale: Number(data.signatureCoordinatorScale) || Number(data.signatureScale) || 130,
          signatureCoordinatorOffsetY: Number(data.signatureCoordinatorOffsetY) || 0,
          signatureCoordinatorOffsetX: Number(data.signatureCoordinatorOffsetX) || 0,
          signatureStudentCoordinatorScale: Number(data.signatureStudentCoordinatorScale) || Number(data.signatureScale) || 130,
          signatureStudentCoordinatorOffsetY: Number(data.signatureStudentCoordinatorOffsetY) || 0,
          signatureStudentCoordinatorOffsetX: Number(data.signatureStudentCoordinatorOffsetX) || 0,
        });

        if (data.signatureInstructor?.url) {
          setInstructorUrl(data.signatureInstructor.url);
        }
        if (data.signatureCoordinator?.url) {
          setCoordinatorUrl(data.signatureCoordinator.url);
        }
        if (data.signatureStudentCoordinator?.url) {
          setStudentCoordinatorUrl(data.signatureStudentCoordinator.url);
        }
      }
    } catch (err) {
      console.error("Failed to load certificate settings for preview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save changes to Global certificate-settings
  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/globals/certificate-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          signatureBaseHeight: Math.round(Number(settings.signatureBaseHeight) || 95),
          signatureScale: Math.round(Number(settings.signatureScale) || 130),
          signatureInstructorScale: Math.round(Number(settings.signatureInstructorScale) || 130),
          signatureInstructorOffsetY: Math.round(Number(settings.signatureInstructorOffsetY) || 0),
          signatureInstructorOffsetX: Math.round(Number(settings.signatureInstructorOffsetX) || 0),
          signatureCoordinatorScale: Math.round(Number(settings.signatureCoordinatorScale) || 130),
          signatureCoordinatorOffsetY: Math.round(Number(settings.signatureCoordinatorOffsetY) || 0),
          signatureCoordinatorOffsetX: Math.round(Number(settings.signatureCoordinatorOffsetX) || 0),
          signatureStudentCoordinatorScale: Math.round(Number(settings.signatureStudentCoordinatorScale) || 130),
          signatureStudentCoordinatorOffsetY: Math.round(Number(settings.signatureStudentCoordinatorOffsetY) || 0),
          signatureStudentCoordinatorOffsetX: Math.round(Number(settings.signatureStudentCoordinatorOffsetX) || 0),
        }),
      });

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: "✓ Signature adjustments saved successfully! Changes are immediately live on all generated and viewed certificates.",
        });
        setTimeout(() => setStatusMessage(null), 6000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setStatusMessage({
          type: "error",
          text: errorData.errors?.[0]?.message || "Failed to save settings. Please verify you are logged in as admin.",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: (err as Error).message || "An unexpected network error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Preset size adjustments
  const applyPreset = (preset: "standard" | "large" | "prominent" | "compact") => {
    switch (preset) {
      case "standard":
        setSettings((prev) => ({
          ...prev,
          signatureBaseHeight: 85,
          signatureScale: 100,
          signatureInstructorScale: 100,
          signatureInstructorOffsetY: 0,
          signatureCoordinatorScale: 100,
          signatureCoordinatorOffsetY: 0,
          signatureStudentCoordinatorScale: 100,
          signatureStudentCoordinatorOffsetY: 0,
        }));
        break;
      case "large": // Recommended
        setSettings((prev) => ({
          ...prev,
          signatureBaseHeight: 95,
          signatureScale: 130,
          signatureInstructorScale: 130,
          signatureInstructorOffsetY: 0,
          signatureCoordinatorScale: 130,
          signatureCoordinatorOffsetY: 0,
          signatureStudentCoordinatorScale: 130,
          signatureStudentCoordinatorOffsetY: 0,
        }));
        break;
      case "prominent": // Extra large
        setSettings((prev) => ({
          ...prev,
          signatureBaseHeight: 110,
          signatureScale: 155,
          signatureInstructorScale: 155,
          signatureInstructorOffsetY: 2,
          signatureCoordinatorScale: 155,
          signatureCoordinatorOffsetY: 2,
          signatureStudentCoordinatorScale: 155,
          signatureStudentCoordinatorOffsetY: 2,
        }));
        break;
      case "compact":
        setSettings((prev) => ({
          ...prev,
          signatureBaseHeight: 76,
          signatureScale: 90,
          signatureInstructorScale: 90,
          signatureInstructorOffsetY: 0,
          signatureCoordinatorScale: 90,
          signatureCoordinatorOffsetY: 0,
          signatureStudentCoordinatorScale: 90,
          signatureStudentCoordinatorOffsetY: 0,
        }));
        break;
    }
  };

  // Helper to load image for canvas export
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = src;
    });
  };

  // Download test certificate canvas
  const handleTestDownload = async (format: "pdf" | "png") => {
    setIsExporting(true);
    try {
      const W = 2246;
      const H = 1588;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Background template
      try {
        const bgImg = await loadImage("/certificate-template-clean.png");
        if (bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.drawImage(bgImg, 0, 0, W, H);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, W, H);
        }
      } catch {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
      }

      // Title & sample content
      ctx.textAlign = "center";
      ctx.fillStyle = "#137558";
      ctx.font = "900 115px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.fillText("CERTIFICATE", W / 2, 390);

      ctx.fillStyle = "#222222";
      ctx.font = "700 42px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.fillText("OF COMPLETION", W / 2, 455);

      ctx.fillStyle = "#0f2942";
      ctx.font = "800 58px Georgia, serif";
      ctx.fillText("PROGRAMMING IN C", W / 2, 560);

      ctx.fillStyle = "#1e293b";
      ctx.font = "500 32px Arial, sans-serif";
      ctx.fillText("This is to certify that", W / 2, 640);

      ctx.fillStyle = "#156b54";
      ctx.font = "700 90px Georgia, serif";
      ctx.fillText("Ajay Sharma", W / 2, 730);

      ctx.fillStyle = "#2d3748";
      ctx.font = "32px Arial, sans-serif";
      ctx.fillText("has successfully completed a professional training program. His/Her", W / 2, 855);
      ctx.fillText("dedication and commitment to the learning process are truly commendable", W / 2, 905);

      ctx.fillStyle = "#000000";
      ctx.font = "800 32px Arial, sans-serif";
      ctx.fillText("Awarded on 27 September 2026", W / 2, 995);

      // Signatures
      const sigList = [
        {
          src: instructorUrl || SAMPLE_INSTRUCTOR_SVG,
          centerX: 390,
          lineX1: 170,
          lineX2: 610,
          scale: settings.signatureInstructorScale,
          offsetX: settings.signatureInstructorOffsetX,
          offsetY: settings.signatureInstructorOffsetY,
          title: "Convener (Dr. Sunil Kumar)",
        },
        {
          src: coordinatorUrl || SAMPLE_COORDINATOR_SVG,
          centerX: 1123,
          lineX1: 903,
          lineX2: 1343,
          scale: settings.signatureCoordinatorScale,
          offsetX: settings.signatureCoordinatorOffsetX,
          offsetY: settings.signatureCoordinatorOffsetY,
          title: "Co-convener (Dr. Prithi Maratha)",
        },
        {
          src: studentCoordinatorUrl || SAMPLE_STUDENT_COORD_SVG,
          centerX: 1840,
          lineX1: 1620,
          lineX2: 2060,
          scale: settings.signatureStudentCoordinatorScale,
          offsetX: settings.signatureStudentCoordinatorOffsetX,
          offsetY: settings.signatureStudentCoordinatorOffsetY,
          title: "Co-convener (Dr. Nitin Goyal)",
        },
      ];

      for (const sig of sigList) {
        if (sig.src) {
          try {
            const sImg = await loadImage(sig.src);
            if (sImg.complete && sImg.naturalWidth > 0) {
              const scaleRatio = (sig.scale || 130) / 100;
              const maxW = 240 * 2 * scaleRatio;
              const maxH = (settings.signatureBaseHeight || 95) * 2 * scaleRatio;

              let drawW = sImg.naturalWidth;
              let drawH = sImg.naturalHeight;
              const aspect = drawW / drawH;

              if (drawW > maxW) {
                drawW = maxW;
                drawH = drawW / aspect;
              }
              if (drawH > maxH) {
                drawH = maxH;
                drawW = drawH * aspect;
              }

              const drawX = sig.centerX + sig.offsetX * 2 - drawW / 2;
              const drawY = 1445 + sig.offsetY * 2 - drawH - 4;

              ctx.drawImage(sImg, drawX, drawY, drawW, drawH);
            }
          } catch {
            // ignore
          }
        }
        // Underline
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(sig.lineX1, 1445);
        ctx.lineTo(sig.lineX2, 1445);
        ctx.stroke();

        // Title below underline
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 26px 'Plus Jakarta Sans', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sig.title, sig.centerX, 1495);
      }

      if (format === "pdf") {
        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
        pdf.save("Sample_Certificate_Preview.pdf");
      } else {
        const link = document.createElement("a");
        link.download = "Sample_Certificate_Preview.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } catch (err) {
      alert("Failed to export sample preview: " + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="sap-wrapper">
      <style>{`
        .sap-wrapper {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #f8fafc;
          box-sizing: border-box;
          margin-bottom: 28px;
        }
        .sap-card {
          background: #0b1120;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.5);
        }
        .sap-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 20px;
        }
        .sap-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sap-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #137558 0%, #10b981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
        }
        .sap-btn-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .sap-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .sap-btn-primary {
          background: linear-gradient(135deg, #137558 0%, #059669 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(19, 117, 88, 0.35);
        }
        .sap-btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .sap-btn-secondary {
          background: #1e293b;
          color: #e2e8f0;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .sap-btn-secondary:hover {
          background: #334155;
          color: #ffffff;
        }
        .sap-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .sap-controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 22px;
        }
        .sap-panel {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
        }
        .sap-panel-title {
          font-size: 13px;
          font-weight: 700;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sap-input-group {
          margin-bottom: 14px;
        }
        .sap-input-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .sap-slider {
          width: 100%;
          accent-color: #10b981;
          cursor: pointer;
        }
        .sap-preview-stage {
          background: #020617;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-x: auto;
          position: relative;
        }
        .sap-stage-toolbar {
          width: 100%;
          max-width: 1123px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }
      `}</style>

      <div className="sap-card">
        {/* Header */}
        <div className="sap-header">
          <div className="sap-title-group">
            <div className="sap-icon-badge">
              <Eye size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "#ffffff" }}>
                Interactive Certificate & Signature Adjuster
              </h2>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "3px 0 0 0" }}>
                Live visual preview — adjust signature size, height, and alignment above the lines in real time.
              </p>
            </div>
          </div>

          <div className="sap-btn-group">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="sap-btn sap-btn-secondary"
              title="Reload latest settings and signature media from server"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => handleTestDownload("png")}
              disabled={isExporting}
              className="sap-btn sap-btn-secondary"
            >
              <ImageIcon size={14} />
              Sample PNG
            </button>
            <button
              type="button"
              onClick={() => handleTestDownload("pdf")}
              disabled={isExporting}
              className="sap-btn sap-btn-secondary"
            >
              <Download size={14} />
              Sample PDF
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="sap-btn sap-btn-primary"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Adjustments
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              fontWeight: "600",
              backgroundColor: statusMessage.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: statusMessage.type === "success" ? "#34d399" : "#f87171",
              border: `1px solid ${statusMessage.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            {statusMessage.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Quick Presets Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            background: "rgba(15, 23, 42, 0.8)",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "18px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} style={{ color: "#38bdf8" }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>Quick Presets:</span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => applyPreset("standard")}
              className="sap-btn sap-btn-secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Standard (100%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("large")}
              className="sap-btn sap-btn-primary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              ★ Recommended Large (130%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("prominent")}
              className="sap-btn sap-btn-secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Prominent (155%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("compact")}
              className="sap-btn sap-btn-secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Compact (90%)
            </button>
          </div>
        </div>

        {/* Adjustment Sliders Grid */}
        <div className="sap-controls-grid">
          {/* Global / Base Settings */}
          <div className="sap-panel">
            <div className="sap-panel-title">
              <Sliders size={14} />
              Global Size Scaling
            </div>

            <div className="sap-input-group">
              <div className="sap-input-label">
                <span>Default Global Scale</span>
                <strong style={{ color: "#34d399" }}>{settings.signatureScale}%</strong>
              </div>
              <input
                type="range"
                min="60"
                max="220"
                step="5"
                value={settings.signatureScale}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSettings((prev) => ({
                    ...prev,
                    signatureScale: val,
                    signatureInstructorScale: val,
                    signatureCoordinatorScale: val,
                    signatureStudentCoordinatorScale: val,
                  }));
                }}
                className="sap-slider"
              />
            </div>

            <div className="sap-input-group">
              <div className="sap-input-label">
                <span>Signature Base Box Height</span>
                <strong style={{ color: "#38bdf8" }}>{settings.signatureBaseHeight}px</strong>
              </div>
              <input
                type="range"
                min="60"
                max="140"
                step="2"
                value={settings.signatureBaseHeight}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureBaseHeight: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>
            <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
              Adjusts the vertical signature area height above each underline.
            </p>
          </div>

          {/* Convener Controls */}
          <div className="sap-panel">
            <div className="sap-panel-title" style={{ color: "#a78bfa" }}>
              <Move size={14} />
              Convener — Dr. Sunil Kumar (Left)
            </div>

            <div className="sap-input-group">
              <div className="sap-input-label">
                <span>Scale</span>
                <strong style={{ color: "#a78bfa" }}>{settings.signatureInstructorScale}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={settings.signatureInstructorScale}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureInstructorScale: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>

            <div className="sap-input-group">
              <div className="sap-input-label">
                <span>Vertical Offset (Y)</span>
                <strong style={{ color: "#a78bfa" }}>
                  {settings.signatureInstructorOffsetY > 0 ? `+${settings.signatureInstructorOffsetY}px` : `${settings.signatureInstructorOffsetY}px`}
                </strong>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={settings.signatureInstructorOffsetY}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureInstructorOffsetY: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>

            <div className="sap-input-group" style={{ marginBottom: 0 }}>
              <div className="sap-input-label">
                <span>Horizontal Offset (X)</span>
                <strong style={{ color: "#a78bfa" }}>
                  {settings.signatureInstructorOffsetX > 0 ? `+${settings.signatureInstructorOffsetX}px` : `${settings.signatureInstructorOffsetX}px`}
                </strong>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="1"
                value={settings.signatureInstructorOffsetX}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureInstructorOffsetX: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>
          </div>

          {/* Co-convener (Dr. Prithi Maratha) Controls */}
          <div className="sap-panel">
            <div className="sap-panel-title" style={{ color: "#38bdf8" }}>
              <Move size={14} />
              Co-convener — Dr. Prithi Maratha (Center)
            </div>

            <div className="sap-input-group">
              <div className="sap-input-label">
                <span>Scale</span>
                <strong style={{ color: "#38bdf8" }}>{settings.signatureCoordinatorScale}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={settings.signatureCoordinatorScale}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureCoordinatorScale: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>

            <div className="sap-input-group">
              <div className="sap-input-label">
                <span>Vertical Offset (Y)</span>
                <strong style={{ color: "#38bdf8" }}>
                  {settings.signatureCoordinatorOffsetY > 0 ? `+${settings.signatureCoordinatorOffsetY}px` : `${settings.signatureCoordinatorOffsetY}px`}
                </strong>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={settings.signatureCoordinatorOffsetY}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureCoordinatorOffsetY: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>

            <div className="sap-input-group" style={{ marginBottom: 0 }}>
              <div className="sap-input-label">
                <span>Horizontal Offset (X)</span>
                <strong style={{ color: "#38bdf8" }}>
                  {settings.signatureCoordinatorOffsetX > 0 ? `+${settings.signatureCoordinatorOffsetX}px` : `${settings.signatureCoordinatorOffsetX}px`}
                </strong>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="1"
                value={settings.signatureCoordinatorOffsetX}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureCoordinatorOffsetX: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>
          </div>

          {/* Co-convener (Dr. Nitin Goyal) Controls */}
          <div className="sap-panel">
            <div className="sap-panel-title" style={{ color: "#f59e0b" }}>
              <Move size={14} />
              Co-convener — Dr. Nitin Goyal (Right)
            </div>

            <div className="sap-input-group">
              <div className="sap-input-label">
                <span>Scale</span>
                <strong style={{ color: "#f59e0b" }}>{settings.signatureStudentCoordinatorScale}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="5"
                value={settings.signatureStudentCoordinatorScale}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureStudentCoordinatorScale: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>

            <div className="sap-input-group">
              <div className="sap-input-label">
                <span>Vertical Offset (Y)</span>
                <strong style={{ color: "#f59e0b" }}>
                  {settings.signatureStudentCoordinatorOffsetY > 0 ? `+${settings.signatureStudentCoordinatorOffsetY}px` : `${settings.signatureStudentCoordinatorOffsetY}px`}
                </strong>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={settings.signatureStudentCoordinatorOffsetY}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureStudentCoordinatorOffsetY: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>

            <div className="sap-input-group" style={{ marginBottom: 0 }}>
              <div className="sap-input-label">
                <span>Horizontal Offset (X)</span>
                <strong style={{ color: "#f59e0b" }}>
                  {settings.signatureStudentCoordinatorOffsetX > 0 ? `+${settings.signatureStudentCoordinatorOffsetX}px` : `${settings.signatureStudentCoordinatorOffsetX}px`}
                </strong>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="1"
                value={settings.signatureStudentCoordinatorOffsetX}
                onChange={(e) => setSettings((prev) => ({ ...prev, signatureStudentCoordinatorOffsetX: Number(e.target.value) }))}
                className="sap-slider"
              />
            </div>
          </div>
        </div>

        {/* Live Certificate Canvas Preview Stage */}
        <div className="sap-preview-stage">
          {/* Stage Toolbar */}
          <div className="sap-stage-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff" }}>Certificate Live Preview</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background: instructorUrl || coordinatorUrl || studentCoordinatorUrl ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                  color: instructorUrl || coordinatorUrl || studentCoordinatorUrl ? "#34d399" : "#fbbf24",
                  fontWeight: "600",
                }}
              >
                {instructorUrl || coordinatorUrl || studentCoordinatorUrl ? "✓ Using Uploaded Official Signatures" : "Notice: Sample Signatures (Upload in fields below)"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94a3b8", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                  style={{ accentColor: "#10b981" }}
                />
                Show Alignment Guides
              </label>

              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#1e293b", padding: "3px 6px", borderRadius: "8px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", marginRight: "4px" }}>Zoom:</span>
                {[0.65, 0.8, 0.95].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoom(z)}
                    style={{
                      background: zoom === z ? "#334155" : "transparent",
                      color: zoom === z ? "#ffffff" : "#94a3b8",
                      border: "none",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {Math.round(z * 100)}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate Scaled Frame */}
          <div
            ref={containerRef}
            style={{
              width: `${1123 * zoom}px`,
              height: `${794 * zoom}px`,
              position: "relative",
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backgroundColor: "#ffffff",
            }}
          >
            <div
              style={{
                width: "1123px",
                height: "794px",
                position: "absolute",
                top: 0,
                left: 0,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                backgroundImage: "url('/certificate-template-clean.png')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                color: "#1e293b",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Header Title */}
              <div style={{ position: "absolute", top: "165px", left: 0, width: "100%", textAlign: "center" }}>
                <h2
                  style={{
                    fontSize: "63px",
                    fontWeight: "900",
                    color: "#137558",
                    letterSpacing: "1.5px",
                    margin: 0,
                    lineHeight: 1.05,
                    fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
                  }}
                >
                  CERTIFICATE
                </h2>
                <p
                  style={{
                    fontSize: "23px",
                    fontWeight: "700",
                    color: "#222222",
                    letterSpacing: "3px",
                    margin: "4px 0 0 0",
                    fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
                  }}
                >
                  OF COMPLETION
                </p>
              </div>

              {/* Programme Name */}
              <div style={{ position: "absolute", top: "260px", left: 0, width: "100%", textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "30px",
                    fontWeight: "800",
                    color: "#0f2942",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    margin: 0,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  PROGRAMMING IN C
                </h3>
              </div>

              {/* "This is to certify that" */}
              <div style={{ position: "absolute", top: "308px", left: 0, width: "100%", textAlign: "center" }}>
                <p style={{ fontSize: "17px", fontWeight: "500", color: "#1e293b", margin: 0 }}>
                  This is to certify that
                </p>
              </div>

              {/* Candidate Name */}
              <div style={{ position: "absolute", top: "340px", left: 0, width: "100%", textAlign: "center" }}>
                <h4 style={{ fontSize: "48px", fontWeight: "700", color: "#156b54", margin: 0, fontFamily: "Georgia, serif" }}>
                  Ajay Sharma
                </h4>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    width: "320px",
                    margin: "6px auto 0",
                  }}
                >
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", border: "2.4px solid #156b54" }} />
                  <div style={{ height: "2.4px", width: "100%", backgroundColor: "#156b54" }} />
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", border: "2.4px solid #156b54" }} />
                </div>
              </div>

              {/* Body Text */}
              <div style={{ position: "absolute", top: "418px", left: 0, width: "100%", textAlign: "center", padding: "0 70px" }}>
                <p style={{ fontSize: "16px", color: "#2d3748", lineHeight: "1.5", margin: 0 }}>
                  has successfully completed a professional training program conducted from{" "}
                  <strong>9 September 2026</strong> to <strong>29 September 2026</strong>. His/Her
                  <br />
                  dedication and commitment to the learning process are truly commendable
                </p>
              </div>

              {/* Awarded Date */}
              <div style={{ position: "absolute", top: "486px", left: 0, width: "100%", textAlign: "center" }}>
                <p style={{ fontSize: "17px", fontWeight: "800", color: "#000000", margin: 0 }}>
                  Awarded on 27 September 2026
                </p>
              </div>

              {/* QR Code & ID */}
              <div style={{ position: "absolute", top: "522px", left: 0, width: "100%", textAlign: "center" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    margin: "0 auto",
                    border: "2px solid #0f172a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    fontWeight: "700",
                    background: "#ffffff",
                  }}
                >
                  QR CODE
                </div>
                <p style={{ fontSize: "11px", fontWeight: "700", fontFamily: "monospace", margin: "4px 0 0 0" }}>
                  Certificate ID: CCCUH-CRS-2026-9575
                </p>
              </div>

              {/* ──────────────────────────────────────────────────────────── */}
              {/* Signatures Row */}
              {/* ──────────────────────────────────────────────────────────── */}

              {/* 1. Convener (Dr. Sunil Kumar) (Left: 75px, width 240px) */}
              <div
                style={{
                  position: "absolute",
                  bottom: "40px",
                  left: "75px",
                  width: "240px",
                  textAlign: "center",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    height: `${settings.signatureBaseHeight}px`,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: "3px",
                    transform: `translate(${settings.signatureInstructorOffsetX}px, ${settings.signatureInstructorOffsetY}px)`,
                    transformOrigin: "bottom center",
                    border: showGuides ? "1px dashed rgba(167, 139, 250, 0.6)" : "none",
                    borderRadius: "4px",
                    backgroundColor: showGuides ? "rgba(167, 139, 250, 0.05)" : "transparent",
                    position: "relative",
                  }}
                >
                  {showGuides && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-14px",
                        left: "4px",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#7c3aed",
                        background: "#ede9fe",
                        padding: "1px 4px",
                        borderRadius: "3px",
                      }}
                    >
                      {settings.signatureInstructorScale}%
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={instructorUrl || SAMPLE_INSTRUCTOR_SVG}
                    alt="Convener Signature"
                    style={{
                      maxHeight: `${Math.round(settings.signatureBaseHeight * (settings.signatureInstructorScale / 100))}px`,
                      maxWidth: `${Math.round(240 * (settings.signatureInstructorScale / 100))}px`,
                      objectFit: "contain",
                      transition: "all 0.1s ease",
                    }}
                  />
                </div>
                <div style={{ borderTop: "1.8px solid #1e293b", width: "100%" }} />
                <p
                  style={{
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: "#0f172a",
                    margin: "7px 0 0 0",
                    letterSpacing: "0.2px",
                    whiteSpace: "nowrap",
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  }}
                >
                  Convener (Dr. Sunil Kumar)
                </p>
              </div>

              {/* 2. Co-convener (Dr. Prithi Maratha) (Middle: 441px, width 240px) */}
              <div
                style={{
                  position: "absolute",
                  bottom: "40px",
                  left: "441px",
                  width: "240px",
                  textAlign: "center",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    height: `${settings.signatureBaseHeight}px`,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: "3px",
                    transform: `translate(${settings.signatureCoordinatorOffsetX}px, ${settings.signatureCoordinatorOffsetY}px)`,
                    transformOrigin: "bottom center",
                    border: showGuides ? "1px dashed rgba(56, 189, 248, 0.6)" : "none",
                    borderRadius: "4px",
                    backgroundColor: showGuides ? "rgba(56, 189, 248, 0.05)" : "transparent",
                    position: "relative",
                  }}
                >
                  {showGuides && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-14px",
                        left: "4px",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#0284c7",
                        background: "#e0f2fe",
                        padding: "1px 4px",
                        borderRadius: "3px",
                      }}
                    >
                      {settings.signatureCoordinatorScale}%
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coordinatorUrl || SAMPLE_COORDINATOR_SVG}
                    alt="Co-convener Signature"
                    style={{
                      maxHeight: `${Math.round(settings.signatureBaseHeight * (settings.signatureCoordinatorScale / 100))}px`,
                      maxWidth: `${Math.round(240 * (settings.signatureCoordinatorScale / 100))}px`,
                      objectFit: "contain",
                      transition: "all 0.1s ease",
                    }}
                  />
                </div>
                <div style={{ borderTop: "1.8px solid #1e293b", width: "100%" }} />
                <p
                  style={{
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: "#0f172a",
                    margin: "7px 0 0 0",
                    letterSpacing: "0.2px",
                    whiteSpace: "nowrap",
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  }}
                >
                  Co-convener (Dr. Prithi Maratha)
                </p>
              </div>

              {/* 3. Co-convener (Dr. Nitin Goyal) (Right: 800px, width 240px) */}
              <div
                style={{
                  position: "absolute",
                  bottom: "40px",
                  left: "800px",
                  width: "240px",
                  textAlign: "center",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    height: `${settings.signatureBaseHeight}px`,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: "3px",
                    transform: `translate(${settings.signatureStudentCoordinatorOffsetX}px, ${settings.signatureStudentCoordinatorOffsetY}px)`,
                    transformOrigin: "bottom center",
                    border: showGuides ? "1px dashed rgba(245, 158, 11, 0.6)" : "none",
                    borderRadius: "4px",
                    backgroundColor: showGuides ? "rgba(245, 158, 11, 0.05)" : "transparent",
                    position: "relative",
                  }}
                >
                  {showGuides && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-14px",
                        left: "4px",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#d97706",
                        background: "#fef3c7",
                        padding: "1px 4px",
                        borderRadius: "3px",
                      }}
                    >
                      {settings.signatureStudentCoordinatorScale}%
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={studentCoordinatorUrl || SAMPLE_STUDENT_COORD_SVG}
                    alt="Co-convener Signature"
                    style={{
                      maxHeight: `${Math.round(settings.signatureBaseHeight * (settings.signatureStudentCoordinatorScale / 100))}px`,
                      maxWidth: `${Math.round(240 * (settings.signatureStudentCoordinatorScale / 100))}px`,
                      objectFit: "contain",
                      transition: "all 0.1s ease",
                    }}
                  />
                </div>
                <div style={{ borderTop: "1.8px solid #1e293b", width: "100%" }} />
                <p
                  style={{
                    fontSize: "12.5px",
                    fontWeight: "700",
                    color: "#0f172a",
                    margin: "7px 0 0 0",
                    letterSpacing: "0.2px",
                    whiteSpace: "nowrap",
                    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                  }}
                >
                  Co-convener (Dr. Nitin Goyal)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
