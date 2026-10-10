import { useEffect, useState } from "react";
import { getToken } from "../services/authService";
import {
  createGateStaff,
  listGateStaff,
  revokeGateStaff,
} from "../services/gateStaffService";

export default function GateStaffModal({ event, onClose }) {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [scannerUrl, setScannerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await listGateStaff(event._id, getToken());
      setStaff(data.staff || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event._id]);

  async function addStaff(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const data = await createGateStaff(event._id, form, getToken());
      setStaff((current) => [...current, data.staff]);
      setForm({ name: "", email: "", password: "" });
      setScannerUrl(data.scannerUrl || "");
      setMessage("Scanner account created. Share the link and credentials privately.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(person) {
    if (!window.confirm(`Revoke scanner access for ${person.name}?`)) return;
    setBusy(true); setError("");
    try {
      await revokeGateStaff(event._id, person._id, getToken());
      setStaff((current) => current.map((item) => item._id === person._id ? { ...item, isActive: false } : item));
      setMessage("Scanner access revoked.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function copy(value) {
    try { await navigator.clipboard.writeText(value); setMessage("Scanner link copied."); }
    catch { setError("Could not copy automatically. Select the link and copy it."); }
  }

  return (
    <div className="gate-staff-overlay" onClick={onClose}>
      <section className="gate-staff-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="gate-staff-title">
        <button className="gate-staff-close" onClick={onClose} aria-label="Close">×</button>
        <p className="gate-staff-kicker">ENTRANCE OPERATIONS</p>
        <h2 id="gate-staff-title">Scanner staff</h2>
        <p className="gate-staff-intro">Create separate logins for gate staff. They can validate tickets for <strong>{event.title}</strong> only—no sales, transactions or withdrawals.</p>

        <form className="gate-staff-form" onSubmit={addStaff}>
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gate staff name" required /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staff@example.com" required /></label>
          <label>Scanner password<input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" required /></label>
          <button className="gate-staff-primary" disabled={busy}>{busy ? "Creating…" : "Add scanner account"}</button>
        </form>

        {scannerUrl && <div className="gate-staff-link"><small>Scanner login link</small><code>{scannerUrl}</code><button onClick={() => copy(scannerUrl)}>Copy link</button></div>}
        {error && <p className="gate-staff-message is-error">{error}</p>}
        {message && <p className="gate-staff-message is-success">{message}</p>}

        <div className="gate-staff-list-head"><span>Accounts</span><span>{staff.length}</span></div>
        <div className="gate-staff-list">
          {loading ? <p className="gate-staff-empty">Loading…</p> : null}
          {!loading && !staff.length ? <p className="gate-staff-empty">No scanner accounts yet.</p> : null}
          {staff.map((person) => <article className="gate-staff-row" key={person._id}><div><strong>{person.name}</strong><small>{person.email}</small></div><span className={person.isActive ? "is-active" : "is-revoked"}>{person.isActive ? "Active" : "Revoked"}</span>{person.isActive && <button onClick={() => revoke(person)} disabled={busy}>Revoke</button>}</article>)}
        </div>
        <p className="gate-staff-footnote">Multiple staff can scan simultaneously. While online, each admission is checked atomically in real time. If a device loses signal, it uses the cached guest list and reconciles when it reconnects.</p>
      </section>
      <style>{`
        .gate-staff-overlay{position:fixed;inset:0;z-index:2200;display:grid;place-items:center;padding:18px;background:#080910cc;backdrop-filter:blur(10px)}.gate-staff-modal{position:relative;width:min(100%,620px);max-height:92svh;overflow:auto;padding:30px;background:#0d0f16;color:#f0ede8;border:1px solid #ffffff18;border-radius:22px}.gate-staff-close{position:absolute;right:18px;top:12px;border:0;background:transparent;color:#aaa7a0;font-size:28px;cursor:pointer}.gate-staff-kicker{color:#e8c96a;font-size:11px;letter-spacing:.14em;font-weight:700}.gate-staff-modal h2{font:800 28px Syne,sans-serif;margin:8px 0}.gate-staff-intro,.gate-staff-footnote{color:#aaa7a0;font-size:13px;line-height:1.6}.gate-staff-intro strong{color:#f0ede8}.gate-staff-form{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:22px 0 16px}.gate-staff-form label{color:#aaa7a0;font-size:12px}.gate-staff-form label:last-of-type{grid-column:1/-1}.gate-staff-form input{display:block;width:100%;margin-top:6px;padding:11px 12px;background:#ffffff08;border:1px solid #ffffff18;border-radius:9px;color:#f0ede8;font:inherit}.gate-staff-primary{grid-column:1/-1;padding:12px;border:0;border-radius:999px;background:#e8c96a;color:#080910;font-weight:800;cursor:pointer}.gate-staff-primary:disabled{opacity:.5}.gate-staff-link{display:grid;grid-template-columns:1fr auto;gap:6px 10px;padding:12px;margin-bottom:12px;background:#e8c96a12;border:1px solid #e8c96a44;border-radius:12px}.gate-staff-link small{grid-column:1/-1;color:#e8c96a}.gate-staff-link code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f0ede8;font-size:11px;align-self:center}.gate-staff-link button,.gate-staff-row button{border:1px solid #ffffff22;background:transparent;color:#f0ede8;border-radius:999px;padding:7px 10px;cursor:pointer}.gate-staff-message{font-size:13px;line-height:1.5}.gate-staff-message.is-error{color:#f19b9b}.gate-staff-message.is-success{color:#8deeb5}.gate-staff-list-head{display:flex;justify-content:space-between;padding:18px 0 8px;border-bottom:1px solid #ffffff18;color:#aaa7a0;font-size:12px;text-transform:uppercase;letter-spacing:.1em}.gate-staff-list{margin-bottom:18px}.gate-staff-row{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #ffffff12}.gate-staff-row strong,.gate-staff-row small{display:block}.gate-staff-row small{color:#7a7870;font-size:12px;margin-top:3px}.gate-staff-row span{font-size:11px}.gate-staff-row .is-active{color:#8deeb5}.gate-staff-row .is-revoked{color:#f19b9b}.gate-staff-empty{color:#7a7870;font-size:13px;padding:16px 0}@media(max-width:560px){.gate-staff-form{grid-template-columns:1fr}.gate-staff-form label:last-of-type{grid-column:auto}.gate-staff-primary{grid-column:auto}.gate-staff-row{grid-template-columns:1fr auto}.gate-staff-row button{grid-column:2}.gate-staff-row span{justify-self:end}}
      `}</style>
    </div>
  );
}
