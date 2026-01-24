import { useEffect, useState } from "react";

export default function TicketSuccess() {
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("ref");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setError("Invalid ticket reference.");
      setLoading(false);
      return;
    }

    async function loadTicket() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/by-reference/${reference}`,
        );

        if (!res.ok) throw new Error();

        const result = await res.json();
        setData(result);
      } catch {
        setError("Unable to load ticket. Please contact support.");
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [reference]);

  function downloadQR() {
    const link = document.createElement("a");
    link.href = data.ticket.qrImage;
    link.download = `ticket-${reference}.png`;
    link.click();
  }

  if (loading) {
    return <div style={styles.loading}>Preparing your ticket…</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  const { event, ticket } = data;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🎟️</div>

        <h1 style={styles.title}>Your Ticket Is Ready</h1>
        <p style={styles.subtitle}>
          Payment confirmed. Present this QR code at the event entrance.
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
