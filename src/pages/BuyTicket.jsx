import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyTicket({ event }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState(event.ticketTypes?.[0]?.name || "");
  const [error, setError] = useState("");

  function proceedToCheckout() {
    setError("");

    if (!email || !email.includes("@")) {
      return setError("Please enter a valid email address.");
    }

    if (!ticket) {
      return setError("Please select a ticket type.");
    }

    navigate(
      `/checkout/${event._id}?email=${encodeURIComponent(
        email,
      )}&ticket=${encodeURIComponent(ticket)}`,
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>{event.title}</h2>
        <p style={styles.muted}>{event.location}</p>

        {/* EMAIL */}
        <input
          style={styles.input}
          placeholder="Email address"
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

        <button style={styles.btn} onClick={proceedToCheckout}>
          Continue to Checkout
        </button>
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
    padding: 20,
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 32,
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
  },

  title: {
    marginBottom: 6,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
    marginBottom: 20,
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    border: "none",
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

  error: {
    color: "#ff4d4f",
    fontSize: 13,
    marginBottom: 12,
  },
};
