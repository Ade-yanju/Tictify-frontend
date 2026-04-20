import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

// Fixed Paystack codes for common digital & commercial banks
const NIGERIAN_BANKS = [
  { code: "", name: "-- Select Bank --" },
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "50211", name: "Kuda Bank" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "999992", name: "OPay (Digital Bank)" }, // Fixed code for Paystack
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "057", name: "Zenith Bank" },
];

export default function WithdrawRevenue() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [modal, setModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    async function loadBalance() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/organizer`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        const data = await res.json();
        setBalance(Number(data?.stats?.walletBalance || 0));
      } catch (err) {
        console.error("Balance fetch failed", err);
      } finally {
        setLoadingBalance(false);
      }
    }
    loadBalance();
  }, []);

  // Fixed: Ensure the input value is always a clean number string (no commas)
  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    const amountNum = Number(form.amount);

    if (!amountNum || amountNum < 100) {
      return setModal({
        open: true,
        type: "error",
        message: "Minimum withdrawal is ₦500.",
      });
    }

    if (amountNum > balance) {
      return setModal({
        open: true,
        type: "error",
        message: "Insufficient balance.",
      });
    }

    setLoading(true);
    try {
      const selectedBank = NIGERIAN_BANKS.find((b) => b.code === form.bankCode);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/withdrawals/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            amount: amountNum,
            bankDetails: {
              bankName: selectedBank.name,
              bankCode: form.bankCode,
              accountNumber: form.accountNumber.trim(),
              accountName: form.accountName.trim(),
            },
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Withdrawal failed");

      setModal({
        open: true,
        type: "success",
        message: "Payout successful! Funds are arriving now.",
      });
      setBalance((prev) => prev - amountNum);
      setForm({ amount: "", bankCode: "", accountNumber: "", accountName: "" });
    } catch (err) {
      setModal({ open: true, type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {(loading || loadingBalance) && (
        <div style={styles.modalOverlay}>
          <div style={styles.loadingModal}>Processing...</div>
        </div>
      )}

      {modal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3
              style={{ color: modal.type === "error" ? "#ff4d4f" : "#22F2A6" }}
            >
              {modal.type === "error" ? "Error" : "Success"}
            </h3>
            <p style={{ marginTop: 8 }}>{modal.message}</p>
            <button
              style={styles.modalBtn}
              onClick={() => setModal({ ...modal, open: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <form style={styles.card} onSubmit={submit}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/organizer/dashboard")}
        >
          ← Back
        </button>
        <h1 style={styles.title}>Withdraw Revenue</h1>
        <p style={styles.muted}>
          Available: <strong>₦{balance.toLocaleString()}</strong>
        </p>

        <label style={styles.label}>Amount (₦)</label>
        <input
          style={styles.input}
          type="number" // Stays numeric only
          name="amount"
          placeholder="e.g. 5000"
          value={form.amount}
          onChange={updateField}
          required
        />

        <label style={styles.label}>Bank</label>
        <select
          style={styles.input}
          name="bankCode"
          value={form.bankCode}
          onChange={updateField}
          required
        >
          {NIGERIAN_BANKS.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>

        <label style={styles.label}>Account Number</label>
        <input
          style={styles.input}
          name="accountNumber"
          placeholder="0123456789"
          value={form.accountNumber}
          onChange={updateField}
          required
        />

        <label style={styles.label}>Account Name</label>
        <input
          style={styles.input}
          name="accountName"
          placeholder="John Doe"
          value={form.accountName}
          onChange={updateField}
          required
        />

        <button
          style={{ ...styles.primaryBtn, opacity: loading ? 0.6 : 1 }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Withdraw Now"}
        </button>
      </form>
    </div>
  );
}

// ... styles remain the same as your previous snippet
const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "rgba(255,255,255,0.05)",
    padding: 32,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#22F2A6",
    cursor: "pointer",
    marginBottom: 16,
  },
  title: { fontSize: 22, marginBottom: 8 },
  muted: { color: "#9b93a8", fontSize: 14, marginBottom: 24 },
  label: { display: "block", fontSize: 12, color: "#9b93a8", marginBottom: 6 },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    marginBottom: 16,
    outline: "none",
  },
  primaryBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 30,
    background: "#22F2A6",
    color: "#000",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    display: "grid",
    placeItems: "center",
    zIndex: 100,
  },
  modal: {
    background: "#1A0F2E",
    padding: 32,
    borderRadius: 20,
    textAlign: "center",
    maxWidth: 300,
  },
  loadingModal: { background: "#1A0F2E", padding: 20, borderRadius: 12 },
  modalBtn: {
    marginTop: 20,
    padding: "10px 30px",
    borderRadius: 20,
    background: "#22F2A6",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
};
