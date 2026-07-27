/* ═══════════════════════════════════════════════════════════
   AdminEvents.jsx — Tictify 2026 Admin
   Syne + DM Sans · ink #080910 · gold #E8C96A
   All responsive behavior lives in real CSS (@media) below.
═══════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../../services/authService";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = content;
    document.head.appendChild(el);
  }
}

/* Relative "time ago" for the unattributed-sales queue. */
function relativeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

/* ── Icons (inline, dependency-free) ─────────────────────── */
const Ic = {
  dash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="12" width="8" height="9" rx="2" />
      <rect x="3" y="15" width="8" height="6" rx="2" />
    </svg>
  ),
  cal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14.5c2.4.5 4 2.7 4 5.5" strokeLinecap="round" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" strokeLinecap="round" />
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a3 3 0 000 6v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a3 3 0 000-6z" />
      <path d="M13 5v2M13 11v2M13 17v2" strokeDasharray="1 3" />
    </svg>
  ),
  coins: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  ),
  live: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <path d="M7.5 7.5a6.4 6.4 0 000 9M16.5 7.5a6.4 6.4 0 010 9M4.6 4.6a10.5 10.5 0 000 14.8M19.4 4.6a10.5 10.5 0 010 14.8" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  ),
  out: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l-5-5 5-5M5 12h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const NAV = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Ic.dash },
  { label: "Events", path: "/admin/events", icon: Ic.cal },
  { label: "Organizers", path: "/admin/organizers", icon: Ic.users },
  { label: "Withdrawals", path: "/admin/withdrawals", icon: Ic.wallet },
  { label: "Analytics", path: "/admin/sales", icon: Ic.chart },
  {
    label: "Ambassadors",
    path: "/admin/ambassadors",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 4L2 9l10 5 10-5-10-5z" strokeLinejoin="round" />
        <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" strokeLinecap="round" />
        <path d="M22 9v5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Affiliates",
    path: "/admin/affiliates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 15l6-6" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1.4" />
        <circle cx="15" cy="15" r="1.4" />
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AdminEvents() {
  injectStyles("tictify-admin-events-css", CSS);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [notice, setNotice] = useState("");
  /* Recount is per-row and inline: it never replaces the page with an
     error screen, it just annotates the row it belongs to. */
  const [recountBusyId, setRecountBusyId] = useState(null);
  const [recountResult, setRecountResult] = useState({}); // _id → {ok, text}
  /* Unattributed sales — SUCCESS payments whose event id no longer resolves.
     This whole block is inline and self-healing: it never replaces the page
     with an error screen and never logs the admin out on failure. */
  const [unattributed, setUnattributed] = useState([]);
  const [relinkChoice, setRelinkChoice] = useState({}); // paymentId → eventId
  const [relinkBusyId, setRelinkBusyId] = useState(null);
  const [relinkResult, setRelinkResult] = useState({}); // paymentId → {ok, text}

  const itemsPerPage = 10;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Unauthorized or session expired");

        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load events");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate, reloadKey]);

  /* Fetch the unattributed-sales queue once on mount. It is deliberately NOT
     tied to reloadKey: a relink already removes its own row locally and shows
     an inline note, so we don't want a refetch to wipe that feedback. */
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/unattributed-sales`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) return; // stay silent — this is a secondary panel
        const data = await res.json().catch(() => ({}));
        if (alive) setUnattributed(Array.isArray(data.sales) ? data.sales : []);
      } catch {
        /* network hiccup — leave the panel empty, never break the page */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* Re-link one paid ticket to the correct live event. On success we show an
     inline note, remove the row, and bump reloadKey so the events table's
     sold counts refresh. On failure we annotate the row only. */
  async function relink(sale) {
    if (relinkBusyId) return;
    const eventId =
      relinkChoice[sale.paymentId] ??
      sale.suggestedEvent?._id ??
      sale.candidates?.[0]?._id ??
      "";
    if (!eventId) return;
    setRelinkBusyId(sale.paymentId);
    setRelinkResult((r) => ({ ...r, [sale.paymentId]: null }));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/unattributed-sales/${sale.paymentId}/relink`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ eventId }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Unable to link this sale");

      const repaired = data.ticketsRepaired ?? 1;
      setRelinkResult((r) => ({
        ...r,
        [sale.paymentId]: {
          ok: true,
          text: `Linked to ${data.eventTitle || "event"} — ${repaired} ticket${
            repaired === 1 ? "" : "s"
          } repaired`,
        },
      }));
      setReloadKey((k) => k + 1); // refresh the events table's sold counts
      // Let the success note read for a moment, then drop the row.
      setTimeout(() => {
        setUnattributed((prev) =>
          prev.filter((s) => s.paymentId !== sale.paymentId),
        );
      }, 1600);
    } catch (err) {
      setRelinkResult((r) => ({
        ...r,
        [sale.paymentId]: { ok: false, text: err.message || "Unable to link this sale" },
      }));
    } finally {
      setRelinkBusyId(null);
    }
  }

  async function confirmCancel() {
    if (!cancelTarget || cancelBusy) return;
    setCancelBusy(true);
    setCancelError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/events/${cancelTarget._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(
            cancelReason.trim() ? { reason: cancelReason.trim() } : {},
          ),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Unable to cancel event");
      setCancelTarget(null);
      setCancelReason("");
      setNotice(data.message || "Event cancelled");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setCancelError(err.message || "Unable to cancel event");
    } finally {
      setCancelBusy(false);
    }
  }

  /* Force an immediate Payment-derived recount of one event's tiers.
     On success the row's own numbers are replaced from the response —
     no full reload, so the admin keeps their place in the table. */
  async function recount(event) {
    if (recountBusyId) return;
    setRecountBusyId(event._id);
    setRecountResult((r) => ({ ...r, [event._id]: null }));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/events/${event._id}/recount`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Recount failed");

      setEvents((prev) =>
        prev.map((e) =>
          e._id === event._id
            ? { ...e, availability: data.availability ?? e.availability }
            : e,
        ),
      );
      setRecountResult((r) => ({
        ...r,
        [event._id]: {
          ok: true,
          text: data.changed
            ? `Corrected ${data.drifts.length} tier${data.drifts.length === 1 ? "" : "s"}`
            : "Already accurate",
        },
      }));
    } catch (err) {
      setRecountResult((r) => ({
        ...r,
        [event._id]: { ok: false, text: err.message || "Recount failed" },
      }));
    } finally {
      setRecountBusyId(null);
    }
  }

  // Filter and sort logic
  useEffect(() => {
    let filtered = events.filter((e) => {
      const matchSearch =
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.organizerName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || e.status === statusFilter;

      return matchSearch && matchStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortBy === "mostTickets") return (b.ticketsSold || 0) - (a.ticketsSold || 0);
      return 0;
    });

    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [events, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onLogout={() => { logout(); navigate("/login"); }} />;

  return (
    <Shell
      active="/admin/events"
      title="All Events"
      subtitle="Monitor and manage platform events"
      navigate={navigate}
      onLogout={() => { logout(); navigate("/login"); }}
    >
      {/* Needs attention: unattributed sales (renders nothing when empty) */}
      {unattributed.length > 0 && (
        <section
          className="aev-attention"
          role="region"
          aria-label="Unattributed sales needing attention"
        >
          <div className="aev-attention-head">
            <h2 className="aev-attention-title">
              ⚠️ {unattributed.length}{" "}
              {unattributed.length === 1 ? "sale needs" : "sales need"} attention
            </h2>
            <p className="aev-attention-sub">
              These paid tickets point to an event id that no longer matches —
              link each to the correct event so it counts and the guest&apos;s
              QR works at the gate.
            </p>
          </div>

          <div className="aev-attention-list">
            {unattributed.map((sale) => {
              const options = (() => {
                const list = [...(sale.candidates || [])];
                if (
                  sale.suggestedEvent &&
                  !list.some((c) => c._id === sale.suggestedEvent._id)
                ) {
                  list.unshift(sale.suggestedEvent);
                }
                return list;
              })();
              const hasOptions = options.length > 0;
              const selected =
                relinkChoice[sale.paymentId] ??
                sale.suggestedEvent?._id ??
                options[0]?._id ??
                "";
              const busy = relinkBusyId === sale.paymentId;
              const result = relinkResult[sale.paymentId];
              const selectId = `aev-target-${sale.paymentId}`;

              return (
                <div className="aev-att-row" key={sale.paymentId}>
                  <div className="aev-att-info">
                    <div className="aev-att-line1">
                      <span className="aev-att-ref">
                        {sale.reference?.slice(0, 12) || "—"}
                      </span>
                      <span className="aev-att-amount">
                        ₦{(sale.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="aev-att-meta">
                      <span>{sale.organizerName || "Unknown organizer"}</span>
                      <span className="aev-att-dot">•</span>
                      <span>
                        {sale.ticketType || "Ticket"} × {sale.quantity || 1}
                      </span>
                      <span className="aev-att-dot">•</span>
                      <span>{relativeTime(sale.createdAt)}</span>
                    </div>
                    {sale.snapshotTitle && (
                      <div className="aev-att-snap">
                        was: &ldquo;{sale.snapshotTitle}&rdquo;
                      </div>
                    )}
                  </div>

                  <div className="aev-att-controls">
                    {hasOptions ? (
                      <>
                        <label className="aev-sr-only" htmlFor={selectId}>
                          Target event for sale {sale.reference}
                        </label>
                        <select
                          id={selectId}
                          className="aev-att-select"
                          value={selected}
                          disabled={busy}
                          onChange={(e) =>
                            setRelinkChoice((c) => ({
                              ...c,
                              [sale.paymentId]: e.target.value,
                            }))
                          }
                        >
                          {options.map((o) => (
                            <option key={o._id} value={o._id}>
                              {o.title} — {o.status}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <span className="aev-att-none">
                        No matching event found for this organizer
                      </span>
                    )}
                    <button
                      className="aev-att-link"
                      disabled={busy || !hasOptions || !selected}
                      aria-label={`Link sale ${sale.reference} to the selected event`}
                      onClick={() => relink(sale)}
                    >
                      {busy ? "Linking…" : "Link"}
                    </button>
                  </div>

                  {result && (
                    <div
                      className={`aev-att-note ${result.ok ? "is-ok" : "is-err"}`}
                      role="status"
                    >
                      {result.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="aev-filters">
        <div className="aev-search">
          <span className="aev-search-icon">{Ic.search}</span>
          <input
            type="text"
            placeholder="Search events or organizers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="aev-input"
          />
        </div>

        <div className="aev-filter-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="aev-select">
            <option value="ALL">All Status</option>
            <option value="LIVE">Live</option>
            <option value="ENDED">Ended</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="aev-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostTickets">Most Tickets</option>
          </select>
        </div>
      </section>

      {/* Events Table */}
      <section className="aev-table-card">
        {paginatedEvents.length === 0 ? (
          <div className="aev-empty">
            <div className="aev-empty-icon">{Ic.cal}</div>
            <p className="aev-empty-text">No events found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="aev-table-scroll">
              <table className="aev-table">
                <thead>
                  <tr>
                    <th className="aev-th">Event Name</th>
                    <th className="aev-th">Organizer</th>
                    <th className="aev-th">Date</th>
                    <th className="aev-th">Tickets</th>
                    <th className="aev-th">Status</th>
                    <th className="aev-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.map((event) => (
                    <tr key={event._id} className="aev-tr">
                      <td className="aev-td">
                        <div className="aev-event-cell">
                          <div className="aev-event-title">{event.title}</div>
                          <div className="aev-event-id">{event._id?.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="aev-td">{event.organizerName || "—"}</td>
                      <td className="aev-td aev-nowrap">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="aev-td">
                        {(() => {
                          /* availability mirrors the checkout guards, so
                             sold/remaining here is what the server honours.
                             Falls back to ticketsSold on older payloads. */
                          const av = event.availability;
                          const sold = av?.totalSold ?? event.ticketsSold ?? 0;
                          const cap = av?.capacity ?? event.capacity ?? null;
                          const left =
                            av?.remaining ??
                            (cap != null ? Math.max(0, cap - sold) : null);
                          return (
                            <div className="aev-tickets-cell">
                              <span className="aev-tickets-num">
                                {sold}/{cap ?? "—"}
                              </span>
                              <div className="aev-ticket-bar">
                                <div
                                  className="aev-ticket-fill"
                                  style={{ width: `${Math.min((sold / (cap || 1)) * 100, 100)}%` }}
                                />
                              </div>
                              {left != null && (
                                <span
                                  className={`aev-tickets-left ${left === 0 ? "is-out" : ""}`}
                                >
                                  {left === 0 ? "Sold out" : `${left} remaining`}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="aev-td">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="aev-td">
                        <div className="aev-actions">
                          <button
                            className="aev-recount-btn"
                            disabled={recountBusyId === event._id}
                            onClick={() => recount(event)}
                          >
                            {recountBusyId === event._id
                              ? "Recounting…"
                              : "Recount"}
                          </button>
                          {["LIVE", "DRAFT"].includes(event.status) && (
                            <button
                              className="aev-cancel-btn"
                              onClick={() => {
                                setCancelReason("");
                                setCancelError("");
                                setCancelTarget(event);
                              }}
                            >
                              Cancel event
                            </button>
                          )}
                          {recountResult[event._id] && (
                            <span
                              className={`aev-recount-note ${
                                recountResult[event._id].ok ? "" : "is-err"
                              }`}
                              role="status"
                            >
                              {recountResult[event._id].text}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="aev-pagination">
                <button
                  className="aev-page-btn"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="aev-page-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  className="aev-page-btn"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Stats */}
      <section className="aev-stats">
        <StatCard label="Total Events" value={filteredEvents.length} icon={Ic.cal} />
        <StatCard label="Live Events" value={filteredEvents.filter(e => e.status === "LIVE").length} icon={Ic.live} />
        <StatCard label="Total Tickets Sold" value={filteredEvents.reduce((sum, e) => sum + (e.ticketsSold || 0), 0)} icon={Ic.ticket} />
        <StatCard label="Total Revenue" value={`₦${filteredEvents.reduce((sum, e) => sum + (e.revenue || 0), 0).toLocaleString()}`} icon={Ic.coins} />
      </section>

      {/* Cancel confirm modal */}
      {cancelTarget && (
        <div className="aev-overlay" role="dialog" aria-modal="true">
          <div className="aev-modal">
            <h3 className="aev-modal-title is-danger">Cancel this event?</h3>
            <p className="aev-modal-event">{cancelTarget.title}</p>
            <p className="aev-modal-text">
              This blocks sales and gate entry, and holds the event&apos;s
              revenue from the organizer&apos;s wallet for refunds.
            </p>
            <label className="aev-modal-label" htmlFor="aev-cancel-reason">
              Reason (optional)
            </label>
            <textarea
              id="aev-cancel-reason"
              className="aev-modal-input"
              rows={3}
              placeholder="e.g. Suspected fraudulent activity"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            {cancelError && <p className="aev-modal-error">{cancelError}</p>}
            <div className="aev-modal-actions">
              <button
                className="aev-modal-ghost"
                disabled={cancelBusy}
                onClick={() => setCancelTarget(null)}
              >
                Keep event
              </button>
              <button
                className="aev-modal-danger"
                disabled={cancelBusy}
                onClick={confirmCancel}
              >
                {cancelBusy ? "Cancelling…" : "Cancel event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result notice */}
      {notice && (
        <div className="aev-overlay" role="dialog" aria-modal="true">
          <div className="aev-modal">
            <h3 className="aev-modal-title is-ok">Event cancelled</h3>
            <p className="aev-modal-text">{notice}</p>
            <div className="aev-modal-actions">
              <button className="aev-btn-gold" onClick={() => setNotice("")}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ================= APP SHELL ================= */

function Shell({ active, title, subtitle, navigate, onLogout, children }) {
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

  const navButtons = NAV.map((n) => (
    <button
      key={n.path}
      className={`aev-nav-item ${active === n.path ? "is-active" : ""}`}
      onClick={() => go(n.path)}
    >
      {n.icon}
      <span>{n.label}</span>
    </button>
  ));

  return (
    <div className="aev-page">
      <aside className="aev-sidebar">
        <div className="aev-mark">Tic<em>tify</em></div>
        <nav className="aev-nav">{navButtons}</nav>
        <button className="aev-logout" onClick={onLogout}>
          {Ic.out}
          <span>Logout</span>
        </button>
      </aside>

      <div className="aev-body">
        <header className="aev-topbar">
          <div className="aev-mark">Tic<em>tify</em></div>
          <button
            className={`aev-burger ${menuOpen ? "is-open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <div className={`aev-drawer ${menuOpen ? "is-open" : ""}`}>
          {navButtons}
          <button className="aev-logout" onClick={onLogout}>
            {Ic.out}
            <span>Logout</span>
          </button>
        </div>

        <div className="aev-content">
          <header className="aev-phead">
            <h1 className="aev-title">{title}</h1>
            <p className="aev-subtitle">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatusBadge({ status }) {
  const badgeClass = {
    LIVE: "is-live",
    ENDED: "is-ended",
    UPCOMING: "is-upcoming",
    CANCELLED: "is-cancelled",
  };
  return (
    <span className={`aev-badge ${badgeClass[status] || "is-upcoming"}`}>
      {status || "UNKNOWN"}
    </span>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="aev-kpi">
      <div className="aev-kpi-icon">{icon}</div>
      <div className="aev-kpi-content">
        <p className="aev-kpi-label">{label}</p>
        <h4 className="aev-kpi-value">{value}</h4>
      </div>
    </div>
  );
}

function LoadingScreen() {
  injectStyles("tictify-admin-events-css", CSS);
  return (
    <div className="aev-loading">
      <div className="aev-loading-top">
        <div className="aev-spinner" />
        <p>Loading events…</p>
      </div>
      <div className="aev-skel" style={{ height: 52 }} />
      <div className="aev-skel" style={{ height: 380 }} />
      <div className="aev-skel-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aev-skel" style={{ height: 96 }} />
        ))}
      </div>
    </div>
  );
}

