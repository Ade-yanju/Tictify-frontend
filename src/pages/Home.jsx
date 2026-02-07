import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const logo = "/logo.png";

export default function Home() {
  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>

      <Navbar />
      <Hero />
      <FeaturedEvents />
      <HostSection />
      <CTA />
      <Footer />
    </div>
  );
}

/* ================= NAVBAR ================= */
function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <img src={logo} alt="Tictify" style={styles.logo} />

          {!isMobile && (
            <div style={styles.navLinks}>
              <button style={styles.linkBtn}>Home</button>
              <button style={styles.linkBtn} onClick={() => navigate("/events")}>
                Discover
              </button>
              <button style={styles.linkBtn}>Pricing</button>

              <button style={styles.outlineBtn} onClick={() => navigate("/login")}>
                Login
              </button>
              <button style={styles.primaryBtn} onClick={() => navigate("/register")}>
                Sign Up
              </button>
            </div>
          )}

          {isMobile && (
            <button style={styles.menuBtn} onClick={() => setOpen(!open)}>
              ☰
            </button>
          )}
        </nav>
      </div>

      {isMobile && open && (
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
      <div style={styles.container}>
        <div style={styles.heroBox}>
          <h1 style={styles.heroTitle}>
            Your Gateway to <br /> Unforgettable Experiences
          </h1>

          <p style={styles.heroText}>
            Discover and attend amazing events happening around you.
          </p>

          <button style={styles.primaryBtn} onClick={() => navigate("/events")}>
            Browse Events
          </button>
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
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        const data = await res.json();

        const liveEvents = (Array.isArray(data) ? data : [])
          .filter((e) => e.status === "LIVE")
          .slice(0, 6);

        setEvents(liveEvents);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2>Featured Events</h2>

          <button style={styles.viewAll} onClick={() => navigate("/events")}>
            View all →
          </button>
        </div>

        {loading ? (
          <p style={styles.muted}>Loading events...</p>
        ) : (
          <div style={styles.eventGrid}>
            {events.map((event) => (
              <div
                key={event._id}
                style={styles.eventCard}
                onClick={() => navigate(`/events/${event._id}`)}
              >
                <img src={event.banner} alt={event.title} style={styles.eventImg} />
                <div style={styles.eventBody}>
                  <h4>{event.title}</h4>
                  <p style={styles.muted}>
                    {new Date(event.date).toDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ================= HOST SECTION ================= */
function HostSection() {
  const navigate = useNavigate();

  return (
    <section style={styles.host}>
      <div style={styles.container}>
        <div style={styles.hostBox}>
          <div>
            <h2>Host Your Own Event</h2>
            <p style={styles.muted}>
              Create and manage events effortlessly with Tictify.
            </p>
            <button style={styles.primaryBtn} onClick={() => navigate("/register")}>
              Get Started
            </button>
          </div>

          <img src="/phone-mock.png" alt="App" style={styles.hostImg} />
        </div>
      </div>
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
      <img src={logo} alt="Tictify" style={styles.logo} />
      <p style={styles.muted}>
        © {new Date().getFullYear()} Tictify
      </p>
    </footer>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 20px",
  },

  header: {
    position: "sticky",
    top: 0,
    backdropFilter: "blur(10px)",
    background: "rgba(15,6,24,0.8)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    zIndex: 1000,
  },

  nav: {
    height: 72,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  navLinks: { display: "flex", gap: 16, alignItems: "center" },

  hero: { padding: "120px 0 80px" },

  heroBox: { maxWidth: 640 },

  heroTitle: { fontSize: "clamp(32px,5vw,56px)" },

  heroText: { color: "#CFC9D6", margin: "16px 0 24px" },

  section: { padding: "80px 0" },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 24,
    alignItems: "center",
  },

  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
    gap: 20,
  },

  eventCard: {
    background: "#170A25",
    borderRadius: 18,
    overflow: "hidden",
    cursor: "pointer",
  },

  eventImg: { width: "100%", height: 160, objectFit: "cover" },

  eventBody: { padding: 14 },

  host: { padding: "80px 0", background: "#170A25" },

  hostBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 30,
    flexWrap: "wrap",
  },

  hostImg: { width: 260 },

  cta: { padding: 100, textAlign: "center" },

  footer: { padding: 40, textAlign: "center" },

  primaryBtn: {
    background: "#22F2A6",
    border: "none",
    padding: "12px 26px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
  },

  outlineBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "10px 20px",
    borderRadius: 999,
  },

  outlineBtnFull: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "1px solid #22F2A6",
    color: "#22F2A6",
  },

  primaryBtnFull: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    background: "#22F2A6",
    border: "none",
  },

  linkBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },

  muted: { color: "#CFC9D6" },

  viewAll: {
    background: "none",
    border: "none",
    color: "#22F2A6",
    cursor: "pointer",
  },

  menuBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 8,
  },

  mobileMenu: {
    padding: 24,
    display: "grid",
    gap: 14,
  },

  logo: { height: 32 },
};

const globalCSS = `
body { margin: 0; }
`;
