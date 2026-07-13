/* ═══════════════════════════════════════════════════════════
   Checkout.jsx — Tictify 2026 Secure Checkout
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
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

/* ── Slim progress: Details → Payment → Ticket ───────────── */
function Progress() {
  const steps = ["Details", "Payment", "Ticket"];
  return (
    <nav className="ck-progress" aria-label="Checkout progress">
      {steps.map((s, i) => (
        <span key={s} className="ck-progress-seg">
          <span
            className={`ck-progress-step ${i === 0 ? "is-done" : ""} ${i === 1 ? "is-active" : ""}`}
          >
            <span className="ck-progress-dot" />
            {s}
          </span>
          {i < steps.length - 1 && (
            <span className="ck-progress-arrow" aria-hidden="true">
              →
            </span>
          )}
        </span>
      ))}
    </nav>
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

/* In-app browsers (TikTok, Instagram, Facebook…) block the bank
   redirects Paystack needs for 3D-Secure/OTP, so payments stall on
   "Please close this web page to continue". Detect them and warn the
   guest to reopen in a real browser BEFORE they reach Paystack. */
function detectInAppBrowser() {
  const ua = navigator.userAgent || "";
  if (/musical_ly|Bytedance|TikTok/i.test(ua)) return "TikTok";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/Twitter/i.test(ua)) return "X (Twitter)";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  return null;
}

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
    <div className="ck-field">
      {label && <label className="ck-label">{label}</label>}
      <input
        className={`ck-input ${focused ? "is-focused" : ""} ${value && error ? "is-invalid" : ""}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {value && error && <p className="ck-field-err">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  injectStyles("tictify-checkout-css", CSS);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const touchStartX = useRef(0);
  const ticketParam = searchParams.get("ticket");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [qty, setQty] = useState(1);
  const [focused, setFocused] = useState({});
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const inAppBrowser = useMemo(() => detectInAppBrowser(), []);
  const [linkCopied, setLinkCopied] = useState(false);

  async function copyCheckoutLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older webviews lack the clipboard API — fall back to a hidden textarea
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

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

  /* ── Transparent fee quote (single source of truth for total) ── */
  useEffect(() => {
    setQuote(null);
    if (!ticket || !(ticket.price > 0)) return;
    let active = true;
    (async () => {
      try {
        const params =
          `price=${ticket.price}&qty=${qty}` +
          `&eventId=${id}&ticketType=${encodeURIComponent(ticket.name)}` +
          (appliedCode ? `&code=${encodeURIComponent(appliedCode)}` : "");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/quote?${params}`,
        );
        if (!res.ok) {
          if (appliedCode) {
            const data = await res.json().catch(() => ({}));
            if (active) {
              setCodeError(data.message || "Invalid discount code");
              setCodeInput("");
              setAppliedCode("");
            }
          }
          throw new Error();
        }
        const data = await res.json();
        if (active && data && typeof data.total === "number") setQuote(data);
      } catch {
        /* graceful fallback — summary falls back to the ticket price */
      }
    })();
    return () => {
      active = false;
    };
  }, [ticket, qty, id, appliedCode]);

  async function handlePayment() {
    if (!canPay) return;
    setProcessing(true);
    setError("");
    try {
      const promoterRef = sessionStorage.getItem("tictify_ref");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/initiate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: id,
            ticketType: ticket.name,
            quantity: qty,
            name,
            email,
            ...(promoterRef ? { promoter: promoterRef } : {}),
            ...(quote?.discount?.code
              ? { discountCode: quote.discount.code }
              : {}),
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
      <div className="ck-page ck-center" role="status">
        <div className="ck-loading-card">
          <div className="ck-spinner" />
          <p className="ck-loading-text">Preparing checkout…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error && !event) {
    return (
      <div className="ck-page ck-center">
        <div className="ck-error-card">
          <div className="ck-error-icon" aria-hidden="true">
            ⚠️
          </div>
          <h2 className="ck-error-title">Error</h2>
          <p className="ck-error-msg">{error}</p>
          <button className="ck-btn-ghost" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ck-page">
      {processing && (
        <div className="ck-overlay" role="status">
          <div className="ck-overlay-card">
            <div className="ck-spinner ck-spinner-lg" />
            <p className="ck-overlay-title">Redirecting to payment…</p>
            <p className="ck-overlay-sub">Please don't close this page</p>
          </div>
        </div>
      )}

      {/* ── BANNER ── */}
      <div className="ck-banner">
        {event.banner && (
          <>
            {event.bannerFit === "contain" ? (
              <>
                <img
                  className="ck-banner-img ck-bimg-back"
                  src={event.banner}
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="ck-banner-img ck-bimg-front"
                  src={event.banner}
                  alt=""
                />
              </>
            ) : (
              <img className="ck-banner-img" src={event.banner} alt="" />
            )}
            <div className="ck-banner-fade" aria-hidden="true" />
          </>
        )}
        <button className="ck-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="ck-wrap">
        {inAppBrowser && (
          <div className="ck-iab" role="alert">
            <div className="ck-iab-head">
              <span className="ck-iab-icon" aria-hidden="true">⚠️</span>
              <strong>
                You&apos;re inside {inAppBrowser}&apos;s browser — card
                payments won&apos;t complete here.
              </strong>
            </div>
            <p className="ck-iab-body">
              {inAppBrowser} blocks the secure bank verification step, so
              your payment would get stuck. Open this page in Safari or
              Chrome instead:
            </p>
            <ol className="ck-iab-steps">
              <li>
                Tap the <strong>⋯</strong> (or share) icon in the corner
              </li>
              <li>
                Choose <strong>“Open in browser”</strong>
              </li>
            </ol>
            <button
              type="button"
              className="ck-iab-copy"
              onClick={copyCheckoutLink}
            >
              {linkCopied
                ? "✓ Link copied — paste it in your browser"
                : "Copy checkout link"}
            </button>
          </div>
        )}
        <Progress />

        <div className="ck-shell">
          {/* LEFT — Event info + attendee details */}
          <section className="ck-main">
            <div className="ck-info">
              <h1 className="ck-title">{event.title}</h1>
              <div className="ck-meta">
                {[
                  { icon: "📍", t: event.location || "TBA" },
                  { icon: "📅", t: new Date(event.date).toDateString() },
                ].map((m, i) => (
                  <span className="ck-chip" key={i}>
                    {m.icon} {m.t}
                  </span>
                ))}
              </div>
              <div className="ck-divider" />
              <p className="ck-desc">{event.description}</p>
            </div>

            <div className="ck-formcard">
              <h2 className="ck-formcard-title">Attendee Details</h2>
              <div className="ck-fields">
                <InputField
                  label="Full Name"
                  placeholder="Gabriel Ogunfunminiyi"
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
                  placeholder="gabriel@tictify.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailValid ? "" : "Enter a valid email address"}
                  focused={focused.email}
                  onFocus={() => setFocused((f) => ({ ...f, email: true }))}
                  onBlur={() => setFocused((f) => ({ ...f, email: false }))}
                />

                {event.ticketTypes.length > 1 && (
                  <div className="ck-field">
                    <label className="ck-label">Ticket Type</label>
                    <div className="ck-selectwrap">
                      <select
                        className="ck-select"
                        value={ticket.name}
                        onChange={(e) =>
                          setTicket(
                            event.ticketTypes.find(
                              (t) => t.name === e.target.value,
                            ),
                          )
                        }
                      >
                        {event.ticketTypes.map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.name}
                            {(t.groupSize || 1) > 1
                              ? ` (admits ${t.groupSize})`
                              : ""}{" "}
                            —{" "}
                            {t.price > 0
                              ? `₦${Number(effectivePrice(t)).toLocaleString()}${
                                  isEarlyBird(t) ? " · Early bird" : ""
                                }`
                              : "Free"}
                          </option>
                        ))}
                      </select>
                      <span className="ck-caret" aria-hidden="true">
                        ▾
                      </span>
                    </div>
                  </div>
                )}

                <div className="ck-field">
                  <label className="ck-label">Tickets</label>
                  <div
                    className="ck-stepper"
                    role="group"
                    aria-label="Ticket quantity"
                  >
                    <button
                      type="button"
                      className="ck-step-btn"
                      aria-label="Decrease quantity"
                      disabled={qty <= 1}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span className="ck-step-num">{qty}</span>
                    <button
                      type="button"
                      className="ck-step-btn"
                      aria-label="Increase quantity"
                      disabled={qty >= 10}
                      onClick={() => setQty((q) => Math.min(10, q + 1))}
                    >
                      +
                    </button>
                  </div>
                  {qty > 1 && ticket && (
                    <p className="ck-step-note">
                      One QR code admits all {qty * (ticket.groupSize || 1)} of
                      you — arrive together or split entries at the gate.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT — Sticky Order Summary */}
          <aside className="ck-aside">
            <div className="ck-sum">
              <h2 className="ck-sum-title">Order Summary</h2>

              <div className="ck-sum-event">
                <p className="ck-sum-event-name">{event.title}</p>
                <p className="ck-sum-event-loc">
                  {event.location || "TBA"} ·{" "}
                  {new Date(event.date).toDateString()}
                </p>
              </div>

              <div className="ck-sum-rows">
                {ticket && (
                  <>
                    <div className="ck-sum-row">
                      <span>Ticket type</span>
                      <span className="ck-sum-val">{ticket.name}</span>
                    </div>
                    <div className="ck-sum-row">
                      <span>Quantity</span>
                      <span className="ck-sum-val">{qty}</span>
                    </div>
                    <div className="ck-sum-row">
                      <span>
                        Ticket × {qty}
                        {ticket.price > 0 && isEarlyBird(ticket) && (
                          <span className="ck-eb-badge">EARLY BIRD</span>
                        )}
                      </span>
                      <span className="ck-sum-val ck-num">
                        {ticket.price > 0 ? (
                          <>
                            {isEarlyBird(ticket) && (
                              <s className="ck-eb-strike">
                                ₦{Number(ticket.price * qty).toLocaleString()}
                              </s>
                            )}
                            ₦
                            {Number(
                              quote?.subtotal ?? effectivePrice(ticket) * qty,
                            ).toLocaleString()}
                          </>
                        ) : (
                          "Free — ₦0"
                        )}
                      </span>
                    </div>
                    {ticket.price > 0 && quote && (
                      <>
                        <div className="ck-sum-fee">
                          <div className="ck-sum-row">
                            <span>Service fee</span>
                            <span className="ck-sum-val ck-num">
                              ₦{Number(quote.platformFee || 0).toLocaleString()}
                            </span>
                          </div>
                          <p className="ck-sum-caption">
                            Instant QR delivery, fraud protection &amp; support
                          </p>
                        </div>
                        <div className="ck-sum-fee">
                          <div className="ck-sum-row">
                            <span>Secure payment processing</span>
                            <span className="ck-sum-val ck-num">
                              ₦
                              {Number(
                                quote.processingFee || 0,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="ck-sum-caption">
                            Charged by our payment partner Paystack
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* ── Discount code ── */}
              {ticket?.price > 0 && (
                <div className="ck-disc">
                  {quote?.discount ? (
                    <div className="ck-disc-applied">
                      <span>
                        Discount ({quote.discount.code} −
                        {quote.discount.percentOff}%) — −₦
                        {Number(quote.discountAmount || 0).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        className="ck-disc-remove"
                        aria-label="Remove discount"
                        onClick={() => {
                          setAppliedCode("");
                          setCodeInput("");
                          setCodeError("");
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="ck-disc-toggle"
                        aria-expanded={codeOpen}
                        onClick={() => setCodeOpen((v) => !v)}
                      >
                        Have a discount code?{" "}
                        <span aria-hidden="true">{codeOpen ? "▴" : "▾"}</span>
                      </button>
                      {codeOpen && (
                        <div className="ck-disc-row">
                          <input
                            className="ck-input ck-disc-input"
                            placeholder="DISCOUNT CODE"
                            value={codeInput}
                            onChange={(e) => {
                              setCodeInput(e.target.value.toUpperCase());
                              setCodeError("");
                            }}
                          />
                          <button
                            type="button"
                            className="ck-btn-ghost ck-disc-apply"
                            disabled={!codeInput.trim()}
                            onClick={() => {
                              setCodeError("");
                              setAppliedCode(codeInput.trim());
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      )}
                      {codeError && <p className="ck-disc-err">{codeError}</p>}
                    </>
                  )}
                </div>
              )}

              <div className="ck-sum-divider" aria-hidden="true" />

              <div className="ck-sum-total">
                <span className="ck-sum-total-label">Total</span>
                <span className="ck-sum-total-num">
                  {ticket?.price > 0
                    ? `₦${Number(quote?.total ?? effectivePrice(ticket) * qty).toLocaleString()}`
                    : "Free"}
                </span>
              </div>

              <p className="ck-assure">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
                  <path d="M8 10.5V8a4 4 0 018 0v2.5" />
                </svg>
                You&rsquo;re covered — valid QR ticket or your money back
              </p>

              {/* Error */}
              {error && <div className="ck-error-banner">{error}</div>}

              {/* Pay Button */}
              <button
                className="ck-cta"
                disabled={!canPay}
                onClick={handlePayment}
              >
                {ticket?.price > 0
                  ? "Proceed to Secure Payment →"
                  : "Confirm Free Ticket →"}
              </button>

              <p className="ck-trust">🔒 Secured by PAYSTACK</p>
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
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

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

@keyframes ckSpin { to { transform:rotate(360deg); } }
@keyframes ckFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

/* ── Page ── */
.ck-page { min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); overflow-x:clip; }
.ck-center { display:grid; place-items:center; padding:24px; }

/* ── Loading ── */
.ck-loading-card { text-align:center; }
.ck-spinner { width:44px; height:44px; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:ckSpin 1s linear infinite; margin:0 auto 16px; }
.ck-spinner-lg { width:52px; height:52px; margin-bottom:20px; }
.ck-loading-text { font-size:13px; color:var(--muted); }

/* ── Error screen ── */
.ck-error-card { width:min(100%,380px); text-align:center; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,40px); animation:ckFadeUp .4s ease; }
.ck-error-icon { font-size:40px; margin-bottom:16px; }
.ck-error-title { font-family:var(--font-h); font-weight:700; font-size:20px; margin-bottom:10px; }
.ck-error-msg { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:24px; }
.ck-btn-ghost { padding:12px 28px; border-radius:999px; border:1px solid var(--border); background:transparent; color:var(--text); cursor:pointer; font-size:14px; transition:border-color .2s, transform .2s; }
.ck-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-1px); }

/* ── Processing overlay ── */
.ck-overlay { position:fixed; inset:0; background:rgba(8,9,16,.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:grid; place-items:center; z-index:1000; padding:24px; }
.ck-overlay-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(28px,6vw,40px); width:min(100%,360px); text-align:center; animation:ckFadeUp .3s ease; box-shadow:0 32px 80px rgba(0,0,0,.6); }
.ck-overlay-title { font-family:var(--font-h); font-weight:600; font-size:17px; }
.ck-overlay-sub { font-size:13px; color:var(--muted); margin-top:6px; }

/* ── Banner ── */
.ck-banner { height:clamp(160px,30vw,320px); overflow:hidden; position:relative; background:var(--surface); }
.ck-banner-img { width:100%; height:100%; object-fit:cover; }
.ck-banner-fade { position:absolute; inset:0; background:linear-gradient(to bottom, transparent 30%, var(--bg) 100%); }
.ck-back { position:absolute; top:16px; left:16px; display:inline-flex; align-items:center; gap:6px; background:rgba(8,9,16,.75); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--border-h); color:var(--text); padding:9px 16px; border-radius:999px; cursor:pointer; font-size:13px; transition:border-color .2s, transform .2s; }
.ck-back:hover { border-color:var(--gold); transform:translateY(-1px); }

/* banner display mode (cover / contain) */
img.ck-bimg-back { position:absolute; inset:0; object-fit:cover; filter:blur(18px) saturate(1.1); transform:scale(1.15); opacity:.55; }
img.ck-bimg-front { position:relative; z-index:1; object-fit:contain; }
.ck-banner .ck-banner-fade { z-index:2; }
.ck-banner .ck-back { z-index:3; }

/* ── Body wrap ── */
.ck-wrap { max-width:1100px; margin:-24px auto 0; position:relative; z-index:1; padding:0 clamp(16px,5vw,48px) 80px; }

/* ── Progress ── */
.ck-progress { display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:4px 10px; margin-bottom:clamp(20px,4vw,32px); }
.ck-progress-seg { display:inline-flex; align-items:center; gap:10px; }
.ck-progress-step { display:inline-flex; align-items:center; gap:7px; font-family:var(--font-h); font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); }
.ck-progress-dot { width:7px; height:7px; border-radius:50%; background:var(--border-h); }
.ck-progress-step.is-done { color:var(--text); }
.ck-progress-step.is-done .ck-progress-dot { background:var(--live); }
.ck-progress-step.is-active { color:var(--gold); }
.ck-progress-step.is-active .ck-progress-dot { background:var(--gold); box-shadow:0 0 10px var(--gold-glo); }
.ck-progress-arrow { color:var(--muted); font-size:12px; opacity:.6; }

/* ── Layout shell ── */
.ck-shell { display:grid; grid-template-columns:1fr; gap:clamp(18px,3vw,32px); align-items:start; }
.ck-aside { order:-1; }
@media (min-width:1024px) {
  .ck-shell { grid-template-columns:1fr 400px; }
  .ck-aside { order:0; position:sticky; top:24px; }
}

/* ── Left column ── */
.ck-main { display:flex; flex-direction:column; gap:clamp(16px,2.5vw,24px); }
.ck-info { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,4vw,32px); animation:ckFadeUp .4s ease; }
.ck-title { font-family:var(--font-h); font-size:clamp(22px,4vw,36px); font-weight:800; line-height:1.15; letter-spacing:-.02em; color:var(--text); margin-bottom:16px; text-wrap:balance; }
.ck-meta { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:24px; }
.ck-chip { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:999px; background:var(--card); border:1px solid var(--border); font-size:13px; color:var(--muted); }
.ck-divider { height:1px; background:var(--border); margin-bottom:20px; }
.ck-desc { font-size:14px; color:var(--muted); line-height:1.8; overflow-wrap:anywhere; }

.ck-formcard { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,4vw,32px); animation:ckFadeUp .4s ease .06s both; }
.ck-formcard-title { font-family:var(--font-h); font-size:15px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; margin-bottom:20px; }
.ck-fields { display:flex; flex-direction:column; gap:14px; }

/* ── Fields ── */
.ck-field { display:flex; flex-direction:column; }
.ck-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.ck-input { width:100%; padding:14px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.ck-input::placeholder { color:var(--muted); opacity:.7; }
.ck-input:hover { border-color:var(--border-h); }
.ck-input:focus, .ck-input.is-focused { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.ck-input.is-invalid { border-color:rgba(224,92,92,.45); }
.ck-field-err { font-size:11px; color:var(--danger); margin-top:6px; }

/* ── In-app browser warning ── */
.ck-iab { background:rgba(224,92,92,0.08); border:1px solid rgba(224,92,92,0.45); border-radius:16px; padding:18px 20px; margin-bottom:20px; }
.ck-iab-head { display:flex; align-items:flex-start; gap:10px; color:var(--text); font-size:14px; line-height:1.45; }
.ck-iab-icon { font-size:18px; line-height:1.2; }
.ck-iab-body { font-size:13px; color:var(--muted); margin:10px 0 8px; line-height:1.55; }
.ck-iab-steps { font-size:13px; color:var(--text); margin:0 0 14px; padding-left:20px; line-height:1.7; }
.ck-iab-copy { width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--gold); background:var(--gold-dim); color:var(--gold); font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:background .18s ease; }
.ck-iab-copy:hover { background:var(--gold-glo); }
@media (max-width:480px) {
  .ck-iab { padding:15px 16px; border-radius:14px; }
}

.ck-selectwrap { position:relative; }
.ck-select { width:100%; padding:14px 40px 14px 16px; appearance:none; -webkit-appearance:none; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; cursor:pointer; transition:border-color .2s, box-shadow .2s; }
.ck-select:hover { border-color:var(--border-h); }
.ck-select:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.ck-select option { background:var(--surface); color:var(--text); }
.ck-caret { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; font-size:12px; }

/* ── Quantity stepper ── */
.ck-stepper { display:inline-flex; align-items:center; gap:6px; align-self:flex-start; background:var(--card); border:1px solid var(--border); border-radius:999px; padding:5px; }
.ck-step-btn { width:38px; height:38px; border-radius:50%; border:1px solid var(--border); background:transparent; color:var(--text); font-size:18px; line-height:1; display:grid; place-items:center; cursor:pointer; transition:border-color .2s, background .2s, color .2s; }
.ck-step-btn:hover:not(:disabled) { border-color:var(--gold); color:var(--gold); background:var(--gold-dim); }
.ck-step-btn:disabled { opacity:.35; cursor:not-allowed; }
.ck-step-num { min-width:36px; text-align:center; font-family:var(--font-h); font-weight:700; font-size:16px; color:var(--gold); font-variant-numeric:tabular-nums; }
.ck-step-note { margin-top:10px; font-size:12px; color:var(--muted); line-height:1.6; }

/* ── Order summary ── */
.ck-sum { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,4vw,32px); animation:ckFadeUp .4s ease .1s both; }
.ck-sum-title { font-family:var(--font-h); font-size:15px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; margin-bottom:16px; }
.ck-sum-event { padding-bottom:16px; border-bottom:1px dashed var(--border-h); margin-bottom:16px; }
.ck-sum-event-name { font-family:var(--font-h); font-size:15px; font-weight:700; line-height:1.3; margin-bottom:4px; }
.ck-sum-event-loc { font-size:12.5px; color:var(--muted); line-height:1.5; }
.ck-sum-rows { display:grid; gap:11px; margin-bottom:16px; }
.ck-sum-row { display:flex; justify-content:space-between; align-items:baseline; gap:12px; font-size:13.5px; color:var(--muted); }
.ck-sum-val { color:var(--text); font-weight:500; text-align:right; }
.ck-num { font-variant-numeric:tabular-nums; }
.ck-sum-fee { display:grid; gap:4px; }
.ck-sum-caption { font-size:11.5px; color:var(--muted); opacity:.72; line-height:1.5; }
.ck-sum-divider { height:1px; background:var(--border); margin-bottom:16px; }
.ck-assure { display:flex; align-items:center; justify-content:center; gap:7px; font-size:12px; color:var(--muted); margin-bottom:16px; text-align:center; line-height:1.5; }
.ck-assure svg { width:13px; height:13px; color:var(--gold); flex-shrink:0; }
.ck-sum-total { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:16px 18px; background:var(--gold-dim); border:1px solid rgba(232,201,106,.22); border-radius:var(--r-sm); margin-bottom:16px; }
.ck-sum-total-label { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
.ck-sum-total-num { font-family:var(--font-h); font-weight:800; font-size:clamp(22px,3vw,26px); color:var(--gold); font-variant-numeric:tabular-nums; }

/* ── Discount code ── */
.ck-disc { margin-bottom:16px; }
.ck-disc-toggle { background:none; border:none; padding:0; color:var(--muted); font-size:13px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:color .2s; }
.ck-disc-toggle:hover { color:var(--gold); }
.ck-disc-row { display:flex; gap:8px; margin-top:10px; }
.ck-disc-input { flex:1; min-width:0; padding:11px 14px; font-size:13px; text-transform:uppercase; letter-spacing:.05em; }
.ck-disc-input::placeholder { letter-spacing:.05em; }
.ck-disc-apply { flex-shrink:0; padding:10px 18px; font-size:13px; }
.ck-disc-apply:disabled { opacity:.45; cursor:not-allowed; transform:none; }
.ck-disc-err { margin-top:8px; font-size:12px; color:var(--danger); line-height:1.5; }
.ck-disc-applied { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 14px; border-radius:var(--r-sm); background:rgba(107,240,160,.08); border:1px solid rgba(107,240,160,.3); color:var(--live); font-size:13px; line-height:1.5; font-variant-numeric:tabular-nums; }
.ck-disc-remove { background:none; border:none; padding:2px 4px; color:var(--live); font-size:13px; line-height:1; cursor:pointer; flex-shrink:0; opacity:.8; transition:opacity .2s; }
.ck-disc-remove:hover { opacity:1; }

/* ── Early bird ── */
.ck-eb-badge { display:inline-block; margin-left:8px; font-size:9.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); border:1px solid rgba(232,201,106,.35); border-radius:999px; padding:2px 8px; vertical-align:middle; white-space:nowrap; }
.ck-eb-strike { color:var(--muted); text-decoration:line-through; margin-right:8px; font-weight:400; }

/* ── Error banner ── */
.ck-error-banner { padding:12px 16px; border-radius:var(--r-sm); margin-bottom:16px; background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.3); color:var(--danger); font-size:13px; line-height:1.5; }

/* ── CTA ── */
.ck-cta { width:100%; padding:17px 24px; border-radius:999px; border:none; background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; cursor:pointer; transition:transform .15s, box-shadow .2s, background .2s, color .2s; box-shadow:0 8px 32px var(--gold-glo); }
.ck-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 40px var(--gold-glo); }
.ck-cta:disabled { background:rgba(255,255,255,0.07); color:var(--muted); cursor:not-allowed; box-shadow:none; transform:none; }
.ck-trust { margin-top:14px; text-align:center; font-size:12px; color:var(--muted); display:flex; align-items:center; justify-content:center; gap:6px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:768px) {
  .ck-wrap { margin-top:-18px; }
}
@media (max-width:480px) {
  .ck-back { top:12px; left:12px; padding:8px 14px; }
  .ck-progress { justify-content:flex-start; }
  .ck-cta { padding:16px 20px; }
  .ck-chip { font-size:12px; padding:6px 12px; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