function ErrorScreen({ error, onLogout }) {
  injectStyles("tictify-admin-events-css", CSS);
  return (
    <div className="aev-error">
      <div className="aev-error-card">
        <div className="aev-error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="aev-btn-gold" onClick={onLogout}>Login Again</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS — all responsive behavior lives here
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

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
button, input, select { font-family:var(--font-b); }

@keyframes aev-spin { to { transform:rotate(360deg); } }
@keyframes aev-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
@keyframes aev-fade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

/* ── Shell ── */
.aev-page { display:flex; min-height:100svh; background:var(--bg); color:var(--text); font-family:var(--font-b); }
.aev-sidebar { position:sticky; top:0; height:100svh; width:250px; flex:0 0 250px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:26px 14px 18px; overflow-y:auto; }
.aev-mark { font-family:var(--font-h); font-weight:800; font-size:22px; letter-spacing:-.02em; color:var(--text); padding:0 12px 26px; }
.aev-mark em { font-style:normal; color:var(--gold); }
.aev-nav { display:flex; flex-direction:column; gap:4px; flex:1; }
.aev-nav-item { position:relative; display:flex; align-items:center; gap:12px; width:100%; background:none; border:none; color:var(--muted); font-size:14px; font-weight:500; padding:11px 14px; border-radius:var(--r-sm); cursor:pointer; text-align:left; transition:color .2s, background .2s; }
.aev-nav-item svg { width:18px; height:18px; flex:0 0 auto; }
.aev-nav-item:hover { color:var(--text); background:var(--card); }
.aev-nav-item.is-active { background:var(--gold-dim); color:var(--gold); font-weight:600; }
.aev-nav-item.is-active::before { content:''; position:absolute; left:-14px; top:9px; bottom:9px; width:3px; border-radius:0 2px 2px 0; background:var(--gold); }
.aev-logout { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:18px; background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:14px; font-weight:600; padding:11px 14px; border-radius:999px; cursor:pointer; transition:background .2s, border-color .2s; }
.aev-logout:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.aev-logout svg { width:16px; height:16px; }
.aev-body { flex:1; min-width:0; display:flex; flex-direction:column; }
.aev-topbar { display:none; }
.aev-drawer { display:none; }
.aev-content { width:100%; max-width:1280px; margin:0 auto; padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:clamp(20px,3vw,28px); }
.aev-title { font-family:var(--font-h); font-weight:800; font-size:clamp(24px,3.2vw,34px); letter-spacing:-.02em; line-height:1.1; }
.aev-subtitle { color:var(--muted); font-size:14px; margin-top:6px; }

/* ── Filters ── */
.aev-filters { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
.aev-search { position:relative; flex:1 1 260px; min-width:0; }
.aev-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--muted); display:grid; place-items:center; pointer-events:none; }
.aev-search-icon svg { width:16px; height:16px; }
.aev-input { width:100%; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:13px 16px 13px 42px; color:var(--text); font-size:14px; outline:none; transition:border-color .2s, box-shadow .2s; }
.aev-input::placeholder { color:var(--muted); }
.aev-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
.aev-select { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-sm); padding:12px 14px; color:var(--text); font-size:13px; cursor:pointer; outline:none; transition:border-color .2s; }
.aev-select:hover, .aev-select:focus { border-color:var(--border-h); }
.aev-filter-controls { display:flex; gap:10px; flex-wrap:wrap; }

