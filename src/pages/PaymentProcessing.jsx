import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentProcessing() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reference = params.get("ref");

  const [status, setStatus] = useState("INITIAL");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 12; // ~36 seconds

  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid payment reference");
      return;
    }

    setStatus("PENDING");
    setMessage("Waiting for payment confirmation…");

    const interval = setInterval(async () => {
      try {
        setAttempts((a) => a + 1);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/verify/${reference}`,
        );

        const data = await res.json();

        if (data.status === "SUCCESS") {
          clearInterval(interval);
          setStatus("SUCCESS");
          setMessage("Payment verified successfully 🎉");

          setTimeout(() => {
            navigate(`/success/${reference}`);
          }, 1500);
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("TIMEOUT");
          setMessage("Payment verification is taking longer than expected.");
        }
      } catch (err) {
        clearInterval(interval);
        setStatus("ERROR");
        setMessage("Unable to verify payment. Please try again.");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reference, attempts, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <StatusIcon status={status} />

        <h2 style={styles.title}>
          {status === "SUCCESS" ? "Payment Confirmed" : "Processing Payment"}
        </h2>

        <p style={styles.message}>{message}</p>

        {status === "PENDING" && (
          <div style={styles.progress}>
            <div style={styles.bar} />
          </div>
        )}

        {status === "TIMEOUT" && (
          <button style={styles.retry} onClick={() => window.location.reload()}>
            Retry Verification
          </button>
        )}

        {status === "ERROR" && (
          <button style={styles.retry} onClick={() => navigate("/")}>
            Go Home
          </button>
        )}
      </div>
    </div>
  );
}

/* ================= ICON ================= */

function StatusIcon({ status }) {
  const map = {
    INITIAL: "⏳",
    PENDING: "🔄",
    SUCCESS: "✅",
    ERROR: "❌",
    TIMEOUT: "⚠️",
  };

  return <div style={styles.icon}>{map[status] || "⏳"}</div>;
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top,#1a0f2e,#0f0618)",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "32px 28px",
    textAlign: "center",
    boxShadow: "0 30px 80px rgba(0,0,0,.4)",
  },

  icon: {
    fontSize: 48,
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    marginBottom: 10,
  },

  message: {
    fontSize: 14,
    color: "#CFC9D6",
    marginBottom: 20,
  },

  progress: {
    height: 6,
    width: "100%",
    background: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    overflow: "hidden",
  },

  bar: {
    height: "100%",
    width: "40%",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    animation: "progress 1.4s infinite",
  },

  retry: {
    marginTop: 20,
    padding: "12px 20px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
  },
};

/* ================= ANIMATION ================= */
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
`,
  styleSheet.cssRules.length,
);
