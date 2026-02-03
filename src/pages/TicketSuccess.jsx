import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";

export default function TicketSuccess() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const [status, setStatus] = useState("LOADING");
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("Preparing your ticket…");

  /* ================= LOAD TICKET ================= */
  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setMessage("Invalid ticket reference");
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 10;

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
          setMessage("Unable to load ticket.");
        }
      } catch {
        clearInterval(interval);
        setStatus("ERROR");
        setMessage("Unable to load ticket.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reference]);

  /* ================= PDF GENERATION ================= */
  async function downloadPDF() {
    const { event, ticket } = data;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // 🌄 BACKDROP
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, pageWidth, 842, "F");

    // 🖼 EVENT BANNER
    const banner = await loadImage(event.banner);
    doc.addImage(banner, "JPEG", 40, 30, pageWidth - 80, 160);

    // 🎟 TITLE
    doc.setFontSize(22);
    doc.setTextColor("#111");
    doc.text(event.title, pageWidth / 2, 220, { align: "center" });

    // 📅 META
    doc.setFontSize(12);
    doc.setTextColor("#444");
    doc.text(
      `${new Date(event.date).toDateString()} • ${event.location}`,
      pageWidth / 2,
      245,
      { align: "center" },
    );

    // 📄 INFO BOX
    doc.setDrawColor(220);
    doc.roundedRect(40, 270, pageWidth - 80, 120, 12, 12);

    doc.setFontSize(14);
    doc.text(`Ticket Type: ${ticket.ticketType}`, 60, 310);
    doc.text(`Guest Email: ${ticket.buyerEmail || "—"}`, 60, 335);
    doc.text(`Reference: ${reference}`, 60, 360);

    // 🔳 QR CODE
    const qr = await loadImage(ticket.qrImage);
    doc.addImage(qr, "PNG", pageWidth / 2 - 90, 420, 180, 180);

    // 🔒 FOOTER
    doc.setFontSize(10);
    doc.setTextColor("#777");
    doc.text(
      "Present this ticket at the entrance • Powered by Tictify",
      pageWidth / 2,
      640,
      { align: "center" },
    );

    doc.save(`tictify-ticket-${reference}.pdf`);
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.src = src;
    });
  }

  /* ================= SWIPE BACK ================= */
  useEffect(() => {
    const start = (e) => (touchStartX.current = e.touches[0].clientX);
    const end = (e) => {
      if (e.changedTouches[0].clientX - touchStartX.current > 80) {
        navigate("/");
      }
    };

    window.addEventListener("touchstart", start);
    window.addEventListener("touchend", end);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchend", end);
    };
  }, [navigate]);

  /* ================= STATES ================= */
  if (status === "LOADING") {
    return (
      <div style={styles.page}>
        <LoadingModal message={message} />
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <h2>Error</h2>
          <p>{message}</p>
          <button style={styles.primaryBtn} onClick={() => navigate("/")}>
            Go Home
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

        <h1 style={styles.title}>Your Ticket Is Ready</h1>
        <p style={styles.subtitle}>Download your official event ticket below</p>

        <div style={styles.info}>
          <strong>{event.title}</strong>
          <p>{new Date(event.date).toDateString()}</p>
          <p>{event.location}</p>
          <p>
            Ticket: <strong>{ticket.ticketType}</strong>
          </p>
        </div>

        <img src={ticket.qrImage} alt="QR Code" style={styles.qr} />

        <button style={styles.primaryBtn} onClick={downloadPDF}>
          Download Ticket (PDF)
        </button>

        <p style={styles.ref}>Reference: {reference}</p>
      </div>
    </div>
  );
}

/* ================= LOADING MODAL ================= */
function LoadingModal({ message }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>
        <div style={styles.spinner} />
        <p>{message}</p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100svh",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    display: "grid",
    placeItems: "center",
    padding: "clamp(16px,4vw,32px)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: "100%",
    maxWidth: 520,
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(28px,5vw,40px)",
    borderRadius: 24,
    textAlign: "center",
  },

  icon: { fontSize: 56, marginBottom: 12 },

  title: {
    fontSize: "clamp(22px,4vw,28px)",
  },

  subtitle: {
    fontSize: 14,
    color: "#CFC9D6",
    marginBottom: 20,
  },

  info: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 1.6,
  },

  qr: {
    width: "min(220px, 70vw)",
    background: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },

  primaryBtn: {
    padding: "14px 22px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
  },

  ref: {
    marginTop: 16,
    fontSize: 12,
    color: "#9F97B2",
    wordBreak: "break-all",
  },
};
