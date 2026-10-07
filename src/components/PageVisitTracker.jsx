import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/* Records route visits for the admin daily report. The API stores only the
   pathname; failed telemetry must never interrupt the visitor experience. */
export default function PageVisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    const api = import.meta.env.VITE_API_URL || "";

    fetch(`${api}/api/page-visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {
      // Analytics is best-effort and must not affect navigation.
    });
  }, [location.pathname, location.search]);

  return null;
}
