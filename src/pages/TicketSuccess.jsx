import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function TicketSuccess() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [status, setStatus] = useState("LOADING"); // LOADING | READY | ERROR
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("Preparing your ticket…");

  /* ================= LOAD TICKET ================= */
  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid ticket reference");
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    const controller = new AbortController();

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/by-reference/${reference}`,
          { signal: controller.signal },
        );

        const result = await res.json();

        if (result?.status === "READY") {
          clearInterval(interval);
          setData(result);
          setStatus("READY");
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("ERROR");
          setMessage(
            "We could not load your ticket. Please refresh the page or contact support.",
          );
        }
      } catch {
        clearInterval(interval);
        setStatus("ERROR");
        setMessage("Unable to load ticket at the moment.");
      }
    }, 1000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [reference]);

  /* ================= SWIPE BACK ================= */
  useEffect(() => {
    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 80) {
        navigate("/");
      }
    };

    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);

    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate]);

  /* ================= LOADING ================= */
  if (status === "LOADING") {
    return (
      <div style={styles.page}>
        <LoadingModal message={message} />
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (status === "ERROR") {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <p style={styles.muted}>{message}</p>

          <div style={styles.errorActions}>
            <button style={styles.secondaryBtn} onClick={() => window.location.reload()}>
              Refresh
            </button>
            <button style={styles.primaryBtn} onClick={() => navigate("/")}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { event, ticket } = data;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🎟️</div>

        <h1 style={styles.title}>Your Ticket Is Ready</h1>
        <p style={styles.subtitle}>
          Present this QR code at the event entrance
        </p>

        <div style={styles.info}>
          <strong>{event.title}</strong>
          <p>{new Date(event.date).toDateString()}</p>
          <p>{event.location}</p>
          <p>
            Ticket Type: <strong>{ticket.ticketType}</strong>
          </p>
        </div>

        <img src={ticket.qrImage} alt="QR Code" style={styles.qr} />

        <button
          style={styles.primaryBtn}
          onClick={() => {
            const link = document.createElement("a");
            link.href = ticket.qrImage;
            link.download = `ticket-${reference}.png`;
            link.click();
          }}
        >
          Download QR Code
        </button>

        <p style={styles.ref}>Reference: {reference}</p>
      </div>
    </div>
  );
}

/* ================= LOADING MODAL ================= */
function LoadingModal({ message }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 14 }}>{message}</p>
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
    maxWidth: 520,
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(28px,5vw,40px)",
    borderRadius: 24,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  icon: { fontSize: 56, marginBottom: 12 },

  title: {
    fontSize: "clamp(22px,4vw,28px)",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#CFC9D6",
    marginBottom: 24,
  },

  info: {
    fontSize: 14,
    color: "#E5E1F0",
    marginBottom: 20,
    lineHeight: 1.6,
  },

  qr: {
    width: "min(240px, 80vw)",
    margin: "20px auto",
    padding: 14,
    background: "#fff",
    borderRadius: 14,
  },

  primaryBtn: {
    padding: "14px 22px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },

  secondaryBtn: {
    padding: "12px 18px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.3)",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },

  ref: {
    marginTop: 20,
    fontSize: 12,
    color: "#9F97B2",
    wordBreak: "break-all",
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
    textAlign: "center",
  },

  errorCard: {
    background: "rgba(255,255,255,0.08)",
    padding: 32,
    borderRadius: 20,
    textAlign: "center",
    maxWidth: 420,
    width: "100%",
  },

  errorActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
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
