import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    --text:#F0EDE8; --muted:#7A7870; --danger:#E05C5C; --live:#6BF0A0;
    --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif; --r:20px; --r-sm:12px;
  }
  html { font-size:16px; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; }
  input,select,button { font-family:var(--font-b); outline:none; }
  img { display:block; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:scale(.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
`;

export default function BuyTicket({ event }) {
  injectStyles("tictify-base", BASE_CSS);
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [ticket, setTicket] = useState(event?.ticketTypes?.[0]?.name || "");
  const [processing, setProcessing] = useState(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );
  const canProceed = emailValid && ticket && !processing;
  const selectedTicketData = event?.ticketTypes?.find((t) => t.name === ticket);

  function proceedToCheckout() {
    if (!canProceed) return;
    setProcessing(true);
    navigate(
      `/checkout/${event._id}?email=${encodeURIComponent(email)}&ticket=${encodeURIComponent(ticket)}`,
    );
  }

  useEffect(() => {
    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 80) navigate(-1);
    };
    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate]);

  if (!event) {
    return (
      <div
        style={{
          minHeight: "100svh",
          background: "var(--bg)",
          display: "grid",
          placeItems: "center",
          color: "var(--danger)",
        }}
      >
        Unable to load event.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        fontFamily: "var(--font-b)",
        display: "grid",
        placeItems: "center",
        padding: "clamp(16px,5vw,40px)",
        position: "relative",
      }}
    >
      {processing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,9,16,.9)",
            backdropFilter: "blur(12px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: "3px solid var(--border)",
                borderTopColor: "var(--gold)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-h)",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              Preparing your checkout…
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
              Just a moment
            </p>
          </div>
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(13,15,22,.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          padding: "10px 18px",
          borderRadius: 999,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          zIndex: 10,
          transition: "border-color .2s",
        }}
      >
        ← Back
      </button>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(255,255,255,0.035)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          overflow: "hidden",
          animation: "slideIn .4s ease",
          boxShadow: "0 40px 80px rgba(0,0,0,.6)",
        }}
      >
        {/* Header strip */}
        <div
          style={{
            padding: "clamp(24px,5vw,36px)",
            borderBottom: "1px solid var(--border)",
            background:
              "linear-gradient(135deg, rgba(232,201,106,.06), transparent)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontFamily: "var(--font-h)",
              marginBottom: 8,
            }}
          >
            Get Your Ticket
          </p>
          <h2
            style={{
              fontFamily: "var(--font-h)",
              fontSize: "clamp(20px,4vw,26px)",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "var(--text)",
              marginBottom: 6,
            }}
          >
            {event.title}
          </h2>
          {event.location && (
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>📍</span> {event.location}
            </p>
          )}
        </div>

        {/* Form */}
        <div
          style={{
            padding: "clamp(24px,5vw,36px)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              Email Address
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
                border: `1px solid ${emailFocused ? "rgba(232,201,106,.5)" : email && !emailValid ? "rgba(224,92,92,.4)" : "var(--border)"}`,
                borderRadius: "var(--r-sm)",
                color: "var(--text)",
                fontSize: 14,
                transition: "border-color .2s, box-shadow .2s",
                boxShadow: emailFocused ? "0 0 0 3px var(--gold-dim)" : "none",
              }}
            />
            {email && !emailValid && (
              <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 6 }}>
                Enter a valid email address
              </p>
            )}
          </div>

          {/* Ticket Type */}
          {(event.ticketTypes?.length || 0) > 0 && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 8,
                }}
              >
                Ticket Type
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 40px 14px 16px",
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-sm)",
                    color: "var(--text)",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {event.ticketTypes.map((t) => (
                    <option
                      key={t.name}
                      value={t.name}
                      style={{ background: "#0d0f16" }}
                    >
                      {t.name} —{" "}
                      {t.price > 0 ? `₦${t.price.toLocaleString()}` : "Free"}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    pointerEvents: "none",
                    fontSize: 12,
                  }}
                >
                  ▾
                </span>
              </div>
            </div>
          )}

          {/* Price summary */}
          {selectedTicketData && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                background: "var(--gold-dim)",
                border: "1px solid rgba(232,201,106,.2)",
                borderRadius: "var(--r-sm)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginBottom: 2,
                  }}
                >
                  Total
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-h)",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--gold)",
                  }}
                >
                  {selectedTicketData.price > 0
                    ? `₦${selectedTicketData.price.toLocaleString()}`
                    : "Free"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginBottom: 2,
                  }}
                >
                  Type
                </p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {selectedTicketData.name}
                </p>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            disabled={!canProceed}
            onClick={proceedToCheckout}
            style={{
              width: "100%",
              padding: "17px 24px",
              borderRadius: 999,
              border: "none",
              background: canProceed
                ? "linear-gradient(135deg,#E8C96A,#F5E196)"
                : "rgba(255,255,255,0.07)",
              color: canProceed ? "#080910" : "var(--muted)",
              fontFamily: "var(--font-h)",
              fontWeight: 700,
              fontSize: 15,
              cursor: canProceed ? "pointer" : "not-allowed",
              transition: "opacity .2s, transform .15s, box-shadow .2s",
              transform: canProceed ? "scale(1)" : "scale(.99)",
              boxShadow: canProceed
                ? "0 8px 24px rgba(232,201,106,.2)"
                : "none",
            }}
          >
            {canProceed
              ? "Continue to Checkout →"
              : !emailValid
                ? "Enter your email"
                : "Select a ticket"}
          </button>

          <p
            style={{
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
        </div>
      </div>
    </div>
  );
}
