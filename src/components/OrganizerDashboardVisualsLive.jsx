const COLORS = ["#7418ed", "#c485f7", "#e6cfff", "#a98bd8", "#f0e8fa"];

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export default function OrganizerDashboardVisualsLive({
  stats = {},
  events = [],
  salesTrend = [],
  ticketMix = [],
  capacity = {},
}) {
  const sold = Number(stats.ticketsSold || 0);
  const trend = salesTrend.length
    ? salesTrend
    : Array.from({ length: 7 }, (_, index) => ({ label: "—", date: index, sold: 0 }));
  const maxTrendSold = Math.max(0, ...trend.map((point) => Number(point.sold || 0)));
  const trendMax = maxTrendSold || 1;
  const trendTicks = maxTrendSold
    ? [trendMax, Math.round(trendMax * .75), Math.round(trendMax * .5), Math.round(trendMax * .25), 0]
    : [0, 0, 0, 0, 0];
  const points = trend.map((point, index) => {
    const x = trend.length === 1 ? 150 : 12 + (index * 276) / (trend.length - 1);
    const y = 94 - (Number(point.sold || 0) / trendMax) * 70;
    return { ...point, x, y };
  });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const mix = ticketMix.length
    ? ticketMix
    : sold > 0
      ? [{ name: "All tickets", sold }]
      : [];
  const mixTotal = mix.reduce((sum, item) => sum + Number(item.sold || 0), 0);
  let mixCursor = 0;
  const mixGradient = mix.length
    ? mix.map((item, index) => {
        const start = mixCursor;
        mixCursor += (Number(item.sold || 0) / Math.max(mixTotal, 1)) * 100;
        return `${COLORS[index % COLORS.length]} ${start}% ${mixCursor}%`;
      }).join(", ")
    : "#ece3f7 0 100%";

  const totalCapacity = Number(capacity.total || 0);
  const capacitySold = Number(capacity.sold ?? sold);
  const capacityReserved = Number(capacity.reserved || 0);
  const capacityAvailable = Number(
    capacity.available ?? Math.max(0, totalCapacity - capacitySold - capacityReserved),
  );
  const slotCount = 35;
  const soldSlots = totalCapacity ? Math.min(slotCount, Math.round((capacitySold / totalCapacity) * slotCount)) : 0;
  const reservedSlots = totalCapacity
    ? Math.min(slotCount - soldSlots, Math.round((capacityReserved / totalCapacity) * slotCount))
    : 0;
  const recentEvents = events.slice(0, 3);

  return (
    <section className="orgx-visual-grid" aria-label="Performance overview">
      <article className="orgx-panel orgx-sales-panel">
        <div className="orgx-panel-head">
          <div>
            <span className="orgx-panel-kicker">Sales overview</span>
            <h2>Ticket sales</h2>
          </div>
          <span className="orgx-panel-filter">Last 7 days</span>
        </div>
        <div className="orgx-chart-legend"><span /> Tickets sold</div>
        <div className="orgx-line-chart">
          <div className="orgx-chart-y">
            {[trendMax, Math.round(trendMax * .75), Math.round(trendMax * .5), Math.round(trendMax * .25), 0].map((value, index) => (
              <span key={`${value}-${index}`}>{formatNumber(value)}</span>
            ))}
          </div>
          <svg viewBox="0 0 300 112" role="img" aria-label={`${formatNumber(sold)} tickets sold in total`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="orgxArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#7418ed" stopOpacity=".18" />
                <stop offset="1" stopColor="#7418ed" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`M 12,94 L ${pointString.replace(/ /g, " L ")} L 288,112 L 12,112 Z`} fill="url(#orgxArea)" />
            <polyline points={pointString} fill="none" stroke="#7418ed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="3.5" fill="#fff" stroke="#7418ed" strokeWidth="2" />)}
          </svg>
          <div className="orgx-chart-x">{trend.map((point) => <span key={point.date}>{point.label}</span>)}</div>
        </div>
        {!sold && <p className="orgx-empty-copy">No ticket sales recorded in the last 7 days.</p>}
      </article>

      <article className="orgx-panel orgx-mix-panel">
        <div className="orgx-panel-head">
          <div>
            <span className="orgx-panel-kicker">Ticket mix</span>
            <h2>Sales by type</h2>
          </div>
        </div>
        <div className="orgx-donut-wrap">
          <div className="orgx-donut" style={{ background: `conic-gradient(${mixGradient})` }}>
            <div><strong>{formatNumber(sold)}</strong><span>tickets</span></div>
          </div>
          <div className="orgx-donut-legend">
            {mix.length ? mix.map((item, index) => (
              <span key={item.name}><i style={{ background: COLORS[index % COLORS.length] }} />{item.name}<b>{formatNumber(item.sold)}</b></span>
            )) : <p className="orgx-empty-copy">No ticket sales yet.</p>}
          </div>
        </div>
      </article>

      <article className="orgx-panel orgx-activity-panel">
        <div className="orgx-panel-head">
          <div>
            <span className="orgx-panel-kicker">Recent activity</span>
            <h2>Latest events</h2>
          </div>
        </div>
        <div className="orgx-activity-list">
          {recentEvents.length ? recentEvents.map((event) => (
            <div className="orgx-activity-row" key={event._id}>
              <span className="orgx-event-thumb">{(event.title || "E").slice(0, 1).toUpperCase()}</span>
              <div><strong>{event.title}</strong><small>{formatNumber(event.ticketsSold ?? event.sold)} tickets sold</small></div>
              <b>{event.status || "DRAFT"}</b>
            </div>
          )) : <p className="orgx-empty-copy">Create an event to see your activity here.</p>}
        </div>
      </article>

      <article className="orgx-panel orgx-seat-panel">
        <div className="orgx-panel-head">
          <div>
            <span className="orgx-panel-kicker">Capacity snapshot</span>
            <h2>Event seating</h2>
          </div>
          <span className="orgx-panel-filter">All events</span>
        </div>
        {totalCapacity ? (
          <>
            <div className="orgx-seat-grid" aria-label={`${formatNumber(capacitySold)} sold, ${formatNumber(capacityReserved)} reserved, ${formatNumber(capacityAvailable)} available out of ${formatNumber(totalCapacity)}`}>
              {Array.from({ length: slotCount }, (_, index) => {
                const className = index < soldSlots
                  ? "is-sold"
                  : index < soldSlots + reservedSlots
                    ? "is-reserved"
                    : "";
                return <i key={index} className={className} />;
              })}
            </div>
            <div className="orgx-seat-key">
              <span><i className="is-sold" />Sold {formatNumber(capacitySold)}</span>
              <span><i className="is-reserved" />Reserved {formatNumber(capacityReserved)}</span>
              <span><i />Available {formatNumber(capacityAvailable)}</span>
            </div>
          </>
        ) : <p className="orgx-empty-copy">Create an event with capacity to see seating availability.</p>}
      </article>
    </section>
  );
}
