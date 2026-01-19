import { useState } from "react";
import { getToken } from "../../services/authService";

export default function CreateEvent() {
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

  /* ================= IMGBB UPLOAD ================= */
  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      "https://api.imgbb.com/1/upload?key=58f658e4c17232715cf88c43a4875cbb",
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error("Image upload failed");
    }

    return data.data.url;
  };

  /* ================= FORM HELPERS ================= */
  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateTicket = (index, field, value) => {
    const updated = [...form.ticketTypes];
    updated[index][field] = value;
    setForm({ ...form, ticketTypes: updated });
  };

  const addTicket = () => {
    setForm({
      ...form,
      ticketTypes: [...form.ticketTypes, { name: "", price: "", quantity: "" }],
    });
  };

  /* ================= SUBMIT ================= */
  const submit = async (status) => {
    if (!banner) {
      return setModal({
        type: "error",
        message: "Event banner is required",
      });
    }

    setLoading(true);

    try {
      // 1️⃣ Upload image to ImgBB
      const bannerUrl = await uploadToImgBB(banner);

      // 2️⃣ Send JSON to backend
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
          status,
          banner: bannerUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create event");
      }

      setModal({
        type: "success",
        message:
          status === "LIVE"
            ? "Event published successfully 🎉"
            : "Event saved as draft",
      });
    } catch (err) {
      setModal({
        type: "error",
        message: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
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
              window.location.href = "/organizer/dashboard";
            }
          }}
        />
      )}

      <div style={styles.card}>
        <h1>Create Event</h1>

        {/* Banner */}
        <label style={styles.banner}>
          {preview ? (
            <img src={preview} alt="preview" />
          ) : (
            "Click to upload banner"
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setBanner(file);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        <div style={styles.grid}>
          <input name="title" placeholder="Title" onChange={updateField} />
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
          placeholder="Description"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <h3>Ticket Types</h3>
        {form.ticketTypes.map((t, i) => (
          <div key={i} style={styles.ticketRow}>
            <input
              value={t.name}
              onChange={(e) => updateTicket(i, "name", e.target.value)}
            />
            <input
              value={t.price}
              type="number"
              onChange={(e) => updateTicket(i, "price", e.target.value)}
            />
            <input
              value={t.quantity}
              type="number"
              onChange={(e) => updateTicket(i, "quantity", e.target.value)}
            />
          </div>
        ))}

        <button onClick={addTicket}>+ Add Ticket</button>

        <div style={styles.actions}>
          <button onClick={() => submit("DRAFT")}>Save Draft</button>
          <button onClick={() => submit("LIVE")}>Publish</button>
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
        <h3>{type}</h3>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    padding: 24,
    background: "#0F0618",
    minHeight: "100vh",
    color: "#fff",
  },
  card: { maxWidth: 900, margin: "auto", padding: 24, borderRadius: 16 },
  banner: {
    height: 200,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  ticketRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  actions: { display: "flex", gap: 12, justifyContent: "flex-end" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "grid",
    placeItems: "center",
  },
  modal: { background: "#1A0F2E", padding: 24, borderRadius: 12 },
};
