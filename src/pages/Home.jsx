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

/* ================= NAV (Responsive Glass) ================= */
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          scrolled || mobileMenuOpen ? "rgba(3, 3, 3, 0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}
    >
      <div style={styles.containerNav}>
        <img src={logo} alt="Tictify" style={styles.logo} />

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={styles.menuToggle}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <div
          className={`nav-links ${mobileMenuOpen ? "active" : ""}`}
          style={styles.navLinks}
        >
          <button
            style={styles.linkBtn}
            onClick={() => {
              document
                .getElementById("features")
                .scrollIntoView({ behavior: "smooth" });
              setMobileMenuOpen(false);
            }}
          >
            Features
          </button>
          <button
            style={styles.linkBtn}
            onClick={() => {
              document
                .getElementById("pricing")
                .scrollIntoView({ behavior: "smooth" });
              setMobileMenuOpen(false);
            }}
          >
            Pricing
          </button>
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

/* ================= HERO (Responsive Aura) ================= */
function Hero() {
  const navigate = useNavigate();
  return (
    <section style={styles.heroSection}>
      <div style={styles.auraLight} />
      <div style={styles.container}>
        <div style={styles.heroContent}>
          <div style={styles.pillBadge}>✨ Now integrated with Paystack</div>
          <h1 style={styles.heroTitle}>
            The infrastructure for <br />
            <span style={styles.gradientText}>Modern Events.</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Issue secure QR tickets, automate instant payouts, and scale your
            audience.
          </p>
          <div style={styles.heroBtnGroup}>
            <button
              style={styles.primaryBtnHero}
              onClick={() => navigate("/register")}
            >
              Start Organizing
            </button>
            <button
              style={styles.secondaryBtnHero}
              onClick={() => navigate("/events")}
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>

      <div style={styles.marqueeContainer}>
        <div style={styles.marqueeTrack}>
          {[...heroImages, ...heroImages].map((img, i) => (
            <div key={i} className="marquee-card" style={styles.marqueeCard}>
              <img src={img} alt="Event" style={styles.marqueeImg} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURES (Responsive Bento) ================= */
function FeaturesBento() {
  return (
    <section id="features" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Built for Scale.</h2>
        <div className="bento-grid" style={styles.bentoGrid}>
          <div className="bento-card span-2" style={styles.bentoCard}>
            <span style={styles.iconBox}>⚡</span>
            <h3>Instant Payouts</h3>
            <p>Withdraw revenue to your bank account instantly via Paystack.</p>
          </div>
          <div className="bento-card" style={styles.bentoCard}>
            <span style={styles.iconBox}>🔒</span>
            <h3>QR Anti-Fraud</h3>
            <p>High-speed scanning to prevent ticket duplication.</p>
          </div>
          <div className="bento-card" style={styles.bentoCard}>
            <span style={styles.iconBox}>📊</span>
            <h3>Live Intel</h3>
            <p>Watch ticket sales happen in real-time.</p>
          </div>
          <div className="bento-card span-2" style={styles.bentoCard}>
            <span style={styles.iconBox}>📱</span>
            <h3>Guest Wallet</h3>
            <p>Keep all tickets in one secure, digital vault.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= PRICING (Stacking Grid) ================= */
function PricingGrid() {
  return (
    <section id="pricing" style={styles.sectionAlt}>
      <div style={styles.container}>
        <div style={styles.pricingHeader}>
          <h2 style={styles.sectionTitle}>Pricing</h2>
        </div>
        <div className="pricing-grid" style={styles.pricingGrid}>
          <div style={styles.priceCard}>
            <p style={styles.cardLabel}>FREE EVENTS</p>
            <h3 style={styles.priceValue}>₦0</h3>
            <ul style={styles.priceList}>
              <li>Unlimited free tickets</li>
              <li>QR Code scanning</li>
            </ul>
          </div>
          <div style={{ ...styles.priceCard, border: "1px solid #22F2A6" }}>
            <div style={styles.featuredBadge}>MOST POPULAR</div>
            <p style={styles.cardLabel}>PRO ORGANIZER</p>
            <h3 style={styles.priceValue}>3% + ₦80</h3>
            <ul style={styles.priceList}>
              <li>Instant Withdrawals</li>
              <li>Priority Support</li>
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
      <p style={{ padding: "0 20px" }}>TRUSTED BY 500+ CAMPUS COMMUNITIES</p>
    </div>
  );
}

function HowItWorks() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div className="step-grid" style={styles.stepGrid}>
          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>1</div>
            <h4>Configure</h4>
          </div>
          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>2</div>
            <h4>Broadcast</h4>
          </div>
          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>3</div>
            <h4>Receive</h4>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={styles.ctaContainer}>
      <div className="cta-card" style={styles.ctaCard}>
        <h2>Ready to host?</h2>
        <button style={styles.primaryBtnHero}>Create My First Event</button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div
          className="footer-content"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <img src={logo} alt="Tictify" style={{ height: 24 }} />
          <p style={styles.muted}>© 2026 Tictify Technologies.</p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  page: {
    backgroundColor: "#030303",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    overflowX: "hidden",
  },
  noiseOverlay: {
    position: "fixed",
    inset: 0,
    backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
    opacity: 0.05,
    pointerEvents: "none",
    zIndex: 9999,
  },
  container: { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
  containerNav: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
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
    height: 72,
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  navLinks: { display: "flex", gap: "24px", alignItems: "center" },
  menuToggle: {
    display: "none",
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
  },
  logo: { height: 24 },

  heroSection: {
    padding: "140px 0 60px",
    position: "relative",
    textAlign: "center",
  },
  auraLight: {
    position: "absolute",
    top: "-10%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    height: "60%",
    background:
      "radial-gradient(circle, rgba(34,242,166,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  pillBadge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "99px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "12px",
    color: "#22F2A6",
    marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "clamp(32px, 8vw, 72px)",
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: "20px",
  },
  gradientText: {
    background: "linear-gradient(90deg, #22F2A6, #7CFF9B)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "clamp(16px, 2vw, 18px)",
    color: "#9F97B2",
    maxWidth: "500px",
    margin: "0 auto 32px",
    lineHeight: 1.5,
  },
  heroBtnGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  marqueeContainer: { marginTop: "60px", overflow: "hidden" },
  marqueeTrack: {
    display: "flex",
    animation: "marquee 30s linear infinite",
    width: "max-content",
  },
  marqueeCard: { width: "260px", height: "180px", margin: "0 8px" },
  marqueeImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "16px",
  },

  brandStrip: {
    padding: "30px 0",
    textAlign: "center",
    fontSize: "11px",
    color: "#444",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  section: { padding: "80px 0" },
  sectionAlt: { padding: "80px 0", backgroundColor: "#080808" },
  sectionTitle: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: 700,
    marginBottom: "40px",
  },

  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  bentoCard: {
    background: "#111",
    padding: "32px",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  iconBox: { fontSize: "28px", marginBottom: "16px", display: "block" },

  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  priceCard: {
    background: "#111",
    padding: "40px",
    borderRadius: "24px",
    position: "relative",
  },
  featuredBadge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#22F2A6",
    color: "#000",
    fontSize: "10px",
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: "99px",
  },
  priceValue: { fontSize: "40px", fontWeight: 800, margin: "10px 0" },
  priceList: {
    listStyle: "none",
    padding: 0,
    color: "#9F97B2",
    fontSize: "14px",
  },

  stepGrid: { display: "flex", justifyContent: "space-between", gap: "30px" },
  stepItem: { flex: 1 },
  stepNumber: {
    color: "#22F2A6",
    fontWeight: 800,
    borderBottom: "2px solid #22F2A6",
    marginBottom: "12px",
    width: "24px",
  },

  ctaContainer: { padding: "60px 24px" },
  ctaCard: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "#111",
    padding: "60px 20px",
    borderRadius: "32px",
    textAlign: "center",
  },
  footer: { padding: "40px 0", borderTop: "1px solid rgba(255,255,255,0.05)" },
  muted: { color: "#666", fontSize: "12px" },

  primaryBtnSmall: {
    background: "#22F2A6",
    border: "none",
    padding: "10px 18px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryBtnHero: {
    background: "#22F2A6",
    border: "none",
    padding: "16px 32px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtnHero: {
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "16px 32px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
  },
  outlineBtnSmall: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "10px 18px",
    borderRadius: "99px",
    cursor: "pointer",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#9F97B2",
    cursor: "pointer",
    fontSize: "14px",
  },
};

const globalCSS = `
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  
  /* Responsive Breakpoints */
  @media (max-width: 768px) {
    .mobile-toggle { display: block !important; z-index: 1001; }
    .nav-links {
      position: fixed; top: 0; right: -100%; width: 80%; height: 100vh;
      background: #030303; flex-direction: column; justify-content: center;
      transition: 0.3s ease; z-index: 1000; box-shadow: -10px 0 30px rgba(0,0,0,0.5);
    }
    .nav-links.active { right: 0; }
    .span-2 { grid-column: span 1 !important; }
    .step-grid { flex-direction: column; }
    .marquee-card { width: 200px !important; height: 140px !important; }
    .footer-content { flex-direction: column; text-align: center; }
  }

  button:active { transform: scale(0.95); }
  button:hover { opacity: 0.8; }
`;
