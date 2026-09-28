import { useEffect, useState } from "react";
import { getToken } from "../services/authService";

const apiBase = () => `${import.meta.env.VITE_API_URL}/api/events`;

async function request(path, options = {}) {
  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export default function OrganizerCohostModal({ event, onClose }) {
  const [coHosts, setCoHosts] = useState([]);
  const [email, setEmail] = useState("");
  const [links, setLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await request(`/${event._id}/cohosts`);
      setCoHosts(Array.isArray(data.coHosts) ? data.coHosts : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [event._id]);

  async function invite(e) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await request(`/${event._id}/cohosts/invite`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setEmail("");
      setLinks((current) => ({ ...current, [data.coHost._id]: data.inviteUrl }));
      setNotice("Invitation link created. Copy it and send it to the organizer.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function regenerate(host) {
    setBusy(true);
    setError("");
    try {
      const data = await request(`/${event._id}/cohosts/${host._id}/invite-link`, {
        method: "POST",
      });
      setLinks((current) => ({ ...current, [host._id]: data.inviteUrl }));
      setNotice("A new invitation link is ready.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function salesLink(host) {
    setBusy(true);
    setError("");
    try {
      const data = await request(`/${event._id}/cohosts/${host._id}/sales-link`, {
        method: "POST",
      });
      setLinks((current) => ({ ...current, [host._id]: data.salesUrl }));
      setNotice("Sales link generated. Purchases through it credit this co-host.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(host) {
    if (!window.confirm("Revoke this co-host's invitation and sales link?")) return;
    setBusy(true);
    setError("");
    try {
      await request(`/${event._id}/cohosts/${host._id}`, { method: "DELETE" });
      setNotice("Co-host access revoked.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Link copied to clipboard.");
    } catch {
      setError("Could not copy automatically. Select the link and copy it.");
    }
  }

  return (
    <div className="cohost-overlay" onClick={onClose}>
      <section className="cohost-modal" onClick={(e) => e.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="cohost-title">
        <button className="cohost-close" onClick={onClose} aria-label="Close co-host dialog">×</button>
        <div className="cohost-kicker">COLLABORATION</div>
        <h2 id="cohost-title">Co-host {event.title}</h2>
        <p className="cohost-intro">
          Invite another organizer to sell this event. Their accepted sales link gives them credit for the tickets it generates.
        </p>

        <form className="cohost-invite" onSubmit={invite}>
          <label htmlFor="cohost-email">Organizer email</label>
          <div className="cohost-invite-row">
            <input
              id="cohost-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organizer@example.com"
              autoComplete="email"
            />
            <button className="cohost-primary" disabled={busy || !email.trim()}>
              {busy ? "Working…" : "Invite organizer"}
            </button>
          </div>
        </form>

        {error && <p className="cohost-message is-error">{error}</p>}
        {notice && <p className="cohost-message is-success">{notice}</p>}

        <div className="cohost-list-heading">
          <span>Co-hosts</span>
          <span>{coHosts.length}</span>
        </div>

        <div className="cohost-list">
          {loading ? <p className="cohost-empty">Loading co-hosts…</p> : null}
          {!loading && !coHosts.length ? (
            <p className="cohost-empty">No co-hosts yet. Send the first invitation above.</p>
          ) : null}
          {coHosts.map((host) => {
            const person = typeof host.organizer === "object" ? host.organizer : null;
            const link = links[host._id];
            return (
              <article className="cohost-row" key={host._id}>
                <div className="cohost-person">
                  {person?.avatar ? <img src={person.avatar} alt="" /> : <span>{(person?.name || host.email || "O").slice(0, 1).toUpperCase()}</span>}
                  <div>
                    <strong>{person?.name || host.email}</strong>
                    <small>{person?.email || host.email}</small>
                  </div>
                </div>
                <div className={`cohost-status is-${host.status.toLowerCase()}`}>{host.status}</div>
                <div className="cohost-row-actions">
                  {link ? (
                    <button className="cohost-link-button" onClick={() => copy(link)}>Copy link</button>
                  ) : null}
                  {host.status === "PENDING" ? (
                    <button className="cohost-link-button" onClick={() => regenerate(host)} disabled={busy}>Invite link</button>
                  ) : null}
                  {host.status === "ACCEPTED" ? (
                    <button className="cohost-link-button" onClick={() => salesLink(host)} disabled={busy}>Sales link</button>
                  ) : null}
                  {host.status !== "REVOKED" ? (
                    <button className="cohost-revoke" onClick={() => revoke(host)} disabled={busy}>Revoke</button>
                  ) : null}
                </div>
                {link ? <code className="cohost-link-preview">{link}</code> : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
