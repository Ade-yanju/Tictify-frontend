/* ═══════════════════════════════════════════════════════════════════
   ICON SET

   Replaces the emoji that were standing in for icons in product UI
   (🔒 Secure checkout · 🎫 Instant QR ticket · 📧 Email delivery).
   Emoji render differently on every platform, can't inherit colour,
   sit on a different baseline than the text beside them, and read as
   unfinished in a paid-checkout flow.

   These are drawn on a 24px grid at stroke 1.7 with round caps and
   joins — a deliberately consistent hand, rather than a generic
   outline set dropped in without regard to the brand. `fill` icons
   are reserved for brand marks (WhatsApp) that have a fixed form.

   Every icon inherits `currentColor`, so colour comes from the
   surrounding text and status classes rather than being baked in.

   Usage:  <Icon name="lock" />           inherits font-size
           <Icon name="lock" size={18} /> explicit
           <Icon name="lock" label="Secure" />   standalone/meaningful
   ═══════════════════════════════════════════════════════════════════ */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* Each entry is the inner geometry only; <Icon> supplies the <svg>.
   Deliberately not exported — a second export in this file costs React
   Fast Refresh, and nothing outside needs the raw geometry. */
const PATHS = {
  /* ── Trust / checkout ── */
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" {...S} />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" {...S} />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.2-2.9 8-7 9.5-4.1-1.5-7-5.3-7-9.5V6l7-3z" {...S} />
      <path d="M9 12l2.2 2.2L15.5 10" {...S} />
    </>
  ),
  /* A ticket with a QR block — the actual product, not a generic tag */
  ticket: (
    <>
      <path
        d="M4 8.5A1.5 1.5 0 015.5 7h13A1.5 1.5 0 0120 8.5v2a2 2 0 000 4v2a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 16.5v-2a2 2 0 000-4v-2z"
        {...S}
      />
      <path d="M14 7.5v9" {...S} strokeDasharray="1.5 2.5" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1.2" {...S} />
      <rect x="14" y="4" width="6" height="6" rx="1.2" {...S} />
      <rect x="4" y="14" width="6" height="6" rx="1.2" {...S} />
      <path d="M14 14h2.5v2.5H14zM19 14h1M14 19h1M18.5 18.5H20V20" {...S} />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" {...S} />
      <path d="M3.8 7l7.3 5.2a1.6 1.6 0 001.8 0L20.2 7" {...S} />
    </>
  ),
  /* ── Event meta ── */
  pin: (
    <>
      <path d="M12 21s-6.5-5.3-6.5-10.5a6.5 6.5 0 1113 0C18.5 15.7 12 21 12 21z" {...S} />
      <circle cx="12" cy="10.5" r="2.4" {...S} />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" {...S} />
      <path d="M3.5 10h17M8.5 3v4M15.5 3v4" {...S} />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <path d="M12 7.5V12l3 1.8" {...S} />
    </>
  ),
  /* Stopwatch — a pending/elapsing wait, distinct from `clock` (a time) */
  timer: (
    <>
      <circle cx="12" cy="13" r="8" {...S} />
      <path d="M12 9.5V13l2.5 2M9.5 2.5h5" {...S} />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" {...S} />
      <path d="M3.5 19.5a5.5 5.5 0 0111 0" {...S} />
      <path d="M16 5.6a3.2 3.2 0 010 5.8M17.5 14.6a5.5 5.5 0 013 4.9" {...S} />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.5" {...S} />
      <path d="M5.2 20c0-3.5 3-6.3 6.8-6.3s6.8 2.8 6.8 6.3" {...S} />
    </>
  ),
  /* ── Actions ── */
  share: (
    <>
      <path d="M12 15.5V3.5M12 3.5L8 7.5M12 3.5l4 4" {...S} />
      <path d="M5 13.5v5a2 2 0 002 2h10a2 2 0 002-2v-5" {...S} />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2.5" {...S} />
      <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" {...S} />
    </>
  ),
  link: (
    <>
      <path d="M10 14a5 5 0 007.07 0l2.12-2.12a5 5 0 00-7.07-7.07L11 5.93" {...S} />
      <path d="M14 10a5 5 0 00-7.07 0L4.8 12.12a5 5 0 007.07 7.07L13 18.07" {...S} />
    </>
  ),
  /* Sign-out — arrow leaving a door */
  signOut: (
    <path
      d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l-5-5 5-5M5 12h11"
      {...S}
    />
  ),
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" {...S} />,
  arrowLeft: <path d="M19.5 12h-15M10.5 6l-6 6 6 6" {...S} />,
  chevronDown: <path d="M6 9.5l6 6 6-6" {...S} />,
  chevronLeft: <path d="M14.5 5.5l-7 6.5 7 6.5" {...S} />,
  check: <path d="M4.5 12.5l5 5 10-10.5" {...S} strokeWidth="2" />,
  close: <path d="M6 6l12 12M18 6L6 18" {...S} strokeWidth="1.9" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" {...S} />
      <path d="M16 16l4.5 4.5" {...S} />
    </>
  ),
  /* ── Password reveal ── */
  eye: (
    <>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" {...S} />
      <circle cx="12" cy="12" r="2.8" {...S} />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.9 5.1A8.6 8.6 0 0112 4.9c6 0 9.5 5.5 9.5 5.5a17 17 0 01-2.3 2.9" {...S} />
      <path d="M6.4 6.9A17 17 0 002.5 10.4S6 15.9 12 15.9a8.7 8.7 0 003.2-.6" {...S} />
      <path d="M10.2 8.6a2.8 2.8 0 003.9 3.9" {...S} />
      <path d="M3.5 3.5l17 17" {...S} />
    </>
  ),
  /* ── Connectivity (offline scanner states) ── */
  wifi: (
    <>
      <path d="M4 9.5a12 12 0 0116 0" {...S} />
      <path d="M7 13a8 8 0 0110 0" {...S} />
      <circle cx="12" cy="17.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  /* Finish flag — "when the event ends" */
  flag: (
    <>
      <path d="M6 21V4" {...S} />
      <path d="M6 4.5h11l-2.2 4 2.2 4H6" {...S} />
    </>
  ),
  chat: (
    <path d="M20.5 12.5a7.5 7.5 0 01-10.9 6.7L4.5 20.5l1.4-4.7A7.5 7.5 0 1120.5 12.5z" {...S} />
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" {...S} strokeWidth="1.9" />,
  minus: <path d="M5.5 12h13" {...S} strokeWidth="1.9" />,
  /* ── Status ── */
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <path d="M12 7.5v5.5" {...S} />
      <circle cx="12" cy="16.3" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  /* Triangular warning — the louder sibling of `alert`, for full-page
     error states where the shape itself should carry the alarm. */
  alertTriangle: (
    <>
      <path d="M12 3.8l9 15.7H3l9-15.7z" {...S} />
      <path d="M12 10v4.3" {...S} />
      <circle cx="12" cy="16.9" r="1.05" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <path d="M12 11v5.5" {...S} />
      <circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  spark: <path d="M12 3.5l2.2 5.6 5.8 1.9-5.8 1.9L12 20.5l-2.2-7.6L4 11l5.8-1.9z" {...S} />,
  bolt: <path d="M13.2 3L5 14h5.4l-.6 7L18 10h-5.4l.6-7z" {...S} />,
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0111 0c0 3.2.8 5 1.5 6h-14c.7-1 1.5-2.8 1.5-6z" {...S} />
      <path d="M10 19.5a2.2 2.2 0 004 0" {...S} />
    </>
  ),
  /* ── Money ── */
  wallet: (
    <>
      <path d="M3.5 8.5A2.5 2.5 0 016 6h11.5a2 2 0 012 2v9.5a2.5 2.5 0 01-2.5 2.5H6a2.5 2.5 0 01-2.5-2.5v-9z" {...S} />
      <path d="M3.5 9.5h16" {...S} />
      <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  /* Stacked coins — earnings and commission, distinct from `wallet`
     (where money is held) and `trend` (how it's moving). */
  coins: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" {...S} />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" {...S} />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" {...S} />
    </>
  ),
  percent: (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <path d="M9 15l6-6" {...S} />
      <circle cx="9" cy="9" r="1.4" {...S} />
      <circle cx="15" cy="15" r="1.4" {...S} />
    </>
  ),
  /* ── Dashboard / data ── */
  grid: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" {...S} />
      <rect x="13" y="3" width="8" height="5" rx="2" {...S} />
      <rect x="13" y="12" width="8" height="9" rx="2" {...S} />
      <rect x="3" y="15" width="8" height="6" rx="2" {...S} />
    </>
  ),
  bars: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" {...S} />,
  /* Broadcast rings — a LIVE event, not a generic dot */
  live: (
    <>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <path
        d="M7.5 7.5a6.4 6.4 0 000 9M16.5 7.5a6.4 6.4 0 010 9M4.6 4.6a10.5 10.5 0 000 14.8M19.4 4.6a10.5 10.5 0 010 14.8"
        {...S}
      />
    </>
  ),
  /* ── Rewards / programme ── */
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 01-8 0V4z" {...S} />
      <path d="M8 5H5a3 3 0 003 4M16 5h3a3 3 0 01-3 4" {...S} />
      <path d="M12 13v4M8.5 20h7M10 17h4" {...S} />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="9" r="5.5" {...S} />
      <path d="M9.5 13.5L8 21l4-2.2L16 21l-1.5-7.5" {...S} />
      <path d="M10 9l1.5 1.5L14.5 7.5" {...S} />
    </>
  ),
  graduation: (
    <>
      <path d="M12 4L2 9l10 5 10-5-10-5z" {...S} />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" {...S} />
      <path d="M22 9v5" {...S} />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z" {...S} />
      <path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5" {...S} />
      <path d="M9 8h7M9 11.5h5" {...S} />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" {...S} />
      <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M3 12h18" {...S} />
    </>
  ),
  /* Photo — banner/artwork upload slots */
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" {...S} />
      <circle cx="9" cy="10" r="2" {...S} />
      <path d="M3 17l5-4 4 3 4-4 5 5" {...S} />
    </>
  ),
  /* Circled variants — used where a status reads as a verdict */
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <path d="M8.2 12.2l2.6 2.6 5-5.2" {...S} />
    </>
  ),
  closeCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <path d="M9 9l6 6M15 9l-6 6" {...S} />
    </>
  ),
  plusCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <path d="M12 8v8M8 12h8" {...S} />
    </>
  ),
  trend: (
    <>
      <path d="M4 16.5l5-5 3.5 3.5L20 8" {...S} />
      <path d="M15.5 8H20v4.5" {...S} />
    </>
  ),
  /* Bank building — used for the pay-by-transfer route */
  bank: (
    <>
      <path d="M4 10.5l8-5 8 5" {...S} />
      <path d="M6 10.5v7M10 10.5v7M14 10.5v7M18 10.5v7" {...S} />
      <path d="M3.5 20.5h17" {...S} />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" {...S} />
      <path d="M3 9.5h18" {...S} />
      <path d="M6.5 14.5h3" {...S} />
    </>
  ),
  /* ── Brand marks: solid, fixed form ──
     These are third-party logos with an official shape — they get
     drawn as given rather than restyled to our stroke, and they're
     the one place `fill` is correct. */
  x: (
    <path
      fill="currentColor"
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"
    />
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  ),
  telegram: (
    <path
      fill="currentColor"
      d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
    />
  ),
  linkedin: (
    <path
      fill="currentColor"
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
    />
  ),
  whatsapp: (
    <path
      fill="currentColor"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
    />
  ),
};

/**
 * @param {string} name   key of PATHS
 * @param {number} [size] px; omit to scale with surrounding font-size
 * @param {string} [label] accessible name. Omit for decorative icons
 *                         sitting next to visible text — those are
 *                         hidden from screen readers instead of being
 *                         announced twice.
 */
export default function Icon({ name, size, label, className = "", ...rest }) {
  const glyph = PATHS[name];
  if (!glyph) {
    /* A typo'd name would otherwise vanish silently and ship as a
       missing icon. Loud in dev, harmless in production. */
    if (import.meta.env.DEV) {
      console.warn(
        `<Icon name="${name}"> is not in the set. Available: ${Object.keys(PATHS).join(", ")}`,
      );
    }
    return null;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size ?? "1em"}
      height={size ?? "1em"}
      className={`ds-icon ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {label && <title>{label}</title>}
      {glyph}
    </svg>
  );
}
