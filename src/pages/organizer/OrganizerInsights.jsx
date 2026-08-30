import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function OrganizerInsights() {
  const [events, setEvents] = useState([]); const [referrals, setReferrals] = useState(null);
  useEffect(() => { const headers = { Authorization: `Bearer ${getToken()}` }; Promise.all([fetch(`${import.meta.env.VITE_API_URL}/api/organizer/events/stats`, { headers }).then(r => r.json()), fetch(`${import.meta.env.VITE_API_URL}/api/organizer/referrals`, { headers }).then(r => r.json())]).then(([e, r]) => { setEvents(Array.isArray(e) ? e : []); setReferrals(r); }); }, []);
  const sold = events.reduce((n, e) => n + (e.ticketsSold || 0), 0); const scanned = events.reduce((n, e) => n + (e.ticketsScanned || 0), 0); const rate = sold ? Math.round(scanned / sold * 100) : 0;
  const badges = [[events.length > 0, "First event"], [sold >= 10, "Ticket seller"], [sold >= 100, "Crowd builder"], [rate >= 80 && sold > 0, "Great host"], [referrals?.referrals > 0, "Community builder"]].filter(x => x[0]).map(x => x[1]);
  return <main style={{ maxWidth: 1000, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}><h1>Organizer insights</h1><p>Track your progress and plan your next successful event.</p><section style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "24px 0" }}>{badges.map(b => <span key={b} style={{ padding: "10px 15px", borderRadius: 999, background: "#fff0b0" }}>🏆 {b}</span>)}</section><section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>{[["Events", events.length], ["Tickets sold", sold], ["Attendance", `${rate}%`], ["Referrals", referrals?.referrals || 0]].map(([l, v]) => <article key={l} style={{ padding: 20, borderRadius: 16, background: "#151522" }}><small>{l}</small><h2>{v}</h2></article>)}</section></main>;
}
