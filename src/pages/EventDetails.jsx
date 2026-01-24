import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD EVENT ================= */
  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${eventId}`,
        );

        if (!res.ok) throw new Error("Event not found");

        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setError("Unable to load this event.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ================= STATES ================= */
  if (loading) {
    return <div style={styles.loading}>Loading event…</div>;
  }

  if (error || !event) {
    return <div style={styles.error}>{error}</div>;
  }

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      {/* BANNER */}
      <div style={styles.bannerWrapper}>
        <img src={event.banner} alt={event.title} style={styles.banner} />
      </div>

      <div style={styles.container}>
        {/* EVENT INFO */}
        <section style={styles.eventCard}>
          <h1 style={styles.title}>{event.title}</h1>

          <div style={styles.metaRow}>
            <span>📍 {event.location || "TBA"}</span>
            <span>📅 {new Date(event.date).toDateString()}</span>
            <span>👥 Capacity: {event.capacity}</span>
          </div>

          <p style={styles.description}>
            {event.description || "No description provided."}
          </p>
        </section>

        {/* PURCHASE */}
        <aside style={styles.purchaseCard}>
          <h2 style={styles.sectionTitle}>Select Ticket</h2>

          {event.ticketTypes?.map((ticket) => (
            <label key={ticket.name} style={styles.ticketOption}>
              <input
                type="radio"
                name="ticket"
                checked={selectedTicket?.name === ticket.name}
                onChange={() => setSelectedTicket(ticket)}
              />
              <span>
                {ticket.name} —{" "}
                {ticket.price > 0 ? `₦${ticket.price}` : "Free"}
              </span>
            </label>
          ))}

          <input
            type="email"
            placeholder="Enter your email address"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {!emailValid && email && (
            <p style={styles.inputError}>Enter a valid email address</p>
          )}

          <button
            style={{
              ...styles.buyBtn,
              opacity: emailValid && selectedTicket ? 1 : 0.5,
              cursor:
                emailValid && selectedTicket ? "pointer" : "not-allowed",
            }}
            disabled={!emailValid || !selectedTicket}
            onClick={() =>
              navigate(
                `/checkout/${event._id}?ticket=${encodeURIComponent(
                  selectedTicket.name,
                )}&email=${encodeURIComponent(email)}`,
              )
            }
          >
            Proceed to Checkout →
          </button>

          <p style={styles.secureNote}>
            🔒 Secure payment • QR ticket generated after payment
          </p>
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

  bannerWrapper: {
    width: "100%",
    height: 260,
    overflow: "hidden",
  },

  banner: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 20px",
    display: "grid",
    gap: 32,
    gridTemplateColumns: "1fr",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "2fr 1fr",
    },
  },

  eventCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 28,
  },

  title: {
    marginBottom: 12,
    fontSize: 28,
  },

  metaRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    color: "#CFC9D6",
    marginBottom: 20,
    fontSize: 14,
  },

  description: {
    lineHeight: 1.6,
    fontSize: 15,
    color: "#E5E1F0",
  },

  purchaseCard: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    padding: 28,
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },

  ticketOption: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    fontSize: 14,
    cursor: "pointer",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    marginTop: 12,
    outline: "none",
  },

  inputError: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: 6,
  },

  buyBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    marginTop: 16,
  },

  secureNote: {
    marginTop: 14,
    fontSize: 13,
    color: "#CFC9D6",
    textAlign: "center",
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
