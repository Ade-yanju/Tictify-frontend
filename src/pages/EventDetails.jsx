import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* shared token injection */
function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#080910; --surface:#0d0f16; --card:rgba(255,255,255,0.04); --border:rgba(255,255,255,0.08); --border-h:rgba(255,255,255,0.16);
    --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12); --gold-glo:rgba(232,201,106,0.25);
    --text:#F0EDE8; --muted:#7A7870; --danger:#E05C5C; --live:#6BF0A0; --blue:#6B9FE8;
    --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif; --r:20px; --r-sm:12px;
  }
  html { font-size:16px; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; }
  input,select,button { font-family:var(--font-b); outline:none; }
  img { display:block; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
`;

/* ── RADIO TICKET OPTION ── */
function TicketOption({ ticket, selected, onSelect }) {
  return (
    <label
      onClick={() => onSelect(ticket)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderRadius: "var(--r-sm)",
        border: `1px solid ${selected ? "rgba(232,201,106,.5)" : "var(--border)"}`,
        background: selected ? "var(--gold-dim)" : "transparent",
        cursor: "pointer",
        transition: "border-color .2s, background .2s",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: `2px solid ${selected ? "var(--gold)" : "var(--muted)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "border-color .2s",
          }}
        >
          {selected && (
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--gold)",
              }}
            />
          )}
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-h)",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text)",
            }}
          >
            {ticket.name}
          </p>
          {ticket.description && (
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {ticket.description}
            </p>
          )}
        </div>
      </div>
      <span
        style={{
          fontFamily: "var(--font-h)",
          fontWeight: 800,
          fontSize: 16,
          color: "var(--gold)",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {ticket.price > 0 ? `₦${ticket.price.toLocaleString()}` : "Free"}
      </span>
    </label>
  );
}

export default function EventDetails() {
  injectStyles("tictify-base", BASE_CSS);
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid event link.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${id}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEvent(data);
      } catch {
        setError("Unable to load this event.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );
  const canProceed = emailValid && selectedTicket;

  /* ── LOADING ── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100svh",
          background: "var(--bg)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid var(--border)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              fontFamily: "var(--font-b)",
            }}
          >
            Loading event…
          </p>
        </div>
      </div>
    );
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div
        style={{
          minHeight: "100svh",
          background: "var(--bg)",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center", animation: "fadeUp .4s ease" }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>⚠️</p>
          <p
            style={{
              fontFamily: "var(--font-h)",
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 16,
              padding: "12px 28px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        fontFamily: "var(--font-b)",
      }}
    >
      {/* ── BACK ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px clamp(16px,5vw,48px)",
          background: "rgba(8,9,16,.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "9px 18px",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            transition: "border-color .2s",
          }}
        >
          ← Back to Events
        </button>
      </nav>

      {/* ── BANNER ── */}
      <div
        style={{
          paddingTop: 65, // nav height
          position: "relative",
          height: "clamp(220px,45vw,500px)",
          overflow: "hidden",
        }}
      >
        <img
          src={event.banner}
          alt={event.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 30%, var(--bg) 100%)",
          }}
        />
      </div>

      {/* ── CONTENT ── */}
      <div
        style={{
          maxWidth: 1200,
          margin: "-32px auto 0",
          padding: "0 clamp(16px,5vw,48px) 80px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 32,
        }}
      >
        {/* Two-column on large screens via CSS */}
        <style>{`
          @media (min-width: 900px) {
            .ed-grid { grid-template-columns: 1fr 380px !important; align-items: start; }
          }
        `}</style>

        <div
          className="ed-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* LEFT – Event Info */}
          <section style={{ animation: "fadeUp .4s ease" }}>
            <h1
              style={{
                fontFamily: "var(--font-h)",
                fontSize: "clamp(26px,5vw,46px)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-.02em",
                color: "var(--text)",
                marginBottom: 20,
              }}
            >
              {event.title}
            </h1>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 32,
              }}
            >
              {[
                { icon: "📍", text: event.location },
                { icon: "📅", text: eventDate.toDateString() },
                ...(event.time ? [{ icon: "🕐", text: event.time }] : []),
              ].map((m, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    padding: "8px 16px",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{m.icon}</span> {m.text}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "var(--border)",
                marginBottom: 28,
              }}
            />

            <h2
              style={{
                fontFamily: "var(--font-h)",
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 14,
                color: "var(--text)",
              }}
            >
              About this Event
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--muted)",
                lineHeight: 1.8,
                maxWidth: 640,
              }}
            >
              {event.description}
            </p>
          </section>

          {/* RIGHT – Purchase Panel */}
          <aside
            style={{
              background: "rgba(255,255,255,0.035)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "clamp(20px,4vw,32px)",
              position: "sticky",
              top: 80,
              animation: "fadeUp .4s ease .1s both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-h)",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Get Tickets
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  fontFamily: "var(--font-h)",
                }}
              >
                {(event.ticketTypes || []).reduce(
                  (s, t) => s + (t.sold || 0),
                  0,
                )}{" "}
                sold
              </span>
            </div>

            {/* Ticket Options */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {(event.ticketTypes || []).map((ticket) => (
                <TicketOption
                  key={ticket.name}
                  ticket={ticket}
                  selected={selectedTicket?.name === ticket.name}
                  onSelect={setSelectedTicket}
                />
              ))}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 8,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                }}
              >
                Your Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "var(--card)",
                  border: `1px solid ${emailFocused ? "rgba(232,201,106,.4)" : email && !emailValid ? "rgba(224,92,92,.5)" : "var(--border)"}`,
                  borderRadius: "var(--r-sm)",
                  color: "var(--text)",
                  fontSize: 14,
                  transition: "border-color .2s, box-shadow .2s",
                  boxShadow: emailFocused
                    ? "0 0 0 3px var(--gold-dim)"
                    : "none",
                }}
              />
              {email && !emailValid && (
                <p
                  style={{ fontSize: 11, color: "var(--danger)", marginTop: 6 }}
                >
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              disabled={!canProceed}
              onClick={() =>
                navigate(`/checkout/${event._id}`, {
                  state: { ticket: selectedTicket, email },
                })
              }
              style={{
                width: "100%",
                padding: "16px 24px",
                borderRadius: 999,
                border: "none",
                background: canProceed
                  ? "linear-gradient(135deg,#E8C96A,#F5E196)"
                  : "rgba(255,255,255,0.08)",
                color: canProceed ? "#080910" : "var(--muted)",
                fontFamily: "var(--font-h)",
                fontWeight: 700,
                fontSize: 15,
                cursor: canProceed ? "pointer" : "not-allowed",
                transition: "opacity .2s, transform .15s",
                transform: canProceed ? "scale(1)" : "scale(.99)",
              }}
            >
              {!selectedTicket
                ? "Select a ticket type"
                : !emailValid
                  ? "Enter your email"
                  : "Proceed to Payment →"}
            </button>

            <p
              style={{
                marginTop: 14,
                textAlign: "center",
                fontSize: 12,
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              🔒 Secure checkout · No account required
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
