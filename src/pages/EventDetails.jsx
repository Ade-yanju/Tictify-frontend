/* ═══════════════════════════════════════════════════════════
   EventDetails.jsx — Tictify 2026 Event Page
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ShareSheet from "../components/ShareSheet";
import Icon from "../components/Icon";
import { buyOnWhatsAppUrl } from "../utils/whatsapp";

const logo = "/logo.png";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Slim public header ──────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  return (
    <header className="ed-header">
      <div className="ed-container ed-nav">
        <img
          src={logo}
          alt="Tictify"
          className="ed-logo"
          onClick={() => navigate("/")}
        />
        <nav className="ed-nav-links" aria-label="Primary">
          <button className="ed-link ed-hide-sm" onClick={() => navigate("/events")}>
            Events
          </button>
          <button className="ed-link ed-hide-sm" onClick={() => navigate("/my-tickets")}>
            Find my tickets
          </button>
          <button className="ed-btn ed-btn-ghost" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="ed-btn ed-btn-gold" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ── Slim footer ─────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="ed-footer">
      <div className="ed-container">
        <p>© {new Date().getFullYear()} Tictify. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ── Early-bird helpers: earlyBirdUntil in future + earlyBirdPrice set ── */
function isEarlyBird(t) {
  return !!(
    t &&
    t.earlyBirdPrice != null &&
    t.earlyBirdUntil &&
    new Date(t.earlyBirdUntil) > new Date()
  );
}
function effectivePrice(t) {
  return isEarlyBird(t) ? Number(t.earlyBirdPrice) : t?.price;
}

/* ── Availability wording ────────────────────────────────
   `avail` comes straight from the server's availability.tiers, which
   mirrors the checkout guards — so what we print here is exactly what
   the payment endpoint will honour. Missing tier → render nothing
   rather than guess. */
const LOW_STOCK_AT = 10;

function TicketStock({ avail }) {
  if (!avail) return null;
  if (avail.soldOut) {
    return (
      <span className="ed-stock is-out" role="status">
        Sold out
      </span>
    );
  }
  if (avail.remaining <= LOW_STOCK_AT) {
    return (
      <span className="ed-stock is-low" role="status">
        Only {avail.remaining} left
      </span>
    );
  }
  return <span className="ed-stock">{avail.remaining} left</span>;
}

