/* ═══════════════════════════════════════════════════════════
   ShareSheet.jsx — Tictify 2026 universal share modal
   Self-contained: own injectStyles + `shr-` prefix so any page
   can drop it in. Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useCallback, useEffect, useRef, useState } from "react";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Brand icons (inline, dependency-free, currentColor) ──── */
const Ic = {
  native: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M12 15.5V3.5M12 3.5L7.5 8M12 3.5L16.5 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 13.5v5a2 2 0 002 2h11a2 2 0 002-2v-5" strokeLinecap="round" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3.5 7l8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sms: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 11.5a8 8 0 01-8.5 8 9 9 0 01-3.2-.5L4 21l1.2-4a8 8 0 01-1.2-4.2 8 8 0 018.5-8 8 8 0 018.5 7.7z" strokeLinejoin="round" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 13.5a3.5 3.5 0 005 0l3.5-3.5a3.5 3.5 0 00-5-5L12 6.5" strokeLinecap="round" />
      <path d="M14 10.5a3.5 3.5 0 00-5 0L5.5 14a3.5 3.5 0 005 5L12 17.5" strokeLinecap="round" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M4.5 12.5l5 5 10-10.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  ),
};

/* Clipboard with a hidden-textarea fallback for old webviews */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

/* http(s) targets get a real new tab; mailto:/sms: must navigate
   the current context or the browser leaves a dead blank tab behind */
