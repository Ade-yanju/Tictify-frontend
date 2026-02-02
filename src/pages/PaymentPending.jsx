import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("ref");

  const touchStartX = useRef(0);
  const attempts = useRef(0);

  const [status, setStatus] = useState("PENDING"); // PENDING | FAILED | ERROR
  const [message, setMessage] = useState(
    "Please wait while we verify your payment.",
  );

  /* ================= SWIPE BACK ================= */
  useEffect(() => {
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
  }, [navigate]);

  /* ================= PAYMENT STATUS POLLING ================= */
  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid payment reference.");
      return;
    }

    const MAX_ATTEMPTS = 20; // ~60 seconds

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
        }

        if (data.status === "FAILED") {
          clearInterval(interval);
          setStatus("FAILED");
          setMessage("Your payment could not be confirmed.");
        }

        if (attempts.current >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("ERROR");
          setMessage(
            "Payment verification is taking longer than expected. Please refresh or contact support.",
          );
        }
      } catch {
        // silent retry until timeout
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reference, navigate]);

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === "PENDING" && (
          <>
            <div style={styles.spinner} />
            <h2 style={styles.title}>Confirming Payment</h2>
            <p style={styles.text}>{message}</p>
            <p style={styles.note}>Do not close this page</p>
          </>
        )}

        {status === "FAILED" && (
          <>
            <h2 style={{ color: "#ff4d4f" }}>Payment Failed</h2>
            <p style={styles.text}>{message}</p>
            <button style={styles.primaryBtn} onClick={() => navigate(-1)}>
              Try Again
            </button>
          </>
        )}

        {status === "ERROR" && (
          <>
            <h2 style={{ color: "#fadb14" }}>Verification Delayed</h2>
            <p style={styles.text}>{message}</p>
            <button
              style={styles.secondaryBtn}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px,4vw,32px)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(28px,5vw,36px)",
    borderRadius: 24,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  spinner: {
    width: 48,
    height: 48,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTopColor: "#22F2A6",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },

  title: {
    fontSize: 22,
    marginBottom: 6,
  },

  text: {
    fontSize: 14,
    color: "#CFC9D6",
    marginTop: 8,
    lineHeight: 1.5,
  },

  note: {
    marginTop: 12,
    fontSize: 12,
    color: "#9F97B2",
  },

  primaryBtn: {
    marginTop: 22,
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryBtn: {
    marginTop: 18,
    width: "100%",
    padding: 12,
    borderRadius: 999,
    border: "1px solid #22F2A6",
    background: "transparent",
    color: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
  },
};

/* ================= KEYFRAMES ================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
