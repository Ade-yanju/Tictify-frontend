import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanTicket } from "../../services/ticketService";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ScanTicket() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const eventId = params.get("event");

  const scannerRef = useRef(null);
  const readerRef = useRef(null);
  const startedRef = useRef(false);

  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  /* ================= GUARD ================= */
  useEffect(() => {
    if (!eventId) {
      navigate("/organizer/scan/select", { replace: true });
    }
  }, [eventId, navigate]);

  /* ================= CAMERA ================= */
  useEffect(() => {
    if (!scanning || !eventId || !readerRef.current) return;
    if (startedRef.current) return;

    startedRef.current = true;

    const scanner = new Html5Qrcode(readerRef.current.id);
    scannerRef.current = scanner;

    // 🔑 MOBILE-SAFE START
    setTimeout(async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (w, h) => {
              const size = Math.min(w, h) * 0.7;
              return { width: size, height: size };
            },
            aspectRatio: 1,
          },
          async (decodedText) => {
            if (processing) return;
            await handleScan(decodedText);
          },
        );
      } catch (err) {
        startedRef.current = false;
        setScanning(false);
        setModal({
          open: true,
          type: "error",
          message:
            "Unable to access camera. Please allow camera permission or use manual entry.",
        });
      }
    }, 300); // ✅ CRITICAL delay for mobile rendering

    return () => stopCamera();
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

      stopCamera();
    } catch (err) {
      setModal({
        open: true,
        type: "error",
        message: err.message || "Invalid, already used, or wrong event ticket",
      });
    } finally {
      setTimeout(() => setProcessing(false), 1200);
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
    startedRef.current = false;
    setScanning(false);

    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .catch(() => {})
        .finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
    }
  }

  return (
    <div style={styles.page}>
      {modal.open && (
        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
        />
      )}

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

        <p style={styles.muted}>Camera is locked to this event</p>

        {/* CAMERA */}
        <div style={styles.scannerBox}>
          {scanning ? (
            <>
              <div ref={readerRef} id="qr-reader" style={styles.camera} />
              <button style={styles.stopBtn} onClick={stopCamera}>
                Stop Camera
              </button>
            </>
          ) : (
            <button
              style={styles.primaryBtn}
              onClick={() => {
                setError("");
                setScanning(true);
              }}
            >
              🎥 Start Camera Scan
            </button>
          )}
        </div>

        <div style={styles.divider}>OR</div>

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

        {error && <p style={styles.error}>{error}</p>}
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
    minHeight: "100svh", // 🔥 mobile-safe viewport
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
    height: "min(70vw, 320px)", // 🔥 critical
    borderRadius: 12,
    overflow: "hidden",
    background: "#000",
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

  error: {
    color: "#ff4d4f",
    marginTop: 12,
    fontSize: 13,
  },
};

/* ===== SPINNER ===== */
const style = document.createElement("style");
style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
