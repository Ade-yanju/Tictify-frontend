import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";

function timeLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function OrganizerNotificationBell() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await fetchNotifications();
      setItems(Array.isArray(result.notifications) ? result.notifications : []);
      setUnreadCount(Number(result.unreadCount) || 0);
      setError("");
    } catch (err) {
      console.error("Notification inbox failed:", err);
      setError("Notifications are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  const openItem = (item) => {
    setOpen(false);
    if (!item.read) {
      setItems((current) => current.map((entry) =>
        entry.id === item.id ? { ...entry, read: true } : entry,
      ));
      setUnreadCount((current) => Math.max(0, current - 1));
      markNotificationRead(item.id).catch(() => load());
    }
    if (item.href?.startsWith("/")) navigate(item.href);
  };

  const markAllRead = async () => {
    if (!unreadCount) return;
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("Mark notifications read failed:", err);
      load();
    }
  };

  return (
    <div className="orgx-notification-wrap">
      <button
        type="button"
        className="orgx-icon-btn"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="bell" size={17} />
        {unreadCount > 0 && (
          <span className="orgx-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="orgx-notification-panel" aria-label="Notifications">
          <div className="orgx-notification-head">
            <div>
              <strong>Notifications</strong>
              <span>{unreadCount ? `${unreadCount} unread` : "All caught up"}</span>
            </div>
            <button type="button" onClick={markAllRead} disabled={!unreadCount || loading}>
              Mark all read
            </button>
          </div>

          {loading ? (
            <div className="orgx-notification-empty">Loading your latest updates…</div>
          ) : error ? (
            <div className="orgx-notification-error">
              {error}
              <button type="button" className="orgx-notification-retry" onClick={load}>Try again</button>
            </div>
          ) : items.length === 0 ? (
            <div className="orgx-notification-empty">
              Sales, withdrawal updates, and important workspace activity will appear here.
            </div>
          ) : (
            <div className="orgx-notification-list">
              {items.map((item) => (
                <button
                  type="button"
                  className={`orgx-notification-item ${item.read ? "" : "is-unread"}`}
                  key={item.id}
                  onClick={() => openItem(item)}
                >
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <time dateTime={item.createdAt}>{timeLabel(item.createdAt)}</time>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
