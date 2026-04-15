import { getToken, logout } from "./authService";

// Upgrade: Use environment variables instead of a hardcoded production URL.
// (Assuming Vite. If using Create React App, use process.env.REACT_APP_API_URL)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com/api";
const DASHBOARD_API = `${API_BASE_URL}/dashboard`;

export async function fetchOrganizerDashboard() {
  const token = getToken();

  if (!token) {
    const error = new Error("Not authenticated");
    error.type = "AUTH";
    throw error;
  }

  try {
    const res = await fetch(`${DASHBOARD_API}/organizer`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401 || res.status === 403) {
      logout();
      const error = new Error("Session expired. Please login again.");
      error.type = "AUTH";
      throw error;
    }

    if (!res.ok) {
      const error = new Error("Failed to load dashboard. Try again.");
      error.type = "SERVER";
      throw error;
    }

    return await res.json();
  } catch (error) {
    // Catch network errors (e.g., user is offline or server is entirely down)
    if (!error.type) {
      error.type = "NETWORK";
      error.message = "Network error. Please check your connection.";
    }
    throw error;
  }
}
