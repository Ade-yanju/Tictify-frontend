/* =====================================================
   WHATSAPP NUMBER NORMALISATION (client mirror)

   A deliberate mirror of backend src/utils/phone.js. It exists so a
   form can reject what the API would reject, instead of round-tripping
   for a 400 — the server still normalises and remains the authority.

   KEEP THE TWO IN SYNC. The canonical form is digits only, country
   code included, no leading "+", because the same human number arrives
   as "0801 234 5678" from a web form and "2348012345678" from the
   WhatsApp Cloud API. Storing either shape raw means the two can never
   be matched to the same organizer.

   Nigeria (+234) is the default market, so a local 0-prefixed number is
   promoted to 234. Numbers that already carry a country code are left
   alone — this must not mangle a +44 or +1 organizer.
===================================================== */

const NG_CC = "234";

/* After the trunk "0", a Nigerian mobile's next digit is 7, 8 or 9.
   Used only to recognise a 10-digit local number typed without its
   leading zero. */
const NG_MOBILE_HEAD = /^[789]/;

/**
 * @param {string|number} input Anything a human might type
 * @returns {string|null} Digits-only E.164 without "+", or null
 */
export function normalizeWhatsApp(input) {
  if (input == null) return null;

  let digits = String(input).replace(/\D/g, "");
  if (!digits) return null;

  /* "00" international prefix (00234…) is the same as "+". */
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = NG_CC + digits.slice(1); // 0801… → 234801…
  } else if (digits.length === 10 && NG_MOBILE_HEAD.test(digits)) {
    digits = NG_CC + digits; // typed without the trunk zero
  }

  /* E.164 allows 15 digits max; below 10 nothing real fits. */
  if (!/^\d{10,15}$/.test(digits)) return null;

  /* A surviving leading zero means neither trunk-form branch matched
     (e.g. the 10-digit typo "0701234567"). No country code starts with
     0, so this could never match the E.164 form the Cloud API sends. */
  if (digits.startsWith("0")) return null;

  return digits;
}

/** True when the input normalises to something usable. */
export function isValidWhatsApp(input) {
  return normalizeWhatsApp(input) !== null;
}

/* Display helper — "+234 801 234 5678" reads better than a digit run
   in confirmation copy. Returns "" for unusable input so callers can
   render it directly. */
export function formatWhatsApp(input) {
  const n = normalizeWhatsApp(input);
  if (!n) return "";
  if (n.startsWith(NG_CC) && n.length === 13) {
    return `+${NG_CC} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`;
  }
  return `+${n}`;
}

export default normalizeWhatsApp;
