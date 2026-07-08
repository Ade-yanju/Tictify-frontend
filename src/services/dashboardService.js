import { getToken, logout } from "./authService";

const API = `${import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com"}/api/dashboard`;

export async function fetchOrganizerDashboard() {
  const token = getToken();

  if (!token) {
    throw { type: "AUTH", message: "Not authenticated" };
  }

  const res = await fetch(`${API}/organizer`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    logout();
    throw { type: "AUTH", message: "Session expired. Please login again." };
  }

  if (!res.ok) {
    throw {
      type: "SERVER",
      message: "Failed to load dashboard. Try again.",
    };
  }

  return res.json();
}
