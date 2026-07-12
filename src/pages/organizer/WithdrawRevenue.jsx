/* ═══════════════════════════════════════════════════════════
   WithdrawRevenue.jsx — Tictify 2026 Organizer Ops
   Syne + DM Sans · ink #080910 · gold #E8C96A
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

// Fixed Paystack codes for common digital & commercial banks
const NIGERIAN_BANKS = [
  { code: "", name: "-- Select Bank --" },
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "50211", name: "Kuda Bank" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "999992", name: "OPay (Digital Bank)" }, // Fixed code for Paystack
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "057", name: "Zenith Bank" },
];

/* ── Nav icons (inline, dependency-free) ─────────────────── */
const Ic = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="12" width="8" height="9" rx="2" />
      <rect x="3" y="15" width="8" height="6" rx="2" />
    </svg>
  ),
  create: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14h1M14 20h1M20 20h1v1" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  ),
};

const NAV = [
  { key: "dashboard", label: "Dashboard", to: "/organizer/dashboard", icon: Ic.dashboard },
  { key: "create", label: "Create Event", to: "/organizer/create-event", icon: Ic.create },
  { key: "events", label: "My Events", to: "/organizer/events", icon: Ic.events },
  { key: "sales", label: "Sales", to: "/organizer/sales", icon: Ic.sales },
  { key: "scan", label: "Scan Tickets", to: "/organizer/scan/select", icon: Ic.scan },
  { key: "withdraw", label: "Withdraw", to: "/organizer/withdraw", icon: Ic.wallet },
];

