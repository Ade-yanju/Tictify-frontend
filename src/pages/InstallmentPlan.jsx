import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function money(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

export default function InstallmentPlan() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = "tictify-installment-plan-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = CSS;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.VITE_API_URL}/api/installments/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Reservation not found");
        return data;
      })
      .then((data) => {
        if (!active) return;
        setPlan(data);
        setAmount(String(data.amountRemaining || ""));
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);

  const dueLabel = useMemo(() => {
    if (!plan?.dueAt) return "—";
    return new Date(plan.dueAt).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [plan]);

  async function payBalance() {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/installments/${token}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount === "" ? plan.amountRemaining : Number(amount) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not start payment");
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  }

  if (loading) return <main className="ip-page"><section className="ip-card"><p>Loading your reservation…</p></section></main>;
  if (error && !plan) return <main className="ip-page"><section className="ip-card"><h1>Reservation unavailable</h1><p>{error}</p></section></main>;

  const paid = plan.status === "PAID";
  const refunded = plan.status === "REFUNDED";
  const expired = plan.status === "EXPIRED";
  const inactive = !["RESERVED", "PARTIALLY_PAID"].includes(plan.status);

  return (
    <main className="ip-page">
      <section className="ip-card">
        <p className="ip-kicker">Tictify · Installment reservation</p>
        <h1>{paid ? "Your ticket is ready" : refunded ? "Reservation refunded" : expired ? "Reservation expired" : "Complete your ticket payment"}</h1>
        <p className="ip-sub">{plan.eventTitle}</p>

        <div className="ip-event">
          <strong>{plan.ticketType} × {plan.quantity}</strong>
          <span>{plan.name} · {plan.email}</span>
        </div>

        <div className="ip-grid">
          <div><span>Paid</span><strong>{money(plan.amountPaid)}</strong></div>
          <div><span>Remaining</span><strong>{money(plan.amountRemaining)}</strong></div>
          <div><span>Status</span><strong>{plan.status.replaceAll("_", " ")}</strong></div>
          <div><span>Complete by</span><strong>{dueLabel}</strong></div>
        </div>

        {paid ? (
          <>
            <p className="ip-message">Your QR ticket has been issued and sent to your email.</p>
            <button className="ip-button" onClick={() => navigate(`/success/${plan.reference}`)}>View ticket</button>
          </>
        ) : refunded ? (
          <p className="ip-message">This reservation expired before completion. A full refund has been issued to your original payment method.</p>
        ) : inactive ? (
          <p className="ip-message">This reservation is no longer active. If a refund is pending, it will be sent to your original payment method.</p>
        ) : (
          <>
            <label className="ip-label" htmlFor="ip-amount">Amount to pay now</label>
            <input
              id="ip-amount"
              className="ip-input"
              type="number"
              min="1"
              max={plan.amountRemaining}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className="ip-help">You can pay the full remaining balance or make another part payment. Payment processing fees are shown by Paystack.</p>
            {error && <p className="ip-error">{error}</p>}
            <button className="ip-button" disabled={processing} onClick={payBalance}>
              {processing ? "Opening secure payment…" : `Pay ${money(amount || plan.amountRemaining)}`}
            </button>
          </>
        )}
        <p className="ip-reference">Reference: {plan.reference}</p>
      </section>
    </main>
  );
}

const CSS = `
.ip-page { min-height:100vh; display:grid; place-items:center; padding:28px 16px; background:#080910; color:#F0EDE8; font-family:DM Sans, sans-serif; }
.ip-card { width:min(100%, 560px); padding:clamp(24px,5vw,44px); border:1px solid rgba(255,255,255,.1); border-radius:24px; background:#0d0f16; box-shadow:0 24px 80px rgba(0,0,0,.3); }
.ip-kicker { color:#E8C96A; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
.ip-card h1 { margin-top:12px; font:700 clamp(26px,5vw,38px)/1.1 Syne, sans-serif; }
.ip-sub { margin-top:10px; color:#8B887E; font-size:15px; }
.ip-event { display:grid; gap:5px; margin:28px 0 20px; padding:16px; border-left:3px solid #E8C96A; background:rgba(255,255,255,.04); }
.ip-event span, .ip-help, .ip-message, .ip-reference { color:#8B887E; font-size:13px; line-height:1.6; }
.ip-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:24px; }
.ip-grid div { display:grid; gap:5px; padding:13px; border:1px solid rgba(255,255,255,.08); border-radius:12px; }
.ip-grid span, .ip-label { color:#8B887E; font-size:11px; text-transform:uppercase; letter-spacing:.08em; }
.ip-grid strong { color:#E8C96A; font-size:15px; }
.ip-label { display:block; margin-bottom:8px; }
.ip-input { width:100%; padding:14px 15px; border:1px solid rgba(255,255,255,.16); border-radius:12px; background:#080910; color:#F0EDE8; font-size:17px; }
.ip-help { margin:10px 0 18px; }
.ip-error { margin:12px 0; color:#E05C5C; font-size:13px; }
.ip-button { width:100%; margin-top:16px; padding:15px 20px; border:0; border-radius:999px; background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-weight:700; cursor:pointer; }
.ip-button:disabled { opacity:.6; cursor:wait; }
.ip-message { margin-top:18px; }
.ip-reference { margin-top:24px; font-size:11px; }
@media (max-width:480px) { .ip-grid { grid-template-columns:1fr; } }
`;
