import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  async function loadWithdrawals() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/withdrawals`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!res.ok) throw new Error("Failed to load withdrawals");

      const data = await res.json();
      setWithdrawals(data);
    } catch {
      setError("Unable to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function handleAction(id, action) {
    const confirm = window.confirm(
      `Are you sure you want to ${action.toUpperCase()} this withdrawal?`,
    );
    if (!confirm) return;

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
      alert("Action failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) return <div style={styles.loading}>Loading withdrawals…</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>Withdrawal Requests</h1>
        <p style={styles.muted}>Review and approve organizer payout requests</p>
      </header>

      {withdrawals.length === 0 ? (
        <p style={styles.muted}>No withdrawal requests yet.</p>
      ) : (
        <div style={styles.list}>
          {withdrawals.map((w) => (
            <div key={w._id} style={styles.card}>
              {/* LEFT */}
              <div style={styles.info}>
                <strong>{w.organizer?.name || "Organizer"}</strong>
                <p style={styles.muted}>{w.organizer?.email}</p>
                <p style={styles.amount}>₦{w.amount.toLocaleString()}</p>
                <p style={styles.small}>
                  {w.bankDetails.bankName} • {w.bankDetails.accountNumber}
                </p>
              </div>

              {/* RIGHT */}
              <div style={styles.actions}>
                <StatusBadge status={w.status} />

                {w.status === "PENDING" && (
                  <>
                    <button
                      style={styles.approve}
                      disabled={processingId === w._id}
                      onClick={() => handleAction(w._id, "approve")}
                    >
                      {processingId === w._id ? "…" : "Approve"}
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
    <span style={{ ...styles.badge, borderColor: color, color }}>{status}</span>
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
    marginBottom: 32,
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
    fontWeight: 600,
    fontSize: 16,
  },

  actions: {
    display: "flex",
    gap: 12,
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

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#fff",
  },

  error: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0F0618",
    color: "#ff4d4f",
  },
};
