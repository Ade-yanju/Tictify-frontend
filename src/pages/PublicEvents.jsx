/* ═══════════════════════════════════════════════════════════
   PublicEvents.jsx — Tictify 2026 Event Discovery
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const logo = "/logo.png";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Inline icons (dependency-free) ─────────────────────── */
const Ic = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s-7-5.6-7-11a7 7 0 0114 0c0 5.4-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  cal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 2.5V6M16 2.5V6" strokeLinecap="round" />
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a3 3 0 000 6v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a3 3 0 000-6z" />
      <path d="M13 5v2M13 11v2M13 17v2" strokeDasharray="1 3" />
    </svg>
  ),
};

/* ── Slim public header ──────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  return (
    <header className="pe-header">
      <div className="pe-container pe-nav">
        <img
          src={logo}
          alt="Tictify"
          className="pe-logo"
          onClick={() => navigate("/")}
        />
        <nav className="pe-nav-links" aria-label="Primary">
          <button className="pe-link pe-hide-sm" onClick={() => navigate("/events")}>
            Events
          </button>
          <button className="pe-btn pe-btn-ghost" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="pe-btn pe-btn-gold" onClick={() => navigate("/register")}>
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
    <footer className="pe-footer">
      <div className="pe-container">
        <p>© {new Date().getFullYear()} Tictify. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ── Loading skeleton card ───────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="pe-skel" aria-hidden="true">
      <div className="pe-skel-img" />
      <div className="pe-skel-body">
        <div className="pe-skel-line" style={{ width: "72%", height: 16 }} />
        <div className="pe-skel-line" style={{ width: "52%" }} />
        <div className="pe-skel-line" style={{ width: "42%" }} />
        <div className="pe-skel-line pe-skel-line-last" style={{ width: "34%", height: 26 }} />
      </div>
    </div>
  );
}

/* ── Status badge ────────────────────────────────────────── */
function StatusBadge({ type, label }) {
  const variant =
    type === "ONGOING"
      ? "pe-badge-live"
      : type === "SOLD_OUT"
        ? "pe-badge-sold"
        : "pe-badge-upcoming";
  return (
    <span className={`pe-badge ${variant}`}>
      <span className="pe-badge-dot" />
      {label}
    </span>
  );
}

/* ── Event card ──────────────────────────────────────────── */
function EventCard({ event, onClick, index }) {
  const [hovered, setHovered] = useState(false);

  const sold = (event.ticketTypes || []).reduce((s, t) => s + (t.sold || 0), 0);
  const remaining = Math.max(event.capacity - sold, 0);
  const prices = (event.ticketTypes || [])
    .map((t) => Number(t.price) || 0)
    .filter((p) => p > 0);
  const startingPrice = prices.length
    ? `₦${Math.min(...prices).toLocaleString()}`
    : "Free";

  const now = new Date();
  const start = new Date(event.date);
  const state =
    remaining === 0
      ? { label: "Sold Out", type: "SOLD_OUT" }
      : now < start
        ? { label: "Upcoming", type: "UPCOMING" }
        : { label: "Live Now", type: "ONGOING" };

  const disabled = state.type === "SOLD_OUT";

  return (
    <article
      onClick={() => !disabled && onClick(event._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`pe-card ${hovered && !disabled ? "is-hover" : ""} ${disabled ? "is-disabled" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="pe-card-media">
        <img src={event.banner} alt={event.title} loading="lazy" />
        <div className="pe-card-shade" aria-hidden="true" />
        <div className="pe-card-status">
          <StatusBadge type={state.type} label={state.label} />
        </div>
        <span
          className={`pe-card-price ${startingPrice === "Free" ? "is-free" : "is-paid"}`}
        >
          {startingPrice}
        </span>
      </div>

      <div className="pe-card-body">
        <h3 className="pe-card-title">{event.title}</h3>
        <p className="pe-card-meta">
          <span className="pe-card-ic">{Ic.pin}</span> {event.location}
        </p>
        <p className="pe-card-meta">
          <span className="pe-card-ic">{Ic.cal}</span>{" "}
          {new Date(event.date).toDateString()}
        </p>

        <div className="pe-card-foot">
          <span className={`pe-card-left ${remaining < 20 ? "is-low" : ""}`}>
            {remaining > 0 ? `${remaining} left` : "Sold out"}
          </span>
          <span className={`pe-card-view ${disabled ? "is-off" : ""}`}>
            {disabled ? "Unavailable" : "View Event"} {!disabled && "→"}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function PublicEvents() {
  injectStyles("tictify-public-events-css", CSS);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setEvents(Array.isArray(data) ? data : []);
      } catch {
        if (active) setError("Unable to load events at the moment.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => (active = false);
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const q = search.toLowerCase().trim();
    return events.filter((e) => {
      if (new Date(e.endDate) <= now) return false;
      return (
        !q ||
        e.title?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
      );
    });
  }, [events, search]);

  return (
    <div className="pe-page">
      <Header />

      {/* ── Hero / title ── */}
      <section className="pe-hero">
        <div className="pe-container">
          <span className="pe-kicker">
            <span className="pe-kicker-dot" /> Live Events
          </span>
          <h1 className="pe-title">
            Find Your
            <br />
            <em>Next Experience</em>
          </h1>
          <p className="pe-sub">
            Discover concerts, conferences, parties and more — all secured on
            Tictify.
          </p>

          {/* Search toolbar */}
          <div className="pe-toolbar">
            <div className={`pe-search ${searchFocused ? "is-focus" : ""}`}>
              <span className="pe-search-ic">{Ic.search}</span>
              <input
                type="search"
                placeholder="Search events or locations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {search && (
                <button
                  className="pe-clear"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Events grid ── */}
      <main className="pe-main">
        <div className="pe-container">
          {error && <div className="pe-error">{error}</div>}

          {!loading && !error && (
            <div className="pe-results">
              <p>
                {filteredEvents.length === 0
                  ? "No events match your search"
                  : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""} found`}
              </p>
            </div>
          )}

          <div className="pe-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredEvents.map((ev, i) => (
                  <EventCard
                    key={ev._id}
                    event={ev}
                    index={i}
                    onClick={(id) => navigate(`/events/${id}`)}
                  />
                ))}
          </div>

          {!loading && filteredEvents.length === 0 && !error && (
            <div className="pe-empty">
              <span className="pe-empty-ic">{Ic.ticket}</span>
              <p className="pe-empty-title">No events found</p>
              <p className="pe-empty-sub">
                Try a different search term or check back soon.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

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

@keyframes peFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes pePulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.45; transform:scale(.8); } }
@keyframes peShimmer { from { background-position:-200% 0; } to { background-position:200% 0; } }

