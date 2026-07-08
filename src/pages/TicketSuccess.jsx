/* ═══════════════════════════════════════════════════════════
   TicketSuccess.jsx — Tictify 2026
   Boarding-pass ticket · Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── WhatsApp glyph (inline, dependency-free) ── */
const WhatsAppIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ── Live countdown to event start ── */
function Countdown({ date }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const target = new Date(date).getTime();
  if (!Number.isFinite(target)) return null;

  const diff = target - now;
  if (diff <= 0) {
    return (
      <section className="ts-count">
        <p className="ts-count-now">Happening now 🎉</p>
      </section>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");
  const segs = [
    [Math.floor(diff / 86400000), "days"],
    [Math.floor((diff % 86400000) / 3600000), "hrs"],
    [Math.floor((diff % 3600000) / 60000), "min"],
    [Math.floor((diff % 60000) / 1000), "sec"],
  ];

  return (
    <section className="ts-count">
      <p className="ts-count-label">Party starts in</p>
      <div className="ts-count-grid">
        {segs.map(([value, unit]) => (
          <div className="ts-count-seg" key={unit}>
            <span className="ts-count-num">{pad(value)}</span>
            <span className="ts-count-unit">{unit}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TicketSuccess() {
  injectStyles("tictify-ticket-success-css", CSS);

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
      <main className="ts-page">
        <Glows />
        <div className="ts-error-card">
          <div className="ts-error-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 9v4M12 16.5v.5" strokeLinecap="round" />
              <path d="M10.3 3.9L2.6 17a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="ts-h1 ts-h1-danger">Something went wrong</h2>
          <p className="ts-body">{message}</p>
          <button className="ts-btn ts-btn-gold ts-w100" onClick={() => navigate("/")}>
            Return Home
          </button>
        </div>
      </main>
    );
  }

  const { event, ticket } = data;

  const shareGroupInvite = () => {
    const groupMsg = `I got us ${ticket.groupSize} tickets to ${event.title}! One QR covers us all — see you there 🎟️`;
    const eventId = event._id || event.id;
    const text = eventId
      ? `${groupMsg} ${window.location.origin}/events/${eventId}`
      : groupMsg;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main className="ts-page">
      <Glows />

      <article className="ts-pass">
        {/* ── success header ── */}
        <header className="ts-pass-head">
          <div className="ts-check" aria-hidden="true">
            <svg viewBox="0 0 64 64">
              <circle className="ts-check-ring" cx="32" cy="32" r="29" />
              <path className="ts-check-mark" d="M20 33.5l8.5 8.5L44 25" />
            </svg>
          </div>
          <p className="ts-overline">Payment confirmed</p>
          <h1 className="ts-h1">You&rsquo;re in.</h1>
          <p className="ts-sub">Your official entry ticket is ready.</p>
        </header>

        {/* ── event details ── */}
        <section className="ts-details">
          <div className="ts-details-row">
            <h2 className="ts-event-title">{event.title}</h2>
            <span className="ts-badge">{ticket.ticketType}</span>
          </div>
          <div className="ts-meta-grid">
            <div className="ts-meta">
              <span className="ts-meta-label">Date</span>
              <span className="ts-meta-value">
                {new Date(event.date).toDateString()}
              </span>
            </div>
            <div className="ts-meta">
              <span className="ts-meta-label">Location</span>
              <span className="ts-meta-value">{event.location}</span>
            </div>
          </div>
        </section>

        {/* ── live countdown ── */}
        <Countdown date={event.date} />

        {/* ── perforation ── */}
        <div className="ts-perf" aria-hidden="true">
          <span className="ts-perf-line" />
        </div>

        {/* ── QR panel ── */}
        <section className="ts-qr-panel">
          <div className="ts-qr-frame">
            <img src={ticket.qrImage} alt="Entry QR Code" className="ts-qr-img" />
          </div>
          <p className="ts-qr-hint">Scan at the entrance</p>
          <p className="ts-ref">Ref: {reference}</p>
        </section>

        {/* ── group invite nudge ── */}
        {(ticket.groupSize || 1) > 1 && (
          <section className="ts-group">
            <p className="ts-group-title">
              You&rsquo;ve got {ticket.groupSize} spots on this ticket 🎉
            </p>
            <p className="ts-group-sub">
              Invite your friends — one QR code covers everyone.
            </p>
            <button
              className="ts-btn ts-btn-gold ts-group-btn"
              onClick={shareGroupInvite}
            >
              <span className="ts-group-ic">{WhatsAppIcon}</span> Invite your
              friends
            </button>
          </section>
        )}

        {/* ── actions ── */}
        <footer className="ts-actions">
          <button
            className="ts-btn ts-btn-gold ts-w100"
            disabled={downloading}
            onClick={downloadPDF}
          >
            {downloading ? "Generating PDF…" : "Download PDF Ticket"}
          </button>
          <button
            className="ts-btn ts-btn-outline ts-w100"
            onClick={() => setShowEmailModal(true)}
          >
            Send to my Email
          </button>
          <button className="ts-btn-ghost" onClick={() => navigate("/")}>
            Browse more events →
          </button>
        </footer>
      </article>

      {/* ── email modal ── */}
      {showEmailModal && (
        <div
          className="ts-modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowEmailModal(false)
          }
        >
          <div className="ts-modal" role="dialog" aria-modal="true" aria-label="Email Ticket">
            <div className="ts-modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M3.5 7l8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="ts-modal-title">Email Ticket</h3>
            <p className="ts-modal-sub">Where should we send your ticket?</p>
            <input
              className="ts-input"
              type="email"
              placeholder="e.g. hello@tictify.ng"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
            />
            <div className="ts-modal-actions">
              <button
                className="ts-btn-ghost"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="ts-btn ts-btn-gold"
                onClick={handleSendEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? "Sending…" : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Celebratory background glows ── */
function Glows() {
  return (
    <>
      <div className="ts-glow ts-glow-a" aria-hidden="true" />
      <div className="ts-glow ts-glow-b" aria-hidden="true" />
      <div className="ts-glow ts-glow-c" aria-hidden="true" />
    </>
  );
}

/* ── Loading screen ── */
function LoadingScreen({ message }) {
  injectStyles("tictify-ticket-success-css", CSS);
  return (
    <main className="ts-page">
      <Glows />
      <div className="ts-loading">
        <div className="ts-spinner" aria-hidden="true" />
        <p className="ts-loading-title">Generating your ticket…</p>
        <p className="ts-loading-sub">{message}</p>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
:root {
  --bg:#080910; --surface:#0d0f16; --card:rgba(255,255,255,0.04);
  --border:rgba(255,255,255,0.08); --border-h:rgba(255,255,255,0.18);
  --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12); --gold-glo:rgba(232,201,106,0.22);
  --text:#F0EDE8; --muted:#8B887E; --danger:#E05C5C; --live:#6BF0A0;
  --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif;
  --r:20px; --r-sm:12px;
}
html { font-size:16px; }
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
button { font-family:var(--font-b); cursor:pointer; }

/* ── Page ── */
.ts-page {
  min-height:100svh; background:var(--bg);
  display:grid; place-items:center;
  padding:clamp(20px,5vw,56px) clamp(14px,4vw,28px);
  position:relative; isolation:isolate; overflow-x:clip;
}

/* ── Celebratory glows ── */
.ts-glow { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; z-index:0; }
.ts-glow-a { top:-140px; left:50%; transform:translateX(-50%); width:min(640px,85vw); height:380px; background:radial-gradient(ellipse at center, var(--gold-dim), transparent 65%); animation:ts-breathe 7s ease-in-out infinite; }
.ts-glow-b { bottom:-100px; left:-120px; width:360px; height:360px; background:radial-gradient(circle at center, rgba(232,201,106,0.08), transparent 65%); animation:ts-breathe 9s ease-in-out infinite 1.2s; }
.ts-glow-c { top:35%; right:-140px; width:340px; height:340px; background:radial-gradient(circle at center, rgba(232,201,106,0.06), transparent 65%); animation:ts-breathe 8s ease-in-out infinite 2.4s; }
@keyframes ts-breathe { 0%,100%{opacity:.55} 50%{opacity:1} }

/* ── Boarding-pass card ── */
.ts-pass {
  position:relative; z-index:1; width:min(100%,520px);
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--r); overflow:hidden;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 90px rgba(0,0,0,.65);
  animation:ts-rise .5s cubic-bezier(.22,1,.36,1) both;
}
@keyframes ts-rise { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }

/* ── Success header ── */
.ts-pass-head {
  text-align:center;
  padding:clamp(30px,7vw,44px) clamp(20px,5vw,40px) clamp(20px,5vw,28px);
  background:linear-gradient(180deg, var(--gold-dim), transparent 90%);
}
.ts-check { display:inline-block; width:clamp(58px,14vw,72px); height:clamp(58px,14vw,72px); margin-bottom:clamp(14px,3vw,18px); }
.ts-check svg { width:100%; height:100%; display:block; }
.ts-check-ring {
  fill:none; stroke:var(--gold); stroke-width:2.5; stroke-linecap:round;
  stroke-dasharray:183; stroke-dashoffset:183;
  transform:rotate(-90deg); transform-origin:center;
  animation:ts-draw .7s cubic-bezier(.4,0,.2,1) forwards .2s;
  filter:drop-shadow(0 0 10px var(--gold-glo));
}
.ts-check-mark {
  fill:none; stroke:var(--gold); stroke-width:4; stroke-linecap:round; stroke-linejoin:round;
  stroke-dasharray:40; stroke-dashoffset:40;
  animation:ts-draw .45s cubic-bezier(.4,0,.2,1) forwards .8s;
}
@keyframes ts-draw { to { stroke-dashoffset:0; } }

.ts-overline { color:var(--gold); font-size:11px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; margin-bottom:8px; }
.ts-h1 { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,6vw,32px); letter-spacing:-.02em; line-height:1.1; margin-bottom:8px; }
.ts-h1-danger { color:var(--danger); }
.ts-sub { color:var(--muted); font-size:clamp(13px,3vw,14.5px); }

/* ── Event details ── */
.ts-details { padding:clamp(18px,4.5vw,26px) clamp(20px,5vw,36px) clamp(22px,5vw,30px); }
.ts-details-row { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:clamp(14px,3.5vw,18px); }
.ts-event-title { font-family:var(--font-h); font-weight:700; font-size:clamp(17px,4.2vw,20px); letter-spacing:-.01em; line-height:1.25; }
.ts-badge {
  flex-shrink:0; padding:5px 13px; border-radius:999px;
  background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); color:var(--gold);
  font-family:var(--font-h); font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; white-space:nowrap;
}
.ts-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,3vw,18px); }
.ts-meta { display:flex; flex-direction:column; gap:4px; min-width:0; }
.ts-meta-label { color:var(--muted); font-size:10.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; }
.ts-meta-value { color:var(--text); font-size:clamp(13px,3vw,14.5px); font-weight:500; line-height:1.45; overflow-wrap:anywhere; }

/* ── Countdown ── */
.ts-count { text-align:center; padding:0 clamp(20px,5vw,36px) clamp(18px,4.5vw,24px); }
.ts-count-label { color:var(--muted); font-size:10.5px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; margin-bottom:10px; }
.ts-count-grid { display:flex; justify-content:center; gap:clamp(8px,2.6vw,18px); flex-wrap:wrap; }
.ts-count-seg { display:flex; flex-direction:column; align-items:center; gap:3px; min-width:clamp(44px,12vw,56px); }
.ts-count-num { font-family:var(--font-h); font-weight:800; font-size:clamp(20px,5.5vw,28px); color:var(--gold); font-variant-numeric:tabular-nums; letter-spacing:-.01em; }
.ts-count-unit { font-size:10px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); }
.ts-count-now { font-family:var(--font-h); font-weight:800; font-size:clamp(18px,4.6vw,22px); color:var(--gold); }

/* ── Group invite nudge ── */
.ts-group { margin:clamp(14px,3.5vw,20px) clamp(14px,3.5vw,20px) 0; padding:clamp(18px,4.5vw,24px) clamp(16px,4vw,24px); text-align:center; background:var(--gold-dim); border:1px solid rgba(232,201,106,.32); border-radius:var(--r-sm); }
.ts-group-title { font-family:var(--font-h); font-weight:700; font-size:clamp(15px,3.6vw,17px); letter-spacing:-.01em; margin-bottom:6px; }
.ts-group-sub { color:var(--muted); font-size:clamp(12px,2.8vw,13px); line-height:1.6; margin-bottom:14px; }
.ts-group-btn { display:inline-flex; align-items:center; justify-content:center; gap:9px; width:100%; }
.ts-group-ic { display:inline-grid; place-items:center; flex-shrink:0; }
.ts-group-ic svg { width:16px; height:16px; }

/* ── Perforated divider ── */
.ts-perf { position:relative; height:24px; }
.ts-perf-line { position:absolute; left:24px; right:24px; top:50%; border-top:2px dashed var(--border-h); }
.ts-perf::before, .ts-perf::after {
  content:''; position:absolute; top:0; width:24px; height:24px;
  background:radial-gradient(circle at center, var(--bg) 0 11px, transparent 12px);
}
.ts-perf::before { left:-12px; }
.ts-perf::after { right:-12px; }

/* ── QR panel ── */
.ts-qr-panel {
  text-align:center; margin:0 clamp(14px,3.5vw,20px);
  padding:clamp(20px,5vw,28px) clamp(16px,4vw,24px);
  background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm);
}
.ts-qr-frame {
  display:inline-block; background:#fff; padding:clamp(10px,2.5vw,14px);
  border-radius:var(--r-sm); box-shadow:0 10px 40px var(--gold-glo);
}
.ts-qr-img { display:block; width:clamp(140px,42vw,190px); height:auto; image-rendering:crisp-edges; }
.ts-qr-hint { margin-top:clamp(10px,2.5vw,12px); color:var(--muted); font-size:clamp(11.5px,2.6vw,12.5px); }
.ts-ref { margin-top:6px; color:var(--muted); opacity:.6; font-size:clamp(10px,2.2vw,11px); word-break:break-all; font-variant-numeric:tabular-nums; }

/* ── Actions ── */
.ts-actions {
  display:flex; flex-direction:column; align-items:center; gap:clamp(9px,2.2vw,12px);
  padding:clamp(18px,4.5vw,24px) clamp(20px,5vw,36px) clamp(22px,5vw,30px);
}
.ts-w100 { width:100%; }
.ts-btn {
  border-radius:999px; border:1px solid transparent;
  font-family:var(--font-h); font-weight:700; font-size:clamp(13.5px,3.2vw,15px); letter-spacing:-.01em;
  padding:clamp(13px,3.2vw,15px) 26px;
  transition:transform .25s, box-shadow .25s, background .25s, border-color .25s, opacity .25s;
}
.ts-btn:disabled { opacity:.6; cursor:not-allowed; }
.ts-btn-gold { background:var(--gold); color:#080910; }
.ts-btn-gold:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 34px var(--gold-glo); }
.ts-btn-outline { background:transparent; color:var(--text); border-color:var(--border); }
.ts-btn-outline:hover { border-color:var(--border-h); background:var(--card); transform:translateY(-2px); }
.ts-btn-ghost {
  background:none; border:none; color:var(--muted);
  font-family:var(--font-b); font-size:clamp(12.5px,2.8vw,13.5px); font-weight:500;
  padding:8px 6px; transition:color .25s;
}
.ts-btn-ghost:hover { color:var(--gold); }

/* ── Error card ── */
.ts-error-card {
  position:relative; z-index:1; width:min(100%,420px); text-align:center;
  background:var(--surface); border:1px solid var(--border); border-radius:var(--r);
  padding:clamp(30px,7vw,44px) clamp(22px,5vw,36px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 90px rgba(0,0,0,.65);
  animation:ts-rise .5s cubic-bezier(.22,1,.36,1) both;
}
.ts-error-icon {
  width:56px; height:56px; margin:0 auto clamp(14px,3vw,18px); border-radius:16px;
  background:rgba(224,92,92,0.1); border:1px solid rgba(224,92,92,0.3); color:var(--danger);
  display:grid; place-items:center;
}
.ts-error-icon svg { width:26px; height:26px; }
.ts-body { color:var(--muted); font-size:clamp(13px,3vw,14.5px); line-height:1.7; max-width:36ch; margin:0 auto clamp(20px,5vw,26px); }

/* ── Loading ── */
.ts-loading { position:relative; z-index:1; text-align:center; }
.ts-spinner {
  width:clamp(44px,10vw,52px); height:clamp(44px,10vw,52px);
  border:2.5px solid var(--border-h); border-top-color:var(--gold); border-radius:50%;
  margin:0 auto clamp(16px,4vw,20px);
  animation:ts-spin 1s linear infinite;
}
@keyframes ts-spin { to { transform:rotate(360deg); } }
.ts-loading-title { font-family:var(--font-h); font-weight:700; font-size:clamp(14.5px,3.2vw,16px); margin-bottom:6px; }
.ts-loading-sub { color:var(--muted); font-size:clamp(12px,2.8vw,13px); }

/* ── Email modal ── */
.ts-modal-overlay {
  position:fixed; inset:0; z-index:1000;
  background:rgba(8,9,16,0.85); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  display:grid; place-items:center; padding:clamp(16px,4vw,24px);
}
.ts-modal {
  width:min(100%,400px); text-align:center;
  background:var(--surface); border:1px solid var(--border-h); border-radius:var(--r);
  padding:clamp(24px,6vw,36px) clamp(20px,5vw,32px);
  box-shadow:0 32px 70px rgba(0,0,0,.65);
  animation:ts-rise .3s ease both;
}
.ts-modal-icon {
  width:52px; height:52px; margin:0 auto 14px; border-radius:16px;
  background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); color:var(--gold);
  display:grid; place-items:center;
}
.ts-modal-icon svg { width:24px; height:24px; }
.ts-modal-title { font-family:var(--font-h); font-weight:700; font-size:clamp(17px,4vw,19px); letter-spacing:-.01em; margin-bottom:6px; }
.ts-modal-sub { color:var(--muted); font-size:clamp(12.5px,3vw,14px); margin-bottom:clamp(16px,4vw,20px); }
.ts-input {
  width:100%; padding:clamp(12px,3vw,14px) 16px;
  border-radius:var(--r-sm); border:1px solid var(--border-h);
  background:var(--card); color:var(--text);
  font-family:var(--font-b); font-size:clamp(14px,3.2vw,15px);
  margin-bottom:clamp(16px,4vw,20px); outline:none; transition:border-color .25s, box-shadow .25s;
}
.ts-input::placeholder { color:var(--muted); }
.ts-input:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.ts-modal-actions { display:flex; justify-content:space-between; align-items:center; gap:12px; }
.ts-modal-actions .ts-btn { flex-shrink:0; padding:clamp(11px,2.6vw,13px) clamp(20px,4.5vw,24px); font-size:clamp(13px,3vw,14px); }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 1024px) {
  .ts-glow-b, .ts-glow-c { width:280px; height:280px; }
}
@media (max-width: 768px) {
  .ts-glow-c { display:none; }
}
@media (max-width: 480px) {
  .ts-details-row { flex-direction:column; align-items:flex-start; gap:10px; }
  .ts-meta-grid { grid-template-columns:1fr; }
  .ts-glow-b { display:none; }
  .ts-modal-actions { flex-direction:column-reverse; }
  .ts-modal-actions .ts-btn { width:100%; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .ts-check-ring, .ts-check-mark { stroke-dashoffset:0; }
}
`;
