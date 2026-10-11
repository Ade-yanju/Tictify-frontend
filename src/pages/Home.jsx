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
        <Hero events={events} />
        <Marquee />
        <TrustBar />
        <LiveEvents
          events={events}
          loading={evLoading}
          onOpen={(to) => navigate(to)}
        />
        <StackedCards />
        <WhatsAppSection events={events} />
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

/* ── Hero — event discovery first ───────────────────────── */
function Hero({ events = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("any");
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselCount = Math.min(events.length, 3);
  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(events.length - 1, 0)));
  }, [events.length]);
  useEffect(() => {
    if (carouselCount < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselCount);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [carouselCount]);
  const featured = events[activeIndex] || events[0] || {};
  const featureImage = featured.banner || "/hero/hero3.jpg";
  const secondaryImageA = carouselCount > 1 ? events[(activeIndex + 1) % carouselCount]?.banner || featureImage : featureImage;
  const secondaryImageB = carouselCount > 2 ? events[(activeIndex + 2) % carouselCount]?.banner || featureImage : featureImage;
  const featureBannerFit = featured.bannerFit === "contain" ? " is-contain" : "";
  const featureTitle = featured.title || "Live event";
  const featureLocation = featured.location && featured.city ? featured.location + ", " + featured.city : featured.city || featured.location || "Location to be announced";
  const featureDate = featured.date && !Number.isNaN(new Date(featured.date).getTime())
    ? new Date(featured.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
    : "Date TBD";
  const featurePrice = (featured.ticketTypes || []).reduce((min, ticket) => {
    if (typeof ticket.price !== "number") return min;
    return min == null || ticket.price < min ? ticket.price : min;
  }, null);
  const featureRemaining = Number.isFinite(Number(featured.remaining)) ? Number(featured.remaining) : null;
  const featureTag = !featured._id ? "Explore events" : featured.installmentsEnabled ? "Installments available" : featureRemaining != null && featureRemaining < 20 ? String(featureRemaining) + " left" : "On sale now";

  function searchEvents(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (dateFilter !== "any") params.set("date", dateFilter);
    const suffix = params.toString();
    navigate(suffix ? `/events?${suffix}` : "/events");
  }

  return (
    <section className="tf-hero">
      <div className="tf-hero-backdrop" aria-hidden="true">
        <img src={featureImage} alt="" width="1600" height="1000" loading="eager" />
        <span className="tf-hero-backdrop-wash" />
        <span className="tf-hero-backdrop-vignette" />
      </div>
      <div className="tf-hero-noise" aria-hidden="true" />

      <div className="tf-container tf-hero-main">
        <div className="tf-hero-copy">
          <div className="tf-hero-overline tf-rise" style={{ animationDelay: "0ms" }}>
            <span className="tf-live-dot" />
            <span>Discover what&apos;s live</span>
            <i />
            <span>Book in a few taps</span>
          </div>

          <h1 className="tf-h1 tf-rise" style={{ animationDelay: "100ms" }}>
            Never miss
            <br />
            what&apos;s <em>next.</em>
          </h1>

          <p className="tf-sub tf-rise" style={{ animationDelay: "190ms" }}>
            Find concerts, festivals and nights worth showing up for — then get your ticket before the room fills up.
          </p>

          <div className="tf-hero-cta tf-rise" style={{ animationDelay: "280ms" }}>
            <button className="tf-btn tf-btn-gold tf-btn-lg" onClick={() => navigate("/events")}>
              Browse Events <Icon name="arrowRight" />
            </button>
            <button className="tf-btn tf-btn-ghost tf-btn-lg" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
              How it works
            </button>
          </div>

          <div className="tf-hero-trust tf-rise" style={{ animationDelay: "370ms" }}>
            <span><strong>Live</strong> event discovery</span>
            <span><strong>QR</strong> instant entry</span>
            <span><strong>Secure</strong> checkout</span>
          </div>
        </div>

        <div className="tf-hero-art tf-rise" style={{ animationDelay: "160ms" }} aria-label="Featured Tictify event">
          <div className="tf-hero-art-ring tf-hero-art-ring-one" aria-hidden="true" />
          <div className="tf-hero-art-ring tf-hero-art-ring-two" aria-hidden="true" />
          <div className="tf-art-label tf-art-label-top"><span>01</span><i /> Live event guide</div>
          <div className="tf-art-label tf-art-label-bottom"><Icon name="shield" /><span>Secure entry<br /><b>One scan. You&apos;re in.</b></span></div>

          <div className="tf-event-collage">
            <div className="tf-event-collage-back tf-event-collage-back-a"><img src={secondaryImageA} alt="" /></div>
            <div className="tf-event-collage-back tf-event-collage-back-b"><img src={secondaryImageB} alt="" /></div>
            <article className="tf-event-feature">
              <div className={"tf-event-feature-media" + featureBannerFit}>
                <img src={featureImage} alt={featureTitle} width="840" height="560" />
                <div className="tf-event-feature-shade" />
                <span className="tf-event-feature-date"><b>{featureDate.split(" ")[0]}</b><small>{featureDate.split(" ")[1] || "SOON"}</small></span>
                <span className="tf-event-feature-tag"><span /> {featureTag}</span>
              </div>
              <div className="tf-event-feature-body">
                <span className="tf-event-feature-kicker">{featured.category || "Featured on Tictify"}</span>
                <h2>{featureTitle}</h2>
                <p><Icon name="pin" /> {featureLocation}</p>
                <div className="tf-event-feature-bottom">
                  <span><small>Tickets from</small><strong>{featurePrice == null ? "Explore events" : featurePrice === 0 ? "Free" : `₦${featurePrice.toLocaleString("en-NG")}`}</strong></span>
                  <button aria-label={`View ${featureTitle}`} onClick={() => navigate(featured._id ? `/events/${featured.slug || featured._id}` : "/events")}><Icon name="arrowRight" /></button>
                </div>
              </div>
            </article>
            {carouselCount > 1 && (
              <div className="tf-hero-carousel-controls" aria-label="Featured events">
                <button type="button" className="tf-hero-carousel-arrow" onClick={() => setActiveIndex((current) => (current - 1 + carouselCount) % carouselCount)} aria-label="Previous featured event"><Icon name="arrowLeft" /></button>
                <div className="tf-hero-carousel-dots">
                  {events.slice(0, carouselCount).map((event, index) => (
                    <button type="button" key={event._id || index} className={index === activeIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={"Show " + (event.title || "featured event")} aria-pressed={index === activeIndex}><span /></button>
                  ))}
                </div>
                <button type="button" className="tf-hero-carousel-arrow" onClick={() => setActiveIndex((current) => (current + 1) % carouselCount)} aria-label="Next featured event"><Icon name="arrowRight" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="tf-container tf-search-wrap tf-rise" style={{ animationDelay: "420ms" }}>
        <form className="tf-search-card" onSubmit={searchEvents}>
          <div className="tf-search-intro">
            <span className="tf-search-mark"><Icon name="ticket" /></span>
            <span><small>Start with an event</small><strong>Where are you going?</strong></span>
          </div>
          <label className="tf-search-field">
            <Icon name="search" />
            <span><small>Event or location</small><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Afrobeats, Lagos…" aria-label="Search events or locations" /></span>
          </label>
          <label className="tf-search-field tf-search-date">
            <Icon name="calendar" />
            <span><small>When</small><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Choose when to attend"><option value="any">Any date</option><option value="weekend">This weekend</option><option value="7days">Next 7 days</option></select></span>
          </label>
          <button className="tf-search-submit" type="submit">Search <Icon name="arrowRight" /></button>
        </form>
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
        <p className="tf-trust-lead">
          Trusted by campus promoters, communities and event organizers
          across Nigeria
        </p>
        <div className="tf-trust-grid">
          <span><Icon name="shield" /> Secure payments</span>
          <span><Icon name="ticket" /> Instant QR tickets</span>
          <span><Icon name="check" /> Simple event entry</span>
        </div>
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
function WhatsAppSection({ events = [] }) {
  const previewEvent = events[0] || {};
  const previewTitle = previewEvent.title || "your next event";
  const previewLocation = previewEvent.location && previewEvent.city ? previewEvent.location + ", " + previewEvent.city : previewEvent.city || previewEvent.location || "your city";
  const previewDate = previewEvent.date && !Number.isNaN(new Date(previewEvent.date).getTime()) ? new Date(previewEvent.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" }) : "your event date";
  const previewPrice = (previewEvent.ticketTypes || []).reduce((min, ticket) => typeof ticket.price === "number" && (min == null || ticket.price < min) ? ticket.price : min, null);
  const previewPriceLabel = previewPrice == null ? "View prices" : previewPrice === 0 ? "Free" : "from ₦" + previewPrice.toLocaleString("en-NG");
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
            <div className="tf-wa-bubble is-out">{previewTitle}</div>
            <div className="tf-wa-bubble is-in">
              🔎 Found <strong>{previewTitle}</strong>
              <br />
              {previewDate} · {previewLocation} · {previewPriceLabel}
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
              ₦50 + 2%<span>/paid order</span>
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
          <p>© {new Date().getFullYear()} Tictify. All rights reserved. · Tictify Nigeria Limited (Company Registration No. 9279658)</p>
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

/* ── Hero — ticketing product moment ── */
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
:root { --bg:#080910; --surface:#0d0f16; --card:rgba(255,255,255,0.04); --border:rgba(255,255,255,0.1); --border-h:rgba(255,255,255,0.22); --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12); --gold-glo:rgba(232,201,106,0.22); --text:#F0EDE8; --muted:#9A94A0; --live:#6BF0A0; --font-h:"Syne",sans-serif; --font-b:"DM Sans",sans-serif; --r:20px; --r-sm:12px; }
html { scroll-behavior:smooth; }
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
button, input, select { font-family:var(--font-b); }
section { scroll-margin-top:88px; }
.tf-page { min-height:100svh; background:var(--bg); }
.tf-container { width:100%; max-width:1160px; margin:0 auto; padding:0 clamp(18px,4.5vw,32px); }
.tf-w100 { width:100%; }
@keyframes tfRise { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
.tf-rise { animation:tfRise .8s cubic-bezier(.2,.6,.2,1) both; }
.tf-hero { position:relative; overflow:hidden; padding:clamp(58px,8vw,96px) 0 clamp(34px,5vw,58px); }
.tf-hero::before { content:""; position:absolute; top:-180px; right:-120px; width:620px; height:620px; border-radius:50%; background:radial-gradient(circle, rgba(116,24,237,.2), transparent 68%); pointer-events:none; }
.tf-hero-layout { position:relative; display:grid; grid-template-columns:minmax(0,1fr) minmax(390px,.86fr); align-items:center; gap:clamp(38px,7vw,100px); }
.tf-hero-glow { position:absolute; top:-160px; left:-120px; width:560px; height:460px; background:radial-gradient(ellipse at center, rgba(232,201,106,.13), transparent 68%); pointer-events:none; animation:tfGlow 7s ease-in-out infinite; }
@keyframes tfGlow { 0%,100%{opacity:.55} 50%{opacity:1} }
.tf-hero-copy { position:relative; z-index:2; max-width:620px; }
.tf-hero-kicker { margin:26px 0 0; color:var(--gold); font-size:12px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
.tf-badge { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); border:1px solid rgba(232,201,106,.25); padding:8px 13px; border-radius:999px; }
.tf-badge-dot { width:7px; height:7px; border-radius:50%; background:var(--live); animation:tfPulse 2s ease-in-out infinite; }
@keyframes tfPulse { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:.5; transform:scale(.8)} }
.tf-h1 { max-width:640px; margin:13px 0 0; font-family:var(--font-h); font-weight:800; font-size:clamp(42px,6.4vw,78px); line-height:1.02; letter-spacing:-.055em; text-wrap:balance; }
.tf-h1 em { font-style:normal; color:var(--gold); }
.tf-sub { max-width:540px; margin:22px 0 0; color:var(--muted); font-size:clamp(15px,1.5vw,18px); line-height:1.7; }
.tf-hero-cta { display:flex; justify-content:flex-start; gap:12px; flex-wrap:wrap; margin-top:30px; }
.tf-hero-cta .tf-btn { display:inline-flex; align-items:center; justify-content:center; gap:9px; }
.tf-hero-proof { display:flex; align-items:center; gap:18px; flex-wrap:wrap; margin-top:25px; color:var(--muted); font-size:11.5px; }
.tf-hero-proof span { display:inline-flex; align-items:center; gap:6px; }
.tf-hero-proof svg { width:15px; height:15px; color:var(--live); }

.tf-hero-visual { position:relative; min-height:530px; display:grid; place-items:center; isolation:isolate; }
.tf-hero-visual::before { content:""; position:absolute; inset:12% 5% 8%; z-index:-2; border-radius:50%; background:radial-gradient(ellipse, rgba(116,24,237,.2), transparent 66%); filter:blur(8px); }
.tf-hero-orbit { position:absolute; border:1px solid rgba(184,145,229,.22); border-radius:50%; transform:rotate(-22deg); pointer-events:none; }
.tf-hero-orbit-one { width:92%; height:62%; }
.tf-hero-orbit-two { width:72%; height:88%; transform:rotate(34deg); border-color:rgba(232,201,106,.16); }
.tf-ticket-stage { position:relative; width:min(100%,390px); transform:rotate(3deg); }
.tf-ticket-shadow { position:absolute; inset:18px 0 -10px; border:1px solid rgba(255,255,255,.1); border-radius:22px; background:#1a1427; }
.tf-ticket-shadow-one { transform:rotate(-7deg) translate(-22px,18px); opacity:.72; }
.tf-ticket-shadow-two { transform:rotate(-3deg) translate(-10px,9px); opacity:.9; background:#241638; }
.tf-ticket-card { position:relative; overflow:hidden; border:1px solid rgba(255,255,255,.28); border-radius:22px; background:#fff; color:#2b203a; box-shadow:0 32px 70px rgba(0,0,0,.46), 0 0 0 8px rgba(255,255,255,.035); }
.tf-ticket-image { position:relative; height:226px; overflow:hidden; background:#2a183f; }
.tf-ticket-image img { width:100%; height:100%; display:block; object-fit:cover; object-position:50% 28%; }
.tf-ticket-image-shade { position:absolute; inset:0; background:linear-gradient(180deg,rgba(11,8,18,.08),rgba(11,8,18,.68)); }
.tf-ticket-date { position:absolute; top:16px; left:16px; display:grid; place-items:center; min-width:49px; padding:8px 7px; border-radius:10px; background:#fff; color:#7418ed; font-size:9px; font-weight:900; letter-spacing:.1em; line-height:1.05; text-align:center; }
.tf-ticket-date b { display:block; font:800 21px/1 var(--font-h); letter-spacing:-.04em; }
.tf-ticket-live { position:absolute; right:16px; bottom:16px; display:inline-flex; align-items:center; gap:6px; padding:7px 10px; border:1px solid rgba(255,255,255,.28); border-radius:999px; background:rgba(12,8,20,.62); color:#fff; font-size:9px; font-weight:900; letter-spacing:.1em; }
.tf-ticket-live span { width:6px; height:6px; border-radius:50%; background:#6bf0a0; box-shadow:0 0 0 4px rgba(107,240,160,.15); }
.tf-ticket-content { padding:21px 22px 19px; }
.tf-ticket-eyebrow { color:#8a7b98; font-size:9px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; }
.tf-ticket-content h2 { margin-top:7px; color:#2b203a; font:800 clamp(24px,3vw,31px)/1 var(--font-h); letter-spacing:-.05em; }
.tf-ticket-location { display:flex; align-items:center; gap:6px; margin-top:9px; color:#81718e; font-size:12px; }
.tf-ticket-location svg { width:14px; height:14px; color:#7418ed; }
.tf-ticket-perforation { display:flex; align-items:center; gap:8px; margin:19px -22px 15px; }
.tf-ticket-perforation::before { flex:1; height:1px; background:#e9e1ef; content:""; }
.tf-ticket-perforation::after { flex:1; height:1px; background:#e9e1ef; content:""; }
.tf-ticket-perforation span { width:9px; height:18px; border:1px solid #e9e1ef; border-radius:50%; background:#fff; }
.tf-ticket-perforation i { width:5px; height:5px; border-radius:50%; background:#d9c8e9; }
.tf-ticket-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.tf-ticket-footer small { display:block; color:#94859f; font-size:10px; }
.tf-ticket-footer strong { display:block; margin-top:3px; color:#7418ed; font:800 20px/1 var(--font-h); letter-spacing:-.03em; }
.tf-ticket-qr { display:grid; width:42px; height:42px; place-items:center; border-radius:10px; background:#f1e8fc; color:#7418ed; }
.tf-ticket-qr svg { width:26px; height:26px; }
.tf-hero-float { position:absolute; z-index:4; display:flex; align-items:center; gap:9px; min-width:148px; padding:10px 12px; border:1px solid rgba(255,255,255,.16); border-radius:12px; background:rgba(24,16,34,.84); box-shadow:0 18px 38px rgba(0,0,0,.26); backdrop-filter:blur(14px); }
.tf-hero-float strong, .tf-hero-float small { display:block; }
.tf-hero-float strong { color:#fff; font-size:11px; }
.tf-hero-float small { margin-top:3px; color:#a99cb2; font-size:9px; }
.tf-hero-float-icon { display:grid; width:29px; height:29px; flex:0 0 29px; place-items:center; border-radius:9px; }
.tf-hero-float-icon svg { width:16px; height:16px; }
.tf-hero-float-icon.is-live { background:rgba(107,240,160,.13); color:#6bf0a0; }
.tf-hero-float-icon.is-purple { background:rgba(170,113,242,.16); color:#c59aff; }
.tf-hero-float-top { top:9%; right:0; transform:rotate(4deg); }
.tf-hero-float-bottom { bottom:8%; left:0; transform:rotate(-4deg); }
.tf-hero-float-bottom > svg { width:14px; height:14px; margin-left:auto; color:#6bf0a0; }

.tf-stats { display:flex; justify-content:center; align-items:center; gap:clamp(18px,4vw,44px); margin-top:clamp(34px,5vw,58px); flex-wrap:wrap; }
.tf-hero-stats { position:relative; z-index:2; justify-content:flex-start; max-width:1160px; padding-top:25px; border-top:1px solid var(--border); }
.tf-stat { display:flex; flex-direction:column; align-items:flex-start; gap:4px; min-width:110px; }
.tf-stat-num { font-family:var(--font-h); font-weight:700; font-size:clamp(24px,3.4vw,34px); color:var(--gold); font-variant-numeric:tabular-nums; }
.tf-stat-label { font-size:12px; color:var(--muted); }
@media (max-width:940px) {
  .tf-hero-layout { grid-template-columns:1fr; gap:42px; }
  .tf-hero-copy { max-width:720px; margin:0 auto; text-align:center; }
  .tf-hero-kicker { margin-top:22px; }
  .tf-h1 { margin-inline:auto; }
  .tf-sub { margin-inline:auto; }
  .tf-hero-cta { justify-content:center; }
  .tf-hero-proof { justify-content:center; }
  .tf-hero-visual { width:min(100%,560px); min-height:510px; margin:0 auto; }
}
@media (max-width:560px) {
  .tf-hero { padding-top:42px; }
  .tf-hero-layout { gap:30px; }
  .tf-hero-kicker { font-size:10px; letter-spacing:.13em; }
  .tf-h1 { font-size:clamp(38px,12vw,56px); }
  .tf-sub { font-size:15px; }
  .tf-hero-proof { gap:10px 14px; font-size:10.5px; }
  .tf-hero-visual { min-height:430px; }
  .tf-ticket-stage { width:calc(100% - 26px); }
  .tf-ticket-image { height:185px; }
  .tf-ticket-content { padding:18px 18px 16px; }
  .tf-ticket-perforation { margin-inline:-18px; }
  .tf-ticket-content h2 { font-size:25px; }
  .tf-hero-float { min-width:132px; padding:8px 9px; }
  .tf-hero-float-top { top:2%; right:-2px; }
  .tf-hero-float-bottom { bottom:2%; left:-2px; }
  .tf-hero-stats { justify-content:space-between; gap:10px; }
  .tf-stat { min-width:0; }
  .tf-stat-num { font-size:22px; }
  .tf-stat-label { font-size:10px; }
}

/* ── Motion helpers ── */
.tf-stat-sep { width:1px; height:38px; background:var(--border); }
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
