import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
/* Design system — tokens, type scale, button ranks, focus states.
   Imported once here so no page needs its own :root block. */
import "./styles/system.css";
import "./styles/auth.css";
import "./styles/organizer.css";
import "./styles/organizer-exact.css";
import "./styles/organizer-visuals.css";
import "./styles/organizer-events.css";
import "./styles/organizer-insights.css";
import "./styles/organizer-select.css";
import "./styles/organizer-notifications.css";
import "./styles/organizer-live-visuals.css";
import "./styles/organizer-create-event.css";
import "./styles/organizer-screen-upgrade.css";
import "./styles/organizer-overlay-upgrade.css";
import "./styles/organizer-ops-layout.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* ── PWA: register the service worker (production only — HMR and
   a service worker fight each other in dev) ── */
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("SW registration failed:", err));
  });
}
