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
      <div style={styles.noiseOverlay} />
      <Navbar />
      <Hero />
      <BrandStrip />
      <FeaturesBento />
      <HowItWorks />
      <PricingGrid />
      <CTA />
      <Footer />
    </div>
  );
}

/* ================= NAV (Responsive Drawer) ================= */
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        ...styles.navWrapper,
        backgroundColor:
          scrolled || menuOpen ? "rgba(3, 3, 3, 0.85)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(20px)" : "none",
      }}
    >
      <div style={styles.containerNav}>
        <img
          src={logo}
          alt="Tictify"
          style={styles.logo}
          onClick={() => navigate("/")}
        />

        {/* Hamburger */}
        <div
          className="mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
          style={styles.hamburger}
        >
          <div
            style={{
              ...styles.line,
              transform: menuOpen
                ? "rotate(45deg) translate(5px, 5px)"
                : "none",
            }}
          />
          <div style={{ ...styles.line, opacity: menuOpen ? 0 : 1 }} />
          <div
            style={{
              ...styles.line,
              transform: menuOpen
                ? "rotate(-45deg) translate(7px, -7px)"
                : "none",
            }}
          />
        </div>

        <div
          className={`nav-menu ${menuOpen ? "open" : ""}`}
          style={styles.navLinks}
        >
          <a
            href="#features"
            style={styles.linkBtn}
            onClick={() => setMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#pricing"
            style={styles.linkBtn}
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </a>
          <button
            style={styles.outlineBtnSmall}
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            style={styles.primaryBtnSmall}
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ================= HERO (Fluid Text) ================= */
function Hero() {
  const navigate = useNavigate();
  return (
    <section style={styles.heroSection}>
      <div style={styles.auraLight} />
      <div style={styles.container}>
        <div className="fade-in">
          <div style={styles.pillBadge}>✨ Secure Payouts via Paystack</div>
          <h1 style={styles.heroTitle}>
            Modern Infrastructure <br />
            <span style={styles.gradientText}>For Global Events.</span>
          </h1>
          <p style={styles.heroSubtitle}>
            The high-performance ticketing engine for organizers who demand
            speed, security, and instant liquidity.
          </p>
          <div style={styles.heroBtnGroup}>
            <button
              style={styles.primaryBtnHero}
              onClick={() => navigate("/register")}
            >
              Host an Event
            </button>
            <button
              style={styles.secondaryBtnHero}
              onClick={() => navigate("/events")}
            >
              Find Experiences
            </button>
          </div>
        </div>
      </div>

      <div style={styles.marqueeContainer}>
        <div className="marquee-track" style={styles.marqueeTrack}>
          {[...heroImages, ...heroImages].map((img, i) => (
            <img key={i} src={img} alt="Event" style={styles.marqueeImg} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURES (The Bento) ================= */
function FeaturesBento() {
  return (
    <section id="features" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Engineered for Scale.</h2>
        <div className="responsive-grid">
          <div className="bento-card span-2" style={styles.bentoCard}>
            <span style={styles.iconBox}>⚡</span>
            <h3>Instant Payouts</h3>
            <p>Direct-to-bank settlements the moment a ticket is sold.</p>
          </div>
          <div className="bento-card" style={styles.bentoCard}>
            <span style={styles.iconBox}>🔒</span>
            <h3>Anti-Fraud</h3>
            <p>Encrypted QR tokens that regenerate every 30 seconds.</p>
          </div>
          <div className="bento-card" style={styles.bentoCard}>
            <span style={styles.iconBox}>📊</span>
            <h3>Analytics</h3>
            <p>Real-time ingress and sales velocity tracking.</p>
          </div>
          <div className="bento-card span-2" style={styles.bentoCard}>
            <span style={styles.iconBox}>📱</span>
            <h3>Native Wallet</h3>
            <p>Offline-first ticket access for areas with poor connectivity.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= PRICING ================= */
function PricingGrid() {
  return (
    <section id="pricing" style={styles.sectionAlt}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Simple Economics.</h2>
        <div className="responsive-grid">
          <div style={styles.priceCard}>
            <p style={styles.cardLabel}>COMMUNITY</p>
            <h3 style={styles.priceValue}>
              ₦0<span style={{ fontSize: "1rem" }}> /ticket</span>
            </h3>
            <ul style={styles.priceList}>
              <li>✓ Free Events Forever</li>
              <li>✓ Basic QR Check-in</li>
            </ul>
          </div>
          <div style={{ ...styles.priceCard, border: "1px solid #22F2A6" }}>
            <div style={styles.featuredBadge}>PRO</div>
            <p style={styles.cardLabel}>PROFESSIONAL</p>
            <h3 style={styles.priceValue}>3% + ₦80</h3>
            <ul style={styles.priceList}>
              <li>✓ Instant Withdrawals</li>
              <li>✓ Custom Branding</li>
              <li>✓ API Access</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandStrip() {
  return (
    <div style={styles.brandStrip}>
      <p>TRUSTED BY 500+ NIGERIAN PROMOTERS</p>
    </div>
  );
}

function HowItWorks() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div className="step-flex">
          {[
            { n: "01", t: "Configure", d: "Define tiers and rules." },
            { n: "02", t: "Broadcast", d: "Deploy links everywhere." },
            { n: "03", t: "Settle", d: "Funds hit your bank instantly." },
          ].map((s, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={styles.stepNumber}>{s.n}</div>
              <h4>{s.t}</h4>
              <p style={{ color: "#666" }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={styles.ctaContainer}>
      <div style={styles.ctaCard}>
        <h2
          style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)", marginBottom: "2rem" }}
        >
          The future of events is here.
        </h2>
        <button style={styles.primaryBtnHero}>Create Your Event</button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div className="footer-flex">
          <img src={logo} alt="Tictify" style={{ height: 24 }} />
          <p style={styles.muted}>
            © 2026 Tictify. Modern ticketing for modern creators.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    backgroundColor: "#030303",
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
    overflowX: "hidden",
  },
  noiseOverlay: {
    position: "fixed",
    inset: 0,
    backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
    opacity: 0.04,
    pointerEvents: "none",
    zIndex: 9999,
  },
  container: { maxWidth: 1200, margin: "0 auto", padding: "0 5vw" },
  containerNav: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 5vw",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },
  navWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1000,
    transition: "0.3s ease",
  },
  navLinks: { display: "flex", gap: "2rem", alignItems: "center" },
  logo: { height: 24, cursor: "pointer" },
  hamburger: {
    display: "none",
    flexDirection: "column",
    gap: "6px",
    cursor: "pointer",
  },
  line: {
    width: "25px",
    height: "2px",
    backgroundColor: "#fff",
    transition: "0.3s",
  },

  heroSection: {
    padding: "160px 0 80px",
    position: "relative",
    textAlign: "center",
  },
  auraLight: {
    position: "absolute",
    top: "-20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    height: "80%",
    background:
      "radial-gradient(circle, rgba(34,242,166,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  pillBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "99px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "0.8rem",
    color: "#22F2A6",
    marginBottom: "2rem",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 8vw, 5rem)",
    fontWeight: 850,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    marginBottom: "1.5rem",
  },
  gradientText: {
    background: "linear-gradient(90deg, #22F2A6, #7CFF9B)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    color: "#9F97B2",
    maxWidth: "650px",
    margin: "0 auto 3rem",
    lineHeight: 1.6,
  },
  heroBtnGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  marqueeContainer: {
    marginTop: "100px",
    overflow: "hidden",
    position: "relative",
  },
  marqueeTrack: { display: "flex", gap: "20px", width: "max-content" },
  marqueeImg: {
    width: "clamp(200px, 30vw, 350px)",
    height: "220px",
    objectFit: "cover",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  brandStrip: {
    padding: "40px 0",
    textAlign: "center",
    fontSize: "0.7rem",
    letterSpacing: "0.3em",
    color: "#555",
  },
  section: { padding: "100px 0" },
  sectionAlt: { padding: "100px 0", backgroundColor: "#080808" },
  sectionTitle: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 800,
    marginBottom: "4rem",
    textAlign: "center",
  },

  bentoCard: {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "3rem",
    borderRadius: "32px",
  },
  iconBox: { fontSize: "2rem", marginBottom: "1.5rem", display: "block" },

  priceCard: {
    background: "#111",
    padding: "3rem",
    borderRadius: "32px",
    position: "relative",
    textAlign: "center",
  },
  featuredBadge: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "#22F2A6",
    color: "#000",
    fontSize: "10px",
    fontWeight: 800,
    padding: "4px 12px",
    borderRadius: "99px",
  },
  priceValue: { fontSize: "3.5rem", fontWeight: 800, margin: "1rem 0" },
  priceList: {
    listStyle: "none",
    padding: 0,
    marginTop: "2rem",
    textAlign: "left",
    display: "grid",
    gap: "10px",
  },

  stepItem: { flex: 1, minWidth: "250px" },
  stepNumber: {
    color: "#22F2A6",
    fontWeight: 900,
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },

  ctaContainer: { padding: "100px 5vw" },
  ctaCard: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #111, #050505)",
    padding: "80px 40px",
    borderRadius: "48px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  footer: { padding: "60px 0", borderTop: "1px solid rgba(255,255,255,0.05)" },
  muted: { color: "#555", fontSize: "0.9rem" },

  primaryBtnSmall: {
    background: "#22F2A6",
    color: "#000",
    border: "none",
    padding: "12px 24px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryBtnHero: {
    background: "#22F2A6",
    color: "#000",
    border: "none",
    padding: "20px 40px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  secondaryBtnHero: {
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "20px 40px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  outlineBtnSmall: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "12px 24px",
    borderRadius: "99px",
    cursor: "pointer",
  },
  linkBtn: {
    textDecoration: "none",
    color: "#9F97B2",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
};

const globalCSS = `
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  
  .marquee-track { animation: marquee 40s linear infinite; }
  .responsive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  .step-flex { display: flex; flex-wrap: wrap; gap: 40px; justify-content: center; text-align: center; }

  @media (max-width: 800px) {
    .mobile-only { display: flex !important; }
    .nav-menu {
      position: fixed; top: 0; right: -100%; width: 100%; height: 100vh;
      background: #030303; flex-direction: column; justify-content: center;
      transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-menu.open { right: 0; }
    .span-2 { grid-column: span 1 !important; }
    .bento-card { padding: 2rem !important; }
  }

  @media (min-width: 801px) {
    .span-2 { grid-column: span 2; }
  }

  .footer-flex { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
  @media (max-width: 600px) { .footer-flex { justify-content: center; text-align: center; } }

  button:hover { transform: translateY(-3px); filter: brightness(1.1); transition: 0.2s; }
  .fade-in { animation: fadeIn 1s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;
