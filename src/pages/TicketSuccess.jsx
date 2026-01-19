import { useEffect } from "react";

export default function TicketSuccess() {
  useEffect(() => {
    // Prevent going back to checkout accidentally
    window.history.replaceState(null, "", window.location.href);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* ICON */}
        <div style={styles.iconWrap}>✅</div>

        {/* TITLE */}
        <h1 style={styles.title}>Payment Successful!</h1>

        {/* MESSAGE */}
        <p style={styles.text}>
          Your ticket has been successfully generated and sent to your email.
        </p>

        <p style={styles.subText}>
          Please check your inbox (and spam folder) for your QR code ticket.
          You’ll need it for entry at the event.
        </p>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button
            style={styles.primaryBtn}
            onClick={() => (window.location.href = "/events")}
          >
            Browse More Events
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => (window.location.href = "/")}
          >
            Back to Home
          </button>
        </div>

        {/* FOOTER NOTE */}
        <p style={styles.footerNote}>
          Need help? Contact the event organizer or support.
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #1F0D33, #0F0618)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: "100%",
    maxWidth: 480,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    padding: "40px 32px",
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    textAlign: "center",
  },

  iconWrap: {
    fontSize: 48,
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    marginBottom: 12,
  },

  text: {
    fontSize: 15,
    color: "#E5E1F0",
    marginBottom: 12,
  },

  subText: {
    fontSize: 14,
    color: "#CFC9D6",
    marginBottom: 28,
    lineHeight: 1.5,
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 24,
  },

  primaryBtn: {
    padding: "12px 22px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(90deg,#22F2A6,#7CFF9B)",
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 160,
  },

  secondaryBtn: {
    padding: "12px 22px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    minWidth: 160,
  },

  footerNote: {
    fontSize: 12,
    color: "#9F97B2",
  },
};
