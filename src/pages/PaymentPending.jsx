import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const MAX_ATTEMPTS = 20; // ~60s
const POLL_INTERVAL = 3000; // 3s

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("ref");

  const touchStartX = useRef(0);
  const attempts = useRef(0);

  const [status, setStatus] = useState("PENDING");
  // PENDING | FAILED | ERROR

  const [message, setMessage] = useState(
    "Please wait while we securely verify your payment.",
  );

  const isLocked = status === "PENDING";

  /* ================= SAFE SWIPE BACK ================= */
  useEffect(() => {
    if (isLocked) return;

    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 80) {
        navigate(-1);
      }
    };

    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);

    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate, isLocked]);

  /* ================= PAYMENT STATUS POLLING ================= */
  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid or missing payment reference.");
      return;
    }

    const interval = setInterval(async () => {
      attempts.current++;

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

        if (attempts.current >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("ERROR");
          setMessage(
            "Verification is taking longer than expected. Your payment may still succeed.",
          );
        }
      } catch {
        if (attempts.current >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("ERROR");
          setMessage(
            "Unable to verify payment at the moment. Please refresh or contact support.",
          );
        }
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [reference, navigate]);

  /* ================= UI ================= */
  return (
    <main style={styles.page}>
      <section
        style={styles.card}
        aria-live="polite"
        aria-busy={status === "PENDING"}
      >
        {status === "PENDING" && (
          <>
            <div style={styles.spinner} />
            <h2 style={styles.title}>Confirming Payment</h2>
            <p style={styles.text}>{message}</p>
            <p style={styles.note}>
              Attempt {attempts.current + 1} of {MAX_ATTEMPTS}
            </p>
            <p style={styles.note}>Please do not close this page.</p>
          </>
        )}

        {status === "FAILED" && (
          <>
            <h2 style={styles.failed}>Payment Failed</h2>
            <p style={styles.text}>{message}</p>

            <button style={styles.primaryBtn} onClick={() => navigate(-1)}>
              Try Again
            </button>
          </>
        )}

        {status === "ERROR" && (
          <>
            <h2 style={styles.warning}>Verification Delayed</h2>
            <p style={styles.text}>{message}</p>

            <button
              style={styles.secondaryBtn}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>

            <button style={styles.linkBtn} onClick={() => navigate("/")}>
              Go Home
            </button>
          </>
        )}
      </section>
    </main>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100svh",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px,4vw,40px)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: "100%",
    maxWidth: 440,
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(24px,5vw,40px)",
    borderRadius: 24,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  spinner: {
    width: 52,
    height: 52,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTopColor: "#22F2A6",
    borderRadius: "50%",
    margin: "0 auto 22px",
    animation: "spin 1s linear infinite",
  },

  title: {
    fontSize: "clamp(20px,4vw,24px)",
    marginBottom: 6,
  },

  failed: {
    color: "#ff4d4f",
    fontSize: 22,
    marginBottom: 8,
  },

  warning: {
    color: "#fadb14",
    fontSize: 22,
    marginBottom: 8,
  },

  text: {
    fontSize: 14,
    color: "#CFC9D6",
    lineHeight: 1.6,
    marginTop: 10,
  },

  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#9F97B2",
  },

  primaryBtn: {
    marginTop: 24,
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryBtn: {
    marginTop: 16,
    width: "100%",
    padding: 12,
    borderRadius: 999,
    border: "1px solid #22F2A6",
    background: "transparent",
    color: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
  },

  linkBtn: {
    marginTop: 14,
    background: "none",
    border: "none",
    color: "#CFC9D6",
    cursor: "pointer",
    fontSize: 13,
  },
};

/* ================= KEYFRAMES ================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}
`;
document.head.appendChild(style);
