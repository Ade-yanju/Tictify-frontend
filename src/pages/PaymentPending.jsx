import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("ref");

  const [status, setStatus] = useState("PENDING");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setError("Invalid payment reference");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/status/${reference}`,
        );

        const data = await res.json();

        if (data.status === "SUCCESS") {
          clearInterval(interval);
          navigate(`/success?ref=${reference}`);
        }

        if (data.status === "FAILED") {
          clearInterval(interval);
          setStatus("FAILED");
        }
      } catch {
        // silent retry
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [reference, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === "PENDING" && (
          <>
            <div style={styles.spinner} />
            <h2>Confirming Payment</h2>
            <p style={styles.text}>
              Please wait while we verify your payment with the provider.
            </p>
          </>
        )}

        {status === "FAILED" && (
          <>
            <h2 style={{ color: "#ff4d4f" }}>Payment Failed</h2>
            <p style={styles.text}>
              Your payment could not be confirmed. Please try again.
            </p>
            <button style={styles.primaryBtn} onClick={() => navigate(-1)}>
              Try Again
            </button>
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}
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
    padding: 20,
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    padding: 36,
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

  text: {
    fontSize: 14,
    color: "#CFC9D6",
    marginTop: 8,
  },

  primaryBtn: {
    marginTop: 20,
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  error: {
    marginTop: 16,
    color: "#ff4d4f",
    fontSize: 13,
  },
};

/* ===== SPINNER ANIMATION ===== */
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`,
  styleSheet.cssRules.length,
);
