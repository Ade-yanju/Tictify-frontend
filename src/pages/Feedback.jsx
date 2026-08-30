import { useState } from "react";
import { getToken, getUser } from "../services/authService";

export default function Feedback() {
  const user = getUser();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", category: "GENERAL", rating: 5, message: "" });
  const [state, setState] = useState("");
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) { e.preventDefault(); setState("Sending…"); const token = getToken(); const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(form) }); const data = await res.json().catch(() => ({})); setState(res.ok ? "Thanks — your feedback has been received." : data.message || "Could not send feedback."); }
  return <main style={{ maxWidth: 620, margin: "70px auto", padding: 24, fontFamily: "sans-serif" }}><h1>Share your feedback</h1><p>Tell us how we can improve Tictify.</p><form onSubmit={submit} style={{ display: "grid", gap: 16, marginTop: 24 }}>{!user && <><input name="name" required value={form.name} onChange={update} placeholder="Your name" /><input name="email" type="email" required value={form.email} onChange={update} placeholder="Your email" /></>}<select name="category" value={form.category} onChange={update}>{["GENERAL", "BUG", "FEATURE", "PAYMENT", "OTHER"].map(x => <option key={x}>{x}</option>)}</select><label>Rating <select name="rating" value={form.rating} onChange={update}>{[5, 4, 3, 2, 1].map(x => <option key={x} value={x}>{x}/5</option>)}</select></label><textarea name="message" required minLength={10} maxLength={2000} rows={8} value={form.message} onChange={update} placeholder="Your feedback…" /><button type="submit">Send feedback</button>{state && <p>{state}</p>}</form></main>;
}
