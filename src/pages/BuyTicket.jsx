/* ═══════════════════════════════════════════════════════════
   BuyTicket.jsx — Tictify 2026 Ticket Selection
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Slim progress: Details → Payment → Ticket ───────────── */
function Progress() {
  const steps = ["Details", "Payment", "Ticket"];
  return (
    <nav className="bt-progress" aria-label="Checkout progress">
      {steps.map((s, i) => (
        <span key={s} className="bt-progress-seg">
          <span className={`bt-progress-step ${i === 0 ? "is-active" : ""}`}>
            <span className="bt-progress-dot" />
            {s}
          </span>
          {i < steps.length - 1 && (
            <span className="bt-progress-arrow" aria-hidden="true">
              <Icon name="arrowRight" />
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function BuyTicket({ event }) {
  injectStyles("tictify-buyticket-css", CSS);
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
      `/checkout/${event.slug || event._id}?email=${encodeURIComponent(email)}&ticket=${encodeURIComponent(ticket)}`,
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
      <div className="bt-page bt-fallback">
        <div className="bt-fallback-card">
          <div className="bt-fallback-icon" aria-hidden="true">
            <Icon name="alertTriangle" />
          </div>
          <p className="bt-fallback-text">Unable to load event.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bt-page">
      <div className="bt-glow" aria-hidden="true" />

      {processing && (
        <div className="bt-overlay" role="status">
          <div className="bt-overlay-card">
            <div className="bt-spinner" />
            <p className="bt-overlay-title">Preparing your checkout…</p>
            <p className="bt-overlay-sub">Just a moment</p>
          </div>
        </div>
      )}

      {/* Back */}
      <button className="bt-back" onClick={() => navigate(-1)}>
        <Icon name="arrowLeft" /> Back
      </button>

      <div className="bt-wrap">
        <Progress />

        <div className="bt-shell">
          {/* LEFT — Details form */}
          <section className="bt-card">
            <div className="bt-card-head">
              <p className="bt-eyebrow">Get Your Ticket</p>
              <h2 className="bt-title">{event.title}</h2>
              {event.location && (
                <p className="bt-loc">
                  <Icon name="pin" /> {event.location}
                </p>
              )}
            </div>

            <div className="bt-form">
              {/* Email */}
              <div className="bt-field">
                <label className="bt-label">Email Address</label>
                <input
                  className={`bt-input ${emailFocused ? "is-focused" : ""} ${email && !emailValid ? "is-invalid" : ""}`}
                  type="email"
                  placeholder="gabriel@tictify.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
                {email && !emailValid && (
                  <p className="bt-field-err">Enter a valid email address</p>
                )}
              </div>

              {/* Ticket Type */}
              {(event.ticketTypes?.length || 0) > 0 && (
                <div className="bt-field">
                  <label className="bt-label">Ticket Type</label>
                  <div className="bt-selectwrap">
                    <select
                      className="bt-select"
                      value={ticket}
                      onChange={(e) => setTicket(e.target.value)}
                    >
                      {event.ticketTypes.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                          {(t.groupSize || 1) > 1
                            ? ` (admits ${t.groupSize})`
                            : ""}{" "}
                          —{" "}
                          {t.price > 0
                            ? `₦${t.price.toLocaleString()}`
                            : "Free"}
                        </option>
                      ))}
                    </select>
                    <span className="bt-caret" aria-hidden="true">
                      ▾
                    </span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                className="bt-cta"
                disabled={!canProceed}
                onClick={proceedToCheckout}
              >
                {canProceed ? (
                  <>
                    Continue to Checkout <Icon name="arrowRight" />
                  </>
                ) : !emailValid ? (
                  "Enter your email"
                ) : (
                  "Select a ticket"
                )}
              </button>

              <p className="bt-trust">
                <Icon name="lock" /> Secure checkout · No account required
              </p>
            </div>
          </section>

          {/* RIGHT — Order Summary */}
          <aside className="bt-aside">
            <div className="bt-sum">
              <h3 className="bt-sum-title">Order Summary</h3>

              <div className="bt-sum-event">
                <p className="bt-sum-event-name">{event.title}</p>
                {event.location && (
                  <p className="bt-sum-event-loc">{event.location}</p>
                )}
              </div>

              {selectedTicketData ? (
                <>
                  <div className="bt-sum-rows">
                    <div className="bt-sum-row">
                      <span>Ticket type</span>
                      <span className="bt-sum-val">
                        {selectedTicketData.name}
                      </span>
                    </div>
                    <div className="bt-sum-row">
                      <span>Quantity</span>
                      <span className="bt-sum-val">1</span>
                    </div>
                    <div className="bt-sum-row">
                      <span>Price</span>
                      <span className="bt-sum-val bt-num">
                        {selectedTicketData.price > 0
                          ? `₦${selectedTicketData.price.toLocaleString()}`
                          : "Free"}
                      </span>
                    </div>
                  </div>
                  <div className="bt-sum-total">
                    <span className="bt-sum-total-label">Total</span>
                    <span className="bt-sum-total-num">
                      {selectedTicketData.price > 0
                        ? `₦${selectedTicketData.price.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>
                </>
              ) : (
                <p className="bt-sum-empty">Select a ticket to see pricing.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
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
html { font-size:16px; }
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
input, select, button { font-family:var(--font-b); outline:none; }
img { display:block; }

@keyframes btSpin { to { transform:rotate(360deg); } }
@keyframes btFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes btGlow { 0%,100% { opacity:.55; } 50% { opacity:1; } }

/* ── Page ── */
.bt-page { min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); position:relative; overflow-x:clip; }
.bt-glow { position:fixed; top:-160px; left:50%; transform:translateX(-50%); width:min(680px,92vw); height:420px; background:radial-gradient(ellipse at center, var(--gold-dim), transparent 65%); pointer-events:none; z-index:0; animation:btGlow 6s ease-in-out infinite; }
.bt-wrap { position:relative; z-index:1; max-width:1060px; margin:0 auto; padding:clamp(76px,12vw,110px) clamp(16px,4.5vw,32px) clamp(48px,7vw,80px); }

/* ── Back ── */
.bt-back { position:fixed; top:20px; left:20px; z-index:10; display:inline-flex; align-items:center; gap:6px; background:rgba(13,15,22,.9); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--border); color:var(--text); padding:10px 18px; border-radius:999px; cursor:pointer; font-size:13px; font-weight:500; transition:border-color .2s, transform .2s; }
.bt-back:hover { border-color:var(--border-h); transform:translateY(-1px); }

/* ── Progress ── */
.bt-progress { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:4px 10px; margin-bottom:clamp(24px,4vw,36px); }
.bt-progress-seg { display:inline-flex; align-items:center; gap:10px; }
.bt-progress-step { display:inline-flex; align-items:center; gap:7px; font-family:var(--font-h); font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); }
.bt-progress-dot { width:7px; height:7px; border-radius:50%; background:var(--border-h); }
.bt-progress-step.is-active { color:var(--gold); }
.bt-progress-step.is-active .bt-progress-dot { background:var(--gold); box-shadow:0 0 10px var(--gold-glo); }
.bt-progress-arrow { color:var(--muted); font-size:12px; opacity:.6; }

/* ── Layout shell ── */
.bt-shell { display:grid; grid-template-columns:1fr; gap:clamp(16px,3vw,28px); align-items:start; }
.bt-aside { order:-1; }
@media (min-width:1024px) {
  .bt-shell { grid-template-columns:1fr 380px; }
  .bt-aside { order:0; position:sticky; top:24px; }
}

/* ── Form card ── */
.bt-card { background:rgba(255,255,255,0.035); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,.6); animation:btFadeUp .4s ease; }
.bt-card-head { padding:clamp(22px,4.5vw,34px); border-bottom:1px solid var(--border); background:linear-gradient(135deg, rgba(232,201,106,.06), transparent); }
.bt-eyebrow { font-family:var(--font-h); font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:10px; }
.bt-title { font-family:var(--font-h); font-size:clamp(20px,4vw,28px); font-weight:800; line-height:1.15; letter-spacing:-.01em; color:var(--text); margin-bottom:8px; text-wrap:balance; }
.bt-loc { font-size:13px; color:var(--muted); display:flex; align-items:center; gap:6px; }
.bt-form { padding:clamp(22px,4.5vw,34px); display:flex; flex-direction:column; gap:18px; }

/* ── Fields ── */
.bt-field { display:flex; flex-direction:column; }
.bt-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.bt-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.bt-input::placeholder { color:var(--muted); opacity:.7; }
.bt-input:hover { border-color:var(--border-h); }
.bt-input:focus, .bt-input.is-focused { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.bt-input.is-invalid { border-color:rgba(224,92,92,.45); }
.bt-field-err { font-size:11px; color:var(--danger); margin-top:6px; }

.bt-selectwrap { position:relative; }
.bt-select { width:100%; padding:14px 40px 14px 16px; appearance:none; -webkit-appearance:none; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; cursor:pointer; transition:border-color .2s, box-shadow .2s; }
.bt-select:hover { border-color:var(--border-h); }
.bt-select:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.bt-select option { background:var(--surface); color:var(--text); }
.bt-caret { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; font-size:12px; }

/* ── CTA ── */
.bt-cta { width:100%; padding:17px 24px; margin-top:4px; border-radius:999px; border:none; background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; cursor:pointer; transition:transform .15s, box-shadow .2s, background .2s, color .2s; box-shadow:0 8px 24px var(--gold-glo); }
.bt-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 34px var(--gold-glo); }
.bt-cta:disabled { background:rgba(255,255,255,0.07); color:var(--muted); cursor:not-allowed; box-shadow:none; transform:none; }
.bt-trust { text-align:center; font-size:12px; color:var(--muted); display:flex; align-items:center; justify-content:center; gap:6px; }

/* ── Order summary ── */
.bt-sum { background:rgba(255,255,255,0.035); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,4vw,28px); animation:btFadeUp .4s ease .08s both; }
.bt-sum-title { font-family:var(--font-h); font-size:15px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--text); margin-bottom:16px; }
.bt-sum-event { padding-bottom:16px; border-bottom:1px dashed var(--border-h); margin-bottom:16px; }
.bt-sum-event-name { font-family:var(--font-h); font-size:15px; font-weight:700; line-height:1.3; margin-bottom:4px; }
.bt-sum-event-loc { font-size:12.5px; color:var(--muted); }
.bt-sum-rows { display:grid; gap:11px; margin-bottom:16px; }
.bt-sum-row { display:flex; justify-content:space-between; align-items:baseline; gap:12px; font-size:13.5px; color:var(--muted); }
.bt-sum-val { color:var(--text); font-weight:500; text-align:right; }
.bt-num { font-variant-numeric:tabular-nums; }
.bt-sum-total { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 16px; background:var(--gold-dim); border:1px solid rgba(232,201,106,.22); border-radius:var(--r-sm); }
.bt-sum-total-label { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
.bt-sum-total-num { font-family:var(--font-h); font-weight:800; font-size:clamp(20px,3vw,24px); color:var(--gold); font-variant-numeric:tabular-nums; }
.bt-sum-empty { font-size:13px; color:var(--muted); line-height:1.6; }

/* ── Processing overlay ── */
.bt-overlay { position:fixed; inset:0; background:rgba(8,9,16,.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:grid; place-items:center; z-index:1000; padding:24px; }
.bt-overlay-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(28px,6vw,40px); width:min(100%,340px); text-align:center; animation:btFadeUp .3s ease; box-shadow:0 32px 80px rgba(0,0,0,.6); }
.bt-spinner { width:48px; height:48px; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:btSpin 1s linear infinite; margin:0 auto 20px; }
.bt-overlay-title { font-family:var(--font-h); font-weight:600; font-size:16px; }
.bt-overlay-sub { font-size:13px; color:var(--muted); margin-top:6px; }

/* ── Fallback (no event) ── */
.bt-fallback { display:grid; place-items:center; padding:24px; }
.bt-fallback-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(28px,6vw,44px); width:min(100%,360px); text-align:center; animation:btFadeUp .4s ease; }
.bt-fallback-icon { font-size:38px; margin-bottom:14px; }
.bt-fallback-text { color:var(--danger); font-size:14px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:768px) {
  .bt-wrap { padding-top:88px; }
}
@media (max-width:480px) {
  .bt-back { top:14px; left:14px; padding:9px 15px; }
  .bt-progress { justify-content:flex-start; }
  .bt-cta { padding:16px 20px; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
