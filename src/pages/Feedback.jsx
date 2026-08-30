import { useState } from "react";
import { getToken } from "../services/authService";

export default function Feedback() {
  const [form, setForm] = useState({ category: "GENERAL", rating: 5, message: "" });
  const [state, setState] = useState("");
  async function submit(e) { e.preventDefault(); setState("Sending…"); const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(form) }); const data = await res.json().catch(() => ({})); setState(res.ok ? "Thanks — your feedback has been received." : data.message || "Could not send feedback."); if (res.ok) setForm({ category: "GENERAL", rating: 5, message: "" }); }
  return <main style={{ maxWidth: 620, margin: "70px auto", padding: 24, fontFamily: "sans-serif" }}><h1>Share your feedback</h1><p>Tell us what is working and how we can improve Tictify.</p><form onSubmit={submit} style={{ display: "grid", gap: 16, marginTop: 24 }}><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{["GENERAL", "BUG", "FEATURE", "PAYMENT", "OTHER"].map(x => <option key={x}>{x}</option>)}</select><label>Rating <select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map(x => <option key={x} value={x}>{x}/5</option>)}</select></label><textarea required minLength={10} maxLength={2000} rows={8} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Your feedback…" /><button type="submit">Send feedback</button>{state && <p>{state}</p>}</form></main>;
}
