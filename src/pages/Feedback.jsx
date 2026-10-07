import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getToken, getUser } from "../services/authService";
import OrganizerShell from "../components/OrganizerShell";

const CATEGORIES = ["GENERAL", "BUG", "FEATURE", "PAYMENT", "OTHER"];

export default function Feedback() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    category: "GENERAL",
    rating: 5,
    message: "",
  });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const closeFeedback = () => {
    if (new URLSearchParams(location.search).get("source") === "event-created") {
      navigate("/organizer/events", { replace: true });
      return;
    }
    if (window.history.length > 1) navigate(-1);
    else navigate("/", { replace: true });
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "rating" ? Number(value) : value }));
  };

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");

    try {
      const token = getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not send feedback.");
      setMessage("Thanks — your feedback was received.");
      setForm((current) => ({ ...current, message: "" }));
    } catch (error) {
      setMessage(error.message || "Could not send feedback.");
    } finally {
      setSending(false);
    }
  }

  const body = (
    <main className="fb-page">
      <style>{CSS}</style>
      <div className="fb-card">
        <button className="fb-close" type="button" onClick={closeFeedback} aria-label="Cancel feedback">
          <span aria-hidden="true">×</span>
          <span>Cancel</span>
        </button>
        <span className="fb-kicker">Your voice matters</span>
        <h1>Help us improve Tictify</h1>
        <p>Tell us what worked, what did not, and what would make your next event or booking better.</p>
        <p className="fb-optional">Feedback is completely optional. You can close this screen at any time.</p>

        <form className="fb-form" onSubmit={submit}>
          <div className="fb-row">
            <label>Full name<input name="name" required value={form.name} onChange={updateField} placeholder="Your name" /></label>
            <label>Email address<input name="email" required type="email" value={form.email} onChange={updateField} placeholder="you@example.com" /></label>
          </div>
          <label>What is this about?
            <select name="category" value={form.category} onChange={updateField}>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label>Your rating <b>{form.rating}/5</b>
            <input name="rating" type="range" min="1" max="5" value={form.rating} onChange={updateField} />
          </label>
          <label>Your feedback
            <textarea name="message" required minLength="10" value={form.message} onChange={updateField} placeholder="Write your feedback here…" />
          </label>
          <div className="fb-actions">
            <button className="fb-submit" type="submit" disabled={sending}>{sending ? "Sending…" : "Send feedback"}</button>
            <button className="fb-cancel" type="button" onClick={closeFeedback}>Not now</button>
          </div>
          {message && <p className={`fb-message ${message.startsWith("Thanks") ? "is-ok" : "is-error"}`} role="status">{message}</p>}
        </form>
      </div>
    </main>
  );

  return user?.role === "organizer"
    ? <OrganizerShell active="/feedback">{body}</OrganizerShell>
    : <div className="fb-guest-shell">{body}</div>;
}

const CSS = `
  .fb-guest-shell { min-height:100vh; background:#080910; color:#f0ede8; }
  .fb-page { max-width:820px; margin:auto; padding:clamp(25px,6vw,70px) 20px; }
  .fb-card { position:relative; background:linear-gradient(145deg,#181523,#11111a); border:1px solid #ffffff14; border-radius:26px; padding:clamp(26px,5vw,48px); box-shadow:0 24px 70px #0006; }
  .fb-close { position:absolute; top:18px; right:18px; display:inline-flex; align-items:center; gap:7px; border:1px solid #ffffff26; background:#ffffff0a; color:#d8d0c8; border-radius:999px; padding:8px 12px; cursor:pointer; font:600 12px inherit; transition:background .2s,border-color .2s,color .2s; }
  .fb-close span:first-child { font-size:22px; line-height:.7; font-weight:300; }
  .fb-close:hover,.fb-cancel:hover { color:#fff; border-color:#e8c96a88; background:#e8c96a12; }
  .fb-kicker { color:#e8c96a; text-transform:uppercase; letter-spacing:2px; font-size:11px; font-weight:800; }
  .fb-card h1 { font:800 clamp(30px,5vw,48px)/1.05 Syne,sans-serif; margin:12px 0; letter-spacing:-.04em; }
  .fb-card>p { color:#aaa7a0; line-height:1.6; max-width:620px; }
  .fb-optional { font-size:13px; margin-top:8px; color:#8e8994!important; }
  .fb-form { display:grid; gap:16px; margin-top:30px; }
  .fb-form label { display:grid; gap:8px; color:#aaa7a0; font-size:13px; }
  .fb-form label>b { color:#e8c96a; justify-self:end; margin-bottom:-25px; }
  .fb-form input,.fb-form select,.fb-form textarea { box-sizing:border-box; width:100%; background:#ffffff08; border:1px solid #ffffff18; border-radius:12px; color:#f0ede8; padding:14px; font:inherit; outline:none; transition:border-color .2s,box-shadow .2s,background .2s; }
  .fb-form input:focus,.fb-form select:focus,.fb-form textarea:focus { border-color:#e8c96a99; background:#ffffff0d; box-shadow:0 0 0 4px #e8c96a12; }
  .fb-form select option { color:#111; }
  .fb-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .fb-form textarea { resize:vertical; min-height:150px; }
  .fb-form input[type=range] { padding:0; margin-top:4px; accent-color:#e8c96a; }
  .fb-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:4px; }
  .fb-submit,.fb-cancel { border-radius:999px; padding:14px 20px; font:800 14px inherit; cursor:pointer; transition:transform .2s,background .2s,border-color .2s; }
  .fb-submit { border:0; color:#111; background:linear-gradient(135deg,#e8c96a,#fff0a5); }
  .fb-submit:hover:not(:disabled) { transform:translateY(-2px); }
  .fb-submit:disabled { opacity:.6; cursor:wait; }
  .fb-cancel { border:1px solid #ffffff22; color:#b5adb9; background:transparent; }
  .fb-message { font-size:13px; }.fb-message.is-ok { color:#6bf0a0; }.fb-message.is-error { color:#ffaaa8; }
  @media(max-width:600px){.fb-row{grid-template-columns:1fr}.fb-close{top:14px;right:14px}.fb-card{padding-top:62px}}
`;
