import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const touchStartX = useRef(0);

  const ticketParam = searchParams.get("ticket");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  /* ================= VALIDATION ================= */
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  const nameValid = name.trim().length >= 2;
  const canPay = emailValid && nameValid && ticket && !processing;

  /* ================= LOAD EVENT ================= */
  useEffect(() => {
    if (!id) {
      setError("This checkout link is invalid or has expired.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${id}`,
        );

        if (!res.ok) throw new Error("Event not found");

        const data = await res.json();

        if (!Array.isArray(data.ticketTypes) || data.ticketTypes.length === 0) {
          throw new Error("No tickets available for this event.");
        }

        // ✅ SAFE TICKET RESOLUTION
        const resolvedTicket =
          data.ticketTypes.find(
            (t) => t.name.toLowerCase() === ticketParam?.toLowerCase(),
          ) || data.ticketTypes[0];

        setEvent(data);
        setTicket(resolvedTicket);
      } catch (err) {
        setError(err.message || "Unable to prepare checkout.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, ticketParam]);

  /* ================= PAYMENT ================= */
  async function handlePayment() {
    if (!canPay) return;

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

      if (!res.ok || !data?.paymentUrl) {
        throw new Error(data.message || "Payment initialization failed");
      }

      window.location.href = data.paymentUrl;
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
    <main style={styles.page}>
      {processing && <LoadingModal message="Redirecting to payment…" />}

      {/* BANNER */}
      <div
        style={{
          ...styles.banner,
          backgroundImage: `url(${event.banner})`,
        }}
      />

      <div style={styles.container}>
        {/* EVENT INFO */}
        <section style={styles.left}>
          <h1 style={styles.title}>{event.title}</h1>

          <div style={styles.meta}>
            <span>📍 {event.location || "TBA"}</span>
            <span>📅 {new Date(event.date).toDateString()}</span>
          </div>

          <p style={styles.description}>{event.description}</p>
        </section>

        {/* CHECKOUT */}
        <aside style={styles.right}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Order Summary</h2>

            {/* NAME */}
            <input
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {!nameValid && name && (
              <p style={styles.inputError}>Enter your full name</p>
            )}

            {/* EMAIL */}
            <input
              style={styles.input}
              placeholder="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!emailValid && email && (
              <p style={styles.inputError}>Enter a valid email address</p>
            )}

            {/* TICKET SELECT (fallback-safe) */}
            {event.ticketTypes.length > 1 && (
              <select
                style={styles.input}
                value={ticket.name}
                onChange={(e) =>
                  setTicket(
                    event.ticketTypes.find((t) => t.name === e.target.value),
                  )
                }
              >
                {event.ticketTypes.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} — {t.price > 0 ? `₦${t.price}` : "Free"}
                  </option>
                ))}
              </select>
            )}

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
                opacity: canPay ? 1 : 0.5,
                cursor: canPay ? "pointer" : "not-allowed",
              }}
              disabled={!canPay}
              onClick={handlePayment}
            >
              {ticket.price > 0
                ? "Proceed to Secure Payment"
                : "Confirm Free Ticket"}
            </button>

            <p style={styles.secureText}>
              🔒 Secure checkout powered by ERCASPAY
            </p>
          </div>
        </aside>
      </div>
    </main>
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

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100svh",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  banner: {
    height: "min(38svh, 360px)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  container: {
    maxWidth: 1200,
    margin: "-96px auto 0",
    padding: "0 clamp(16px,4vw,32px) 80px",
    display: "grid",
    gap: 32,
    gridTemplateColumns: "1fr",
  },

  left: {
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(20px,4vw,32px)",
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
    padding: "clamp(20px,4vw,32px)",
    borderRadius: 24,
  },

  title: {
    fontSize: "clamp(22px,4vw,34px)",
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
    marginBottom: 8,
  },

  inputError: {
    fontSize: 12,
    color: "#ff4d4f",
    marginBottom: 10,
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

  errorCard: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    padding: 32,
  },

  primaryBtn: {
    marginTop: 16,
    padding: "10px 18px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 600,
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

/* ===== SPINNER ===== */
const style = document.createElement("style");
style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
