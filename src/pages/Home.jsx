import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const logo = "/logo.png";

export default function Home() {
  return (
    <div style={styles.page}>
      <Navbar />
      <Hero />
      <FeaturedEvents />
      <OrganizerCTA />
      <TrustStrip />
      <CTA />
      <Footer />
    </div>
  );
}

/* ================= NAVBAR ================= */
function Navbar() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <img src={logo} style={styles.logo} />

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

          {mobile && (
            <button style={styles.menuBtn} onClick={() => setOpen(!open)}>
              ☰
            </button>
          )}
        </nav>
      </div>

      {mobile && open && (
        <div style={styles.mobileMenu}>
          <button style={styles.linkBtn}>Home</button>
          <button style={styles.linkBtn} onClick={() => navigate("/events")}>
            Discover
          </button>
          <button style={styles.outlineBtnFull} onClick={() => navigate("/login")}>
            Login
          </button>
          <button style={styles.primaryBtnFull} onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
      )}
    </header>
  );
}

/* ================= HERO ================= */
function Hero() {
  const navigate = useNavigate();

  return (
    <section style={styles.hero}>
      <div style={styles.heroOverlay} />

      <div style={styles.container}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Your Gateway to <br /> Unforgettable Experiences
          </h1>

          <p style={styles.heroText}>
            Discover live events, concerts, campus shows and conferences happening near you.
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        const data = await res.json();

        const live = (Array.isArray(data) ? data : [])
          .filter((e) => e.status === "LIVE")
          .slice(0, 6);

        if (active) setEvents(live);
      } catch {
        if (active) setEvents([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => (active = false);
  }, []);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2>Featured Live Events</h2>

          <button style={styles.viewAll} onClick={() => navigate("/events")}>
            View all live events →
          </button>
        </div>

        <div style={styles.eventGrid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={styles.skeletonCard} />
              ))
            : events.map((event) => (
                <article
                  key={event._id}
                  style={styles.eventCard}
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <img
                    src={event.banner}
                    alt={event.title}
                    style={styles.eventImg}
                    loading="lazy"
                  />

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
        <div style={styles.organizerBox}>
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

/* ================= TRUST ================= */
function TrustStrip() {
  return (
    <section style={styles.trust}>
      Trusted by campus organizers, communities and creators across Nigeria.
    </section>
  );
}

/* ================= CTA ================= */
function CTA() {
  const navigate = useNavigate();

  return (
    <section style={styles.cta}>
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
      <img src={logo} style={styles.logo} />
      <p style={styles.muted}>© {new Date().getFullYear()} Tictify</p>
    </footer>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: { background: "#0F0618", color: "#fff", fontFamily: "Inter" },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 20px",
  },

  header: {
    position: "sticky",
    top: 0,
    background: "rgba(15,6,24,0.9)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    zIndex: 1000,
  },

  nav: {
    height: 72,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: { height: 32 },

  navLinks: { display: "flex", gap: 16, alignItems: "center" },

  hero: {
    position: "relative",
    padding: "140px 0 100px",
    background:
      "radial-gradient(circle at 30% 20%, rgba(124,58,237,0.5), transparent), #0F0618",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(15,6,24,0.9))",
  },

  heroContent: { position: "relative", maxWidth: 640 },

  heroTitle: { fontSize: "clamp(36px,6vw,60px)" },

  heroText: { color: "#CFC9D6", margin: "16px 0 28px" },

  heroButtons: { display: "flex", gap: 14, flexWrap: "wrap" },

  section: { padding: "90px 0" },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 24,
    alignItems: "center",
  },

  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
    gap: 22,
  },

  eventCard: {
    background: "#170A25",
    borderRadius: 18,
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform .2s",
  },

  eventImg: { width: "100%", height: 170, objectFit: "cover" },

  eventBody: { padding: 14 },

  skeletonCard: {
    height: 240,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 18,
  },

  organizer: { padding: "90px 0", background: "#170A25" },

  organizerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 30,
  },

  hostImg: { width: 260 },

  trust: {
    textAlign: "center",
    padding: 40,
    color: "#9F97B2",
  },

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

  viewAll: { background: "none", border: "none", color: "#22F2A6" },

  menuBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 8,
  },

  mobileMenu: { padding: 24, display: "grid", gap: 14 },

  outlineBtnFull: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "1px solid #22F2A6",
  },

  primaryBtnFull: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    background: "#22F2A6",
    border: "none",
  },
};
