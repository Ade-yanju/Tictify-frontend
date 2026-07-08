import { getToken } from "./authService";

const API = `${import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com"}/api/tickets`;

export async function scanTicket(code, eventId) {
  const token = getToken();

  const res = await fetch(`${API}/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code, eventId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}
