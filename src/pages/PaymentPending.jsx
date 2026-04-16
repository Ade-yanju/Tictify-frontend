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

  const [status, setStatus] = useState(() =>
    !reference ? "ERROR" : "PENDING",
  );
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState(() =>
    !reference
      ? "Invalid or missing payment reference."
      : "Securely verifying your payment…",
  );
  const isLocked = status === "PENDING";

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

  useEffect(() => {
    if (!reference) return;

    const interval = setInterval(async () => {
      setAttempts((prev) => {
        const next = prev + 1;
        if (next >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("ERROR");
          setMessage(
            "Verification is taking longer than expected. Your payment may still be processing.",
          );
        }
        return next;
      });

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
          setMessage("Your payment could not be confirmed. Please try again.");
        }
      } catch {
        // polling continues
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [reference, navigate]);

  const progressPct = Math.min((attempts / MAX_ATTEMPTS) * 100, 100);

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        display: "grid",
        placeItems: "center",
        padding: "clamp(16px,5vw,40px)",
        fontFamily: "var(--font-b)",
      }}
    >
      <div
        style={{
          width: "min(100%, 460px)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "clamp(32px,7vw,52px) clamp(24px,5vw,44px)",
          textAlign: "center",
          animation: "fadeUp .4s ease",
          boxShadow: "0 32px 80px rgba(0,0,0,.5)",
        }}
      >
        {/* PENDING */}
        {status === "PENDING" && (
          <>
            {/* Pulsing ring indicator */}
            <div
              style={{
                position: "relative",
                width: 80,
                height: 80,
                margin: "0 auto 32px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "var(--gold-dim)",
                  animation: "ping 1.8s ease infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 8,
                  borderRadius: "50%",
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--gold)",
                  animation: "spin 1s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                🔐
              </div>
            </div>

            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontFamily: "var(--font-h)",
                marginBottom: 12,
              }}
            >
              Processing Payment
            </p>
            <h2
              style={{
                fontFamily: "var(--font-h)",
                fontSize: "clamp(22px,4vw,28px)",
                fontWeight: 800,
                letterSpacing: "-.02em",
                marginBottom: 12,
              }}
            >
              Confirming your order
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              {message}
            </p>

            {/* Progress bar */}
            <div
              style={{
                height: 4,
                background: "var(--border)",
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg,#E8C96A,#6BF0A0)",
                  borderRadius: 4,
                  transition: "width .5s ease",
                }}
              />
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
            <h2
              style={{
                fontFamily: "var(--font-h)",
                fontSize: "clamp(20px,4vw,26px)",
                fontWeight: 800,
                color: "var(--danger)",
                marginBottom: 12,
              }}
            >
              Payment Failed
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              {message}
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: "100%",
                padding: "16px 24px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg,#E8C96A,#F5E196)",
                color: "#080910",
                fontFamily: "var(--font-h)",
                fontWeight: 700,
                fontSize: 15,
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
            <h2
              style={{
                fontFamily: "var(--font-h)",
                fontSize: "clamp(20px,4vw,26px)",
                fontWeight: 800,
                color: "var(--warn)",
                marginBottom: 12,
              }}
            >
              Verification Delayed
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              {message}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: "100%",
                  padding: "15px 24px",
                  borderRadius: 999,
                  border: "1px solid var(--gold)",
                  background: "transparent",
                  color: "var(--gold)",
                  fontFamily: "var(--font-h)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: 13,
                  padding: "8px",
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
