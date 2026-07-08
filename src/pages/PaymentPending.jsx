/* ═══════════════════════════════════════════════════════════
   PaymentPending.jsx — Tictify 2026
   Payment status card · Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
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

const MAX_ATTEMPTS = 20;
const POLL_INTERVAL = 3000;

export default function PaymentPending() {
  injectStyles("tictify-payment-pending-css", CSS);

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
    <main className="pp-page" aria-live="polite" aria-busy={status === "PENDING"}>
      <div className="pp-glow pp-glow-a" aria-hidden="true" />
      <div className="pp-glow pp-glow-b" aria-hidden="true" />

      <section className="pp-card">
        {/* ── PENDING ── */}
        {status === "PENDING" && (
          <div className="pp-inner">
            <div className="pp-ring" aria-hidden="true">
              <span className="pp-ring-pulse" />
              <span className="pp-ring-spin" />
              <span className="pp-ring-core">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="5" y="10" width="14" height="10" rx="2.5" />
                  <path d="M8 10V7.5a4 4 0 018 0V10" strokeLinecap="round" />
                  <path d="M12 14.2v2" strokeLinecap="round" />
                </svg>
              </span>
            </div>

            <p className="pp-overline">Secure checkout</p>
            <h2 className="pp-h2">Payment processing</h2>
            <p className="pp-body">{message}</p>

            <div className="pp-track">
              <div className="pp-fill" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="pp-meta">
              <span className="pp-live-dot" aria-hidden="true" />
              <span className="pp-meta-text">
                Check {attempts} of {MAX_ATTEMPTS} · Do not close this page
              </span>
            </div>
          </div>
        )}

        {/* ── FAILED ── */}
        {status === "FAILED" && (
          <div className="pp-inner">
            <div className="pp-status-icon pp-status-danger" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="pp-h2 pp-h2-danger">Payment Failed</h2>
            <p className="pp-body">{message}</p>
            <button
              className="pp-btn pp-btn-gold pp-w100"
              onClick={() => navigate(-1)}
            >
              ← Try Again
            </button>
          </div>
        )}

        {/* ── ERROR / TIMEOUT ── */}
        {status === "ERROR" && (
          <div className="pp-inner">
            <div className="pp-status-icon pp-status-warn" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9.5V13l2.5 2M9.5 2.5h5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="pp-h2 pp-h2-warn">Verification Delayed</h2>
            <p className="pp-body">{message}</p>
            <div className="pp-stack">
              <button
                className="pp-btn pp-btn-outline pp-w100"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                className="pp-btn-ghost"
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
.pp-page {
  min-height:100svh; background:var(--bg);
  display:grid; place-items:center;
  padding:clamp(20px,5vw,56px) clamp(14px,4vw,28px);
  position:relative; isolation:isolate; overflow-x:clip;
}

/* ── Ambient glows ── */
.pp-glow { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; z-index:0; }
.pp-glow-a { top:-140px; left:50%; transform:translateX(-50%); width:min(620px,85vw); height:360px; background:radial-gradient(ellipse at center, var(--gold-dim), transparent 65%); animation:pp-breathe 6s ease-in-out infinite; }
.pp-glow-b { bottom:-120px; right:-120px; width:340px; height:340px; background:radial-gradient(circle at center, rgba(232,201,106,0.07), transparent 65%); animation:pp-breathe 8s ease-in-out infinite 1.5s; }
@keyframes pp-breathe { 0%,100%{opacity:.5} 50%{opacity:1} }

/* ── Status card ── */
.pp-card {
  position:relative; z-index:1; width:min(100%,460px);
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--r); overflow:hidden;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 90px rgba(0,0,0,.65);
  animation:pp-rise .5s cubic-bezier(.22,1,.36,1) both;
}
@keyframes pp-rise { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }

.pp-inner {
  display:flex; flex-direction:column; align-items:center; text-align:center;
  padding:clamp(36px,9vw,56px) clamp(22px,6vw,44px) clamp(32px,8vw,48px);
}

/* ── Pulsing gold spinner ring ── */
.pp-ring { position:relative; width:clamp(72px,17vw,92px); height:clamp(72px,17vw,92px); margin-bottom:clamp(22px,5vw,30px); flex-shrink:0; }
.pp-ring-pulse {
  position:absolute; inset:0; border-radius:50%;
  background:var(--gold-dim); box-shadow:0 0 0 1px rgba(232,201,106,.25);
  animation:pp-ping 2.2s cubic-bezier(0,0,.2,1) infinite;
}
@keyframes pp-ping { 0% { transform:scale(1); opacity:.8; } 75%,100% { transform:scale(2.1); opacity:0; } }
.pp-ring-spin {
  position:absolute; inset:6px; border-radius:50%;
  border:2.5px solid var(--border-h); border-top-color:var(--gold);
  animation:pp-spin 1s linear infinite;
  filter:drop-shadow(0 0 8px var(--gold-glo));
}
@keyframes pp-spin { to { transform:rotate(360deg); } }
.pp-ring-core { position:absolute; inset:0; display:grid; place-items:center; color:var(--gold); }
.pp-ring-core svg { width:clamp(24px,6vw,30px); height:clamp(24px,6vw,30px); }

/* ── Copy ── */
.pp-overline { color:var(--gold); font-size:11px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; margin-bottom:9px; }
.pp-h2 { font-family:var(--font-h); font-weight:800; font-size:clamp(21px,5.4vw,28px); letter-spacing:-.02em; line-height:1.15; margin-bottom:clamp(10px,2.5vw,14px); }
.pp-h2-danger { color:var(--danger); }
.pp-h2-warn { color:var(--gold); }
.pp-body { color:var(--muted); font-size:clamp(13px,3vw,14.5px); line-height:1.7; max-width:34ch; margin-bottom:clamp(24px,6vw,32px); }

/* ── Progress ── */
.pp-track { width:100%; height:3px; background:var(--border); border-radius:4px; overflow:hidden; margin-bottom:clamp(12px,3vw,16px); }
.pp-fill { height:100%; min-width:2%; border-radius:4px; background:linear-gradient(90deg, var(--gold), #f5e3a8); transition:width .65s ease; }

.pp-meta { display:flex; align-items:center; gap:8px; }
.pp-live-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--live); flex-shrink:0; animation:pp-blink 1.6s ease infinite; }
@keyframes pp-blink { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.35; transform:scale(.8); } }
.pp-meta-text { color:var(--muted); font-size:clamp(10.5px,2.4vw,12px); letter-spacing:.01em; font-variant-numeric:tabular-nums; }

