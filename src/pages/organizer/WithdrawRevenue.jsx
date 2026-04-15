import { useEffect, useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

// Popular Nigerian banks with their Paystack bank codes
const NIGERIAN_BANKS = [
  { code: "", name: "-- Select Bank --" },
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "50211", name: "Kuda Bank" },
  { code: "50515", name: "Moniepoint MFB" },
  { code: "100004", name: "OPay" },
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
  const [submitted, setSubmitted] = useState(false);

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
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setBalance(Number(data?.stats?.walletBalance || 0));
      } catch {
        setBalance(0);
      } finally {
        setLoadingBalance(false);
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

    if (
      !amount ||
      amount <= 0 ||
      !form.bankCode ||
      !form.accountNumber ||
      !form.accountName
    ) {
      return setModal({
        open: true,
        type: "error",
        message: "Please fill in all fields correctly.",
      });
    }

    if (amount > balance) {
      return setModal({
        open: true,
        type: "error",
        message: "Withdrawal amount exceeds available balance.",
      });
    }

    if (submitted) return;

    setLoading(true);

    try {
      // Find the bank name based on the selected code
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
            amount,
            bankDetails: {
              bankName: selectedBank.name,
              bankCode: form.bankCode, // Required for Paystack
              accountNumber: form.accountNumber.trim(),
              accountName: form.accountName.trim(),
            },
          }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Withdrawal request failed");
      }

      setSubmitted(true);

      setModal({
        open: true,
        type: "success",
        message: "Withdrawal successful! Funds have been sent to your account.",
      });

      setBalance((prev) => prev - amount);
      setForm({ amount: "", bankCode: "", accountNumber: "", accountName: "" });
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
      {(loading || loadingBalance) && <LoadingModal />}

      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
        />
      )}

      <form style={styles.card} onSubmit={submit}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/organizer/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h1 style={styles.title}>Withdraw Revenue</h1>

        <p style={styles.muted}>
          Available balance: <strong>₦{balance.toLocaleString()}</strong>
        </p>

        <label style={styles.label}>Amount (₦)</label>
        <input
          style={styles.input}
          type="number"
          name="amount"
          min="1"
          placeholder="50000"
          value={form.amount}
          onChange={updateField}
        />

        <label style={styles.label}>Bank</label>
        <select
          style={styles.input}
          name="bankCode"
          value={form.bankCode}
          onChange={updateField}
        >
          {NIGERIAN_BANKS.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
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
        />

        <label style={styles.label}>Account Name</label>
        <input
          style={styles.input}
          name="accountName"
          placeholder="Your account name"
          value={form.accountName}
          onChange={updateField}
        />

        <button
          style={{
            ...styles.primaryBtn,
            opacity:
              loading || submitted || Number(form.amount) > balance ? 0.6 : 1,
          }}
          disabled={loading || submitted || Number(form.amount) > balance}
        >
          {loading ? "Submitting…" : "Request Withdrawal"}
        </button>

        <p style={styles.note}>
          ⏳ Withdrawals are processed instantly via Paystack.
        </p>
      </form>
    </div>
  );
}

function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>Processing…</div>
    </div>
  );
}

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

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px,4vw,32px)",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    padding: 28,
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#22F2A6",
    fontWeight: 600,
    marginBottom: 12,
    cursor: "pointer",
  },
  title: { marginBottom: 8, fontSize: 24 },
  muted: { color: "#CFC9D6", fontSize: 14, marginBottom: 24 },
  label: { fontSize: 13, color: "#CFC9D6", marginBottom: 6, display: "block" },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    marginBottom: 16,
    outline: "none",
    appearance: "none",
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
    color: "#000",
  },
  note: { marginTop: 16, fontSize: 12, color: "#CFC9D6", textAlign: "center" },
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
  loadingModal: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 18,
    fontWeight: 600,
  },
  modalBtn: {
    marginTop: 20,
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
    color: "#000",
  },
};
