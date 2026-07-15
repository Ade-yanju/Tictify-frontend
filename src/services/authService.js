const API = `${import.meta.env.VITE_API_URL || "https://tictify-backend.onrender.com"}/api/auth`;

/* ================= REGISTER (ORGANIZER ONLY) ================= */
export async function register(data) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }

  const result = await res.json();

  // Fail-open path (total email outage): the server auto-verified the
  // account and returned a session — persist it exactly like login does.
  if (result.token) {
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
  }

  return result;
}

/* ================= LOGIN ================= */
export async function login(data) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || "Invalid credentials");
    // 403 { requiresVerification: true } → the pages show the OTP step
    error.status = res.status;
    error.requiresVerification = !!err.requiresVerification;
    throw error;
  }

  const result = await res.json();

  // ✅ Persist session
  localStorage.setItem("token", result.token);
  localStorage.setItem("user", JSON.stringify(result.user));

  return result;
}

/* ================= EMAIL VERIFICATION (OTP at signup) ================= */
export async function verifyEmail(data) {
  const res = await fetch(`${API}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Verification failed");
  }

  const result = await res.json();

  // ✅ Same response shape + persistence as a successful login
  localStorage.setItem("token", result.token);
  localStorage.setItem("user", JSON.stringify(result.user));

  return result;
}

export async function resendVerification(email) {
  const res = await fetch(`${API}/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Could not resend the code");
  }

  return res.json();
}

/* ================= SESSION HELPERS ================= */
export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

export function isAdmin() {
  const user = getUser();
  return user?.role === "admin";
}

export function isOrganizer() {
  const user = getUser();
  return user?.role === "organizer";
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}
