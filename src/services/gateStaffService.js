import {
  clearGateSession,
  getGateToken,
  setGateSession,
} from "./authService";

const API = `${import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com"}/api/gate`;
const EVENT_API = `${import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com"}/api/events`;

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export function getGateEvent(eventId) {
  return jsonRequest(`${API}/event/${encodeURIComponent(eventId)}`);
}

export async function loginGateStaff({ eventId, email, password }) {
  const result = await jsonRequest(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, email, password }),
  });
  setGateSession(result);
  return result;
}

export function gateStaffToken() {
  return getGateToken();
}

export function logoutGateStaff() {
  clearGateSession();
}

export async function listGateStaff(eventId, token) {
  return jsonRequest(`${EVENT_API}/${eventId}/gate-staff`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createGateStaff(eventId, payload, token) {
  return jsonRequest(`${EVENT_API}/${eventId}/gate-staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function revokeGateStaff(eventId, staffId, token) {
  return jsonRequest(`${EVENT_API}/${eventId}/gate-staff/${staffId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
