import { getToken, logout } from "./authService";

const API_BASE = "https://tictify-backend.onrender.com/api/dashboard";

export async function fetchOrganizerDashboard() {
  const token = getToken();

  if (!token) {
    throw { type: "AUTH", message: "No session found. Please login." };
  }

  const res = await fetch(`${API_BASE}/organizer`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401 || res.status === 403) {
    logout();
    throw { type: "AUTH", message: "Session expired. Please login again." };
  }

  if (!res.ok) {
    throw { type: "SERVER", message: "Server error. Could not sync wallet." };
  }

  return res.json();
}
