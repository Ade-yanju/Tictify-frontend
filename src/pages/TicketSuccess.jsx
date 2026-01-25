import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function TicketSuccess() {
  const navigate = useNavigate();
  const { reference} = useParams();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("PROCESSING"); // PROCESSING | READY | ERROR
  const [message, setMessage] = useState("Finalizing your ticket…");

  const MAX_ATTEMPTS = 15; // ~45 seconds
  const INTERVAL = 3000;

  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid ticket reference.");
      return;
    }

    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/by-reference/${reference}`,
        );

        // Ticket not ready yet
        if (res.status === 404) {
          if (attempts >= MAX_ATTEMPTS) {
            clearInterval(interval);
            setStatus("ERROR");
            setMessage(
              "Payment confirmed, but ticket generation is delayed. Please refresh shortly.",
            );
          }
          return;
        }

        if (!res.ok) throw new Error();

        const result = await res.json();

        clearInterval(interval);
        setData(result);
        setStatus("READY");
        setMessage("Your ticket is ready 🎉");
      } catch {
        clearInterval(interval);
        setStatus("ERROR");
        setMessage("Unable to load ticket. Please contact support.");
      }
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [reference]);

  function downloadQR() {
    const link = document.createElement("a");
    link.href = data.ticket.qrImage;
    link.download = `ticket-${reference}.png`;
    link.click();
  }

  /* ================= STATES ================= */

  if (status === "PROCESSING") {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>🔄</div>
        <h2>Processing Payment</h2>
        <p>{message}</p>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div style={styles.error}>
        <h2>Something went wrong</h2>
        <p>{message}</p>
        <button onClick={() => window.location.reload()} style={styles.retry}>
          Retry
        </button>
      </div>
    );
  }

  const { event, ticket } = data;

  /* ================= READY ================= */

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🎟️</div>

        <h1>Your Ticket Is Ready</h1>
        <p>Present this QR code at the event entrance.</p>

        <div style={styles.info}>
          <strong>{event.title}</strong>
          <p>{new Date(event.date).toDateString()}</p>
          <p>{event.location}</p>
          <p>
            Ticket Type: <strong>{ticket.ticketType}</strong>
          </p>
        </div>

        <img src={ticket.qrImage} alt="QR Code" style={styles.qr} />

        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={downloadQR}>
            Download QR Code
          </button>
          <button style={styles.secondaryBtn} onClick={() => window.print()}>
            Print Ticket
          </button>
        </div>

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

  icon: {
    fontSize: 56,
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
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
    width: 240,
    margin: "20px auto",
    padding: 14,
    background: "#fff",
    borderRadius: 14,
  },

  actions: {
    display: "flex",
    gap: 12,
    marginTop: 20,
    flexWrap: "wrap",
  },

  primaryBtn: {
    flex: 1,
    padding: "14px 22px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryBtn: {
    flex: 1,
    padding: "14px 22px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },

  links: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },

  linkBtn: {
    background: "none",
    border: "none",
    color: "#22F2A6",
    cursor: "pointer",
    fontSize: 14,
  },

  ref: {
    marginTop: 20,
    fontSize: 12,
    color: "#9F97B2",
  },

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
  },

  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
  },
};
