/* =====================================================
   BUY-ON-WHATSAPP DEEP LINKS

   A guest who taps a shared event link lands on the web page with no
   idea the WhatsApp bot exists. These helpers build the wa.me link
   that opens the bot ALREADY POINTED AT THAT EVENT, so the guest
   never has to hunt for it in the browse list.

   The prefilled text is a command the bot parses, not prose:

     event <slug> ref <code>
       └ EVENT_RE in whatsappBot.service.js   └ REF_RE (affiliate)

   Both halves are matched independently by the bot, which is why the
   affiliate code can ride along without breaking the event jump.

   KEEP THE `event ` / `ref ` PREFIXES IN SYNC with those two regexes.
   The bot requires a code-shaped key (a slug ending in the 8-hex id
   tail, a bare 8-hex tail, or a 24-hex ObjectId) so ordinary prose
   can't trigger it — passing anything else here silently degrades to
   "I couldn't find that event".
===================================================== */

/* Digits only, no "+" — wa.me rejects punctuation. Unset or left as
   the placeholder means "not configured": every caller below returns
   null so the UI hides the option instead of linking to a dead chat. */
export function botNumber() {
  const raw = String(import.meta.env.VITE_WHATSAPP_BOT_NUMBER || "").trim();
  if (!raw || raw.toLowerCase().includes("your_")) return null;

  const digits = raw.replace(/\D/g, "");
  return /^\d{10,15}$/.test(digits) ? digits : null;
}

/** True when a "Buy on WhatsApp" affordance can actually work. */
export function whatsappBuyEnabled() {
  return botNumber() !== null;
}

/**
 * Deep link that opens the bot on a specific event.
 *
 * @param {object} event    needs `slug` (preferred) or `_id`
 * @param {string} [promo]  affiliate code to attribute the sale to
 * @returns {string|null}   null when unconfigured or unidentifiable
 */
export function buyOnWhatsAppUrl(event, promo) {
  const number = botNumber();
  if (!number) return null;

  /* Prefer the slug: it already ends in the 8-hex tail the bot needs,
     and it's readable if the guest ever sees the raw text. The _id is
     the fallback for events created before slugs existed. */
  const key = event?.slug || event?._id;
  if (!key) return null;

  const text = promo ? `event ${key} ref ${promo}` : `event ${key}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/* One line to append to shared text, so the WhatsApp option travels
   with every forward instead of living only on the web page. Returns
   "" when unconfigured — callers can concatenate unconditionally. */
export function whatsappBuyLine(event, promo) {
  const url = buyOnWhatsAppUrl(event, promo);
  return url ? `\n\nPrefer WhatsApp? Buy in chat:\n${url}` : "";
}
