import { useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("PAID");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    capacity: "",
    ticketTypes: [{ name: "Regular", price: "", quantity: "" }],
  });

  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  /* ================= HELPERS ================= */
  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateTicket = (i, field, value) => {
    const tickets = [...form.ticketTypes];
    tickets[i][field] = value;
    setForm({ ...form, ticketTypes: tickets });
  };

  const addTicket = () => {
    setForm({
      ...form,
      ticketTypes: [...form.ticketTypes, { name: "", price: "", quantity: "" }],
    });
  };

  const validate = () => {
    if (!banner) return "Event banner is required";
    if (!form.title || !form.location || !form.date || !form.capacity) {
      return "All event fields are required";
    }
    for (const t of form.ticketTypes) {
      if (!t.name || !t.quantity) return "Ticket name & quantity required";
      if (eventType === "PAID" && t.price === "") {
        return "Price is required for paid events";
      }
    }
    return null;
  };

  /* ================= SUBMIT ================= */
  const submit = async (status) => {
    const error = validate();
    if (error) return setModal({ type: "error", message: error });

    setLoading(true);

    try {
      const bannerUrl = await uploadBanner();

      const payload = {
        ...form,
        status,
        banner: bannerUrl,
        capacity: Number(form.capacity),
        ticketTypes: form.ticketTypes.map((t) => ({
          name: t.name,
          quantity: Number(t.quantity),
          price: eventType === "FREE" ? 0 : Number(t.price),
        })),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setModal({
        type: "success",
        message:
          status === "LIVE"
            ? "Event published successfully 🎉"
            : "Event saved as draft",
      });
    } catch (err) {
      setModal({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ================= IMAGE UPLOAD ================= */
  const uploadBanner = async () => {
    const formData = new FormData();
    formData.append("image", banner);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`,
      { method: "POST", body: formData },
    );

    const data = await res.json();
    if (!data.success) throw new Error("Banner upload failed");
    return data.data.url;
  };

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      {loading && <LoadingModal />}
      {modal && (
        <Modal
          {...modal}
          onClose={() => {
            setModal(null);
            if (modal.type === "success") navigate("/organizer/dashboard");
          }}
        />
      )}

      {/* BACK */}
      <button style={styles.backBtn} onClick={() => navigate("/organizer/dashboard")}>
        ← Back to Dashboard
      </button>

      <div style={styles.card}>
        <h1>Create Event</h1>

        {/* EVENT TYPE */}
        <div style={styles.toggle}>
          {["PAID", "FREE"].map((t) => (
            <button
              key={t}
              onClick={() => setEventType(t)}
              style={{
                ...styles.toggleBtn,
                ...(eventType === t && styles.active),
              }}
            >
              {t} Event
            </button>
          ))}
        </div>

        {/* BANNER */}
        <label style={styles.banner}>
          {preview ? (
            <img src={preview} style={styles.bannerImg} />
          ) : (
            <span>Click to upload event banner</span>
          )}
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setBanner(file);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        {/* FORM */}
        <div style={styles.grid}>
          <input name="title" placeholder="Event title" onChange={updateField} />
          <input name="location" placeholder="Location" onChange={updateField} />
          <input type="datetime-local" name="date" onChange={updateField} />
          <input type="number" name="capacity" placeholder="Capacity" onChange={updateField} />
        </div>

        <textarea
          rows={4}
          placeholder="Event description"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* TICKETS */}
        <h3>Tickets</h3>
        {form.ticketTypes.map((t, i) => (
          <div key={i} style={styles.ticketRow}>
            <input placeholder="Name" value={t.name} onChange={(e) => updateTicket(i, "name", e.target.value)} />
            {eventType === "PAID" && (
              <input type="number" placeholder="Price ₦" value={t.price} onChange={(e) => updateTicket(i, "price", e.target.value)} />
            )}
            <input type="number" placeholder="Qty" value={t.quantity} onChange={(e) => updateTicket(i, "quantity", e.target.value)} />
          </div>
        ))}

        <button style={styles.addBtn} onClick={addTicket}>+ Add Ticket</button>

        {/* PREVIEW */}
        <h3>Preview</h3>
        <div style={styles.previewCard}>
          {preview && <img src={preview} style={styles.previewImg} />}
          <strong>{form.title || "Event Title"}</strong>
          <p>{form.location || "Location"} • {form.date || "Date"}</p>
        </div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button onClick={() => submit("DRAFT")}>Save Draft</button>
          <button style={styles.publish} onClick={() => submit("LIVE")}>
            Publish Event
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MODALS ================= */
function LoadingModal() {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.loadingModal}>Publishing event…</div>
    </div>
  );
}

function Modal({ type, message, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3>{type === "error" ? "Error" : "Success"}</h3>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: { background: "#0F0618", minHeight: "100vh", padding: 20, color: "#fff" },
  card: { maxWidth: 900, margin: "auto", background: "rgba(255,255,255,.08)", padding: 24, borderRadius: 20 },
  backBtn: { background: "transparent", color: "#22F2A6", border: "none", marginBottom: 12, cursor: "pointer" },
  toggle: { display: "flex", gap: 8, marginBottom: 20 },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 999, border: "1px solid #22F2A6", background: "transparent", color: "#22F2A6" },
  active: { background: "#22F2A6", color: "#000" },
  banner: { height: 220, borderRadius: 16, background: "rgba(255,255,255,.05)", display: "grid", placeItems: "center", marginBottom: 20, cursor: "pointer" },
  bannerImg: { width: "100%", height: "100%", objectFit: "cover" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 },
  ticketRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 },
  addBtn: { marginTop: 8, border: "1px dashed #22F2A6", background: "transparent", color: "#22F2A6", padding: 10, borderRadius: 12 },
  previewCard: { marginTop: 12, background: "rgba(255,255,255,.06)", padding: 16, borderRadius: 16 },
  previewImg: { width: "100%", borderRadius: 12, marginBottom: 8 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 },
  publish: { background: "#22F2A6", border: "none", padding: "10px 20px", borderRadius: 999 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "grid", placeItems: "center" },
  modal: { background: "#1A0F2E", padding: 24, borderRadius: 16, width: 320, textAlign: "center" },
  loadingModal: { background: "#1A0F2E", padding: 24, borderRadius: 16 },
};