.pe-page { min-height:100svh; background:var(--bg); font-family:var(--font-b); display:flex; flex-direction:column; }
.pe-container { width:100%; max-width:1200px; margin:0 auto; padding:0 clamp(16px,4.5vw,32px); }

/* ── Buttons ── */
.pe-btn { border-radius:999px; font-weight:600; font-size:13.5px; padding:9px 18px; border:1px solid transparent; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; white-space:nowrap; }
.pe-btn-gold { background:var(--gold); color:#080910; }
.pe-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.pe-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.pe-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-2px); }

/* ── Header ── */
.pe-header { position:sticky; top:0; z-index:100; background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.pe-nav { height:64px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.pe-logo { height:30px; cursor:pointer; }
.pe-nav-links { display:flex; align-items:center; gap:8px; }
.pe-link { background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:8px 14px; border-radius:999px; transition:color .25s, background .25s; }
.pe-link:hover { color:var(--text); background:var(--card); }

/* ── Hero ── */
.pe-hero { padding:clamp(40px,7vw,84px) 0 clamp(24px,4vw,44px); }
.pe-kicker { display:inline-flex; align-items:center; gap:8px; font-family:var(--font-h); font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); border:1px solid rgba(232,201,106,.22); padding:7px 14px; border-radius:999px; margin-bottom:22px; }
.pe-kicker-dot { width:6px; height:6px; border-radius:50%; background:var(--live); animation:pePulse 2s ease-in-out infinite; }
.pe-title { font-family:var(--font-h); font-weight:800; font-size:clamp(34px,6.6vw,72px); line-height:1.05; letter-spacing:-.02em; color:var(--text); margin-bottom:16px; text-wrap:balance; }
.pe-title em { font-style:normal; color:var(--gold); }
.pe-sub { color:var(--muted); font-size:clamp(14px,1.9vw,17px); line-height:1.65; max-width:460px; }

/* ── Search toolbar ── */
.pe-toolbar { display:flex; flex-wrap:wrap; gap:12px; margin-top:32px; }
.pe-search { position:relative; flex:1 1 280px; max-width:520px; transition:transform .2s; }
.pe-search.is-focus { transform:scale(1.01); }
.pe-search input { width:100%; padding:15px 44px 15px 48px; background:var(--card); border:1px solid var(--border); border-radius:999px; color:var(--text); font-size:15px; transition:border-color .2s, box-shadow .2s; }
.pe-search input::placeholder { color:var(--muted); }
.pe-search.is-focus input { border-color:rgba(232,201,106,.4); box-shadow:0 0 0 4px var(--gold-dim); }
.pe-search-ic { position:absolute; left:18px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; display:grid; place-items:center; }
.pe-search-ic svg { width:17px; height:17px; }
.pe-clear { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--muted); font-size:20px; line-height:1; padding:4px; transition:color .2s; }
.pe-clear:hover { color:var(--text); }
.pe-search input::-webkit-search-cancel-button { -webkit-appearance:none; }

/* ── Main / results ── */
.pe-main { flex:1; padding-bottom:clamp(48px,8vw,96px); }
.pe-error { padding:18px 24px; border-radius:var(--r-sm); background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.25); color:var(--danger); font-size:14px; margin-bottom:32px; }
.pe-results { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:22px; }
.pe-results p { font-size:13px; color:var(--muted); }

