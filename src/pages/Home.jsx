import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* ================= SVG ICON SYSTEM ================= */

const Icons = {
  ticket: (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path fill="currentColor" d="M4 6h16v4a2 2 0 010 4v4H4v-4a2 2 0 010-4z" />
    </svg>
  ),

  calendar: (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="currentColor"
        d="M7 2v2H5a2 2 0 00-2 2v14h18V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm12 8H5v8h14v-8z"
      />
    </svg>
  ),

  chart: (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path fill="currentColor" d="M5 9h3v10H5zm5-4h3v14h-3zm5 7h3v7h-3z" />
    </svg>
  ),

  lightning: (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="currentColor"
        d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
      />
    </svg>
  ),
};

/* ================= MAIN ================= */

export default function Home() {
  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>

      <Navbar />
      <Hero />
      <FeaturedEvents />
      <OrganizerCTA />
      <Benefits />
      <CTA />
      <Footer />
    </div>
  );
}

/* ================= NAVBAR ================= */

function Navbar() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width:900px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <img src="/logo.png" style={styles.logo} />

          {!mobile && (
            <div style={styles.navLinks}>
              <button style={styles.linkBtn}>Home</button>
              <button style={styles.linkBtn} onClick={() => navigate("/events")}>
                Discover
              </button>

              <button style={styles.outlineBtn} onClick={() => navigate("/login")}>
                Login
              </button>
              <button style={styles.primaryBtn} onClick={() => navigate("/register")}>
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ================= HERO ================= */

function Hero() {
  const navigate = useNavigate();

  return (
    <section style={styles.hero}>
      <div style={styles.heroGlow} />

      <div style={styles.container}>
        <div className="fade-up" style={styles.heroContent}>
          <span style={styles.badge}>{Icons.ticket} Event Ticketing Platform</span>

          <h1 style={styles.heroTitle}>
            Your Gateway to <br /> Unforgettable Experiences
          </h1>

          <p style={styles.heroText}>
            Discover concerts, conferences and campus events happening around you.
          </p>

          <div style={styles.heroButtons}>
            <button style={styles.primaryBtn} onClick={() => navigate("/events")}>
              Explore Events
            </button>

            <button style={styles.secondaryBtn} onClick={() => navigate("/register")}>
              Host Event
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURED EVENTS ================= */

function FeaturedEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
      const data = await res.json();
      setEvents(data.filter((e) => e.status === "LIVE").slice(0, 6));
    })();
  }, []);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2>Featured Live Events</h2>
          <button style={styles.viewAll} onClick={() => navigate("/events")}>
            View all →
          </button>
        </div>

        <div style={styles.grid}>
          {events.map((event) => (
            <article
              key={event._id}
              className="card-animate"
              style={styles.eventCard}
              onClick={() => navigate(`/events/${event._id}`)}
            >
              <img src={event.banner} style={styles.eventImg} />

              <div style={styles.eventBody}>
                <h4>{event.title}</h4>
                <p style={styles.muted}>
                  {new Date(event.date).toDateString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= ORGANIZER CTA ================= */

function OrganizerCTA() {
  const navigate = useNavigate();

  return (
    <section style={styles.organizer}>
      <div style={styles.container}>
        <div className="fade-up" style={styles.organizerBox}>
          <div>
            <h2>Host Your Own Event</h2>
            <p style={styles.muted}>
              Sell tickets, manage guests and track revenue in real-time.
            </p>

            <button style={styles.primaryBtn} onClick={() => navigate("/register")}>
              Start Hosting
            </button>
          </div>

          <img src="/phone-mock.png" style={styles.hostImg} />
        </div>
      </div>
    </section>
  );
}

/* ================= BENEFITS ================= */

function Benefits() {
  return (
    <section style={styles.sectionAlt}>
      <div style={styles.container}>
        <h2 style={styles.center}>Why Tictify</h2>

        <div style={styles.grid}>
          <Feature icon={Icons.calendar} title="Event Scheduling" />
          <Feature icon={Icons.chart} title="Sales Analytics" />
          <Feature icon={Icons.lightning} title="Instant QR Entry" />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="card-animate" style={styles.card}>
      <div style={styles.iconCircle}>{icon}</div>
      <h3>{title}</h3>
    </div>
  );
}

/* ================= CTA ================= */

function CTA() {
  const navigate = useNavigate();

  return (
    <section className="fade-up" style={styles.cta}>
      <h2>Ready for your next adventure?</h2>
      <button style={styles.primaryBtn} onClick={() => navigate("/events")}>
        Discover Events
      </button>
    </section>
  );
}

/* ================= FOOTER ================= */

function Footer() {
  return (
    <footer style={styles.footer}>
      <img src="/logo.png" style={styles.logo} />
      <p style={styles.muted}>© {new Date().getFullYear()} Tictify</p>
    </footer>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: { background: "#0F0618", color: "#fff", fontFamily: "Inter" },

  container: { maxWidth: 1200, margin: "0 auto", padding: "0 20px" },

  header: {
    position: "sticky",
    top: 0,
    backdropFilter: "blur(10px)",
    background: "rgba(15,6,24,0.85)",
    zIndex: 1000,
  },

  nav: {
    height: 72,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: { height: 34 },

  navLinks: { display: "flex", gap: 16 },

  hero: { padding: "150px 0 100px", position: "relative" },

  heroGlow: {
    position: "absolute",
    width: 600,
    height: 600,
    background: "radial-gradient(#7C3AED, transparent)",
    filter: "blur(120px)",
    top: -200,
    left: -200,
  },

  heroContent: { maxWidth: 640 },

  heroTitle: { fontSize: "clamp(36px,6vw,60px)" },

  heroText: { color: "#CFC9D6", margin: "16px 0 28px" },

  heroButtons: { display: "flex", gap: 14 },

  section: { padding: "90px 0" },
  sectionAlt: { padding: "90px 0", background: "#170A25" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 24,
  },

  eventCard: {
    background: "#170A25",
    borderRadius: 18,
    overflow: "hidden",
    cursor: "pointer",
  },

  eventImg: { width: "100%", height: 170, objectFit: "cover" },

  eventBody: { padding: 14 },

  card: {
    background: "rgba(255,255,255,0.05)",
    padding: 26,
    borderRadius: 18,
    textAlign: "center",
  },

  iconCircle: {
    background: "rgba(34,242,166,0.15)",
    padding: 12,
    borderRadius: 999,
    display: "inline-flex",
    marginBottom: 12,
  },

  organizer: { padding: "90px 0" },

  organizerBox: { display: "flex", justifyContent: "space-between", flexWrap: "wrap" },

  hostImg: { width: 260 },

  cta: { padding: 120, textAlign: "center" },

  footer: { padding: 40, textAlign: "center" },

  primaryBtn: {
    background: "#22F2A6",
    border: "none",
    padding: "12px 26px",
    borderRadius: 999,
    cursor: "pointer",
  },

  secondaryBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "12px 26px",
    borderRadius: 999,
  },

  outlineBtn: {
    border: "1px solid #22F2A6",
    background: "transparent",
    color: "#22F2A6",
    padding: "10px 20px",
    borderRadius: 999,
  },

  linkBtn: { background: "none", border: "none", color: "#fff" },

  muted: { color: "#CFC9D6" },

  badge: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    color: "#22F2A6",
  },

  viewAll: { background: "none", border: "none", color: "#22F2A6" },

  center: { textAlign: "center", marginBottom: 40 },
};

/* ================= ANIMATION CSS ================= */

const globalCSS = `
.fade-up {
  animation: fadeUp 0.7s ease forwards;
}

.card-animate {
  transition: transform .25s ease, box-shadow .25s ease;
}

.card-animate:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.35);
}

button {
  transition: transform .15s ease, box-shadow .15s ease;
}

button:hover {
  transform: translateY(-2px);
}

@keyframes fadeUp {
  from { opacity:0; transform: translateY(30px); }
  to { opacity:1; transform: translateY(0); }
}
`;
