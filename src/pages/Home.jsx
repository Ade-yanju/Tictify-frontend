/* ═══════════════════════════════════════════════════════════
   Home.jsx — Tictify 2026 Landing
   Syne + DM Sans · ink #080910 · gold #E8C96A
   Content is ALWAYS visible — entrance motion is CSS-only
   (animation-fill-mode: both), never JS-gated.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { botNumber, whatsappBuyEnabled } from "../utils/whatsapp";

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

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function Home() {
  injectStyles("tictify-home-css", CSS);
  const navigate = useNavigate();

  /* Real events for the "Happening soon" rail. Failure is silent and
     the section hides itself — a landing page must still render if
     the API is down. */
  const [events, setEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.VITE_API_URL}/api/events`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (!active) return;
        const list = Array.isArray(d) ? d : d.events || [];
        setEvents(list.slice(0, 6));
        setEvLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setEvents([]);
        setEvLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="tf-page" id="home">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <TrustBar />
        <LiveEvents
          events={events}
          loading={evLoading}
          onOpen={(to) => navigate(to)}
        />
        <StackedCards />
        <WhatsAppSection />
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
            Browse Events <Icon name="arrowRight" />
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

/* ── Live events ──────────────────────────────────────────────
   Replaces a 3-up grid of abstract claims ("Instant e-tickets",
   "QR code entry", "Fraud-proof") with the actual product: events
   you can buy into right now, with real prices and real remaining
   counts.

   A ticketing landing page that shows no tickets is the clearest
   possible tell that its content was written before anyone asked
   what the product does. Three interchangeable feature cards could
   sit on any SaaS site; these can't.

   Degrades honestly: if the fetch fails or nothing is live, the
   section removes itself rather than rendering an empty shelf. */
function LiveEvents({ events, loading, onOpen }) {
  if (!loading && !events.length) return null;

  return (
    <section className="tf-section" id="events">
      <div className="tf-container">
        <div className="tf-sec-head">
          <div>
            <p className="tf-eyebrow">On sale now</p>
            <h2 className="tf-h2 tf-h2-left">Happening soon</h2>
          </div>
          <button className="tf-seeall" onClick={() => onOpen("/events")}>
            All events <Icon name="arrowRight" />
          </button>
        </div>

        <div className="tf-ev-rail">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div className="tf-ev tf-ev-skel" key={i}>
                  <div className="ds-skel tf-ev-img" />
                  <div className="tf-ev-body">
                    <div className="ds-skel" style={{ height: 17, width: "82%" }} />
                    <div className="ds-skel" style={{ height: 13, width: "58%" }} />
                  </div>
                </div>
              ))
            : events.map((ev) => {
                const d = new Date(ev.date);
                /* Cheapest tier — what a guest actually decides on. */
                const from = (ev.ticketTypes || []).reduce(
                  (min, t) =>
                    typeof t.price === "number" && (min == null || t.price < min)
                      ? t.price
                      : min,
                  null,
                );
                /* Only claim scarcity when the number is real and small. */
                const low =
                  typeof ev.remaining === "number" &&
                  ev.remaining > 0 &&
                  ev.remaining <= 25;

                return (
                  <button
                    className="tf-ev"
                    key={ev._id}
                    onClick={() => onOpen(`/events/${ev.slug || ev._id}`)}
                  >
                    <div className="tf-ev-img">
                      {ev.banner ? (
                        <img src={ev.banner} alt="" loading="lazy" />
                      ) : (
                        <div className="tf-ev-noimg" aria-hidden="true" />
                      )}
                      <span className="tf-ev-date" aria-hidden="true">
                        <b>{d.getDate()}</b>
                        {d.toLocaleString("en-NG", { month: "short" })}
                      </span>
                      {low && (
                        <span className="tf-ev-low">{ev.remaining} left</span>
                      )}
                    </div>
                    <div className="tf-ev-body">
                      <h3 className="tf-ev-title">{ev.title}</h3>
                      <p className="tf-ev-meta">
                        {ev.city || ev.location || "Nigeria"}
                      </p>
                      <p className="tf-ev-price t-num">
                        {from == null
                          ? "—"
                          : from === 0
                            ? "Free"
                            : `From ₦${from.toLocaleString("en-NG")}`}
                      </p>
                    </div>
                  </button>
                );
              })}
        </div>
      </div>
    </section>
  );
}

/* ── Stacked, overlapping story cards ─────────────────────
   Three cards that stack as you scroll: each one sticks at the top
   and the next slides up to partially cover it, so the previous
   card's header stays visible as a growing "spine" down the page.

   How the overlap is achieved:
     • each card is `position: sticky` at an offset that INCREASES
       per card (top: calc(base + i * PEEK)), so card 2 parks 74px
       lower than card 1 and can never fully hide it;
     • z-index rises with index, so later cards paint on top;
     • the cards are opaque with their own border + shadow, which is
       what makes the covering read as physical layering.

   Falls back to a plain vertical list when the viewport is short or
   the user prefers reduced motion — sticky stacking on a small screen
   just traps content behind other content. */
const STORY = [
  {
    id: "how",
    eyebrow: "How it works",
    title: "Three steps from idea to sold-out",
    text: "Create your event, share one link, and let guests pay online. Tickets are issued the moment payment lands — no spreadsheets, no manual sending.",
    img: "/hero/hero3.jpg",
    bullets: [
      "Add details, banner and ticket tiers",
      "Guests pay securely online",
      "Scan at the gate with your phone",
    ],
  },
  {
    id: "guests",
    eyebrow: "For guests",
    title: "Your ticket, ready in seconds",
    text: "Pay and your QR ticket arrives immediately — in your inbox and on WhatsApp. One scan at the gate, no printing and no queues.",
    img: "/hero/hero6.jpg",
    bullets: [
      "Instant e-tickets, delivered to your inbox",
      "QR code entry — one scan, you're in",
      "Every ticket unique and single-use",
    ],
  },
  {
    id: "organizers",
    eyebrow: "For organizers",
    title: "Run the show, not the spreadsheet",
    text: "Launch in minutes, watch sales update live, and withdraw straight to your Nigerian bank account whenever you want.",
    img: "/hero/hero9.jpg",
    bullets: [
      "Launch an event in minutes",
      "Live sales and revenue analytics",
      "Fast payouts to your bank",
    ],
  },
];

function StackedCards() {
  return (
    /* No id here: all three anchors (how / guests / organizers) live on
       the cards themselves, and duplicating "how" on the wrapper made
       getElementById return the section instead of the card. */
    <section className="tf-stack-wrap">
      <div className="tf-container">
        {STORY.map((s, i) => (
          <article
            className="tf-stack-card"
            key={s.id}
            id={s.id}
            /* Both custom properties drive the sticky offset and the
               paint order — see .tf-stack-card in CSS. */
            style={{ "--i": i, zIndex: i + 1 }}
          >
            <div className="tf-stack-copy">
              <p className="tf-eyebrow">{s.eyebrow}</p>
              <h2 className="tf-stack-title">{s.title}</h2>
              <p className="tf-stack-text">{s.text}</p>
              <ul className="tf-stack-list">
                {s.bullets.map((b) => (
                  <li key={b}>
                    <Icon name="check" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="tf-stack-media">
              <img src={s.img} alt="" loading="lazy" decoding="async" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── Buy on WhatsApp ──────────────────────────────────────
   The bot is a real product surface that the landing page never
   mentioned. When VITE_WHATSAPP_BOT_NUMBER is unset the deep link
   would be dead, so the CTA is swapped for the plain explanation
   rather than hiding the feature or shipping a broken link. */
function WhatsAppSection() {
  const enabled = whatsappBuyEnabled();
  const url = enabled
    ? `https://wa.me/${botNumber()}?text=${encodeURIComponent("menu")}`
    : null;

  const lines = [
    "Browse every live event without leaving the chat",
    "Type an event name to jump straight to it",
    "Pay by card, payment link or bank transfer",
    "Your QR ticket arrives right in the conversation",
  ];

  return (
    <section className="tf-wa" id="whatsapp">
      <div className="tf-container tf-wa-inner">
        <div className="tf-wa-copy">
          <p className="tf-eyebrow">
            <Icon name="whatsapp" /> On WhatsApp
          </p>
          <h2 className="tf-h2">Buy tickets without leaving WhatsApp</h2>
          <p className="tf-wa-lead">
            No app to install and no account to create. Message the Tictify
            bot and buy in the same chat you use every day — tickets are
            issued the moment your payment lands.
          </p>

          <ul className="tf-wa-list">
            {lines.map((l) => (
              <li key={l}>
                <Icon name="check" /> {l}
              </li>
            ))}
          </ul>

          {enabled ? (
            <a
              className="tf-btn tf-btn-wa tf-btn-lg"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" /> Open the WhatsApp bot
            </a>
          ) : (
            <p className="tf-wa-soon">
              <Icon name="info" /> Coming soon to this number — every event
              page will carry a “Buy on WhatsApp” link.
            </p>
          )}
        </div>

        {/* A stylised chat rather than a screenshot: no fake brand
            chrome, and it stays legible at any width. */}
        <div className="tf-wa-phone" aria-hidden="true">
          <div className="tf-wa-screen">
            <div className="tf-wa-bubble is-in">
              🎟️ <strong>Welcome to Tictify!</strong>
              <br />
              Buy event tickets right here on WhatsApp.
            </div>
            <div className="tf-wa-bubble is-out">afrobeats night</div>
            <div className="tf-wa-bubble is-in">
              🔎 Found <strong>Afrobeats Night Lagos</strong>
              <br />
              Fri 12 Sep · Lagos · from ₦7,500
            </div>
            <div className="tf-wa-bubble is-out">1</div>
            <div className="tf-wa-bubble is-in">
              ✅ Paid — your QR ticket is below. See you there!
            </div>
          </div>
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
  const [alertState, setAlertState] = useState(null); // null | "busy" | {ok,message}

  async function enableAlerts() {
    if (alertState === "busy") return;
    setAlertState("busy");
    const { subscribeToPush } = await import("../services/pushService.js");
    const result = await subscribeToPush("events");
    setAlertState(result);
  }

  return (
    <section className="tf-section">
      <div className="tf-container">
        <div className="tf-cta">
          <h2 className="tf-h2">Start selling tickets today</h2>
          <p>Create your first event in minutes — no card required.</p>
          <div className="tf-cta-row">
            <button className="tf-btn tf-btn-gold tf-btn-lg" onClick={() => navigate("/register")}>
              Get Started Free
            </button>
            <button
              className="tf-btn tf-btn-ghost tf-btn-lg"
              onClick={enableAlerts}
              disabled={alertState === "busy"}
            >
              {alertState === "busy" ? (
                "Enabling…"
              ) : (
                <>
                  <Icon name="bell" /> Get event alerts
                </>
              )}
            </button>
          </div>
          {alertState && alertState !== "busy" && (
            <p className={`tf-cta-note ${alertState.ok ? "is-ok" : "is-err"}`}>
              {alertState.message}
            </p>
          )}
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
            <button onClick={() => navigate("/campusambassadors")}>
              Become a Campus Partner
            </button>
          </div>

          <div className="tf-footer-col">
            <h4>Guests</h4>
            <button onClick={() => navigate("/events")}>Find an event</button>
            <button onClick={() => navigate("/my-tickets")}>
              Find my tickets
            </button>
            <button onClick={() => scrollTo("guests")}>Why Tictify</button>
            <button onClick={() => navigate("/affiliate")}>
              Become an affiliate
            </button>
          </div>
        </div>

        <div className="tf-footer-legal">
          <button onClick={() => navigate("/terms")}>Terms of Service</button>
          <span aria-hidden="true">·</span>
          <button onClick={() => navigate("/privacy")}>Privacy Policy</button>
          <span aria-hidden="true">·</span>
          <button onClick={() => navigate("/refunds")}>Refunds</button>
          <span aria-hidden="true">·</span>
          <a href="/blog">Blog</a>
          <span aria-hidden="true">·</span>
          <a href="mailto:tictify@gmail.com">tictify@gmail.com</a>
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
.tf-logo { height:52px; width:auto; cursor:pointer; display:block; }
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

/* ── Live events rail ──
   A left-aligned section head with its own "All events" action, so it
   reads as a shelf of real inventory rather than another centered
   marketing block. On mobile it scrolls horizontally with snap —
   browsing events sideways is the familiar gesture; stacking six tall
   cards vertically would bury the rest of the page. */
.tf-sec-head { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:clamp(20px,3vw,30px); }
.tf-h2-left { text-align:left !important; margin:0 !important; max-width:none !important; }
.tf-sec-head .tf-eyebrow { text-align:left; margin-bottom:8px; }
.tf-seeall { flex:none; display:inline-flex; align-items:center; gap:8px; background:none; border:none; color:var(--gold); font-family:var(--font-h); font-weight:700; font-size:14px; cursor:pointer; padding:8px 2px; transition:gap .2s ease; }
.tf-seeall:hover { gap:12px; }

/* Exactly 3 across, and the 4th+ event is hidden rather than wrapping
   to a lonely second row. The rail is a teaser — "All events" is the
   complete list, so slicing here costs nothing and keeps the shelf a
   clean single row at every width. */
.tf-ev-rail { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:clamp(14px,2vw,22px); }
.tf-ev-rail > :nth-child(n+4) { display:none; }
.tf-ev { display:flex; flex-direction:column; text-align:left; padding:0; background:var(--ink-700,#12141f); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; cursor:pointer; transition:transform .25s cubic-bezier(.22,1,.36,1), border-color .25s, box-shadow .25s; }
.tf-ev:hover { transform:translateY(-4px); border-color:rgba(232,201,106,.42); box-shadow:0 16px 40px rgba(0,0,0,.5); }
.tf-ev-img { position:relative; aspect-ratio:3/2; overflow:hidden; background:var(--ink-600,#1a1d2b); }
.tf-ev-img img { width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,1,.36,1); }
.tf-ev:hover .tf-ev-img img { transform:scale(1.05); }
.tf-ev-noimg { width:100%; height:100%; background:linear-gradient(135deg,rgba(232,201,106,.14),transparent 70%); }

/* Date chip — a physical ticket-stub cue, not decoration. */
.tf-ev-date { position:absolute; top:10px; left:10px; display:grid; place-items:center; line-height:1; padding:7px 9px; border-radius:10px; background:rgba(9,11,19,.86); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid var(--border-h); font-size:9.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--text-2,#B9B5AC); }
.tf-ev-date b { font-family:var(--font-h); font-size:16px; letter-spacing:0; color:var(--text); }
.tf-ev-low { position:absolute; bottom:10px; right:10px; padding:5px 10px; border-radius:999px; background:rgba(242,104,94,.18); border:1px solid rgba(242,104,94,.5); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#F2685E; }

.tf-ev-body { padding:15px 16px 17px; display:flex; flex-direction:column; gap:5px; flex:1; }
.tf-ev-title { font-family:var(--font-h); font-size:15.5px; font-weight:700; line-height:1.3; color:var(--text); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.tf-ev-meta { font-size:12.5px; color:var(--muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tf-ev-price { margin-top:auto; padding-top:8px; font-family:var(--font-h); font-size:14px; font-weight:700; color:var(--gold); }
.tf-ev-skel { cursor:default; pointer-events:none; }
.tf-ev-skel .tf-ev-body { gap:9px; }

@media (max-width:860px) {
  /* Horizontal snap rail — bleeds to the screen edge so a partially
     visible third card signals "scroll me". */
  .tf-ev-rail { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; gap:12px; margin-inline:calc(clamp(16px,5vw,28px) * -1); padding-inline:clamp(16px,5vw,28px); padding-bottom:6px; scrollbar-width:none; }
  .tf-ev-rail::-webkit-scrollbar { display:none; }
  /* All fetched events are reachable here — a horizontal rail has room
     the 3-across desktop grid doesn't. */
  .tf-ev-rail > :nth-child(n+4) { display:flex; }
  .tf-ev { flex:0 0 74%; max-width:280px; scroll-snap-align:start; }
  .tf-sec-head { align-items:center; }
}
/* ── Stacked story cards ── */
/* --peek (74px) is how much of each previous card's header stays
   visible once the next one parks on top of it. The sticky offset is
   base + i*peek, so card 2 can never fully cover card 1. Cards are
   OPAQUE (not var(--card), which is translucent) — layering only reads
   as physical if you can't see through the card on top. */
.tf-stack-wrap { --peek:74px; --stack-top:96px; padding:clamp(64px,9vw,112px) 0 clamp(24px,4vw,40px); }
.tf-stack-wrap .tf-container { display:flex; flex-direction:column; gap:clamp(20px,3vw,32px); }
.tf-stack-card { position:sticky; top:calc(var(--stack-top) + var(--i) * var(--peek)); scroll-margin-top:var(--stack-top); display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(28px,4vw,52px); align-items:center; background:#0F111A; border:1px solid var(--border); border-radius:calc(var(--r) + 6px); padding:clamp(28px,4vw,52px); box-shadow:0 -8px 34px rgba(0,0,0,.42); }
.tf-stack-copy .tf-eyebrow { text-align:left; }
.tf-stack-title { font-family:var(--font-h); font-weight:700; font-size:clamp(23px,3.4vw,36px); line-height:1.14; letter-spacing:-.01em; text-wrap:balance; margin-bottom:14px; }
.tf-stack-text { color:var(--muted); font-size:clamp(14.5px,1.7vw,16.5px); line-height:1.7; margin-bottom:24px; }
.tf-stack-list { list-style:none; display:grid; gap:11px; }
.tf-stack-list li { display:flex; align-items:flex-start; gap:11px; font-size:14.5px; color:var(--text); }
.tf-stack-list li svg { flex:none; width:17px; height:17px; margin-top:2px; color:var(--live); }
.tf-stack-media { border-radius:var(--r); overflow:hidden; aspect-ratio:4/3; border:1px solid var(--border); }
.tf-stack-media img { width:100%; height:100%; object-fit:cover; object-position:50% 22%; display:block; }

@media (max-width:860px) {
  .tf-stack-card { grid-template-columns:1fr; }
  .tf-stack-media { order:-1; aspect-ratio:16/10; }
}
/* Sticky stacking needs vertical room to breathe: on a short viewport
   the cards would park on top of each other and trap their own content.
   Same for reduced motion — the effect IS the scroll. Fall back to a
   plain vertical list, exactly as the component contract promises. */
@media (max-height:700px), (prefers-reduced-motion: reduce) {
  .tf-stack-card { position:static; box-shadow:none; }
}

/* ── Buy on WhatsApp ── */
/* The chat mockup uses WhatsApp's real dark palette (screen #0E1621,
   incoming #202C33, outgoing #005C4B) so it reads instantly as a chat —
   no fake brand chrome, and it stays legible at any width. */
.tf-wa { padding:clamp(64px,9vw,112px) 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); background:radial-gradient(1100px 480px at 82% -10%, rgba(37,211,102,.10), transparent 62%); }
.tf-wa-inner { display:grid; grid-template-columns:1.05fr .95fr; gap:clamp(32px,5vw,64px); align-items:center; }
.tf-wa-copy { text-align:center; }
.tf-wa-copy .tf-eyebrow { display:inline-flex; align-items:center; gap:8px; }
.tf-wa-copy .tf-eyebrow svg { width:15px; height:15px; color:#25D366; }
.tf-wa-copy .tf-h2 { margin-bottom:18px; }
.tf-wa-lead { color:var(--muted); font-size:clamp(15px,1.8vw,17px); line-height:1.7; max-width:520px; margin:0 auto clamp(24px,3vw,32px); }
.tf-wa-list { list-style:none; display:grid; gap:12px; max-width:520px; margin:0 auto clamp(30px,3.8vw,42px); text-align:left; }
.tf-wa-list li { display:flex; align-items:flex-start; gap:12px; color:var(--text); font-size:15px; }
.tf-wa-list li svg { flex:none; width:18px; height:18px; margin-top:2px; color:var(--live); }
.tf-wa-list li:first-child { font-weight:600; }
.tf-btn-wa { display:inline-flex; align-items:center; gap:10px; background:#25D366; color:#06210F; font-family:var(--font-b); font-weight:700; font-size:16px; padding:16px 32px; border-radius:999px; border:none; text-decoration:none; transition:transform .25s, box-shadow .25s, filter .25s; }
.tf-btn-wa:hover { transform:translateY(-2px); box-shadow:0 14px 38px rgba(37,211,102,.28); filter:brightness(1.05); }
.tf-btn-wa svg { width:20px; height:20px; }
.tf-wa-soon { display:inline-flex; align-items:flex-start; gap:10px; max-width:440px; text-align:left; color:var(--muted); font-size:14px; line-height:1.6; }
.tf-wa-soon svg { flex:none; width:17px; height:17px; margin-top:2px; color:var(--gold); }
.tf-wa-phone { width:min(340px,100%); margin:0 auto; border-radius:34px; padding:12px; background:linear-gradient(160deg,#1a1d29,#0d0f16); border:1px solid var(--border-h); box-shadow:0 30px 80px rgba(0,0,0,.5); }
.tf-wa-screen { border-radius:24px; background:#0E1621; padding:clamp(14px,2.4vw,20px); display:flex; flex-direction:column; gap:10px; min-height:340px; }
.tf-wa-bubble { max-width:82%; padding:9px 13px; border-radius:14px; font-size:13px; line-height:1.55; }
.tf-wa-bubble.is-in { align-self:flex-start; background:#202C33; color:#E9EDEF; border-bottom-left-radius:4px; }
.tf-wa-bubble.is-out { align-self:flex-end; background:#005C4B; color:#E9EDEF; border-bottom-right-radius:4px; }
.tf-wa-bubble strong { font-weight:700; }
@media (max-width:920px) {
  .tf-wa-inner { grid-template-columns:1fr; }
  .tf-wa-phone { margin-top:clamp(28px,4vw,40px); }
}

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
.tf-cta-row { display:flex; justify-content:center; gap:14px; flex-wrap:wrap; }
.tf-cta-note { margin-top:18px !important; font-size:14px; }
.tf-cta-note.is-ok { color:var(--live) !important; }
.tf-cta-note.is-err { color:var(--muted) !important; }

/* ── Footer ── */
.tf-footer { border-top:1px solid var(--border); background:var(--surface); padding:clamp(44px,6vw,64px) 0 0; }
.tf-footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:clamp(24px,4vw,48px); padding-bottom:clamp(32px,5vw,48px); }
.tf-footer-brand p { color:var(--muted); font-size:14px; line-height:1.7; margin-top:16px; max-width:280px; }
.tf-footer-col { display:flex; flex-direction:column; gap:12px; }
.tf-footer-col h4 { font-family:var(--font-h); font-size:13px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--text); margin-bottom:4px; }
.tf-footer-col button { background:none; border:none; color:var(--muted); font-size:14px; text-align:left; padding:2px 0; transition:color .25s; }
.tf-footer-col button:hover { color:var(--gold); }
.tf-footer-legal { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:16px 0 0; }
.tf-footer-legal button, .tf-footer-legal a { background:none; border:none; color:var(--muted); font-size:13px; cursor:pointer; text-decoration:none; padding:0; font-family:var(--font-b); }
.tf-footer-legal button:hover, .tf-footer-legal a:hover { color: var(--gold); }
.tf-footer-legal span { color: var(--border); }
.tf-footer-bottom { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; border-top:1px solid var(--border); padding:20px 0 26px; }
.tf-footer-bottom p { color:var(--muted); font-size:13px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 920px) {
  .tf-links { display:none; }
  .tf-burger { display:flex; }
  /* NOTE: the header's backdrop-filter makes it the containing block for
     position:fixed children — "fixed inset:70px 0 0 0" collapses to the
     70px header box (zero-height background, links bleeding over the
     hero). Anchor below the header with absolute + explicit height and a
     fully OPAQUE background instead. */
  .tf-drawer { display:flex; flex-direction:column; gap:4px; position:absolute; top:100%; left:0; right:0; height:calc(100vh - 70px); height:calc(100dvh - 70px); overflow-y:auto; background:#080910; padding:22px clamp(18px,5vw,32px); z-index:999; transform:translateY(-8px); opacity:0; pointer-events:none; transition:opacity .3s, transform .3s; }
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
  .tf-footer-legal { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:16px 0 0; }
.tf-footer-legal button, .tf-footer-legal a { background:none; border:none; color:var(--muted); font-size:13px; cursor:pointer; text-decoration:none; padding:0; font-family:var(--font-b); }
.tf-footer-legal button:hover, .tf-footer-legal a:hover { color: var(--gold); }
.tf-footer-legal span { color: var(--border); }
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