/* ── Grid ── */
.pe-grid { display:grid; gap:clamp(14px,2vw,24px); grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr)); }

/* ── Card ── */
.pe-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; display:flex; flex-direction:column; cursor:pointer; transition:transform .25s, border-color .25s, box-shadow .25s; animation:peFadeUp .45s ease both; }
.pe-card.is-hover { transform:translateY(-4px); border-color:var(--border-h); box-shadow:0 16px 48px rgba(0,0,0,.5); }
.pe-card.is-disabled { opacity:.55; cursor:not-allowed; }
.pe-card-media { position:relative; aspect-ratio:16/10; overflow:hidden; }
.pe-card-media img { width:100%; height:100%; object-fit:cover; transition:transform .45s ease; }
.pe-card.is-hover .pe-card-media img { transform:scale(1.05); }
.pe-card-shade { position:absolute; inset:0; background:linear-gradient(to top, rgba(8,9,16,.82) 0%, transparent 52%); }
.pe-card-status { position:absolute; top:14px; left:14px; }
.pe-card-price { position:absolute; bottom:12px; right:12px; font-family:var(--font-h); font-weight:800; font-size:13px; padding:6px 13px; border-radius:999px; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border:1px solid transparent; }
.pe-card-price.is-paid { color:var(--gold); background:rgba(8,9,16,.6); border-color:rgba(232,201,106,.35); }
.pe-card-price.is-free { color:var(--live); background:rgba(8,9,16,.6); border-color:rgba(107,240,160,.35); }

/* badges */
.pe-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; font-family:var(--font-h); font-size:10.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.pe-badge-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
.pe-badge-upcoming { background:rgba(232,201,106,.16); color:var(--gold); }
.pe-badge-live { background:rgba(107,240,160,.16); color:var(--live); }
.pe-badge-live .pe-badge-dot { animation:pePulse 1.5s ease-in-out infinite; }
.pe-badge-sold { background:rgba(224,92,92,.16); color:var(--danger); }

/* card body */
.pe-card-body { padding:18px 20px 20px; flex:1; display:flex; flex-direction:column; gap:8px; }
.pe-card-title { font-family:var(--font-h); font-size:clamp(15px,2vw,17px); font-weight:700; line-height:1.3; color:var(--text); }
.pe-card-meta { font-size:13px; color:var(--muted); display:flex; align-items:center; gap:7px; }
.pe-card-ic { display:inline-grid; place-items:center; color:var(--muted); flex-shrink:0; }
.pe-card-ic svg { width:13px; height:13px; }
.pe-card-foot { margin-top:auto; padding-top:14px; display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border); }
.pe-card-left { font-size:12px; font-weight:600; color:var(--muted); }
.pe-card-left.is-low { color:var(--danger); }
.pe-card-view { font-size:12px; font-weight:700; font-family:var(--font-h); color:var(--gold); display:flex; align-items:center; gap:4px; }
.pe-card-view.is-off { color:var(--muted); }

/* ── Skeleton ── */
.pe-skel { background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; animation:peFadeUp .4s ease both; }
.pe-skel-img { width:100%; aspect-ratio:16/10; background:linear-gradient(90deg,#1a1c24 25%,#22242e 50%,#1a1c24 75%); background-size:200% 100%; animation:peShimmer 1.4s infinite; }
.pe-skel-body { padding:18px 20px 20px; }
.pe-skel-line { height:12px; border-radius:6px; margin-bottom:10px; background:linear-gradient(90deg,#1a1c24 25%,#22242e 50%,#1a1c24 75%); background-size:200% 100%; animation:peShimmer 1.4s infinite; }
.pe-skel-line-last { margin-bottom:0; margin-top:18px; }

/* ── Empty state ── */
.pe-empty { text-align:center; padding:80px 24px; color:var(--muted); animation:peFadeUp .4s ease; }
.pe-empty-ic { display:inline-grid; place-items:center; width:64px; height:64px; border-radius:50%; background:var(--gold-dim); color:var(--gold); margin-bottom:18px; }
.pe-empty-ic svg { width:28px; height:28px; }
.pe-empty-title { font-family:var(--font-h); font-size:20px; font-weight:700; color:var(--text); margin-bottom:8px; }
.pe-empty-sub { font-size:14px; }

/* ── Footer ── */
.pe-footer { margin-top:auto; border-top:1px solid var(--border); padding:22px 0; }
.pe-footer p { font-size:13px; color:var(--muted); text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 1024px) {
  .pe-nav { height:60px; }
}
@media (max-width: 768px) {
  .pe-hide-sm { display:none; }
  .pe-search { max-width:none; }
}
@media (max-width: 480px) {
  .pe-nav { height:56px; }
  .pe-logo { height:26px; }
  .pe-btn { padding:8px 14px; font-size:13px; }
  .pe-search input { padding:13px 40px 13px 44px; font-size:14px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .pe-card, .pe-skel { opacity:1; transform:none; }
}
`;