/* ── Status icons ── */
.pp-status-icon {
  width:clamp(56px,13vw,64px); height:clamp(56px,13vw,64px); border-radius:18px;
  display:grid; place-items:center; margin-bottom:clamp(16px,4vw,22px);
  animation:pp-pop .5s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes pp-pop { from { transform:scale(.5); opacity:0; } to { transform:scale(1); opacity:1; } }
.pp-status-icon svg { width:45%; height:45%; }
.pp-status-danger { background:rgba(224,92,92,0.1); border:1px solid rgba(224,92,92,0.3); color:var(--danger); }
.pp-status-warn { background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); color:var(--gold); }

/* ── Buttons ── */
.pp-w100 { width:100%; }
.pp-btn {
  border-radius:999px; border:1px solid transparent;
  font-family:var(--font-h); font-weight:700; font-size:clamp(13.5px,3.2vw,15px); letter-spacing:-.01em;
  padding:clamp(13px,3.2vw,15px) 26px;
  transition:transform .25s, box-shadow .25s, background .25s, border-color .25s, opacity .25s;
}
.pp-btn-gold { background:var(--gold); color:#080910; }
.pp-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 34px var(--gold-glo); }
.pp-btn-outline { background:transparent; color:var(--text); border-color:var(--border); }
.pp-btn-outline:hover { border-color:var(--border-h); background:var(--card); transform:translateY(-2px); }
.pp-btn-ghost {
  background:none; border:none; color:var(--muted);
  font-family:var(--font-b); font-size:clamp(12.5px,2.8vw,13.5px); font-weight:500;
  padding:8px 6px; transition:color .25s;
}
.pp-btn-ghost:hover { color:var(--gold); }
.pp-stack { width:100%; display:flex; flex-direction:column; align-items:center; gap:clamp(9px,2.2vw,12px); }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 1024px) {
  .pp-glow-b { width:280px; height:280px; }
}
@media (max-width: 768px) {
  .pp-glow-b { bottom:-140px; right:-160px; }
}
@media (max-width: 480px) {
  .pp-glow-b { display:none; }
  .pp-inner { padding-left:18px; padding-right:18px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .pp-ring-pulse { opacity:0; }
}
`;
