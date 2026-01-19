import { useState } from "react";

export default function BuyTicket({ event }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event._id,
        email,
        amount: event.ticketPrice,
      }),
    });

    const data = await res.json();
    window.location.href = data.paymentUrl;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>{event.title}</h2>
        <p>{event.location}</p>

        <input
          style={styles.input}
          placeholder="Email address"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button style={styles.btn} onClick={handlePay} disabled={loading}>
          {loading ? "Redirecting..." : `Pay ₦${event.ticketPrice}`}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 32,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    border: "none",
  },
  btn: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 600,
  },
};
