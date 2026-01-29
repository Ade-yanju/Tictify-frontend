import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function TicketSuccess() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("LOADING"); 
  // LOADING | READY | PENDING | ERROR

  const [data, setData] = useState(null);
  const [message, setMessage] = useState(
    "Confirming your payment, please wait…"
  );

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid ticket reference");
      return;
    }

    const controller = new AbortController();
    let attempts = 0;
    const MAX_ATTEMPTS = 20; // ~60 seconds

    /* ===============================
       1️⃣ VERIFY PAYMENT (ONCE)
    =============================== */
    const verifyPayment = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference }),
            signal: controller.signal,
          }
        );
      } catch {
        // Do nothing – polling will handle result
      }
    };

    verifyPayment();

    /* ===============================
       2️⃣ POLL FOR TICKET
    =============================== */
    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/by-reference/${reference}`,
          { signal: controller.signal }
        );

        const result = await res.json();

        if (result.status === "READY") {
          clearInterval(interval);
          setData(result);
          setStatus("READY");
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("PENDING");
          setMessage(
            "Your payment is still being confirmed. This may take a few minutes. Please refresh this page later."
          );
        }
      } catch {
        clearInterval(interval);
        setStatus("ERROR");
        setMessage("Unable to load ticket at the moment.");
      }
    }, 3000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [reference]);

  /* ================= UI STATES ================= */

  if (status === "LOADING") {
    return <div style={styles.loading}>{message}</div>;
  }

  if (status === "PENDING") {
    return (
      <div style={styles.pending}>
        <p>{message}</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
        <button onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div style={styles.error}>
        <p>{message}</p>
        <button onClick={() => navigate("/")}>Go Home</button>
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
    maxWidth: 520,
    width: "100%",
    background: "rgba(255,255,255,0.08)",
    padding: "40px 32px",
    borderRadius: 24,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },
  icon: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 28, marginBottom: 8 },
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
    width: 240,
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
  },
  ref: { marginTop: 20, fontSize: 12, color: "#9F97B2" },

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
  },
  pending: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#FFD666",
    gap: 12,
  },
  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
  },
};