function openTarget(href) {
  if (/^https?:/i.test(href)) {
    window.open(href, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = href;
  }
}

/* ══════════════════════════════════════════════════════════
   ShareSheet — modal. Render only when open.
══════════════════════════════════════════════════════════ */
export default function ShareSheet({ url, title, dateText, locationText, onClose }) {
  injectStyles("tictify-sharesheet-css", CSS);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const name = title || "this event";
  const where = [dateText, locationText].filter(Boolean).join(" at ");
  const shareText = where
    ? `🎟️ ${name} — ${where}. Get your ticket:`
    : `🎟️ ${name}. Get your ticket:`;
  const textAndUrl = `${shareText} ${shareUrl}`;

  const [copied, setCopied] = useState(false);
  const dialogRef = useRef(null);
  const primaryRef = useRef(null);
  const restoreRef = useRef(null);

  const canNative =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  /* Escape closes; Tab cycles inside the dialog */
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes || !nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  /* Move focus in on open, hand it back on close */
  useEffect(() => {
    restoreRef.current =
      typeof document !== "undefined" ? document.activeElement : null;
    primaryRef.current?.focus();
    return () => {
      const el = restoreRef.current;
      if (el && typeof el.focus === "function") el.focus();
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleNative() {
    try {
      await navigator.share({ title: name, text: shareText, url: shareUrl });
    } catch (err) {
      /* User dismissed the OS sheet — not an error worth surfacing */
      if (err?.name === "AbortError") return;
    }
  }

  async function handleCopy() {
    const ok = await copyText(shareUrl);
    if (ok) setCopied(true);
  }

  const e = encodeURIComponent;
  const targets = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: Ic.whatsapp,
      tone: "wa",
      href: `https://wa.me/?text=${e(textAndUrl)}`,
    },
    {
      key: "x",
      label: "X",
      icon: Ic.x,
      tone: "x",
      href: `https://twitter.com/intent/tweet?text=${e(shareText)}&url=${e(shareUrl)}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: Ic.facebook,
      tone: "fb",
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(shareUrl)}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: Ic.telegram,
      tone: "tg",
      href: `https://t.me/share/url?url=${e(shareUrl)}&text=${e(shareText)}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Ic.linkedin,
      tone: "li",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(shareUrl)}`,
    },
    {
      key: "email",
      label: "Email",
      icon: Ic.email,
      tone: "gold",
      href: `mailto:?subject=${e(name)}&body=${e(textAndUrl)}`,
    },
    /* SMS only makes sense where there's a messaging app to hand off to */
    ...(canNative
      ? [
          {
            key: "sms",
            label: "SMS",
            icon: Ic.sms,
            tone: "gold",
            href: `sms:?&body=${e(textAndUrl)}`,
          },
        ]
      : []),
  ];

  return (
    <div className="shr-overlay" onClick={onClose} onKeyDown={onKeyDown}>
      <div
        className="shr-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shr-heading"
        ref={dialogRef}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="shr-head">
          <div className="shr-head-text">
            <h2 className="shr-title" id="shr-heading">
              Share this event
            </h2>
            <p className="shr-sub">{name}</p>
          </div>
          <button
            className="shr-close"
            onClick={onClose}
            aria-label="Close share dialog"
          >
            {Ic.close}
          </button>
        </div>

        {canNative && (
          <button
            className="shr-native"
            onClick={handleNative}
            ref={primaryRef}
            aria-label="Share to any app using your device's share sheet"
          >
            <span className="shr-native-ic">{Ic.native}</span> Share to any app
          </button>
        )}

        <div className="shr-grid">
          {targets.map((t) => (
            <button
              key={t.key}
              className={`shr-tile shr-tone-${t.tone}`}
              onClick={() => openTarget(t.href)}
              aria-label={`Share on ${t.label}`}
              ref={!canNative && t.key === "whatsapp" ? primaryRef : null}
            >
              <span className="shr-tile-ic">{t.icon}</span>
              <span className="shr-tile-label">{t.label}</span>
            </button>
          ))}

          <button
            className={`shr-tile shr-tone-gold ${copied ? "is-copied" : ""}`}
            onClick={handleCopy}
            aria-label={copied ? "Link copied to clipboard" : "Copy event link"}
          >
            <span className="shr-tile-ic">{copied ? Ic.check : Ic.link}</span>
            <span className="shr-tile-label">
              {copied ? "Copied!" : "Copy link"}
            </span>
          </button>
        </div>

        <p className="shr-note" aria-live="polite">
          {canNative
            ? "Instagram & TikTok: use Share to any app — they don’t support direct web sharing."
            : "Instagram & TikTok: copy the link and paste it in your bio or story — they don’t support direct web sharing."}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `
@keyframes shrFade { from { opacity:0; } to { opacity:1; } }
@keyframes shrRise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

.shr-overlay {
  /* above host-page modals (organizer console overlays sit at 2000) */
  position:fixed; inset:0; z-index:3000;
  display:flex; align-items:center; justify-content:center;
  padding:16px;
  background:rgba(4,5,10,.72);
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  animation:shrFade .18s ease;
}
.shr-sheet {
  width:100%; max-width:440px; max-height:calc(100svh - 32px); overflow-y:auto;
  background:#0d0f16; border:1px solid rgba(255,255,255,0.08);
  border-radius:20px; padding:20px;
  font-family:'DM Sans',sans-serif; color:#F0EDE8;
  box-shadow:0 24px 70px rgba(0,0,0,.6);
  animation:shrRise .22s ease;
}

/* ── Head ── */
.shr-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:18px; }
.shr-head-text { min-width:0; }
.shr-title { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; line-height:1.25; color:#F0EDE8; }
.shr-sub { font-size:12.5px; color:#8B887E; margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.shr-close {
  flex-shrink:0; width:36px; height:36px; display:grid; place-items:center;
  border-radius:50%; background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08); color:#8B887E;
  transition:color .2s, border-color .2s;
}
.shr-close:hover { color:#F0EDE8; border-color:rgba(255,255,255,0.18); }
.shr-close svg { width:16px; height:16px; }

/* ── Primary native action ── */
.shr-native {
  width:100%; min-height:52px; margin-bottom:14px;
  display:flex; align-items:center; justify-content:center; gap:10px;
  border:none; border-radius:999px; background:#E8C96A; color:#080910;
  font-family:'Syne',sans-serif; font-weight:700; font-size:15px;
  transition:transform .2s, box-shadow .2s;
}
.shr-native:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(232,201,106,0.22); }
.shr-native-ic { display:inline-grid; place-items:center; }
.shr-native-ic svg { width:18px; height:18px; }

/* ── Platform grid — 2 cols at 320px, never scrolls sideways ── */
.shr-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.shr-tile {
  min-height:52px; min-width:0;
  display:flex; align-items:center; gap:10px; padding:10px 12px;
  border-radius:12px; background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08); color:#F0EDE8;
  font-size:13.5px; font-weight:600; text-align:left;
  transition:border-color .2s, background .2s, transform .2s;
}
.shr-tile:hover { border-color:rgba(255,255,255,0.18); background:rgba(255,255,255,0.07); transform:translateY(-2px); }
.shr-tile-ic { display:inline-grid; place-items:center; flex-shrink:0; width:22px; height:22px; }
.shr-tile-ic svg { width:19px; height:19px; }
.shr-tile-label { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.shr-tile.is-copied { border-color:rgba(107,240,160,.45); background:rgba(107,240,160,.1); }
.shr-tile.is-copied .shr-tile-ic { color:#6BF0A0; }

/* brand tints on the mark only — chrome stays Tictify */
.shr-tone-wa .shr-tile-ic { color:#25D366; }
.shr-tone-x .shr-tile-ic { color:#F0EDE8; }
.shr-tone-fb .shr-tile-ic { color:#1877F2; }
.shr-tone-tg .shr-tile-ic { color:#2AABEE; }
.shr-tone-li .shr-tile-ic { color:#0A66C2; }
.shr-tone-gold .shr-tile-ic { color:#E8C96A; }

/* ── Honest caption ── */
.shr-note { margin-top:14px; font-size:11.5px; line-height:1.6; color:#8B887E; text-align:center; }

/* ══════════ RESPONSIVE ══════════ */
@media (min-width: 400px) {
  .shr-sheet { padding:24px; }
  .shr-grid { grid-template-columns:repeat(3,minmax(0,1fr)); gap:11px; }
  .shr-tile { flex-direction:column; align-items:flex-start; justify-content:center; gap:8px; min-height:78px; padding:12px; }
}
@media (max-width: 399px) {
  .shr-title { font-size:16px; }
}
@media (prefers-reduced-motion: reduce) {
  .shr-overlay, .shr-sheet { animation:none !important; }
  .shr-native, .shr-tile, .shr-close { transition:none !important; }
  .shr-native:hover, .shr-tile:hover { transform:none; }
}
`;
