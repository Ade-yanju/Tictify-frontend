/* ═══════════════════════════════════════════════════════════
   Legal.jsx — Terms · Privacy · Refunds
   Routes: /legal (+ /terms, /privacy, /refunds aliases scroll
   to their section). Support contact: tictify@gmail.com
═══════════════════════════════════════════════════════════ */
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

export default function Legal() {
  injectStyles("tictify-legal-css", CSS);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* /terms, /privacy, /refunds land on their section */
  useEffect(() => {
    const map = { "/terms": "terms", "/privacy": "privacy", "/refunds": "refunds" };
    const target = map[pathname];
    if (target) {
      setTimeout(
        () => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }),
        60,
      );
    }
  }, [pathname]);

  const jump = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="lg2-page">
      <header className="lg2-header">
        <div className="lg2-container lg2-nav">
          <img src={logo} alt="Tictify" className="lg2-logo" onClick={() => navigate("/")} />
          <nav className="lg2-links">
            <button className="lg2-link" onClick={() => navigate("/events")}>Events</button>
            <button className="lg2-btn" onClick={() => navigate("/login")}>Login</button>
          </nav>
        </div>
      </header>

      <main className="lg2-main lg2-container">
        <p className="lg2-eyebrow">Legal</p>
        <h1 className="lg2-h1">The fine print, in plain language</h1>
        <p className="lg2-updated">Last updated: July 2026 · Questions? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>

        <nav className="lg2-toc">
          <button onClick={() => jump("terms")}>Terms of Service</button>
          <button onClick={() => jump("privacy")}>Privacy Policy</button>
          <button onClick={() => jump("refunds")}>Refunds &amp; Cancellations</button>
          <button onClick={() => jump("contact")}>Contact</button>
        </nav>

        {/* ═══════════ TERMS ═══════════ */}
        <section id="terms" className="lg2-section">
          <h2>Terms of Service</h2>

          <h3>1. Who we are</h3>
          <p>
            Tictify (&quot;Tictify&quot;, &quot;we&quot;, &quot;us&quot;) operates an online event
            ticketing platform at tictify.ng that lets event organizers create and sell tickets,
            and lets guests discover events and buy tickets with secure QR-code entry. By creating
            an account or buying a ticket, you agree to these terms.
          </p>

          <h3>2. Accounts</h3>
          <p>
            Organizers, affiliates and campus partners must provide accurate details and keep
            their login credentials safe — you are responsible for activity on your account.
            You must be legally able to enter contracts to sell tickets. We may suspend accounts
            that break these terms, attempt fraud, or abuse the platform.
          </p>

          <h3>3. Tickets &amp; entry</h3>
          <p>
            A ticket is a licence to attend the organizer&apos;s event, issued as a unique,
            single-use QR code (group tickets admit the stated number of guests). Duplicated or
            resold QR codes may be refused entry. The organizer — not Tictify — is responsible
            for the event itself: the venue, lineup, safety, age limits and delivery of what was
            advertised.
          </p>

          <h3>4. Fees</h3>
          <p>
            Ticket buyers pay the ticket price plus a Tictify service fee and a payment-processing
            fee — every fee is itemized at checkout before payment. Organizers receive the full
            ticket price. Withdrawals to bank accounts carry a small bank-transfer fee shown
            before the request is confirmed. Affiliate membership costs a one-time fee shown at
            signup. All fees are stated in Nigerian Naira (₦).
          </p>

          <h3>5. Payments &amp; payouts</h3>
          <p>
            Payments are processed by Paystack; Tictify never sees or stores your card details.
            Organizer revenue accrues to a platform wallet and is paid out to Nigerian bank
            accounts on request, subject to review. We may hold or reverse wallet balances where
            fraud, chargebacks or event cancellation require it.
          </p>

          <h3>6. Affiliates, partners &amp; commissions</h3>
          <p>
            Affiliates earn the commission percentage set by the organizer on events that allow
            affiliate promotion. Campus Partners earn a commission from Tictify&apos;s own service
            fee. Commissions accrue only on genuine, completed sales; we may withhold or reverse
            commissions arising from fraud, self-purchases, refunded orders or manipulation, and
            may revoke partner or affiliate accounts that abuse the programme.
          </p>

          <h3>7. Acceptable use</h3>
          <p>
            No unlawful events or content, no misleading event listings, no infringing images,
            no attempts to bypass fees, scrape the platform, or interfere with its operation.
            Organizers confirm they hold the rights to any banner or artwork they upload.
          </p>

          <h3>8. Liability</h3>
          <p>
            Tictify provides the ticketing technology &quot;as is&quot;. To the fullest extent the
            law allows, we are not liable for the conduct of organizers or guests, for events
            being changed, postponed or cancelled, or for indirect losses. Our total liability
            for any claim is limited to the fees Tictify earned on the transaction concerned.
            Nothing here excludes liability that cannot be excluded under Nigerian law.
          </p>

          <h3>9. Changes &amp; governing law</h3>
          <p>
            We may update these terms as the platform evolves; the latest version always lives on
            this page with its date above. Material changes will be highlighted on the site.
            These terms are governed by the laws of the Federal Republic of Nigeria.
          </p>
        </section>

        {/* ═══════════ PRIVACY ═══════════ */}
        <section id="privacy" className="lg2-section">
          <h2>Privacy Policy</h2>

          <h3>What we collect</h3>
          <p>
            <strong>Guests:</strong> name and email at checkout — used to issue your ticket, send
            it to your inbox, and let you retrieve it later. <strong>Organizers, affiliates and
            campus partners:</strong> name, email, and (for partners) university, WhatsApp number
            and application details. <strong>Payouts:</strong> the bank account details you
            provide for withdrawals. We never see or store card numbers — payment is handled
            end-to-end by Paystack.
          </p>

          <h3>How we use it</h3>
          <p>
            To run the platform: issuing tickets and QR codes, sending transactional emails
            (tickets, receipts, account emails), processing payouts and commissions, preventing
            fraud, and — only if you opt in — push notifications about new events. We use
            cookieless analytics to understand page traffic; it does not identify you.
          </p>

          <h3>Sharing</h3>
          <p>
            Organizers see the guest list (name, email, ticket type, entry status) for their own
            events only. Payment data flows through Paystack; emails are delivered through
            established email providers; images are hosted on Cloudinary. We never sell your
            personal data.
          </p>

          <h3>Retention &amp; your rights</h3>
          <p>
            We keep transaction records as required for accounting and fraud prevention. In line
            with the Nigeria Data Protection Act (NDPA), you may request a copy of your data, a
            correction, or deletion of your account by emailing{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the address on the
            account. We respond within 30 days.
          </p>
        </section>

        {/* ═══════════ REFUNDS ═══════════ */}
        <section id="refunds" className="lg2-section">
          <h2>Refunds &amp; Cancellations</h2>

          <h3>Cancelled events</h3>
          <p>
            If an event is cancelled, ticket sales stop immediately, QR codes are deactivated,
            and refunds of the full amount paid (including fees) are issued automatically to the
            original payment method. Bank processing typically takes 3–10 working days to
            reflect.
          </p>

          <h3>Change of mind</h3>
          <p>
            Tickets are generally non-refundable unless the organizer&apos;s own policy says
            otherwise or the event is cancelled or materially changed (for example a new date you
            cannot attend). For requests, contact the organizer first; if you cannot reach them,
            email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your payment
            reference (it starts with <code>TICTIFY-</code>) and we will help mediate.
          </p>

          <h3>Duplicate or failed charges</h3>
          <p>
            If you were charged but did not receive a ticket, your payment is recoverable — email
            us with the payment reference and we will either complete the ticket or refund the
            charge. Duplicate charges for the same order are always refunded.
          </p>

          <h3>Affiliate membership</h3>
          <p>
            The affiliate joining fee is refundable within 7 days of payment if you have not yet
            generated any promotional links, and otherwise non-refundable.
          </p>
        </section>

        {/* ═══════════ CONTACT ═══════════ */}
        <section id="contact" className="lg2-section lg2-contact">
          <h2>Contact us</h2>
          <p>
            Support, refunds, data requests, partnerships — one inbox, real humans:
          </p>
          <a className="lg2-mail" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          <p className="lg2-small">We aim to reply within 24–48 hours.</p>
        </section>
      </main>

      <footer className="lg2-footer">
        <div className="lg2-container">
          <p>© {new Date().getFullYear()} Tictify. All rights reserved. · <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        </div>
      </footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#080910;--surface:#0d0f16;--card:rgba(255,255,255,0.04);--border:rgba(255,255,255,0.08);--gold:#E8C96A;--gold-dim:rgba(232,201,106,0.12);--text:#F0EDE8;--muted:#8B887E;--font-h:'Syne',sans-serif;--font-b:'DM Sans',sans-serif}
body{background:var(--bg);color:var(--text);font-family:var(--font-b);-webkit-font-smoothing:antialiased;overflow-x:clip}
.lg2-page{min-height:100svh;display:flex;flex-direction:column}
.lg2-container{max-width:820px;margin:0 auto;padding:0 clamp(18px,5vw,32px);width:100%}
.lg2-header{position:sticky;top:0;z-index:100;background:rgba(8,9,16,.85);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.lg2-nav{height:64px;display:flex;align-items:center;justify-content:space-between}
.lg2-logo{height:30px;cursor:pointer}
.lg2-links{display:flex;gap:8px;align-items:center}
.lg2-link{background:none;border:none;color:var(--muted);font-family:var(--font-b);font-size:14px;padding:8px 12px;cursor:pointer}
.lg2-link:hover{color:var(--text)}
.lg2-btn{background:transparent;border:1px solid var(--border);color:var(--text);font-family:var(--font-b);font-size:13.5px;font-weight:600;padding:9px 18px;border-radius:999px;cursor:pointer}
.lg2-main{flex:1;padding:clamp(40px,7vw,72px) 0 64px}
.lg2-eyebrow{color:var(--gold);font-size:12.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px}
.lg2-h1{font-family:var(--font-h);font-weight:800;font-size:clamp(26px,5.4vw,42px);letter-spacing:-.01em;line-height:1.1;max-width:100%}
.lg2-updated{color:var(--muted);font-size:13.5px;margin-top:12px}
.lg2-updated a{color:var(--gold);text-decoration:none}
.lg2-toc{display:flex;gap:8px;flex-wrap:wrap;margin:26px 0 10px}
.lg2-toc button{background:var(--card);border:1px solid var(--border);color:var(--text);font-family:var(--font-b);font-size:13px;font-weight:600;padding:9px 16px;border-radius:999px;cursor:pointer;transition:border-color .25s,color .25s}
.lg2-toc button:hover{border-color:rgba(232,201,106,.5);color:var(--gold)}
.lg2-section{margin-top:clamp(36px,6vw,56px);scroll-margin-top:84px}
.lg2-section h2{font-family:var(--font-h);font-weight:700;font-size:clamp(21px,3.6vw,28px);padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:20px}
.lg2-section h3{font-family:var(--font-h);font-weight:700;font-size:15.5px;color:var(--gold);margin:24px 0 8px}
.lg2-section p{color:var(--muted);font-size:14.5px;line-height:1.8;max-width:68ch}
.lg2-section p strong{color:var(--text)}
.lg2-section a{color:var(--gold);text-decoration:none}
.lg2-section code{background:var(--card);border:1px solid var(--border);border-radius:6px;padding:2px 7px;font-size:12.5px;color:var(--gold)}
.lg2-contact{background:var(--gold-dim);border:1px solid rgba(232,201,106,.3);border-radius:20px;padding:clamp(24px,5vw,40px);text-align:center}
.lg2-contact h2{border:none;margin-bottom:8px;padding-bottom:0}
.lg2-contact p{margin:0 auto}
.lg2-mail{display:inline-block;font-family:var(--font-h);font-weight:700;font-size:clamp(17px,3.4vw,24px);color:var(--gold);text-decoration:none;margin:16px 0 6px;word-break:break-all}
.lg2-small{font-size:12.5px !important}
.lg2-footer{border-top:1px solid var(--border);background:var(--surface);padding:22px 0}
.lg2-footer p{color:var(--muted);font-size:13px;text-align:center}
.lg2-footer a{color:var(--gold);text-decoration:none}
@media (max-width:480px){.lg2-links .lg2-link{display:none}}
`;
