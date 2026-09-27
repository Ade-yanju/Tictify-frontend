export default function PublicOrganizerAttribution({ event, compact = false }) {
  const organizer = event?.organizer && typeof event.organizer === "object" ? event.organizer : null;
  const name = String(organizer?.name || event?.organizerName || "Tictify organizer").trim();
  const avatar = organizer?.avatar || "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`tictify-host ${compact ? "is-compact" : ""}`}>
      <span className="tictify-host-avatar" aria-hidden="true">
        {avatar ? <img src={avatar} alt="" loading="lazy" /> : initials}
      </span>
      <span className="tictify-host-copy">
        <small>Event hosted by</small>
        <strong>{name}</strong>
      </span>
    </div>
  );
}
