import { useState } from "react";
import { getToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("PAID"); // ✅ NEW
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

  const updateTicket = (index, field, value) => {
    const tickets = [...form.ticketTypes];
    tickets[index][field] = value;
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
      if (!t.name || !t.quantity) {
        return "Ticket name and quantity are required";
      }

      if (eventType === "PAID" && t.price === "") {
        return "Price is required for paid events";
      }
    }

    return null;
  };

  /* ================= SUBMIT ================= */
  const submit = async (status) => {
    const error = validate();
    if (error) {
      setModal({ type: "error", message: error });
      return;
    }

    setLoading(true);

    try {
      const bannerUrl = await uploadBanner();

      const payload = {
        ...form,
        capacity: Number(form.capacity),
        status,
        banner: bannerUrl,
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
      {modal && (
        <Modal
          {...modal}
          onClose={() => {
            setModal(null);
            if (modal.type === "success") {
              navigate("/organizer/dashboard");
            }
          }}
        />
      )}

      <div style={styles.card}>
        <h1>Create Event</h1>

        {/* EVENT TYPE TOGGLE */}
        <div style={styles.toggle}>
          <button
            onClick={() => setEventType("PAID")}
            style={{
              ...styles.toggleBtn,
              ...(eventType === "PAID" && styles.active),
            }}
          >
            Paid Event
          </button>
          <button
            onClick={() => setEventType("FREE")}
            style={{
              ...styles.toggleBtn,
              ...(eventType === "FREE" && styles.active),
            }}
          >
            Free Event
          </button>
        </div>

        {/* BANNER */}
        <label style={styles.banner}>
          {preview ? (
            <img src={preview} style={styles.bannerImg} />
          ) : (
            <span>Click to upload event banner</span>
          )}
          <input
            type="file"
            hidden
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
          <input
            name="title"
            placeholder="Event Title"
            onChange={updateField}
          />
          <input
            name="location"
            placeholder="Location"
            onChange={updateField}
          />
          <input type="datetime-local" name="date" onChange={updateField} />
          <input
            name="capacity"
            type="number"
            placeholder="Capacity"
            onChange={updateField}
          />
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
            <input
              placeholder="Ticket name"
              value={t.name}
              onChange={(e) => updateTicket(i, "name", e.target.value)}
            />

            {eventType === "PAID" && (
              <input
                type="number"
                placeholder="Price (₦)"
                value={t.price}
                onChange={(e) => updateTicket(i, "price", e.target.value)}
              />
            )}

            <input
              type="number"
              placeholder="Quantity"
              value={t.quantity}
              onChange={(e) => updateTicket(i, "quantity", e.target.value)}
            />
          </div>
        ))}

        <button style={styles.addBtn} onClick={addTicket}>
          + Add Ticket
        </button>

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

/* ================= MODAL ================= */
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
  page: {
    padding: "clamp(16px,4vw,32px)",
    background: "#0F0618",
    minHeight: "100vh",
    color: "#fff",
  },

  card: {
    maxWidth: 900,
    margin: "auto",
    background: "rgba(255,255,255,0.08)",
    padding: 24,
    borderRadius: 20,
  },
  toggle: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
  },

  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 999,
    border: "1px solid #22F2A6",
    background: "transparent",
    color: "#22F2A6",
    fontWeight: 600,
    cursor: "pointer",
  },

  active: {
    background: "#22F2A6",
    color: "#000",
  },

  banner: {
    height: 220,
    borderRadius: 16,
    background: "rgba(255,255,255,0.05)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    marginBottom: 24,
    overflow: "hidden",
  },

  bannerImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 12,
    marginBottom: 16,
  },

  ticketRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 8,
    marginBottom: 8,
  },

  addBtn: {
    marginTop: 8,
    background: "transparent",
    border: "1px dashed #22F2A6",
    color: "#22F2A6",
    padding: 10,
    borderRadius: 12,
    cursor: "pointer",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },

  publish: {
    background: "#22F2A6",
    border: "none",
    padding: "10px 20px",
    borderRadius: 999,
    fontWeight: 600,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "grid",
    placeItems: "center",
  },

  modal: {
    background: "#1A0F2E",
    padding: 24,
    borderRadius: 16,
    maxWidth: 320,
    width: "100%",
    textAlign: "center",
  },
};
