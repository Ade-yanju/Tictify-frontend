import { useEffect, useState } from "react";

export default function Checkout() {
  const eventId = window.location.pathname.split("/").pop();
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");
  const ticketName = params.get("ticket");

  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD EVENT ================= */
  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${eventId}`,
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        const selectedTicket = data.ticketTypes.find(
          (t) => t.name === ticketName,
        );

        if (!selectedTicket) {
          throw new Error("Invalid ticket");
        }

        setEvent(data);
        setTicket(selectedTicket);
      } catch {
        setError("Unable to prepare checkout. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId, ticketName]);

  /* ================= PAYMENT ================= */
  async function handlePayment() {
    if (!email || !ticket || processing) return;

    setProcessing(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/initiate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            email,
            ticketType: ticket.name,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Payment failed");
      }

      const data = await res.json();

      if (!data.paymentUrl) {
        throw new Error("Invalid payment response");
      }

      // Redirect to ERCASPAY checkout or success page
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err.message || "Payment initialization failed");
      setProcessing(false);
    }
  }

  /* ================= STATES ================= */
  if (loading) {
    return <div style={styles.loading}>Preparing checkout…</div>;
  }

  if (error || !event || !ticket) {
    return <div style={styles.error}>{error}</div>;
  }

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      {/* BANNER */}
      <div
        style={{
          ...styles.banner,
          backgroundImage: `url(${event.banner})`,
        }}
      />

      <div style={styles.container}>
        {/* EVENT DETAILS */}
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

        {/* CHECKOUT */}
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
                  ? "Proceed to Payment"
                  : "Confirm Free Ticket"}
            </button>

            <p style={styles.secureText}>
              🔒 Secure payment powered by ERCASPAY
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
    flexWrap: "wrap",
    gap: 14,
    color: "#CFC9D6",
    fontSize: 14,
    marginBottom: 18,
  },

  description: {
    lineHeight: 1.6,
    color: "#CFC9D6",
    fontSize: 15,
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
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  heading: {
    fontSize: 20,
    marginBottom: 20,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
    fontSize: 14,
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
  },

  secureText: {
    marginTop: 14,
    fontSize: 13,
    textAlign: "center",
    color: "#CFC9D6",
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

/* ===== RESPONSIVE DESKTOP ===== */
if (window.innerWidth >= 900) {
  styles.container.gridTemplateColumns = "2fr 1fr";
}
