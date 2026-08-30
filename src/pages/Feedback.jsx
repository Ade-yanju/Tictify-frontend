import { useState } from "react";
import { getToken, getUser } from "../services/authService";

export default function Feedback() {
  const user = getUser();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", category: "GENERAL", rating: 5, message: "" });
  const [state, setState] = useState("");
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) { e.preventDefault(); setState("Sending…"); const token = getToken(); const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(form) }); const data = await res.json().catch(() => ({})); setState(res.ok ? "Thanks — your feedback has been received." : data.message || "Could not send feedback."); }
  return <main style={{ maxWidth: 650, margin: "60px auto", padding: 24, fontFamily: "sans-serif" }}><h1>Help us improve Tictify</h1><p>Your name and email help us follow up. This is optional and takes less than a minute.</p><form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 24 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><input name="name" required value={form.name} onChange={update} placeholder="Your name" /><input name="email" type="email" required value={form.email} onChange={update} placeholder="Your email" /></div><select name="category" value={form.category} onChange={update}>{["GENERAL", "BUG", "FEATURE", "PAYMENT", "OTHER"].map(x => <option key={x}>{x}</option>)}</select><label>Rating: {form.rating}/5 <input name="rating" type="range" min="1" max="5" value={form.rating} onChange={update} /></label><textarea name="message" required minLength={10} rows={7} value={form.message} onChange={update} placeholder="What should we improve?" /><button type="submit">Send feedback</button>{state && <p>{state}</p>}</form></main>;
}
