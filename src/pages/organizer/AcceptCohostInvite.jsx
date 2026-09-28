import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OrganizerChrome from "../../components/OrganizerChrome";
import { getToken } from "../../services/authService";

export default function AcceptCohostInvite() {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [salesUrl, setSalesUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.VITE_API_URL}/api/events/cohosts/invite/${token}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Invitation unavailable");
        if (active) setInvite(data);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);

  async function accept() {
    setAccepting(true);
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/cohosts/invite/${token}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not accept invitation");
      setSalesUrl(data.salesUrl || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(salesUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy the link automatically.");
    }
  }

  return (
    <OrganizerChrome active="/organizer/events">
      <main className="cohost-accept-page">
        <section className="cohost-accept-card">
          <div className="cohost-kicker">CO-HOST INVITATION</div>
          {loading ? <h1>Loading invitation…</h1> : null}
          {!loading && invite && !salesUrl ? (
            <>
              <h1>You&apos;re invited to co-host {invite.event.title}</h1>
              <p>{invite.invitedBy?.name || "The event owner"} invited you to sell tickets for this event.</p>
              <div className="cohost-accept-event">
                <strong>{invite.event.title}</strong>
                <span>{new Date(invite.event.date).toLocaleString("en-NG")} · {invite.event.location}</span>
              </div>
              <button className="cohost-primary" onClick={accept} disabled={accepting}>
                {accepting ? "Accepting…" : "Accept co-host invitation"}
              </button>
            </>
          ) : null}
          {!loading && salesUrl ? (
            <>
              <h1>You&apos;re officially a co-host</h1>
              <p>Share this unique sales link. Tickets purchased through it are credited to your organizer wallet.</p>
              <div className="cohost-accept-link"><code>{salesUrl}</code><button className="cohost-link-button" onClick={copy}>{copied ? "Copied" : "Copy link"}</button></div>
              <p className="cohost-accept-note">Keep this link private. If it is shared publicly, every purchase through it is attributed to you.</p>
            </>
          ) : null}
          {!loading && !invite && !salesUrl ? <h1>This invitation is unavailable</h1> : null}
          {error ? <p className="cohost-message is-error">{error}</p> : null}
        </section>
      </main>
    </OrganizerChrome>
  );
}