/* ── Table ── */
.aev-table-card { background:var(--card); border:1px solid var(--border); border-radius:var(--r); overflow:hidden; }
.aev-table-scroll { overflow-x:auto; }
.aev-table { width:100%; min-width:640px; border-collapse:collapse; }
.aev-th { padding:14px 18px; text-align:left; font-size:11px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border); white-space:nowrap; }
.aev-tr { border-bottom:1px solid var(--border); transition:background .2s; }
.aev-tr:last-child { border-bottom:none; }
.aev-tr:hover { background:rgba(255,255,255,0.03); }
.aev-td { padding:16px 18px; font-size:14px; vertical-align:middle; }
.aev-nowrap { white-space:nowrap; }
.aev-event-cell { display:flex; flex-direction:column; gap:4px; min-width:160px; }
.aev-event-title { font-weight:600; }
.aev-event-id { font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; }
.aev-tickets-cell { display:flex; flex-direction:column; gap:6px; }
.aev-tickets-num { font-variant-numeric:tabular-nums; font-size:13px; }
.aev-ticket-bar { height:5px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; min-width:100px; }
.aev-ticket-fill { height:100%; background:var(--gold); border-radius:3px; transition:width .4s ease; }
.aev-tickets-left { font-size:11px; color:var(--muted); font-variant-numeric:tabular-nums; white-space:nowrap; }
.aev-tickets-left.is-out { color:var(--danger); font-weight:600; }
.aev-badge { padding:5px 12px; border-radius:999px; font-weight:700; font-size:11px; letter-spacing:.06em; white-space:nowrap; display:inline-block; }
.aev-badge.is-live { background:var(--live); color:#080910; }
.aev-badge.is-ended { background:rgba(224,92,92,.15); color:var(--danger); border:1px solid rgba(224,92,92,.35); }
.aev-badge.is-upcoming { background:var(--gold-dim); color:var(--gold); border:1px solid rgba(232,201,106,.35); }
.aev-badge.is-cancelled { background:rgba(224,92,92,.12); color:var(--danger); border:1px dashed rgba(224,92,92,.5); }

/* ── Cancel action & modal ── */
.aev-cancel-btn { background:transparent; border:1px solid rgba(224,92,92,.4); color:var(--danger); font-size:12px; font-weight:600; padding:7px 14px; border-radius:999px; cursor:pointer; white-space:nowrap; transition:background .2s, border-color .2s; }
.aev-cancel-btn:hover { background:rgba(224,92,92,.1); border-color:var(--danger); }
.aev-no-action { color:var(--muted); }
.aev-actions { display:flex; flex-direction:column; align-items:flex-start; gap:7px; }
.aev-recount-btn { background:transparent; border:1px solid var(--border-h); color:var(--text); font-size:12px; font-weight:600; padding:7px 14px; border-radius:999px; cursor:pointer; white-space:nowrap; transition:background .2s, border-color .2s, color .2s; }
.aev-recount-btn:hover:not(:disabled) { border-color:var(--gold); color:var(--gold); background:var(--gold-dim); }
.aev-recount-btn:disabled { opacity:.5; cursor:not-allowed; }
.aev-recount-note { font-size:11px; color:var(--live); line-height:1.45; max-width:180px; }
.aev-recount-note.is-err { color:var(--danger); }
.aev-overlay { position:fixed; inset:0; z-index:3000; background:rgba(8,9,16,.8); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:grid; place-items:center; padding:20px; }
.aev-modal { width:min(100%,420px); background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:clamp(24px,5vw,32px); animation:aev-fade .3s ease; }
.aev-modal-title { font-family:var(--font-h); font-size:19px; font-weight:700; margin-bottom:8px; }
.aev-modal-title.is-danger { color:var(--danger); }
.aev-modal-title.is-ok { color:var(--live); }
.aev-modal-event { font-weight:600; font-size:14px; margin-bottom:10px; overflow-wrap:anywhere; }
.aev-modal-text { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:18px; }
.aev-modal-label { display:block; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.aev-modal-input { width:100%; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:12px 14px; color:var(--text); font-size:14px; font-family:var(--font-b); outline:none; resize:vertical; transition:border-color .2s, box-shadow .2s; }
.aev-modal-input:focus { border-color:rgba(232,201,106,.5); box-shadow:0 0 0 3px var(--gold-dim); }
.aev-modal-error { color:var(--danger); font-size:13px; margin-top:10px; }
.aev-modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; flex-wrap:wrap; }
.aev-modal-ghost { background:transparent; border:1px solid var(--border); color:var(--text); font-size:13.5px; font-weight:600; padding:11px 20px; border-radius:999px; cursor:pointer; transition:border-color .2s; }
.aev-modal-ghost:hover:not(:disabled) { border-color:var(--border-h); }
.aev-modal-danger { background:var(--danger); border:none; color:#080910; font-size:13.5px; font-weight:700; padding:11px 20px; border-radius:999px; cursor:pointer; transition:transform .2s, box-shadow .2s; }
.aev-modal-danger:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 26px rgba(224,92,92,.3); }
.aev-modal-ghost:disabled, .aev-modal-danger:disabled { opacity:.5; cursor:not-allowed; }

/* ── Empty state ── */
.aev-empty { padding:64px 20px; text-align:center; }
.aev-empty-icon { width:52px; height:52px; border-radius:16px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; margin:0 auto 16px; }
.aev-empty-icon svg { width:24px; height:24px; }
.aev-empty-text { color:var(--muted); font-size:14px; }

/* ── Pagination ── */
.aev-pagination { display:flex; justify-content:center; align-items:center; gap:16px; padding:18px; border-top:1px solid var(--border); flex-wrap:wrap; }
.aev-page-btn { background:var(--gold-dim); border:1px solid rgba(232,201,106,.3); color:var(--gold); padding:9px 18px; border-radius:999px; cursor:pointer; font-size:13px; font-weight:600; transition:background .2s, opacity .2s; }
.aev-page-btn:hover:not(:disabled) { background:rgba(232,201,106,.2); }
.aev-page-btn:disabled { opacity:.35; cursor:not-allowed; }
.aev-page-info { font-size:13px; color:var(--muted); font-variant-numeric:tabular-nums; }

/* ── KPI ── */
.aev-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:clamp(12px,2vw,20px); }
.aev-kpi { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(16px,2.4vw,22px); display:flex; gap:14px; align-items:flex-start; transition:transform .25s, border-color .25s; animation:aev-fade .4s ease both; }
.aev-kpi:hover { transform:translateY(-3px); border-color:var(--border-h); }
.aev-kpi-icon { width:40px; height:40px; border-radius:12px; background:var(--gold-dim); color:var(--gold); display:grid; place-items:center; flex:0 0 auto; }
.aev-kpi-icon svg { width:18px; height:18px; }
.aev-kpi-content { min-width:0; }
.aev-kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
.aev-kpi-value { font-family:var(--font-h); font-weight:700; font-size:clamp(18px,2.2vw,22px); font-variant-numeric:tabular-nums; margin-top:6px; word-break:break-word; }

