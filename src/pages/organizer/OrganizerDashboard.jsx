/* ═══════════════════════════════════════════════════════════
   OrganizerDashboard.jsx — Tictify 2026 Organizer Console
   Syne + DM Sans · ink #080910 · gold #E8C96A
   UI overhaul only — data / 15s polling / auth logic preserved.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState, useRef, useCallback } from "react";
import { fetchOrganizerDashboard } from "../../services/dashboardService";
import { getToken, getUser, logout, updateProfile } from "../../services/authService";
import { normalizeWhatsApp, formatWhatsApp } from "../../utils/phone";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Helpers ─────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function fmtMoney(n) {
  if (typeof n !== "number" || isNaN(n)) return "₦0";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n.toLocaleString()}`;
}

/* ── Eye Icons ───────────────────────────────────────────────── */
const EyeIcon = () => (
  <Icon name="eye" />
);
const EyeOffIcon = () => (
  <Icon name="eyeOff" />
);

/* ── Shell nav icons (inline, dependency-free) ───────────────── */
const NavIc = {
  dashboard: (
    <Icon name="grid" />
  ),
  create: (
    <Icon name="plusCircle" />
  ),
  events: (
    <Icon name="calendar" />
  ),
  sales: (
    <Icon name="bars" />
  ),
  scan: (
    <Icon name="qr" />
  ),
  withdraw: (
    <Icon name="wallet" />
  ),
  users: (
    <Icon name="users" />
  ),
  logout: (
    <Icon name="signOut" />
  ),
};

const NAV_ITEMS = [
  { label: "Dashboard", path: "/organizer/dashboard", icon: NavIc.dashboard },
  { label: "Create Event", path: "/organizer/create-event", icon: NavIc.create },
  { label: "Referrals", path: "/organizer/referrals", icon: NavIc.users },
  { label: "Insights", path: "/organizer/insights", icon: NavIc.sales },
  { label: "My Events", path: "/organizer/events", icon: NavIc.events },
  { label: "Sales", path: "/organizer/sales", icon: NavIc.sales },
  { label: "Scan Tickets", path: "/organizer/scan/select", icon: NavIc.scan },
  { label: "Withdraw", path: "/organizer/withdraw", icon: NavIc.withdraw },
];

