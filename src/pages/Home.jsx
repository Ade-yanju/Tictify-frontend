/* ═══════════════════════════════════════════════════════════
   Home.jsx — Tictify 2026 Landing
   Syne + DM Sans · ink #080910 · gold #E8C96A
   Content is ALWAYS visible — entrance motion is CSS-only
   (animation-fill-mode: both), never JS-gated.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const logo = "/logo.png";

const heroImages = [
  "/hero/hero1.jpg",
  "/hero/hero2.jpg",
  "/hero/hero3.jpg",
  "/hero/hero4.jpg",
  "/hero/hero5.jpg",
  "/hero/hero6.jpg",
  "/hero/hero7.jpg",
  "/hero/hero8.jpg",
  "/hero/hero9.jpg",
  "/hero/hero10.jpg",
];
const rowA = heroImages.slice(0, 5);
const rowB = heroImages.slice(5, 10);

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Count-up that starts immediately on mount ───────────── */
function Stat({ value, suffix, label }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf;
    let start;
    const duration = 1600;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setN(Math.floor(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="tf-stat">
      <span className="tf-stat-num">
        {n.toLocaleString()}
        {suffix}
      </span>
      <span className="tf-stat-label">{label}</span>
    </div>
  );
}

/* ── Icons (inline, dependency-free) ─────────────────────── */
const Ic = {
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a3 3 0 000 6v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a3 3 0 000-6z" />
      <path d="M13 5v2M13 11v2M13 17v2" strokeDasharray="1 3" />
    </svg>
  ),
  qr: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14h1M14 20h1M20 20h1v1" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  ),
};

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function Home() {
  injectStyles("tictify-home-css", CSS);

  return (
    <div className="tf-page" id="home">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <TrustBar />
        <Guests />
        <Organizers />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

/* ── Header ──────────────────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header className={`tf-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="tf-container tf-nav">
        <img
          src={logo}
          alt="Tictify"
          className="tf-logo"
          onClick={() => scrollTo("home")}
        />

        <nav className="tf-links" aria-label="Primary">
          <button className="tf-link" onClick={() => scrollTo("guests")}>
            Discover
          </button>
          <button className="tf-link" onClick={() => scrollTo("how")}>
            How it works
          </button>
          <button className="tf-link" onClick={() => scrollTo("pricing")}>
            Pricing
          </button>
          <button className="tf-btn tf-btn-ghost" onClick={() => go("/login")}>
            Login
          </button>
          <button className="tf-btn tf-btn-gold" onClick={() => go("/register")}>
            Sign Up
          </button>
        </nav>

        <button
          className={`tf-burger ${open ? "is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`tf-drawer ${open ? "is-open" : ""}`}>
        <button className="tf-drawer-link" onClick={() => scrollTo("guests")}>
          Discover
        </button>
        <button className="tf-drawer-link" onClick={() => scrollTo("how")}>
          How it works
        </button>
        <button className="tf-drawer-link" onClick={() => scrollTo("pricing")}>
          Pricing
        </button>
        <div className="tf-drawer-cta">
          <button className="tf-btn tf-btn-ghost tf-w100" onClick={() => go("/login")}>
            Login
          </button>
          <button className="tf-btn tf-btn-gold tf-w100" onClick={() => go("/register")}>
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── Hero — fully centered ───────────────────────────────── */
function Hero() {
  const navigate = useNavigate();

  return (
    <section className="tf-hero">
      <div className="tf-hero-glow" aria-hidden="true" />
      <div className="tf-container tf-hero-inner">
        <span className="tf-badge tf-rise" style={{ animationDelay: "0ms" }}>
          <span className="tf-badge-dot" /> Nigeria&apos;s event ticketing platform
        </span>

        <h1 className="tf-h1 tf-rise" style={{ animationDelay: "100ms" }}>
          Unforgettable events
          <br />
          start with <em>one ticket.</em>
        </h1>

        <p className="tf-sub tf-rise" style={{ animationDelay: "200ms" }}>
          Create your event, sell tickets online, and admit guests with secure
          QR codes — while your revenue lands straight in your wallet.
        </p>

        <div className="tf-hero-cta tf-rise" style={{ animationDelay: "300ms" }}>
          <button className="tf-btn tf-btn-gold tf-btn-lg" onClick={() => navigate("/login")}>
            Create an Event
          </button>
          <button className="tf-btn tf-btn-ghost tf-btn-lg" onClick={() => navigate("/events")}>
            Browse Events →
          </button>
        </div>

        <div className="tf-stats tf-rise" style={{ animationDelay: "420ms" }}>
          <Stat value={1200} suffix="+" label="Events hosted" />
          <div className="tf-stat-sep" />
          <Stat value={85000} suffix="+" label="Tickets scanned" />
          <div className="tf-stat-sep" />
          <Stat value={300} suffix="+" label="Organizers" />
        </div>
      </div>
    </section>
  );
}

/* ── Dual-direction image marquee — top-biased crop so faces
     and heads in the photos are always in frame ──────────── */
function Marquee() {
  return (
    <section className="tf-marquee" aria-hidden="true">
      <div className="tf-track tf-track-a">
        {[...rowA, ...rowA].map((src, i) => (
          <div className="tf-frame" key={`a${i}`}>
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
      <div className="tf-track tf-track-b">
        {[...rowB, ...rowB].map((src, i) => (
          <div className="tf-frame" key={`b${i}`}>
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Trust bar ───────────────────────────────────────────── */
function TrustBar() {
  return (
    <section className="tf-trust">
      <div className="tf-container">
        <p>
          Trusted by campus promoters, communities and event organizers
          across Nigeria
        </p>
      </div>
    </section>
  );
}

/* ── Feature card ────────────────────────────────────────── */
function Feature({ icon, title, text }) {
  return (
    <div className="tf-card">
      <div className="tf-card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Guests() {
  return (
    <section className="tf-section" id="guests">
      <div className="tf-container">
        <p className="tf-eyebrow">For guests</p>
        <h2 className="tf-h2">Your ticket, ready in seconds</h2>
        <div className="tf-grid-3">
          <Feature
            icon={Ic.ticket}
            title="Instant e-tickets"
            text="Pay and receive your ticket immediately — delivered to your inbox with everything you need."
          />
          <Feature
            icon={Ic.qr}
            title="QR code entry"
            text="One scan at the gate. No printing, no queues, no 'it's on my other phone'."
          />
          <Feature
            icon={Ic.shield}
            title="Fraud-proof"
            text="Every ticket is unique and single-use. Duplicates and screenshots don't get in."
          />
        </div>
      </div>
    </section>
  );
}

function Organizers() {
  return (
    <section className="tf-section tf-section-alt" id="organizers">
      <div className="tf-container">
        <p className="tf-eyebrow">For organizers</p>
        <h2 className="tf-h2">Run the show, not the spreadsheet</h2>
        <div className="tf-grid-3">
          <Feature
            icon={Ic.bolt}
            title="Launch in minutes"
            text="Create an event, set ticket tiers and pricing, and share your link. That's it."
          />
          <Feature
            icon={Ic.chart}
            title="Live analytics"
            text="Watch sales and revenue update in real time from your dashboard."
          />
          <Feature
            icon={Ic.wallet}
            title="Fast payouts"
            text="Withdraw your revenue straight to your Nigerian bank account."
          />
        </div>
      </div>
    </section>
  );
}

/* ── How it works ────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Create your event",
      text: "Add details, upload a banner and define your ticket tiers.",
    },
    {
      n: "02",
      title: "Sell tickets",
      text: "Guests pay securely online and get QR-coded tickets instantly.",
    },
    {
      n: "03",
      title: "Scan & admit",
      text: "Validate tickets at the gate with your phone camera. Zero fraud.",
    },
  ];

  return (
    <section className="tf-section" id="how">
      <div className="tf-container">
        <p className="tf-eyebrow">How it works</p>
        <h2 className="tf-h2">Three steps from idea to sold-out</h2>
        <div className="tf-steps">
          {steps.map((s) => (
            <div className="tf-step" key={s.n}>
              <span className="tf-step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ─────────────────────────────────────────────── */
function Pricing() {
  const navigate = useNavigate();

  return (
    <section className="tf-section tf-section-alt" id="pricing">
      <div className="tf-container">
        <p className="tf-eyebrow">Pricing</p>
        <h2 className="tf-h2">Simple. You only pay when you earn.</h2>

        <div className="tf-pricing">
          <div className="tf-price-card">
            <h3>Free events</h3>
            <div className="tf-price">
              ₦0<span>/ticket</span>
            </div>
            <ul>
              <li>Unlimited free events</li>
              <li>QR ticketing included</li>
              <li>Guest list &amp; scanning</li>
              <li>Email delivery</li>
            </ul>
            <button className="tf-btn tf-btn-ghost tf-w100" onClick={() => navigate("/register")}>
              Start free
            </button>
          </div>

          <div className="tf-price-card is-featured">
            <span className="tf-price-tag">Most popular</span>
            <h3>Paid events</h3>
            <div className="tf-price">
              3% + ₦80<span>/ticket sold</span>
            </div>
            <ul>
              <li>Everything in Free</li>
              <li>Secure online payments</li>
              <li>Real-time sales analytics</li>
              <li>Bank payouts on demand</li>
            </ul>
            <button className="tf-btn tf-btn-gold tf-w100" onClick={() => navigate("/register")}>
              Start selling
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA band ────────────────────────────────────────────── */
function CTA() {
  const navigate = useNavigate();

  return (
    <section className="tf-section">
      <div className="tf-container">
        <div className="tf-cta">
          <h2 className="tf-h2">Start selling tickets today</h2>
          <p>Create your first event in minutes — no card required.</p>
          <button className="tf-btn tf-btn-gold tf-btn-lg" onClick={() => navigate("/register")}>
            Get Started Free
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer() {
  const navigate = useNavigate();
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="tf-footer">
      <div className="tf-container">
        <div className="tf-footer-grid">
          <div className="tf-footer-brand">
            <img src={logo} alt="Tictify" className="tf-logo" />
            <p>
              The event ticketing platform for organizers and guests who want
              things to just work.
            </p>
          </div>

          <div className="tf-footer-col">
            <h4>Product</h4>
            <button onClick={() => navigate("/events")}>Browse events</button>
            <button onClick={() => scrollTo("how")}>How it works</button>
            <button onClick={() => scrollTo("pricing")}>Pricing</button>
          </div>

          <div className="tf-footer-col">
            <h4>Organizers</h4>
            <button onClick={() => navigate("/register")}>Create an event</button>
            <button onClick={() => navigate("/login")}>Organizer login</button>
            <button onClick={() => scrollTo("organizers")}>Features</button>
          </div>

          <div className="tf-footer-col">
            <h4>Guests</h4>
            <button onClick={() => navigate("/events")}>Find an event</button>
            <button onClick={() => navigate("/my-tickets")}>
              Find my tickets
            </button>
            <button onClick={() => scrollTo("guests")}>Why Tictify</button>
          </div>
        </div>

        <div className="tf-footer-bottom">
          <p>© {new Date().getFullYear()} Tictify. All rights reserved.</p>
          <p className="tf-footer-made">Built for events across Nigeria 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here.
   NOTE: sections are visible by default; .tf-rise is a
   pure-CSS entrance that always ENDS visible (fill: both).
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
:root {
  --bg:#080910; --surface:#0d0f16; --card:rgba(255,255,255,0.04);
  --border:rgba(255,255,255,0.08); --border-h:rgba(255,255,255,0.18);
  --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12); --gold-glo:rgba(232,201,106,0.22);
  --text:#F0EDE8; --muted:#8B887E; --live:#6BF0A0;
  --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif;
  --r:20px; --r-sm:12px;
}
html { scroll-behavior:smooth; }
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
button { font-family:var(--font-b); cursor:pointer; }
section { scroll-margin-top:88px; }

.tf-page { background:var(--bg); min-height:100svh; }
.tf-container { max-width:1160px; margin:0 auto; padding:0 clamp(18px,4.5vw,32px); }
.tf-w100 { width:100%; }

/* ── Entrance (CSS-only, always ends visible) ── */
@keyframes tfRise { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
.tf-rise { animation:tfRise .8s cubic-bezier(.2,.6,.2,1) both; }

/* ── Buttons ── */
.tf-btn { border-radius:999px; font-weight:600; font-size:14.5px; padding:11px 22px; transition:transform .25s, box-shadow .25s, background .25s, border-color .25s; border:1px solid transparent; }
.tf-btn-lg { padding:15px 30px; font-size:15.5px; }
.tf-btn-gold { background:var(--gold); color:#080910; }
.tf-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 34px var(--gold-glo); }
.tf-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.tf-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-2px); }

/* ── Header ── */
.tf-header { position:sticky; top:0; z-index:1000; backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); background:rgba(8,9,16,.72); border-bottom:1px solid transparent; transition:border-color .3s, background .3s; }
.tf-header.is-scrolled { border-bottom-color:var(--border); background:rgba(8,9,16,.9); }
.tf-nav { height:70px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
.tf-logo { height:32px; cursor:pointer; display:block; }
.tf-links { display:flex; align-items:center; gap:6px; }
.tf-link { background:none; border:none; color:var(--muted); font-size:14.5px; font-weight:500; padding:9px 14px; border-radius:999px; transition:color .25s, background .25s; }
.tf-link:hover { color:var(--text); background:var(--card); }
.tf-links .tf-btn { margin-left:6px; }

/* burger */
.tf-burger { display:none; flex-direction:column; justify-content:center; gap:5px; width:44px; height:44px; background:var(--card); border:1px solid var(--border); border-radius:12px; align-items:center; }
.tf-burger span { display:block; width:18px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.tf-burger.is-open span:nth-child(1){ transform:translateY(7px) rotate(45deg); }
.tf-burger.is-open span:nth-child(2){ opacity:0; }
.tf-burger.is-open span:nth-child(3){ transform:translateY(-7px) rotate(-45deg); }

/* drawer */
.tf-drawer { display:none; }

/* ── Hero — everything centered ── */
.tf-hero { position:relative; padding:clamp(72px,11vw,140px) 0 clamp(40px,6vw,72px); }
.tf-hero-inner { display:flex; flex-direction:column; align-items:center; text-align:center; }
.tf-hero-glow { position:absolute; top:-180px; left:50%; transform:translateX(-50%); width:min(720px,90vw); height:480px; background:radial-gradient(ellipse at center, var(--gold-dim), transparent 65%); pointer-events:none; animation:tfGlow 7s ease-in-out infinite; }
@keyframes tfGlow { 0%,100%{opacity:.55} 50%{opacity:1} }

.tf-badge { display:inline-flex; align-items:center; gap:8px; font-size:12.5px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); border:1px solid rgba(232,201,106,.25); padding:8px 16px; border-radius:999px; }
.tf-badge-dot { width:7px; height:7px; border-radius:50%; background:var(--live); animation:tfPulse 2s ease-in-out infinite; }
@keyframes tfPulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:.5; transform:scale(.8)} }

.tf-h1 { font-family:var(--font-h); font-weight:800; font-size:clamp(25px,8vw,76px); line-height:1.06; letter-spacing:-.02em; margin:26px auto 0; max-width:min(860px,100%); text-wrap:balance; }
.tf-h1 em { font-style:normal; color:var(--gold); }
.tf-sub { color:var(--muted); font-size:clamp(15.5px,2vw,18.5px); line-height:1.65; max-width:580px; margin:22px auto 0; }
.tf-hero-cta { display:flex; justify-content:center; gap:14px; flex-wrap:wrap; margin-top:34px; }

.tf-stats { display:flex; justify-content:center; align-items:center; gap:clamp(18px,4vw,44px); margin-top:clamp(40px,6vw,64px); flex-wrap:wrap; }
.tf-stat { display:flex; flex-direction:column; align-items:center; gap:4px; min-width:110px; }
.tf-stat-num { font-family:var(--font-h); font-weight:700; font-size:clamp(24px,3.4vw,34px); color:var(--gold); font-variant-numeric:tabular-nums; }
.tf-stat-label { font-size:13px; color:var(--muted); }
.tf-stat-sep { width:1px; height:38px; background:var(--border); }

/* ── Marquee — top-biased crop keeps heads/faces in frame ── */
.tf-marquee { position:relative; display:grid; gap:16px; padding:clamp(24px,4vw,40px) 0; overflow:hidden; }
.tf-marquee::before, .tf-marquee::after { content:''; position:absolute; top:0; bottom:0; width:clamp(40px,10vw,160px); z-index:2; pointer-events:none; }
.tf-marquee::before { left:0; background:linear-gradient(90deg, var(--bg), transparent); }
.tf-marquee::after { right:0; background:linear-gradient(-90deg, var(--bg), transparent); }
.tf-track { display:flex; gap:16px; width:max-content; will-change:transform; }
.tf-track-a { animation:tfScroll 46s linear infinite; }
.tf-track-b { animation:tfScroll 58s linear infinite reverse; }
.tf-marquee:hover .tf-track { animation-play-state:paused; }
@keyframes tfScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.tf-frame { flex:0 0 auto; width:clamp(250px,32vw,400px); aspect-ratio:16/11; border-radius:var(--r); overflow:hidden; border:1px solid var(--border); transition:border-color .4s; }
.tf-frame img { width:100%; height:100%; object-fit:cover; object-position:50% 18%; transition:transform .6s ease; display:block; }
.tf-frame:hover { border-color:rgba(232,201,106,.45); }
.tf-frame:hover img { transform:scale(1.05); }

/* ── Trust ── */
.tf-trust { padding:clamp(20px,3vw,32px) 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.tf-trust p { text-align:center; color:var(--muted); font-size:13.5px; letter-spacing:.14em; text-transform:uppercase; font-weight:500; }

/* ── Sections ── */
.tf-section { padding:clamp(64px,9vw,112px) 0; }
.tf-section-alt { background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.tf-eyebrow { color:var(--gold); font-size:12.5px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; margin-bottom:14px; text-align:center; }
.tf-h2 { font-family:var(--font-h); font-weight:700; font-size:clamp(26px,4.4vw,42px); letter-spacing:-.01em; line-height:1.12; max-width:640px; text-wrap:balance; margin:0 auto clamp(32px,5vw,52px); text-align:center; }

/* ── Cards ── */
.tf-grid-3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr)); gap:clamp(14px,2.4vw,24px); }
.tf-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(22px,3vw,30px); height:100%; transition:transform .3s, border-color .3s; }
.tf-card:hover { transform:translateY(-4px); border-color:var(--border-h); }
.tf-card-icon { width:46px; height:46px; border-radius:14px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin-bottom:18px; }
.tf-card-icon svg { width:22px; height:22px; }
.tf-card h3 { font-family:var(--font-h); font-size:17.5px; font-weight:700; margin-bottom:10px; }
.tf-card p { color:var(--muted); font-size:14.5px; line-height:1.65; }

/* ── Steps ── */
.tf-steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr)); gap:clamp(14px,2.4vw,24px); }
.tf-step { position:relative; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(22px,3vw,30px); height:100%; transition:transform .3s, border-color .3s; }
.tf-step:hover { transform:translateY(-4px); border-color:var(--border-h); }
.tf-step-num { font-family:var(--font-h); font-weight:800; font-size:15px; color:var(--gold); display:inline-grid; place-items:center; width:44px; height:44px; border-radius:50%; border:1px dashed rgba(232,201,106,.45); margin-bottom:18px; }
.tf-step h3 { font-family:var(--font-h); font-size:17px; font-weight:700; margin-bottom:10px; }
.tf-step p { color:var(--muted); font-size:14.5px; line-height:1.65; }

/* ── Pricing ── */
.tf-pricing { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr)); gap:clamp(14px,2.4vw,24px); max-width:760px; margin:0 auto; }
.tf-price-card { position:relative; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,3.4vw,34px); height:100%; display:flex; flex-direction:column; }
.tf-price-card.is-featured { border-color:rgba(232,201,106,.4); background:linear-gradient(180deg, var(--gold-dim), var(--card) 55%); }
.tf-price-tag { position:absolute; top:-12px; left:24px; background:var(--gold); color:#080910; font-size:11.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:5px 12px; border-radius:999px; }
.tf-price-card h3 { font-family:var(--font-h); font-size:16px; font-weight:700; color:var(--muted); }
.tf-price { font-family:var(--font-h); font-weight:800; font-size:clamp(30px,4vw,40px); margin:14px 0 20px; color:var(--text); }
.tf-price span { font-size:14px; font-weight:500; color:var(--muted); font-family:var(--font-b); margin-left:6px; }
.tf-price-card ul { list-style:none; display:grid; gap:11px; margin-bottom:26px; flex:1; }
.tf-price-card li { color:var(--muted); font-size:14.5px; padding-left:24px; position:relative; }
.tf-price-card li::before { content:'✓'; position:absolute; left:0; color:var(--live); font-weight:700; }

/* ── CTA ── */
.tf-cta { text-align:center; background:linear-gradient(180deg, var(--gold-dim), transparent 80%); border:1px solid rgba(232,201,106,.28); border-radius:calc(var(--r) + 8px); padding:clamp(44px,7vw,80px) clamp(20px,5vw,60px); }
.tf-cta .tf-h2 { margin:0 auto 14px; }
.tf-cta p { color:var(--muted); margin-bottom:30px; }

/* ── Footer ── */
.tf-footer { border-top:1px solid var(--border); background:var(--surface); padding:clamp(44px,6vw,64px) 0 0; }
.tf-footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:clamp(24px,4vw,48px); padding-bottom:clamp(32px,5vw,48px); }
.tf-footer-brand p { color:var(--muted); font-size:14px; line-height:1.7; margin-top:16px; max-width:280px; }
.tf-footer-col { display:flex; flex-direction:column; gap:12px; }
.tf-footer-col h4 { font-family:var(--font-h); font-size:13px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--text); margin-bottom:4px; }
.tf-footer-col button { background:none; border:none; color:var(--muted); font-size:14px; text-align:left; padding:2px 0; transition:color .25s; }
.tf-footer-col button:hover { color:var(--gold); }
.tf-footer-bottom { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; border-top:1px solid var(--border); padding:20px 0 26px; }
.tf-footer-bottom p { color:var(--muted); font-size:13px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 920px) {
  .tf-links { display:none; }
  .tf-burger { display:flex; }
  .tf-drawer { display:flex; flex-direction:column; gap:4px; position:fixed; inset:70px 0 0 0; background:rgba(8,9,16,.98); backdrop-filter:blur(16px); padding:22px clamp(18px,5vw,32px); z-index:999; transform:translateY(-8px); opacity:0; pointer-events:none; transition:opacity .3s, transform .3s; }
  .tf-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .tf-drawer-link { background:none; border:none; border-bottom:1px solid var(--border); color:var(--text); font-size:17px; font-weight:600; font-family:var(--font-h); text-align:left; padding:18px 4px; }
  .tf-drawer-cta { display:grid; gap:10px; margin-top:24px; }
  .tf-drawer-cta .tf-btn { padding:15px; font-size:15.5px; }
}
@media (max-width: 560px) {
  .tf-stat-sep { display:none; }
  .tf-stats { gap:22px; }
  .tf-hero-cta .tf-btn { flex:1 1 100%; text-align:center; }
  .tf-frame { width:min(78vw, 340px); }
  .tf-footer-grid { grid-template-columns:1fr 1fr; }
  .tf-footer-brand { grid-column:1 / -1; }
  .tf-footer-bottom { flex-direction:column; align-items:flex-start; }
}
@media (max-width: 380px) {
  .tf-footer-grid { grid-template-columns:1fr; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .tf-rise { opacity:1; transform:none; }
}
`;
