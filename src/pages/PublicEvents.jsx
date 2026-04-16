import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── GLOBAL STYLES (injected once) ─────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #080910;
    --surface:  #0d0f16;
    --card:     rgba(255,255,255,0.04);
    --border:   rgba(255,255,255,0.08);
    --border-h: rgba(255,255,255,0.16);
    --gold:     #E8C96A;
    --gold-dim: rgba(232,201,106,0.12);
    --gold-glo: rgba(232,201,106,0.25);
    --text:     #F0EDE8;
    --muted:    #7A7870;
    --danger:   #E05C5C;
    --live:     #6BF0A0;
    --blue:     #6B9FE8;
    --font-h:   'Syne', sans-serif;
    --font-b:   'DM Sans', sans-serif;
    --r:        20px;
    --r-sm:     12px;
  }

  html { font-size: 16px; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-b); -webkit-font-smoothing: antialiased; }

  input, select, button { font-family: var(--font-b); outline: none; }
  img { display: block; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes shimmer {
    from { background-position: -200% 0; }
    to   { background-position: 200% 0; }
  }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
`;

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ─── SKELETON CARD ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  const s = {
    card: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r)",
      overflow: "hidden",
      animation: "fadeUp .4s ease both",
    },
    img: {
      width: "100%",
      height: 180,
      background: "linear-gradient(90deg,#1a1c24 25%,#22242e 50%,#1a1c24 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    },
    body: { padding: "18px 20px 20px" },
    line: (w, h = 12, mb = 10) => ({
      width: w,
      height: h,
      borderRadius: 6,
      background: "linear-gradient(90deg,#1a1c24 25%,#22242e 50%,#1a1c24 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      marginBottom: mb,
    }),
  };
  return (
    <div style={s.card}>
      <div style={s.img} />
      <div style={s.body}>
        <div style={s.line("70%", 16, 12)} />
        <div style={s.line("50%", 11, 8)} />
        <div style={s.line("40%", 11, 20)} />
        <div style={s.line("30%", 28)} />
      </div>
    </div>
  );
}

/* ─── STATUS BADGE ───────────────────────────────────────────────────────── */
function StatusBadge({ type, label }) {
  const colors = {
    UPCOMING: {
      bg: "rgba(107,159,232,0.15)",
      color: "#6B9FE8",
      dot: "#6B9FE8",
    },
    ONGOING: { bg: "rgba(107,240,160,0.15)", color: "#6BF0A0", dot: "#6BF0A0" },
    SOLD_OUT: { bg: "rgba(224,92,92,0.15)", color: "#E05C5C", dot: "#E05C5C" },
  };
  const c = colors[type] || colors.UPCOMING;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: 999,
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        fontFamily: "var(--font-h)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
          animation: type === "ONGOING" ? "pulse 1.5s infinite" : "none",
        }}
      />
      {label}
    </span>
  );
}

/* ─── EVENT CARD ─────────────────────────────────────────────────────────── */
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
      style={{
        background: "var(--card)",
        border: `1px solid ${hovered && !disabled ? "var(--border-h)" : "var(--border)"}`,
        borderRadius: "var(--r)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "border-color .2s, transform .2s, box-shadow .2s",
        transform: hovered && !disabled ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered && !disabled ? "0 16px 48px rgba(0,0,0,.5)" : "none",
        animation: `fadeUp .4s ease ${index * 60}ms both`,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img
          src={event.banner}
          alt={event.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform .4s",
            transform: hovered && !disabled ? "scale(1.04)" : "scale(1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(8,9,16,.8) 0%, transparent 50%)",
          }}
        />
        <div style={{ position: "absolute", top: 14, left: 14 }}>
          <StatusBadge type={state.type} label={state.label} />
        </div>
        <div style={{ position: "absolute", bottom: 14, right: 14 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "var(--font-h)",
              color: "var(--gold)",
              textShadow: "0 2px 12px rgba(0,0,0,.6)",
            }}
          >
            {startingPrice}
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "18px 20px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-h)",
            fontSize: "clamp(15px,2vw,17px)",
            fontWeight: 700,
            lineHeight: 1.3,
            color: "var(--text)",
          }}
        >
          {event.title}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>📍</span> {event.location}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>📅</span>{" "}
          {new Date(event.date).toDateString()}
        </p>

        <div style={{ marginTop: "auto", paddingTop: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid var(--border)",
              paddingTop: 14,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: remaining < 20 ? "var(--danger)" : "var(--muted)",
              }}
            >
              {remaining > 0 ? `${remaining} left` : "Sold out"}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "var(--font-h)",
                color: disabled ? "var(--muted)" : "var(--gold)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {disabled ? "Unavailable" : "View Event"} {!disabled && "→"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function PublicEvents() {
  injectStyles("tictify-globals", css);
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
    <div
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        fontFamily: "var(--font-b)",
      }}
    >
      {/* ── HERO HEADER ── */}
      <header
        style={{
          padding:
            "clamp(40px,8vw,96px) clamp(16px,5vw,64px) clamp(32px,5vw,64px)",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--gold-dim)",
            border: "1px solid rgba(232,201,106,.2)",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--gold)",
            fontFamily: "var(--font-h)",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--gold)",
              animation: "pulse 2s infinite",
            }}
          />
          Live Events
        </div>

        <h1
          style={{
            fontFamily: "var(--font-h)",
            fontSize: "clamp(36px,7vw,80px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-.02em",
            color: "var(--text)",
            marginBottom: 16,
          }}
        >
          Find Your
          <br />
          <span style={{ color: "var(--gold)" }}>Next Experience</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(14px,2vw,17px)",
            color: "var(--muted)",
            maxWidth: 440,
            lineHeight: 1.6,
            marginBottom: 36,
          }}
        >
          Discover concerts, conferences, parties and more — all secured on
          Tictify.
        </p>

        {/* Search */}
        <div
          style={{
            position: "relative",
            maxWidth: 520,
            transition: "transform .2s",
            transform: searchFocused ? "scale(1.01)" : "scale(1)",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 18,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 16,
              pointerEvents: "none",
              color: "var(--muted)",
            }}
          >
            ⌕
          </span>
          <input
            type="search"
            placeholder="Search events or locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: "100%",
              padding: "16px 20px 16px 46px",
              background: "var(--card)",
              border: `1px solid ${searchFocused ? "rgba(232,201,106,.4)" : "var(--border)"}`,
              borderRadius: 999,
              color: "var(--text)",
              fontSize: 15,
              transition: "border-color .2s, box-shadow .2s",
              boxShadow: searchFocused ? "0 0 0 4px var(--gold-dim)" : "none",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </header>

      {/* ── EVENTS GRID ── */}
      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 clamp(16px,5vw,64px) clamp(48px,8vw,96px)",
        }}
      >
        {error && (
          <div
            style={{
              padding: "18px 24px",
              borderRadius: "var(--r-sm)",
              background: "rgba(224,92,92,.1)",
              border: "1px solid rgba(224,92,92,.25)",
              color: "var(--danger)",
              fontSize: 14,
              marginBottom: 32,
            }}
          >
            {error}
          </div>
        )}

        {/* Results bar */}
        {!loading && !error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              {filteredEvents.length === 0
                ? "No events match your search"
                : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gap: "clamp(16px,2vw,24px)",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%,300px),1fr))",
          }}
        >
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
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              color: "var(--muted)",
              animation: "fadeUp .4s ease",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎟</div>
            <p
              style={{
                fontFamily: "var(--font-h)",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 8,
              }}
            >
              No events found
            </p>
            <p style={{ fontSize: 14 }}>
              Try a different search term or check back soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
