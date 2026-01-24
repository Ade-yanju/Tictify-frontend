import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanTicket } from "../../services/ticketService";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ScanTicket() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const eventId = params.get("event");

  const qrInstance = useRef(null);

  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [locked, setLocked] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  /* ================= VALIDATE EVENT ================= */
  useEffect(() => {
    if (!eventId) {
      setModal({
        open: true,
        type: "error",
        message: "Invalid scan session. Event not specified.",
      });
    }
  }, [eventId]);

  /* ================= CAMERA SCAN ================= */
  useEffect(() => {
    if (!scanning || !eventId) return;

    qrInstance.current = new Html5Qrcode("qr-reader");

    qrInstance.current
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (locked) return;
          setLocked(true);
          await handleScan(decodedText);
        },
      )
      .catch(() => {
        setModal({
          open: true,
          type: "error",
          message: "Camera access denied or unavailable",
        });
        setScanning(false);
      });

    return () => {
      qrInstance.current?.stop().catch(() => {});
    };
  }, [scanning, locked, eventId]);

  /* ================= SCAN HANDLER ================= */
  async function handleScan(code) {
    try {
      const res = await scanTicket({
        code,
        eventId,
      });

      setModal({
        open: true,
        type: "success",
        message: res.message || "Access granted",
      });
    } catch (err) {
      setModal({
        open: true,
        type: "error",
        message: err.message || "Invalid, used, or wrong event ticket",
      });
    } finally {
      setTimeout(() => setLocked(false), 2000);
    }
  }

  /* ================= MANUAL SUBMIT ================= */
  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode) return;
    await handleScan(manualCode);
    setManualCode("");
  }

  return (
    <div style={styles.page}>
      {/* MODAL */}
      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() =>
            setModal((m) => ({
              ...m,
              open: false,
            }))
          }
        />
      )}

      <div style={styles.container}>
        <header style={styles.header}>
          <h1>Scan Tickets</h1>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/organizer/dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        <p style={styles.muted}>This scanner is locked to this event only</p>

        {/* CAMERA */}
        <div style={styles.scannerBox}>
          {scanning ? (
            <div id="qr-reader" style={styles.camera} />
          ) : (
            <button style={styles.primaryBtn} onClick={() => setScanning(true)}>
              🎥 Start Camera Scan
            </button>
          )}
        </div>

        {/* DIVIDER */}
        <div style={styles.divider}>OR</div>

        {/* MANUAL INPUT */}
        <form onSubmit={handleManualSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Enter QR code manually"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button style={styles.secondaryBtn}>Verify Code</button>
        </form>
      </div>
    </div>
  );
}

/* ================= MODAL ================= */
function Modal({ type, message, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={{ color: type === "error" ? "#ff4d4f" : "#22F2A6" }}>
          {type === "error" ? "Access Denied" : "Access Granted"}
        </h3>
        <p style={{ marginTop: 10 }}>{message}</p>
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
    background: "#0F0618",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    padding: 20,
  },

  container: {
    width: "100%",
    maxWidth: 420,
    textAlign: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  backBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "6px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
  },

  muted: {
    color: "#CFC9D6",
    marginBottom: 24,
    fontSize: 14,
  },

  scannerBox: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  camera: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },

  divider: {
    margin: "20px 0",
    fontSize: 12,
    color: "#888",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  input: {
    padding: 14,
    borderRadius: 12,
    border: "none",
    outline: "none",
  },

  primaryBtn: {
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },

  secondaryBtn: {
    padding: 14,
    borderRadius: 999,
    border: "1px solid #22F2A6",
    background: "transparent",
    color: "#22F2A6",
    fontWeight: 700,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "grid",
    placeItems: "center",
    zIndex: 999,
  },

  modal: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 20,
    maxWidth: 320,
    width: "100%",
  },

  modalBtn: {
    marginTop: 20,
    padding: "10px 20px",
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },
};
