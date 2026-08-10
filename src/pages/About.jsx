/* ═══════════════════════════════════════════════════════════
   About.jsx — About Tictify
   Route: /about. Support contact: tictify@gmail.com
   Class prefix: ab2-  (mirrors Legal.jsx lg2- conventions)
═══════════════════════════════════════════════════════════ */
import { useNavigate } from "react-router-dom";

const logo = "/logo.png";
const SUPPORT_EMAIL = "tictify@gmail.com";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

export default function About() {
  injectStyles("tictify-about-css", CSS);
  const navigate = useNavigate();

  return (
    <div className="ab2-page">
      <header className="ab2-header">
        <div className="ab2-container ab2-nav">
          <img src={logo} alt="Tictify" className="ab2-logo" onClick={() => navigate("/")} />
          <nav className="ab2-links">
            <button className="ab2-link" onClick={() => navigate("/events")}>Events</button>
            <button className="ab2-btn" onClick={() => navigate("/login")}>Login</button>
          </nav>
        </div>
      </header>

      <main className="ab2-main ab2-container">
        <p className="ab2-eyebrow">About</p>
        <h1 className="ab2-h1">Ticketing built for how Nigeria celebrates</h1>
        <p className="ab2-updated">
          Questions? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>

        <section className="ab2-section">
          <h2>What Tictify is</h2>
          <p>
            Tictify is a Nigerian event ticketing platform that connects the people who throw
            events with the people who show up for them. Organizers use Tictify to publish an
            event and sell tickets online in minutes; attendees use it to discover what&apos;s
            happening, pay securely, and walk in with a ticket that actually works. Every ticket
            we issue is a unique QR code, delivered straight to your email, that is scanned once
            at the gate — no paper stubs to lose, no screenshots to forge, no long queues to
            stand in.
          </p>
          <p>
            We built Tictify because buying and selling tickets in Nigeria should be as simple as
            sending a message. Whether it&apos;s a detty-December concert, a campus night, a
            comedy show, a wedding after-party or a music festival, the flow should be clear, the
            payment should be trusted, and the money should reach the organizer&apos;s bank
            account without drama.
          </p>
        </section>

        <section className="ab2-section">
          <h2>Who it&apos;s for</h2>
          <p>
            Tictify is for <strong>event organizers</strong> putting on parties, concerts,
            festivals, campus events, comedy nights, shows and everything in between — and for the{" "}
            <strong>attendees</strong> across Nigeria who want a safe, straightforward way to buy
            their spot. If you host events or you love going to them, Tictify was made with you in
            mind.
          </p>
        </section>

        <section className="ab2-section">
          <h2>How it works — if you&apos;re attending</h2>
          <p>Buying a ticket takes a couple of minutes and no account setup:</p>
          <ul className="ab2-list">
            <li>Browse live events on the <a onClick={() => navigate("/events")}>events page</a> and open the one you want.</li>
            <li>Choose your ticket type — regular, VIP, early-bird, group or whatever the organizer has set up.</li>
            <li>Pay securely by card or bank transfer through Paystack. We never see or store your card details.</li>
            <li>Receive your unique QR-code ticket by email the moment payment is confirmed.</li>
            <li>Show the QR code at the gate — it&apos;s scanned once, and you&apos;re in.</li>
          </ul>
        </section>

        <section className="ab2-section">
          <h2>How it works — if you&apos;re organizing</h2>
          <p>Everything you need to run ticketing lives in one dashboard:</p>
          <ul className="ab2-list">
            <li>Create an event with your banner, details, date and venue.</li>
            <li>Set up ticket types and prices — including early-bird, group and discounted tickets.</li>
            <li>Sell online and share one link everywhere your audience already is.</li>
            <li>Track sales and revenue in real time as tickets go out.</li>
            <li>Scan guests in at the gate from any phone — no special hardware needed.</li>
            <li>Withdraw your earnings to a Nigerian bank account whenever you&apos;re ready.</li>
          </ul>
          <p>
            Importantly, organizers keep the full ticket price they set. Tictify&apos;s service
            fee and the payment-processing fee are added on top at checkout and paid by the guest,
            so the price you set is the amount that reaches your wallet.
          </p>
        </section>

        <section className="ab2-section">
          <h2>What makes Tictify different</h2>
          <ul className="ab2-list">
            <li><strong>Secure QR entry</strong> — single-use codes that stop duplicated and resold tickets at the door.</li>
            <li><strong>Real-time sales</strong> — watch tickets sell and revenue grow live, not after the event.</li>
            <li><strong>Automatic payouts</strong> — withdraw straight to your Nigerian bank account.</li>
            <li><strong>Flexible pricing</strong> — discount, early-bird and group tickets built in.</li>
            <li><strong>Promoter &amp; affiliate tools</strong> — let partners help you sell and earn a commission you control.</li>
          </ul>
        </section>

        <section className="ab2-section">
          <h2>Our mission</h2>
          <p>
            We&apos;re on a simple mission: to make event ticketing simple, secure and affordable
            for Nigerian event culture — so organizers can focus on the show and guests can focus
            on the moment.
          </p>
        </section>

        <section className="ab2-section ab2-cta">
          <h2>Ready to get started?</h2>
          <p>
            <a onClick={() => navigate("/events")}>Browse events</a> to find your next night out, or{" "}
            <a onClick={() => navigate("/contact")}>get in touch</a> if you&apos;d like to sell with
            us. You can also read our{" "}
            <a onClick={() => navigate("/terms")}>Terms of Service</a>,{" "}
            <a onClick={() => navigate("/privacy")}>Privacy Policy</a> and{" "}
            <a onClick={() => navigate("/refunds")}>Refunds &amp; Cancellations</a> policy.
          </p>
        </section>
      </main>

      <footer className="ab2-footer">
        <div className="ab2-container">
          <p>© {new Date().getFullYear()} Tictify. All rights reserved. · <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        </div>
      </footer>
    </div>
  );
}

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#080910;--surface:#0d0f16;--card:rgba(255,255,255,0.04);--border:rgba(255,255,255,0.08);--gold:#E8C96A;--gold-dim:rgba(232,201,106,0.12);--text:#F0EDE8;--muted:#8B887E;--font-h:'Syne',sans-serif;--font-b:'DM Sans',sans-serif}
body{background:var(--bg);color:var(--text);font-family:var(--font-b);-webkit-font-smoothing:antialiased;overflow-x:clip}
.ab2-page{min-height:100svh;display:flex;flex-direction:column}
.ab2-container{max-width:820px;margin:0 auto;padding:0 clamp(18px,5vw,32px);width:100%}
.ab2-header{position:sticky;top:0;z-index:100;background:rgba(8,9,16,.85);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.ab2-nav{height:64px;display:flex;align-items:center;justify-content:space-between}
.ab2-logo{height:30px;cursor:pointer}
.ab2-links{display:flex;gap:8px;align-items:center}
.ab2-link{background:none;border:none;color:var(--muted);font-family:var(--font-b);font-size:14px;padding:8px 12px;cursor:pointer}
.ab2-link:hover{color:var(--text)}
.ab2-btn{background:transparent;border:1px solid var(--border);color:var(--text);font-family:var(--font-b);font-size:13.5px;font-weight:600;padding:9px 18px;border-radius:999px;cursor:pointer}
.ab2-main{flex:1;padding:clamp(40px,7vw,72px) 0 64px}
.ab2-eyebrow{color:var(--gold);font-size:12.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px}
.ab2-h1{font-family:var(--font-h);font-weight:800;font-size:clamp(26px,5.4vw,42px);letter-spacing:-.01em;line-height:1.1;max-width:100%}
.ab2-updated{color:var(--muted);font-size:13.5px;margin-top:12px}
.ab2-updated a{color:var(--gold);text-decoration:none}
.ab2-section{margin-top:clamp(36px,6vw,56px)}
.ab2-section h2{font-family:var(--font-h);font-weight:700;font-size:clamp(21px,3.6vw,28px);padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:20px}
.ab2-section p{color:var(--muted);font-size:14.5px;line-height:1.8;max-width:68ch;margin-bottom:14px}
.ab2-section p:last-child{margin-bottom:0}
.ab2-section p strong{color:var(--text)}
.ab2-section a{color:var(--gold);text-decoration:none;cursor:pointer}
.ab2-section a:hover{text-decoration:underline}
.ab2-list{list-style:none;margin:4px 0 0;max-width:68ch}
.ab2-list li{position:relative;color:var(--muted);font-size:14.5px;line-height:1.7;padding:0 0 10px 22px}
.ab2-list li::before{content:"";position:absolute;left:2px;top:9px;width:6px;height:6px;border-radius:2px;background:var(--gold)}
.ab2-list li strong{color:var(--text)}
.ab2-list a{color:var(--gold);text-decoration:none;cursor:pointer}
.ab2-cta{background:var(--gold-dim);border:1px solid rgba(232,201,106,.3);border-radius:20px;padding:clamp(24px,5vw,40px)}
.ab2-cta h2{border:none;padding-bottom:0;margin-bottom:12px}
.ab2-footer{border-top:1px solid var(--border);background:var(--surface);padding:22px 0}
.ab2-footer p{color:var(--muted);font-size:13px;text-align:center}
.ab2-footer a{color:var(--gold);text-decoration:none}
@media (max-width:480px){.ab2-links .ab2-link{display:none}}
`;