/* ── App shell: sidebar ≥1024px, top bar + drawer below ──────── */
function Shell({ active, onLogout, children }) {
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

  const navButtons = NAV_ITEMS.map((item) => (
    <button
      key={item.path}
      className={`odb-nav-item ${active === item.path ? "is-active" : ""}`}
      onClick={() => go(item.path)}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </button>
  ));

  return (
    <div className="odb-shell">
      <aside className="odb-side">
        <button className="odb-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tictify<em>.</em>
        </button>
        <nav className="odb-nav">{navButtons}</nav>
        {onLogout && (
          <button className="odb-logout" onClick={onLogout}>
            {NavIc.logout}
            <span>Logout</span>
          </button>
        )}
      </aside>

      <div className="odb-body">
        <div className="odb-topbar">
          <button className="odb-wordmark" onClick={() => go("/organizer/dashboard")}>
            Tictify<em>.</em>
          </button>
          <button
            className={`odb-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`odb-drawer ${menuOpen ? "is-open" : ""}`}>
          <nav className="odb-nav">{navButtons}</nav>
          {onLogout && (
            <button className="odb-logout" onClick={onLogout}>
              {NavIc.logout}
              <span>Logout</span>
            </button>
          )}
        </div>

        <main className="odb-main">{children}</main>
      </div>
    </div>
  );
}

/* ── Safe defaults ───────────────────────────────────────────── */
const EMPTY = {
  organizer: { name: "", email: "", avatar: null },
  stats: {
    walletBalance: 0,
    totalEarnings: 0,
    events: 0,
    ticketsSold: 0,
    revenue: 0,
    upcoming: 0,
    live: 0,
  },
  events: [],
};

/* ── Normalize API response defensively ─────────────────────── */
// Guarantees every number field is actually a number, never undefined/null
function normalizeStats(raw) {
  const s = raw ?? {};
  return {
    walletBalance: Number(s.walletBalance) || 0,
    totalEarnings: Number(s.totalEarnings) || 0,
    events: Number(s.events) || 0,
    ticketsSold: Number(s.ticketsSold) || 0,
    revenue: Number(s.revenue) || 0,
    upcoming: Number(s.upcoming) || 0,
    live: Number(s.live) || 0,
  };
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
export default function OrganizerDashboard() {
  injectStyles("tictify-odb-css", CSS);

  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const prevBalanceRef = useRef(null);

  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    message: "",
    isAuth: false,
  });

  /* Whether the stored session already has a WhatsApp number. Seeded
     from localStorage (login/verify persist it) so the banner decides
     on first paint instead of flashing in after a round trip.
     `?? null` keeps a genuinely absent number distinguishable from an
     old session persisted before the field existed. */
  const [whatsapp, setWhatsapp] = useState(() => getUser()?.whatsapp ?? null);

  const loadDashboard = useCallback(async () => {
    try {
      // ✅ Service handles token internally — no need to pass it
      const res = await fetchOrganizerDashboard();

      // ✅ Log response in dev so you can verify what backend returns
      if (import.meta.env.DEV) {
        console.log("📊 Dashboard response:", res);
      }

      setData((prev) => {
        prevBalanceRef.current = prev.stats.walletBalance;
        return {
          organizer: {
            name: res?.organizer?.name ?? "",
            email: res?.organizer?.email ?? "",
            avatar: res?.organizer?.avatar ?? null,
          },
          // ✅ normalizeStats ensures walletBalance is ALWAYS a number
          stats: normalizeStats(res?.stats),
          events: Array.isArray(res?.events) ? res.events : [],
        };
      });

      /* The server is the authority on whether a number is on file —
         the stored session predates this field for anyone who was
         already logged in. `undefined` means an older backend that
         doesn't send it yet; leave the seeded value alone there
         rather than showing the banner to everyone. */
      if (res?.organizer?.whatsapp !== undefined) {
        setWhatsapp(res.organizer.whatsapp);
      }
    } catch (err) {
      // ✅ Only stop polling + show modal for AUTH errors
      // For network blips, silently retry on next poll interval
      if (err?.type === "AUTH") {
        clearInterval(pollingRef.current);
        setModal({
          open: true,
          isAuth: true,
          message:
            err.message || "Your session has expired. Please login again.",
        });
      }
      // Non-auth error (network/server) — silently retry on next poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    pollingRef.current = setInterval(loadDashboard, 15_000);
    return () => clearInterval(pollingRef.current);
  }, [loadDashboard]);

  function handleLogout() {
    clearInterval(pollingRef.current);
    logout();
    navigate("/login", { replace: true });
  }

  const { organizer, stats, events } = data;

  return (
    <Shell
      active="/organizer/dashboard"
      onLogout={getToken() ? handleLogout : undefined}
    >
      {modal.open && (
        <Modal
          message={modal.message}
          onConfirm={
            modal.isAuth
              ? handleLogout
              : () => setModal({ open: false, message: "", isAuth: false })
          }
          isAuth={modal.isAuth}
        />
      )}

      {loading ? (
        <DashSkeleton />
      ) : (
        <>
          {/* ── HEADER ── */}
          <header className="odb-head">
            <div className="odb-head-id">
              <div className="odb-avatar">
                {organizer.avatar ? (
                  <img src={organizer.avatar} alt={organizer.name} />
                ) : (
                  <span>{initials(organizer.name)}</span>
                )}
              </div>
              <div>
                <h1 className="odb-title">
                  {getGreeting()},{" "}
                  <strong>{organizer.name || "…"}</strong> 👋
                </h1>
                <p className="odb-sub">{organizer.email}</p>
              </div>
            </div>
            <button
              className="odb-btn odb-btn-gold"
              onClick={() => navigate("/organizer/create-event")}
            >
              + Create Event
            </button>
          </header>

          {/* Gates event creation and withdrawals — shown until resolved */}
          {!whatsapp && (
            <WhatsAppBanner
              onSaved={(user) => setWhatsapp(user?.whatsapp || null)}
            />
          )}

          {/* ── WALLET HERO ── */}
          <WalletCard
            balance={stats.walletBalance}
            prevBalance={prevBalanceRef.current}
          />

          {/* ── KPI GRID ── */}
          <section className="odb-kpis" aria-label="Key stats">
            <StatCard
              label="Wallet Balance"
              value={fmtMoney(stats.walletBalance)}
              accent
            />
            <StatCard
              label="Total Earnings"
              value={fmtMoney(stats.totalEarnings)}
            />
            <StatCard label="Revenue" value={fmtMoney(stats.revenue)} />
            <StatCard
              label="Tickets Sold"
              value={stats.ticketsSold.toLocaleString()}
            />
            <StatCard label="Total Events" value={stats.events} />
            <StatCard label="Upcoming Events" value={stats.upcoming} />
            <StatCard label="Live Now" value={stats.live} accent />
          </section>

          {/* ── QUICK ACTIONS ── */}
          <section className="odb-section">
            <h2 className="odb-section-title">Quick actions</h2>
            <div className="odb-actions">
              {[
                {
                  title: "My Events",
                  desc: "Create & manage events",
                  path: "/organizer/events",
                },
                {
                  title: "Ticket Sales",
                  desc: "Track ticket revenue",
                  path: "/organizer/sales",
                },
                {
                  title: "Scan Tickets",
                  desc: "Admit guests at venue",
                  path: "/organizer/scan/select",
                },
                {
                  title: "Event Stats",
                  desc: "Detailed analytics",
                  path: "/organizer/stats",
                },
                {
                  title: "Withdraw",
                  desc: "Transfer earnings",
                  path: "/organizer/withdraw",
                },
              ].map(({ title, desc, path }) => (
                <ActionCard
                  key={title}
                  title={title}
                  desc={desc}
                  onClick={() => navigate(path)}
                />
              ))}
              <ActionCard
                icon="bell"
                title="Sale Alerts"
                desc="Push alert per ticket sold"
                onClick={async () => {
                  const [{ subscribeToPush }, { getToken }] = await Promise.all([
                    import("../../services/pushService.js"),
                    import("../../services/authService.js"),
                  ]);
                  const result = await subscribeToPush("sales", getToken());
                  setModal({
                    open: true,
                    isAuth: false,
                    message: result.message,
                  });
                }}
              />
            </div>
          </section>

          {/* ── EVENTS ── */}
          <section className="odb-section">
            <div className="odb-section-head">
              <h2 className="odb-section-title">Recent Events</h2>
            </div>

            {events.length === 0 ? (
              <div className="odb-empty">
                <p className="odb-empty-icon"><Icon name="calendar" /></p>
                <p className="odb-empty-text">No events created yet.</p>
                <button
                  className="odb-btn odb-btn-gold"
                  onClick={() => navigate("/organizer/create-event")}
                >
                  Create your first event
                </button>
              </div>
            ) : (
              <div className="odb-events">
                {events.map((event) => (
                  <EventRow
                    key={event._id}
                    event={event}
                    onView={() =>
                      navigate(`/organizer/stats?eventId=${event._id}`)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </Shell>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */
function WalletCard({ balance, prevBalance }) {
  const [visible, setVisible] = useState(true);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (
      prevBalance === null ||
      prevBalance === undefined ||
      balance === prevBalance
    )
      return;
    setFlash(balance > prevBalance ? "up" : "down");
    const t = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(t);
  }, [balance, prevBalance]);

  const flashColor =
    flash === "up"
      ? "var(--live)"
      : flash === "down"
        ? "var(--danger)"
        : "var(--text)";

  return (
    <section className="odb-wallet">
      <div className="odb-wallet-top">
        <span className="odb-wallet-label">Wallet Balance</span>
        <span className="odb-live-pill">
          <span className="odb-live-dot" />
          LIVE
        </span>
      </div>
      <div className="odb-wallet-bottom">
        <strong
          className="odb-wallet-value"
          style={{ color: flashColor, transition: "color 0.4s" }}
        >
          {visible ? fmtMoney(balance) : "••••••"}
        </strong>
        <button
          className="odb-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide balance" : "Show balance"}
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>
      <p className="odb-wallet-note">Auto-refreshes every 15 seconds</p>
    </section>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="odb-kpi">
      <p className="odb-kpi-label">{label}</p>
      <h3 className={`odb-kpi-value ${accent ? "is-accent" : ""}`}>{value}</h3>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick }) {
  return (
    <button className="odb-action" onClick={onClick}>
      <span className="odb-action-body">
        <h3>
          {icon && <Icon name={icon} />}
          {title}
        </h3>
        <p>{desc}</p>
      </span>
      <span className="odb-action-arrow" aria-hidden="true">
        <Icon name="arrowRight" />
      </span>
    </button>
  );
}

function statusClass(status) {
  if (status === "LIVE") return "is-live";
  if (status === "ENDED") return "is-ended";
  if (status === "DRAFT") return "is-draft";
  return "is-pending";
}

function EventRow({ event, onView }) {
  const pct =
    event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0;
  const eventDate = new Date(event.date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="odb-event">
      <div className="odb-event-main">
        <strong className="odb-event-title">{event.title}</strong>
        <p className="odb-event-meta">
          {eventDate} · {event.sold}/{event.capacity} tickets ·{" "}
          {fmtMoney(event.revenue || 0)}
        </p>
        <div className="odb-progress">
          <div className="odb-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="odb-pct">{pct}% sold</span>
      </div>
      <div className="odb-event-side">
        <span className={`odb-badge ${statusClass(event.status)}`}>
          {event.status}
        </span>
        <button className="odb-link" onClick={onView}>
          View →
        </button>
      </div>
    </article>
  );
}

function DashSkeleton() {
  return (
    <div className="odb-skels" aria-hidden="true">
      <div className="odb-skel" style={{ height: 60, maxWidth: 420 }} />
      <div className="odb-skel" style={{ height: 168 }} />
      <div className="odb-skel-grid">
        {Array.from({ length: 7 }).map((_, i) => (
          <div className="odb-skel" style={{ height: 96 }} key={i} />
        ))}
      </div>
      <div className="odb-skel" style={{ height: 84 }} />
      <div className="odb-skel" style={{ height: 84 }} />
    </div>
  );
}

function Modal({ message, onConfirm, isAuth }) {
  return (
    <div className="odb-overlay">
      <div className="odb-modal">
        <h3>{isAuth ? "Session Expired" : "Something went wrong"}</h3>
        <p>{message}</p>
        <button className="odb-btn odb-btn-gold odb-w100" onClick={onConfirm}>
          {isAuth ? "Login again" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WHATSAPP BACKFILL BANNER

   Every organizer created before the WhatsApp number became
   mandatory has no number on file. The API answers `POST /events`
   and `POST /withdrawals/request` with 403 WHATSAPP_REQUIRED for
   them, so without this banner their next "Create Event" click is
   an unexplained failure.

   Deliberately NOT dismissible: it gates the two actions the
   dashboard exists for, and a dismissed banner just relocates the
   confusion to the 403. It disappears the moment a number saves.

   Validation mirrors backend utils/phone.js so the form rejects
   what the API would reject, instead of round-tripping for a 400.
══════════════════════════════════════════════════════════════ */
function WhatsAppBanner({ onSaved }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalized = normalizeWhatsApp(value);
  const valid = Boolean(normalized);

  async function handleSave(e) {
    e.preventDefault();
    if (saving || !valid) return;
    setSaving(true);
    setError("");
    try {
      const res = await updateProfile({ whatsapp: normalized });
      onSaved(res.user);
    } catch (err) {
      setError(err?.message || "Could not save that number. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="odb-wa" aria-labelledby="odb-wa-title">
      <div className="odb-wa-ic" aria-hidden="true">
        <Icon name="chat" />
      </div>
      <div className="odb-wa-body">
        <h2 className="odb-wa-title" id="odb-wa-title">
          Add your WhatsApp number
        </h2>
        <p className="odb-wa-copy">
          You&apos;ll need it to create events and withdraw. It&apos;s how we
          link your events to the WhatsApp bot and alert you the moment a
          ticket sells.
        </p>

        <form className="odb-wa-form" onSubmit={handleSave}>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={`odb-wa-input${value && !valid ? " is-invalid" : ""}`}
            placeholder="0801 234 5678"
            value={value}
            onChange={(ev) => {
              setValue(ev.target.value);
              setError("");
            }}
            aria-label="Your WhatsApp number"
            aria-invalid={Boolean(value && !valid)}
          />
          <button
            type="submit"
            className="odb-btn odb-btn-gold"
            disabled={!valid || saving}
          >
            {saving ? "Saving…" : "Save number"}
          </button>
        </form>

        {error ? (
          <p className="odb-wa-hint is-err" role="alert">
            {error}
          </p>
        ) : value && !valid ? (
          <p className="odb-wa-hint is-err">
            That doesn&apos;t look like a valid number yet.
          </p>
        ) : valid ? (
          <p className="odb-wa-hint is-ok">
            <Icon name="check" /> We&apos;ll save it as {formatWhatsApp(value)}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════════ */
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
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
button { font-family:var(--font-b); cursor:pointer; }

/* ── Shell ── */
.odb-shell { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.odb-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.odb-main { flex:1; width:100%; max-width:1160px; margin:0 auto; padding:clamp(16px,3vw,40px); }

.odb-wordmark { font-family:var(--font-h); font-weight:800; font-size:21px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:0; }
.odb-wordmark em { font-style:normal; color:var(--gold); }

.odb-side { display:none; }
.odb-topbar { position:sticky; top:0; z-index:950; height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,3vw,24px); background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.odb-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); }
.odb-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.odb-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.odb-burger.is-open span:nth-child(2) { opacity:0; }
.odb-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

.odb-drawer { position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,4vw,28px) 28px; display:flex; flex-direction:column; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
.odb-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }

.odb-nav { display:flex; flex-direction:column; gap:4px; }
.odb-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:var(--r-sm); background:none; border:none; color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.odb-nav-item svg { width:18px; height:18px; flex-shrink:0; }
.odb-nav-item:hover { color:var(--text); background:var(--card); }
.odb-nav-item.is-active { background:var(--gold-dim); color:var(--gold); }
.odb-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

.odb-logout { display:flex; align-items:center; gap:12px; margin-top:18px; padding:12px 14px; border-radius:var(--r-sm); background:none; border:1px solid var(--border); color:var(--muted); font-size:14px; font-weight:500; transition:color .2s, border-color .2s; }
.odb-logout:hover { color:var(--danger); border-color:rgba(224,92,92,.4); }
.odb-logout svg { width:17px; height:17px; }

@media (min-width:1024px) {
  .odb-side { display:flex; flex-direction:column; width:250px; flex-shrink:0; position:sticky; top:0; height:100svh; background:var(--surface); border-right:1px solid var(--border); padding:26px 14px 18px; }
  .odb-side .odb-wordmark { padding:0 14px; margin-bottom:30px; }
  .odb-side .odb-nav { flex:1; }
  .odb-side .odb-logout { margin-top:auto; }
  .odb-topbar { display:none; }
  .odb-drawer { display:none; }
}

/* ── Buttons ── */
.odb-btn { border-radius:999px; font-weight:600; font-size:14px; padding:12px 22px; border:1px solid transparent; transition:transform .2s, box-shadow .2s, border-color .2s, opacity .2s; white-space:nowrap; }
.odb-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; }
.odb-btn-gold:hover { transform:translateY(-1px); box-shadow:0 8px 26px var(--gold-glo); }
.odb-w100 { width:100%; }
.odb-link { background:none; border:none; color:var(--gold); font-weight:600; font-size:13px; padding:6px 0; }
.odb-link:hover { text-decoration:underline; }

/* ── Header ── */
.odb-head { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; }
.odb-head-id { display:flex; align-items:center; gap:14px; min-width:0; }
.odb-avatar { width:52px; height:52px; border-radius:50%; flex-shrink:0; overflow:hidden; display:grid; place-items:center; background:linear-gradient(135deg,#E8C96A,#F5E196); box-shadow:0 6px 20px var(--gold-glo); }
.odb-avatar img { width:100%; height:100%; object-fit:cover; }
.odb-avatar span { font-family:var(--font-h); font-weight:800; font-size:17px; color:#080910; }
.odb-title { font-family:var(--font-h); font-weight:600; font-size:clamp(18px,2.6vw,24px); letter-spacing:-.01em; }
.odb-title strong { font-weight:800; }
.odb-sub { color:var(--muted); font-size:13px; margin-top:3px; overflow-wrap:anywhere; }

/* ── WhatsApp backfill banner ──
   Sits above the wallet so it can't be scrolled past. Amber, not red:
   nothing is broken yet — but two actions will fail until it's done. */
.odb-wa { display:flex; gap:14px; align-items:flex-start; background:linear-gradient(135deg, rgba(232,201,106,.14), var(--card)); border:1px solid rgba(232,201,106,.34); border-radius:var(--r); padding:clamp(16px,2.6vw,22px); margin-bottom:24px; }
.odb-wa-ic { flex-shrink:0; width:40px; height:40px; display:grid; place-items:center; font-size:20px; border-radius:12px; background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); }
.odb-wa-body { flex:1; min-width:0; }
.odb-wa-title { font-family:var(--font-h); font-weight:700; font-size:15.5px; color:var(--text); margin-bottom:6px; }
.odb-wa-copy { font-size:13px; color:var(--muted); line-height:1.6; margin-bottom:14px; max-width:56ch; }
.odb-wa-form { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
.odb-wa-input { flex:1; min-width:180px; padding:12px 15px; background:rgba(8,9,16,.5); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-family:var(--font-b); font-size:14px; transition:border-color .2s, box-shadow .2s; }
.odb-wa-input::placeholder { color:var(--muted); opacity:.7; }
.odb-wa-input:focus { outline:none; border-color:var(--gold); box-shadow:0 0 0 3px var(--gold-dim); }
.odb-wa-input.is-invalid { border-color:rgba(224,92,92,.55); }
.odb-wa-form .odb-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }
.odb-wa-hint { font-size:11.5px; margin-top:9px; line-height:1.5; }
.odb-wa-hint.is-ok { color:var(--live); }
.odb-wa-hint.is-err { color:var(--danger); }
@media (max-width:520px) {
  .odb-wa { gap:12px; padding:16px 14px; }
  .odb-wa-ic { width:34px; height:34px; font-size:17px; }
  .odb-wa-input { font-size:16px; }   /* prevents iOS focus zoom */
  .odb-wa-form .odb-btn { width:100%; }
}

/* ── Wallet hero ── */
.odb-wallet { position:relative; overflow:hidden; background:linear-gradient(135deg, rgba(232,201,106,.16), rgba(232,201,106,.05) 50%, var(--card)); border:1px solid rgba(232,201,106,.32); border-radius:var(--r); padding:clamp(20px,3.4vw,30px); margin-bottom:24px; }
.odb-wallet::after { content:''; position:absolute; top:-80%; left:-40%; width:45%; height:260%; background:linear-gradient(105deg, transparent, rgba(255,255,255,.07), transparent); transform:translateX(-140%) rotate(10deg); animation:odbShine 6.5s ease-in-out infinite; pointer-events:none; }
@keyframes odbShine { 0%, 55%, 100% { transform:translateX(-140%) rotate(10deg); } 28% { transform:translateX(420%) rotate(10deg); } }
.odb-wallet-top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
.odb-wallet-label { font-size:11.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); }
.odb-live-pill { display:inline-flex; align-items:center; gap:6px; font-size:10.5px; font-weight:700; letter-spacing:.1em; color:var(--live); background:rgba(107,240,160,.1); border:1px solid rgba(107,240,160,.25); padding:4px 11px; border-radius:999px; }
.odb-live-dot { width:6px; height:6px; border-radius:50%; background:var(--live); animation:odbPulse 2s ease-in-out infinite; }
@keyframes odbPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.45; transform:scale(.75); } }
.odb-wallet-bottom { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.odb-wallet-value { font-family:var(--font-h); font-weight:800; font-size:clamp(32px,6vw,46px); letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
.odb-eye { display:grid; place-items:center; width:36px; height:36px; border-radius:50%; background:var(--card); border:1px solid var(--border); color:var(--muted); transition:color .2s, border-color .2s; }
.odb-eye:hover { color:var(--gold); border-color:var(--border-h); }
.odb-wallet-note { margin-top:12px; font-size:12px; color:var(--muted); }

/* ── KPI grid ── */
.odb-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr)); gap:12px; margin-bottom:32px; }
.odb-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:18px 16px; transition:border-color .25s; min-width:0; }
.odb-kpi:hover { border-color:var(--border-h); }
.odb-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:10px; }
.odb-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(19px,2.2vw,24px); letter-spacing:-.01em; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.odb-kpi-value.is-accent { color:var(--live); }

/* ── Sections ── */
.odb-section { margin-bottom:32px; }
.odb-section-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.odb-section-title { font-family:var(--font-h); font-weight:700; font-size:16px; letter-spacing:.01em; margin-bottom:14px; }

/* ── Quick actions ── */
.odb-actions { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr)); gap:12px; }
.odb-action { display:flex; align-items:center; justify-content:space-between; gap:10px; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:18px 16px; text-align:left; color:var(--text); transition:transform .25s, border-color .25s; min-width:0; }
.odb-action:hover { transform:translateY(-3px); border-color:rgba(232,201,106,.4); }
.odb-action-body { min-width:0; }
.odb-action h3 { font-family:var(--font-h); font-size:14px; font-weight:700; margin-bottom:5px; }
.odb-action p { color:var(--muted); font-size:12.5px; line-height:1.45; }
.odb-action-arrow { color:var(--gold); font-size:16px; flex-shrink:0; transition:transform .25s; }
.odb-action:hover .odb-action-arrow { transform:translateX(4px); }

/* ── Events list ── */
.odb-events { display:flex; flex-direction:column; gap:10px; }
.odb-event { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:14px; background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:18px; transition:border-color .25s; }
.odb-event:hover { border-color:var(--border-h); }
.odb-event-main { flex:1; min-width:min(220px,100%); }
.odb-event-title { font-family:var(--font-h); font-size:15px; font-weight:700; display:block; margin-bottom:4px; }
.odb-event-meta { color:var(--muted); font-size:13px; }
.odb-progress { height:4px; background:rgba(255,255,255,.08); border-radius:99px; margin-top:10px; max-width:260px; overflow:hidden; }
.odb-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#E8C96A,#F5E196); transition:width .5s ease; }
.odb-pct { font-size:11.5px; color:var(--muted); margin-top:5px; display:block; }
.odb-event-side { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }

/* ── Status badges ── */
.odb-badge { display:inline-flex; align-items:center; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
.odb-badge.is-live { background:rgba(107,240,160,.12); color:var(--live); }
.odb-badge.is-draft { background:rgba(255,255,255,.07); color:var(--muted); }
.odb-badge.is-ended { background:rgba(224,92,92,.12); color:var(--danger); }
.odb-badge.is-pending { background:var(--gold-dim); color:var(--gold); }

/* ── Empty state ── */
.odb-empty { text-align:center; padding:clamp(36px,6vw,56px) 24px; background:var(--card); border:1px dashed var(--border-h); border-radius:var(--r); }
.odb-empty-icon { font-size:40px; color:var(--muted); }
.odb-action h3 { display:flex; align-items:center; gap:8px; }
.odb-empty-text { color:var(--muted); margin:10px 0 18px; }

/* ── Skeleton shimmer ── */
.odb-skels { display:flex; flex-direction:column; gap:16px; }
.odb-skel { border-radius:var(--r); background:linear-gradient(100deg, rgba(255,255,255,.04) 30%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.04) 70%); background-size:200% 100%; animation:odbShimmer 1.4s linear infinite; }
@keyframes odbShimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
.odb-skel-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr)); gap:12px; }

/* ── Modal ── */
.odb-overlay { position:fixed; inset:0; z-index:2000; background:rgba(8,9,16,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:grid; place-items:center; padding:20px; }
.odb-modal { width:min(100%,380px); background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,32px); text-align:center; animation:odbPop .3s ease; }
@keyframes odbPop { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
.odb-modal h3 { font-family:var(--font-h); font-size:18px; font-weight:700; margin-bottom:10px; }
.odb-modal p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:768px) {
  .odb-head { align-items:flex-start; }
  .odb-head .odb-btn { width:100%; }
}
@media (max-width:480px) {
  .odb-event-side { width:100%; justify-content:space-between; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
