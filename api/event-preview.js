/* ═══════════════════════════════════════════════════════════
   api/event-preview.js — per-event Open Graph tags for /events/:id

   The SPA catch-all rewrite serves the same static index.html for
   every route, so shared event links previewed as a generic
   "Tictify" card. This function serves the SAME shell (so the SPA
   still boots and client-side routing takes over) with per-event
   title, Open Graph and Twitter tags injected for crawlers.

   Hard rule: a human must NEVER see a 500 here. Every failure path
   degrades to HTML that still boots the app.
═══════════════════════════════════════════════════════════ */

const BACKEND = "https://tictify-backend.onrender.com";
const CANONICAL_ORIGIN = "https://www.tictify.ng";
const FALLBACK_IMAGE = `${CANONICAL_ORIGIN}/logo.png`;
const TIMEOUT_MS = 3000;

/* Titles carry quotes, ampersands and emoji — attribute-safe escape */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchWithTimeout(url, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* The deployment's own static shell. /index.html is NOT matched by the
   /events/:id rewrite, so fetching it cannot loop back into this function. */
function shellUrl(req) {
  const host =
    process.env.VERCEL_URL ||
    req?.headers?.["x-forwarded-host"] ||
    req?.headers?.host;
  if (!host) return null;
  return /^https?:\/\//i.test(host)
    ? `${host}/index.html`
    : `https://${host}/index.html`;
}

async function fetchShell(req) {
  const url = shellUrl(req);
  if (!url) return null;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const html = await res.text();
    return html && html.trim() ? html : null;
  } catch {
    return null;
  }
}

async function fetchEvent(id) {
  try {
    const res = await fetchWithTimeout(
      `${BACKEND}/api/events/view/${encodeURIComponent(id)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data === "object" && data.title ? data : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

/* Build the tag block. Note: og:image:width/height are deliberately
   omitted — banners are arbitrary sizes and claiming 1200x630 would
   make crawlers render a wrong/cropped card. */
function buildTags(event, id) {
  const title = event.title;
  const dateText = formatDate(event.date);
  const description =
    [title, dateText, event.location].filter(Boolean).join(" · ") ||
    "Get your ticket on Tictify.";
  const image = event.banner || FALLBACK_IMAGE;
  const pageUrl = `${CANONICAL_ORIGIN}/events/${id}`;
  const pageTitle = `${title} | Tictify`;

  const t = escapeHtml(pageTitle);
  const d = escapeHtml(description);
  const i = escapeHtml(image);
  const u = escapeHtml(pageUrl);

  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Tictify" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${i}" />`,
    `<meta property="og:url" content="${u}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${i}" />`,
    `<link rel="canonical" href="${u}" />`,
  ].join("\n    ");
}

/* Drop the shell's generic title/description/og/twitter tags so crawlers
   that take the FIRST match don't read the stale ones. */
function stripGenericTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(
      /<meta\b[^>]*\b(?:property|name)\s*=\s*["'](?:og:[^"']*|twitter:[^"']*|description)["'][^>]*>/gi,
      "",
    )
    .replace(/<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*>/gi, "");
}

function injectTags(shellHtml, tags) {
  const cleaned = stripGenericTags(shellHtml);
  if (/<\/head>/i.test(cleaned)) {
    return cleaned.replace(/<\/head>/i, `    ${tags}\n  </head>`);
  }
  if (/<head[^>]*>/i.test(cleaned)) {
    return cleaned.replace(/<head[^>]*>/i, (m) => `${m}\n    ${tags}`);
  }
  return cleaned.replace(/<body[^>]*>/i, (m) => `${tags}\n${m}`);
}

/* Last resort: the shell is unreachable, so we don't know the hashed
   asset filenames. Boot the SPA by pulling the real shell client-side
   and adopting its script/style tags. Crawlers still get the OG tags. */
function minimalShell(tags) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#080910" />
    <link rel="icon" type="image/png" href="/logo.png" />
    ${tags}
  </head>
  <body style="background:#080910;color:#F0EDE8;font-family:system-ui,sans-serif">
    <div id="root"></div>
    <noscript>
      <p style="padding:24px">
        This page needs JavaScript. <a href="/" style="color:#E8C96A">Open Tictify</a>
      </p>
    </noscript>
    <script>
      (function () {
        fetch("/index.html", { cache: "no-store" })
          .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
          .then(function (html) {
            var doc = new DOMParser().parseFromString(html, "text/html");
            doc.querySelectorAll('link[rel="stylesheet"], link[rel="modulepreload"]').forEach(
              function (l) { document.head.appendChild(l.cloneNode(true)); }
            );
            doc.querySelectorAll("script[src]").forEach(function (s) {
              var el = document.createElement("script");
              if (s.type) el.type = s.type;
              el.src = s.src;
              document.body.appendChild(el);
            });
          })
          .catch(function () {
            document.getElementById("root").innerHTML =
              '<p style="padding:24px">Could not load Tictify. ' +
              '<a href="/" style="color:#E8C96A">Try again</a></p>';
          });
      })();
    </script>
  </body>
</html>`;
}

function send(res, html, { cache }) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.statusCode = 200;
  res.end(html);
}

const FULL_CACHE = "public, s-maxage=300, stale-while-revalidate=600";
/* Don't let a transient backend blip pin a generic preview for 5 minutes */
const DEGRADED_CACHE = "public, s-maxage=30, stale-while-revalidate=60";

export default async function handler(req, res) {
  try {
    const raw = req?.query?.id;
    const id = Array.isArray(raw) ? raw[0] : raw;

    const [eventResult, shellResult] = await Promise.allSettled([
      id ? fetchEvent(id) : Promise.resolve(null),
      fetchShell(req),
    ]);

    const event = eventResult.status === "fulfilled" ? eventResult.value : null;
    const shell = shellResult.status === "fulfilled" ? shellResult.value : null;

    /* Happy path — real shell, real event */
    if (shell && event && id) {
      return send(res, injectTags(shell, buildTags(event, id)), {
        cache: FULL_CACHE,
      });
    }

    /* Shell is fine but the event isn't (404 / timeout / bad id):
       serve the untouched shell. The SPA renders its own error state. */
    if (shell) {
      return send(res, shell, { cache: DEGRADED_CACHE });
    }

    /* No shell. Still emit OG tags if we have the event. */
    const tags =
      event && id
        ? buildTags(event, id)
        : `<title>Tictify</title>\n    <meta property="og:title" content="Tictify" />\n    <meta property="og:image" content="${FALLBACK_IMAGE}" />`;
    return send(res, minimalShell(tags), { cache: DEGRADED_CACHE });
  } catch {
    /* Absolute backstop — never a 500 in front of a human */
    try {
      return send(
        res,
        minimalShell(
          `<title>Tictify</title>\n    <meta property="og:title" content="Tictify" />\n    <meta property="og:image" content="${FALLBACK_IMAGE}" />`,
        ),
        { cache: "no-store" },
      );
    } catch {
      /* If even that throws, the platform's own error page is all that's left */
    }
  }
}
