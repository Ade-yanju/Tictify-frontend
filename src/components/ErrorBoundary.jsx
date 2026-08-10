/* ═══════════════════════════════════════════════════════════
   ErrorBoundary.jsx — Tictify 2026 crash guard
   Syne + DM Sans · ink #080910 · gold #E8C96A
   Catches render errors anywhere below it and shows a
   branded fallback instead of a white screen.
═══════════════════════════════════════════════════════════ */
import { Component } from "react";
import Icon from "../components/Icon";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface for debugging / future error reporting
    console.error("Tictify ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      injectStyles("tictify-error-boundary-css", CSS);
      return (
        <div className="eb-page" role="alert">
          <div className="eb-card">
            <div className="eb-icon" aria-hidden="true">
              <Icon name="alertTriangle" />
            </div>
            <h1 className="eb-title">Something went wrong</h1>
            <p className="eb-sub">
              Refresh the page — if it keeps happening we&rsquo;re already on
              it.
            </p>
            <button
              className="eb-btn"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ══════════════════════════════════════════════════════════
   CSS
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
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }

@keyframes ebFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }

.eb-page { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:24px; font-family:var(--font-b); }
.eb-card { width:min(100%,400px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(28px,6vw,44px); text-align:center; animation:ebFadeUp .4s ease both; }
.eb-icon { width:52px; height:52px; border-radius:16px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin:0 auto 18px; }
.eb-icon svg { width:24px; height:24px; }
.eb-title { font-family:var(--font-h); font-weight:700; font-size:clamp(19px,4vw,23px); letter-spacing:-.01em; color:var(--gold); margin-bottom:10px; }
.eb-sub { color:var(--muted); font-size:14px; line-height:1.65; margin-bottom:24px; }
.eb-btn { background:var(--gold); color:#080910; border:none; border-radius:999px; font-family:var(--font-b); font-weight:700; font-size:14px; padding:13px 30px; cursor:pointer; transition:transform .2s, box-shadow .2s; }
.eb-btn:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }

@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
