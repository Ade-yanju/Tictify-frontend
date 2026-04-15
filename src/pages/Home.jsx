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
      <div style={styles.noiseOverlay} /> {/* 2026 Texture Trend */}
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

/* ================= NAV (Floating Glass) ================= */
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        ...styles.navWrapper,
        backgroundColor: scrolled ? "rgba(3, 3, 3, 0.7)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}
    >
      <div style={styles.containerNav}>
        <img src={logo} alt="Tictify" style={styles.logo} />
        <div style={styles.navLinks}>
          <button
            style={styles.linkBtn}
            onClick={() =>
              document
                .getElementById("features")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Features
          </button>
          <button
            style={styles.linkBtn}
            onClick={() =>
              document
                .getElementById("pricing")
                .scrollIntoView({ behavior: "smooth" })
            }
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

/* ================= HERO (Aura Lighting) ================= */
function Hero() {
  const navigate = useNavigate();
  return (
    <section style={styles.heroSection}>
      <div style={styles.auraLight} />
      <div style={styles.container}>
        <div style={styles.heroContent}>
          <div style={styles.pillBadge}>
            ✨ Now integrated with Paystack Transfer
          </div>
          <h1 style={styles.heroTitle}>
            The infrastructure for <br />
            <span style={styles.gradientText}>Modern Events.</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Issue secure QR tickets, automate instant payouts, and scale your
            audience with Tictify's next-gen ticketing engine.
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
            <div key={i} style={styles.marqueeCard}>
              <img src={img} alt="Event" style={styles.marqueeImg} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURES (The Bento Grid) ================= */
function FeaturesBento() {
  return (
    <section id="features" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>
          Built for Scale. <br /> Designed for Simplicity.
        </h2>
        <div style={styles.bentoGrid}>
          <div style={{ ...styles.bentoCard, gridColumn: "span 2" }}>
            <span style={styles.iconBox}>⚡</span>
            <h3>Instant Payouts</h3>
            <p>
              Withdraw revenue to your bank account instantly via Paystack. No
              more waiting 3-5 business days.
            </p>
          </div>
          <div style={styles.bentoCard}>
            <span style={styles.iconBox}>🔒</span>
            <h3>QR Anti-Fraud</h3>
            <p>
              Proprietary high-speed scanning to prevent ticket duplication.
            </p>
          </div>
          <div style={styles.bentoCard}>
            <span style={styles.iconBox}>📊</span>
            <h3>Live Intel</h3>
            <p>Watch ticket sales and check-ins happen in real-time.</p>
          </div>
          <div style={{ ...styles.bentoCard, gridColumn: "span 2" }}>
            <span style={styles.iconBox}>📱</span>
            <h3>Guest Wallet</h3>
            <p>
              Guests keep all tickets in one secure, digital vault — accessible
              even without internet.
            </p>
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
        <div style={styles.pricingHeader}>
          <h2>Straightforward Pricing</h2>
          <p>Only pay when you sell. No hidden monthly fees.</p>
        </div>
        <div style={styles.pricingGrid}>
          <div style={styles.priceCard}>
            <p style={styles.cardLabel}>FREE EVENTS</p>
            <h3 style={styles.priceValue}>₦0</h3>
            <p style={styles.priceMeta}>Per ticket</p>
            <ul style={styles.priceList}>
              <li>Unlimited free tickets</li>
              <li>QR Code scanning</li>
              <li>Basic analytics</li>
            </ul>
          </div>
          <div style={{ ...styles.priceCard, border: "1px solid #22F2A6" }}>
            <div style={styles.featuredBadge}>MOST POPULAR</div>
            <p style={styles.cardLabel}>PRO ORGANIZER</p>
            <h3 style={styles.priceValue}>3% + ₦80</h3>
            <p style={styles.priceMeta}>Per paid ticket</p>
            <ul style={styles.priceList}>
              <li>Instant Withdrawals</li>
              <li>Priority Admin Support</li>
              <li>Advanced Sales Intel</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= FOOTER / CTA ================= */
function BrandStrip() {
  return (
    <div style={styles.brandStrip}>
      <p>TRUSTED BY OVER 500+ CAMPUS COMMUNITIES AND NIGERIAN PROMOTERS</p>
    </div>
  );
}

function HowItWorks() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.stepGrid}>
          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>1</div>
            <h4>Configure</h4>
            <p>Set event dates and ticket tiers in seconds.</p>
          </div>
          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>2</div>
            <h4>Broadcast</h4>
            <p>Share your unique link or embed on your site.</p>
          </div>
          <div style={styles.stepItem}>
            <div style={styles.stepNumber}>3</div>
            <h4>Receive</h4>
            <p>Revenue lands in your Tictify wallet immediately.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const navigate = useNavigate();
  return (
    <section style={styles.ctaContainer}>
      <div style={styles.ctaCard}>
        <h2>
          Ready to host your next <br /> big thing?
        </h2>
        <button
          style={styles.primaryBtnHero}
          onClick={() => navigate("/register")}
        >
          Create My First Event
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <img src={logo} alt="Tictify" style={{ height: 30 }} />
          <p style={styles.muted}>
            © 2026 Tictify Technologies. Built for the next generation of
            experiences.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ================= STYLES (2026 SV THEME) ================= */
const styles = {
  page: {
    backgroundColor: "#030303",
    color: "#fff",
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
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
  logo: { height: 28, cursor: "pointer" },

  heroSection: {
    padding: "160px 0 100px",
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
    fontSize: "13px",
    color: "#22F2A6",
    marginBottom: "24px",
  },
  heroTitle: {
    fontSize: "clamp(40px, 8vw, 84px)",
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    marginBottom: "24px",
  },
  gradientText: {
    background: "linear-gradient(90deg, #22F2A6, #7CFF9B)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "clamp(16px, 2vw, 20px)",
    color: "#9F97B2",
    maxWidth: "600px",
    margin: "0 auto 40px",
    lineHeight: 1.6,
  },
  heroBtnGroup: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  marqueeContainer: {
    marginTop: "100px",
    overflow: "hidden",
    position: "relative",
  },
  marqueeTrack: {
    display: "flex",
    animation: "marquee 40s linear infinite",
    width: "max-content",
  },
  marqueeCard: {
    width: "300px",
    height: "200px",
    margin: "0 10px",
    flexShrink: 0,
  },
  marqueeImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  brandStrip: {
    padding: "40px 0",
    textAlign: "center",
    fontSize: "12px",
    letterSpacing: "0.2em",
    color: "#666",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  section: { padding: "100px 0" },
  sectionAlt: { padding: "100px 0", backgroundColor: "#080808" },
  sectionTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: 700,
    marginBottom: "60px",
    letterSpacing: "-0.02em",
  },

  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  bentoCard: {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "40px",
    borderRadius: "32px",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  iconBox: { fontSize: "32px", marginBottom: "20px", display: "block" },

  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 450px))",
    gap: "30px",
    justifyContent: "center",
  },
  priceCard: {
    background: "#111",
    padding: "48px",
    borderRadius: "32px",
    position: "relative",
  },
  featuredBadge: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "#22F2A6",
    color: "#000",
    fontSize: "10px",
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: "99px",
  },
  priceValue: { fontSize: "48px", fontWeight: 800, margin: "10px 0" },
  priceMeta: { color: "#666", marginBottom: "30px" },
  priceList: {
    listStyle: "none",
    padding: 0,
    display: "grid",
    gap: "15px",
    color: "#9F97B2",
  },

  ctaContainer: { padding: "100px 24px" },
  ctaCard: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #111 0%, #050505 100%)",
    padding: "80px 40px",
    borderRadius: "48px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  stepGrid: {
    display: "flex",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },
  stepItem: { flex: 1, minWidth: "250px" },
  stepNumber: {
    fontSize: "14px",
    color: "#22F2A6",
    fontWeight: 800,
    marginBottom: "16px",
    borderBottom: "2px solid #22F2A6",
    display: "inline-block",
    width: "30px",
  },

  footer: { padding: "60px 0", borderTop: "1px solid rgba(255,255,255,0.05)" },
  muted: { color: "#666", fontSize: "14px" },

  /* Buttons */
  primaryBtnSmall: {
    background: "#22F2A6",
    color: "#000",
    border: "none",
    padding: "10px 20px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px",
  },
  primaryBtnHero: {
    background: "#22F2A6",
    color: "#000",
    border: "none",
    padding: "18px 36px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "16px",
    transition: "transform 0.2s ease",
  },
  secondaryBtnHero: {
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "18px 36px",
    borderRadius: "99px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "16px",
  },
  outlineBtnSmall: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "10px 20px",
    borderRadius: "99px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#9F97B2",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  },
};

const globalCSS = `
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { -webkit-font-smoothing: antialiased; }
  button:hover { transform: translateY(-2px); opacity: 0.9; }
`;
