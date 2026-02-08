import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD EVENT ================= */
  useEffect(() => {
    if (!id) {
      setError("Invalid event link.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${id}`,
        );

        if (!res.ok) throw new Error();
        const data = await res.json();
        setEvent(data);
      } catch {
        setError("Unable to load this event.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ================= HELPERS ================= */
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  if (loading) {
    return <div style={styles.loading}>Loading event…</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <main style={styles.page}>
      {/* BANNER */}
      <div style={styles.bannerWrapper}>
        <img src={event.banner} alt={event.title} style={styles.banner} />
      </div>

      {/* CONTENT */}
      <div style={styles.container}>
        {/* EVENT INFO */}
        <section style={styles.eventCard}>
          <h1 style={styles.title}>{event.title}</h1>

          <div style={styles.metaRow}>
            <span>📍 {event.location}</span>
            <span>📅 {new Date(event.date).toDateString()}</span>
          </div>

          <p style={styles.description}>{event.description}</p>
        </section>

        {/* PURCHASE */}
        <aside style={styles.purchaseCard}>
          <h3 style={styles.sectionTitle}>Tickets</h3>

          {event.ticketTypes.map((ticket) => (
            <label key={ticket.name} style={styles.ticketOption}>
              <input
                type="radio"
                name="ticket"
                checked={selectedTicket?.name === ticket.name}
                onChange={() => setSelectedTicket(ticket)}
              />
              <span>
                {ticket.name} — {ticket.price > 0 ? `₦${ticket.price}` : "Free"}
              </span>
            </label>
          ))}

          <input
            style={styles.input}
            placeholder="Your email address"
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
              cursor: emailValid && selectedTicket ? "pointer" : "not-allowed",
            }}
            disabled={!emailValid || !selectedTicket}
            onClick={() =>
              navigate(`/checkout/${event._id}`, {
                state: { ticket: selectedTicket, email },
              })
            }
          >
            Proceed to Payment
          </button>

          <p style={styles.secureNote}>
            🔒 Secure payment • Tickets delivered instantly
          </p>
        </aside>
      </div>
    </main>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100svh",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  /* ===== BANNER ===== */
  bannerWrapper: {
    width: "100%",
    maxHeight: "420px",
    overflow: "hidden",
  },

  banner: {
    width: "100%",
    height: "50%",
    maxHeight: 420,
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
  },

  /* ===== LAYOUT ===== */
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "clamp(20px,4vw,40px)",
    display: "grid",
    gap: 32,
    gridTemplateColumns: "1fr",
  },

  /* Desktop */
  "@media (min-width: 900px)": {},

  eventCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 28,
  },

  title: {
    marginBottom: 12,
    fontSize: "clamp(22px,4vw,30px)",
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
    marginBottom: 14,
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
    marginTop: 14,
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
    marginTop: 18,
  },

  secureNote: {
    marginTop: 14,
    fontSize: 13,
    color: "#CFC9D6",
    textAlign: "center",
  },

  loading: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
  },

  error: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
  },
};