/* ── Loading / skeleton ── */
.aev-loading { min-height:100svh; background:var(--bg); color:var(--text); padding:clamp(16px,3vw,40px); display:flex; flex-direction:column; gap:18px; max-width:1280px; margin:0 auto; font-family:var(--font-b); }
.aev-loading-top { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:14px; }
.aev-spinner { width:22px; height:22px; border:2.5px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:aev-spin .9s linear infinite; }
.aev-skel { border:1px solid var(--border); border-radius:var(--r); background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 45%,rgba(255,255,255,.04) 65%); background-size:200% 100%; animation:aev-shimmer 1.3s linear infinite; }
.aev-skel-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr)); gap:16px; }

/* ── Error ── */
.aev-error { min-height:100svh; background:var(--bg); display:grid; place-items:center; padding:20px; font-family:var(--font-b); }
.aev-error-card { width:min(100%,420px); background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:clamp(26px,5vw,40px); text-align:center; animation:aev-fade .35s ease; }
.aev-error-icon { width:46px; height:46px; border-radius:50%; background:rgba(224,92,92,.12); color:var(--danger); display:grid; place-items:center; margin:0 auto 16px; font-family:var(--font-h); font-weight:800; font-size:20px; }
.aev-error-card h2 { font-family:var(--font-h); font-size:20px; color:var(--text); margin-bottom:8px; }
.aev-error-card p { color:var(--muted); font-size:14px; line-height:1.6; margin-bottom:22px; }
.aev-btn-gold { background:var(--gold); color:#080910; border:none; border-radius:999px; font-weight:700; font-size:14px; padding:13px 26px; cursor:pointer; transition:transform .2s, box-shadow .2s; }
.aev-btn-gold:hover { transform:translateY(-2px); box-shadow:0 10px 30px var(--gold-glo); }

/* ── Needs attention: unattributed sales ── */
.aev-attention { background:rgba(224,92,92,.06); border:1px solid rgba(224,92,92,.35); border-radius:var(--r); padding:clamp(16px,2.4vw,24px); display:flex; flex-direction:column; gap:16px; animation:aev-fade .4s ease both; }
.aev-attention-title { font-family:var(--font-h); font-weight:800; font-size:clamp(17px,2.2vw,21px); letter-spacing:-.01em; line-height:1.15; color:var(--danger); }
.aev-attention-sub { color:var(--muted); font-size:13.5px; line-height:1.6; margin-top:6px; max-width:70ch; }
.aev-attention-list { display:flex; flex-direction:column; gap:10px; }
.aev-att-row { display:flex; flex-wrap:wrap; align-items:center; gap:12px 16px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); padding:14px 16px; }
.aev-att-info { flex:1 1 260px; min-width:0; display:flex; flex-direction:column; gap:5px; }
.aev-att-line1 { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
.aev-att-ref { font-family:var(--font-h); font-weight:700; font-size:14px; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.aev-att-amount { font-weight:700; font-size:14px; color:var(--gold); font-variant-numeric:tabular-nums; }
.aev-att-meta { display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:12.5px; color:var(--muted); }
.aev-att-dot { opacity:.5; }
.aev-att-snap { font-size:12px; color:var(--muted); font-style:italic; overflow-wrap:anywhere; }
.aev-att-controls { display:flex; align-items:center; gap:10px; flex-wrap:wrap; flex:0 1 auto; min-width:0; }
.aev-att-select { max-width:100%; min-width:0; background:var(--surface); border:1px solid var(--border); border-radius:var(--r-sm); padding:10px 12px; color:var(--text); font-size:13px; cursor:pointer; outline:none; transition:border-color .2s; }
.aev-att-select:hover:not(:disabled), .aev-att-select:focus { border-color:var(--border-h); }
.aev-att-select:disabled { opacity:.5; cursor:not-allowed; }
.aev-att-link { background:var(--gold); border:none; color:#080910; font-size:13px; font-weight:700; padding:10px 20px; border-radius:999px; cursor:pointer; white-space:nowrap; transition:transform .2s, box-shadow .2s, opacity .2s; }
.aev-att-link:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px var(--gold-glo); }
.aev-att-link:disabled { opacity:.45; cursor:not-allowed; }
.aev-att-none { font-size:12.5px; color:var(--muted); font-style:italic; }
.aev-att-note { flex:1 1 100%; font-size:12.5px; line-height:1.5; }
.aev-att-note.is-ok { color:var(--live); }
.aev-att-note.is-err { color:var(--danger); }
.aev-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width:1023px) {
  .aev-page { flex-direction:column; }
  .aev-sidebar { display:none; }
  .aev-topbar { position:sticky; top:0; z-index:950; display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 clamp(14px,3vw,20px); background:rgba(8,9,16,.8); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
  .aev-topbar .aev-mark { padding:0; font-size:19px; }
  .aev-burger { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; width:42px; height:42px; background:var(--card); border:1px solid var(--border); border-radius:var(--r-sm); cursor:pointer; }
  .aev-burger span { display:block; width:17px; height:2px; background:var(--text); border-radius:2px; transition:transform .25s, opacity .25s; }
  .aev-burger.is-open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .aev-burger.is-open span:nth-child(2) { opacity:0; }
  .aev-burger.is-open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  .aev-drawer { display:flex; flex-direction:column; gap:4px; position:fixed; inset:60px 0 0 0; z-index:940; background:rgba(8,9,16,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); padding:18px clamp(14px,4vw,24px); opacity:0; transform:translateY(-8px); pointer-events:none; transition:opacity .25s, transform .25s; overflow-y:auto; }
  .aev-drawer.is-open { opacity:1; transform:none; pointer-events:auto; }
  .aev-drawer .aev-nav-item { font-size:16px; padding:16px 14px; border-radius:var(--r-sm); }
  .aev-drawer .aev-nav-item.is-active::before { left:0; }
  .aev-drawer .aev-logout { margin-top:22px; }
}
@media (max-width:768px) {
  .aev-td { padding:13px 14px; font-size:13px; }
  .aev-th { padding:12px 14px; }
  .aev-filter-controls { width:100%; }
  .aev-select { flex:1; }
  .aev-att-controls { width:100%; }
  .aev-att-select { flex:1 1 auto; }
}
@media (max-width:480px) {
  .aev-pagination { gap:10px; }
  .aev-page-btn { padding:8px 14px; font-size:12px; }
  .aev-att-link { flex:1 1 100%; }
}
@media (prefers-reduced-motion:reduce) {
  *, *::before, *::after { animation:none !important; transition:none !important; }
}
`;
