"use client";

import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, ShieldCheck, XCircle, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";

interface MediaObj {
  url?: string;
}

interface SignatureAdjustments {
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

const DEFAULT_SIG_SETTINGS: SignatureAdjustments = {
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

interface CertificateData {
  certificateId: string;
  studentName: string;
  department: string;
  course: string;
  semester: string;
  internship: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  isIssued: boolean;
  signatureInstructor?: MediaObj | null;
  signatureCoordinator?: MediaObj | null;
  signatureStudentCoordinator?: MediaObj | null;
}

function formatDate(dateInput: string) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CertificateView() {
  const params = useParams();
  const certificateId = params.certificateId as string;
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [sigSettings, setSigSettings] = useState<SignatureAdjustments>(DEFAULT_SIG_SETTINGS);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const currentWidth = containerRef.current.offsetWidth;
        const targetWidth = 1123;
        const newScale = Math.min(1, currentWidth / targetWidth);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const res = await fetch(
          `/api/certificates?where[certificateId][equals]=${certificateId}&depth=1`
        );
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          const cert = data.docs[0];
          if (cert.isIssued) {
            try {
              const settingsRes = await fetch("/api/globals/certificate-settings?depth=1");
              if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                if (settingsData) {
                  // Fall back signatures if not explicitly attached to document
                  if (!cert.signatureInstructor && settingsData.signatureInstructor) {
                    cert.signatureInstructor = settingsData.signatureInstructor;
                  }
                  if (!cert.signatureCoordinator && settingsData.signatureCoordinator) {
                    cert.signatureCoordinator = settingsData.signatureCoordinator;
                  }
                  if (!cert.signatureStudentCoordinator && settingsData.signatureStudentCoordinator) {
                    cert.signatureStudentCoordinator = settingsData.signatureStudentCoordinator;
                  }

                  // Load dynamic signature adjustments
                  const globalScale = Number(settingsData.signatureScale) || 130;
                  setSigSettings({
                    signatureBaseHeight: Number(settingsData.signatureBaseHeight) || 95,
                    signatureScale: globalScale,
                    signatureInstructorScale: Number(settingsData.signatureInstructorScale) || globalScale,
                    signatureInstructorOffsetY: Number(settingsData.signatureInstructorOffsetY) || 0,
                    signatureInstructorOffsetX: Number(settingsData.signatureInstructorOffsetX) || 0,
                    signatureCoordinatorScale: Number(settingsData.signatureCoordinatorScale) || globalScale,
                    signatureCoordinatorOffsetY: Number(settingsData.signatureCoordinatorOffsetY) || 0,
                    signatureCoordinatorOffsetX: Number(settingsData.signatureCoordinatorOffsetX) || 0,
                    signatureStudentCoordinatorScale: Number(settingsData.signatureStudentCoordinatorScale) || globalScale,
                    signatureStudentCoordinatorOffsetY: Number(settingsData.signatureStudentCoordinatorOffsetY) || 0,
                    signatureStudentCoordinatorOffsetX: Number(settingsData.signatureStudentCoordinatorOffsetX) || 0,
                  });
                }
              }
            } catch (settingsErr) {
              console.warn("Could not fetch global certificate settings:", settingsErr);
            }
            setCertData(cert);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch certificate", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${certificateId}`
      : `https://codingclubcuh.online/verify/${certificateId}`;

  // Helper to load image as HTMLImageElement
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = src;
    });
  };

  // Ultra-crisp Native 2D Canvas Renderer (2x high-resolution of 1123 x 794 = 2246 x 1588)
  const generateCertificateCanvas = async (): Promise<HTMLCanvasElement> => {
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
    } catch {
      // ignore
    }

    const W = 2246;
    const H = 1588;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // 1. Draw Master Template Background (Matches User's Shared Design 100%)
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

    // 1b. "CERTIFICATE OF COMPLETION" (Emerald Green & Charcoal - Prominent Large Font)
    ctx.textAlign = "center";
    ctx.fillStyle = "#137558";
    ctx.font = "900 126px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
    ctx.letterSpacing = "3px";
    // 1b. "CERTIFICATE OF COMPLETION" (Emerald Green & Charcoal - Prominent Large Font)
    ctx.textAlign = "center";
    ctx.fillStyle = "#137558";
    ctx.font = "900 115px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("CERTIFICATE", W / 2, 390);

    ctx.fillStyle = "#222222";
    ctx.font = "700 42px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("OF COMPLETION", W / 2, 455);

    // 2. Programme Name (in Royal Navy Serif - Bigger Font)
    const programmeTitle = (certData!.internship || certData!.course || "PROFESSIONAL TRAINING PROGRAM").toUpperCase();
    ctx.fillStyle = "#0f2942";
    ctx.font = "800 58px 'Cinzel', 'Playfair Display', Georgia, serif";
    ctx.letterSpacing = "3px";
    ctx.fillText(programmeTitle, W / 2, 560);

    // 3. "This is to certify that" (Bigger Font)
    ctx.fillStyle = "#1e293b";
    ctx.font = "500 32px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
    ctx.letterSpacing = "0px";
    ctx.fillText("This is to certify that", W / 2, 640);

    // 4. Candidate Name (Emerald Green Serif - Bigger Font)
    ctx.fillStyle = "#156b54";
    ctx.font = "700 90px 'Playfair Display', Georgia, serif";
    ctx.fillText(certData!.studentName, W / 2, 730);

    // 5. Decorative Underline with Hollow Beads (Matching Sample o──────────o)
    ctx.save();
    ctx.strokeStyle = "#156b54";
    ctx.lineWidth = 4.8;
    const underlineHalf = Math.max(420, Math.min(660, certData!.studentName.length * 30 + 90));
    ctx.beginPath();
    ctx.moveTo(W / 2 - underlineHalf + 10, 765);
    ctx.lineTo(W / 2 + underlineHalf - 10, 765);
    ctx.stroke();

    // Hollow Circle Left
    ctx.beginPath();
    ctx.arc(W / 2 - underlineHalf, 765, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Hollow Circle Right
    ctx.beginPath();
    ctx.arc(W / 2 + underlineHalf, 765, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 6. Body Paragraph (Bigger Font)
    ctx.fillStyle = "#2d3748";
    ctx.font = "32px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
    const line1 = `has successfully completed a professional training program conducted from ${formatDate(certData!.startDate)} to ${formatDate(certData!.endDate)}. His/Her`;
    const line2 = `dedication and commitment to the learning process are truly commendable`;
    ctx.fillText(line1, W / 2, 855);
    ctx.fillText(line2, W / 2, 905);

    // 7. Awarded on Date (Bigger Font)
    ctx.fillStyle = "#000000";
    ctx.font = "800 32px 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`Awarded on ${formatDate(certData!.issueDate)}`, W / 2, 995);

    // 8. QR Code Centered Below Awarded Text
    const qrSvg = document.querySelector("#certificate-node svg.qr-svg-node") as SVGSVGElement | null;
    let qrImg: HTMLImageElement | null = null;
    if (qrSvg) {
      try {
        const svgXml = new XMLSerializer().serializeToString(qrSvg);
        const svgDataUri = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgXml)));
        qrImg = await loadImage(svgDataUri);
      } catch {
        // ignore
      }
    }

    if (qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
      ctx.drawImage(qrImg, W / 2 - 60, 1100, 120, 120);
    }

    // Certificate ID Below QR Code in Middle
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px 'Consolas', 'Courier New', monospace";
    ctx.letterSpacing = "0.5px";
    ctx.fillText(`Certificate ID: ${certData!.certificateId}`, W / 2, 1255);

    // 9. Signatures (Large, Prominent & Proportional to Custom Adjustments)
    const sigConfigs = [
      {
        obj: certData!.signatureInstructor,
        centerX: 390,
        lineX1: 170,
        lineX2: 610,
        scale: sigSettings.signatureInstructorScale,
        offsetX: sigSettings.signatureInstructorOffsetX,
        offsetY: sigSettings.signatureInstructorOffsetY,
        title: "Convener (Dr. Sunil Kumar)",
      },
      {
        obj: certData!.signatureCoordinator,
        centerX: 1123,
        lineX1: 903,
        lineX2: 1343,
        scale: sigSettings.signatureCoordinatorScale,
        offsetX: sigSettings.signatureCoordinatorOffsetX,
        offsetY: sigSettings.signatureCoordinatorOffsetY,
        title: "Co-convener (Dr. Prithi Maratha)",
      },
      {
        obj: certData!.signatureStudentCoordinator,
        centerX: 1840,
        lineX1: 1620,
        lineX2: 2060,
        scale: sigSettings.signatureStudentCoordinatorScale,
        offsetX: sigSettings.signatureStudentCoordinatorOffsetX,
        offsetY: sigSettings.signatureStudentCoordinatorOffsetY,
        title: "Co-convener (Dr. Nitin Goyal)",
      },
    ];

    for (const sig of sigConfigs) {
      if (sig.obj?.url) {
        try {
          const sImg = await loadImage(sig.obj.url);
          if (sImg.complete && sImg.naturalWidth > 0) {
            const scaleRatio = (sig.scale || 130) / 100;
            const maxW = 240 * 2 * scaleRatio;
            const maxH = (sigSettings.signatureBaseHeight || 95) * 2 * scaleRatio;

            let drawW = sImg.naturalWidth;
            let drawH = sImg.naturalHeight;
            const aspect = drawW / drawH;

            // Fit inside maximum dimensions while maintaining crisp aspect ratio
            if (drawW > maxW) {
              drawW = maxW;
              drawH = drawW / aspect;
            }
            if (drawH > maxH) {
              drawH = maxH;
              drawW = drawH * aspect;
            }

            const drawX = sig.centerX + (sig.offsetX * 2) - (drawW / 2);
            const drawY = 1445 + (sig.offsetY * 2) - drawH - 4;

            ctx.drawImage(sImg, drawX, drawY, drawW, drawH);
          }
        } catch {
          // ignore
        }
      }
      // Line directly above title
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(sig.lineX1, 1445);
      ctx.lineTo(sig.lineX2, 1445);
      ctx.stroke();

      // Designation & Name below line
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 26px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(sig.title, sig.centerX, 1495);
    }

    return canvas;
  };

  // Direct 1-Click PDF Generator
  const downloadPdf = async () => {
    if (!certData) return;
    setIsDownloadingPdf(true);

    try {
      const canvas = await generateCertificateCanvas();
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
      const cleanName = certData.studentName.replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`Certificate_${cleanName}_${certData.certificateId}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to generate PDF: " + (err as Error).message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Direct PNG Image Download
  const downloadPng = async () => {
    if (!certData) return;
    setIsDownloadingPng(true);

    try {
      const canvas = await generateCertificateCanvas();
      const link = document.createElement("a");
      const cleanName = certData.studentName.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `Certificate_${cleanName}_${certData.certificateId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("PNG download failed:", err);
      alert("Failed to generate PNG: " + (err as Error).message);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#137558] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-lg w-full text-center">
          <XCircle className="text-red-500 mx-auto mb-4" size={56} />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Certificate Not Found
          </h2>
          <p className="text-slate-600 mb-6 text-sm">
            This certificate ID is invalid, or the certificate has not been issued yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#137558] text-white font-semibold rounded-lg hover:bg-[#0e5641] transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const programmeName = (certData.internship || certData.course || "PROGRAMME NAME").toUpperCase();

  return (
    <div id="cert-page-wrapper" className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&display=swap');

        @page {
          size: A4 landscape;
          margin: 0 !important;
        }
        @media print {
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, footer, button, .no-print {
            display: none !important;
          }
          #cert-page-wrapper {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            height: 100vh !important;
            overflow: hidden !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            height: 100vh !important;
            overflow: hidden !important;
          }
          #cert-preview-card {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            height: 100vh !important;
            overflow: hidden !important;
          }
          #cert-container {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }
          #cert-scale-wrapper {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            transform: scale(1) !important;
          }
          #certificate-node {
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Top Header Bar (Hidden on print) */}
      <header className="no-print bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-30 shadow-sm gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/student"
            className="text-slate-600 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              CODING CLUB CUH
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Certificate of Completion
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/verify"
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors"
          >
            <ShieldCheck size={15} /> Verify
          </Link>
          <button
            onClick={downloadPng}
            disabled={isDownloadingPng}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-all"
          >
            {isDownloadingPng ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
            Save as PNG
          </button>
          <button
            onClick={downloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 bg-[#137558] hover:bg-[#0e5641] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-sm hover:shadow transition-all"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download size={16} /> Download PDF (1-Click)
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="container mx-auto px-4 py-6 max-w-[1200px]">
        <div
          id="cert-preview-card"
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center"
        >
          {/* Certificate View Container */}
          <div
            ref={containerRef}
            id="cert-container"
            className="relative w-full max-w-[1123px] overflow-hidden rounded-lg shadow-md border border-slate-200 bg-white"
            style={{ height: `${794 * scale}px` }}
          >
            <div
              id="cert-scale-wrapper"
              className="absolute top-0 left-0 origin-top-left"
              style={{
                width: "1123px",
                height: "794px",
                transform: `scale(${scale})`,
              }}
            >
              {/* ══════════════ EXACT MASTER CERTIFICATE (1123 x 794) ══════════════ */}
              <div
                ref={certificateRef}
                id="certificate-node"
                style={{
                  width: "1123px",
                  height: "794px",
                  position: "relative",
                  backgroundImage: "url('/certificate-template-clean.png')",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  color: "#1e293b",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                {/* ── "CERTIFICATE OF COMPLETION" (Prominent Large Font) ── */}
                <div
                  style={{
                    position: "absolute",
                    top: "165px",
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                    zIndex: 10,
                  }}
                >
                  <h2
                    style={{
                      fontSize: "63px",
                      fontWeight: "900",
                      color: "#137558",
                      letterSpacing: "1.5px",
                      margin: 0,
                      lineHeight: 1.05,
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
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
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    OF COMPLETION
                  </p>
                </div>

                {/* ── Dynamic Programme Name (Deep Royal Navy Serif - Bigger Font) ── */}
                <div
                  style={{
                    position: "absolute",
                    top: "262px",
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                    zIndex: 10,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "36px",
                      fontWeight: "800",
                      color: "#0f2942",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      margin: 0,
                      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    }}
                  >
                    {programmeName}
                  </h3>
                </div>

                {/* ── "This is to certify that" (Bigger Font) ── */}
                <div
                  style={{
                    position: "absolute",
                    top: "308px",
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                    zIndex: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: "17px",
                      fontWeight: "500",
                      color: "#1e293b",
                      margin: 0,
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    This is to certify that
                  </p>
                </div>

                {/* ── Dynamic Candidate Name & Decorative Underline (Bigger Font) ── */}
                <div
                  style={{
                    position: "absolute",
                    top: "340px",
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                    zIndex: 10,
                  }}
                >
                  <h4
                    style={{
                      fontSize: "48px",
                      fontWeight: "700",
                      color: "#156b54",
                      letterSpacing: "0.5px",
                      lineHeight: 1.1,
                      margin: 0,
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {certData.studentName}
                  </h4>

                  {/* Decorative Underline with Hollow Beads (o──────────o) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      maxWidth: `${Math.max(420, Math.min(660, certData.studentName.length * 30 + 90))}px`,
                      marginLeft: "auto",
                      marginRight: "auto",
                      marginTop: "6px",
                    }}
                  >
                    <div style={{ width: "9px", height: "9px", borderRadius: "50%", border: "2.4px solid #156b54", flexShrink: 0 }} />
                    <div style={{ height: "2.4px", width: "100%", backgroundColor: "#156b54" }} />
                    <div style={{ width: "9px", height: "9px", borderRadius: "50%", border: "2.4px solid #156b54", flexShrink: 0 }} />
                  </div>
                </div>

                {/* ── Body Paragraph (Bigger Font) ── */}
                <div
                  style={{
                    position: "absolute",
                    top: "418px",
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                    zIndex: 10,
                    paddingLeft: "70px",
                    paddingRight: "70px",
                    boxSizing: "border-box",
                  }}
                >
                  <p
                    style={{
                      fontSize: "16.5px",
                      color: "#2d3748",
                      lineHeight: "1.5",
                      margin: 0,
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    has successfully completed a professional training program conducted from{" "}
                    <strong>{formatDate(certData.startDate)}</strong> to{" "}
                    <strong>{formatDate(certData.endDate)}</strong>. His/Her
                    <br />
                    dedication and commitment to the learning process are truly commendable
                  </p>
                </div>

                {/* ── Awarded on Date (Bigger Font) ── */}
                <div
                  style={{
                    position: "absolute",
                    top: "496px",
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                    zIndex: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: "17px",
                      fontWeight: "800",
                      color: "#000000",
                      margin: 0,
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    Awarded on {formatDate(certData.issueDate)}
                  </p>
                </div>

                {/* ── QR Code Centered Below Awarded Text With Certificate ID ── */}
                <div
                  style={{
                    position: "absolute",
                    top: "542px",
                    left: 0,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 15,
                  }}
                >
                  <QRCodeSVG
                    className="qr-svg-node"
                    value={verifyUrl}
                    size={60}
                    level="M"
                    includeMargin={false}
                  />
                  <p
                    style={{
                      fontSize: "11px",
                      fontFamily: "'Consolas', 'Courier New', monospace",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: "3px 0 0 0",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Certificate ID: {certData.certificateId}
                  </p>
                </div>

                {/* ── Signature Lines & Dynamic Images Above Titles ── */}
                {/* Convener (Dr. Sunil Kumar) (Left: Center at 195px) */}
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
                      height: `${sigSettings.signatureBaseHeight}px`,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: "3px",
                      transform: `translate(${sigSettings.signatureInstructorOffsetX}px, ${sigSettings.signatureInstructorOffsetY}px)`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    {certData.signatureInstructor?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={certData.signatureInstructor.url}
                        alt="Convener Signature"
                        style={{
                          maxHeight: `${Math.round(sigSettings.signatureBaseHeight * (sigSettings.signatureInstructorScale / 100))}px`,
                          maxWidth: `${Math.round(240 * (sigSettings.signatureInstructorScale / 100))}px`,
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ borderTop: "1.8px solid #1e293b", width: "100%" }} />
                  <p
                    style={{
                      fontSize: "14px",
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

                {/* Co-convener (Dr. Prithi Maratha) (Center: Center at 561px) */}
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
                      height: `${sigSettings.signatureBaseHeight}px`,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: "3px",
                      transform: `translate(${sigSettings.signatureCoordinatorOffsetX}px, ${sigSettings.signatureCoordinatorOffsetY}px)`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    {certData.signatureCoordinator?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={certData.signatureCoordinator.url}
                        alt="Co-convener Signature"
                        style={{
                          maxHeight: `${Math.round(sigSettings.signatureBaseHeight * (sigSettings.signatureCoordinatorScale / 100))}px`,
                          maxWidth: `${Math.round(240 * (sigSettings.signatureCoordinatorScale / 100))}px`,
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ borderTop: "1.8px solid #1e293b", width: "100%" }} />
                  <p
                    style={{
                      fontSize: "14px",
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

                {/* Co-convener (Dr. Nitin Goyal) (Right: Center at 920px) */}
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
                      height: `${sigSettings.signatureBaseHeight}px`,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: "3px",
                      transform: `translate(${sigSettings.signatureStudentCoordinatorOffsetX}px, ${sigSettings.signatureStudentCoordinatorOffsetY}px)`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    {certData.signatureStudentCoordinator?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={certData.signatureStudentCoordinator.url}
                        alt="Co-convener Signature"
                        style={{
                          maxHeight: `${Math.round(sigSettings.signatureBaseHeight * (sigSettings.signatureStudentCoordinatorScale / 100))}px`,
                          maxWidth: `${Math.round(240 * (sigSettings.signatureStudentCoordinatorScale / 100))}px`,
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ borderTop: "1.8px solid #1e293b", width: "100%" }} />
                  <p
                    style={{
                      fontSize: "14px",
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
              {/* ══════════════ END CERTIFICATE ══════════════ */}
            </div>
          </div>

          {/* Bottom Action Area (Hidden on print) */}
          <div className="no-print w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-3.5 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Certificate ID: <span className="font-mono font-semibold text-slate-700">{certData.certificateId}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
              >
                <Printer size={15} /> System Print Dialog
              </button>
              <button
                onClick={downloadPng}
                disabled={isDownloadingPng}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
              >
                {isDownloadingPng ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                Download Image (PNG)
              </button>
              <button
                onClick={downloadPdf}
                disabled={isDownloadingPdf}
                className="flex items-center gap-2 bg-[#137558] hover:bg-[#0e5641] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Generating PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Download Official PDF (1-Click)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
