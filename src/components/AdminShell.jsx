import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

const groups = [
  { label: "Overview", links: [["Dashboard", "/admin/dashboard"]] },
  {
    label: "Operations",
    links: [
      ["Events", "/admin/events"],
      ["Organizers", "/admin/organizers"],
      ["Withdrawals", "/admin/withdrawals"],
      ["Installment plans", "/admin/installments"],
    ],
  },
  {
    label: "Finance & reports",
    links: [
      ["Analytics", "/admin/sales"],
      ["Daily reports", "/admin/daily-report"],
      ["Paystack activity", "/admin/paystack-activity"],
    ],
  },
  {
    label: "Community",
    links: [
      ["Ambassadors", "/admin/ambassadors"],
      ["Affiliates", "/admin/affiliates"],
      ["Feedback", "/admin/feedback"],
    ],
  },
];

export default function AdminShell({ active, children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderLinks = () => (
    <>
      {groups.map((group) => (
        <div className="adm-nav-group" key={group.label}>
          <p className="adm-nav-label">{group.label}</p>
          {group.links.map(([label, path]) => (
            <button
              className={`adm-link ${active === path ? "active" : ""}`}
              key={path}
              type="button"
              aria-current={active === path ? "page" : undefined}
              onClick={() => go(path)}
            >
              {label}
            </button>
          ))}
        </div>
      ))}
      <button className="adm-link adm-logout" type="button" onClick={handleLogout}>
        <span aria-hidden="true">↪</span>
        Logout
      </button>
    </>
  );

  return (
    <div className="adm-shell">
      <style>{CSS}</style>
      <aside className="adm-side" aria-label="Admin navigation">
        <div className="adm-brand">Tic<em>tify</em></div>
        <nav className="adm-nav">{renderLinks()}</nav>
      </aside>

      <header className="adm-mobile">
        <strong>Tic<em>tify</em></strong>
        <button
          type="button"
          className="adm-menu-button"
          aria-label={open ? "Close admin menu" : "Open admin menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {open && (
        <div className="adm-drawer">
          <nav aria-label="Admin navigation">{renderLinks()}</nav>
        </div>
      )}

      <main className="adm-main">{children}</main>
    </div>
  );
}

const CSS = `
.adm-shell { min-height:100vh; background:var(--ink-900,#080910); color:var(--text,#f0ede8); font-family:var(--font-b,'DM Sans',sans-serif); }
.adm-side { position:fixed; inset:0 auto 0 0; width:272px; overflow-y:auto; background:var(--ink-800,#0d0f16); border-right:1px solid var(--border,#ffffff12); padding:30px 18px 24px; z-index:5; }
.adm-brand { padding:0 14px 30px; color:var(--gold,#e8c96a); font:800 27px var(--font-h,'Syne',sans-serif); letter-spacing:-.04em; }
.adm-brand em,.adm-mobile em { font-style:normal; color:var(--text,#f0ede8); }
.adm-nav { display:flex; flex-direction:column; gap:18px; }
.adm-nav-group { display:flex; flex-direction:column; gap:4px; }
.adm-nav-label { margin:0 14px 4px; color:var(--text-dim,#77736b); font-size:13px !important; font-weight:800; letter-spacing:.12em; line-height:1.2; text-transform:uppercase; }
.adm-link { width:100%; min-height:46px; display:flex; align-items:center; gap:10px; padding:11px 14px; border:0; border-radius:11px; background:transparent; color:var(--text-2,#c9c5bc); cursor:pointer; font:600 15px/1.35 var(--font-b,'DM Sans',sans-serif); text-align:left; transition:background .2s,color .2s,transform .2s; }
.adm-link:hover { background:var(--gold-dim,#2a2722); color:var(--text,#f0ede8); transform:translateX(2px); }
.adm-link.active { background:var(--gold-dim,#2a2722); color:var(--gold,#f4d34f); box-shadow:inset 3px 0 0 var(--gold,#f4d34f); }
.adm-logout { margin-top:2px; border:1px solid var(--border,#ffffff18); color:var(--text-2,#c9c5bc); }
.adm-logout span { color:var(--gold,#e8c96a); font-size:1.2em; }
.adm-main { min-height:100vh; margin-left:272px; padding:clamp(30px,5vw,68px); }
.adm-mobile,.adm-drawer { display:none; }
@media(max-width:900px) {
  .adm-side { display:none; }
  .adm-main { margin-left:0; padding:82px 20px 36px; }
  .adm-mobile { position:fixed; inset:0 0 auto; z-index:20; height:64px; display:flex; align-items:center; justify-content:space-between; padding:0 20px; background:rgba(11,13,22,.94); border-bottom:1px solid var(--border,#ffffff12); backdrop-filter:blur(14px); }
  .adm-mobile strong { color:var(--gold,#e8c96a); font:800 22px var(--font-h,'Syne',sans-serif); }
  .adm-menu-button { width:44px; height:44px; display:grid; place-content:center; gap:5px; border:1px solid var(--border-h,#ffffff22); border-radius:10px; background:var(--card,#ffffff08); cursor:pointer; }
  .adm-menu-button span { width:19px; height:2px; display:block; border-radius:2px; background:var(--text,#f0ede8); }
  .adm-drawer { position:fixed; inset:64px 0 0; z-index:19; display:block; overflow-y:auto; padding:20px; background:rgba(6,7,16,.98); }
  .adm-drawer .adm-nav { gap:20px; max-width:560px; margin:0 auto; }
  .adm-drawer .adm-link { min-height:50px; font-size:16px; }
}
`;
