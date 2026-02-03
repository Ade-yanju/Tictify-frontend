import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/authService";

export default function CreateEvent() {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("PAID");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    capacity: "",
    ticketTypes: [{ name: "Regular", price: "", quantity: "" }],
  });

  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  /* ================= HELPERS ================= */
  const updateField = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updateTicket = (index, field, value) => {
    const copy = [...form.ticketTypes];
    copy[index][field] = value;
    setForm({ ...form, ticketTypes: copy });
  };

  const addTicket = () =>
    setForm({
      ...form,
      ticketTypes: [...form.ticketTypes, { name: "", price: "", quantity: "" }],
    });

  const validate = () => {
    if (!banner) return "Event banner is required";
    if (
      !form.title ||
      !form.location ||
      !form.startTime ||
      !form.endTime ||
      !form.capacity
    ) {
      return "All event fields are required";
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      return "Event end time must be after start time";
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
    if (error) return setModal({ type: "error", message: error });

    setLoading(true);

    try {
      const bannerUrl = await uploadBanner();

      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        date: form.startTime,
        endDate: form.endTime,
        banner: bannerUrl,
        status,
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
      if (!res.ok) throw new Error(data.message || "Failed to create event");

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

  return (
    <main style={styles.page}>
      {loading && <LoadingModal />}

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

      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <section style={styles.card}>
        <h1 style={styles.heading}>Create Event</h1>

        {/* EVENT TYPE */}
        <div style={styles.toggle}>
          {["PAID", "FREE"].map((type) => (
            <button
              key={type}
              style={{
                ...styles.toggleBtn,
                ...(eventType === type && styles.toggleActive),
              }}
              onClick={() => setEventType(type)}
            >
              {type} Event
            </button>
          ))}
        </div>

        {/* BANNER */}
        <label style={styles.banner}>
          {preview ? (
            <img
              src={preview}
              alt="Event banner preview"
              style={styles.bannerImg}
            />
          ) : (
            <div style={styles.bannerPlaceholder}>
              <strong>Upload Event Banner</strong>
              <small>Recommended size: 1200 × 675 (16:9)</small>
            </div>
          )}

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBanner(file);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        {/* FORM GRID */}
        <div style={styles.grid}>
          <input
            name="title"
            placeholder="Event title"
            style={styles.input}
            onChange={updateField}
          />
          <input
            name="location"
            placeholder="Location"
            style={styles.input}
            onChange={updateField}
          />
          <input
            type="datetime-local"
            name="startTime"
            style={styles.input}
            onChange={updateField}
          />
          <input
            type="datetime-local"
            name="endTime"
            style={styles.input}
            onChange={updateField}
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            style={styles.input}
            onChange={updateField}
          />
        </div>

        <textarea
          rows={4}
          placeholder="Event description"
          style={styles.textarea}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* TICKETS */}
        <h3 style={styles.subheading}>Tickets</h3>
        {form.ticketTypes.map((t, i) => (
          <div key={i} style={styles.ticketRow}>
            <input
              placeholder="Ticket name"
              style={styles.input}
              value={t.name}
              onChange={(e) => updateTicket(i, "name", e.target.value)}
            />
            {eventType === "PAID" && (
              <input
                type="number"
                placeholder="Price ₦"
                style={styles.input}
                value={t.price}
                onChange={(e) => updateTicket(i, "price", e.target.value)}
              />
            )}
            <input
              type="number"
              placeholder="Quantity"
              style={styles.input}
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
          <button style={styles.secondaryBtn} onClick={() => submit("DRAFT")}>
            Save Draft
          </button>
          <button style={styles.primaryBtn} onClick={() => submit("LIVE")}>
            Publish Event
          </button>
        </div>
      </section>
    </main>
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
        <button style={styles.primaryBtn} onClick={onClose}>
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
    padding: "clamp(16px,4vw,40px)",
    background: "#0F0618",
    color: "#fff",
    fontFamily: "Inter, system-ui",
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#22F2A6",
    marginBottom: 16,
    cursor: "pointer",
  },

  card: {
    maxWidth: 960,
    margin: "0 auto",
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(20px,4vw,32px)",
    borderRadius: 24,
  },

  heading: {
    fontSize: "clamp(22px,4vw,30px)",
    marginBottom: 16,
  },

  toggle: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 999,
    border: "1px solid #22F2A6",
    background: "transparent",
    color: "#22F2A6",
    cursor: "pointer",
  },

  toggleActive: {
    background: "#22F2A6",
    color: "#000",
  },

  /* 🔥 PERFECT BANNER */
  banner: {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: 20,
    background: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    marginBottom: 24,
    cursor: "pointer",
    position: "relative",
    display: "grid",
    placeItems: "center",
  },

  bannerImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  bannerPlaceholder: {
    textAlign: "center",
    color: "#CFC9D6",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 12,
  },

  input: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
  },

  textarea: {
    marginTop: 12,
    width: "100%",
    padding: 16,
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff",
  },

  subheading: {
    marginTop: 24,
    marginBottom: 12,
  },

  ticketRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: 10,
    marginBottom: 10,
  },

  addBtn: {
    marginTop: 8,
    background: "transparent",
    border: "1px dashed #22F2A6",
    color: "#22F2A6",
    padding: 12,
    borderRadius: 12,
    cursor: "pointer",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 28,
    flexWrap: "wrap",
  },

  primaryBtn: {
    background: "#22F2A6",
    border: "none",
    padding: "12px 22px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryBtn: {
    background: "transparent",
    border: "1px solid #22F2A6",
    color: "#22F2A6",
    padding: "12px 22px",
    borderRadius: 999,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "grid",
    placeItems: "center",
    zIndex: 3000,
  },

  modal: {
    background: "#1A0F2E",
    padding: 28,
    borderRadius: 20,
    maxWidth: 360,
    width: "90%",
    textAlign: "center",
  },

  loadingModal: {
    background: "#1A0F2E",
    padding: 28,
    borderRadius: 20,
  },
};
