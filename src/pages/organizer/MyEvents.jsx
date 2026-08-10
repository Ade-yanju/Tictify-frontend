/* ═══════════════════════════════════════════════════════════
   MyEvents.jsx — Tictify 2026 Organizer Console
   Syne + DM Sans · ink #080910 · gold #E8C96A
   UI overhaul only — fetch / publish / end / delete / share
   logic preserved exactly.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import ShareSheet from "../../components/ShareSheet";
import { buyOnWhatsAppUrl } from "../../utils/whatsapp";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* ── Shell nav icons (inline, dependency-free) ───────────────── */
const NavIc = {
  dashboard: (
    <Icon name="grid" />
  ),
  create: (
    <Icon name="plusCircle" />
  ),
  events: (
    <Icon name="calendar" />
  ),
  sales: (
    <Icon name="bars" />
  ),
  scan: (
    <Icon name="qr" />
  ),
  withdraw: (
    <Icon name="wallet" />
  ),
};

const NAV_ITEMS = [
  { label: "Dashboard", path: "/organizer/dashboard", icon: NavIc.dashboard },
  { label: "Create Event", path: "/organizer/create-event", icon: NavIc.create },
  { label: "My Events", path: "/organizer/events", icon: NavIc.events },
  { label: "Sales", path: "/organizer/sales", icon: NavIc.sales },
  { label: "Scan Tickets", path: "/organizer/scan/select", icon: NavIc.scan },
  { label: "Withdraw", path: "/organizer/withdraw", icon: NavIc.withdraw },
];

