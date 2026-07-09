/* ═══════════════════════════════════════════════════════════
   CampusAmbassadors.jsx — Tictify 2026 Campus Partners
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useState } from "react";
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
  coins: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  ),
  book: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path
        d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z"
        strokeLinejoin="round"
      />
      <path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5" strokeLinejoin="round" />
      <path d="M9 8h7M9 11.5h5" strokeLinecap="round" />
    </svg>
  ),
  trophy: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M8 4h8v5a4 4 0 01-8 0V4z" strokeLinejoin="round" />
      <path d="M8 5H5a3 3 0 003 4M16 5h3a3 3 0 01-3 4" strokeLinecap="round" />
      <path d="M12 13v4M8.5 20h7M10 17h4" strokeLinecap="round" />
    </svg>
  ),
  network: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14.5c2.4.5 4 2.7 4 5.5" strokeLinecap="round" />
    </svg>
  ),
  badge: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9.5 13.5L8 21l4-2.2L16 21l-1.5-7.5" strokeLinejoin="round" />
      <path
        d="M10 9l1.5 1.5L14.5 7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  case: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path
        d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M3 12h18"
        strokeLinecap="round"
      />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M8.5 12.5l2.5 2.5 4.5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const BENEFITS = [
  {
    icon: Ic.coins,
    title: "Earn commissions",
    text: "Get paid for every event organizer you onboard to Tictify.",
  },
  {
    icon: Ic.book,
    title: "Exclusive training",
    text: "Hands-on training in sales, marketing and event management.",
  },
  {
    icon: Ic.trophy,
    title: "Bonuses & rewards",
    text: "Bonuses, rewards and recognition for top-performing partners.",
  },
  {
    icon: Ic.network,
    title: "Build your network",
    text: "Grow your network and gain real-world professional experience.",
  },
  {
    icon: Ic.badge,
    title: "Certificate & merch",
    text: "Official Tictify certificate and branded merch for partners.",
  },
  {
    icon: Ic.case,
    title: "Career opportunities",
    text: "Chances at internships and paid opportunities with Tictify.",
  },
];

const CHIPS = [
  "Students",
  "Leaders",
  "Event Enthusiasts",
  "Influencers & Content Creators",
];

const LEVELS = ["100L", "200L", "300L", "400L", "500L", "600L", "Postgrad"];

/* ── Slim public header ──────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  return (
    <header className="ca-header">
      <div className="ca-container ca-nav">
        <img
          src={logo}
          alt="Tictify"
          className="ca-logo"
          onClick={() => navigate("/")}
        />
        <nav className="ca-nav-links" aria-label="Primary">
          <button
            className="ca-link ca-hide-sm"
            onClick={() => navigate("/events")}
          >
            Events
          </button>
          <button
            className="ca-btn ca-btn-ghost"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="ca-btn ca-btn-gold"
            onClick={() => navigate("/register")}
          >
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
    <footer className="ca-footer">
      <div className="ca-container">
        <p>© {new Date().getFullYear()} Tictify. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ── Application form ────────────────────────────────────── */
const EMPTY_FORM = {
  fullName: "",
  email: "",
  university: "",
  department: "",
  level: "",
  whatsapp: "",
  socials: "",
  motivation: "",
  organizersKnown: "",
  organizationsCount: "",
};

function ApplicationForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const motivationOk = form.motivation.trim().length >= 20;
  const canSubmit =
    form.fullName.trim() &&
    emailValid &&
    form.university.trim() &&
    form.whatsapp.trim() &&
    motivationOk &&
    !sending;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ambassadors/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            university: form.university.trim(),
            department: form.department.trim(),
            level: form.level,
            whatsapp: form.whatsapp.trim(),
            socials: form.socials.trim(),
            motivation: form.motivation.trim(),
            organizersKnown: Number(form.organizersKnown) || 0,
            organizationsCount: Number(form.organizationsCount) || 0,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setSuccessMsg(
          data.message ||
            "Application received! We'll review it and get back to you by email.",
        );
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  if (successMsg) {
    return (
      <div className="ca-form-card ca-success" role="status">
        <div className="ca-success-icon" aria-hidden="true">
          {Ic.check}
        </div>
        <h3 className="ca-form-title">Application received!</h3>
        <p className="ca-success-msg">{successMsg}</p>
        <div className="ca-next">
          <h4 className="ca-next-title">What happens next</h4>
          <ol className="ca-next-list">
            <li>
              <span className="ca-next-num">1</span>
              We review your application.
            </li>
            <li>
              <span className="ca-next-num">2</span>
              We may reach out on WhatsApp for a quick chat.
            </li>
            <li>
              <span className="ca-next-num">3</span>
              If accepted, you get an email with your account &amp; invite code.
            </li>
            <li>
              <span className="ca-next-num">4</span>
              You get trained — then start earning.
            </li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="ca-form-card" id="apply">
      <h3 className="ca-form-title">Apply to become a Campus Partner</h3>
      <p className="ca-form-sub">
        Takes about 2 minutes. We review every application.
      </p>

      <form className="ca-form" onSubmit={handleSubmit}>
        <div>
          <label className="ca-label" htmlFor="ca-fullName">
            Full name *
          </label>
          <input
            id="ca-fullName"
            className="ca-input"
            type="text"
            placeholder="Jane Doe"
            value={form.fullName}
            onChange={set("fullName")}
            required
          />
        </div>

        <div>
          <label className="ca-label" htmlFor="ca-email">
            Email *
          </label>
          <input
            id="ca-email"
            className="ca-input"
            type="email"
            placeholder="gabriel@tictify.ng"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
            required
          />
          {form.email && !emailValid && (
            <p className="ca-field-err">Please enter a valid email address</p>
          )}
        </div>

        <div>
          <label className="ca-label" htmlFor="ca-university">
            University *
          </label>
          <input
            id="ca-university"
            className="ca-input"
            type="text"
            placeholder="e.g. University of Lagos"
            value={form.university}
            onChange={set("university")}
            required
          />
        </div>

        <div className="ca-form-row">
          <div>
            <label className="ca-label" htmlFor="ca-department">
              Department
            </label>
            <input
              id="ca-department"
              className="ca-input"
              type="text"
              placeholder="e.g. Computer Science"
              value={form.department}
              onChange={set("department")}
            />
          </div>
          <div>
            <label className="ca-label" htmlFor="ca-level">
              Level
            </label>
            <select
              id="ca-level"
              className="ca-input ca-select"
              value={form.level}
              onChange={set("level")}
            >
              <option value="">Select level</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="ca-label" htmlFor="ca-whatsapp">
            WhatsApp number *
          </label>
          <input
            id="ca-whatsapp"
            className="ca-input"
            type="tel"
            placeholder="e.g. 0803 123 4567"
            value={form.whatsapp}
            onChange={set("whatsapp")}
            required
          />
        </div>

        <div>
          <label className="ca-label" htmlFor="ca-socials">
            Social media links
          </label>
          <textarea
            id="ca-socials"
            className="ca-input ca-textarea"
            rows={3}
            placeholder="Instagram, TikTok, X — one per line"
            value={form.socials}
            onChange={set("socials")}
          />
        </div>

        <div>
          <div className="ca-label-row">
            <label className="ca-label" htmlFor="ca-motivation">
              Why do you want to join? *
            </label>
            <span
              className={`ca-counter ${motivationOk ? "is-ok" : ""}`}
              aria-live="polite"
            >
              {form.motivation.trim().length}/20 min
            </span>
          </div>
          <textarea
            id="ca-motivation"
            className="ca-input ca-textarea"
            rows={4}
            placeholder="Tell us why you'd make a great Campus Partner…"
            value={form.motivation}
            onChange={set("motivation")}
            required
          />
        </div>

        <div className="ca-form-row">
          <div>
            <label className="ca-label" htmlFor="ca-organizersKnown">
              Event organizers you know
            </label>
            <input
              id="ca-organizersKnown"
              className="ca-input"
              type="number"
              min="0"
              placeholder="0"
              value={form.organizersKnown}
              onChange={set("organizersKnown")}
            />
          </div>
          <div>
            <label className="ca-label" htmlFor="ca-organizationsCount">
              Campus organizations you belong to
            </label>
            <input
              id="ca-organizationsCount"
              className="ca-input"
              type="number"
              min="0"
              placeholder="0"
              value={form.organizationsCount}
              onChange={set("organizationsCount")}
            />
          </div>
        </div>

        {error && <div className="ca-error">{error}</div>}

        <button type="submit" className="ca-cta" disabled={!canSubmit}>
          {sending ? "Submitting…" : "Apply now →"}
        </button>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function CampusAmbassadors() {
  injectStyles("tictify-ambassadors-css", CSS);

  return (
    <div className="ca-page">
      <Header />

      <main>
        {/* Hero */}
        <section className="ca-hero">
          <div className="ca-hero-glow" aria-hidden="true" />
          <div className="ca-container ca-hero-inner">
            <p className="ca-eyebrow">Tictify Campus Partners</p>
            <h1 className="ca-h1">
              Be the face of Tictify <em>on your campus</em>
            </h1>
            <p className="ca-sub">
              A network of student leaders across Nigeria helping organizers
              create, promote and sell out events — while earning commissions
              and building real-world experience.
            </p>
            <a href="#apply" className="ca-btn ca-btn-gold ca-btn-lg">
              Apply now →
            </a>
          </div>
        </section>

        {/* Benefits */}
        <section className="ca-section">
          <div className="ca-container">
            <h2 className="ca-h2">As a Campus Partner you will</h2>
            <div className="ca-grid">
              {BENEFITS.map((b) => (
                <div className="ca-card" key={b.title}>
                  <div className="ca-card-icon">{b.icon}</div>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who can apply */}
        <section className="ca-section ca-section-alt">
          <div className="ca-container">
            <h2 className="ca-h2">Who can apply?</h2>
            <div className="ca-chips">
              {CHIPS.map((c) => (
                <span className="ca-chip" key={c}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Application */}
        <section className="ca-section">
          <div className="ca-container ca-form-wrap">
            <ApplicationForm />
          </div>
        </section>
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
html { scroll-behavior:smooth; }
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
button { font-family:var(--font-b); cursor:pointer; }
input, select, textarea { font-family:var(--font-b); outline:none; }
img { display:block; }

@keyframes caFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes caGlow { 0%,100%{opacity:.55} 50%{opacity:1} }

.ca-page { min-height:100svh; background:var(--bg); font-family:var(--font-b); display:flex; flex-direction:column; }
.ca-container { width:100%; max-width:1100px; margin:0 auto; padding:0 clamp(16px,4.5vw,32px); }

/* ── Buttons ── */
.ca-btn { display:inline-block; text-decoration:none; text-align:center; border-radius:999px; font-weight:600; font-size:13.5px; padding:9px 18px; border:1px solid transparent; transition:transform .25s, box-shadow .25s, border-color .25s, background .25s; white-space:nowrap; }
.ca-btn-lg { padding:15px 30px; font-size:15.5px; }
.ca-btn-gold { background:var(--gold); color:#080910; }
.ca-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.ca-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.ca-btn-ghost:hover { border-color:var(--border-h); transform:translateY(-2px); }

/* ── Header ── */
.ca-header { position:sticky; top:0; z-index:100; background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.ca-nav { height:64px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
.ca-logo { height:30px; cursor:pointer; }
.ca-nav-links { display:flex; align-items:center; gap:8px; }
.ca-link { background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:8px 14px; border-radius:999px; transition:color .25s, background .25s; }
.ca-link:hover { color:var(--text); background:var(--card); }

/* ── Hero ── */
.ca-hero { position:relative; padding:clamp(56px,10vw,110px) 0 clamp(36px,6vw,64px); }
.ca-hero-inner { display:flex; flex-direction:column; align-items:center; text-align:center; }
.ca-hero-glow { position:absolute; top:-160px; left:50%; transform:translateX(-50%); width:min(680px,90vw); height:420px; background:radial-gradient(ellipse at center, var(--gold-dim), transparent 65%); pointer-events:none; animation:caGlow 7s ease-in-out infinite; }
.ca-eyebrow { color:var(--gold); font-size:12.5px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; }
.ca-h1 { font-family:var(--font-h); font-weight:800; font-size:clamp(28px,7vw,62px); line-height:1.08; letter-spacing:-.02em; margin:18px auto 0; max-width:min(780px,100%); text-wrap:balance; }
.ca-h1 em { font-style:normal; color:var(--gold); }
.ca-sub { color:var(--muted); font-size:clamp(15px,2vw,18px); line-height:1.65; max-width:600px; margin:20px auto 0; }
.ca-hero .ca-btn-lg { margin-top:32px; }

/* ── Sections ── */
.ca-section { padding:clamp(48px,7vw,88px) 0; }
.ca-section-alt { background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.ca-h2 { font-family:var(--font-h); font-weight:700; font-size:clamp(23px,4vw,36px); letter-spacing:-.01em; line-height:1.15; text-align:center; text-wrap:balance; margin:0 auto clamp(28px,4.5vw,44px); max-width:620px; }

/* ── Benefit grid ── */
.ca-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr)); gap:clamp(14px,2.4vw,22px); }
.ca-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,3vw,28px); height:100%; transition:transform .3s, border-color .3s; }
.ca-card:hover { transform:translateY(-4px); border-color:var(--border-h); }
.ca-card-icon { width:44px; height:44px; border-radius:13px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin-bottom:16px; }
.ca-card-icon svg { width:21px; height:21px; }
.ca-card h3 { font-family:var(--font-h); font-size:16.5px; font-weight:700; margin-bottom:9px; }
.ca-card p { color:var(--muted); font-size:14px; line-height:1.65; }

/* ── Chips ── */
.ca-chips { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
.ca-chip { background:var(--card); border:1px solid var(--border); color:var(--text); font-size:14px; font-weight:600; padding:11px 22px; border-radius:999px; transition:border-color .25s, color .25s; }
.ca-chip:hover { border-color:rgba(232,201,106,.45); color:var(--gold); }

/* ── Form card ── */
.ca-form-wrap { display:flex; justify-content:center; }
.ca-form-card { width:min(100%,560px); background:rgba(255,255,255,0.035); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,40px); animation:caFadeUp .45s ease both; scroll-margin-top:88px; }
.ca-form-title { font-family:var(--font-h); font-weight:800; font-size:clamp(20px,4.5vw,25px); letter-spacing:-.02em; line-height:1.2; margin-bottom:8px; text-wrap:balance; }
.ca-form-sub { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:26px; }
.ca-form { display:flex; flex-direction:column; gap:16px; }
.ca-form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.ca-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.ca-label-row { display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
.ca-counter { font-size:11px; color:var(--muted); font-variant-numeric:tabular-nums; }
.ca-counter.is-ok { color:var(--live); }
.ca-input { width:100%; padding:13px 15px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.ca-input::placeholder { color:var(--muted); opacity:.7; }
.ca-input:hover { border-color:var(--border-h); }
.ca-input:focus { border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.ca-select { appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%238B887E' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 15px center; padding-right:38px; cursor:pointer; }
.ca-select option { background:var(--surface); color:var(--text); }
.ca-textarea { resize:vertical; min-height:78px; line-height:1.55; }
.ca-field-err { font-size:11px; color:var(--danger); margin-top:6px; }
.ca-error { padding:12px 16px; border-radius:var(--r-sm); background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.3); color:var(--danger); font-size:13px; line-height:1.5; }
.ca-cta { width:100%; margin-top:4px; padding:16px 24px; border-radius:999px; border:none; background:var(--gold); color:#080910; font-family:var(--font-h); font-weight:700; font-size:15px; transition:transform .2s, box-shadow .2s, background .2s, color .2s; }
.ca-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.ca-cta:disabled { background:rgba(255,255,255,0.08); color:var(--muted); cursor:not-allowed; }

/* ── Success panel ── */
.ca-success { text-align:center; }
.ca-success-icon { width:64px; height:64px; margin:0 auto 18px; border-radius:50%; background:rgba(107,240,160,.12); border:1px solid rgba(107,240,160,.35); color:var(--live); display:grid; place-items:center; }
.ca-success-icon svg { width:30px; height:30px; }
.ca-success-msg { color:var(--muted); font-size:14.5px; line-height:1.7; margin-bottom:26px; }
.ca-next { text-align:left; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:clamp(16px,3.5vw,24px); }
.ca-next-title { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); margin-bottom:14px; }
.ca-next-list { list-style:none; display:flex; flex-direction:column; gap:12px; }
.ca-next-list li { display:flex; align-items:flex-start; gap:12px; color:var(--muted); font-size:14px; line-height:1.55; }
.ca-next-num { flex:0 0 auto; width:24px; height:24px; border-radius:50%; border:1px dashed rgba(232,201,106,.5); color:var(--gold); font-family:var(--font-h); font-weight:700; font-size:12px; display:grid; place-items:center; }

/* ── Footer ── */
.ca-footer { margin-top:auto; border-top:1px solid var(--border); padding:22px 0; }
.ca-footer p { font-size:13px; color:var(--muted); text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 768px) {
  .ca-hide-sm { display:none; }
}
@media (max-width: 560px) {
  .ca-form-row { grid-template-columns:1fr; gap:16px; }
}
@media (max-width: 480px) {
  .ca-nav { height:56px; }
  .ca-logo { height:26px; }
  .ca-btn { padding:8px 14px; font-size:13px; }
  .ca-btn-lg { padding:14px 24px; font-size:15px; }
  .ca-input { font-size:16px; }   /* prevents iOS focus zoom */
  .ca-cta { padding:15px 20px; }
  .ca-chip { flex:1 1 auto; text-align:center; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
  .ca-form-card { opacity:1; transform:none; }
}
`;
