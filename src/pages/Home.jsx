import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const logo = "/logo.png";

const heroImages = [
  "/hero/hero1.jpg",
  "/hero/hero2.jpg",
  "/hero/hero3.jpg",
  "/hero/hero4.jpg",
  "/hero/hero5.jpg",
];

export default function Home() {
  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>

      <Navbar />
      <Hero />
      <Trust />
      <Guests />
      <Organizers />
      <HowItWorks />
      <Pricing />
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

  /* 🔑 RESPONSIVE DETECTION */
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

  /* 🔒 LOCK SCROLL WHEN MENU OPEN */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <img
            src={logo}
            alt="Tictify"
            style={styles.logo}
            onClick={() => scrollTo("home")}
          />

          {/* DESKTOP NAV */}
          {!isMobile && (
            <div style={styles.navLinks}>
              <NavLinks scrollTo={scrollTo} navigate={navigate} />
            </div>
          )}

          {/* MOBILE TOGGLE */}
          {isMobile && (
            <button
              aria-label="Open menu"
              style={styles.menuBtn}
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
          )}
        </nav>
      </div>

      {/* MOBILE MENU */}
      {isMobile && open && (
        <div style={styles.mobileMenu}>
          <NavLinks
            scrollTo={scrollTo}
            navigate={navigate}
            mobile
          />
        </div>
      )}
    </header>
  );
}

function NavLinks({ scrollTo, navigate, mobile }) {
  return (
    <>
      <button style={styles.linkBtn} onClick={() => scrollTo("home")}>
        Home
      </button>
      <button style={styles.linkBtn} onClick={() => scrollTo("guests")}>
        Discover
      </button>
      <button style={styles.linkBtn} onClick={() => scrollTo("pricing")}>
        Pricing
      </button>

      <button
        style={mobile ? styles.outlineBtnFull : styles.outlineBtn}
        onClick={() => navigate("/login")}
      >
        Login
      </button>

      <button
        style={mobile ? styles.primaryBtnFull : styles.primaryBtn}
        onClick={() => navigate("/register")}
      >
        Sign Up
      </button>
    </>
  );
}

