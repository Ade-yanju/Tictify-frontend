import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyTicket({ event }) {
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState(
    event?.ticketTypes?.[0]?.name || "",
  );
  const [processing, setProcessing] = useState(false);

  /* ================= VALIDATION ================= */
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  const canProceed = emailValid && ticket && !processing;

  /* ================= PROCEED ================= */
  function proceedToCheckout() {
    if (!canProceed) return;

    setProcessing(true);

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

  if (!event) {
    return (
      <div style={styles.errorPage}>
        Unable to load event.
      </div>
    );
  }

  return (
    <main style={styles.page}>
      {processing && <LoadingModal />}

      {/* BACK */}
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <section style={styles.card}>
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

        {!emailValid && email && (
          <p style={styles.inputError}>
            Please enter a valid email address
          </p>
        )}

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

        <button
          style={{
            ...styles.btn,
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
          disabled={!canProceed}
          onClick={proceedToCheckout}
        >
          Continue to Checkout →
        </button>

        <p style={styles.secure}>
          🔒 Secure checkout • No account required
        </p>
      </section>
    </main>
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
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px,4vw,40px)",
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
    fontSize: 14,
  },

  card: {
    width: "100%",
    maxWidth: 460,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    padding: "clamp(24px,5vw,36px)",
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  title: {
    fontSize: "clamp(20px,4vw,26px)",
    marginBottom: 6,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
    marginBottom: 22,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    marginBottom: 14,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
  },

  inputError: {
    fontSize: 12,
    color: "#ff4d4f",
    marginBottom: 10,
  },

  btn: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    marginTop: 6,
  },

  secure: {
    marginTop: 16,
    fontSize: 12,
    textAlign: "center",
    color: "#CFC9D6",
  },

  errorPage: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
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

/* ===== SPINNER ===== */
const style = document.createElement("style");
style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