/* ── App shell: sidebar ≥1024px, top bar + drawer below ──────── */
function Shell({ active, children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const navButtons = NAV_ITEMS.map((item) => (
    <button
      key={item.path}
      className={`mev-nav-item ${active === item.path ? "is-active" : ""}`}
      onClick={() => go(item.path)}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </button>
  ));

  return (
    <div className="mev-shell">
      <aside className="mev-side">
        <button className="mev-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tictify<em>.</em>
        </button>
        <nav className="mev-nav">{navButtons}</nav>
      </aside>

      <div className="mev-body">
        <div className="mev-topbar">
          <button className="mev-wordmark" onClick={() => go("/organizer/dashboard")}>
            Tictify<em>.</em>
          </button>
          <button
            className={`mev-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`mev-drawer ${menuOpen ? "is-open" : ""}`}>
          <nav className="mev-nav">{navButtons}</nav>
        </div>

        <main className="mev-main">{children}</main>
      </div>
    </div>
  );
}

/* ── Presentational helpers ──────────────────────────────────── */
function statusClass(status) {
  if (status === "LIVE") return "is-live";
  if (status === "ENDED") return "is-ended";
  if (status === "DRAFT") return "is-draft";
  return "is-pending";
}
function fmtMoney(n) {
  const v = Number(n);
  if (isNaN(v)) return "₦0";
  return `₦${v.toLocaleString()}`;
}

const CATEGORIES = [
  "Nightlife",
  "Comedy",
  "Concert",
  "Sports",
  "Workshop",
  "Festival",
  "Campus",
  "Other",
];

/* datetime → value usable by <input type="datetime-local"> */
function toLocalInput(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function MyEvents() {
  injectStyles("tictify-mev-css", CSS);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [shareEvent, setShareEvent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [promoEvent, setPromoEvent] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [discountEvent, setDiscountEvent] = useState(null);
  const [successNotice, setSuccessNotice] = useState("");

  useEffect(() => {
    if (!successNotice) return;
    const t = setTimeout(() => setSuccessNotice(""), 3000);
    return () => clearTimeout(t);
  }, [successNotice]);

  /* ================= FETCH ================= */
  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/organizer`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= ACTIONS ================= */
  async function updateStatus(id, action) {
    if (processingId) return;
    setProcessingId(id);

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/${action}/${id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      await fetchEvents();
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteEvent(id) {
    if (processingId) return;
    setProcessingId(id);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      await fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
      setConfirmDelete(null);
    }
  }

  /* ================= GUEST LIST CSV EXPORT ================= */
  async function exportGuestList(event) {
    if (exportingId) return;
    setExportingId(event._id);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/export/${event._id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!res.ok) {
        throw new Error(
          res.status === 403
            ? "You don't have permission to export this guest list."
            : "Could not export the guest list. Please try again.",
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(event.title || "event")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-guest-list.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorNotice(err.message || "Export failed. Please try again.");
    } finally {
      setExportingId(null);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Shell active="/organizer/events">
      {confirmDelete && (
        <ConfirmModal
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => deleteEvent(confirmDelete)}
        />
      )}

      {promoEvent && (
        <PromoterModal
          event={promoEvent}
          onClose={() => setPromoEvent(null)}
        />
      )}

      {shareEvent && (
        <ShareSheet
          url={`${window.location.origin}/events/${shareEvent.slug || shareEvent._id}`}
          title={shareEvent.title}
          dateText={new Date(shareEvent.date).toDateString()}
          locationText={shareEvent.location}
          waBuyUrl={buyOnWhatsAppUrl(shareEvent)}
          onClose={() => setShareEvent(null)}
        />
      )}

      {errorNotice && (
        <ErrorModal
          message={errorNotice}
          onClose={() => setErrorNotice(null)}
        />
      )}

      {editEvent && (
        <EditEventModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onSaved={async (message) => {
            setEditEvent(null);
            setSuccessNotice(message || "Event updated successfully");
            await fetchEvents();
          }}
        />
      )}

      {discountEvent && (
        <DiscountModal
          event={discountEvent}
          onClose={() => setDiscountEvent(null)}
        />
      )}

      {successNotice && (
        <div className="mev-toast" role="status">
          {successNotice}
        </div>
      )}

      {/* HEADER */}
      <header className="mev-head">
        <div>
          <h1 className="mev-title">My Events</h1>
          <p className="mev-sub">Manage, publish, and monitor your events</p>
        </div>

        <button
          className="mev-btn mev-btn-gold"
          onClick={() => navigate("/organizer/create-event")}
        >
          + Create Event
        </button>
      </header>

      {/* LOADING SKELETON */}
      {loading && (
        <section className="mev-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="mev-skel-card" key={i}>
              <div className="mev-skel mev-skel-banner" />
              <div className="mev-skel" style={{ height: 18, width: "70%" }} />
              <div className="mev-skel" style={{ height: 13, width: "50%" }} />
              <div className="mev-skel" style={{ height: 34 }} />
            </div>
          ))}
        </section>
      )}

      {/* EMPTY */}
      {!loading && events.length === 0 && (
        <section className="mev-empty">
          <p className="mev-empty-icon"><Icon name="calendar" /></p>
          <h3 className="mev-empty-title">No events yet</h3>
          <p className="mev-empty-text">
            Create your first event and start selling tickets.
          </p>
          <button
            className="mev-btn mev-btn-gold"
            onClick={() => navigate("/organizer/create-event")}
          >
            Create Event
          </button>
        </section>
      )}

      {/* GRID */}
      {!loading && events.length > 0 && (
        <section className="mev-grid">
          {events.map((event) => {
            /* Server-computed availability mirrors the checkout guards
               exactly, so these numbers are what will actually sell. */
            const avail = event.availability;
            const capacity = Number(avail?.capacity ?? event.capacity) || 0;
            const sold =
              Number(avail?.totalSold ?? event.sold ?? event.ticketsSold ?? 0) || 0;
            const left =
              avail?.remaining != null
                ? avail.remaining
                : Math.max(0, capacity - sold);
            const tiers = avail?.tiers || [];
            const pct =
              capacity > 0
                ? Math.min(100, Math.round((sold / capacity) * 100))
                : 0;

            return (
              <article key={event._id} className="mev-card">
                <div className="mev-banner">
                  {event.banner ? (
                    <img src={event.banner} alt="" loading="lazy" />
                  ) : (
                    <span className="mev-banner-fallback" aria-hidden="true">
                      {(event.title || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className={`mev-badge ${statusClass(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                <div className="mev-card-body">
                  <h3 className="mev-card-title">{event.title}</h3>
                  <p className="mev-card-meta">
                    {new Date(event.date).toDateString()} • {event.location}
                  </p>

                  {capacity > 0 && (
                    <div className="mev-progress-wrap">
                      <div className="mev-progress">
                        <div
                          className="mev-progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="mev-progress-label">
                        {sold} sold · {left} left of {capacity} · {pct}%
                      </span>
                    </div>
                  )}

                  {/* Per-tier breakdown — stacks to one row per tier on
                      narrow screens (see .mev-tiers @media below) */}
                  {tiers.length > 0 && (
                    <ul className="mev-tiers">
                      {tiers.map((t) => (
                        <li
                          className={`mev-tier ${t.soldOut ? "is-out" : ""}`}
                          key={t.name}
                        >
                          <span className="mev-tier-name" title={t.name}>
                            {t.name}
                          </span>
                          <span className="mev-tier-sold">
                            {t.sold}/{t.quantity ?? "—"}
                          </span>
                          <span className="mev-tier-left">
                            {t.soldOut ? "Sold out" : `${t.remaining} left`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {event.revenue != null && (
                    <p className="mev-revenue">{fmtMoney(event.revenue)}</p>
                  )}
                </div>

                <div className="mev-actions">
                  <button
                    className="mev-abtn mev-abtn-share"
                    onClick={() => setShareEvent(event)}
                    aria-haspopup="dialog"
                  >
                    Share
                  </button>

                  <button
                    className="mev-abtn mev-abtn-tool"
                    onClick={() => setPromoEvent(event)}
                  >
                    Promoter link
                  </button>

                  <button
                    className="mev-abtn mev-abtn-tool"
                    onClick={() => setEditEvent(event)}
                  >
                    Edit
                  </button>

                  <button
                    className="mev-abtn mev-abtn-tool"
                    onClick={() => setDiscountEvent(event)}
                  >
                    Discount codes
                  </button>

                  <button
                    className="mev-abtn mev-abtn-tool"
                    disabled={exportingId === event._id}
                    onClick={() => exportGuestList(event)}
                  >
                    {exportingId === event._id ? "Exporting…" : "Guest list (CSV)"}
                  </button>

                  {event.status === "DRAFT" && (
                    <button
                      className="mev-abtn mev-abtn-publish"
                      disabled={processingId === event._id}
                      onClick={() => updateStatus(event._id, "publish")}
                    >
                      Publish
                    </button>
                  )}

                  {event.status === "LIVE" && (
                    <>
                      <button
                        className="mev-abtn mev-abtn-end"
                        disabled={processingId === event._id}
                        onClick={() => updateStatus(event._id, "end")}
                      >
                        End
                      </button>

                      <button
                        className="mev-abtn mev-abtn-scan"
                        onClick={() =>
                          navigate(`/organizer/scan?event=${event._id}`)
                        }
                      >
                        Scan
                      </button>
                    </>
                  )}

                  {event.status === "ENDED" && (
                    <button
                      className="mev-abtn mev-abtn-delete"
                      disabled={processingId === event._id}
                      onClick={() => setConfirmDelete(event._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </Shell>
  );
}

/* ================= MODALS ================= */

function ConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="mev-overlay">
      <div className="mev-modal">
        <h3>Delete Event?</h3>
        <p>This action cannot be undone.</p>
        <div className="mev-modal-actions">
          <button className="mev-btn mev-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="mev-abtn mev-abtn-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoterModal({ event, onClose }) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const valid = code.length >= 2 && code.length <= 30;
  const link = `${window.location.origin}/events/${event.slug || event._id}?ref=${
    code || "CODE"
  }`;

  function handleChange(e) {
    setCode(
      e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "")
        .slice(0, 30),
    );
  }

  function copyLink() {
    if (!valid) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <div className="mev-overlay" onClick={onClose}>
      <div
        className="mev-modal mev-promo-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Promoter link</h3>
        <p className="mev-promo-explainer">
          Each promoter gets their own link — you&apos;ll see exactly how many
          tickets each one sells.
        </p>

        <label className="mev-promo-label" htmlFor="mev-promo-code">
          Promoter code
        </label>
        <input
          id="mev-promo-code"
          className="mev-promo-input"
          placeholder="e.g. TOBI"
          value={code}
          onChange={handleChange}
          autoFocus
        />

        <p className="mev-promo-preview" aria-live="polite">
          {link}
        </p>

        <div className="mev-modal-actions">
          <button className="mev-btn mev-btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            className="mev-btn mev-btn-ghost"
            disabled={!valid}
            onClick={() => setSharing(true)}
            aria-haspopup="dialog"
          >
            Share
          </button>
          <button
            className="mev-btn mev-btn-gold"
            disabled={!valid}
            onClick={copyLink}
          >
            {copied ? (
              <>
                Copied <Icon name="check" />
              </>
            ) : (
              "Copy link"
            )}
          </button>
        </div>

        {/* Shares from here carry ?ref=CODE so the promoter gets credited —
            including the WhatsApp deep link, which passes the same code
            through to the bot as "ref CODE". */}
        {sharing && valid && (
          <ShareSheet
            url={link}
            title={event.title}
            dateText={new Date(event.date).toDateString()}
            locationText={event.location}
            waBuyUrl={buyOnWhatsAppUrl(event, code)}
            onClose={() => setSharing(false)}
          />
        )}
      </div>
    </div>
  );
}

function EditEventModal({ event, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: event.title || "",
    description: event.description || "",
    location: event.location || "",
    city: event.city || "",
    category: CATEGORIES.includes(event.category) ? event.category : "Other",
    startTime: toLocalInput(event.date),
    endTime: toLocalInput(event.endDate),
    capacity: event.capacity ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bannerFit, setBannerFit] = useState(
    event.bannerFit === "contain" ? "contain" : "cover",
  );
  const [affiliatesEnabled, setAffiliatesEnabled] = useState(
    !!event.affiliatesEnabled,
  );
  const [affiliatePercent, setAffiliatePercent] = useState(
    event.affiliatePercent ?? 15,
  );

  const affPercentClamped = Math.min(
    50,
    Math.max(1, Number(affiliatePercent) || 15),
  );

  /* Which preset the saved salesEndAt corresponds to. Unset means the
     default — sales run until the event ends. */
  const [salesCloseMode, setSalesCloseMode] = useState(() => {
    if (!event.salesEndAt) return "end";
    const s = toLocalInput(event.salesEndAt);
    if (s === toLocalInput(event.endDate)) return "end";
    if (s === toLocalInput(event.date)) return "start";
    return "custom";
  });
  const [salesCloseCustom, setSalesCloseCustom] = useState(
    event.salesEndAt ? toLocalInput(event.salesEndAt) : "",
  );

  const salesEndAt =
    salesCloseMode === "start"
      ? form.startTime
      : salesCloseMode === "custom"
        ? salesCloseCustom
        : form.endTime;

  const salesCloseError = (() => {
    if (salesCloseMode !== "custom") return "";
    if (!salesCloseCustom) return "Choose when ticket sales should close";
    const when = new Date(salesCloseCustom);
    if (isNaN(when.getTime())) return "Enter a valid date and time";
    if (when <= new Date()) return "Ticket sales must close in the future";
    if (form.endTime && when > new Date(form.endTime)) {
      return "Ticket sales must close by the time the event ends";
    }
    return "";
  })();

  /* "Sat, 22 Aug 2026, 11:59 PM" */
  const formatWhen = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function save() {
    if (saving) return;
    if (salesCloseError) return setError(salesCloseError);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/events/${event._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            location: form.location,
            city: form.city,
            category: form.category,
            bannerFit,
            ...(form.startTime ? { date: form.startTime } : {}),
            ...(form.endTime ? { endDate: form.endTime } : {}),
            ...(salesEndAt ? { salesEndAt } : {}),
            ...(form.capacity !== "" && form.capacity != null
              ? { capacity: Number(form.capacity) }
              : {}),
            affiliatesEnabled,
            ...(affiliatesEnabled
              ? { affiliatePercent: affPercentClamped }
              : {}),
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update event");
      onSaved(data.message || "Event updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update event");
      setSaving(false);
    }
  }

  return (
    <div className="mev-overlay" onClick={onClose}>
      <div
        className="mev-modal mev-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Edit event</h3>

        <div className="mev-form-grid">
          <div className="mev-form-field mev-form-span2">
            <label className="mev-form-label" htmlFor="mev-edit-title">
              Title
            </label>
            <input
              id="mev-edit-title"
              className="mev-form-input"
              name="title"
              value={form.title}
              onChange={update}
            />
          </div>

          <div className="mev-form-field mev-form-span2">
            <label className="mev-form-label" htmlFor="mev-edit-desc">
              Description
            </label>
            <textarea
              id="mev-edit-desc"
              rows={3}
              className="mev-form-input mev-form-textarea"
              name="description"
              value={form.description}
              onChange={update}
            />
          </div>

          <div className="mev-form-field mev-form-span2">
            <label className="mev-form-label" htmlFor="mev-edit-location">
              Location
            </label>
            <input
              id="mev-edit-location"
              className="mev-form-input"
              name="location"
              value={form.location}
              onChange={update}
            />
          </div>

          <div className="mev-form-field">
            <label className="mev-form-label" htmlFor="mev-edit-city">
              City
            </label>
            <input
              id="mev-edit-city"
              className="mev-form-input"
              name="city"
              value={form.city}
              onChange={update}
            />
          </div>

          <div className="mev-form-field">
            <label className="mev-form-label" htmlFor="mev-edit-category">
              Category
            </label>
            <select
              id="mev-edit-category"
              className="mev-form-input mev-form-select"
              name="category"
              value={form.category}
              onChange={update}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mev-form-field">
            <label className="mev-form-label" htmlFor="mev-edit-start">
              Starts
            </label>
            <input
              id="mev-edit-start"
              type="datetime-local"
              className="mev-form-input"
              name="startTime"
              value={form.startTime}
              onChange={update}
            />
          </div>

          <div className="mev-form-field">
            <label className="mev-form-label" htmlFor="mev-edit-end">
              Ends
            </label>
            <input
              id="mev-edit-end"
              type="datetime-local"
              className="mev-form-input"
              name="endTime"
              value={form.endTime}
              onChange={update}
            />
          </div>

          <div className="mev-form-field mev-form-span2">
            <span className="mev-form-label">Ticket sales close</span>
            <div
              className="mev-bfit-row mev-sw-row"
              role="radiogroup"
              aria-label="When ticket sales close"
            >
              {[
                {
                  id: "end",
                  icon: "flag",
                  name: "When the event ends",
                  desc: "sell right up to the last minute (lets you sell at the door)",
                },
                {
                  id: "start",
                  icon: "clock",
                  name: "When the event starts",
                  desc: "no sales once the party begins",
                },
                {
                  id: "custom",
                  icon: "calendar",
                  name: "Custom date & time",
                  desc: "pick your own cut-off",
                },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={salesCloseMode === o.id}
                  className={`mev-bfit-pill ${salesCloseMode === o.id ? "is-selected" : ""}`}
                  onClick={() => setSalesCloseMode(o.id)}
                >
                  {o.icon && <Icon name={o.icon} />} {o.name}
                  <span className="mev-bfit-desc">{o.desc}</span>
                </button>
              ))}
            </div>

            {salesCloseMode === "custom" && (
              <input
                type="datetime-local"
                className="mev-form-input mev-sw-input"
                aria-label="Sales close at"
                max={form.endTime || undefined}
                value={salesCloseCustom}
                onChange={(e) => setSalesCloseCustom(e.target.value)}
              />
            )}

            {salesCloseError ? (
              <p className="mev-sw-err">{salesCloseError}</p>
            ) : formatWhen(salesEndAt) ? (
              <p className="mev-sw-preview">
                Guests can buy tickets until{" "}
                <strong>{formatWhen(salesEndAt)}</strong>.
              </p>
            ) : null}
            <p className="mev-sw-help">
              After this time nobody can buy a ticket for this event —
              including at the gate. Setting a future time reopens sales.
            </p>
          </div>

          <div className="mev-form-field">
            <label className="mev-form-label" htmlFor="mev-edit-capacity">
              Capacity
            </label>
            <input
              id="mev-edit-capacity"
              type="number"
              min="1"
              className="mev-form-input"
              name="capacity"
              value={form.capacity}
              onChange={update}
            />
          </div>

          <div className="mev-form-field mev-form-span2">
            <span className="mev-form-label">Banner display</span>
            <div
              className="mev-bfit-row"
              role="group"
              aria-label="Banner display"
            >
              <button
                type="button"
                className={`mev-bfit-pill ${bannerFit === "cover" ? "is-selected" : ""}`}
                aria-pressed={bannerFit === "cover"}
                onClick={() => setBannerFit("cover")}
              >
                Fill frame
                <span className="mev-bfit-desc">
                  cinematic crop — edges may be cut
                </span>
              </button>
              <button
                type="button"
                className={`mev-bfit-pill ${bannerFit === "contain" ? "is-selected" : ""}`}
                aria-pressed={bannerFit === "contain"}
                onClick={() => setBannerFit("contain")}
              >
                Show everything
                <span className="mev-bfit-desc">
                  whole flyer visible, blurred backdrop
                </span>
              </button>
            </div>
          </div>

          <div className="mev-form-field mev-form-span2">
            <button
              type="button"
              className={`mev-aff-toggle ${affiliatesEnabled ? "is-on" : ""}`}
              role="switch"
              aria-checked={affiliatesEnabled}
              onClick={() => setAffiliatesEnabled((v) => !v)}
            >
              <span className="mev-aff-knob" aria-hidden="true" />
              <span>Allow affiliates</span>
            </button>
          </div>

          {affiliatesEnabled && (
            <div className="mev-form-field mev-form-span2">
              <label className="mev-form-label" htmlFor="mev-edit-aff-percent">
                Affiliate commission %
              </label>
              <input
                id="mev-edit-aff-percent"
                type="number"
                min="1"
                max="50"
                placeholder="15"
                className="mev-form-input mev-aff-percent-input"
                value={affiliatePercent}
                onChange={(e) => setAffiliatePercent(e.target.value)}
              />
              <p className="mev-aff-hint">
                Affiliates earn {affPercentClamped}% of each ticket they sell —
                paid from your revenue.
              </p>
            </div>
          )}
        </div>

        {error && <p className="mev-form-err">{error}</p>}

        <div className="mev-modal-actions">
          <button
            className="mev-btn mev-btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="mev-btn mev-btn-gold"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DiscountModal({ event, onClose }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [newCode, setNewCode] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [maxUses, setMaxUses] = useState("");

  async function loadCodes() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/discounts/event/${event._id}`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      const data = await res.json().catch(() => []);
      if (!res.ok)
        throw new Error(data.message || "Unable to load discount codes");
      setCodes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load discount codes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCode() {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          eventId: event._id,
          code: newCode.trim(),
          percentOff: Number(percentOff),
          maxUses: Number(maxUses),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create code");
      setNewCode("");
      setPercentOff("");
      setMaxUses("");
      await loadCodes();
    } catch (err) {
      setError(err.message || "Failed to create code");
    } finally {
      setCreating(false);
    }
  }

  async function toggleCode(id) {
    if (togglingId) return;
    setTogglingId(id);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/discounts/${id}/toggle`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update code");
      setCodes((list) =>
        list.map((c) => (c._id === id ? { ...c, active: data.active } : c)),
      );
    } catch (err) {
      setError(err.message || "Failed to update code");
    } finally {
      setTogglingId(null);
    }
  }

  const canCreate =
    newCode.trim().length >= 2 &&
    Number(percentOff) > 0 &&
    Number(percentOff) <= 100 &&
    Number(maxUses) > 0;

  return (
    <div className="mev-overlay" onClick={onClose}>
      <div
        className="mev-modal mev-disc-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Discount codes</h3>
        <p className="mev-promo-explainer">{event.title}</p>

        {loading ? (
          <p className="mev-disc-loading">Loading codes…</p>
        ) : codes.length === 0 ? (
          <p className="mev-disc-empty">
            No discount codes yet — create one below.
          </p>
        ) : (
          <div className="mev-disc-list">
            {codes.map((c) => (
              <div className="mev-disc-row" key={c._id}>
                <div className="mev-disc-info">
                  <span className="mev-disc-code">{c.code}</span>
                  <span className="mev-disc-meta">
                    {c.percentOff}% off · {c.uses ?? 0}/{c.maxUses} used
                  </span>
                </div>
                <span
                  className={`mev-disc-pill ${c.active ? "is-on" : "is-off"}`}
                >
                  {c.active ? "Active" : "Inactive"}
                </span>
                <button
                  className="mev-abtn mev-abtn-tool mev-disc-toggle"
                  disabled={togglingId === c._id}
                  onClick={() => toggleCode(c._id)}
                >
                  {togglingId === c._id
                    ? "…"
                    : c.active
                      ? "Disable"
                      : "Enable"}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mev-disc-create">
          <p className="mev-promo-label">New code</p>
          <div className="mev-disc-create-row">
            <input
              className="mev-form-input mev-disc-code-input"
              placeholder="CODE"
              value={newCode}
              onChange={(e) =>
                setNewCode(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9_-]/g, "")
                    .slice(0, 30),
                )
              }
            />
            <input
              className="mev-form-input mev-disc-num-input"
              type="number"
              min="1"
              max="100"
              placeholder="% off"
              value={percentOff}
              onChange={(e) => setPercentOff(e.target.value)}
            />
            <input
              className="mev-form-input mev-disc-num-input"
              type="number"
              min="1"
              placeholder="Max uses"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
            <button
              className="mev-btn mev-btn-gold mev-disc-create-btn"
              disabled={!canCreate || creating}
              onClick={createCode}
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>

        {error && <p className="mev-form-err">{error}</p>}

        <div className="mev-modal-actions">
          <button className="mev-btn mev-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorModal({ message, onClose }) {
  return (
    <div className="mev-overlay" onClick={onClose}>
      <div
        className="mev-modal mev-error-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Something went wrong</h3>
        <p>{message}</p>
        <div className="mev-modal-actions">
          <button className="mev-btn mev-btn-ghost" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════════ */
const CSS = `

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
:root {
  --bg:#080910; --surface:#0d0f16; --card:rgba(255,255,255,0.04);
  --border:rgba(255,255,255,0.08); --border-h:rgba(255,255,255,0.18);
  --gold:#E8C96A; --gold-dim:rgba(232,201,106,0.12); --gold-glo:rgba(232,201,106,0.22);
  --text:#F0EDE8; --muted:#8B887E; --danger:#E05C5C; --live:#6BF0A0;
  --font-h:'Syne',sans-serif; --font-b:'DM Sans',sans-serif;
  --r:20px; --r-sm:12px;
}
body { background:var(--bg); color:var(--text); font-family:var(--font-b); -webkit-font-smoothing:antialiased; overflow-x:clip; }
button { font-family:var(--font-b); cursor:pointer; }

/* ── Shell ── */
.mev-shell { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.mev-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.mev-main { flex:1; width:100%; max-width:1160px; margin:0 auto; padding:clamp(16px,3vw,40px); }

.mev-wordmark { font-family:var(--font-h); font-weight:800; font-size:21px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:0; }
.mev-wordmark em { font-style:normal; color:var(--gold); }

.mev-side { display:none; }
.mev-topbar { position:sticky; top:0; z-index:950; height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,3vw,24px); background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.mev-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); }
.mev-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.mev-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.mev-burger.is-open span:nth-child(2) { opacity:0; }
.mev-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

.mev-drawer { position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,4vw,28px) 28px; display:flex; flex-direction:column; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
.mev-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }

.mev-nav { display:flex; flex-direction:column; gap:4px; }
.mev-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:var(--r-sm); background:none; border:none; color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.mev-nav-item svg { width:18px; height:18px; flex-shrink:0; }
.mev-nav-item:hover { color:var(--text); background:var(--card); }
.mev-nav-item.is-active { background:var(--gold-dim); color:var(--gold); }
.mev-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

@media (min-width:1024px) {
  .mev-side { display:flex; flex-direction:column; width:250px; flex-shrink:0; position:sticky; top:0; height:100svh; background:var(--surface); border-right:1px solid var(--border); padding:26px 14px 18px; }
  .mev-side .mev-wordmark { padding:0 14px; margin-bottom:30px; }
  .mev-side .mev-nav { flex:1; }
  .mev-topbar { display:none; }
  .mev-drawer { display:none; }
}

/* ── Header ── */
.mev-head { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:28px; }
.mev-title { font-family:var(--font-h); font-weight:700; font-size:clamp(24px,3.4vw,34px); letter-spacing:-.01em; }
.mev-sub { color:var(--muted); font-size:14px; margin-top:6px; }

/* ── Buttons ── */
.mev-btn { border-radius:999px; font-weight:600; font-size:14px; padding:12px 22px; border:1px solid transparent; transition:transform .2s, box-shadow .2s, border-color .2s; white-space:nowrap; }
.mev-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; }
.mev-btn-gold:hover { transform:translateY(-1px); box-shadow:0 8px 26px var(--gold-glo); }
.mev-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.mev-btn-ghost:hover { border-color:var(--border-h); }

/* ── Grid + cards ── */
.mev-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(290px,100%),1fr)); gap:clamp(14px,2vw,20px); }
.mev-card { display:flex; flex-direction:column; background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; transition:transform .25s, border-color .25s; }
.mev-card:hover { transform:translateY(-3px); border-color:var(--border-h); }

.mev-banner { position:relative; aspect-ratio:16/9; background:linear-gradient(135deg, var(--gold-dim), rgba(255,255,255,.03)); display:grid; place-items:center; overflow:hidden; }
.mev-banner img { width:100%; height:100%; object-fit:cover; display:block; }
.mev-banner-fallback { font-family:var(--font-h); font-weight:800; font-size:44px; color:rgba(232,201,106,.4); }

.mev-badge { position:absolute; top:12px; left:12px; display:inline-flex; align-items:center; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.mev-badge.is-live { background:rgba(107,240,160,.16); color:var(--live); border:1px solid rgba(107,240,160,.3); }
.mev-badge.is-draft { background:rgba(8,9,16,.55); color:var(--text); border:1px solid var(--border-h); }
.mev-badge.is-ended { background:rgba(224,92,92,.16); color:var(--danger); border:1px solid rgba(224,92,92,.3); }
.mev-badge.is-pending { background:var(--gold-dim); color:var(--gold); border:1px solid rgba(232,201,106,.3); }

.mev-card-body { flex:1; padding:16px 18px 6px; }
.mev-card-title { font-family:var(--font-h); font-weight:700; font-size:16.5px; letter-spacing:-.01em; margin-bottom:6px; overflow-wrap:anywhere; }
.mev-card-meta { color:var(--muted); font-size:13px; line-height:1.5; overflow-wrap:anywhere; }

.mev-progress-wrap { margin-top:12px; }
.mev-progress { height:4px; background:rgba(255,255,255,.08); border-radius:99px; overflow:hidden; }
.mev-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#E8C96A,#F5E196); transition:width .5s ease; }
.mev-progress-label { display:block; margin-top:6px; font-size:11.5px; color:var(--muted); }

/* ── Per-tier availability breakdown ── */
.mev-tiers { list-style:none; margin:10px 0 0; padding:8px 10px; display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:10px; }
.mev-tier { display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:center; gap:10px; font-size:11.5px; color:var(--muted); font-variant-numeric:tabular-nums; }
.mev-tier-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text); font-weight:500; }
.mev-tier-sold { white-space:nowrap; }
.mev-tier-left { white-space:nowrap; color:var(--live); font-weight:600; }
.mev-tier.is-out .mev-tier-left { color:var(--danger); }
.mev-tier.is-out .mev-tier-name { opacity:.65; }
/* narrow cards: name gets its own line so nothing is clipped or scrolls */
@media (max-width:420px) {
  .mev-tier { grid-template-columns:1fr auto; row-gap:2px; }
  .mev-tier-name { grid-column:1 / -1; white-space:normal; }
  .mev-tier-left { text-align:right; }
}

.mev-revenue { margin-top:10px; font-family:var(--font-h); font-weight:700; font-size:15px; color:var(--gold); font-variant-numeric:tabular-nums; }

/* ── Card actions ── */
.mev-actions { display:flex; gap:8px; flex-wrap:wrap; padding:14px 18px 18px; }
.mev-abtn { border-radius:999px; font-weight:600; font-size:12.5px; padding:9px 16px; border:1px solid transparent; transition:opacity .2s, border-color .2s, background .2s; }
.mev-abtn:disabled { opacity:.55; cursor:not-allowed; }
.mev-abtn-share { background:var(--card); border-color:var(--border); color:var(--text); }
.mev-abtn-share:hover { border-color:var(--border-h); }
.mev-abtn-publish { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; }
.mev-abtn-end { background:rgba(224,92,92,.14); border-color:rgba(224,92,92,.35); color:var(--danger); }
.mev-abtn-end:hover { background:rgba(224,92,92,.22); }
.mev-abtn-scan { background:transparent; border-color:rgba(107,240,160,.4); color:var(--live); }
.mev-abtn-scan:hover { background:rgba(107,240,160,.1); }
.mev-abtn-delete { background:var(--danger); border-color:var(--danger); color:#fff; }
.mev-abtn-delete:hover { opacity:.85; }
.mev-abtn-tool { background:transparent; border-color:var(--border); color:var(--muted); }
.mev-abtn-tool:hover { border-color:rgba(232,201,106,.4); color:var(--gold); }

/* ── Empty state ── */
.mev-empty { text-align:center; padding:clamp(40px,7vw,72px) 24px; background:var(--card); border:1px dashed var(--border-h); border-radius:var(--r); margin-top:12px; }
.mev-empty-icon { font-size:42px; }
.mev-empty-title { font-family:var(--font-h); font-weight:700; font-size:18px; margin-top:12px; }
.mev-empty-text { color:var(--muted); font-size:14px; margin:8px 0 20px; }

/* ── Skeleton shimmer ── */
.mev-skel-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:16px; display:flex; flex-direction:column; gap:12px; }
.mev-skel { border-radius:var(--r-sm); background:linear-gradient(100deg, rgba(255,255,255,.04) 30%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.04) 70%); background-size:200% 100%; animation:mevShimmer 1.4s linear infinite; }
.mev-skel-banner { aspect-ratio:16/9; }
@keyframes mevShimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }

/* ── Modal ── */
.mev-overlay { position:fixed; inset:0; z-index:2000; background:rgba(8,9,16,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:grid; place-items:center; padding:20px; }
.mev-modal { width:min(100%,380px); background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,32px); text-align:center; animation:mevPop .3s ease; }
@keyframes mevPop { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
.mev-modal h3 { font-family:var(--font-h); font-size:18px; font-weight:700; margin-bottom:10px; }
.mev-modal p { color:var(--muted); font-size:14px; line-height:1.6; }
.mev-modal-actions { display:flex; justify-content:center; gap:12px; margin-top:22px; flex-wrap:wrap; }
.mev-modal-actions .mev-abtn { padding:11px 22px; font-size:13.5px; }
.mev-modal .mev-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }

/* ── Promoter link modal ── */
.mev-promo-modal { text-align:left; width:min(100%,420px); }
.mev-promo-modal h3 { text-align:left; }
.mev-promo-explainer { color:var(--muted); font-size:13.5px; line-height:1.6; margin-bottom:18px; }
.mev-promo-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.mev-promo-input { width:100%; padding:13px 15px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; font-family:var(--font-h); font-weight:600; letter-spacing:.04em; outline:none; transition:border-color .2s, box-shadow .2s; }
.mev-promo-input::placeholder { color:var(--muted); font-family:var(--font-b); font-weight:400; letter-spacing:0; }
.mev-promo-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
.mev-promo-preview { margin-top:12px; padding:11px 13px; background:rgba(255,255,255,.03); border:1px dashed var(--border-h); border-radius:var(--r-sm); color:var(--gold); font-size:12.5px; line-height:1.5; overflow-wrap:anywhere; }
.mev-promo-modal .mev-modal-actions { justify-content:flex-end; }

/* ── Error modal ── */
.mev-error-modal { border-color:rgba(224,92,92,.35); background:linear-gradient(180deg, rgba(224,92,92,.08), var(--surface) 55%); }
.mev-error-modal h3 { color:var(--danger); }

/* ── Success toast ── */
.mev-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); z-index:2100; max-width:min(92vw,420px); background:rgba(107,240,160,.12); border:1px solid rgba(107,240,160,.4); color:var(--live); font-size:13.5px; font-weight:600; padding:12px 20px; border-radius:999px; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); animation:mevPop .3s ease; text-align:center; }

/* ── Edit event modal ── */
.mev-edit-modal { width:min(100%,540px); text-align:left; max-height:90svh; overflow-y:auto; }
.mev-edit-modal h3 { text-align:left; margin-bottom:18px; }
.mev-form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.mev-form-span2 { grid-column:1 / -1; }
.mev-form-field { display:flex; flex-direction:column; gap:6px; min-width:0; }
.mev-form-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.mev-form-input { width:100%; padding:12px 14px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; font-family:var(--font-b); outline:none; color-scheme:dark; transition:border-color .2s, box-shadow .2s; }
.mev-form-input::placeholder { color:var(--muted); }
.mev-form-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
.mev-form-textarea { resize:vertical; min-height:80px; line-height:1.55; }
.mev-form-select { appearance:none; -webkit-appearance:none; cursor:pointer; }
.mev-form-select option { background:var(--surface); color:var(--text); }
.mev-form-err { margin-top:14px; padding:11px 14px; border-radius:var(--r-sm); background:rgba(224,92,92,.1); border:1px solid rgba(224,92,92,.3); color:var(--danger); font-size:13px; line-height:1.5; }

/* banner display selector (cover / contain) */
.mev-bfit-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.mev-bfit-pill { display:flex; flex-direction:column; gap:3px; text-align:left; padding:11px 14px; background:rgba(255,255,255,.03); border:1.5px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-family:var(--font-h); font-weight:700; font-size:13px; transition:border-color .2s, background .2s, color .2s; }
.mev-bfit-pill:hover { border-color:var(--border-h); }
.mev-bfit-pill.is-selected { border-color:var(--gold); background:var(--gold-dim); color:var(--gold); }
.mev-bfit-desc { font-family:var(--font-b); font-weight:400; font-size:11.5px; color:var(--muted); line-height:1.45; }

/* ── Sales window (3 presets — one per row on narrow screens) ── */
.mev-sw-row { grid-template-columns:repeat(3,minmax(0,1fr)); }
.mev-sw-input { margin-top:10px; }
.mev-sw-preview { margin-top:10px; font-size:12.5px; color:var(--text); line-height:1.55; }
.mev-sw-preview strong { color:var(--gold); font-weight:700; }
.mev-sw-err { margin-top:10px; font-size:11.5px; color:var(--danger); line-height:1.45; }
.mev-sw-help { margin-top:6px; font-size:11.5px; color:var(--muted); line-height:1.5; }
@media (max-width:640px) {
  .mev-sw-row { grid-template-columns:1fr; }
}

/* affiliate toggle (checkbox-pill) */
.mev-aff-toggle { display:inline-flex; align-items:center; gap:10px; align-self:flex-start; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:999px; padding:8px 18px 8px 8px; color:var(--muted); font-weight:600; font-size:13.5px; transition:border-color .25s, color .25s, background .25s; }
.mev-aff-toggle:hover { border-color:var(--border-h); }
.mev-aff-knob { position:relative; width:34px; height:20px; border-radius:999px; background:rgba(255,255,255,.1); flex-shrink:0; transition:background .25s; }
.mev-aff-knob::after { content:''; position:absolute; top:3px; left:3px; width:14px; height:14px; border-radius:50%; background:var(--muted); transition:transform .25s, background .25s; }
.mev-aff-toggle.is-on { border-color:rgba(232,201,106,.5); background:var(--gold-dim); color:var(--gold); }
.mev-aff-toggle.is-on .mev-aff-knob { background:var(--gold); }
.mev-aff-toggle.is-on .mev-aff-knob::after { transform:translateX(14px); background:#080910; }
.mev-aff-percent-input { max-width:200px; }
.mev-aff-hint { margin-top:4px; font-size:12px; color:var(--gold); background:var(--gold-dim); border-radius:8px; padding:7px 12px; display:inline-block; line-height:1.5; }
.mev-edit-modal .mev-modal-actions, .mev-disc-modal .mev-modal-actions { justify-content:flex-end; }
@media (max-width:480px) { .mev-form-grid { grid-template-columns:1fr; } }

/* ── Discount codes modal ── */
.mev-disc-modal { width:min(100%,520px); text-align:left; max-height:90svh; overflow-y:auto; }
.mev-disc-modal h3 { text-align:left; }
.mev-disc-loading, .mev-disc-empty { color:var(--muted); font-size:13.5px; padding:14px 0; }
.mev-disc-list { display:flex; flex-direction:column; gap:8px; margin-bottom:18px; }
.mev-disc-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:11px 13px; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:var(--r-sm); }
.mev-disc-info { display:flex; flex-direction:column; gap:2px; flex:1; min-width:120px; }
.mev-disc-code { font-family:ui-monospace, monospace; font-weight:700; font-size:13.5px; letter-spacing:.05em; color:var(--gold); overflow-wrap:anywhere; }
.mev-disc-meta { font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; }
.mev-disc-pill { font-size:10.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:4px 10px; border-radius:999px; white-space:nowrap; }
.mev-disc-pill.is-on { background:rgba(107,240,160,.14); color:var(--live); border:1px solid rgba(107,240,160,.35); }
.mev-disc-pill.is-off { background:rgba(255,255,255,.05); color:var(--muted); border:1px solid var(--border); }
.mev-disc-toggle { flex-shrink:0; }
.mev-disc-create { border-top:1px dashed var(--border-h); padding-top:16px; }
.mev-disc-create-row { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr); gap:8px; }
.mev-disc-code-input { font-family:ui-monospace, monospace; font-weight:600; letter-spacing:.05em; text-transform:uppercase; }
.mev-disc-create-btn { grid-column:1 / -1; padding:11px 20px; font-size:13.5px; }
.mev-disc-create-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
@media (max-width:400px) { .mev-disc-create-row { grid-template-columns:1fr 1fr; } .mev-disc-code-input { grid-column:1 / -1; } }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:480px) {
  .mev-head .mev-btn { width:100%; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
