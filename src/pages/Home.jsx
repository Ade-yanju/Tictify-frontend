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
    <div className="home">
      <Navbar />
      <Hero />
      <Trust />
      <Guests />
      <Organizers />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />

      <style>{css}</style>
    </div>
  );
}

/* ================= NAVBAR ================= */

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <img src={logo} className="logo" />

        <div className="nav-links desktop">
          <button>Home</button>
          <button onClick={() => navigate("/events")}>Discover</button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="primary" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>

        <button className="mobile-toggle" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      {open && (
        <div className="mobile-menu">
          <button onClick={() => navigate("/events")}>Discover</button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="primary" onClick={() => navigate("/register")}>
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
    <section className="hero">
      <div className="hero-inner">
        <span className="badge">🎟️ Event Ticketing Platform</span>

        <h1>Sell Event Tickets The Smart Way</h1>

        <p>
          Create events, sell tickets, and manage entry with secure QR codes.
        </p>

        <div className="hero-buttons">
          <button className="primary" onClick={() => navigate("/login")}>
            Create Event
          </button>

          <button className="outline" onClick={() => navigate("/events")}>
            Browse Events
          </button>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="track">
          {[...heroImages, ...heroImages].map((img, i) => (
            <img key={i} src={img} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= TRUST ================= */

function Trust() {
  return (
    <section className="trust">
      Trusted by campus promoters and event organizers across Nigeria
    </section>
  );
}

/* ================= GUESTS ================= */

function Guests() {
  return (
    <section className="section alt">
      <h2>For Guests</h2>
      <div className="grid">
        <Card title="Instant Tickets" text="Receive e-ticket immediately." />
        <Card title="QR Entry" text="Fast event check-in." />
        <Card title="No Stress" text="No printing. No queues." />
      </div>
    </section>
  );
}

/* ================= ORGANIZERS ================= */

function Organizers() {
  return (
    <section className="section">
      <h2>For Organizers</h2>
      <div className="grid">
        <Card title="Create Events" text="Launch in minutes." />
        <Card title="Secure Payments" text="Powered by ErcasPay." />
        <Card title="Analytics" text="Track ticket sales live." />
      </div>
    </section>
  );
}

/* ================= HOW IT WORKS ================= */

function HowItWorks() {
  return (
    <section className="section alt">
      <h2>How It Works</h2>
      <div className="grid">
        <Step number="01" title="Create Event" text="Add tickets & details" />
        <Step number="02" title="Sell Tickets" text="Guests pay securely" />
        <Step number="03" title="Scan Entry" text="Prevent fraud" />
      </div>
    </section>
  );
}

/* ================= PRICING ================= */

function Pricing() {
  return (
    <section className="section">
      <h2>Pricing</h2>
      <div className="grid">
        <Card title="Free" text="₦0 for free events" />
        <Card title="Pro" text="3% + ₦80 per ticket" />
      </div>
    </section>
  );
}

/* ================= CTA ================= */

function CTA() {
  const navigate = useNavigate();

  return (
    <section className="cta">
      <h2>Start Selling Tickets Today</h2>
      <button className="primary" onClick={() => navigate("/register")}>
        Get Started
      </button>
    </section>
  );
}

/* ================= FOOTER ================= */

function Footer() {
  return (
    <footer className="footer">
      <img src={logo} />
      <p>© {new Date().getFullYear()} Tictify</p>
    </footer>
  );
}

/* ================= REUSABLE ================= */

function Card({ title, text }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="card">
      <span className="step">{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

/* ================= RESPONSIVE CSS ================= */

const css = `
.home{background:#0F0618;color:#fff;font-family:Inter, sans-serif}

/* NAV */
.nav{position:sticky;top:0;background:rgba(15,6,24,.9);backdrop-filter:blur(10px)}
.nav-inner{max-width:1200px;margin:auto;padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
.logo{height:34px}
.nav-links{display:flex;gap:18px}
.mobile-toggle{display:none}

/* HERO */
.hero{padding:90px 20px;text-align:center}
.hero-inner{max-width:700px;margin:auto}
.hero h1{font-size:clamp(28px,5vw,56px)}
.hero p{color:#bbb;margin:16px 0 28px}
.hero-buttons{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

/* MARQUEE */
.marquee{overflow:hidden;margin-top:60px}
.track{display:flex;width:200%;animation:scroll 35s linear infinite}
.track img{width:300px;height:180px;object-fit:cover;margin-right:14px;border-radius:14px}

/* SECTIONS */
.section{padding:80px 20px;text-align:center}
.alt{background:#170A25}
.grid{max-width:1100px;margin:auto;display:grid;gap:24px}

/* CTA */
.cta{text-align:center;padding:90px 20px}

/* FOOTER */
.footer{text-align:center;padding:40px;border-top:1px solid rgba(255,255,255,.1)}

/* BUTTONS */
.primary{background:#22F2A6;border:none;padding:12px 26px;border-radius:999px;color:black}
.outline{border:1px solid #22F2A6;background:none;color:#22F2A6;padding:12px 26px;border-radius:999px}

/* RESPONSIVE */

/* phones */
@media(max-width:600px){
.grid{grid-template-columns:1fr}
.nav-links.desktop{display:none}
.mobile-toggle{display:block;background:none;border:none;color:white;font-size:22px}
}

/* tablets */
@media(min-width:601px) and (max-width:1023px){
.grid{grid-template-columns:repeat(2,1fr)}
}

/* laptop */
@media(min-width:1024px){
.grid{grid-template-columns:repeat(3,1fr)}
}

/* desktop */
@media(min-width:1400px){
.grid{grid-template-columns:repeat(4,1fr)}
}

@keyframes scroll{
from{transform:translateX(0)}
to{transform:translateX(-50%)}
}
`;
