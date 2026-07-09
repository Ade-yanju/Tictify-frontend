/* ═══════════════════════════════════════════════════════════
   CreateEvent.jsx — Tictify 2026 Organizer Console
   Syne + DM Sans · ink #080910 · gold #E8C96A
   UI overhaul only — form state / validate / submit / upload
   logic preserved exactly.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/authService";

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  create: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14h1M14 20h1M20 20h1v1" />
    </svg>
  ),
  withdraw: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  ),
};

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
      className={`cev-nav-item ${active === item.path ? "is-active" : ""}`}
      onClick={() => go(item.path)}
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  ));

  return (
    <div className="cev-shell">
      <aside className="cev-side">
        <button className="cev-wordmark" onClick={() => go("/organizer/dashboard")}>
          Tictify<em>.</em>
        </button>
        <nav className="cev-nav">{navButtons}</nav>
      </aside>

      <div className="cev-body">
        <div className="cev-topbar">
          <button className="cev-wordmark" onClick={() => go("/organizer/dashboard")}>
            Tictify<em>.</em>
          </button>
          <button
            className={`cev-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`cev-drawer ${menuOpen ? "is-open" : ""}`}>
          <nav className="cev-nav">{navButtons}</nav>
        </div>

        <main className="cev-main">{children}</main>
      </div>
    </div>
  );
}

export default function CreateEvent() {
  injectStyles("tictify-cev-css", CSS);
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("PAID");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "Other",
    city: "",
    startTime: "",
    endTime: "",
    capacity: "",
    ticketTypes: [{ name: "Regular", price: "", quantity: "" }],
  });

  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  /* ================= HELPERS ================= */
  const updateField = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updateTicket = (index, field, value) => {
    const copy = [...form.ticketTypes];
    copy[index][field] = value;
    setForm({ ...form, ticketTypes: copy });
  };

  const addTicket = () =>
    setForm({
      ...form,
      ticketTypes: [
        ...form.ticketTypes,
        { name: "", price: "", quantity: "", groupSize: "" },
      ],
    });

  /* One tap adds a group bundle: one QR code that admits several friends */
  const addGroupTicket = () =>
    setForm({
      ...form,
      ticketTypes: [
        ...form.ticketTypes,
        { name: "Group of Friends (x4)", price: "", quantity: "", groupSize: "4" },
      ],
    });

  const validate = () => {
    if (!banner) return "Event banner is required";
    if (
      !form.title ||
      !form.location ||
      !form.startTime ||
      !form.endTime ||
      !form.capacity
    ) {
      return "All event fields are required";
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      return "Event end time must be after start time";
    }

    for (const t of form.ticketTypes) {
      if (!t.name || !t.quantity) {
        return "Ticket name and quantity are required";
      }
      if (eventType === "PAID" && t.price === "") {
        return "Price is required for paid events";
      }
    }

    return null;
  };

  /* ================= SUBMIT ================= */
  const submit = async (status) => {
    const error = validate();
    if (error) return setModal({ type: "error", message: error });

    setLoading(true);

    try {
      const bannerUrl = await uploadBanner();

      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category,
        city: form.city,
        date: form.startTime,
        endDate: form.endTime,
        banner: bannerUrl,
        status,
        capacity: Number(form.capacity),
        ticketTypes: form.ticketTypes.map((t) => ({
          name: t.name,
          quantity: Number(t.quantity),
          price: eventType === "FREE" ? 0 : Number(t.price),
          groupSize: Math.max(1, Number(t.groupSize) || 1),
          ...(eventType === "PAID" &&
          t.earlyBirdPrice !== "" &&
          t.earlyBirdPrice != null &&
          t.earlyBirdUntil
            ? {
                earlyBirdPrice: Number(t.earlyBirdPrice),
                earlyBirdUntil: t.earlyBirdUntil,
              }
            : {}),
        })),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create event");

      setModal({
        type: "success",
        message:
          status === "LIVE"
            ? "Event published successfully 🎉"
            : "Event saved as draft",
      });
    } catch (err) {
      setModal({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ================= IMAGE UPLOAD ================= */
  const uploadBanner = async () => {
    const formData = new FormData();
    formData.append("image", banner);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/uploads/banner`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      },
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url)
      throw new Error(data.message || "Banner upload failed");
    return data.url;
  };

  return (
    <Shell active="/organizer/create-event">
      {loading && <LoadingModal />}

      {modal && (
        <Modal
          {...modal}
          onClose={() => {
            setModal(null);
            if (modal.type === "success") {
              navigate("/organizer/dashboard");
            }
          }}
        />
      )}

      <button className="cev-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <header className="cev-head">
        <h1 className="cev-title">Create Event</h1>
        <p className="cev-sub">
          Set up your event details, tickets and banner — then publish when
          you&apos;re ready.
        </p>
      </header>

      <div className="cev-layout">
        {/* ══════════ FORM COLUMN ══════════ */}
        <section className="cev-form">
          {/* EVENT TYPE */}
          <div className="cev-block">
            <p className="cev-label">Event type</p>
            <div className="cev-toggle" role="group" aria-label="Event type">
              {["PAID", "FREE"].map((type) => (
                <button
                  key={type}
                  className={`cev-toggle-btn ${eventType === type ? "is-active" : ""}`}
                  onClick={() => setEventType(type)}
                >
                  {type} Event
                </button>
              ))}
            </div>
          </div>

          {/* BANNER */}
          <div className="cev-block">
            <p className="cev-label">Event banner</p>
            <label className={`cev-banner ${preview ? "has-img" : ""}`}>
              {preview ? (
                <img
                  src={preview}
                  alt="Event banner preview"
                  className="cev-banner-img"
                />
              ) : (
                <div className="cev-banner-empty">
                  <span className="cev-banner-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2.5" />
                      <circle cx="9" cy="10" r="2" />
                      <path d="M3 17l5-4 4 3 4-4 5 5" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <strong>Upload Event Banner</strong>
                  <small>Recommended size: 1200 × 675 (16:9)</small>
                </div>
              )}

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBanner(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>

          {/* DETAILS */}
          <div className="cev-block">
            <p className="cev-label">Details</p>
            <div className="cev-grid">
              <div className="cev-field cev-span2">
                <label className="cev-field-label" htmlFor="cev-title">
                  Event title
                </label>
                <input
                  id="cev-title"
                  name="title"
                  placeholder="Event title"
                  className="cev-input"
                  onChange={updateField}
                />
              </div>
              <div className="cev-field cev-span2">
                <label className="cev-field-label" htmlFor="cev-location">
                  Location
                </label>
                <input
                  id="cev-location"
                  name="location"
                  placeholder="Location"
                  className="cev-input"
                  onChange={updateField}
                />
              </div>
              <div className="cev-field">
                <label className="cev-field-label" htmlFor="cev-category">
                  Category
                </label>
                <div className="cev-selectwrap">
                  <select
                    id="cev-category"
                    name="category"
                    className="cev-input cev-selectinput"
                    value={form.category}
                    onChange={updateField}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="cev-caret" aria-hidden="true">
                    ▾
                  </span>
                </div>
              </div>
              <div className="cev-field">
                <label className="cev-field-label" htmlFor="cev-city">
                  City
                </label>
                <input
                  id="cev-city"
                  name="city"
                  placeholder="e.g. Lagos"
                  className="cev-input"
                  onChange={updateField}
                />
              </div>
              <div className="cev-field">
                <label className="cev-field-label" htmlFor="cev-start">
                  Starts
                </label>
                <input
                  id="cev-start"
                  type="datetime-local"
                  name="startTime"
                  className="cev-input"
                  onChange={updateField}
                />
              </div>
              <div className="cev-field">
                <label className="cev-field-label" htmlFor="cev-end">
                  Ends
                </label>
                <input
                  id="cev-end"
                  type="datetime-local"
                  name="endTime"
                  className="cev-input"
                  onChange={updateField}
                />
              </div>
              <div className="cev-field">
                <label className="cev-field-label" htmlFor="cev-capacity">
                  Capacity
                </label>
                <input
                  id="cev-capacity"
                  type="number"
                  name="capacity"
                  placeholder="Capacity"
                  className="cev-input"
                  onChange={updateField}
                />
              </div>
              <div className="cev-field cev-span2">
                <label className="cev-field-label" htmlFor="cev-desc">
                  Description
                </label>
                <textarea
                  id="cev-desc"
                  rows={4}
                  placeholder="Event description"
                  className="cev-input cev-textarea"
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* TICKETS */}
          <div className="cev-block">
            <p className="cev-label">Tickets</p>
            <div className="cev-tickets">
              {form.ticketTypes.map((t, i) => (
                <div key={i} className="cev-ticket">
                  <span className="cev-ticket-tag">Tier {i + 1}</span>
                  <div className="cev-ticket-grid">
                    <input
                      placeholder="Ticket name"
                      className="cev-input"
                      value={t.name}
                      onChange={(e) => updateTicket(i, "name", e.target.value)}
                    />
                    {eventType === "PAID" && (
                      <input
                        type="number"
                        placeholder="Price ₦"
                        className="cev-input"
                        value={t.price}
                        onChange={(e) =>
                          updateTicket(i, "price", e.target.value)
                        }
                      />
                    )}
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="cev-input"
                      value={t.quantity}
                      onChange={(e) =>
                        updateTicket(i, "quantity", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Admits (default 1)"
                      className="cev-input"
                      value={t.groupSize ?? ""}
                      onChange={(e) =>
                        updateTicket(i, "groupSize", e.target.value)
                      }
                      title="How many guests one ticket admits — e.g. 4 for a Group of Friends bundle"
                    />
                  </div>
                  {eventType === "PAID" && (
                    <div className="cev-eb-grid">
                      <div className="cev-field">
                        <label
                          className="cev-field-label"
                          htmlFor={`cev-ebprice-${i}`}
                        >
                          Early-bird price ₦ (optional)
                        </label>
                        <input
                          id={`cev-ebprice-${i}`}
                          type="number"
                          min="0"
                          placeholder="Early-bird price ₦"
                          className="cev-input"
                          value={t.earlyBirdPrice ?? ""}
                          onChange={(e) =>
                            updateTicket(i, "earlyBirdPrice", e.target.value)
                          }
                        />
                      </div>
                      <div className="cev-field">
                        <label
                          className="cev-field-label"
                          htmlFor={`cev-ebuntil-${i}`}
                        >
                          until
                        </label>
                        <input
                          id={`cev-ebuntil-${i}`}
                          type="datetime-local"
                          className="cev-input"
                          value={t.earlyBirdUntil ?? ""}
                          onChange={(e) =>
                            updateTicket(i, "earlyBirdUntil", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                  {eventType === "PAID" &&
                    t.earlyBirdPrice !== "" &&
                    t.earlyBirdPrice != null &&
                    t.earlyBirdUntil && (
                      <p className="cev-group-hint">
                        Early-bird ₦{Number(t.earlyBirdPrice).toLocaleString()}{" "}
                        until{" "}
                        {new Date(t.earlyBirdUntil).toLocaleString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  {Number(t.groupSize) > 1 && (
                    <p className="cev-group-hint">
                      One QR code admits {t.groupSize} guests at the gate
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="cev-add-row">
              <button className="cev-add" onClick={addTicket}>
                + Add Ticket
              </button>
              <button className="cev-add" onClick={addGroupTicket}>
                + Group of Friends bundle
              </button>
            </div>
          </div>
        </section>

        {/* ══════════ LIVE PREVIEW COLUMN (presentational only) ══════════ */}
        <aside className="cev-preview-col" aria-label="Event preview">
          <p className="cev-preview-eyebrow">Live preview</p>
          <div className="cev-preview-card">
            <div className="cev-preview-banner">
              {preview ? (
                <img src={preview} alt="" />
              ) : (
                <span className="cev-preview-banner-empty" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2.5" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M3 17l5-4 4 3 4-4 5 5" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <span
                className={`cev-chip ${eventType === "FREE" ? "is-free" : "is-paid"}`}
              >
                {eventType}
              </span>
            </div>
            <div className="cev-preview-body">
              <h3 className="cev-preview-title">
                {form.title || "Untitled event"}
              </h3>
              <p className="cev-preview-meta">
                {form.startTime
                  ? new Date(form.startTime).toLocaleString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Date & time TBA"}
              </p>
              <p className="cev-preview-meta">
                {form.location || "Location TBA"}
              </p>
              {form.description && (
                <p className="cev-preview-desc">{form.description}</p>
              )}
              <div className="cev-preview-tiers">
                {form.ticketTypes.map((t, i) => (
                  <div className="cev-preview-tier" key={i}>
                    <span>{t.name || `Ticket ${i + 1}`}</span>
                    <strong>
                      {eventType === "FREE"
                        ? "Free"
                        : t.price !== ""
                          ? `₦${Number(t.price).toLocaleString()}`
                          : "₦ —"}
                    </strong>
                  </div>
                ))}
              </div>
              {form.capacity && (
                <p className="cev-preview-cap">
                  Capacity · {form.capacity} guests
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ══════════ STICKY ACTION BAR ══════════ */}
      <div className="cev-actionbar">
        <button className="cev-btn cev-btn-ghost" onClick={() => submit("DRAFT")}>
          Save Draft
        </button>
        <button className="cev-btn cev-btn-gold" onClick={() => submit("LIVE")}>
          Publish Event
        </button>
      </div>
    </Shell>
  );
}

/* ================= MODALS ================= */
function LoadingModal() {
  return (
    <div className="cev-overlay">
      <div className="cev-modal">
        <div className="cev-spinner" />
        <p className="cev-modal-text">Publishing event…</p>
      </div>
    </div>
  );
}

function Modal({ type, message, onClose }) {
  return (
    <div className="cev-overlay">
      <div className="cev-modal">
        <h3 className={type === "error" ? "is-error" : "is-success"}>
          {type === "error" ? "Error" : "Success"}
        </h3>
        <p className="cev-modal-text">{message}</p>
        <button className="cev-btn cev-btn-gold cev-w100" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

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
input, textarea, select { font-family:var(--font-b); }

/* ── Shell ── */
.cev-shell { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.cev-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.cev-main { flex:1; width:100%; max-width:1160px; margin:0 auto; padding:clamp(16px,3vw,40px); }

.cev-wordmark { font-family:var(--font-h); font-weight:800; font-size:21px; letter-spacing:-.02em; color:var(--text); background:none; border:none; text-align:left; padding:0; }
.cev-wordmark em { font-style:normal; color:var(--gold); }

.cev-side { display:none; }
.cev-topbar { position:sticky; top:0; z-index:950; height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,3vw,24px); background:rgba(8,9,16,.78); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
.cev-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); }
.cev-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .3s, opacity .3s; }
.cev-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.cev-burger.is-open span:nth-child(2) { opacity:0; }
.cev-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

.cev-drawer { position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(16px,4vw,28px) 28px; display:flex; flex-direction:column; opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
.cev-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }

.cev-nav { display:flex; flex-direction:column; gap:4px; }
.cev-nav-item { position:relative; display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:var(--r-sm); background:none; border:none; color:var(--muted); font-size:14.5px; font-weight:500; text-align:left; transition:color .2s, background .2s; }
.cev-nav-item svg { width:18px; height:18px; flex-shrink:0; }
.cev-nav-item:hover { color:var(--text); background:var(--card); }
.cev-nav-item.is-active { background:var(--gold-dim); color:var(--gold); }
.cev-nav-item.is-active::before { content:''; position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:3px; background:var(--gold); }

@media (min-width:1024px) {
  .cev-side { display:flex; flex-direction:column; width:250px; flex-shrink:0; position:sticky; top:0; height:100svh; background:var(--surface); border-right:1px solid var(--border); padding:26px 14px 18px; }
  .cev-side .cev-wordmark { padding:0 14px; margin-bottom:30px; }
  .cev-side .cev-nav { flex:1; }
  .cev-topbar { display:none; }
  .cev-drawer { display:none; }
}

/* ── Page header ── */
.cev-back { background:none; border:none; color:var(--muted); font-size:13.5px; padding:6px 0; margin-bottom:12px; transition:color .2s; }
.cev-back:hover { color:var(--gold); }
.cev-head { margin-bottom:26px; }
.cev-title { font-family:var(--font-h); font-weight:700; font-size:clamp(24px,3.4vw,34px); letter-spacing:-.01em; }
.cev-sub { color:var(--muted); font-size:14px; margin-top:6px; line-height:1.55; max-width:520px; }

/* ── Layout ── */
.cev-layout { display:grid; grid-template-columns:1fr; gap:clamp(18px,3vw,28px); align-items:start; }
@media (min-width:1024px) {
  .cev-layout { grid-template-columns:minmax(0,1fr) 340px; }
  .cev-preview-col { position:sticky; top:24px; }
}

/* ── Form blocks ── */
.cev-form { display:flex; flex-direction:column; gap:22px; min-width:0; }
.cev-block { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(16px,2.6vw,24px); }
.cev-label { font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); margin-bottom:14px; }

/* toggle */
.cev-toggle { display:flex; gap:8px; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:999px; padding:5px; }
.cev-toggle-btn { flex:1; padding:11px 12px; border-radius:999px; border:none; background:transparent; color:var(--muted); font-weight:600; font-size:13.5px; transition:background .25s, color .25s; }
.cev-toggle-btn.is-active { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; }

/* banner dropzone */
.cev-banner { display:grid; place-items:center; width:100%; aspect-ratio:16/9; border-radius:var(--r-sm); border:1.5px dashed rgba(232,201,106,.45); background:var(--gold-dim); overflow:hidden; cursor:pointer; position:relative; transition:border-color .25s, background .25s; }
.cev-banner:hover { border-color:var(--gold); background:rgba(232,201,106,.16); }
.cev-banner.has-img { border-style:solid; border-color:var(--border); background:var(--surface); }
.cev-banner-img { width:100%; height:100%; object-fit:cover; display:block; }
.cev-banner-empty { display:flex; flex-direction:column; align-items:center; gap:6px; text-align:center; color:var(--text); padding:16px; }
.cev-banner-empty strong { font-family:var(--font-h); font-size:14.5px; }
.cev-banner-empty small { color:var(--muted); font-size:12px; }
.cev-banner-icon { display:grid; place-items:center; width:44px; height:44px; border-radius:14px; background:rgba(232,201,106,.16); color:var(--gold); margin-bottom:4px; }
.cev-banner-icon svg { width:20px; height:20px; }

/* fields */
.cev-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
.cev-span2 { grid-column:1 / -1; }
@media (max-width:560px) { .cev-grid { grid-template-columns:1fr; } }
.cev-field { display:flex; flex-direction:column; gap:7px; min-width:0; }
.cev-field-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.cev-input { width:100%; padding:13px 15px; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:var(--r-sm); color:var(--text); font-size:14px; outline:none; color-scheme:dark; transition:border-color .2s, box-shadow .2s; }
.cev-input::placeholder { color:var(--muted); }
.cev-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
.cev-textarea { resize:vertical; min-height:100px; line-height:1.55; }

/* category select */
.cev-selectwrap { position:relative; }
.cev-selectinput { appearance:none; -webkit-appearance:none; cursor:pointer; padding-right:38px; }
.cev-selectinput option { background:var(--surface); color:var(--text); }
.cev-caret { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; font-size:12px; }

/* tickets */
.cev-tickets { display:flex; flex-direction:column; gap:10px; }
.cev-ticket { background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:var(--r-sm); padding:14px; transition:border-color .25s; }
.cev-ticket:hover { border-color:var(--border-h); }
.cev-ticket-tag { display:inline-block; font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); background:var(--gold-dim); padding:3px 10px; border-radius:999px; margin-bottom:10px; }
.cev-ticket-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr)); gap:10px; }
.cev-add { margin-top:12px; width:100%; background:transparent; border:1.5px dashed rgba(232,201,106,.45); color:var(--gold); padding:12px; border-radius:var(--r-sm); font-weight:600; font-size:13.5px; transition:background .25s, border-color .25s; }
.cev-add-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.cev-group-hint { margin-top:8px; margin-right:8px; font-size:12px; color:var(--gold); background:var(--gold-dim); border-radius:8px; padding:7px 12px; display:inline-block; }
.cev-eb-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr)); gap:10px; margin-top:10px; }
@media (max-width:560px) { .cev-add-row { grid-template-columns:1fr; } }
.cev-add:hover { background:var(--gold-dim); border-color:var(--gold); }

/* ── Preview card ── */
.cev-preview-eyebrow { font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:10px; }
.cev-preview-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,.4); }
.cev-preview-banner { position:relative; aspect-ratio:16/9; background:var(--card); display:grid; place-items:center; overflow:hidden; }
.cev-preview-banner img { width:100%; height:100%; object-fit:cover; display:block; }
.cev-preview-banner-empty { color:var(--muted); }
.cev-preview-banner-empty svg { width:34px; height:34px; opacity:.6; }
.cev-chip { position:absolute; top:12px; left:12px; font-size:10.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:4px 11px; border-radius:999px; backdrop-filter:blur(8px); }
.cev-chip.is-paid { background:rgba(232,201,106,.9); color:#080910; }
.cev-chip.is-free { background:rgba(107,240,160,.9); color:#080910; }
.cev-preview-body { padding:18px; }
.cev-preview-title { font-family:var(--font-h); font-weight:700; font-size:17px; letter-spacing:-.01em; margin-bottom:8px; overflow-wrap:anywhere; }
.cev-preview-meta { color:var(--muted); font-size:13px; margin-bottom:4px; }
.cev-preview-desc { color:var(--muted); font-size:12.5px; line-height:1.55; margin-top:8px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; overflow-wrap:anywhere; }
.cev-preview-tiers { margin-top:14px; border-top:1px solid var(--border); padding-top:12px; display:flex; flex-direction:column; gap:8px; }
.cev-preview-tier { display:flex; justify-content:space-between; align-items:center; gap:10px; font-size:13px; }
.cev-preview-tier span { color:var(--muted); overflow-wrap:anywhere; }
.cev-preview-tier strong { font-family:var(--font-h); font-weight:700; color:var(--gold); font-variant-numeric:tabular-nums; white-space:nowrap; }
.cev-preview-cap { margin-top:12px; font-size:12px; color:var(--muted); }

/* ── Sticky action bar ── */
.cev-actionbar { position:sticky; bottom:0; z-index:900; display:flex; justify-content:flex-end; gap:12px; margin-top:26px; padding:14px 0; background:linear-gradient(180deg, transparent, rgba(8,9,16,.88) 30%); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border-top:1px solid var(--border); }
.cev-btn { border-radius:999px; font-weight:600; font-size:14px; padding:13px 26px; border:1px solid transparent; transition:transform .2s, box-shadow .2s, border-color .2s; white-space:nowrap; }
.cev-btn-gold { background:linear-gradient(135deg,#E8C96A,#F5E196); color:#080910; font-family:var(--font-h); font-weight:700; }
.cev-btn-gold:hover { transform:translateY(-1px); box-shadow:0 8px 26px var(--gold-glo); }
.cev-btn-ghost { background:transparent; color:var(--text); border-color:var(--border); }
.cev-btn-ghost:hover { border-color:var(--border-h); }
.cev-w100 { width:100%; }
@media (max-width:480px) {
  .cev-actionbar { flex-direction:column-reverse; }
  .cev-actionbar .cev-btn { width:100%; }
}

/* ── Modals ── */
.cev-overlay { position:fixed; inset:0; z-index:3000; background:rgba(8,9,16,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:grid; place-items:center; padding:20px; }
.cev-modal { width:min(100%,380px); background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,32px); text-align:center; animation:cevPop .3s ease; }
@keyframes cevPop { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
.cev-modal h3 { font-family:var(--font-h); font-size:18px; font-weight:700; margin-bottom:10px; }
.cev-modal h3.is-error { color:var(--danger); }
.cev-modal h3.is-success { color:var(--live); }
.cev-modal-text { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:20px; }
.cev-spinner { width:40px; height:40px; border:3px solid var(--border); border-top-color:var(--gold); border-radius:50%; margin:0 auto 16px; animation:cevSpin 1s linear infinite; }
@keyframes cevSpin { to { transform:rotate(360deg); } }

@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
