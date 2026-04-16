import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";

/* ─── Inject global styles once ─────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("ts-styles")) {
  const s = document.createElement("style");
  s.id = "ts-styles";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-0: #04050a;
      --surface: rgba(255,255,255,0.045);
      --surface-2: rgba(255,255,255,0.03);
      --border: rgba(255,255,255,0.09);
      --border-strong: rgba(255,255,255,0.15);
      --accent: #4DF0B0;
      --accent-dim: rgba(77,240,176,0.1);
      --text: #EEE9E0;
      --muted: #6E6A62;
      --muted-2: #9C9790;
      --font-d: 'Bricolage Grotesque', sans-serif;
      --font-b: 'Instrument Sans', sans-serif;
      --r: 20px;
      --r-sm: 12px;
      --r-pill: 999px;
    }

    html { font-size: 16px; }
    body { background: var(--bg-0); color: var(--text); font-family: var(--font-b); -webkit-font-smoothing: antialiased; }

    @keyframes ts-spin  { to { transform: rotate(360deg); } }
    @keyframes ts-rise  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes ts-pop   { 0% { transform:scale(0) rotate(-8deg); opacity:0; } 60% { transform:scale(1.12) rotate(2deg); opacity:1; } 100% { transform:scale(1) rotate(0deg); opacity:1; } }

    .ts-btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
    .ts-btn-outline:hover { background: rgba(77,240,176,0.07); }
    .ts-btn-ghost:hover   { color: var(--muted-2); }

    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  `;
  document.head.appendChild(s);
}

export default function TicketSuccess() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [status, setStatus] = useState("LOADING");
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("Preparing your ticket...");

  const [downloading, setDownloading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  /* ── load ticket ── */
  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid ticket reference");
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 15;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/by-reference/${reference}`,
        );
        const result = await res.json();

        if (result?.status === "READY") {
          clearInterval(interval);
          setData(result);
          setStatus("READY");
        }
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("ERROR");
          setMessage("Ticket taking longer than expected. Please refresh.");
        }
      } catch {
        clearInterval(interval);
        setStatus("ERROR");
        setMessage("Unable to load ticket data.");
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [reference]);

  /* ── email ── */
  async function handleSendEmail() {
    if (!emailInput || !emailInput.includes("@"))
      return alert("Please enter a valid email address.");
    setSendingEmail(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput, reference }),
        },
      );
      if (res.ok) {
        alert("Success! Check your inbox (and spam folder) for your ticket.");
        setShowEmailModal(false);
      } else
        alert("Email delivery failed. Please try again or download the PDF.");
    } catch {
      alert("Network error. Please check your connection.");
    } finally {
      setSendingEmail(false);
    }
  }

  /* ── image loader ── */
  async function loadImageAsBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  /* ── PDF generation — image fills full width, correct aspect ratio ── */
  async function downloadPDF() {
    if (downloading || !data) return;
    setDownloading(true);

    try {
      const { event, ticket } = data;
      const bannerBase64 = await loadImageAsBase64(event.banner);
      const qrBase64 = await loadImageAsBase64(ticket.qrImage);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const PW = doc.internal.pageSize.getWidth(); // 595.28
      const PH = doc.internal.pageSize.getHeight(); // 841.89

      /* ── background ── */
      doc.setFillColor(10, 10, 16);
      doc.rect(0, 0, PW, PH, "F");

      /* ── banner: full-width, 16:5 aspect, no side margins ── */
      const bannerH = Math.round(PW * (5 / 16)); // ≈ 186pt
      doc.addImage(bannerBase64, "JPEG", 0, 0, PW, bannerH, undefined, "FAST");

      /* ── dark gradient overlay on banner bottom ── */
      doc.setFillColor(10, 10, 16);
      doc.setGState && doc.setGState(new doc.GState({ opacity: 0.55 }));
      doc.rect(0, bannerH - 40, PW, 40, "F");
      doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));

      /* ── event title ── */
      const titleY = bannerH + 36;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor("#EEEAE0");
      doc.text(event.title, PW / 2, titleY, {
        align: "center",
        maxWidth: PW - 80,
      });

      /* ── date + location ── */
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor("#9C9790");
      doc.text(
        `${new Date(event.date).toDateString()}  ·  ${event.location}`,
        PW / 2,
        titleY + 24,
        {
          align: "center",
          maxWidth: PW - 80,
        },
      );

      /* ── ticket info box ── */
      const boxX = 40,
        boxY = titleY + 52,
        boxW = PW - 80,
        boxH = 104;
      doc.setFillColor(22, 24, 32);
      doc.roundedRect(boxX, boxY, boxW, boxH, 10, 10, "F");
      doc.setDrawColor(50, 54, 70);
      doc.roundedRect(boxX, boxY, boxW, boxH, 10, 10, "S");

      doc.setFontSize(11);
      doc.setTextColor("#6E6A62");
      doc.text("TICKET TYPE", boxX + 20, boxY + 26);
      doc.text("GUEST EMAIL", boxX + 20, boxY + 54);
      doc.text("REFERENCE", boxX + 20, boxY + 82);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#EEE9E0");
      doc.text(ticket.ticketType, boxX + 148, boxY + 26);
      doc.text(ticket.buyerEmail || "—", boxX + 148, boxY + 54);
      doc.text(reference, boxX + 148, boxY + 82);

      /* ── divider dashes ── */
      doc.setLineDash([4, 4]);
      doc.setDrawColor(40, 44, 58);
      doc.line(40, boxY + boxH + 24, PW - 40, boxY + boxH + 24);
      doc.setLineDash([]);

      /* ── QR code — centred, white background, 180×180 ── */
      const qrSize = 180;
      const qrX = (PW - qrSize) / 2;
      const qrY = boxY + boxH + 44;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        qrX - 12,
        qrY - 12,
        qrSize + 24,
        qrSize + 24,
        10,
        10,
        "F",
      );
      doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);

      /* ── scan hint ── */
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#6E6A62");
      doc.text("Scan this QR code at the entrance", PW / 2, qrY + qrSize + 36, {
        align: "center",
      });

      /* ── footer ── */
      doc.setFontSize(9);
      doc.setTextColor("#3C3A34");
      doc.text("Powered by Tictify  ·  tictify.ng", PW / 2, PH - 24, {
        align: "center",
      });

      doc.save(`tictify-ticket-${reference}.pdf`);
    } catch (err) {
      alert(
        "PDF generation failed. You can still use the QR code shown on screen.",
      );
    } finally {
      setDownloading(false);
    }
  }

  /* ── swipe home ── */
  useEffect(() => {
    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 100)
        navigate("/");
    };
    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate]);

  /* ── LOADING ── */
  if (status === "LOADING") return <LoadingScreen message={message} />;

  /* ── ERROR ── */
  if (status === "ERROR") {
    return (
      <div style={css.page}>
        <div style={css.glowBlob} aria-hidden="true" />
        <div
          style={{
            ...css.card,
            maxWidth: 400,
            textAlign: "center",
            padding: "clamp(28px,6vw,44px)",
          }}
        >
          <div style={{ fontSize: "clamp(36px,9vw,46px)", marginBottom: 14 }}>
            ⚠️
          </div>
          <h2 style={{ ...css.heading, color: "#F05C5C" }}>Error</h2>
          <p style={css.body}>{message}</p>
          <button
            className="ts-btn-primary"
            style={{ ...css.btnPrimary, width: "100%", marginTop: 4 }}
            onClick={() => navigate("/")}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const { event, ticket } = data;

  return (
    <div style={css.page}>
      <div style={css.glowBlob} aria-hidden="true" />

      <div style={css.card}>
        {/* ── success header ── */}
        <div style={css.cardHeader}>
          <span style={css.ticketEmoji}>🎟️</span>
          <h1 style={css.heading}>Purchase Successful</h1>
          <p style={css.subtitle}>Your official entry ticket is ready.</p>
        </div>

        {/* ── body ── */}
        <div style={css.cardBody}>
          {/* event info */}
          <div style={css.infoBox}>
            <h3 style={css.eventTitle}>{event.title}</h3>
            <p style={css.eventMeta}>
              📅 {new Date(event.date).toDateString()}
            </p>
            <p style={css.eventMeta}>📍 {event.location}</p>
            <span style={css.badge}>{ticket.ticketType}</span>
          </div>

          {/* QR */}
          <div style={css.qrWrap}>
            <div style={css.qrBox}>
              <img src={ticket.qrImage} alt="Entry QR Code" style={css.qrImg} />
            </div>
            <p style={css.qrHint}>Scan at entrance</p>
          </div>

          {/* actions */}
          <div style={css.actionGroup}>
            <button
              className="ts-btn-primary"
              style={{
                ...css.btnPrimary,
                width: "100%",
                opacity: downloading ? 0.65 : 1,
              }}
              disabled={downloading}
              onClick={downloadPDF}
            >
              {downloading ? "Generating PDF…" : "⬇ Download PDF Ticket"}
            </button>

            <button
              className="ts-btn-outline"
              style={{ ...css.btnOutline, width: "100%" }}
              onClick={() => setShowEmailModal(true)}
            >
              ✉ Send to my Email
            </button>

            <button
              className="ts-btn-ghost"
              style={css.btnGhost}
              onClick={() => navigate("/")}
            >
              Browse more events →
            </button>
          </div>

          <p style={css.refText}>Ref: {reference}</p>
        </div>
      </div>

      {/* ── email modal ── */}
      {showEmailModal && (
        <div
          style={css.modalOverlay}
          onClick={(e) =>
            e.target === e.currentTarget && setShowEmailModal(false)
          }
        >
          <div style={css.emailCard}>
            <div style={{ fontSize: "clamp(26px,6vw,32px)", marginBottom: 10 }}>
              ✉️
            </div>
            <h3
              style={{
                ...css.heading,
                fontSize: "clamp(16px,4vw,18px)",
                marginBottom: 6,
              }}
            >
              Email Ticket
            </h3>
            <p style={css.modalSub}>Where should we send your ticket?</p>
            <input
              style={css.inputField}
              type="email"
              placeholder="e.g. hello@tictify.ng"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
            />
            <div style={css.modalActions}>
              <button
                className="ts-btn-ghost"
                style={css.btnGhost}
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="ts-btn-primary"
                style={{ ...css.confirmBtn, opacity: sendingEmail ? 0.7 : 1 }}
                onClick={handleSendEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? "Sending…" : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Loading screen ── */
function LoadingScreen({ message }) {
  return (
    <div
      style={{
        minHeight: "100svh",
        background: "#04050a",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "clamp(40px,10vw,50px)",
            height: "clamp(40px,10vw,50px)",
            border: "2.5px solid rgba(255,255,255,0.1)",
            borderTopColor: "#4DF0B0",
            borderRadius: "50%",
            animation: "ts-spin 1s linear infinite",
            margin: "0 auto clamp(16px,3vw,20px)",
          }}
        />
        <p
          style={{
            fontFamily: "'Bricolage Grotesque',sans-serif",
            fontWeight: 600,
            fontSize: "clamp(14px,3vw,15px)",
            marginBottom: 6,
          }}
        >
          Generating your ticket…
        </p>
        <p style={{ fontSize: "clamp(12px,2.5vw,13px)", color: "#9C9790" }}>
          {message}
        </p>
      </div>
    </div>
  );
}

/* ─── Styles ── */
const css = {
  page: {
    minHeight: "100svh",
    background:
      "radial-gradient(ellipse 90% 55% at 50% -5%, #0a1520 0%, #04050a 65%)",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px,5vw,48px) clamp(12px,4vw,24px)",
    fontFamily: "var(--font-b)",
    position: "relative",
    isolation: "isolate",
    overflowX: "hidden",
  },

  glowBlob: {
    position: "absolute",
    top: "-5%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "clamp(300px, 70vw, 700px)",
    height: "clamp(180px, 35vw, 380px)",
    background:
      "radial-gradient(ellipse, rgba(77,240,176,0.06) 0%, transparent 65%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  card: {
    position: "relative",
    zIndex: 1,
    width: "min(100%, 480px)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,.6)",
    animation: "ts-rise .45s cubic-bezier(.22,1,.36,1) both",
    overflow: "hidden",
  },

  cardHeader: {
    padding: "clamp(28px,6vw,44px) clamp(20px,5vw,40px) clamp(20px,4vw,28px)",
    background:
      "linear-gradient(160deg, rgba(77,240,176,0.07) 0%, rgba(77,240,176,0.02) 100%)",
    borderBottom: "1px solid var(--border)",
    textAlign: "center",
  },

  ticketEmoji: {
    display: "inline-block",
    fontSize: "clamp(42px,10vw,54px)",
    lineHeight: 1,
    marginBottom: "clamp(12px,3vw,16px)",
    animation: "ts-pop .55s cubic-bezier(.34,1.56,.64,1) both",
  },

  cardBody: {
    padding: "clamp(20px,5vw,32px) clamp(20px,5vw,40px) clamp(24px,5vw,36px)",
  },

  heading: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: "clamp(19px,5vw,26px)",
    fontWeight: 800,
    letterSpacing: "-.025em",
    lineHeight: 1.2,
    marginBottom: "clamp(6px,1.5vw,8px)",
    color: "var(--text)",
  },

  subtitle: {
    fontSize: "clamp(12.5px,3vw,14px)",
    color: "var(--muted-2)",
  },

  body: {
    fontSize: "clamp(12.5px,3vw,14px)",
    color: "var(--muted-2)",
    lineHeight: 1.75,
    maxWidth: "34ch",
    margin: "0 auto clamp(20px,4vw,28px)",
  },

  infoBox: {
    background: "var(--surface-2)",
    border: "1px dashed rgba(77,240,176,0.2)",
    borderRadius: "var(--r-sm)",
    padding: "clamp(16px,4vw,20px)",
    marginBottom: "clamp(20px,4vw,24px)",
  },

  eventTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(15px,3.5vw,17px)",
    marginBottom: "clamp(6px,1.5vw,8px)",
    lineHeight: 1.3,
  },

  eventMeta: {
    fontSize: "clamp(12px,2.8vw,13.5px)",
    color: "var(--muted-2)",
    marginBottom: 4,
    lineHeight: 1.5,
  },

  badge: {
    display: "inline-block",
    marginTop: "clamp(8px,2vw,12px)",
    padding: "4px 14px",
    borderRadius: "var(--r-pill)",
    background: "rgba(77,240,176,0.12)",
    color: "var(--accent)",
    fontSize: "clamp(9.5px,2vw,11px)",
    fontWeight: 700,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    fontFamily: "'Bricolage Grotesque', sans-serif",
  },

  qrWrap: {
    textAlign: "center",
    marginBottom: "clamp(20px,5vw,28px)",
  },

  qrBox: {
    display: "inline-block",
    background: "#fff",
    padding: "clamp(10px,2.5vw,14px)",
    borderRadius: "var(--r-sm)",
    boxShadow: "0 8px 32px rgba(77,240,176,0.12)",
  },

  qrImg: {
    display: "block",
    width: "clamp(140px,38vw,190px)",
    height: "auto",
    imageRendering: "crisp-edges",
  },

  qrHint: {
    marginTop: "clamp(8px,2vw,10px)",
    fontSize: "clamp(11px,2.5vw,12px)",
    color: "var(--muted)",
  },

  actionGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "clamp(8px,2vw,12px)",
    marginBottom: "clamp(16px,4vw,20px)",
  },

  btnPrimary: {
    padding: "clamp(13px,3vw,16px) 24px",
    borderRadius: "var(--r-pill)",
    border: "none",
    background: "linear-gradient(135deg, #4DF0B0 0%, #a0f5d8 100%)",
    color: "#030810",
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(13px,3vw,15px)",
    cursor: "pointer",
    letterSpacing: "-.01em",
    transition: "opacity .15s, transform .15s",
  },

  btnOutline: {
    padding: "clamp(12px,3vw,15px) 24px",
    borderRadius: "var(--r-pill)",
    border: "1px solid rgba(77,240,176,0.35)",
    background: "transparent",
    color: "var(--accent)",
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(12.5px,3vw,14px)",
    cursor: "pointer",
    transition: "background .15s",
  },

  btnGhost: {
    background: "none",
    border: "none",
    color: "var(--muted)",
    cursor: "pointer",
    fontSize: "clamp(11.5px,2.5vw,13px)",
    padding: "8px 4px",
    fontFamily: "'Instrument Sans', sans-serif",
    transition: "color .15s",
  },

  refText: {
    textAlign: "center",
    fontSize: "clamp(10px,2vw,11px)",
    color: "rgba(110,106,98,0.5)",
    wordBreak: "break-all",
  },

  /* modal */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(4,5,10,0.88)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px,4vw,24px)",
    zIndex: 1000,
  },

  emailCard: {
    width: "min(100%, 380px)",
    background: "#0d0f18",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--r)",
    padding: "clamp(24px,5vw,36px)",
    textAlign: "center",
    animation: "ts-rise .3s ease both",
    boxShadow: "0 32px 64px rgba(0,0,0,.6)",
  },

  modalSub: {
    fontSize: "clamp(12.5px,3vw,14px)",
    color: "var(--muted-2)",
    marginBottom: "clamp(16px,4vw,20px)",
  },

  inputField: {
    width: "100%",
    padding: "clamp(12px,3vw,14px) 16px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border-strong)",
    background: "rgba(255,255,255,0.05)",
    color: "var(--text)",
    fontSize: "clamp(14px,3vw,15px)",
    marginBottom: "clamp(16px,4vw,20px)",
    outline: "none",
    fontFamily: "'Instrument Sans', sans-serif",
    transition: "border-color .2s",
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  confirmBtn: {
    padding: "clamp(10px,2.5vw,12px) clamp(20px,4vw,24px)",
    borderRadius: "var(--r-pill)",
    border: "none",
    background: "linear-gradient(135deg, #4DF0B0, #a0f5d8)",
    color: "#030810",
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(13px,3vw,14px)",
    cursor: "pointer",
    transition: "opacity .15s",
    flexShrink: 0,
  },
};
