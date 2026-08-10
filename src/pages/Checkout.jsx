/* ═══════════════════════════════════════════════════════════
   Checkout.jsx — Tictify 2026 Secure Checkout
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
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
              <Icon name="arrowRight" />
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

/* ── Per-tier stock, read straight off the server's availability record.
   Mirrors computeAvailability's contract exactly:
     • no record            → null (render nothing; never guess)
     • soldOut              → { soldOut:true }
     • remaining 0 + !soldOut → genuinely UNBOUNDED (both the tier
       quantity and the event capacity are undeclared). The server
       reports 0 there only to keep JSON valid, so showing "0 left"
       would be a phantom sell-out. Render nothing instead.
     • pct is only meaningful when a quantity was declared; it stays
       null otherwise so the meter is skipped rather than faked.
   `low` uses the same <=10 threshold the page already used. ── */
function tierStock(avail) {
  if (!avail) return null;
  if (avail.soldOut) return { soldOut: true, remaining: 0, pct: 0, low: false };

  const remaining = Number(avail.remaining);
  if (!Number.isFinite(remaining) || remaining <= 0) return null; // unbounded

  const quantity = Number(avail.quantity);
  const pct =
    Number.isFinite(quantity) && quantity > 0
      ? Math.min(1, remaining / quantity)
      : null;

  return { soldOut: false, remaining, pct, low: remaining <= 10 };
}

/* In-app browsers (TikTok, Instagram, Facebook…) block the bank
   redirects Paystack needs for 3D-Secure/OTP, so CARD payments stall on
   "Please close this web page to continue". Bank transfer has no
   redirect, so it works fine in here — detect the webview and default
   the guest to transfer instead of pushing them out of the app. */
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

