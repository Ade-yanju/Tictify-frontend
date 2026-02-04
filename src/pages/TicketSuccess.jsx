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

  const [downloading, setDownloading] = useState(false);
  const imagesRef = useRef({ banner: null, qr: null });

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

  /* ================= PRELOAD IMAGES ONCE ================= */
  useEffect(() => {
    if (!data) return;

    const load = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    (async () => {
      try {
        imagesRef.current.banner = await load(data.event.banner);
        imagesRef.current.qr = await load(data.ticket.qrImage);
      } catch {
        // silently fail — handled during download
      }
    })();
  }, [data]);

  /* ================= PDF GENERATION ================= */
  async function downloadPDF() {
    if (downloading || !data) return;
    setDownloading(true);

    try {
      const { event, ticket } = data;
      const banner = imagesRef.current.banner;
      const qr = imagesRef.current.qr;

      if (!banner || !qr) {
        throw new Error("Assets not ready");
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, 842, "F");

      doc.addImage(banner, "JPEG", 40, 30, pageWidth - 80, 150);

      doc.setFontSize(22);
      doc.setTextColor("#111");
      doc.text(event.title, pageWidth / 2, 215, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor("#444");
      doc.text(
        `${new Date(event.date).toDateString()} • ${event.location}`,
        pageWidth / 2,
        238,
        { align: "center" },
      );

      doc.roundedRect(40, 265, pageWidth - 80, 120, 12, 12);
      doc.setFontSize(14);
      doc.text(`Ticket Type: ${ticket.ticketType}`, 60, 305);
      doc.text(`Guest Email: ${ticket.buyerEmail || "—"}`, 60, 330);
      doc.text(`Reference: ${reference}`, 60, 355);

      doc.addImage(qr, "PNG", pageWidth / 2 - 90, 410, 180, 180);

      doc.setFontSize(10);
      doc.setTextColor("#777");
      doc.text(
        "Present this ticket at the entrance • Powered by Tictify",
        pageWidth / 2,
        640,
        { align: "center" },
      );

      doc.save(`tictify-ticket-${reference}.pdf`);
    } catch {
      alert("Unable to generate ticket. Please refresh and try again.");
    } finally {
      setDownloading(false);
    }
  }

  /* ================= SWIPE BACK (MOBILE ONLY) ================= */
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
    return <LoadingModal message={message} />;
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
        <p style={styles.subtitle}>Download your official event ticket</p>

        <div style={styles.info}>
          <strong>{event.title}</strong>
          <p>{new Date(event.date).toDateString()}</p>
          <p>{event.location}</p>
          <p>
            Ticket: <strong>{ticket.ticketType}</strong>
          </p>
        </div>

        <img src={ticket.qrImage} alt="QR Code" style={styles.qr} />

        <button
          style={{
            ...styles.primaryBtn,
            opacity: downloading ? 0.6 : 1,
          }}
          disabled={downloading}
          onClick={downloadPDF}
        >
          {downloading ? "Preparing PDF…" : "Download Ticket (PDF)"}
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
    minHeight: "100vh", // ✅ desktop safe
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "clamp(16px,4vw,40px)",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: "100%",
    maxWidth: 520,
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(24px,4vw,40px)",
    borderRadius: 24,
    textAlign: "center",
    marginTop: 40,
  },

  icon: { fontSize: 56, marginBottom: 12 },

  title: { fontSize: "clamp(22px,4vw,28px)" },

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

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "grid",
    placeItems: "center",
  },

  loadingModal: {
    background: "#1A0F2E",
    padding: 28,
    borderRadius: 18,
    textAlign: "center",
  },

  spinner: {
    width: 34,
    height: 34,
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #22F2A6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  errorCard: {
    textAlign: "center",
  },
};
