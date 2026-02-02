import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../../services/authService";

export default function AdminWithdrawals() {
  const navigate = useNavigate();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  /* ================= LOAD ================= */
  async function loadWithdrawals() {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/withdrawals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Session expired");

      const data = await res.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  /* ================= ACTION ================= */
  async function handleAction(id, action) {
    if (processingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${action.toUpperCase()} this withdrawal?`,
    );
    if (!confirmed) return;

    setProcessingId(id);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/withdrawals/${id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!res.ok) throw new Error("Action failed");

      await loadWithdrawals();
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  /* ================= STATES ================= */
  if (loading) return <LoadingModal />;

  if (error) {
    return (
      <div style={styles.error}>
        <p>{error}</p>
        <button style={styles.primaryBtn} onClick={handleLogout}>
          Login Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Withdrawal Requests</h1>
          <p style={styles.muted}>
            Review and approve organizer payout requests
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ================= LIST ================= */}
      {withdrawals.length === 0 ? (
        <p style={styles.muted}>No withdrawal requests yet.</p>
      ) : (
        <div style={styles.list}>
          {withdrawals.map((w) => (
            <div key={w._id} style={styles.card}>
              {/* INFO */}
              <div style={styles.info}>
                <strong>{w.organizer?.name || "Organizer"}</strong>
                <p style={styles.muted}>{w.organizer?.email}</p>

                <p style={styles.amount}>
                  ₦{(w.amount || 0).toLocaleString()}
                </p>

                <p style={styles.small}>
                  {w.bankDetails?.bankName} •{" "}
                  {w.bankDetails?.accountNumber}
                </p>
              </div>

              {/* ACTIONS */}
              <div style={styles.actions}>
                <StatusBadge status={w.status} />

                {w.status === "PENDING" && (
                  <>
                    <button
                      style={styles.approve}
                      disabled={processingId === w._id}
                      onClick={() => handleAction(w._id, "approve")}
                    >
                      {processingId === w._id ? "Processing…" : "Approve"}
                    </button>

                    <button
                      style={styles.reject}
                      disabled={processingId === w._id}
                      onClick={() => handleAction(w._id, "reject")}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatusBadge({ status }) {
  const color =
    status === "APPROVED"
      ? "#22F2A6"
      : status === "REJECTED"
        ? "#ff4d4f"
        : "#fadb14";

  return (
    <span style={{ ...styles.badge, borderColor: color, color }}>
      {status}
    </span>
  );
}

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p style={{ marginTop: 12 }}>Loading withdrawals…</p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "clamp(16px,4vw,32px)",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  title: {
    fontSize: "clamp(22px,4vw,32px)",
    marginBottom: 4,
  },

  list: {
    display: "grid",
    gap: 16,
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 20,
    alignItems: "center",
  },

  info: {
    minWidth: 0,
  },

  amount: {
    marginTop: 8,
    fontWeight: 700,
    fontSize: 16,
    color: "#22F2A6",
  },

  actions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  approve: {
    background: "#22F2A6",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
  },

  reject: {
    background: "#ff4d4f",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },

  badge: {
    border: "1px solid",
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  small: {
    color: "#CFC9D6",
    fontSize: 12,
  },

  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid #ff4d4f",
    color: "#ff4d4f",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  primaryBtn: {
    padding: "12px 20px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "#0F0618",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },

  loadingModal: {
    background: "rgba(255,255,255,0.08)",
    padding: 28,
    borderRadius: 18,
    textAlign: "center",
    width: "90%",
    maxWidth: 320,
  },

  spinner: {
    width: 34,
    height: 34,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
    textAlign: "center",
    padding: 20,
  },
};

/* ================= SPINNER ================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