/* ================= HERO ================= */
function Hero() {
  const navigate = useNavigate();

  return (
    <section id="home" style={styles.hero}>
      <div style={styles.container}>
        <div style={styles.heroContent}>
          <span style={styles.badge}>🎟️ Event Ticketing Platform</span>

          <h1 style={styles.heroTitle}>
            Sell Event Tickets <br /> The Smart Way
          </h1>

          <p style={styles.heroText}>
            Create events, sell tickets, and manage entry with secure QR codes —
            built for organizers and guests.
          </p>

          <div style={styles.heroButtons}>
            <button
              style={styles.primaryBtn}
              onClick={() => navigate("/login")}
            >
              Create an Event
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => navigate("/events")}
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div style={styles.marqueeViewport}>
        <div style={styles.marqueeTrack}>
          {[...heroImages, ...heroImages].map((img, i) => (
            <div key={i} style={styles.marqueeItem}>
              <img src={img} alt="Event" style={styles.marqueeImage} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= SECTIONS ================= */
function Trust() {
  return (
    <section style={styles.trust}>
      <div style={styles.container}>
        <p style={styles.trustText}>
          Trusted by campus promoters, communities, and event organizers across Nigeria.
        </p>
      </div>
    </section>
  );
}

function Guests() {
  return (
    <section id="guests" style={styles.sectionAlt}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>For Guests</h2>
        <div style={styles.grid}>
          <Card title="Instant Tickets" text="Receive your e-ticket instantly." />
          <Card title="QR Code Entry" text="Fast and secure event entry." />
          <Card title="Stress-Free Access" text="No printing. No queues." />
        </div>
      </div>
    </section>
  );
}

function Organizers() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>For Organizers</h2>
        <div style={styles.grid}>
          <Card title="Create Events" text="Set up events in minutes." />
          <Card title="Secure Payments" text="Powered by ErcasPay." />
          <Card title="Live Analytics" text="Track sales in real time." />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section style={styles.sectionAlt}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.grid}>
          <Step number="01" title="Create Event" text="Add details and tickets." />
          <Step number="02" title="Sell Tickets" text="Guests pay & get QR codes." />
          <Step number="03" title="Scan & Admit" text="Prevent fraud at entry." />
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Simple Pricing</h2>
        <div style={styles.grid}>
          <PriceCard title="Free" price="₦0" text="For free events." />
          <PriceCard title="Pro" price="3% + ₦80" text="Pay per ticket sold." />
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const navigate = useNavigate();
  return (
    <section style={styles.cta}>
      <div style={styles.container}>
        <h2>Start Selling Tickets Today</h2>
        <p style={styles.mutedText}>Create your first event in minutes.</p>
        <button style={styles.primaryBtn} onClick={() => navigate("/register")}>
          Get Started
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <img src={logo} alt="Tictify" style={styles.logo} />
        <p style={styles.mutedText}>
          © {new Date().getFullYear()} Tictify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ================= REUSABLE ================= */
function Card({ title, text }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p style={styles.mutedText}>{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div style={styles.card}>
      <span style={styles.stepNumber}>{number}</span>
      <h3>{title}</h3>
      <p style={styles.mutedText}>{text}</p>
    </div>
  );
}

function PriceCard({ title, price, text }) {
  return (
    <div style={{ ...styles.card, textAlign: "center" }}>
      <h3>{title}</h3>
      <h2 style={{ color: "#22F2A6", margin: "12px 0" }}>{price}</h2>
      <p style={styles.mutedText}>{text}</p>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    background: "#0F0618",
    color: "#FFFFFF",
    fontFamily: "Inter, system-ui",
    overflowX: "hidden",
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 clamp(16px,4vw,32px)",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backdropFilter: "blur(12px)",
    background: "rgba(15,6,24,0.8)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  nav: {
    height: 72,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  navLinks: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },

  menuBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 20,
    cursor: "pointer",
  },

  mobileMenu: {
    display: "grid",
    gap: 16,
    padding: 24,
    background: "#0F0618",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  logo: { height: 34, cursor: "pointer" },

  hero: {
    padding: "clamp(72px,10vw,120px) 0 64px",
  },

  heroContent: {
    maxWidth: 620,
  },

  heroTitle: {
    fontSize: "clamp(30px,5vw,52px)",
    margin: "16px 0",
  },

  heroText: {
    color: "#CFC9D6",
    marginBottom: 28,
  },

  heroButtons: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },

  badge: {
    color: "#22F2A6",
    fontSize: 14,
  },

  marqueeViewport: {
    marginTop: 72,
    overflow: "hidden",
  },

  marqueeTrack: {
    display: "flex",
    width: "200%",
    animation: "marquee 40s linear infinite",
  },

  marqueeItem: {
    flex: "0 0 33.3333%",
    padding: "0 12px",
  },

  marqueeImage: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 18,
  },

  trust: {
    padding: "32px 0",
    textAlign: "center",
  },

  trustText: {
    color: "#9F97B2",
  },

  section: {
    padding: "clamp(64px,10vw,96px) 0",
  },

  sectionAlt: {
    padding: "clamp(64px,10vw,96px) 0",
    background: "#170A25",
  },

  sectionTitle: {
    textAlign: "center",
    marginBottom: 48,
    fontSize: 32,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 28,
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 28,
  },

  stepNumber: {
    color: "#22F2A6",
    fontWeight: 600,
  },

  cta: {
    padding: "96px 0",
    textAlign: "center",
  },

  footer: {
    padding: "40px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  primaryBtn: {
    background: "#22F2A6",
    border: "none",
    padding: "12px 26px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
  },

  primaryBtnFull: {
    background: "#22F2A6",
    border: "none",
    padding: 14,
    borderRadius: 999,
    fontWeight: 600,
    width: "100%",
  },

  secondaryBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "12px 26px",
    borderRadius: 999,
    cursor: "pointer",
  },

  outlineBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "10px 22px",
    borderRadius: 999,
    cursor: "pointer",
  },

  outlineBtnFull: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: 14,
    borderRadius: 999,
    width: "100%",
  },

  linkBtn: {
    background: "none",
    border: "none",
    color: "#FFFFFF",
    cursor: "pointer",
  },

  mutedText: { color: "#CFC9D6" },
};

/* ================= GLOBAL CSS ================= */
const globalCSS = `
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

section { scroll-margin-top: 96px; }

@media (max-width: 900px) {
  .marqueeItem { flex: 0 0 100%; }
}
`;
