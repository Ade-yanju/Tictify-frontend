import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyTicket({ event }) {
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState(event.ticketTypes?.[0]?.name || "");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  /* ================= VALIDATION ================= */
  const isValidEmail = email.includes("@");
  const canProceed = isValidEmail && ticket && !processing;

  /* ================= PROCEED ================= */
  function proceedToCheckout() {
    if (!canProceed) return;

    setProcessing(true);
    setError("");

    navigate(
      `/checkout/${event._id}?email=${encodeURIComponent(
        email,
      )}&ticket=${encodeURIComponent(ticket)}`,
    );
  }

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

  return (
    <div style={styles.page}>
      {processing && <LoadingModal />}

      {/* BACK */}
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>{event.title}</h2>
        <p style={styles.muted}>{event.location || "TBA"}</p>

        {/* EMAIL */}
        <input
          style={styles.input}
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* TICKET TYPES */}
        {event.ticketTypes?.length > 0 && (
          <select
            style={styles.input}
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
          >
            {event.ticketTypes.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} — {t.price > 0 ? `₦${t.price}` : "Free"}
              </option>
            ))}
          </select>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{
            ...styles.btn,
            opacity: canProceed ? 1 : 0.6,
          }}
          disabled={!canProceed}
          onClick={proceedToCheckout}
        >
          Continue to Checkout →
        </button>

        <p style={styles.secure}>
          🔒 Secure checkout • No account required
        </p>
      </div>
    </div>
  );
}

/* ================= LOADING MODAL ================= */
function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12 }}>Preparing checkout…</p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px,4vw,32px)",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
    position: "relative",
  },

  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(24px,5vw,32px)",
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  title: {
    marginBottom: 6,
    fontSize: 22,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
    marginBottom: 20,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
  },

  btn: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  secure: {
    marginTop: 14,
    fontSize: 12,
    textAlign: "center",
    color: "#CFC9D6",
  },

  error: {
    color: "#ff4d4f",
    fontSize: 13,
    marginBottom: 12,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
    zIndex: 2000,
  },

  loadingModal: {
    background: "#1A0F2E",
    padding: 28,
    borderRadius: 18,
    textAlign: "center",
    width: "90%",
    maxWidth: 320,
  },

  spinner: {
    width: 34,
    height: 34,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