/* ── Ticket-type option card ─────────────────────────────── */
function TicketOption({ ticket, selected, onSelect, avail }) {
  const eb = isEarlyBird(ticket) && ticket.price > 0;
  const soldOut = Boolean(avail?.soldOut);
  return (
    <label
      onClick={() => !soldOut && onSelect(ticket)}
      aria-disabled={soldOut || undefined}
      className={`ed-ticket ${selected ? "is-selected" : ""} ${soldOut ? "is-soldout" : ""}`}
    >
      <div className="ed-ticket-main">
        <span className="ed-radio">
          {selected && <span className="ed-radio-dot" />}
        </span>
        <span className="ed-ticket-info">
          <span className="ed-ticket-name">{ticket.name}</span>
          <TicketStock avail={avail} />
          {(ticket.groupSize || 1) > 1 && (
            <span className="ed-ticket-desc">
              <Icon name="ticket" /> One QR code admits {ticket.groupSize} guests
            </span>
          )}
          {ticket.description && (
            <span className="ed-ticket-desc">{ticket.description}</span>
          )}
          {eb && (
            <span className="ed-eb-caption">
              EARLY BIRD until{" "}
              {new Date(ticket.earlyBirdUntil).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </span>
      </div>
      <span className="ed-ticket-pricing">
        {eb && (
          <s className="ed-eb-strike">₦{ticket.price.toLocaleString()}</s>
        )}
        <span className="ed-ticket-price">
          {ticket.price > 0
            ? `₦${Number(effectivePrice(ticket)).toLocaleString()}`
            : "Free"}
        </span>
      </span>
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function EventDetails() {
  injectStyles("tictify-event-details-css", CSS);
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  /* ── Promoter ref capture (?ref=CODE → sessionStorage) ── */
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[A-Za-z0-9_-]{2,30}$/.test(ref)) {
      sessionStorage.setItem("tictify_ref", ref.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Invalid event link.");
      setLoading(false);
      return;
    }
    let active = true;

    async function load(initial) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${id}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setEvent(data);
      } catch {
        // don't wipe the page a buyer is reading on a failed refresh
        if (active && initial) setError("Unable to load this event.");
      } finally {
        if (active && initial) setLoading(false);
      }
    }

    load(true);

    /* Keep tickets-left live while the buyer decides — refresh every 25s,
       paused when the tab is hidden. */
    const POLL_MS = 25000;
    let timer = null;
    const start = () => {
      if (!timer) timer = setInterval(() => load(false), POLL_MS);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisible = () => {
      if (document.hidden) stop();
      else {
        load(false);
        start();
      }
    };
    start();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      stop();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [id]);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  /* Server-computed availability, indexed BY TIER NAME (the same key the
     checkout guard matches on). A tier absent from the payload simply
     yields undefined and renders no stock line. */
  const stockByTier = useMemo(() => {
    const map = new Map();
    for (const t of event?.availability?.tiers || []) {
      if (t?.name) map.set(t.name, t);
    }
    return map;
  }, [event]);

  /* A tier can sell out between page load and a refetch — never leave a
     sold-out tier selected, or the CTA would walk into a refusal. */
  useEffect(() => {
    if (selectedTicket && stockByTier.get(selectedTicket.name)?.soldOut) {
      setSelectedTicket(null);
    }
  }, [selectedTicket, stockByTier]);
  /* Server refuses sales past salesEndAt — never offer a buy button
     that's guaranteed to bounce */
  const salesClosed = Boolean(event?.salesClosed);
  const canProceed = emailValid && selectedTicket && !salesClosed;

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="ed-page">
        <Header />
        <div className="ed-center">
          <div className="ed-spinner" />
          <p className="ed-center-sub">Loading event…</p>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div className="ed-page">
        <Header />
        <div className="ed-center">
          <span className="ed-center-ic"><Icon name="alertTriangle" /></span>
          <p className="ed-center-title">{error}</p>
          <button className="ed-btn ed-btn-ghost ed-back-lg" onClick={() => navigate(-1)}>
            <Icon name="arrowLeft" /> Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  /* Share the pretty slug when the server sent one; `id` (whatever
     the visitor arrived with) is the fallback for pre-slug events. */
  const eventKey = event.slug || event._id || id;
  const shareUrl = `${window.location.origin}/events/${eventKey}`;

  /* Buy-on-WhatsApp deep link. Carries the promoter code captured
     above so a guest who switches to chat still credits the affiliate
     who sent them. Null when no bot number is configured — every
     consumer below hides the option rather than linking to a dead
     chat. Read from sessionStorage (not state) because the ref may
     have been captured on an earlier page in this same visit. */
  const waBuyUrl = buyOnWhatsAppUrl(
    { slug: event.slug, _id: event._id },
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("tictify_ref")
      : null,
  );
  /* The arrow rides only on the branch that actually advances — the
     three blocked states are statements, not invitations. */
  const ctaLabel = salesClosed
    ? "Ticket sales have closed"
    : !selectedTicket
      ? "Select a ticket type"
      : !emailValid
        ? "Enter your email"
        : (
          <>
            Proceed to Payment <Icon name="arrowRight" />
          </>
        );
  const goToCheckout = () =>
    navigate(`/checkout/${eventKey}`, {
      state: { ticket: selectedTicket, email },
    });

  return (
    <div className="ed-page">
      <Header />

      <main className="ed-main">
        <div className="ed-container">
          {/* ── Back ── */}
          <button className="ed-back" onClick={() => navigate(-1)}>
            <span className="ed-back-ic"><Icon name="chevronLeft" /></span> Back to Events
          </button>

          {/* ── Content grid ──
              The hero lives INSIDE the grid so it can share the top row
              with the purchase panel. Previously it was a full-bleed
              21:9 band above the grid, which pushed the panel — the
              thing the page exists to do — below the fold on every
              viewport, and left the left column empty beside it. */}
          <div className="ed-layout">
            {/* LEAD — image + identity */}
            <section className="ed-lead">
              <div className="ed-hero">
                {event.bannerFit === "contain" ? (
                  <>
                    <img
                      src={event.banner}
                      alt=""
                      aria-hidden="true"
                      className="ed-bimg-back"
                    />
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="ed-bimg-front"
                    />
                  </>
                ) : (
                  <img src={event.banner} alt={event.title} />
                )}
                <div className="ed-hero-shade" aria-hidden="true" />
              </div>

              <h1 className="ed-title">{event.title}</h1>

              <div className="ed-meta">
                {[
                  { icon: <Icon name="pin" />, text: event.location },
                  { icon: <Icon name="calendar" />, text: eventDate.toDateString() },
                  ...(event.time ? [{ icon: <Icon name="clock" />, text: event.time }] : []),
                ].map((m, i) => (
                  <span className="ed-chip" key={i}>
                    <span className="ed-chip-ic">{m.icon}</span>{" "}
                    <span className="ed-chip-tx">{m.text}</span>
                  </span>
                ))}
                <button
                  className="ed-btn ed-btn-ghost ed-share"
                  onClick={() => setShareOpen(true)}
                  aria-haspopup="dialog"
                >
                  <span className="ed-share-ic"><Icon name="share" /></span> Share
                </button>
              </div>

              <div className="ed-divider" />
            </section>

            {/* BODY — the long read. Deliberately AFTER the panel in
                visual order on mobile: a guest who came to buy
                shouldn't scroll past the full description to reach
                the tickets. DOM order still leads with the title. */}
            <section className="ed-body">
              <h2 className="ed-h2">About this Event</h2>
              <p className="ed-desc">{event.description}</p>
            </section>

            {/* RIGHT — purchase panel */}
            <aside className="ed-panel">
              <div className="ed-panel-head">
                <h2 className="ed-panel-title">Get Tickets</h2>
                <span className="ed-panel-sold">
                  {event.availability?.totalSold ??
                    (event.ticketTypes || []).reduce(
                      (s, t) => s + (t.sold || 0),
                      0,
                    )}{" "}
                  sold
                  {/* remaining only when the event declares a capacity —
                      without one there is no honest number to quote */}
                  {event.availability?.capacity != null && (
                    <> · {event.availability.remaining} remaining</>
                  )}
                </span>
              </div>

              {/* Trust row. Emoji here rendered differently on every
                  platform and sat off the text baseline; real icons
                  inherit currentColor and align properly. */}
              <ul className="ed-trustrow">
                <li>
                  <Icon name="lock" size={13} /> Secure checkout
                </li>
                <li>
                  <Icon name="qr" size={13} /> Instant QR ticket
                </li>
                <li>
                  <Icon name="mail" size={13} /> Email delivery
                </li>
              </ul>

              {/* Ticket options */}
              <div className="ed-tickets">
                {(event.ticketTypes || []).map((ticket) => (
                  <TicketOption
                    key={ticket.name}
                    ticket={ticket}
                    selected={selectedTicket?.name === ticket.name}
                    onSelect={setSelectedTicket}
                    avail={stockByTier.get(ticket.name)}
                  />
                ))}
              </div>

              {salesClosed ? (
                /* Sales window shut — the email box and CTA would only
                   lead to a refusal, so state it plainly instead */
                <div className="ed-closed" role="status">
                  <div className="ed-closed-head">
                    <Icon name="alert" size={17} />
                    <strong>Ticket sales have closed</strong>
                  </div>
                  <p className="ed-closed-body">
                    {event.salesEndAt
                      ? `Sales ended ${new Date(event.salesEndAt).toLocaleString(
                          undefined,
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}.`
                      : "Sales for this event have ended."}{" "}
                    No more tickets are available — including at the gate.
                  </p>
                </div>
              ) : (
                <>
                  {/* Email */}
                  <div className="ed-field">
                    <label className="ed-label">Your Email</label>
                    <input
                      type="email"
                      placeholder="gabriel@tictify.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className={`ed-input ${emailFocused ? "is-focus" : ""} ${email && !emailValid ? "is-invalid" : ""}`}
                    />
                    {email && !emailValid && (
                      <p className="ed-field-err">
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  {/* CTA (hidden <768px — replaced by fixed bottom bar) */}
                  <button
                    disabled={!canProceed}
                    onClick={goToCheckout}
                    className="ed-cta ed-cta-panel"
                  >
                    {ctaLabel}
                  </button>

                  {/* Buy in chat — the guest arrived from a shared link
                      and has no other way to learn the bot exists.
                      Hidden entirely when no bot number is configured. */}
                  {waBuyUrl && (
                    <>
                      <div className="ed-or">
                        <span>or</span>
                      </div>
                      <a
                        className="ed-wabuy"
                        href={waBuyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="ed-wabuy-ic" aria-hidden="true">
                          <Icon name="whatsapp" size={19} />
                        </span>
                        Buy on WhatsApp
                      </a>
                      <p className="ed-wabuy-note">
                        Opens a chat with this event ready to go — pay and get
                        your QR ticket without leaving WhatsApp.
                      </p>
                    </>
                  )}

                  <p className="ed-secure">
                    <span className="ed-secure-ic"><Icon name="lock" /></span> Secure
                    checkout · No account required
                  </p>
                </>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* ── Fixed bottom CTA bar (<768px) ── */}
      <div className="ed-ctabar">
        <div className="ed-ctabar-info">
          <span className="ed-ctabar-name">
            {selectedTicket ? selectedTicket.name : "No ticket selected"}
          </span>
          <span className="ed-ctabar-price">
            {selectedTicket
              ? selectedTicket.price > 0
                ? `₦${Number(effectivePrice(selectedTicket)).toLocaleString()}`
                : "Free"
              : "—"}
          </span>
        </div>
        <button disabled={!canProceed} onClick={goToCheckout} className="ed-cta">
          {ctaLabel}
        </button>
      </div>

      {shareOpen && (
        <ShareSheet
          url={shareUrl}
          title={event.title}
          dateText={eventDate.toDateString()}
          locationText={event.location}
          waBuyUrl={waBuyUrl}
          onClose={() => setShareOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
:root {
  --bg:#080910; --surface:#0d0f16; --card:rgba(255,255,255,0.04);
  --border:rgba(255,255,255,0.08); --border-h:rgba(255,255,255,0.18);
  --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12); --gold-glo:rgba(232,201,106,0.22);
  --text:#F0EDE8; --muted:#8B887E; --danger:#E05C5C; --live:#6BF0A0;
  --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif;
  --r:20px; --r-sm:12px;
}
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
button { font-family:var(--font-b); cursor:pointer; }
input { font-family:var(--font-b); outline:none; }
img { display:block; }

@keyframes edSpin { to { transform:rotate(360deg); } }
@keyframes edFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

.ed-page { min-height:100svh; background:var(--bg); font-family:var(--font-b); display:flex; flex-direction:column; }
.ed-container { width:100%; max-width:1200px; margin:0 auto; padding:0 clamp(16px,4.5vw,32px); }

/* ── Buttons ── */
.ed-btn { border-radius:999px; font-weight:600; font-size:13.5px; padding:9px 18px; border:1px solid transparent; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; white-space:nowrap; }
.ed-btn-gold { background:var(--gold); color:#080910; }
.ed-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.ed-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.ed-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-2px); }
.ed-back-lg { margin-top:20px; padding:12px 28px; font-size:14px; }

/* ── Header ── */
.ed-header { position:sticky; top:0; z-index:100; background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.ed-nav { height:64px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.ed-logo { height:48px; width:auto; cursor:pointer; }
.ed-nav-links { display:flex; align-items:center; gap:8px; }
.ed-link { background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:8px 14px; border-radius:999px; transition:color .25s, background .25s; }
.ed-link:hover { color:var(--text); background:var(--card); }

/* ── Centered states ── */
.ed-center { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:64px 24px; animation:edFadeUp .4s ease; }
.ed-spinner { width:44px; height:44px; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:edSpin 1s linear infinite; margin-bottom:16px; }
.ed-center-sub { font-size:13px; color:var(--muted); }
.ed-center-ic { display:grid; place-items:center; width:64px; height:64px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); margin-bottom:18px; }
.ed-center-ic svg { width:28px; height:28px; }
.ed-center-title { font-family:var(--font-h); font-size:20px; font-weight:700; color:var(--text); }

/* ── Main ── */
.ed-main { flex:1; padding:clamp(20px,3.5vw,36px) 0 clamp(48px,7vw,88px); }

/* back */
.ed-back { display:inline-flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--border); color:var(--text); padding:9px 18px; border-radius:999px; font-size:13px; font-weight:500; margin-bottom:clamp(18px,3vw,28px); transition:border-color .25s, transform .25s; }
.ed-back:hover { border-color:var(--border-h); transform:translateY(-2px); }
.ed-back-ic { display:inline-grid; place-items:center; }
.ed-back-ic svg { width:14px; height:14px; }

/* ── Hero banner ── */
.ed-hero { position:relative; border-radius:var(--r); overflow:hidden; border:1px solid var(--border); aspect-ratio:21/9; margin-bottom:clamp(24px,4vw,40px); }
.ed-hero img { width:100%; height:100%; object-fit:cover; object-position:center; }
.ed-hero-shade { position:absolute; inset:0; background:linear-gradient(to top, rgba(8,9,16,.75) 0%, transparent 45%); }

/* banner display mode (cover / contain) */
.ed-hero img.ed-bimg-back { position:absolute; inset:0; object-fit:cover; filter:blur(18px) saturate(1.1); transform:scale(1.15); opacity:.55; }
.ed-hero img.ed-bimg-front { position:relative; z-index:1; object-fit:contain; }
.ed-hero .ed-hero-shade { z-index:2; }

/* ── Layout ──
   Named areas so the visual order can differ from the DOM order.
   Mobile stacks lead → panel → body: the purchase sits directly under
   the title, and the long description comes after it. */
.ed-layout { display:grid; grid-template-columns:1fr; gap:clamp(20px,3.5vw,36px); align-items:start;
  grid-template-areas:"lead" "panel" "body"; }
.ed-lead { grid-area:lead; animation:edFadeUp .4s ease both; min-width:0; }
.ed-panel { grid-area:panel; }
.ed-body { grid-area:body; animation:edFadeUp .4s ease .05s both; min-width:0; }

/* ── Info column ── */
.ed-info { animation:edFadeUp .4s ease both; min-width:0; }
.ed-share { display:inline-flex; align-items:center; gap:8px; font-size:13px; padding:8px 16px; }
.ed-share-ic { display:inline-grid; place-items:center; color:var(--gold); flex-shrink:0; }
.ed-share-ic svg { width:15px; height:15px; }
/* No ::before separators: at 400px the row wraps to two lines, and a
   dot drawn on every item but the first left an orphaned bullet
   leading the wrapped line. The icons already delimit the items. */
.ed-trustrow { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:7px 16px; list-style:none; padding:0; font-size:12px; color:var(--muted); margin:-6px 0 18px; }
.ed-trustrow li { display:inline-flex; align-items:center; gap:6px; white-space:nowrap; }
.ed-trustrow svg { color:var(--gold-600,#C9A63F); }
/* Upper bound lowered from 46px: at full size the title alone filled a
   phone screen, pushing the meta and the buy panel out of view. The
   floor is raised so it still reads as a headline on small screens. */
.ed-title { font-family:var(--font-h); font-size:clamp(28px,3.6vw,40px); font-weight:800; line-height:1.08; letter-spacing:-.022em; color:var(--text); margin-bottom:18px; text-wrap:balance; }
.ed-meta { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:clamp(24px,4vw,32px); }
.ed-chip { display:inline-flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--border); border-radius:999px; padding:8px 16px; font-size:13px; color:var(--muted); }
.ed-chip-ic { display:inline-grid; place-items:center; color:var(--gold); flex-shrink:0; }
.ed-chip-ic svg { width:14px; height:14px; }
.ed-divider { height:1px; background:var(--border); margin-bottom:28px; }
.ed-h2 { font-family:var(--font-h); font-size:16px; font-weight:700; color:var(--text); margin-bottom:14px; }
.ed-desc { font-size:15px; color:var(--muted); line-height:1.8; max-width:640px; white-space:pre-line; }

/* ── Purchase panel ── */
.ed-panel { background:rgba(255,255,255,0.035); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,4vw,32px); animation:edFadeUp .4s ease .1s both; min-width:0; }
.ed-panel-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:22px; }
.ed-panel-title { font-family:var(--font-h); font-size:18px; font-weight:700; color:var(--text); }
.ed-panel-sold { font-family:var(--font-h); font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); text-align:right; }

/* ticket options */
.ed-tickets { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
.ed-ticket { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 18px; border-radius:var(--r-sm); border:1px solid var(--border); background:transparent; cursor:pointer; transition:border-color .2s, background .2s, transform .2s; }
.ed-ticket:hover { border-color:var(--border-h); }
.ed-ticket.is-selected { border-color:rgba(232,201,106,.5); background:var(--gold-dim); }
.ed-ticket-main { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
.ed-radio { width:18px; height:18px; border-radius:50%; border:2px solid var(--muted); display:grid; place-items:center; flex-shrink:0; transition:border-color .2s; }
.ed-ticket.is-selected .ed-radio { border-color:var(--gold); }
.ed-radio-dot { width:8px; height:8px; border-radius:50%; background:var(--gold); }
.ed-ticket-info { display:flex; flex-direction:column; gap:2px; min-width:0; }
.ed-ticket-name { font-family:var(--font-h); font-weight:600; font-size:14px; color:var(--text); }
.ed-ticket-desc { font-size:12px; color:var(--muted); display:flex; align-items:center; gap:6px; }
.ed-ticket-desc .ds-icon { color:var(--gold); flex:none; }
.ed-ticket-price { font-family:var(--font-h); font-weight:800; font-size:16px; color:var(--gold); white-space:nowrap; flex-shrink:0; }
.ed-ticket-pricing { display:flex; flex-direction:column; align-items:flex-end; gap:1px; flex-shrink:0; }
.ed-eb-strike { font-size:12px; color:var(--muted); text-decoration:line-through; white-space:nowrap; }
/* per-tier stock line */
.ed-stock { display:inline-flex; align-self:flex-start; align-items:center; font-size:12px; font-weight:500; color:var(--muted); }
.ed-stock.is-low { font-family:var(--font-h); font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--live); background:rgba(107,240,160,.10); border:1px solid rgba(107,240,160,.32); border-radius:999px; padding:2px 8px; margin-top:2px; }
.ed-stock.is-out { font-family:var(--font-h); font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--danger); background:rgba(224,92,92,.10); border:1px solid rgba(224,92,92,.32); border-radius:999px; padding:2px 8px; margin-top:2px; }

/* a sold-out tier is not selectable — dim it and kill the hover affordance */
.ed-ticket.is-soldout { opacity:.5; cursor:not-allowed; }
.ed-ticket.is-soldout:hover { border-color:var(--border); }
.ed-ticket.is-soldout .ed-ticket-price { color:var(--muted); }

.ed-eb-caption { display:inline-flex; align-self:flex-start; margin-top:3px; font-family:var(--font-h); font-size:9.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); border:1px solid rgba(232,201,106,.35); border-radius:999px; padding:2px 8px; white-space:nowrap; }

/* email field */
.ed-field { margin-bottom:20px; }
.ed-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.ed-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.ed-input::placeholder { color:var(--muted); }
.ed-input.is-invalid { border-color:rgba(224,92,92,.5); }
.ed-input.is-focus { border-color:rgba(232,201,106,.4); box-shadow:0 0 0 3px var(--gold-dim); }
.ed-field-err { font-size:11px; color:var(--danger); margin-top:6px; }

/* CTA */
.ed-cta { width:100%; padding:16px 24px; border-radius:999px; border:none; background:var(--gold); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; transition:transform .2s, box-shadow .2s, background .2s, color .2s; }
.ed-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.ed-cta:disabled { background:rgba(255,255,255,0.08); color:var(--muted); cursor:not-allowed; }

/* ── Buy on WhatsApp ──
   Secondary to the gold CTA: WhatsApp green reads as a real brand
   affordance, but the outline weight keeps card checkout primary. */
.ed-or { display:flex; align-items:center; gap:12px; margin:14px 0; color:var(--muted); font-size:11.5px; text-transform:uppercase; letter-spacing:.1em; }
.ed-or::before, .ed-or::after { content:''; flex:1; height:1px; background:var(--border); }
.ed-wabuy { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:15px 24px; border-radius:999px; border:1px solid rgba(37,211,102,.45); background:rgba(37,211,102,.10); color:#4BE383; font-family:var(--font-h); font-weight:700; font-size:15px; text-decoration:none; transition:transform .2s, box-shadow .2s, background .2s, border-color .2s; }
.ed-wabuy:hover { transform:translateY(-2px); background:rgba(37,211,102,.16); border-color:rgba(37,211,102,.7); box-shadow:0 10px 30px rgba(37,211,102,.18); }
.ed-wabuy-ic { display:inline-grid; place-items:center; }
.ed-wabuy-ic svg { width:19px; height:19px; }
.ed-wabuy-note { margin-top:9px; text-align:center; font-size:11.5px; color:var(--muted); line-height:1.55; }

/* sales closed */
.ed-closed { padding:16px 18px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid var(--border-h); }
.ed-closed-head { display:flex; align-items:center; gap:9px; font-size:14px; color:var(--text); margin-bottom:8px; }
.ed-closed-head .ds-icon { color:var(--gold); flex:none; }
.ed-closed-body { font-size:12.5px; color:var(--muted); line-height:1.6; }
.ed-secure { margin-top:14px; text-align:center; font-size:12px; color:var(--muted); display:flex; align-items:center; justify-content:center; gap:7px; }
.ed-secure-ic { display:inline-grid; place-items:center; }
.ed-secure-ic svg { width:13px; height:13px; }

/* fixed bottom CTA bar — hidden by default, shown <768px */
.ed-ctabar { display:none; }

/* ── Footer ── */
.ed-footer { margin-top:auto; border-top:1px solid var(--border); padding:22px 0; }
.ed-footer p { font-size:13px; color:var(--muted); text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (min-width: 1024px) {
  /* Two columns, and the panel spans BOTH rows — so it sits beside the
     hero (visible immediately, no scroll) and stays pinned while the
     description scrolls past it. The old single-row placement left the
     left column empty below the description at wide viewports. */
  .ed-layout { grid-template-columns:minmax(0,1fr) 400px;
    grid-template-areas:"lead panel" "body panel"; column-gap:clamp(28px,3vw,44px); }
  .ed-panel { position:sticky; top:84px; align-self:start; }
  /* Shorter than 21:9 now that it shares the row — a very wide crop
     would force the panel down to match its height. */
  .ed-hero { aspect-ratio:16/10; margin-bottom:26px; }
  /* Body copy sets its own comfortable measure instead of running the
     full column width. */
  .ed-desc { max-width:62ch; }
}
@media (max-width: 768px) {
  .ed-hide-sm { display:none; }
  .ed-hero { aspect-ratio:3/2; margin-bottom:18px; }
  /* The divider separates lead from body on desktop. On mobile the
     panel sits between them and its own card edge already does that
     job, so the rule is just ~40px of dead space above the tickets. */
  .ed-lead .ed-divider { display:none; }
  .ed-layout { gap:18px; }
  /* Long venue names forced each chip onto its own row, so location,
     date and Share ate three lines. Smaller padding + a wrapping
     label lets them share rows; the venue truncates rather than
     monopolising the width (it's repeated in full at checkout). */
  .ed-meta { gap:8px; margin-bottom:22px; }
  .ed-chip { padding:7px 13px; font-size:12.5px; max-width:100%; min-width:0; }
  .ed-chip-tx { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
  .ed-cta-panel { display:none; }
  /* Clear the fixed bar at the end of the scroll. Bar is ~72px plus
     the home-indicator inset, so this leaves real breathing room
     rather than ending flush against it. */
  .ed-main { padding-bottom:calc(132px + env(safe-area-inset-bottom)); }
  /* Near-opaque: at .92 the panel's own text showed THROUGH the bar
     while scrolling, which read as two overlapping layers of copy
     rather than a bar floating above the page. The top shadow does
     the "this is above" work that transparency was failing to. */
  .ed-ctabar { display:flex; align-items:center; gap:14px; position:fixed; left:0; right:0; bottom:0; z-index:200; padding:12px clamp(16px,4.5vw,32px) calc(12px + env(safe-area-inset-bottom)); background:rgba(9,11,19,.985); backdrop-filter:blur(20px) saturate(1.3); -webkit-backdrop-filter:blur(20px) saturate(1.3); border-top:1px solid var(--border-h); box-shadow:0 -12px 32px rgba(0,0,0,.55); }
  .ed-ctabar-info { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .ed-ctabar-name { font-size:12px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; }
  .ed-ctabar-price { font-family:var(--font-h); font-weight:800; font-size:16px; color:var(--gold); white-space:nowrap; }
  .ed-ctabar .ed-cta { flex:1; width:auto; padding:14px 18px; font-size:14px; }
  .ed-footer { padding-bottom:calc(22px + env(safe-area-inset-bottom)); }
}
@media (max-width: 480px) {
  .ed-nav { height:56px; }
  .ed-logo { height:42px; }
  .ed-btn { padding:8px 14px; font-size:13px; }
  .ed-chip { padding:7px 13px; font-size:12.5px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .ed-info, .ed-panel, .ed-center { opacity:1; transform:none; }
}
`;
