import { getToken } from "./authService";

const API = "https://tictify-backend.onrender.com/api/tickets";

export async function scanTicket(code) {
  const token = getToken();

  const res = await fetch(`${API}/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}