/* ── App shell: sidebar ≥1024px, blurred top bar below ───── */
function Shell({ active, title, subtitle, children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const navButtons = (cls) =>
    NAV.map((item) => (
      <button
        key={item.key}
        className={`${cls} ${active === item.key ? "is-active" : ""}`}
        onClick={() => go(item.to)}
      >
        {item.icon}
        <span>{item.label}</span>
      </button>
    ));

  return (
    <div className="wdr-app">
      <aside className="wdr-sidebar">
        <button className="wdr-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tic<span>tify</span>
        </button>
        <nav className="wdr-nav">{navButtons("wdr-nav-item")}</nav>
      </aside>

      <header className="wdr-topbar">
        <button className="wdr-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tic<span>tify</span>
        </button>
        <button
          className={`wdr-burger ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className={`wdr-drawer ${menuOpen ? "is-open" : ""}`}>
        {navButtons("wdr-drawer-item")}
      </div>

      <main className="wdr-main">
        <div className="wdr-head">
          <h1 className="wdr-title">{title}</h1>
          {subtitle && <p className="wdr-subtitle">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}

export default function WithdrawRevenue() {
  injectStyles("tictify-withdraw-css", CSS);

  // eslint-disable-next-line no-unused-vars -- hook preserved from original page logic (back nav now lives in the shell)
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // OTP confirmation step (opened after a 201 { requiresOtp: true } response)
  const [otpStep, setOtpStep] = useState({
    open: false,
    withdrawalId: null,
    message: "",
  });
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  async function loadBalance() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/organizer`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json();
      setBalance(Number(data?.stats?.walletBalance || 0));
    } catch (err) {
      // Balance fetch failed - keep default 0
    } finally {
      setLoadingBalance(false);
    }
  }

  useEffect(() => {
    loadBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fixed: Ensure the input value is always a clean number string (no commas)
  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    const amountNum = Number(form.amount);

    if (!amountNum || !Number.isInteger(amountNum) || amountNum < 500) {
      return setModal({
        open: true,
        type: "error",
        message: "Minimum withdrawal is ₦500 (whole naira only).",
      });
    }

    if (amountNum > balance) {
      return setModal({
        open: true,
        type: "error",
        message: "Insufficient balance.",
      });
    }

    setLoading(true);
    try {
      const selectedBank = NIGERIAN_BANKS.find((b) => b.code === form.bankCode);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/withdrawals/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            amount: amountNum,
            bankDetails: {
              bankName: selectedBank.name,
              bankCode: form.bankCode,
              accountNumber: form.accountNumber.trim(),
              accountName: form.accountName.trim(),
            },
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Withdrawal failed");

      if (data.requiresOtp) {
        // No money moves yet — the server emailed a 6-digit code.
        // Keep the form filled so a re-request is painless if the code expires.
        setOtp("");
        setOtpError("");
        setOtpStep({
          open: true,
          withdrawalId: data.withdrawalId,
          message:
            data.message || "We sent a 6-digit confirmation code to your email.",
        });
      } else {
        // Legacy path (no OTP required) — original success behavior
        setModal({
          open: true,
          type: "success",
          title: "",
          message: "Payout successful! Funds are arriving now.",
        });
        setBalance((prev) => prev - amountNum);
        setForm({ amount: "", bankCode: "", accountNumber: "", accountName: "" });
      }
    } catch (err) {
      setModal({ open: true, type: "error", title: "", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  function closeOtpStep() {
    setOtpStep({ open: false, withdrawalId: null, message: "" });
    setOtp("");
    setOtpError("");
  }

  async function confirmOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/withdrawals/${otpStep.withdrawalId}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ otp }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || "Confirmation failed. Try again.";
        // Expired code / too many attempts / withdrawal gone → start over
        if (res.status === 404 || /expired|too many attempts/i.test(msg)) {
          closeOtpStep();
          setModal({ open: true, type: "error", title: "", message: msg });
        } else {
          // Wrong code — server message includes attempts left
          setOtpError(msg);
        }
        return;
      }

      closeOtpStep();
      setModal({
        open: true,
        type: "success",
        title:
          data.status === "PAID" ? "Payout on the way! 🎉" : "Withdrawal confirmed",
        message: data.message || "Your withdrawal has been confirmed.",
      });
      setForm({ amount: "", bankCode: "", accountNumber: "", accountName: "" });
      loadBalance();
    } catch (err) {
      setOtpError(err.message || "Something went wrong. Try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <Shell
      active="withdraw"
      title="Withdraw Revenue"
      subtitle="Move your ticket earnings to your Nigerian bank account"
    >
      {(loading || loadingBalance) && (
        <div className="wdr-overlay">
          <div className="wdr-processing">
            <div className="wdr-spinner" />
            <p>Processing...</p>
          </div>
        </div>
      )}

      {modal.open && (
        <div className="wdr-overlay">
          <div className={`wdr-modal ${modal.type === "error" ? "is-error" : "is-success"}`}>
            <div className="wdr-modal-icon" aria-hidden="true">
              {modal.type === "error" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <h3>{modal.title || (modal.type === "error" ? "Error" : "Success")}</h3>
            <p>{modal.message}</p>
            <button
              className="wdr-btn wdr-btn-gold"
              onClick={() => setModal({ ...modal, open: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {otpStep.open && (
        <div className="wdr-overlay">
          <form
            className="wdr-modal is-otp"
            onSubmit={confirmOtp}
            aria-label="Confirm withdrawal with the code from your email"
          >
            <div className="wdr-modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M3.5 7.5l8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Check your email</h3>
            <p>{otpStep.message}</p>
            <input
              className="wdr-input wdr-otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError("");
              }}
              aria-label="6-digit confirmation code"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            {otpError && (
              <p className="wdr-otp-error" role="alert">
                {otpError}
              </p>
            )}
            <button
              type="submit"
              className="wdr-btn wdr-btn-gold wdr-otp-confirm"
              disabled={otpLoading || otp.length !== 6}
            >
              {otpLoading ? "Confirming..." : "Confirm withdrawal"}
            </button>
            <button
              type="button"
              className="wdr-otp-cancel"
              onClick={closeOtpStep}
              disabled={otpLoading}
            >
              Cancel
            </button>
            <p className="wdr-otp-note">
              The code expires in 10 minutes. No money moves without it.
            </p>
          </form>
        </div>
      )}

      <div className="wdr-stage">
        {/* ── Hero balance card ── */}
        <section className="wdr-hero">
          <div className="wdr-hero-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="13" rx="2.5" />
              <path d="M3 10h18M16 15h2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="wdr-hero-label">Available balance</span>
          <span className="wdr-hero-amount">₦{balance.toLocaleString()}</span>
          <span className="wdr-hero-hint">Earnings from all your live and past events</span>
        </section>

        {/* ── Withdrawal form ── */}
        <form className="wdr-card" onSubmit={submit}>
          <label className="wdr-label" htmlFor="wdr-amount">Amount (₦)</label>
          <div className="wdr-amount-wrap">
            <span className="wdr-naira" aria-hidden="true">₦</span>
            <input
              id="wdr-amount"
              className="wdr-input wdr-input-amount"
              type="number" // Stays numeric only
              name="amount"
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={updateField}
              required
            />
          </div>

          {/* Live payout breakdown — bank transfer fee is borne by the organizer
              (₦10 ≤5k · ₦25 ≤50k · ₦50 above — mirrors the server) */}
          {Number(form.amount) >= 500 && (
            <div className="wdr-feebox">
              {(() => {
                const amt = Number(form.amount);
                const fee = amt <= 5000 ? 10 : amt <= 50000 ? 25 : 50;
                return (
                  <>
                    <div className="wdr-feerow">
                      <span>Withdrawal</span>
                      <span>₦{amt.toLocaleString()}</span>
                    </div>
                    <div className="wdr-feerow">
                      <span>Bank transfer fee</span>
                      <span>− ₦{fee}</span>
                    </div>
                    <div className="wdr-feerow is-total">
                      <span>You receive</span>
                      <span>₦{(amt - fee).toLocaleString()}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <label className="wdr-label" htmlFor="wdr-bank">Bank</label>
          <select
            id="wdr-bank"
            className="wdr-input wdr-select"
            name="bankCode"
            value={form.bankCode}
            onChange={updateField}
            required
          >
            {NIGERIAN_BANKS.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>

          <label className="wdr-label" htmlFor="wdr-acct-no">Account Number</label>
          <input
            id="wdr-acct-no"
            className="wdr-input"
            name="accountNumber"
            placeholder="0123456789"
            value={form.accountNumber}
            onChange={updateField}
            required
          />

          <label className="wdr-label" htmlFor="wdr-acct-name">Account Name</label>
          <input
            id="wdr-acct-name"
            className="wdr-input"
            name="accountName"
            placeholder="John Doe"
            value={form.accountName}
            onChange={updateField}
            required
          />

          <button
            className="wdr-btn wdr-btn-gold wdr-cta"
            disabled={loading}
          >
            {loading ? "Processing..." : "Request Withdrawal"}
          </button>

          <p className="wdr-note">
            Withdrawals are typically processed within minutes, but can take up
            to 24 hours depending on your bank.
          </p>
        </form>
      </div>
    </Shell>
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
button, input, select { font-family:var(--font-b); }
button { cursor:pointer; }

@keyframes wdrSpin { to { transform:rotate(360deg); } }
@keyframes wdrFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }

/* ── Shell ── */
.wdr-app { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.wdr-sidebar { position:sticky; top:0; height:100svh; width:250px; flex-shrink:0; background:var(--surface); border-right:1px solid var(--border); padding:26px 16px; display:flex; flex-direction:column; }
.wdr-wordmark { font-family:var(--font-h); font-weight:800; font-size:23px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:2px 12px; }
.wdr-wordmark span { color:var(--gold); }
.wdr-sidebar .wdr-wordmark { margin-bottom:30px; }
.wdr-nav { display:flex; flex-direction:column; gap:4px; }
.wdr-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:11px 14px; background:none; border:none; border-radius:var(--r-sm); color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.wdr-nav-item svg { width:19px; height:19px; flex-shrink:0; }
.wdr-nav-item:hover { color:var(--text); background:var(--card); }
.wdr-nav-item.is-active { color:var(--gold); background:var(--gold-dim); }
.wdr-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

.wdr-topbar { display:none; }
.wdr-burger { display:none; flex-direction:column; justify-content:center; align-items:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:12px; }
.wdr-burger span { display:block; width:18px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.wdr-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.wdr-burger.is-open span:nth-child(2) { opacity:0; }
.wdr-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
.wdr-drawer { display:none; }

.wdr-main { flex:1; min-width:0; padding:clamp(16px,3vw,40px); }
.wdr-head { margin-bottom:clamp(22px,4vw,34px); }
.wdr-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,4vw,34px); letter-spacing:-.02em; }
.wdr-subtitle { color:var(--muted); font-size:14.5px; margin-top:7px; line-height:1.6; }

/* ── Stage ── */
.wdr-stage { max-width:460px; animation:wdrFadeUp .4s ease; }

/* Hero balance card */
.wdr-hero { position:relative; overflow:hidden; background:linear-gradient(145deg, var(--gold-dim), var(--card) 65%); border:1px solid rgba(232,201,106,.32); border-radius:var(--r); padding:clamp(22px,4vw,30px); display:flex; flex-direction:column; gap:6px; margin-bottom:20px; }
.wdr-hero::after { content:''; position:absolute; top:-70px; right:-70px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle, var(--gold-glo), transparent 70%); pointer-events:none; }
.wdr-hero-icon { width:42px; height:42px; border-radius:13px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin-bottom:10px; }
.wdr-hero-icon svg { width:20px; height:20px; }
.wdr-hero-label { font-size:11px; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); }
.wdr-hero-amount { font-family:var(--font-h); font-weight:800; font-size:clamp(30px,6vw,40px); letter-spacing:-.02em; color:var(--gold); font-variant-numeric:tabular-nums; }
.wdr-hero-hint { font-size:12.5px; color:var(--muted); }

/* Form card */
.wdr-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(20px,4vw,28px); }
.wdr-feebox { margin:4px 0 18px; padding:14px 16px; background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); border-radius:var(--r-sm); display:grid; gap:8px; }
.wdr-feerow { display:flex; justify-content:space-between; font-size:13.5px; color:var(--muted); }
.wdr-feerow span:last-child { font-variant-numeric:tabular-nums; }
.wdr-feerow.is-total { border-top:1px dashed rgba(232,201,106,.35); padding-top:8px; color:var(--text); font-weight:700; }
.wdr-feerow.is-total span:last-child { color:var(--gold); font-family:var(--font-h); font-size:15px; }
.wdr-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.wdr-input { width:100%; padding:14px 16px; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; margin-bottom:18px; outline:none; transition:border-color .2s, box-shadow .2s; }
.wdr-input::placeholder { color:var(--muted); }
.wdr-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
.wdr-select { appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='%238B887E' stroke-width='1.6' stroke-linecap='round'/></svg>"); background-repeat:no-repeat; background-position:right 16px center; padding-right:40px; }
.wdr-select option { background:var(--surface); color:var(--text); }
.wdr-amount-wrap { position:relative; }
.wdr-naira { position:absolute; left:16px; top:14px; color:var(--gold); font-weight:700; font-size:14px; pointer-events:none; }
.wdr-input-amount { padding-left:34px; font-variant-numeric:tabular-nums; }

.wdr-btn { padding:14px 26px; border-radius:999px; border:1px solid transparent; font-weight:700; font-size:14.5px; transition:transform .25s, box-shadow .25s, opacity .2s; }
.wdr-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); }
.wdr-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }
.wdr-btn-gold:disabled { opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }
.wdr-cta { width:100%; margin-top:4px; }
.wdr-note { margin-top:14px; font-size:12.5px; color:var(--muted); line-height:1.6; text-align:center; }

/* ── Overlays / modal ── */
.wdr-overlay { position:fixed; inset:0; background:rgba(8,9,16,.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); display:grid; place-items:center; z-index:2000; padding:20px; }
.wdr-processing { text-align:center; color:var(--text); font-family:var(--font-h); font-weight:600; }
.wdr-processing p { margin-top:16px; }
.wdr-spinner { width:44px; height:44px; margin:0 auto; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:wdrSpin 1s linear infinite; }

.wdr-modal { width:min(100%,360px); background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,36px); text-align:center; animation:wdrFadeUp .3s ease; }
.wdr-modal.is-success { border-color:rgba(107,240,160,.35); background:linear-gradient(180deg, rgba(107,240,160,.1), var(--surface) 60%); }
.wdr-modal.is-error { border-color:rgba(224,92,92,.35); background:linear-gradient(180deg, rgba(224,92,92,.1), var(--surface) 60%); }
.wdr-modal-icon { width:52px; height:52px; margin:0 auto 16px; border-radius:50%; display:grid; place-items:center; }
.wdr-modal-icon svg { width:24px; height:24px; }
.wdr-modal.is-success .wdr-modal-icon { background:rgba(107,240,160,.14); color:var(--live); }
.wdr-modal.is-error .wdr-modal-icon { background:rgba(224,92,92,.14); color:var(--danger); }
.wdr-modal h3 { font-family:var(--font-h); font-weight:700; font-size:18px; margin-bottom:10px; }
.wdr-modal.is-success h3 { color:var(--live); }
.wdr-modal.is-error h3 { color:var(--danger); }
.wdr-modal p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; overflow-wrap:anywhere; }
.wdr-modal .wdr-btn { width:100%; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .wdr-app { display:block; }
  .wdr-sidebar { display:none; }
  .wdr-topbar { position:sticky; top:0; z-index:900; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 16px; background:rgba(8,9,16,.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .wdr-burger { display:flex; }
  .wdr-drawer { display:flex; flex-direction:column; gap:2px; position:fixed; inset:60px 0 0 0; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,5vw,32px); z-index:899; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .3s, transform .3s; }
  .wdr-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .wdr-drawer-item { display:flex; align-items:center; gap:14px; background:none; border:none; border-bottom:1px solid var(--border); color:var(--text); font-family:var(--font-h); font-size:17px; font-weight:600; text-align:left; padding:18px 4px; }
  .wdr-drawer-item svg { width:20px; height:20px; color:var(--muted); }
  .wdr-drawer-item.is-active { color:var(--gold); }
  .wdr-drawer-item.is-active svg { color:var(--gold); }
  .wdr-stage { margin:0 auto; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition:none !important; }
  .wdr-spinner { animation:wdrSpin 1s linear infinite !important; }
}

/* ── OTP confirmation step ── */
.wdr-modal.is-otp { border-color:rgba(232,201,106,.38); background:linear-gradient(180deg, rgba(232,201,106,.09), var(--surface) 60%); }
.wdr-modal.is-otp h3 { color:var(--gold); }
.wdr-modal.is-otp .wdr-modal-icon { background:var(--gold-dim); color:var(--gold); }
.wdr-modal.is-otp .wdr-otp-input { display:block; width:100%; max-width:260px; margin:0 auto 16px; padding:14px 10px; text-align:center; font-family:var(--font-h); font-weight:700; font-size:clamp(22px,7vw,28px); letter-spacing:.35em; text-indent:.35em; font-variant-numeric:tabular-nums; }
.wdr-modal.is-otp .wdr-otp-input::placeholder { color:rgba(139,136,126,.45); letter-spacing:.35em; }
.wdr-modal .wdr-otp-error { margin:-2px 0 16px; padding:10px 14px; background:rgba(224,92,92,.12); border:1px solid rgba(224,92,92,.3); border-radius:var(--r-sm); color:var(--danger); font-size:13px; line-height:1.5; overflow-wrap:anywhere; }
.wdr-otp-confirm { width:100%; }
.wdr-otp-cancel { width:100%; margin-top:10px; padding:8px; background:none; border:none; color:var(--muted); font-size:13.5px; font-weight:500; transition:color .2s; }
.wdr-otp-cancel:hover { color:var(--text); }
.wdr-otp-cancel:disabled { opacity:.5; cursor:not-allowed; }
.wdr-modal .wdr-otp-note { margin:14px 0 0; font-size:12.5px; color:var(--muted); line-height:1.6; }
`;
