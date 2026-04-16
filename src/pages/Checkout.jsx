import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

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
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
`;

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  onFocus,
  onBlur,
  focused,
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      {label && (
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
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: "100%",
          padding: "14px 16px",
          background: "var(--card)",
          border: `1px solid ${focused ? "rgba(232,201,106,.5)" : value && error ? "rgba(224,92,92,.4)" : "var(--border)"}`,
          borderRadius: "var(--r-sm)",
          color: "var(--text)",
          fontSize: 14,
          transition: "border-color .2s, box-shadow .2s",
          boxShadow: focused ? "0 0 0 3px var(--gold-dim)" : "none",
        }}
      />
      {value && error && (
        <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 6 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Checkout() {
  injectStyles("tictify-base", BASE_CSS);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const touchStartX = useRef(0);
  const ticketParam = searchParams.get("ticket");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [focused, setFocused] = useState({});
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );
  const nameValid = name.trim().length >= 2;
  const canPay = emailValid && nameValid && ticket && !processing;

  useEffect(() => {
    if (!id) {
      setError("This checkout link is invalid or has expired.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events/view/${id}`,
        );
        if (!res.ok) throw new Error("Event not found");
        const data = await res.json();
        if (!Array.isArray(data.ticketTypes) || data.ticketTypes.length === 0)
          throw new Error("No tickets available for this event.");
        const resolved =
          data.ticketTypes.find(
            (t) => t.name.toLowerCase() === ticketParam?.toLowerCase(),
          ) || data.ticketTypes[0];
        setEvent(data);
        setTicket(resolved);
      } catch (err) {
        setError(err.message || "Unable to prepare checkout.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, ticketParam]);

  async function handlePayment() {
    if (!canPay) return;
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/initiate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: id,
            ticketType: ticket.name,
            name,
            email,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data?.paymentUrl)
        throw new Error(data.message || "Payment initialization failed");
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err.message || "Payment failed");
      setProcessing(false);
    }
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

  /* ── Loading ── */
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
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            Preparing checkout…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error && !event) {
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
        <div
          style={{
            maxWidth: 380,
            textAlign: "center",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r)",
            padding: "clamp(24px,5vw,40px)",
            animation: "fadeUp .4s ease",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2
            style={{
              fontFamily: "var(--font-h)",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 10,
            }}
          >
            Error
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
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

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--bg)",
        fontFamily: "var(--font-b)",
      }}
    >
      {processing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,9,16,.92)",
            backdropFilter: "blur(16px)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
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
                fontSize: 17,
              }}
            >
              Redirecting to payment…
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
              Please don't close this page
            </p>
          </div>
        </div>
      )}

      {/* ── BANNER ── */}
      <div
        style={{
          height: "clamp(160px,30vw,320px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {event.banner && (
          <>
            <img
              src={event.banner}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 30%, var(--bg) 100%)",
              }}
            />
          </>
        )}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(8,9,16,.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-h)",
            color: "var(--text)",
            padding: "9px 16px",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ← Back
        </button>
      </div>

      {/* ── BODY ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "-24px auto 0",
          padding: "0 clamp(16px,5vw,48px) 80px",
        }}
      >
        <style>{`
          @media (min-width: 860px) {
            .co-grid { grid-template-columns: 1fr 400px !important; align-items: start !important; }
          }
        `}</style>

        <div
          className="co-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* LEFT – Event Info */}
          <section
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "clamp(20px,4vw,32px)",
              animation: "fadeUp .4s ease",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-h)",
                fontSize: "clamp(22px,4vw,36px)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-.02em",
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              {event.title}
            </h1>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {[
                { icon: "📍", t: event.location || "TBA" },
                { icon: "📅", t: new Date(event.date).toDateString() },
              ].map((m, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 999,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  {m.icon} {m.t}
                </span>
              ))}
            </div>
            <div
              style={{
                height: 1,
                background: "var(--border)",
                marginBottom: 20,
              }}
            />
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8 }}>
              {event.description}
            </p>
          </section>

          {/* RIGHT – Checkout Card */}
          <aside
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "clamp(20px,4vw,32px)",
              position: "sticky",
              top: 24,
              animation: "fadeUp .4s ease .1s both",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-h)",
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 24,
              }}
            >
              Order Summary
            </h2>

            {/* Fields */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <InputField
                label="Full Name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={nameValid ? "" : "Enter your full name"}
                focused={focused.name}
                onFocus={() => setFocused((f) => ({ ...f, name: true }))}
                onBlur={() => setFocused((f) => ({ ...f, name: false }))}
              />
              <InputField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailValid ? "" : "Enter a valid email address"}
                focused={focused.email}
                onFocus={() => setFocused((f) => ({ ...f, email: true }))}
                onBlur={() => setFocused((f) => ({ ...f, email: false }))}
              />

              {event.ticketTypes.length > 1 && (
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
                      value={ticket.name}
                      onChange={(e) =>
                        setTicket(
                          event.ticketTypes.find(
                            (t) => t.name === e.target.value,
                          ),
                        )
                      }
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
                      }}
                    >
                      {event.ticketTypes.map((t) => (
                        <option
                          key={t.name}
                          value={t.name}
                          style={{ background: "#0d0f16" }}
                        >
                          {t.name} —{" "}
                          {t.price > 0
                            ? `₦${t.price.toLocaleString()}`
                            : "Free"}
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
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--r-sm)",
                  marginBottom: 16,
                  background: "rgba(224,92,92,.1)",
                  border: "1px solid rgba(224,92,92,.3)",
                  color: "var(--danger)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {/* Total Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 20px",
                background: "var(--gold-dim)",
                border: "1px solid rgba(232,201,106,.2)",
                borderRadius: "var(--r-sm)",
                marginBottom: 20,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Total Due
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-h)",
                    fontWeight: 800,
                    fontSize: 26,
                    color: "var(--gold)",
                  }}
                >
                  {ticket?.price > 0
                    ? `₦${ticket.price.toLocaleString()}`
                    : "Free"}
                </p>
              </div>
              {ticket && (
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      marginBottom: 4,
                    }}
                  >
                    1× Ticket
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{ticket.name}</p>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              disabled={!canPay}
              onClick={handlePayment}
              style={{
                width: "100%",
                padding: "17px 24px",
                borderRadius: 999,
                border: "none",
                background: canPay
                  ? "linear-gradient(135deg,#E8C96A,#F5E196)"
                  : "rgba(255,255,255,0.07)",
                color: canPay ? "#080910" : "var(--muted)",
                fontFamily: "var(--font-h)",
                fontWeight: 700,
                fontSize: 15,
                cursor: canPay ? "pointer" : "not-allowed",
                transition: "opacity .2s, transform .15s, box-shadow .2s",
                boxShadow: canPay ? "0 8px 32px rgba(232,201,106,.25)" : "none",
              }}
            >
              {ticket?.price > 0
                ? "Proceed to Secure Payment →"
                : "Confirm Free Ticket →"}
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
              🔒 Secured by ERCASPAY
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
