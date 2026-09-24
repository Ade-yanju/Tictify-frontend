export default function OrganizerEventAnalytics({ events = [] }) {
  const totalSold = events.reduce((sum, event) => sum + Number(event.ticketsSold || 0), 0);
  const totalScanned = events.reduce((sum, event) => sum + Number(event.ticketsScanned || 0), 0);
  const totalRevenue = events.reduce((sum, event) => sum + Number(event.revenue || 0), 0);
  const rate = totalSold ? Math.round((totalScanned / totalSold) * 100) : 0;
  const max = Math.max(...events.map((event) => Number(event.ticketsSold || 0)), 1);

  return (
    <section className="orgx-insight-grid" aria-label="Attendee insights">
      <article className="orgx-panel orgx-insight-bars">
        <div className="orgx-panel-head"><div><span className="orgx-panel-kicker">All attendee locations</span><h2>Tickets sold by event</h2></div><span className="orgx-panel-filter">This year⌄</span></div>
        <div className="orgx-bars-chart">
          {events.slice(0, 8).map((event) => <div key={event.eventId} className="orgx-bar-item"><span style={{ height: `${Math.max(8, Math.round((Number(event.ticketsSold || 0) / max) * 100))}%` }} /><small>{(event.title || "Event").slice(0, 8)}</small></div>)}
          {!events.length && <p className="orgx-empty-copy">Event sales will appear here.</p>}
        </div>
      </article>
      <article className="orgx-panel orgx-insight-donut">
        <div className="orgx-panel-head"><div><span className="orgx-panel-kicker">Attendance overview</span><h2>Checked in</h2></div><span className="orgx-more">•••</span></div>
        <div className="orgx-attendance-ring" style={{ background: `conic-gradient(#7418ed 0 ${rate}%, #eee6f7 ${rate}% 100%)` }}><div><strong>{rate}%</strong><span>attended</span></div></div>
        <p className="orgx-insight-caption">{totalScanned.toLocaleString()} of {totalSold.toLocaleString()} tickets scanned</p>
      </article>
      <article className="orgx-panel orgx-insight-summary">
        <span className="orgx-panel-kicker">Performance summary</span>
        <div className="orgx-summary-row"><span>Tickets sold</span><strong>{totalSold.toLocaleString()}</strong></div>
        <div className="orgx-summary-row"><span>Attendees</span><strong>{totalScanned.toLocaleString()}</strong></div>
        <div className="orgx-summary-row"><span>Revenue</span><strong>₦{totalRevenue.toLocaleString()}</strong></div>
      </article>
    </section>
  );
}
