import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import {
  getGateEvent,
  loginGateStaff,
} from "../services/gateStaffService";

export default function GateLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const eventId = params.get("event") || "";
  const [event, setEvent] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;
    getGateEvent(eventId).then((data) => setEvent(data.event)).catch((err) => setError(err.message));
  }, [eventId]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await loginGateStaff({ eventId, email, password });
      navigate(`/gate/scan?event=${encodeURIComponent(result.event.id)}`, { replace: true });
    } catch (err) {
      setError(err.message || "Scanner login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="gate-login-page">
      <section className="gate-login-card">
        <div className="gate-login-mark"><Icon name="qr" size={22} /></div>
        <p className="gate-login-kicker">TICTIFY GATE</p>
        <h1>Scanner login</h1>
        <p className="gate-login-copy">
          {event ? <>Scan access for <strong>{event.title}</strong></> : "Use the scanner credentials provided by the event organiser."}
        </p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
          {error && <p className="gate-login-error" role="alert">{error}</p>}
          <button disabled={loading || !eventId}>{loading ? "Signing in…" : "Open scanner"}</button>
        </form>
        <p className="gate-login-note">This account can validate tickets for this event only. It cannot access sales, transactions or withdrawals.</p>
      </section>
      <style>{`
        .gate-login-page{min-height:100svh;display:grid;place-items:center;padding:24px;background:#080910;color:#f0ede8;font-family:'DM Sans',sans-serif}
        .gate-login-card{width:min(100%,430px);padding:36px;background:#0d0f16;border:1px solid #ffffff18;border-radius:24px;box-shadow:0 24px 80px #0008}
        .gate-login-mark{width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:#e8c96a1f;color:#e8c96a;margin-bottom:22px}
        .gate-login-kicker{font-size:11px;letter-spacing:.16em;color:#e8c96a;font-weight:700}.gate-login-card h1{font:800 32px Syne,sans-serif;margin:8px 0}.gate-login-copy{color:#aaa7a0;line-height:1.6;margin-bottom:26px}.gate-login-copy strong{color:#f0ede8}
        .gate-login-card label{display:block;color:#aaa7a0;font-size:13px;margin:14px 0}.gate-login-card input{display:block;width:100%;margin-top:7px;padding:13px 14px;border:1px solid #ffffff18;border-radius:11px;background:#ffffff08;color:#f0ede8;font:inherit}.gate-login-card input:focus{outline:2px solid #e8c96a66}
        .gate-login-card button{width:100%;border:0;border-radius:999px;padding:14px;background:linear-gradient(135deg,#e8c96a,#f5e196);color:#080910;font-weight:800;font-family:Syne,sans-serif;margin-top:10px;cursor:pointer}.gate-login-card button:disabled{opacity:.5;cursor:not-allowed}.gate-login-error{color:#f19b9b;font-size:13px;line-height:1.5;margin-top:14px}.gate-login-note{color:#7a7870;font-size:12px;line-height:1.6;margin-top:22px}
      `}</style>
    </main>
  );
}
