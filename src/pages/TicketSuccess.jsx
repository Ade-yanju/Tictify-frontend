import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";

export default function TicketSuccess() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [status, setStatus] = useState("LOADING");
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("Preparing your ticket...");

  // Action States
  const [downloading, setDownloading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  /* ================= LOAD TICKET ================= */
  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid ticket reference");
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 15; // Increased slightly for cloud processing latency

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/by-reference/${reference}`,
        );
        const result = await res.json();

        if (result?.status === "READY") {
          clearInterval(interval);
          setData(result);
          setStatus("READY");
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setStatus("ERROR");
          setMessage("Ticket taking longer than expected. Please refresh.");
        }
      } catch {
        clearInterval(interval);
        setStatus("ERROR");
        setMessage("Unable to load ticket data.");
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [reference]);

  /* ================= EMAIL DELIVERY (SENDCHAMP) ================= */
  async function handleSendEmail() {
    if (!emailInput || !emailInput.includes("@")) {
      return alert("Please enter a valid email address.");
    }

    setSendingEmail(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput, reference }),
        },
      );

      if (res.ok) {
        alert("Success! Check your inbox (and spam folder) for your ticket.");
        setShowEmailModal(false);
      } else {
        alert("Email delivery failed. Please try again or download the PDF.");
      }
    } catch (err) {
      alert("Network error. Please check your connection.");
    } finally {
      setSendingEmail(false);
    }
  }

  /* ================= SAFE IMAGE LOADER ================= */
  async function loadImageAsBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  /* ================= PDF GENERATION ================= */
  async function downloadPDF() {
    if (downloading || !data) return;
    setDownloading(true);

    try {
      const { event, ticket } = data;
      const bannerBase64 = await loadImageAsBase64(event.banner);
      const qrBase64 = await loadImageAsBase64(ticket.qrImage);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, 842, "F");
      doc.addImage(bannerBase64, "JPEG", 40, 30, pageWidth - 80, 140);
      doc.setFontSize(20);
      doc.setTextColor("#111111");
      doc.text(event.title, pageWidth / 2, 210, { align: "center" });
      doc.setFontSize(12);
      doc.setTextColor("#444444");
      doc.text(
        `${new Date(event.date).toDateString()} • ${event.location}`,
        pageWidth / 2,
        232,
        { align: "center" },
      );
      doc.roundedRect(40, 255, pageWidth - 80, 120, 12, 12);
      doc.setFontSize(14);
      doc.text(`Ticket Type: ${ticket.ticketType}`, 60, 295);
      doc.text(`Guest Email: ${ticket.buyerEmail || "—"}`, 60, 320);
      doc.text(`Reference: ${reference}`, 60, 345);
      doc.addImage(qrBase64, "PNG", pageWidth / 2 - 80, 400, 160, 160);
      doc.setFontSize(10);
      doc.setTextColor("#777777");
      doc.text(
        "Present this ticket at the entrance • Powered by Tictify",
        pageWidth / 2,
        610,
        { align: "center" },
      );

      doc.save(`tictify-ticket-${reference}.pdf`);
    } catch (err) {
      alert(
        "PDF generation failed. You can still use the QR code shown on screen.",
      );
    } finally {
      setDownloading(false);
    }
  }

  /* ================= MOBILE NAVIGATION ================= */
  useEffect(() => {
    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 100)
        navigate("/");
    };
    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate]);

  if (status === "LOADING") return <LoadingModal message={message} />;

  if (status === "ERROR") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={{ color: "#FF4D4D" }}>Error</h2>
          <p>{message}</p>
          <button style={styles.primaryBtn} onClick={() => navigate("/")}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const { event, ticket } = data;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🎟️</div>
        <h1 style={styles.title}>Purchase Successful</h1>
        <p style={styles.subtitle}>Your official entry ticket is ready.</p>

        <div style={styles.infoBox}>
          <h3 style={styles.eventTitle}>{event.title}</h3>
          <p style={styles.eventMeta}>{new Date(event.date).toDateString()}</p>
          <p style={styles.eventMeta}>{event.location}</p>
          <div style={styles.badge}>{ticket.ticketType}</div>
        </div>

        <img src={ticket.qrImage} alt="Entry QR" style={styles.qrCode} />

        <div style={styles.actionGroup}>
          <button
            style={{
              ...styles.primaryBtn,
              width: "100%",
              opacity: downloading ? 0.7 : 1,
            }}
            disabled={downloading}
            onClick={downloadPDF}
          >
            {downloading ? "Generating PDF..." : "Download PDF Ticket"}
          </button>

          <button
            style={{ ...styles.secondaryBtn, width: "100%" }}
            onClick={() => setShowEmailModal(true)}
          >
            Send to my Email
          </button>
        </div>

        <p style={styles.refText}>Ref: {reference}</p>
      </div>

      {/* EMAIL MODAL */}
      {showEmailModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.emailCard}>
            <h3>Email Ticket</h3>
            <p style={styles.modalSub}>Where should we send your ticket?</p>
            <input
              style={styles.inputField}
              type="email"
              placeholder="e.g. hello@tictify.ng"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <div style={styles.modalActions}>
              <button
                style={styles.textBtn}
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmBtn}
                onClick={handleSendEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingModal({ message }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingCard}>
        <div className="custom-spinner" style={styles.spinner}></div>
        <p style={{ marginTop: 15 }}>{message}</p>
      </div>
    </div>
  );
}

/* ================= RESPONSIVE STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    color: "#fff",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    padding: "clamp(24px, 5vw, 40px)",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  },
  icon: { fontSize: "50px", marginBottom: "10px" },
  title: {
    fontSize: "clamp(22px, 4vw, 28px)",
    fontWeight: "700",
    margin: "0 0 8px 0",
  },
  subtitle: { fontSize: "15px", color: "#CFC9D6", marginBottom: "25px" },
  infoBox: {
    background: "rgba(255,255,255,0.03)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "25px",
    border: "1px dashed rgba(255,255,255,0.2)",
  },
  eventTitle: { margin: "0 0 5px 0", fontSize: "18px" },
  eventMeta: { margin: "0", fontSize: "14px", color: "#9F97B2" },
  badge: {
    display: "inline-block",
    marginTop: "12px",
    padding: "4px 12px",
    borderRadius: "20px",
    background: "rgba(34, 242, 166, 0.15)",
    color: "#22F2A6",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  qrCode: {
    width: "100%",
    maxWidth: "200px",
    background: "#fff",
    padding: "12px",
    borderRadius: "16px",
    margin: "0 auto 30px auto",
  },
  actionGroup: { display: "flex", flexDirection: "column", gap: "12px" },
  primaryBtn: {
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(90deg, #22F2A6, #7CFF9B)",
    color: "#0F0618",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  secondaryBtn: {
    padding: "15px",
    borderRadius: "14px",
    border: "1.5px solid #22F2A6",
    background: "transparent",
    color: "#22F2A6",
    fontWeight: "600",
    cursor: "pointer",
  },
  refText: {
    marginTop: "20px",
    fontSize: "11px",
    color: "#5F5577",
    wordBreak: "break-all",
  },

  // Modal Styles
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },
  emailCard: {
    background: "#1A0F2E",
    width: "100%",
    maxWidth: "380px",
    padding: "30px",
    borderRadius: "24px",
    textAlign: "center",
    border: "1px solid #3d2b5e",
  },
  modalSub: { fontSize: "14px", color: "#9F97B2", marginBottom: "20px" },
  inputField: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #3d2b5e",
    background: "#25163f",
    color: "#fff",
    marginBottom: "20px",
    fontSize: "16px",
    outline: "none",
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textBtn: {
    background: "none",
    border: "none",
    color: "#9F97B2",
    cursor: "pointer",
  },
  confirmBtn: {
    background: "#22F2A6",
    color: "#0F0618",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
  loadingCard: { textAlign: "center" },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.1)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    margin: "0 auto",
  },
};

// Global Animation for Spinner
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    .custom-spinner { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    button:active { transform: scale(0.98); }
  `;
  document.head.appendChild(styleTag);
}
