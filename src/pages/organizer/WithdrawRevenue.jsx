import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";

export default function WithdrawRevenue() {
  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  /* ================= LOAD WALLET BALANCE ================= */
  useEffect(() => {
    async function loadBalance() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/organizer`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setBalance(data.stats.walletBalance || 0);
      } catch {
        setBalance(0);
      }
    }

    loadBalance();
  }, []);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();

    const amount = Number(form.amount);

    if (!amount || !form.bankName || !form.accountNumber || !form.accountName) {
      setModal({
        open: true,
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    if (amount > balance) {
      setModal({
        open: true,
        type: "error",
        message: "Withdrawal amount exceeds available balance.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/withdrawals/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            amount,
            bankDetails: {
              bankName: form.bankName,
              accountNumber: form.accountNumber,
              accountName: form.accountName,
            },
          }),
        },
      );

      if (!res.ok) throw new Error("Withdrawal request failed");

      setModal({
        open: true,
        type: "success",
        message:
          "Withdrawal request sent successfully. Awaiting admin approval.",
      });

      // Optimistically update balance
      setBalance((prev) => prev - amount);

      setForm({
        amount: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
      });
    } catch (err) {
      setModal({
        open: true,
        type: "error",
        message: err.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* MODAL */}
      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal({ ...modal, open: false })}
        />
      )}

      <form style={styles.card} onSubmit={submit}>
        <h1 style={styles.title}>Withdraw Revenue</h1>

        <p style={styles.muted}>
          Available balance: <strong>₦{balance.toLocaleString()}</strong>
        </p>

        <label style={styles.label}>Amount (₦)</label>
        <input
          style={styles.input}
          type="number"
          name="amount"
          placeholder="50000"
          value={form.amount}
          onChange={updateField}
        />

        <label style={styles.label}>Bank Name</label>
        <input
          style={styles.input}
          name="bankName"
          placeholder="Access Bank"
          value={form.bankName}
          onChange={updateField}
        />

        <label style={styles.label}>Account Number</label>
        <input
          style={styles.input}
          name="accountNumber"
          placeholder="0123456789"
          value={form.accountNumber}
          onChange={updateField}
        />

        <label style={styles.label}>Account Name</label>
        <input
          style={styles.input}
          name="accountName"
          placeholder="Your name"
          value={form.accountName}
          onChange={updateField}
        />

        <button
          style={{
            ...styles.primaryBtn,
            opacity: loading || Number(form.amount) > balance ? 0.5 : 1,
          }}
          disabled={loading || Number(form.amount) > balance}
        >
          {loading ? "Submitting…" : "Request Withdrawal"}
        </button>

        <p style={styles.note}>
          ⏳ Withdrawals are processed after admin approval.
        </p>
      </form>
    </div>
  );
}

/* ================= MODAL ================= */
function Modal({ type, message, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={{ color: type === "error" ? "#ff4d4f" : "#22F2A6" }}>
          {type === "error" ? "Error" : "Success"}
        </h3>
        <p style={{ marginTop: 8 }}>{message}</p>
        <button style={styles.modalBtn} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    padding: 32,
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },

  title: {
    marginBottom: 8,
    fontSize: 24,
  },

  muted: {
    color: "#CFC9D6",
    fontSize: 14,
    marginBottom: 24,
  },

  label: {
    fontSize: 13,
    color: "#CFC9D6",
    marginBottom: 6,
    display: "block",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    marginBottom: 16,
    outline: "none",
  },

  primaryBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
  },

  note: {
    marginTop: 16,
    fontSize: 12,
    color: "#CFC9D6",
    textAlign: "center",
  },

  /* MODAL */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 18,
    maxWidth: 360,
    width: "100%",
    textAlign: "center",
  },

  modalBtn: {
    marginTop: 20,
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
  },
};
