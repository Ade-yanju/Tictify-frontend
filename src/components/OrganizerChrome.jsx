import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import OrganizerNotificationBell from "./OrganizerNotificationBell";
import { getUser, logout } from "../services/authService";


const NAV = [
  ["Overview", "/organizer/dashboard", "grid"],
  ["Create event", "/organizer/create-event", "plusCircle"],
  ["My events", "/organizer/events", "calendar"],
  ["Sales", "/organizer/sales", "bars"],
  ["Scan tickets", "/organizer/scan/select", "qr"],
  ["Insights", "/organizer/insights", "trend"],
  ["Referrals", "/organizer/referrals", "users"],
  ["Withdraw", "/organizer/withdraw", "wallet"],
];

function initials(name = "Organizer") {
  return String(name || "Organizer")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function OrganizerChrome({
  active,
  children,
  legacyPrefix = "orgx",
  onLogout,
  title,
  subtitle,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getUser() || {});

  useEffect(() => {
    setUser(getUser() || {});
  }, []);

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

  const signOut = () => {
    (onLogout || logout)();
    navigate("/login", { replace: true });
  };

  const nav = (mobile = false) => (
    <nav className={`orgx-nav ${mobile ? "is-mobile" : ""}`}>
      <p className="orgx-nav-label">Workspace</p>
      {NAV.slice(0, 5).map(([label, path, icon]) => (
        <button
          type="button"
          className={`orgx-nav-item ${(active === path || active === path.split("/").filter(Boolean).pop()) ? "is-active" : ""}`}
          key={path}
          onClick={() => go(path)}
        >
          <Icon name={icon} size={17} />
          <span>{label}</span>
        </button>
      ))}
      <p className="orgx-nav-label orgx-nav-label-lower">Manage and grow</p>
      {NAV.slice(5).map(([label, path, icon]) => (
        <button
          type="button"
          className={`orgx-nav-item ${(active === path || active === path.split("/").filter(Boolean).pop()) ? "is-active" : ""}`}
          key={path}
          onClick={() => go(path)}
        >
          <Icon name={icon} size={17} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );

  const rootClass = `orgx-shell ${legacyPrefix}-shell`;
  const mainClass = `orgx-main ${legacyPrefix}-main`;

  return (
    <div className={rootClass}>
      <aside className="orgx-sidebar">
        <button
          type="button"
          className="orgx-brand"
          onClick={() => go("/organizer/dashboard")}
        >
          <span className="orgx-brand-mark"><Icon name="ticket" size={16} /></span>
          <span>Tictify</span>
        </button>
        {nav()}
        <button type="button" className="orgx-logout" onClick={signOut}>
          <Icon name="signOut" size={16} />
          <span>Log out</span>
        </button>
      </aside>

      <div className="orgx-workspace">
        <header className="orgx-topbar">
          <div className="orgx-topbar-title">
            <span className="orgx-topbar-eyebrow">Organizer workspace</span>
            <strong>Welcome back, {user?.name?.split(" ")[0] || "organizer"}</strong>
          </div>
          <div className="orgx-topbar-actions">
            <label className="orgx-search">
              <Icon name="search" size={15} />
              <input aria-label="Search workspace" placeholder="Search" />
              <kbd>⌘ K</kbd>
            </label>
            <OrganizerNotificationBell />
            <button type="button" className="orgx-user-chip" onClick={() => go("/organizer/dashboard")}>
              <span>{initials(user?.name)}</span>
              <strong>{user?.name || "Organizer"}</strong>
            </button>
            <button
              type="button"
              className="orgx-mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        <div className={`orgx-mobile-drawer ${menuOpen ? "is-open" : ""}`}>
          {nav(true)}
          <button type="button" className="orgx-logout" onClick={signOut}>
            <Icon name="signOut" size={16} />
            <span>Log out</span>
          </button>
        </div>

        <main className={mainClass}>
          {title && (
            <header className="orgx-page-intro">
              <p className="orgx-page-kicker">Organizer workspace</p>
              <h1 className="orgx-page-title">{title}</h1>
              {subtitle && <p className="orgx-page-subtitle">{subtitle}</p>}
            </header>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
