// import { useEffect, useState } from "react";
// import { getToken } from "../../services/authService";

// export default function AdminWithdrawals() {
//   const [withdrawals, setWithdrawals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   async function loadWithdrawals() {
//     try {
//       const res = await fetch("http://localhost:5000/api/admin/withdrawals", {
//         headers: {
//           Authorization: `Bearer ${getToken()}`,
//         },
//       });

//       if (!res.ok) throw new Error("Failed to load withdrawals");

//       const data = await res.json();
//       setWithdrawals(data);
//     } catch (err) {
//       setError(err.message || "Unable to load withdrawals");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleAction(id, action) {
//     const confirm = window.confirm(
//       `Are you sure you want to ${action} this withdrawal?`,
//     );
//     if (!confirm) return;

//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/admin/withdrawals/${id}/${action}`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${getToken()}`,
//           },
//         },
//       );

//       if (!res.ok) throw new Error("Action failed");

//       loadWithdrawals();
//     } catch (err) {
//       alert(err.message || "Something went wrong");
//     }
//   }

//   if (loading) return <div style={styles.loading}>Loading withdrawals…</div>;
//   if (error) return <div style={styles.error}>{error}</div>;

//   return (
//     <div style={styles.page}>
//       <header style={styles.header}>
//         <h1>Withdrawal Requests</h1>
//         <p style={styles.muted}>
//           Review and approve organizer withdrawal requests
//         </p>
//       </header>

//       {withdrawals.length === 0 ? (
//         <p style={styles.muted}>No withdrawal requests yet.</p>
//       ) : (
//         <div style={styles.table}>
//           {withdrawals.map((w) => (
//             <div key={w._id} style={styles.row}>
//               <div>
//                 <strong>₦{w.amount.toLocaleString()}</strong>
//                 <p style={styles.muted}>
//                   {w.bankDetails.accountName} • {w.bankDetails.bankName}
//                 </p>
//                 <p style={styles.small}>{w.bankDetails.accountNumber}</p>
//               </div>

//               <div>
//                 <StatusBadge status={w.status} />
//               </div>

//               <div style={styles.actions}>
//                 {w.status === "PENDING" && (
//                   <>
//                     <button
//                       style={styles.approve}
//                       onClick={() => handleAction(w._id, "approve")}
//                     >
//                       Approve
//                     </button>
//                     <button
//                       style={styles.reject}
//                       onClick={() => handleAction(w._id, "reject")}
//                     >
//                       Reject
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ================= HELPERS ================= */

// function StatusBadge({ status }) {
//   return (
//     <span
//       style={{
//         ...styles.badge,
//         background:
//           status === "APPROVED"
//             ? "#22F2A6"
//             : status === "REJECTED"
//               ? "#ff4d4f"
//               : "#fadb14",
//         color: status === "PENDING" ? "#000" : "#000",
//       }}
//     >
//       {status}
//     </span>
//   );
// }

// /* ================= STYLES ================= */

// const styles = {
//   page: {
//     minHeight: "100vh",
//     padding: 32,
//     background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
//     color: "#fff",
//     fontFamily: "Inter, system-ui",
//   },

//   header: {
//     marginBottom: 32,
//   },

//   table: {
//     display: "grid",
//     gap: 16,
//   },

//   row: {
//     display: "grid",
//     gridTemplateColumns: "2fr 1fr 1fr",
//     gap: 16,
//     background: "rgba(255,255,255,0.08)",
//     padding: 20,
//     borderRadius: 18,
//     alignItems: "center",
//   },

//   actions: {
//     display: "flex",
//     gap: 12,
//   },

//   approve: {
//     background: "#22F2A6",
//     border: "none",
//     padding: "8px 14px",
//     borderRadius: 999,
//     fontWeight: 600,
//     cursor: "pointer",
//   },

//   reject: {
//     background: "#ff4d4f",
//     border: "none",
//     padding: "8px 14px",
//     borderRadius: 999,
//     fontWeight: 600,
//     cursor: "pointer",
//   },

//   badge: {
//     padding: "6px 14px",
//     borderRadius: 999,
//     fontWeight: 600,
//     fontSize: 12,
//   },

//   muted: {
//     color: "#CFC9D6",
//     fontSize: 14,
//   },

//   small: {
//     color: "#CFC9D6",
//     fontSize: 12,
//   },

//   loading: {
//     minHeight: "100vh",
//     display: "grid",
//     placeItems: "center",
//     background: "#0F0618",
//     color: "#fff",
//   },

//   error: {
//     minHeight: "100vh",
//     display: "grid",
//     placeItems: "center",
//     background: "#0F0618",
//     color: "#ff4d4f",
//   },
// };
import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/withdrawals", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error("Failed to fetch withdrawals");

      const data = await res.json();
      setWithdrawals(data);
    } catch (err) {
      setError("Unable to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id, action) {
    await fetch(`http://localhost:5000/api/admin/withdrawals/${id}/${action}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    load();
  }

  if (loading) return <p style={styles.loading}>Loading withdrawals…</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.page}>
      <h1>Withdrawal Requests</h1>

      {withdrawals.length === 0 && (
        <p style={styles.muted}>No withdrawal requests yet.</p>
      )}

      {withdrawals.map((w) => (
        <div key={w._id} style={styles.card}>
          <div>
            <strong>{w.organizer?.name}</strong>
            <p style={styles.muted}>{w.organizer?.email}</p>
            <p>₦{w.amount.toLocaleString()}</p>
            <p style={styles.muted}>
              {w.bankDetails.bankName} • {w.bankDetails.accountNumber}
            </p>
          </div>

          <div style={styles.actions}>
            <StatusBadge status={w.status} />

            {w.status === "PENDING" && (
              <>
                <button
                  style={styles.approve}
                  onClick={() => handleAction(w._id, "approve")}
                >
                  Approve
                </button>
                <button
                  style={styles.reject}
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
    <span style={{ ...styles.badge, color, borderColor: color }}>{status}</span>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: 32,
    background: "#0F0618",
    color: "#fff",
  },

  card: {
    background: "rgba(255,255,255,0.07)",
    padding: 20,
    borderRadius: 18,
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },

  actions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  approve: {
    background: "#22F2A6",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
  },

  reject: {
    background: "#ff4d4f",
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    color: "#fff",
  },

  badge: {
    border: "1px solid",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
  },

  loading: {
    padding: 60,
    textAlign: "center",
  },

  error: {
    padding: 60,
    color: "#ff4d4f",
    textAlign: "center",
  },
};
