import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const touchStartX = useRef(0);

  const ticketName = searchParams.get("ticket");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD EVENT ================= */
  useEffect(() => {
    if (!id || !ticketName) {
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
        const selectedTicket = data.ticketTypes.find(
          (t) => t.name === ticketName,
        );

        if (!selectedTicket) throw new Error("Invalid ticket selection");

        setEvent(data);
        setTicket(selectedTicket);
      } catch (err) {
        setError(err.message || "Unable to prepare checkout.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, ticketName]);

  /* ================= PAYMENT ================= */
  async function handlePayment() {
    if (processing || !ticket) return;

    if (!name.trim()) return setError("Full name is required");
    if (!email.trim()) return setError("Email is required");

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
            ticketType: ticket.name,
            name,
            email,
          }),
        },
      );

      const data = await res.json();
      const redirectUrl = data.paymentUrl || data.checkoutUrl;

      if (!res.ok || !redirectUrl) {
        throw new Error(data.message || "Payment initialization failed");
      }

      window.location.href = redirectUrl;
    } catch (err) {
      setError(err.message || "Payment failed");
      setProcessing(false);
    }
  }

  /* ================= SWIPE BACK ================= */
  useEffect(() => {
    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 80) {
        navigate(-1);
      }
    };

    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate]);

  /* ================= STATES ================= */
  if (loading) {
    return <LoadingModal message="Preparing checkout…" />;
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <h2>Error</h2>
          <p style={styles.muted}>{error}</p>
          <button style={styles.primaryBtn} onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      {processing && <LoadingModal message="Redirecting to payment…" />}

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
          </div>

          <p style={styles.description}>{event.description}</p>
        </section>

        <aside style={styles.right}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Order Summary</h2>

            <input
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div style={styles.row}>
              <span>Ticket</span>
              <strong>{ticket.name}</strong>
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
              }}
              disabled={processing}
              onClick={handlePayment}
            >
              {processing
                ? "Processing…"
                : ticket.price > 0
                ? "Proceed to Secure Payment"
                : "Confirm Free Ticket"}
            </button>

            <p style={styles.secureText}>
              🔒 Secure checkout powered by ERCASPAY
            </p>
          </div>
        </aside>
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

//* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  banner: {
    height: "min(35vh, 320px)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  /* 🔑 MOBILE-FIRST GRID */
  container: {
    maxWidth: 1200,
    margin: "-80px auto 0",
    padding: "0 16px 80px",
    display: "grid",
    gap: 32,
    gridTemplateColumns: "1fr", // default (mobile)
  },

  left: {
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(20px,4vw,28px)",
    borderRadius: 24,
  },

  right: {
    display: "flex",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(20px,4vw,28px)",
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

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    marginBottom: 14,
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

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },
};
