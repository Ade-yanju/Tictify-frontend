/* ═══════════════════════════════════════════════════════
   PaymentPending.jsx  — Tictify 2026 Redesign
═══════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#080910; --card:rgba(255,255,255,0.04); --border:rgba(255,255,255,0.08);
    --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12);
    --text:#F0EDE8; --muted:#7A7870; --danger:#E05C5C; --live:#6BF0A0; --warn:#E8B44A;
    --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif; --r:24px; --r-sm:12px;
  }
  html { font-size:16px; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; }
  button { font-family:var(--font-b); outline:none; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes ping {
    0% { transform:scale(1); opacity:.8; }
    70%,100% { transform:scale(2.2); opacity:0; }
  }
  @keyframes dash {
    to { stroke-dashoffset: 0; }
  }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none !important; } }
`;

const MAX_ATTEMPTS = 20;
const POLL_INTERVAL = 3000;

export default function PaymentPending() {
  injectStyles("tictify-base", BASE_CSS);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("ref");
  const touchStartX = useRef(0);

  const [status, setStatus] = useState(() => !reference ? "ERROR" : "PENDING");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState(() => !reference ? "Invalid or missing payment reference." : "Securely verifying your payment…");
  const isLocked = status === "PENDING";

  useEffect(() => {
    if (isLocked) return;
    const start = e => (touchStartX.current = e.touches[0].clientX);
    const end = e => { if (e.changedTouches[0].clientX - touchStartX.current > 80) navigate(-1); };
    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => { window.removeEventListener("touchstart", start); window.removeEventListener("touchend", end); };
  }, [navigate, isLocked]);

  useEffect(() => {
    if (!reference) return;

    const interval = setInterval(async () => {
      setAttempts(prev => {
        const next = prev + 1;
        if (next >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("ERROR");
          setMessage("Verification is taking longer than expected. Your payment may still be processing.");
        }
        return next;
      });

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/status/${reference}`);
        const data = await res.json();
        if (data.status === "SUCCESS") { clearInterval(interval); navigate(`/success?ref=${reference}`, { replace: true }); return; }
        if (data.status === "FAILED") { clearInterval(interval); setStatus("FAILED"); setMessage("Your payment could not be confirmed. Please try again."); }
      } catch {
        // polling continues
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [reference, navigate]);

  const progressPct = Math.min((attempts / MAX_ATTEMPTS) * 100, 100);

  return (
    <div style={{
      minHeight: "100svh", background: "var(--bg)",
      display: "grid", placeItems: "center",
      padding: "clamp(16px,5vw,40px)",
      fontFamily: "var(--font-b)",
    }}>
      <div style={{
        width: "min(100%, 460px)",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r)",
        padding: "clamp(32px,7vw,52px) clamp(24px,5vw,44px)",
        textAlign: "center",
        animation: "fadeUp .4s ease",
        boxShadow: "0 32px 80px rgba(0,0,0,.5)",
      }}>

        {/* PENDING */}
        {status === "PENDING" && (
          <>
            {/* Pulsing ring indicator */}
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 32px" }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "var(--gold-dim)", animation: "ping 1.8s ease infinite",
              }} />
              <div style={{
                position: "absolute", inset: 8, borderRadius: "50%",
                border: "3px solid var(--border)", borderTopColor: "var(--gold)",
                animation: "spin 1s linear infinite",
              }} />
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
              }}>🔐</div>
            </div>

            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
              textTransform: "uppercase", color: "var(--gold)",
              fontFamily: "var(--font-h)", marginBottom: 12,
            }}>
              Processing Payment
            </p>
            <h2 style={{
              fontFamily: "var(--font-h)", fontSize: "clamp(22px,4vw,28px)",
              fontWeight: 800, letterSpacing: "-.02em", marginBottom: 12,
            }}>
              Confirming your order
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 32 }}>
              {message}
            </p>

            {/* Progress bar */}
            <div style={{
              height: 4, background: "var(--border)", borderRadius: 4,
              overflow: "hidden", marginBottom: 12,
            }}>
              <div style={{
                height: "100%", width: `${progressPct}%`,
                background: "linear-gradient(90deg,#E8C96A,#6BF0A0)",
                borderRadius: 4, transition: "width .5s ease",
              }} />
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>
              Check {attempts} of {MAX_ATTEMPTS} · Do not close this page
            </p>
          </>
        )}

        {/* FAILED */}
        {status === "FAILED" && (
          <>
            <div style={{ fontSize: 56, marginBottom: 24 }}>❌</div>
            <h2 style={{
              fontFamily: "var(--font-h)", fontSize: "clamp(20px,4vw,26px)",
              fontWeight: 800, color: "var(--danger)", marginBottom: 12,
            }}>
              Payment Failed
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 32 }}>
              {message}
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: "100%", padding: "16px 24px", borderRadius: 999, border: "none",
                background: "linear-gradient(135deg,#E8C96A,#F5E196)",
                color: "#080910", fontFamily: "var(--font-h)", fontWeight: 700, fontSize: 15,
                cursor: "pointer",
              }}
            >
              ← Try Again
            </button>
          </>
        )}

        {/* ERROR / TIMEOUT */}
        {status === "ERROR" && (
          <>
            <div style={{ fontSize: 56, marginBottom: 24 }}>⏱</div>
            <h2 style={{
              fontFamily: "var(--font-h)", fontSize: "clamp(20px,4vw,26px)",
              fontWeight: 800, color: "var(--warn)", marginBottom: 12,
            }}>
              Verification Delayed
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 32 }}>
              {message}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: "100%", padding: "15px 24px", borderRadius: 999,
                  border: "1px solid var(--gold)", background: "transparent",
                  color: "var(--gold)", fontFamily: "var(--font-h)", fontWeight: 700, fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  background: "none", border: "none", color: "var(--muted)",
                  cursor: "pointer", fontSize: 13, padding: "8px",
                }}
              >
                Return to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TicketSuccess.jsx  — Tictify 2026 Redesign
