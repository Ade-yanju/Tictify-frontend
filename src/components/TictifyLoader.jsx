import Icon from "./Icon";

export default function TictifyLoader({
  label = "Loading your workspace…",
  fullScreen = false,
  compact = false,
  inline = false,
}) {
  return (
    <div
      className={`tictify-loader${fullScreen ? " is-fullscreen" : ""}${compact ? " is-compact" : ""}${inline ? " is-inline" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="tictify-loader-brand" aria-label="Tictify">
        <span className="tictify-loader-mark" aria-hidden="true">
          <Icon name="ticket" size={compact ? 16 : 20} />
        </span>
        <span className="tictify-loader-wordmark">Tictify</span>
      </div>
      <div className="tictify-loader-zoom" aria-hidden="true">
        <span />
      </div>
      <p>{label}</p>
    </div>
  );
}
