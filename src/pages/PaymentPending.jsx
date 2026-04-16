import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/* ─── Inject global styles once ─────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("pp-styles")) {
  const s = document.createElement("style");
  s.id = "pp-styles";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-0: #04050a;
      --surface: rgba(255,255,255,0.045);
      --border: rgba(255,255,255,0.09);
      --border-strong: rgba(255,255,255,0.16);
      --accent: #4DF0B0;
      --accent-dim: rgba(77,240,176,0.1);
      --danger: #F05C5C;
      --warn: #F0A84D;
      --text: #EEE9E0;
      --muted: #6E6A62;
      --muted-2: #9C9790;
      --font-d: 'Bricolage Grotesque', sans-serif;
      --font-b: 'Instrument Sans', sans-serif;
      --r: 20px;
      --r-pill: 999px;
    }

    html { font-size: 16px; }
    body { background: var(--bg-0); color: var(--text); font-family: var(--font-b); -webkit-font-smoothing: antialiased; }

    @keyframes pp-spin  { to { transform: rotate(360deg); } }
    @keyframes pp-ping  { 0% { transform: scale(1); opacity:.7; } 80%,100% { transform: scale(2.5); opacity:0; } }
    @keyframes pp-rise  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pp-blink { 0%,100% { opacity:1; } 50% { opacity:.25; } }

    .pp-btn-primary:hover  { opacity: .88; transform: translateY(-1px); }
    .pp-btn-outline:hover  { background: rgba(77,240,176,0.08); }
    .pp-btn-ghost:hover    { color: var(--muted-2); }

    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  `;
  document.head.appendChild(s);
}

const MAX_ATTEMPTS = 20;
const POLL_INTERVAL = 3000;

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("ref");
  const touchStartX = useRef(0);

  const [status, setStatus] = useState("PENDING");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState(
    "Please wait while we securely verify your payment.",
  );
  const isLocked = status === "PENDING";

  /* ── swipe back ── */
  useEffect(() => {
    if (isLocked) return;
    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 80) navigate(-1);
    };
    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate, isLocked]);

  /* ── polling ── */
  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid or missing payment reference.");
      return;
    }

    const interval = setInterval(async () => {
      setAttempts((prev) => prev + 1);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/status/${reference}`,
        );
        const data = await res.json();

        if (data.status === "SUCCESS") {
          clearInterval(interval);
          navigate(`/success?ref=${reference}`, { replace: true });
          return;
        }
        if (data.status === "FAILED") {
          clearInterval(interval);
          setStatus("FAILED");
          setMessage("Your payment could not be confirmed.");
          return;
        }

        setAttempts((prev) => {
          if (prev >= MAX_ATTEMPTS) {
            clearInterval(interval);
            setStatus("ERROR");
            setMessage(
              "Verification is taking longer than expected. Your payment may still succeed.",
            );
          }
          return prev;
        });
      } catch {
        setAttempts((prev) => {
          if (prev >= MAX_ATTEMPTS) {
            clearInterval(interval);
            setStatus("ERROR");
            setMessage(
              "Unable to verify payment at the moment. Please refresh or contact support.",
            );
          }
          return prev;
        });
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [reference, navigate]);

  const progressPct = Math.min((attempts / MAX_ATTEMPTS) * 100, 100);

  return (
    <main style={css.page} aria-live="polite" aria-busy={status === "PENDING"}>
      <div style={css.glowBlob} aria-hidden="true" />

      <section style={css.card}>
        {/* ── PENDING ── */}
        {status === "PENDING" && (
          <div style={css.inner}>
            <div style={css.ringWrap}>
              <div style={css.pingRing} />
              <div style={css.spinRing} />
              <span style={css.ringEmoji}>🔐</span>
            </div>

            <p style={css.overline}>Processing Payment</p>
            <h2 style={css.heading}>Confirming your order</h2>
            <p style={css.body}>{message}</p>

            <div style={css.progressTrack}>
              <div style={{ ...css.progressFill, width: `${progressPct}%` }} />
            </div>

            <div style={css.metaRow}>
              <span style={css.liveDot} aria-hidden="true" />
              <span style={css.metaText}>
                Check {attempts} of {MAX_ATTEMPTS} · Do not close this page
              </span>
            </div>
          </div>
        )}

        {/* ── FAILED ── */}
        {status === "FAILED" && (
          <div style={css.inner}>
            <div style={{ ...css.bigIcon, color: "var(--danger)" }}>✕</div>
            <h2 style={{ ...css.heading, color: "var(--danger)" }}>
              Payment Failed
            </h2>
            <p style={css.body}>{message}</p>
            <button
              className="pp-btn-primary"
              style={css.btnPrimary}
              onClick={() => navigate(-1)}
            >
              ← Try Again
            </button>
          </div>
        )}

        {/* ── ERROR / TIMEOUT ── */}
        {status === "ERROR" && (
          <div style={css.inner}>
            <div style={{ ...css.bigIcon, color: "var(--warn)" }}>⏱</div>
            <h2 style={{ ...css.heading, color: "var(--warn)" }}>
              Verification Delayed
            </h2>
            <p style={css.body}>{message}</p>
            <div style={css.btnStack}>
              <button
                className="pp-btn-outline"
                style={css.btnOutline}
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                className="pp-btn-ghost"
                style={css.btnGhost}
                onClick={() => navigate("/")}
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
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
    width: "min(100%, 460px)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,.6)",
    animation: "pp-rise .45s cubic-bezier(.22,1,.36,1) both",
    overflow: "hidden",
  },

  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "clamp(36px,8vw,56px) clamp(20px,6vw,44px) clamp(32px,7vw,48px)",
  },

  ringWrap: {
    position: "relative",
    width: "clamp(68px,15vw,84px)",
    height: "clamp(68px,15vw,84px)",
    marginBottom: "clamp(20px,4vw,28px)",
    flexShrink: 0,
  },
  pingRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: "var(--accent-dim, rgba(77,240,176,0.1))",
    animation: "pp-ping 2.2s ease-out infinite",
  },
  spinRing: {
    position: "absolute",
    inset: 7,
    borderRadius: "50%",
    border: "2.5px solid var(--border-strong)",
    borderTopColor: "var(--accent)",
    animation: "pp-spin 1s linear infinite",
  },
  ringEmoji: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(22px,5vw,27px)",
  },

  bigIcon: {
    fontSize: "clamp(38px,10vw,52px)",
    fontWeight: 800,
    fontFamily: "var(--font-d)",
    lineHeight: 1,
    marginBottom: "clamp(14px,3vw,20px)",
  },

  overline: {
    fontSize: "clamp(9px,2vw,10.5px)",
    fontWeight: 700,
    letterSpacing: ".13em",
    textTransform: "uppercase",
    color: "var(--accent)",
    fontFamily: "var(--font-d)",
    marginBottom: "clamp(8px,2vw,10px)",
  },

  heading: {
    fontFamily: "var(--font-d)",
    fontSize: "clamp(19px,5vw,26px)",
    fontWeight: 800,
    letterSpacing: "-.025em",
    lineHeight: 1.2,
    marginBottom: "clamp(10px,2.5vw,14px)",
    color: "var(--text)",
  },

  body: {
    fontSize: "clamp(12.5px,3vw,14px)",
    color: "var(--muted-2)",
    lineHeight: 1.75,
    maxWidth: "32ch",
    marginBottom: "clamp(24px,5vw,32px)",
  },

  progressTrack: {
    width: "100%",
    height: 3,
    background: "var(--border)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: "clamp(10px,2.5vw,14px)",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--accent) 0%, #a0f5d8 100%)",
    borderRadius: 4,
    transition: "width .65s ease",
    minWidth: "2%",
  },

  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  liveDot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--accent)",
    flexShrink: 0,
    animation: "pp-blink 1.5s ease infinite",
  },
  metaText: {
    fontSize: "clamp(10px,2.2vw,11.5px)",
    color: "var(--muted)",
    letterSpacing: ".01em",
  },

  btnPrimary: {
    marginTop: "clamp(6px,2vw,10px)",
    width: "100%",
    padding: "clamp(13px,3vw,16px) 24px",
    borderRadius: "var(--r-pill)",
    border: "none",
    background: "linear-gradient(135deg, #4DF0B0 0%, #a0f5d8 100%)",
    color: "#030810",
    fontFamily: "var(--font-d)",
    fontWeight: 700,
    fontSize: "clamp(13px,3vw,15px)",
    cursor: "pointer",
    letterSpacing: "-.01em",
    transition: "opacity .15s, transform .15s",
  },

  btnOutline: {
    width: "100%",
    padding: "clamp(12px,3vw,15px) 24px",
    borderRadius: "var(--r-pill)",
    border: "1px solid rgba(77,240,176,0.35)",
    background: "transparent",
    color: "var(--accent)",
    fontFamily: "var(--font-d)",
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
    fontFamily: "var(--font-b)",
    transition: "color .15s",
  },

  btnStack: {
    marginTop: "clamp(6px,2vw,10px)",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
