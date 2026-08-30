import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function OrganizerReferrals() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(`${import.meta.env.VITE_API_URL}/api/organizer/referrals`, { headers: { Authorization: `Bearer ${getToken()}` } }).then(r => r.json()).then(setData); }, []);
  const link = data && `${window.location.origin}/register?invite=${data.referralCode}`;
  return <main style={{ maxWidth: 680, margin: "60px auto", padding: 24, fontFamily: "sans-serif" }}><h1>Grow with Tictify</h1><p>Invite other organizers and help them start selling tickets. Your referral is attached automatically when they register.</p>{data && <section style={{ marginTop: 24, padding: 24, borderRadius: 16, background: "#151522" }}><p>Your referral code</p><h2>{data.referralCode}</h2><p>{data.referrals} organizer{data.referrals === 1 ? "" : "s"} joined through you.</p><button onClick={() => navigator.clipboard.writeText(link)}>Copy referral link</button> <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join Tictify and create your event: ${link}`)}`, "_blank")}>Share on WhatsApp</button></section>}</main>;
}
