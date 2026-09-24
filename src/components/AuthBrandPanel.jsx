import { useNavigate } from "react-router-dom";

export default function AuthBrandPanel() {
  const navigate = useNavigate();

  return (
    <aside className="auth-brand-panel" aria-label="About Tictify">
      <div className="auth-brand-head">
        <button
          type="button"
          className="auth-brand-logo"
          onClick={() => navigate("/")}
          aria-label="Go to Tictify home"
        >
          <span className="auth-brand-logo-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Tictify</span>
        </button>
        <span className="auth-brand-kicker">Event ticketing, made clear</span>
      </div>

      <div className="auth-brand-copy">
        <p className="auth-brand-eyebrow">Your event starts here</p>
        <h1>
          Make the moment
          <br />
          <em>worth showing up for.</em>
        </h1>
        <p className="auth-brand-description">
          Sell tickets, keep every detail in view, and give your guests a
          smoother way to be there.
        </p>
      </div>

      <div className="auth-brand-preview" aria-hidden="true">
        <div className="auth-preview-topline">
          <span className="auth-preview-dot" />
          <span>Event overview</span>
          <span className="auth-preview-menu">•••</span>
        </div>
        <div className="auth-preview-main">
          <div>
            <span className="auth-preview-label">Tickets sold</span>
            <strong>1,248</strong>
          </div>
          <span className="auth-preview-growth">+18.4%</span>
        </div>
        <div className="auth-preview-bars">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="auth-preview-foot">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="auth-brand-foot">
        <span>Simple tools for busy organizers</span>
        <span className="auth-brand-foot-mark">✦</span>
      </div>
    </aside>
  );
}