═══════════════════════════════════════════════════════ */
export function TicketSuccess() {
  injectStyles("tictify-base", BASE_CSS);

  // Additional keyframe for success
  injectStyles("tictify-success", `
    @keyframes successPop {
      0% { transform:scale(0) rotate(-10deg); opacity:0; }
      60% { transform:scale(1.15) rotate(3deg); opacity:1; }
      100% { transform:scale(1) rotate(0deg); opacity:1; }
    }
    @keyframes confettiFloat {
      0%,100% { transform:translateY(0) rotate(0deg); }
      50% { transform:translateY(-8px) rotate(5deg); }
    }
  `);

  const navigate = useNavigate();
  const touchStartX = useRef(0);

  // TicketSuccess receives reference from URL params
  const urlParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const reference = urlParams.get("ref");

  const [status, setStatus] = useState("LOADING");
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("Preparing your ticket…");
  const [downloading, setDownloading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!reference) { setStatus("ERROR"); setMessage("Invalid ticket reference"); return; }
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/by-reference/${reference}`);
        const result = await res.json();
        if (result?.status === "READY") { clearInterval(interval); setData(result); setStatus("READY"); }
        if (attempts >= 15) { clearInterval(interval); setStatus("ERROR"); setMessage("Ticket taking longer than expected. Please refresh."); }
      } catch { clearInterval(interval); setStatus("ERROR"); setMessage("Unable to load ticket data."); }
    }, 1200);
    return () => clearInterval(interval);
  }, [reference]);

  async function handleSendEmail() {
    if (!emailInput.includes("@")) return alert("Enter a valid email address.");
    setSendingEmail(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, reference }),
      });
      if (res.ok) { alert("Ticket sent! Check your inbox."); setShowEmailModal(false); }
      else alert("Email delivery failed. Please try downloading the PDF.");
    } catch { alert("Network error. Please check your connection."); }
    finally { setSendingEmail(false); }
  }

  async function downloadPDF() {
    if (downloading || !data) return;
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { event, ticket } = data;

      const toBase64 = async url => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise(res => {
          const r = new FileReader();
          r.onloadend = () => res(r.result);
          r.readAsDataURL(blob);
        });
      };

      const [bannerB64, qrB64] = await Promise.all([toBase64(event.banner), toBase64(ticket.qrImage)]);
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();

      doc.setFillColor(245, 247, 250); doc.rect(0, 0, W, 842, "F");
      doc.addImage(bannerB64, "JPEG", 40, 30, W - 80, 140);
      doc.setFontSize(20); doc.setTextColor("#111111");
      doc.text(event.title, W / 2, 210, { align: "center" });
      doc.setFontSize(12); doc.setTextColor("#444444");
      doc.text(`${new Date(event.date).toDateString()} • ${event.location}`, W / 2, 232, { align: "center" });
      doc.roundedRect(40, 255, W - 80, 120, 12, 12);
      doc.setFontSize(14);
      doc.text(`Ticket Type: ${ticket.ticketType}`, 60, 295);
      doc.text(`Guest Email: ${ticket.buyerEmail || "—"}`, 60, 320);
      doc.text(`Reference: ${reference}`, 60, 345);
      doc.addImage(qrB64, "PNG", W / 2 - 80, 400, 160, 160);
      doc.setFontSize(10); doc.setTextColor("#777777");
      doc.text("Present this ticket at the entrance · Powered by Tictify", W / 2, 610, { align: "center" });
      doc.save(`tictify-ticket-${reference}.pdf`);
    } catch { alert("PDF generation failed. You can still use the QR code on screen."); }
    finally { setDownloading(false); }
  }

  useEffect(() => {
    const start = e => (touchStartX.current = e.touches[0].clientX);
    const end = e => { if (e.changedTouches[0].clientX - touchStartX.current > 100) navigate("/"); };
    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => { window.removeEventListener("touchstart", start); window.removeEventListener("touchend", end); };
  }, [navigate]);

  if (status === "LOADING") {
    return (
      <div style={{ minHeight: "100svh", background: "var(--bg)", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 52, height: 52, border: "3px solid var(--border)", borderTopColor: "var(--gold)",
            borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px",
          }} />
          <p style={{ fontFamily: "var(--font-h)", fontWeight: 600, marginBottom: 6 }}>Generating your ticket…</p>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>{message}</p>
        </div>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div style={{ minHeight: "100svh", background: "var(--bg)", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{
          width: "min(100%,400px)", background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "var(--r)", padding: "clamp(28px,6vw,44px)", textAlign: "center",
          animation: "fadeUp .4s ease",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: "var(--font-h)", fontWeight: 700, marginBottom: 10 }}>Error</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>{message}</p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "13px 28px", borderRadius: 999, border: "none",
              background: "linear-gradient(135deg,#E8C96A,#F5E196)",
              color: "#080910", fontFamily: "var(--font-h)", fontWeight: 700, cursor: "pointer",
            }}
          >Return Home</button>
        </div>
      </div>
    );
  }

  const { event, ticket } = data;

  return (
    <div style={{
      minHeight: "100svh", background: "var(--bg)",
      display: "grid", placeItems: "center",
      padding: "clamp(16px,5vw,40px)",
      fontFamily: "var(--font-b)",
    }}>
      <div style={{
        width: "min(100%, 480px)",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r)",
        overflow: "hidden",
        animation: "fadeUp .4s ease",
        boxShadow: "0 40px 80px rgba(0,0,0,.6)",
      }}>
        {/* Success header */}
        <div style={{
          padding: "clamp(28px,6vw,44px) clamp(24px,5vw,40px) clamp(20px,4vw,32px)",
          background: "linear-gradient(135deg, rgba(232,201,106,.08), rgba(107,240,160,.05))",
          borderBottom: "1px solid var(--border)",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 56, lineHeight: 1,
            marginBottom: 16,
            display: "inline-block",
            animation: "successPop .6s cubic-bezier(.34,1.56,.64,1) both",
          }}>
            🎟️
          </div>
          <h1 style={{
            fontFamily: "var(--font-h)", fontSize: "clamp(22px,4vw,28px)",
            fontWeight: 800, letterSpacing: "-.02em", marginBottom: 8,
          }}>
            You're in!
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Your ticket is confirmed and ready.</p>
        </div>

        {/* Event info */}
        <div style={{ padding: "24px clamp(24px,5vw,40px)" }}>
          <div style={{
            padding: "20px", borderRadius: 16,
            border: "1px dashed rgba(232,201,106,.3)",
            background: "var(--gold-dim)",
            marginBottom: 24,
          }}>
            <h3 style={{ fontFamily: "var(--font-h)", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
              {event.title}
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              📅 {new Date(event.date).toDateString()}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
              📍 {event.location}
            </p>
            <span style={{
              display: "inline-block", marginTop: 14,
              padding: "4px 14px", borderRadius: 999,
              background: "rgba(232,201,106,.15)", color: "var(--gold)",
              fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
              textTransform: "uppercase", fontFamily: "var(--font-h)",
            }}>
              {ticket.ticketType}
            </span>
          </div>

          {/* QR Code */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              display: "inline-block",
              background: "#fff",
              padding: 14, borderRadius: 16,
              boxShadow: "0 8px 32px rgba(232,201,106,.15)",
            }}>
              <img src={ticket.qrImage} alt="Entry QR Code" style={{ width: "min(180px,50vw)", height: "auto", display: "block" }} />
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
              Scan at entrance
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              style={{
                width: "100%", padding: "16px",
                borderRadius: 999, border: "none",
                background: downloading ? "rgba(255,255,255,.07)" : "linear-gradient(135deg,#E8C96A,#F5E196)",
                color: downloading ? "var(--muted)" : "#080910",
                fontFamily: "var(--font-h)", fontWeight: 700, fontSize: 15,
                cursor: downloading ? "not-allowed" : "pointer",
                transition: "opacity .2s",
              }}
            >
              {downloading ? "Generating PDF…" : "⬇ Download PDF Ticket"}
            </button>

            <button
              onClick={() => setShowEmailModal(true)}
              style={{
                width: "100%", padding: "15px",
                borderRadius: 999,
                border: "1px solid rgba(232,201,106,.4)",
                background: "transparent", color: "var(--gold)",
                fontFamily: "var(--font-h)", fontWeight: 700, fontSize: 14,
                cursor: "pointer",
              }}
            >
              ✉ Send to Email
            </button>

            <button
              onClick={() => navigate("/")}
              style={{
                background: "none", border: "none",
                color: "var(--muted)", cursor: "pointer",
                fontSize: 13, padding: 8,
              }}
            >
              Browse more events →
            </button>
          </div>

          <p style={{
            textAlign: "center", fontSize: 11, color: "rgba(122,120,112,.5)",
            wordBreak: "break-all",
          }}>
            Ref: {reference}
          </p>
        </div>
      </div>

      {/* Email modal */}
      {showEmailModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(8,9,16,.9)",
          backdropFilter: "blur(12px)", display: "grid", placeItems: "center",
          padding: 24, zIndex: 1000,
        }}>
          <div style={{
            width: "min(100%, 380px)", background: "#0d0f16",
            border: "1px solid var(--border)", borderRadius: "var(--r)",
            padding: "clamp(24px,5vw,36px)", textAlign: "center",
            animation: "fadeUp .3s ease",
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✉️</div>
            <h3 style={{ fontFamily: "var(--font-h)", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
              Email my ticket
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
              Where should we send it?
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px",
                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)", color: "var(--text)", fontSize: 14,
                marginBottom: 20,
              }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowEmailModal(false)}
                style={{
                  flex: 1, padding: "13px", borderRadius: 999,
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--muted)", cursor: "pointer", fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                style={{
                  flex: 2, padding: "13px",
                  borderRadius: 999, border: "none",
                  background: "linear-gradient(135deg,#E8C96A,#F5E196)",
                  color: "#080910", fontFamily: "var(--font-h)", fontWeight: 700,
                  cursor: sendingEmail ? "not-allowed" : "pointer", fontSize: 14,
                  opacity: sendingEmail ? .7 : 1,
                }}
              >
                {sendingEmail ? "Sending…" : "Send Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}