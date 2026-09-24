import { getToken } from "./authService";

const API = `${import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com"}/api/notifications`;

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchNotifications(limit = 24) {
  const res = await fetch(`${API}?limit=${limit}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Could not load notifications");
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API}/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Could not update notification");
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API}/read-all`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Could not update notifications");
  return res.json();
}
