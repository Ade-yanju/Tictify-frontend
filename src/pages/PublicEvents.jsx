import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PublicEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD EVENTS ================= */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        if (active) setEvents(Array.isArray(data) ? data : []);
      } catch {
        if (active) setError("Unable to load events at the moment.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => (active = false);
  }, []);

  /* ================= HELPERS ================= */

  const getRemainingTickets = (event) => {
    const sold = (event.ticketTypes || []).reduce(
      (sum, t) => sum + (t.sold || 0),
      0,
    );
    return Math.max(event.capacity - sold, 0);
  };

  const getStartingPrice = (ticketTypes = []) => {
    const prices = ticketTypes
      .map((t) => Number(t.price) || 0)
      .filter((p) => p > 0);
    return prices.length ? `₦${Math.min(...prices)}` : "Free";
  };

  /**
   * 🔥 EVENT STATE
   */
  const getEventState = (event) => {
    const now = new Date();
    const start = new Date(event.date);
    const end = new Date(event.endDate);
    const remaining = getRemainingTickets(event);

    if (now >= end) return { label: "Event Ended", type: "ENDED" };
    if (remaining === 0) return { label: "Sold Out", type: "SOLD_OUT" };
    if (now >= start) return { label: "Ongoing", type: "ONGOING" };

    return { label: "Upcoming", type: "UPCOMING" };
  };

  /* ================= FILTER ================= */
  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase().trim();
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q),
    );
  }, [events, search]);

  return (
    <main style={styles.page}>
      {loading && <LoadingModal />}

      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.heading}>Events</h1>
        <p style={styles.subtitle}>Discover events happening around you</p>

        <input
          style={styles.search}
          placeholder="Search by event or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {!loading && filteredEvents.length === 0 && (
        <p style={styles.empty}>No events found.</p>
      )}

      {/* GRID */}
      <section style={styles.grid}>
        {filteredEvents.map((event) => {
          const remaining = getRemainingTickets(event);
          const state = getEventState(event);
          const disabled = state.type === "ENDED" || state.type === "SOLD_OUT";

          return (
            <article key={event._id} style={styles.card}>
              {/* IMAGE */}
              <div style={styles.imageWrapper}>
                <img
                  src={event.banner}
                  alt={event.title}
                  style={styles.image}
                />
                <span style={styles.badge(state.type)}>{state.label}</span>
              </div>

              {/* BODY */}
              <div style={styles.cardBody}>
                <h3 style={styles.title}>{event.title}</h3>

                <p style={styles.meta}>📍 {event.location}</p>
                <p style={styles.meta}>
                  📅 {new Date(event.date).toDateString()}
                </p>

                <p style={styles.tickets}>
                  🎟 {remaining} ticket{remaining !== 1 && "s"} left
                </p>
              </div>

              {/* FOOTER */}
              <div style={styles.cardFooter}>
                <span style={styles.price}>
                  {getStartingPrice(event.ticketTypes)}
                </span>

                <button
                  style={{
                    ...styles.cta,
                    ...(disabled && styles.disabledBtn),
                  }}
                  disabled={disabled}
                  onClick={() => !disabled && navigate(`/events/${event._id}`)}
                >
                  {disabled ? "Unavailable" : "View Event →"}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

/* ================= LOADING ================= */
function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p>Loading events…</p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh", // ✅ desktop-safe
    padding: "clamp(16px, 3vw, 48px)",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    maxWidth: 1200,
    margin: "0 auto 32px",
    textAlign: "center",
  },

  heading: {
    fontSize: "clamp(24px, 4vw, 40px)",
  },

  subtitle: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  search: {
    marginTop: 20,
    width: "100%",
    maxWidth: 420,
    padding: "14px 18px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
  },

  grid: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gap: 20,
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  },

  card: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  imageWrapper: {
    height: 120, // 👈 smaller & consistent
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  badge: (type) => ({
    position: "absolute",
    top: 10,
    left: 10,
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background:
      type === "ONGOING"
        ? "#22F2A6"
        : type === "UPCOMING"
          ? "#3b82f6"
          : "#ff4d4f",
    color: "#000",
  }),

  cardBody: {
    padding: 14,
  },

  title: {
    fontSize: 16,
    marginBottom: 6,
  },

  meta: {
    fontSize: 13,
    color: "#CFC9D6",
  },

  tickets: {
    marginTop: 8,
    color: "#22F2A6",
    fontWeight: 600,
    fontSize: 13,
  },

  cardFooter: {
    padding: 14,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  price: {
    fontWeight: 700,
    color: "#22F2A6",
    fontSize: 14,
  },

  cta: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 700,
    cursor: "pointer",
    color: "#000",
  },

  disabledBtn: {
    background: "rgba(255,255,255,0.2)",
    cursor: "not-allowed",
    color: "#999",
  },

  empty: {
    textAlign: "center",
    color: "#CFC9D6",
    marginTop: 60,
  },

  error: {
    color: "#ff4d4f",
    textAlign: "center",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "grid",
    placeItems: "center",
  },

  loadingModal: {
    background: "#1A0F2E",
    padding: 28,
    borderRadius: 18,
    textAlign: "center",
  },

  spinner: {
    width: 36,
    height: 36,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

/* SPINNER */
const style = document.createElement("style");
style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
