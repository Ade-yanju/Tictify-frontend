import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const ticketName = searchParams.get("ticket");

  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD EVENT ================= */
  useEffect(() => {
    if (!id || !email || !ticketName) {
      setError("Invalid checkout link.");
      setLoading(false);
      return;
    }

    async function loadEvent() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${id}`,
        );

        if (!res.ok) throw new Error("Event not found");

        const data = await res.json();

        const selectedTicket = data.ticketTypes?.find(
          (t) => t.name === ticketName,
        );

        if (!selectedTicket) {
          throw new Error("Invalid ticket selection");
        }

        setEvent(data);
        setTicket(selectedTicket);
      } catch (err) {
        setError(err.message || "Unable to prepare checkout.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, email, ticketName]);

  /* ================= PAYMENT ================= */
  async function handlePayment() {
    if (processing || !ticket) return;

    setProcessing(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/initiate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: id,
            email,
            ticketType: ticket.name,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.message || "Unable to start payment");
      }

      /**
       * 🔐 IMPORTANT:
       * We redirect ONLY to ERCASPAY.
       * Ticket is created ONLY via webhook.
       */
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err.message || "Payment failed");
      setProcessing(false);
    }
  }

  /* ================= STATES ================= */
  if (loading) {
    return <div style={styles.loading}>Preparing checkout…</div>;
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>{error}</p>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.banner,
          backgroundImage: `url(${event.banner})`,
        }}
      />

      <div style={styles.container}>
        <section style={styles.left}>
          <h1 style={styles.title}>{event.title}</h1>

          <div style={styles.meta}>
            <span>📍 {event.location || "TBA"}</span>
            <span>📅 {new Date(event.date).toDateString()}</span>
            <span>👥 Capacity: {event.capacity}</span>
          </div>

          <p style={styles.description}>
            {event.description || "No description provided."}
          </p>
        </section>

        <aside style={styles.right}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Order Summary</h2>

            <div style={styles.row}>
              <span>Ticket</span>
              <strong>{ticket.name}</strong>
            </div>

            <div style={styles.row}>
              <span>Email</span>
              <strong>{email}</strong>
            </div>

            <div style={styles.divider} />

            <div style={styles.totalRow}>
              <span>Total</span>
              <strong style={styles.total}>
                {ticket.price > 0 ? `₦${ticket.price}` : "Free"}
              </strong>
            </div>

            <button
              style={{
                ...styles.payBtn,
                opacity: processing ? 0.6 : 1,
                cursor: processing ? "not-allowed" : "pointer",
              }}
              disabled={processing}
              onClick={handlePayment}
            >
              {processing
                ? "Redirecting to payment…"
                : ticket.price > 0
                  ? "Proceed to Secure Payment"
                  : "Confirm Free Ticket"}
            </button>

            <p style={styles.secureText}>
              🔒 You’ll be redirected to ERCASPAY to complete payment
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },
  banner: {
    height: "35vh",
    minHeight: 240,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  container: {
    maxWidth: 1200,
    margin: "-70px auto 0",
    padding: "0 16px 80px",
    display: "grid",
    gap: 32,
    gridTemplateColumns: "1fr",
  },
  left: {
    background: "rgba(255,255,255,0.08)",
    padding: 28,
    borderRadius: 24,
  },
  title: {
    fontSize: "clamp(22px, 4vw, 32px)",
    marginBottom: 12,
  },
  meta: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    color: "#CFC9D6",
    fontSize: 14,
    marginBottom: 18,
  },
  description: {
    lineHeight: 1.6,
    color: "#CFC9D6",
  },
  right: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    padding: 28,
    borderRadius: 24,
  },
  heading: {
    fontSize: 20,
    marginBottom: 20,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.15)",
    margin: "16px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  total: {
    fontSize: 22,
    color: "#22F2A6",
  },
  payBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },
  secureText: {
    marginTop: 14,
    fontSize: 13,
    textAlign: "center",
    color: "#CFC9D6",
  },
  backBtn: {
    marginTop: 16,
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
  },
  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
  },
  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    color: "#ff4d4f",
  },
};

/* ===== RESPONSIVE ===== */
if (window.innerWidth >= 900) {
  styles.container.gridTemplateColumns = "2fr 1fr";
}
