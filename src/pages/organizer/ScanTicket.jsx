import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanTicket } from "../../services/ticketService";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ScanTicket() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const eventId = params.get("event");

  const qrRegionId = "qr-reader";
  const scannerRef = useRef(null);
  const activeScanRef = useRef(false);

  const [manualCode, setManualCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [modal, setModal] = useState(null);

  /* ================= GUARD ================= */
  useEffect(() => {
    if (!eventId) {
      navigate("/organizer/scan/select", { replace: true });
    }
  }, [eventId, navigate]);

  /* ================= START CAMERA ================= */
  const startCamera = async () => {
    if (scanning || processing) return;

    try {
      const scanner = new Html5Qrcode(qrRegionId);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) {
        throw new Error("No camera available on this device");
      }

      // 🔑 Always prefer back camera
      const camera =
        cameras.find((c) =>
          /back|rear|environment/i.test(c.label),
        ) || cameras[cameras.length - 1];

      setScanning(true);
      activeScanRef.current = true;

      await scanner.start(
        camera.id,
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
          disableFlip: true,
        },
        async (decodedText) => {
          if (!activeScanRef.current || processing) return;
          activeScanRef.current = false;
          await handleScan(decodedText);
        },
      );
    } catch (err) {
      await stopCamera();
      setModal({
        type: "error",
        message:
          "Camera permission denied or unavailable. Please allow camera access or use manual entry.",
      });
    }
  };

  /* ================= STOP CAMERA ================= */
  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch {}
    scannerRef.current = null;
    setScanning(false);
    activeScanRef.current = false;
  };

  /* ================= SCAN HANDLER ================= */
  async function handleScan(code) {
    setProcessing(true);

    try {
      const res = await scanTicket({
        code: code.trim(),
        eventId,
      });

      setModal({
        type: "success",
        message: res.message || "Ticket verified successfully",
      });

      await stopCamera();
    } catch (err) {
      setModal({
        type: "error",
        message:
          err.message || "Invalid, used, or wrong event ticket",
      });
      activeScanRef.current = true;
    } finally {
      setTimeout(() => setProcessing(false), 1200);
    }
  }

  /* ================= MANUAL ENTRY ================= */
  async function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualCode || processing) return;
    await handleScan(manualCode);
    setManualCode("");
  }

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={styles.page}>
      {modal && (
        <Modal {...modal} onClose={() => setModal(null)} />
      )}

      {processing && (
        <div style={styles.processing}>
          <div style={styles.spinner} />
          <p>Verifying ticket…</p>
        </div>
      )}

      <div style={styles.container}>
        <header style={styles.header}>
          <h1>Scan Tickets</h1>
          <button
            style={styles.backBtn}
            onClick={() =>
              navigate("/organizer/dashboard")
            }
          >
            ← Dashboard
          </button>
        </header>

        <div style={styles.scannerBox}>
          <div
            id={qrRegionId}
            style={styles.camera}
          />

          {!scanning ? (
            <button
              style={styles.primaryBtn}
              onClick={startCamera}
            >
              🎥 Start Camera Scan
            </button>
          ) : (
            <button
              style={styles.stopBtn}
              onClick={stopCamera}
            >
              Stop Camera
            </button>
          )}
        </div>

        <div style={styles.divider}>OR</div>

        <form
          onSubmit={handleManualSubmit}
          style={styles.form}
        >
          <input
            style={styles.input}
            placeholder="Enter ticket code manually"
            value={manualCode}
            onChange={(e) =>
              setManualCode(e.target.value)
            }
          />
          <button style={styles.secondaryBtn}>
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
        <h3
          style={{
            color:
              type === "error"
                ? "#ff4d4f"
                : "#22F2A6",
          }}
        >
          {type === "error"
            ? "Access Denied"
            : "Access Granted"}
        </h3>
        <p>{message}</p>
        <button
          style={styles.modalBtn}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100svh",
    background: "#0F0618",
    display: "grid",
    placeItems: "center",
    padding: 16,
    color: "#fff",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    textAlign: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  scannerBox: {
    background: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 20,
  },
  camera: {
    width: "100%",
    height: 320,
    background: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryBtn: {
    marginTop: 12,
    width: "100%",
    padding: 14,
    borderRadius: 999,
    border: "none",
    background: "#22F2A6",
    fontWeight: 700,
  },
  stopBtn: {
    marginTop: 12,
    width: "100%",
    padding: 14,
    borderRadius: 999,
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
  },
  divider: {
    margin: "16px 0",
    fontSize: 12,
    color: "#aaa",
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
  },
  secondaryBtn: {
    padding: 14,
    borderRadius: 999,
    border: "1px solid #22F2A6",
    background: "transparent",
    color: "#22F2A6",
  },
  processing: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "4px solid rgba(255,255,255,.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 16,
    width: 300,
  },
  modalBtn: {
    marginTop: 16,
    width: "100%",
    padding: 12,
    borderRadius: 999,
    background: "#22F2A6",
    border: "none",
  },
};

/* ================= SPINNER ================= */
const style = document.createElement("style");
style.innerHTML =
  "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(style);