/* "14:03" / "1:02:11" — how long the transfer account stays valid */
function formatCountdown(ms) {
  if (!(ms > 0)) return null;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
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
  /* Card redirects break inside webviews — transfer always works, so
     that's the default in one. Elsewhere card stays the default. */
  const [payMethod, setPayMethod] = useState("card");
  /* null = still asking the server. Never offer a method the account
     can't actually complete — doing so produces instantly-failed
     payments and a guest who can't buy. */
  const [transferOffered, setTransferOffered] = useState(false);
  const [transferInfo, setTransferInfo] = useState(null);
  const [fallbackNote, setFallbackNote] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [now, setNow] = useState(() => Date.now());

  /* Clipboard with a hidden-textarea fallback for old webviews */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  async function copyCheckoutLink() {
    await copyText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  async function copyField(field, text) {
    await copyText(String(text));
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  }

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );
  const nameValid = name.trim().length >= 2;
  /* The server refuses any sale past salesEndAt — say so up front
     instead of rendering a button that's guaranteed to fail. */
  const salesClosed = Boolean(event?.salesClosed);

  /* Server-computed stock for the selected tier, matched BY NAME — the
     same key createPaymentSession matches on. It already folds in the
     event-capacity guard, so `remaining` is exactly how many tickets
     the server will actually sell from this tier. */
  const tierAvail = useMemo(
    () =>
      (event?.availability?.tiers || []).find((t) => t.name === ticket?.name) ||
      null,
    [event, ticket],
  );
  const tierSoldOut = Boolean(tierAvail?.soldOut);
  /* 10 stays the hard upper bound (the server clamps there too); stock
     only ever lowers it. No availability data → old flat 10.

     `remaining: 0` with `soldOut: false` does NOT mean empty — it's how
     computeAvailability reports a genuinely UNBOUNDED tier (neither a
     tier quantity nor an event capacity was declared) while keeping the
     JSON a valid number. Treating it as a real count clamped maxQty to
     1, silently capping buyers at a single ticket on every event with
     no declared limits. Only a positive remaining lowers the ceiling. */
  const maxQty = tierSoldOut
    ? 1
    : Math.max(1, Math.min(10, tierAvail?.remaining > 0 ? tierAvail.remaining : 10));

  /* Switching tiers (or a refetch) can shrink the ceiling under the
     current qty — pull it back so we never post a quantity the server
     will bounce. */
  useEffect(() => {
    setQty((q) => Math.min(q, maxQty));
  }, [maxQty]);

  const canPay =
    emailValid &&
    nameValid &&
    ticket &&
    !processing &&
    !salesClosed &&
    !tierSoldOut;

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

        /* Land on a tier the buyer can actually buy.
           Defaulting to ticketTypes[0] meant an event whose first tier
           had sold out (the normal end-state of early-bird pricing)
           opened checkout pre-loaded with a sold-out selection: three
           red errors and a dead "Sold out" button on first paint, with
           nothing saying "just pick another one".
           An explicit ?ticket= param still wins — a guest who followed
           a link to a specific tier should see that tier's real state,
           including that it's gone. */
        const soldOutNames = new Set(
          (data.availability?.tiers || [])
            .filter((t) => t.soldOut)
            .map((t) => t.name),
        );
        const requested = data.ticketTypes.find(
          (t) => t.name.toLowerCase() === ticketParam?.toLowerCase(),
        );
        const resolved =
          requested ||
          data.ticketTypes.find((t) => !soldOutNames.has(t.name)) ||
          /* Every tier gone — fall back to the first so the page still
             renders the event and explains the sell-out. */
          data.ticketTypes[0];
        setEvent(data);
        setTicket(resolved);
      } catch (err) {
        setError(err.message || "Unable to prepare checkout.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, ticketParam]);

  /* ── Which payment methods can actually complete right now ── */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/methods`,
        );
        const data = await res.json();
        if (!active || !data?.transfer) return;
        setTransferOffered(true);
        // Card redirects break inside webviews — transfer is the way out
        if (detectInAppBrowser()) setPayMethod("transfer");
      } catch {
        /* stay on card-only — the safe default */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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

  /* One POST to /initiate. `method` is the wire value: "transfer" asks
     for a dedicated account, anything else gets a Paystack link. */
  async function initiate(method) {
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
          payMethod: method,
          ...(promoterRef ? { promoter: promoterRef } : {}),
          ...(quote?.discount?.code ? { discountCode: quote.discount.code } : {}),
        }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Payment initialization failed");
    return data;
  }

  /* Card (or free) — hand off to Paystack's hosted page */
  async function payByLink() {
    const data = await initiate("link");
    if (!data?.paymentUrl) throw new Error("Payment initialization failed");
    window.location.href = data.paymentUrl;
  }

  async function handlePayment() {
    if (!canPay) return;
    setProcessing(true);
    setError("");
    setFallbackNote("");
    try {
      /* Free tickets never touch the transfer path */
      if (payMethod !== "transfer" || !(ticket.price > 0)) {
        await payByLink();
        return;
      }

      const data = await initiate("transfer");

      /* Paystack couldn't provision an account — don't dead-end the
         guest, quietly move them to the card path instead. */
      if (data?.transferUnavailable) {
        setFallbackNote(
          "Bank transfer isn't available right now — taking you to secure card payment…",
        );
        await payByLink();
        return;
      }

      if (!data?.transfer || !data?.accountNumber) {
        throw new Error("Could not start the bank transfer");
      }
      setTransferInfo(data);
      setProcessing(false);
    } catch (err) {
      setError(err.message || "Payment failed");
      setProcessing(false);
    }
  }

  /* Escape hatch from the transfer panel back to card */
  async function switchToCard() {
    setProcessing(true);
    setError("");
    setFallbackNote("");
    try {
      await payByLink();
    } catch (err) {
      setError(err.message || "Payment failed");
      setProcessing(false);
    }
  }

  /* ── Waiting for the transfer: poll status every 5s, give up after
     ~20 min. Cleans up on unmount so no interval outlives the page. ── */
  useEffect(() => {
    if (!transferInfo?.reference) return;
    let stopped = false;
    const startedAt = Date.now();
    const LIMIT = 20 * 60 * 1000;

    const poll = async () => {
      if (stopped) return;
      if (Date.now() - startedAt > LIMIT) {
        clearInterval(timer);
        return;
      }
      /* Skip work while the tab is hidden — resumes on return */
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payments/status/${transferInfo.reference}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (stopped) return;
        if (data.status === "SUCCESS") {
          clearInterval(timer);
          navigate(`/success/${transferInfo.reference}`);
        } else if (data.status === "FAILED") {
          clearInterval(timer);
          setError("That payment didn't go through. Please try again.");
          setTransferInfo(null);
        }
      } catch {
        /* transient network blip — the next tick retries */
      }
    };

    const timer = setInterval(poll, 5000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [transferInfo, navigate]);

  /* 1s heartbeat drives the expiry countdown */
  useEffect(() => {
    if (!transferInfo?.expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [transferInfo]);

  const countdown = useMemo(() => {
    if (!transferInfo?.expiresAt) return null;
    const ms = new Date(transferInfo.expiresAt).getTime() - now;
    return Number.isFinite(ms) ? formatCountdown(ms) : null;
  }, [transferInfo, now]);

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
            <Icon name="alert" />
          </div>
          <h2 className="ck-error-title">Error</h2>
          <p className="ck-error-msg">{error}</p>
          <button className="ck-btn-ghost" onClick={() => navigate(-1)}>
            <Icon name="arrowLeft" /> Go Back
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
          <Icon name="arrowLeft" /> Back
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="ck-wrap">
        {inAppBrowser && !transferInfo && (
          <div className="ck-iab" role="status">
            <div className="ck-iab-head">
              <span className="ck-iab-icon" aria-hidden="true">
                <Icon name={transferOffered ? "bank" : "alert"} />
              </span>
              <strong>
                You&apos;re in {inAppBrowser}&apos;s browser — card payments
                can fail here.
              </strong>
            </div>
            {transferOffered ? (
              <p className="ck-iab-body">
                {inAppBrowser} blocks the secure bank verification step cards
                need. <strong>Pay by bank transfer below and you&apos;re
                done</strong> — it works right here, no app switching. Prefer
                card? Open this page in your browser first.
              </p>
            ) : (
              /* No transfer on this account — the guest MUST leave the
                 webview, so say so plainly instead of offering a method
                 that would fail. */
              <p className="ck-iab-body">
                {inAppBrowser} blocks the secure bank verification step cards
                need, so payment may fail in here.{" "}
                <strong>Open this page in Safari or Chrome</strong> — tap the
                ⋯ menu and choose &ldquo;Open in browser&rdquo;, or copy the
                link below.
              </p>
            )}
            <button
              type="button"
              className="ck-iab-copy"
              onClick={copyCheckoutLink}
            >
              {linkCopied ? (
                <>
                  <Icon name="check" /> Link copied — paste it in your browser
                </>
              ) : (
                "Copy link for card payment"
              )}
            </button>
          </div>
        )}
        <Progress />

        {transferInfo ? (
          <section className="ck-tr" aria-live="polite">
            <h1 className="ck-tr-title">Send ₦{Number(transferInfo.total).toLocaleString()} to this account</h1>
            <p className="ck-tr-sub">
              Open your bank app and make the transfer. Your ticket is
              issued automatically the moment the money lands — keep this
              page open.
            </p>

            <div className="ck-tr-card">
              <div className="ck-tr-row">
                <span className="ck-tr-k">Bank</span>
                <span className="ck-tr-v">{transferInfo.bankName || "—"}</span>
              </div>

              <div className="ck-tr-acct">
                <span className="ck-tr-k">Account number</span>
                <div className="ck-tr-acctrow">
                  <span className="ck-tr-num">{transferInfo.accountNumber}</span>
                  <button
                    type="button"
                    className="ck-tr-copy"
                    onClick={() => copyField("acct", transferInfo.accountNumber)}
                  >
                    {copiedField === "acct" ? (
                      <>
                        <Icon name="check" /> Copied
                      </>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </div>
              </div>

              {transferInfo.accountName && (
                <div className="ck-tr-row">
                  <span className="ck-tr-k">Account name</span>
                  <span className="ck-tr-v">{transferInfo.accountName}</span>
                </div>
              )}

              <div className="ck-tr-row">
                <span className="ck-tr-k">Exact amount</span>
                <span className="ck-tr-vrow">
                  <span className="ck-tr-amt">
                    ₦{Number(transferInfo.total).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="ck-tr-copy"
                    onClick={() => copyField("amt", transferInfo.total)}
                  >
                    {copiedField === "amt" ? (
                      <>
                        <Icon name="check" /> Copied
                      </>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </span>
              </div>
            </div>

            <p className="ck-tr-warn">
              <Icon name="alert" /> Transfer the <strong>exact amount</strong> — a different
              figure won&apos;t match your ticket automatically.
            </p>

            {countdown && (
              <p className="ck-tr-exp">
                This account expires in <strong>{countdown}</strong>
              </p>
            )}
            {transferInfo.expiresAt && !countdown && (
              <p className="ck-tr-exp ck-tr-exp-done">
                This account has expired — use card instead.
              </p>
            )}

            <div className="ck-tr-wait">
              <span className="ck-tr-pulse" aria-hidden="true" />
              Waiting for your transfer…
            </div>

            <button type="button" className="ck-tr-alt" onClick={switchToCard}>
              I&apos;ll pay by card instead
            </button>
          </section>
        ) : (
        <div className="ck-shell">
          {/* LEFT — Event info + attendee details */}
          <section className="ck-main">
            <div className="ck-info">
              <h1 className="ck-title">{event.title}</h1>
              <div className="ck-meta">
                {[
                  { icon: "pin", t: event.location || "TBA" },
                  { icon: "calendar", t: new Date(event.date).toDateString() },
                ].map((m, i) => (
                  <span className="ck-chip" key={i}>
                    <Icon name={m.icon} /> {m.t}
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

                {event.ticketTypes.length > 0 && (
                  <div className="ck-field">
                    <label className="ck-label">
                      {event.ticketTypes.length > 1
                        ? "Ticket Type"
                        : "Your Ticket"}
                    </label>
                    <div
                      className="ck-tiers"
                      role="radiogroup"
                      aria-label="Ticket type"
                    >
                      {event.ticketTypes.map((t) => {
                        const stock = tierStock(
                          (event.availability?.tiers || []).find(
                            (a) => a.name === t.name,
                          ),
                        );
                        const out = Boolean(stock?.soldOut);
                        const selected = ticket?.name === t.name;
                        const admits = t.groupSize || 1;
                        const eb = isEarlyBird(t);

                        return (
                          <button
                            key={t.name}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={out}
                            className={`ck-tier${selected ? " is-selected" : ""}${
                              out ? " is-out" : ""
                            }`}
                            onClick={() => setTicket(t)}
                          >
                            <span className="ck-tier-body">
                              <span className="ck-tier-head">
                                <span className="ck-tier-name">{t.name}</span>
                                {eb && (
                                  <span className="ck-tier-tag">Early bird</span>
                                )}
                                {admits > 1 && (
                                  <span className="ck-tier-tag is-group">
                                    Admits {admits}
                                  </span>
                                )}
                              </span>

                              {out ? (
                                <span className="ck-tier-stock is-out">
                                  Sold out
                                </span>
                              ) : (
                                stock && (
                                  <span className="ck-tier-stockwrap">
                                    {stock.pct != null && (
                                      <span
                                        className="ck-tier-track"
                                        aria-hidden="true"
                                      >
                                        <span
                                          className={`ck-tier-fill${stock.low ? " is-low" : ""}`}
                                          style={{
                                            width: `${Math.max(4, Math.round(stock.pct * 100))}%`,
                                          }}
                                        />
                                      </span>
                                    )}
                                    <span
                                      className={`ck-tier-stock${stock.low ? " is-low" : ""}`}
                                    >
                                      {stock.low
                                        ? `Only ${stock.remaining} left`
                                        : `${stock.remaining} left`}
                                    </span>
                                  </span>
                                )
                              )}
                            </span>

                            <span className="ck-tier-stub">
                              <span className="ck-tier-price">
                                {t.price > 0
                                  ? `₦${Number(effectivePrice(t)).toLocaleString()}`
                                  : "Free"}
                              </span>
                              {eb && t.price > 0 && (
                                <span className="ck-tier-was">
                                  ₦{Number(t.price).toLocaleString()}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
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
                      disabled={qty >= maxQty}
                      onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    >
                      +
                    </button>
                  </div>
                  {/* Stock lives on each ticket stub above (per tier), so it
                     isn't repeated here. The sold-out case still needs a
                     line, because a stub can only say "Sold out" for the
                     tier the guest arrived on. */}
                  {tierSoldOut && !salesClosed && (
                    <p className="ck-stock is-out" role="status">
                      {ticket.name} is sold out — pick another ticket type.
                    </p>
                  )}
                  {qty > 1 && ticket && (
                    <p className="ck-step-note">
                      One QR code admits all {qty * (ticket.groupSize || 1)} of
                      you — arrive together or split entries at the gate.
                    </p>
                  )}
                </div>

                {/* Paid tickets only, and only when there's a real choice
                    to make — transfer is hidden when the account can't
                    provision one. */}
                {ticket?.price > 0 && !salesClosed && transferOffered && (
                  <div className="ck-field">
                    <label className="ck-label">How do you want to pay?</label>
                    <div
                      className="ck-pm"
                      role="radiogroup"
                      aria-label="Payment method"
                    >
                      {[
                        {
                          id: "card",
                          icon: "card",
                          label: "Card",
                          note: "Visa, Mastercard, Verve",
                        },
                        {
                          id: "transfer",
                          icon: "bank",
                          label: "Bank transfer",
                          note: "Works in any app",
                        },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={payMethod === m.id}
                          className={`ck-pm-opt ${payMethod === m.id ? "is-on" : ""}`}
                          onClick={() => setPayMethod(m.id)}
                        >
                          <span className="ck-pm-icon" aria-hidden="true">
                            <Icon name={m.icon} />
                          </span>
                          <span className="ck-pm-text">
                            <span className="ck-pm-label">{m.label}</span>
                            <span className="ck-pm-note">{m.note}</span>
                          </span>
                          <span className="ck-pm-tick" aria-hidden="true">
                            {payMethod === m.id ? "●" : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                    {payMethod === "transfer" && (
                      <p className="ck-step-note">
                        We&apos;ll show you an account to send ₦
                        {Number(
                          quote?.total ?? effectivePrice(ticket) * qty,
                        ).toLocaleString()}{" "}
                        to. Your ticket is issued automatically once it lands.
                      </p>
                    )}
                  </div>
                )}
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
                        <Icon name="close" />
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
                        <Icon name="chevronDown" className={codeOpen ? "ck-chev-up" : ""} />
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
                <Icon name="lock" />
                You&rsquo;re covered — valid QR ticket or your money back
              </p>

              {/* Sales window shut — explain once, up front, instead of
                  letting them fill the form and get refused */}
              {salesClosed && (
                <div className="ck-closed" role="status">
                  <div className="ck-closed-head">
                    <span aria-hidden="true">
                      <Icon name="lock" />
                    </span>
                    <strong>Ticket sales have closed</strong>
                  </div>
                  <p className="ck-closed-body">
                    The organizer stopped sales for {event.title}
                    {event.salesEndAt
                      ? ` on ${new Date(event.salesEndAt).toLocaleString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}`
                      : ""}
                    . No more tickets can be bought — including at the gate.
                  </p>
                </div>
              )}

              {/* Tier exhausted — same treatment as a shut sales window,
                  because the server refuses this purchase just as flatly */}
              {!salesClosed && tierSoldOut && (
                <div className="ck-closed" role="status">
                  <div className="ck-closed-head">
                    <span aria-hidden="true">
                      <Icon name="ticket" />
                    </span>
                    <strong>{ticket.name} is sold out</strong>
                  </div>
                  <p className="ck-closed-body">
                    {event?.availability?.soldOut
                      ? `${event.title} has sold out — no tickets are left in any category.`
                      : "Every ticket in this category is gone. Pick another ticket type to keep going."}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && <div className="ck-error-banner">{error}</div>}
              {fallbackNote && (
                <div className="ck-note-banner" role="status">
                  {fallbackNote}
                </div>
              )}

              {/* Pay Button */}
              <button
                className="ck-cta"
                disabled={!canPay}
                onClick={handlePayment}
              >
                {(() => {
                  /* The arrow belongs only on the branches that actually
                     advance the flow — a dead "Sold out" button shouldn't
                     promise a next step. */
                  if (salesClosed) return "Ticket sales have closed";
                  if (tierSoldOut) return "Sold out";
                  const label =
                    ticket?.price > 0
                      ? payMethod === "transfer"
                        ? "Get bank transfer details"
                        : "Proceed to Secure Payment"
                      : "Confirm Free Ticket";
                  return (
                    <>
                      {label} <Icon name="arrowRight" />
                    </>
                  );
                })()}
              </button>

              {!salesClosed && !tierSoldOut && (
                <p className="ck-trust">
                  <Icon name="lock" /> Secured by PAYSTACK
                </p>
              )}
            </div>
          </aside>
        </div>
        )}
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
.ck-error-icon { font-size:40px; margin-bottom:16px; color:var(--warn, #E8C96A); display:flex; justify-content:center; }
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
/* z-index must clear the banner's fade overlay (z-index:2). The -24px
   margin pulls this content up over the banner, and at z-index:1 the
   fade painted ON TOP of the progress nav — which is why the
   Details/Payment/Ticket steps were unreadable against the photo. */
.ck-wrap { max-width:1100px; margin:-24px auto 0; position:relative; z-index:4; padding:0 clamp(16px,5vw,48px) 80px; }

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

/* ── In-app browser notice — informational, not alarming: transfer
      works right here, so this is guidance rather than a dead end ── */
.ck-iab { background:var(--gold-dim); border:1px solid rgba(232,201,106,0.4); border-radius:16px; padding:18px 20px; margin-bottom:20px; }
.ck-iab-head { display:flex; align-items:flex-start; gap:10px; color:var(--text); font-size:14px; line-height:1.45; }
.ck-iab-icon { font-size:18px; line-height:1.2; display:inline-flex; }
/* The chevron rotates rather than swapping glyph — one icon, two states */
.ck-chev-up { transform:rotate(180deg); }
.ck-disc-toggle .ds-icon { transition:transform .2s; }
.ck-iab-body { font-size:13px; color:var(--muted); margin:10px 0 14px; line-height:1.55; }
.ck-iab-body strong { color:var(--text); font-weight:600; }
.ck-iab-copy { width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--border-h); background:transparent; color:var(--muted); font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:border-color .18s ease, color .18s ease; }
.ck-iab-copy:hover { border-color:var(--gold); color:var(--gold); }
@media (max-width:480px) {
  .ck-iab { padding:15px 16px; border-radius:14px; }
}

/* ── Payment method selector ── */
.ck-pm { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.ck-pm-opt { display:flex; align-items:center; gap:10px; text-align:left; padding:13px 14px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--card); color:var(--text); cursor:pointer; transition:border-color .18s, background .18s; min-width:0; }
.ck-pm-opt:hover { border-color:var(--border-h); }
.ck-pm-opt.is-on { border-color:var(--gold); background:var(--gold-dim); }
.ck-pm-icon { font-size:18px; line-height:1; flex-shrink:0; display:inline-flex; }
.ck-pm-text { display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; }
.ck-pm-label { font-size:13.5px; font-weight:600; }
.ck-pm-note { font-size:11px; color:var(--muted); line-height:1.35; }
.ck-pm-tick { color:var(--gold); font-size:10px; flex-shrink:0; }
@media (max-width:380px) {
  .ck-pm { grid-template-columns:1fr; }
}

/* ── Bank transfer instructions ── */
.ck-tr { max-width:560px; margin:0 auto; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,4vw,32px); animation:ckFadeUp .4s ease; }
.ck-tr-title { font-family:var(--font-h); font-size:clamp(19px,3.4vw,26px); font-weight:800; line-height:1.2; letter-spacing:-.02em; margin-bottom:10px; text-wrap:balance; }
.ck-tr-sub { font-size:13.5px; color:var(--muted); line-height:1.65; margin-bottom:20px; }
.ck-tr-card { display:grid; gap:14px; padding:clamp(14px,3vw,20px); border-radius:var(--r-sm); background:var(--card); border:1px solid var(--border); margin-bottom:16px; }
.ck-tr-row { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
.ck-tr-k { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.ck-tr-v { font-size:14px; font-weight:500; text-align:right; overflow-wrap:anywhere; }
.ck-tr-vrow { display:inline-flex; align-items:center; gap:10px; flex-wrap:wrap; }
.ck-tr-acct { display:grid; gap:8px; padding:14px 0; border-top:1px dashed var(--border-h); border-bottom:1px dashed var(--border-h); }
.ck-tr-acctrow { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
/* BIG + selectable — guests read this straight into their bank app */
.ck-tr-num { font-family:var(--font-h); font-weight:800; font-size:clamp(26px,7vw,36px); letter-spacing:.06em; color:var(--gold); font-variant-numeric:tabular-nums; user-select:all; -webkit-user-select:all; overflow-wrap:anywhere; }
.ck-tr-amt { font-family:var(--font-h); font-weight:700; font-size:17px; color:var(--text); font-variant-numeric:tabular-nums; user-select:all; -webkit-user-select:all; }
.ck-tr-copy { padding:8px 14px; border-radius:999px; border:1px solid var(--border-h); background:transparent; color:var(--text); font-family:inherit; font-size:12px; font-weight:600; cursor:pointer; flex-shrink:0; transition:border-color .18s, color .18s; }
.ck-tr-copy:hover { border-color:var(--gold); color:var(--gold); }
.ck-tr-warn { font-size:12.5px; color:var(--muted); line-height:1.6; margin-bottom:12px; }
.ck-tr-warn .ds-icon { color:var(--gold); vertical-align:-0.15em; margin-right:2px; }
.ck-tr-warn strong { color:var(--text); }
.ck-tr-exp { font-size:12.5px; color:var(--muted); margin-bottom:16px; font-variant-numeric:tabular-nums; }
.ck-tr-exp strong { color:var(--gold); }
.ck-tr-exp-done strong, .ck-tr-exp-done { color:var(--danger); }
.ck-tr-wait { display:flex; align-items:center; justify-content:center; gap:9px; padding:14px 16px; border-radius:var(--r-sm); background:rgba(107,240,160,.07); border:1px solid rgba(107,240,160,.28); color:var(--live); font-size:13.5px; font-weight:600; margin-bottom:14px; text-align:center; }
.ck-tr-pulse { width:8px; height:8px; border-radius:50%; background:var(--live); flex-shrink:0; animation:ckPulse 1.4s ease-in-out infinite; }
@keyframes ckPulse { 0%,100% { opacity:.35; transform:scale(.85); } 50% { opacity:1; transform:scale(1.15); } }
.ck-tr-alt { width:100%; padding:12px 16px; border-radius:999px; border:1px solid var(--border); background:transparent; color:var(--muted); font-family:inherit; font-size:13px; cursor:pointer; transition:border-color .18s, color .18s; }
.ck-tr-alt:hover { border-color:var(--border-h); color:var(--text); }

/* ── Sales closed ── */
.ck-closed { padding:16px 18px; border-radius:var(--r-sm); background:rgba(255,255,255,0.04); border:1px solid var(--border-h); margin-bottom:16px; }
.ck-closed-head { display:flex; align-items:center; gap:9px; font-size:14px; color:var(--text); margin-bottom:8px; }
.ck-closed-head .ds-icon { font-size:17px; color:var(--gold); }
.ck-closed-body { font-size:12.5px; color:var(--muted); line-height:1.6; }

/* ── Neutral note (e.g. falling back to card) ── */
.ck-note-banner { padding:12px 16px; border-radius:var(--r-sm); margin-bottom:16px; background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); color:var(--text); font-size:13px; line-height:1.5; }

.ck-selectwrap { position:relative; }
.ck-select { width:100%; padding:14px 40px 14px 16px; appearance:none; -webkit-appearance:none; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; cursor:pointer; transition:border-color .2s, box-shadow .2s; }
.ck-select:hover { border-color:var(--border-h); }
.ck-select:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.ck-select option { background:var(--surface); color:var(--text); }
.ck-caret { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; font-size:12px; }

/* ── Quantity stepper ── */
/* ── Ticket stubs (tier selection) ──
   Replaces the old native <select>: every tier's price, perks and
   remaining stock are readable WITHOUT opening anything, which is the
   whole point when someone is buying against a queue. Perforation +
   notches are pure CSS; the notch circles are clipped in half by the
   card's overflow:hidden, which is what sells the ticket-stub read. */
.ck-tiers { display:grid; gap:10px; }
.ck-tier {
  position:relative; display:flex; align-items:stretch; gap:0;
  width:100%; padding:0; overflow:hidden; cursor:pointer; text-align:left;
  background:var(--card); border:1px solid var(--border);
  border-radius:var(--r-sm); color:var(--text);
  transition:border-color .2s, background .2s, transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s;
}
.ck-tier:hover:not(:disabled) { border-color:var(--border-h); background:rgba(255,255,255,.06); }
.ck-tier:focus-visible { outline:none; border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.ck-tier.is-selected {
  border-color:var(--gold); background:var(--gold-dim);
  transform:translateY(-2px); box-shadow:0 10px 30px rgba(232,201,106,.13);
}
.ck-tier.is-out { opacity:.5; cursor:not-allowed; }

.ck-tier-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:9px; padding:15px 16px; }
.ck-tier-head { display:flex; align-items:center; flex-wrap:wrap; gap:7px; }
.ck-tier-name { font-family:var(--font-h); font-weight:700; font-size:14.5px; color:var(--text); }
.ck-tier-tag {
  font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  color:var(--gold); background:rgba(232,201,106,.13);
  border:1px solid rgba(232,201,106,.3); padding:2px 7px; border-radius:999px;
}
.ck-tier-tag.is-group { color:var(--text); background:rgba(255,255,255,.07); border-color:var(--border-h); }

.ck-tier-stockwrap { display:flex; flex-direction:column; gap:5px; }
.ck-tier-track { height:3px; border-radius:999px; background:rgba(255,255,255,.09); overflow:hidden; }
.ck-tier-fill { display:block; height:100%; border-radius:999px; background:var(--gold); transition:width .4s ease; }
.ck-tier-fill.is-low { background:var(--danger); }
.ck-tier-stock { font-size:11.5px; color:var(--muted); font-variant-numeric:tabular-nums; }
.ck-tier-stock.is-low { color:var(--danger); font-weight:600; }
.ck-tier-stock.is-out { color:var(--danger); font-weight:600; font-size:11.5px; }

/* Right-hand stub: dashed perforation + punched notches */
.ck-tier-stub {
  position:relative; flex-shrink:0; width:104px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
  padding:15px 10px; border-left:1px dashed var(--border-h);
}
.ck-tier.is-selected .ck-tier-stub { border-left-color:rgba(232,201,106,.45); }
.ck-tier-stub::before, .ck-tier-stub::after {
  content:''; position:absolute; left:0; width:13px; height:13px;
  border-radius:50%; background:var(--bg); transform:translate(-50%,-50%);
}
.ck-tier-stub::before { top:0; }
.ck-tier-stub::after { top:100%; }
.ck-tier-price { font-family:var(--font-h); font-weight:800; font-size:15px; color:var(--gold); font-variant-numeric:tabular-nums; }
.ck-tier.is-out .ck-tier-price { color:var(--muted); text-decoration:line-through; }
.ck-tier-was { font-size:11px; color:var(--muted); text-decoration:line-through; }

@media (prefers-reduced-motion:reduce) {
  .ck-tier, .ck-tier-fill { transition:none; }
  .ck-tier.is-selected { transform:none; }
}

.ck-stepper { display:inline-flex; align-items:center; gap:6px; align-self:flex-start; background:var(--card); border:1px solid var(--border); border-radius:999px; padding:5px; }
.ck-step-btn { width:38px; height:38px; border-radius:50%; border:1px solid var(--border); background:transparent; color:var(--text); font-size:18px; line-height:1; display:grid; place-items:center; cursor:pointer; transition:border-color .2s, background .2s, color .2s; }
.ck-step-btn:hover:not(:disabled) { border-color:var(--gold); color:var(--gold); background:var(--gold-dim); }
.ck-step-btn:disabled { opacity:.35; cursor:not-allowed; }
/* stock line under the stepper */
.ck-stock { margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.5; }
.ck-stock.is-low { color:var(--live); font-weight:600; }
.ck-stock.is-out { color:var(--danger); font-weight:600; }
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
