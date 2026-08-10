/* ═══════════════════════════════════════════════════════════
   Contact.jsx — Contact Tictify
   Route: /contact. Support contact: tictify@gmail.com
   Class prefix: ct2-  (mirrors Legal.jsx lg2- conventions)
   The form builds a mailto: link from the fields and opens the
   user's email client — no backend required.
═══════════════════════════════════════════════════════════ */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const logo = "/logo.png";
const SUPPORT_EMAIL = "tictify@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

export default function Contact() {
  injectStyles("tictify-contact-css", CSS);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const emailValid = EMAIL_RE.test(email.trim());
  const messageValid = message.trim().length > 0;
  const canSend = emailValid && messageValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;
    const subject = `Tictify enquiry from ${name.trim() || "a visitor"}`;
    const body =
      `Name: ${name.trim() || "-"}\n` +
      `Email: ${email.trim()}\n\n` +
      `${message.trim()}\n`;
    window.location.href =
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="ct2-page">
      <header className="ct2-header">
        <div className="ct2-container ct2-nav">
          <img src={logo} alt="Tictify" className="ct2-logo" onClick={() => navigate("/")} />
          <nav className="ct2-links">
            <button className="ct2-link" onClick={() => navigate("/events")}>Events</button>
            <button className="ct2-btn" onClick={() => navigate("/login")}>Login</button>
          </nav>
        </div>
      </header>

      <main className="ct2-main ct2-container">
        <p className="ct2-eyebrow">Contact</p>
        <h1 className="ct2-h1">Talk to a real human</h1>
        <p className="ct2-intro">
          Whether you&apos;re a guest who needs help with a ticket, an organizer with a question,
          or a brand looking to partner with us, we&apos;d love to hear from you. Send us a note
          below or email us directly — we typically respond within 24–48 hours.
        </p>

        <a className="ct2-mailcard" href={`mailto:${SUPPORT_EMAIL}`}>
          <span className="ct2-mailcard-label">Email us</span>
          <span className="ct2-mailcard-addr">{SUPPORT_EMAIL}</span>
        </a>

        <section className="ct2-section">
          <h2>Send a message</h2>
          <form className="ct2-form" onSubmit={handleSubmit} noValidate>
            <label className="ct2-field">
              <span className="ct2-label">Your name</span>
              <input
                className="ct2-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Okafor"
                autoComplete="name"
              />
            </label>

            <label className="ct2-field">
              <span className="ct2-label">Your email</span>
              <input
                className="ct2-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {email.length > 0 && !emailValid && (
                <span className="ct2-hint">Please enter a valid email address.</span>
              )}
            </label>

            <label className="ct2-field">
              <span className="ct2-label">Message</span>
              <textarea
                className="ct2-input ct2-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                rows={5}
              />
              {message.length > 0 && !messageValid && (
                <span className="ct2-hint">Please add a short message.</span>
              )}
            </label>

            <button className="ct2-submit" type="submit" disabled={!canSend}>
              Send message
            </button>
            {!canSend && (
              <p className="ct2-formnote">
                Enter a valid email and a message to enable sending. Submitting opens your email
                app with the message ready to go.
              </p>
            )}
          </form>
        </section>

        <section className="ct2-section">
          <h2>What we can help with</h2>
          <ul className="ct2-list">
            <li><strong>Buyer support</strong> — trouble paying, a ticket that didn&apos;t arrive, or a refund question.</li>
            <li><strong>Organizer help</strong> — setting up events, ticket types, scanning at the gate or withdrawing earnings.</li>
            <li><strong>Partnerships</strong> — promoters, affiliates, venues and brands who want to work with us.</li>
          </ul>
        </section>

        <section className="ct2-section ct2-links-out">
          <p>
            New here? Learn more <a onClick={() => navigate("/about")}>about Tictify</a>, or{" "}
            <a onClick={() => navigate("/events")}>browse live events</a>.
          </p>
        </section>
      </main>

      <footer className="ct2-footer">
        <div className="ct2-container">
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
.ct2-page{min-height:100svh;display:flex;flex-direction:column}
.ct2-container{max-width:820px;margin:0 auto;padding:0 clamp(18px,5vw,32px);width:100%}
.ct2-header{position:sticky;top:0;z-index:100;background:rgba(8,9,16,.85);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.ct2-nav{height:64px;display:flex;align-items:center;justify-content:space-between}
.ct2-logo{height:30px;cursor:pointer}
.ct2-links{display:flex;gap:8px;align-items:center}
.ct2-link{background:none;border:none;color:var(--muted);font-family:var(--font-b);font-size:14px;padding:8px 12px;cursor:pointer}
.ct2-link:hover{color:var(--text)}
.ct2-btn{background:transparent;border:1px solid var(--border);color:var(--text);font-family:var(--font-b);font-size:13.5px;font-weight:600;padding:9px 18px;border-radius:999px;cursor:pointer}
.ct2-main{flex:1;padding:clamp(40px,7vw,72px) 0 64px}
.ct2-eyebrow{color:var(--gold);font-size:12.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px}
.ct2-h1{font-family:var(--font-h);font-weight:800;font-size:clamp(26px,5.4vw,42px);letter-spacing:-.01em;line-height:1.1;max-width:100%}
.ct2-intro{color:var(--muted);font-size:14.5px;line-height:1.8;max-width:68ch;margin-top:16px}
.ct2-mailcard{display:flex;flex-direction:column;gap:4px;margin-top:26px;background:var(--gold-dim);border:1px solid rgba(232,201,106,.3);border-radius:16px;padding:clamp(18px,4vw,26px);text-decoration:none;text-align:center}
.ct2-mailcard-label{color:var(--muted);font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
.ct2-mailcard-addr{font-family:var(--font-h);font-weight:700;font-size:clamp(18px,4vw,26px);color:var(--gold);word-break:break-all}
.ct2-section{margin-top:clamp(36px,6vw,56px)}
.ct2-section h2{font-family:var(--font-h);font-weight:700;font-size:clamp(21px,3.6vw,28px);padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:20px}
.ct2-form{display:flex;flex-direction:column;gap:18px;max-width:560px}
.ct2-field{display:flex;flex-direction:column;gap:8px}
.ct2-label{color:var(--text);font-size:13.5px;font-weight:600}
.ct2-input{width:100%;background:var(--card);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:var(--font-b);font-size:14.5px;padding:12px 14px;outline:none;transition:border-color .25s}
.ct2-input::placeholder{color:var(--muted)}
.ct2-input:focus{border-color:rgba(232,201,106,.55)}
.ct2-textarea{resize:vertical;min-height:120px;line-height:1.6}
.ct2-hint{color:#e88a8a;font-size:12.5px}
.ct2-submit{align-self:flex-start;background:var(--gold);border:none;color:#080910;font-family:var(--font-b);font-size:14.5px;font-weight:700;padding:12px 26px;border-radius:999px;cursor:pointer;transition:opacity .25s}
.ct2-submit:disabled{opacity:.4;cursor:not-allowed}
.ct2-formnote{color:var(--muted);font-size:12.5px;line-height:1.6;max-width:52ch}
.ct2-list{list-style:none;margin:0;max-width:68ch}
.ct2-list li{position:relative;color:var(--muted);font-size:14.5px;line-height:1.7;padding:0 0 10px 22px}
.ct2-list li::before{content:"";position:absolute;left:2px;top:9px;width:6px;height:6px;border-radius:2px;background:var(--gold)}
.ct2-list li strong{color:var(--text)}
.ct2-links-out p{color:var(--muted);font-size:14.5px;line-height:1.8}
.ct2-links-out a{color:var(--gold);text-decoration:none;cursor:pointer}
.ct2-links-out a:hover{text-decoration:underline}
.ct2-footer{border-top:1px solid var(--border);background:var(--surface);padding:22px 0}
.ct2-footer p{color:var(--muted);font-size:13px;text-align:center}
.ct2-footer a{color:var(--gold);text-decoration:none}
@media (max-width:480px){.ct2-links .ct2-link{display:none}}
`;
