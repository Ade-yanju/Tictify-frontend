/* ═══════════════════════════════════════════════════════════
   ShareSheet.jsx — Tictify 2026 universal share modal
   Self-contained: own injectStyles + `shr-` prefix so any page
   can drop it in. Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Brand icons (inline, dependency-free, currentColor) ──── */

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
export default function ShareSheet({
  url,
  title,
  dateText,
  locationText,
  waBuyUrl,
  onClose,
}) {
  injectStyles("tictify-sharesheet-css", CSS);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const name = title || "this event";
  const where = [dateText, locationText].filter(Boolean).join(" at ");
  const shareText = where
    ? `🎟️ ${name} — ${where}. Get your ticket:`
    : `🎟️ ${name}. Get your ticket:`;
  const textAndUrl = `${shareText} ${shareUrl}`;

  /* Person-to-person channels also carry the buy-on-WhatsApp deep
     link — otherwise a guest who receives a forwarded link has no way
     to discover that buying in chat is even possible. Deliberately
     kept off Twitter/LinkedIn, where a second URL costs characters
     and reads as spam in a public post. */
  const personalText = waBuyUrl
    ? `${textAndUrl}\n\nPrefer WhatsApp? Buy in chat — no app, no signup: ${waBuyUrl}`
    : textAndUrl;

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
      /* With both `text` and `url`, the OS appends the url LAST — which
         would strand the event link after the WhatsApp line. So when
         there's a buy link, share one pre-composed text (it already
         contains the event URL, and receivers still build a preview
         from it) and keep the classic text+url split otherwise. */
      await navigator.share(
        waBuyUrl
          ? { title: name, text: personalText }
          : { title: name, text: shareText, url: shareUrl },
      );
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
      icon: "whatsapp",
      tone: "wa",
      href: `https://wa.me/?text=${e(personalText)}`,
    },
    {
      key: "x",
      label: "X",
      icon: "x",
      tone: "x",
      href: `https://twitter.com/intent/tweet?text=${e(shareText)}&url=${e(shareUrl)}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: "facebook",
      tone: "fb",
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(shareUrl)}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: "telegram",
      tone: "tg",
      href: `https://t.me/share/url?url=${e(shareUrl)}&text=${e(shareText)}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: "linkedin",
      tone: "li",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(shareUrl)}`,
    },
    {
      key: "email",
      label: "Email",
      icon: "mail",
      tone: "gold",
      href: `mailto:?subject=${e(name)}&body=${e(personalText)}`,
    },
    /* SMS only makes sense where there's a messaging app to hand off to */
    ...(canNative
      ? [
          {
            key: "sms",
            label: "SMS",
            icon: "chat",
            tone: "gold",
            href: `sms:?&body=${e(personalText)}`,
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
            <Icon name="close" />
          </button>
        </div>

        {canNative && (
          <button
            className="shr-native"
            onClick={handleNative}
            ref={primaryRef}
            aria-label="Share to any app using your device's share sheet"
          >
            <span className="shr-native-ic"><Icon name="share" /></span> Share to any app
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
              <span className="shr-tile-ic">
                <Icon name={t.icon} />
              </span>
              <span className="shr-tile-label">{t.label}</span>
            </button>
          ))}

          <button
            className={`shr-tile shr-tone-gold ${copied ? "is-copied" : ""}`}
            onClick={handleCopy}
            aria-label={copied ? "Link copied to clipboard" : "Copy event link"}
          >
            <span className="shr-tile-ic"><Icon name={copied ? "check" : "link"} /></span>
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
