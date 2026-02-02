import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanTicket } from "../../services/ticketService";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ScanTicket() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const eventId = params.get("event");

  const qrRef = useRef(null);

  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  /* ================= GUARD ================= */
  useEffect(() => {
    if (!eventId) {
      setModal({
        open: true,
        type: "error",
        message: "Invalid scan session. Event not specified.",
      });
    }
  }, [eventId]);

  /* ================= CAMERA ================= */
  useEffect(() => {
    if (!scanning || !eventId) return;

    const scanner = new Html5Qrcode("qr-reader");
    qrRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText) => {
          if (processing) return;
          await handleScan(decodedText);
        },
      )
      .catch(() => {
        setModal({
          open: true,
          type: "error",
          message: "Camera access denied or unavailable.",
        });
        setScanning(false);
      });

    return () => {
      scanner
        .stop()
        .catch(() => {})
        .finally(() => (qrRef.current = null));
    };
  }, [scanning, eventId, processing]);

  /* ================= SCAN ================= */
  async function handleScan(code) {
    setProcessing(true);

    try {
      const res = await scanTicket({ code, eventId });

      setModal({
        open: true,
        type: "success",
        message: res.message || "Access granted",
      });

      // Auto stop camera on success
      stopCamera();
    } catch (err) {
      setModal({
        open: true,
        type: "error",
        message: err.message || "Invalid, used, or wrong event ticket",
      });
    } finally {
      setTimeout(() => setProcessing(false), 1500);
    }
  }

  /* ================= MANUAL ================= */
  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode || processing) return;

    await handleScan(manualCode.trim());
    setManualCode("");
  }

  function stopCamera() {
    setScanning(false);
    qrRef.current?.stop().catch(() => {});
  }

  return (
    <div style={styles.page}>
      {/* MODAL */}
      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
        />
      )}

      {/* PROCESSING OVERLAY */}
      {processing && (
        <div style={styles.processing}>
          <div style={styles.spinner} />
          <p>Verifying ticket…</p>
        </div>
      )}

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Scan Tickets</h1>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/organizer/dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        <p style={styles.muted}>Scanner is locked to this event</p>

        {/* CAMERA */}
        <div style={styles.scannerBox}>
          {scanning ? (
            <>
              <div id="qr-reader" style={styles.camera} />
              <button style={styles.stopBtn} onClick={stopCamera}>
                Stop Camera
              </button>
            </>
          ) : (
            <button
              style={styles.primaryBtn}
              onClick={() => setScanning(true)}
            >
              🎥 Start Camera Scan
            </button>
          )}
        </div>

        {/* DIVIDER */}
        <div style={styles.divider}>OR</div>

        {/* MANUAL */}
        <form onSubmit={handleManualSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Enter ticket code manually"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button style={styles.secondaryBtn} disabled={processing}>
            Verify Code
          </button>
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
    padding: 16,
    fontFamily: "Inter, system-ui",
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
    marginBottom: 8,
  },

  title: {
    fontSize: "clamp(20px, 4vw, 26px)",
  },

  backBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "6px 12px",
    borderRadius: 999,
    fontWeight: 600,
    cursor: "pointer",
  },

  muted: {
    color: "#CFC9D6",
    marginBottom: 20,
    fontSize: 14,
  },

  scannerBox: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },

  camera: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },

  stopBtn: {
    marginTop: 12,
    padding: 12,
    width: "100%",
    borderRadius: 999,
    border: "none",
    background: "#ff4d4f",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  divider: {
    margin: "16px 0",
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

  processing: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
    color: "#fff",
    fontWeight: 600,
  },

  spinner: {
    width: 36,
    height: 36,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    marginBottom: 12,
    animation: "spin 1s linear infinite",
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

/* ================= SPINNER ================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
