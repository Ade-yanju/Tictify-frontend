import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import OrganizerChrome from "../../components/OrganizerChrome";
import TictifyLoader from "../../components/TictifyLoader";
import { getToken, getUser, updateProfile } from "../../services/authService";
import { formatWhatsApp } from "../../utils/phone";

function injectStyles(id, content) {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = content;
    document.head.appendChild(style);
  }
}

function initials(name = "Organizer") {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function OrganizerProfile() {
  injectStyles("tictify-organizer-profile-css", CSS);
  const navigate = useNavigate();
  const storedUser = useMemo(() => getUser() || {}, []);
  const [name, setName] = useState(storedUser.name || "");
  const [avatar, setAvatar] = useState(storedUser.avatar || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(storedUser.avatar || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Your profile picture must be 5MB or smaller.");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.url) throw new Error(body.message || "Profile picture upload failed");
    return body.url;
  };

  const save = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError("Enter a name with at least 2 characters.");
      return;
    }
    setSaving(true);
    try {
      const uploadedAvatar = selectedFile ? await uploadAvatar(selectedFile) : avatar || null;
      const result = await updateProfile({ name: cleanName, avatar: uploadedAvatar });
      const nextUser = result.user || { ...storedUser, name: cleanName, avatar: uploadedAvatar };
      setName(nextUser.name || cleanName);
      setAvatar(nextUser.avatar || "");
      setPreview(nextUser.avatar || "");
      setSelectedFile(null);
      setMessage("Your organizer profile has been updated.");
    } catch (err) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const removeAvatar = () => {
    setSelectedFile(null);
    setAvatar("");
    setPreview("");
  };

  return (
    <OrganizerChrome
      active="/organizer/profile"
      title="Profile settings"
      subtitle="Keep the name and profile picture guests see when they discover your events."
    >
      <div className="org-profile-page">
        <form className="org-profile-card" onSubmit={save}>
          <div className="org-profile-card-head">
            <div>
              <p className="org-profile-eyebrow">Public organizer identity</p>
              <h2>How guests see you</h2>
              <p>We’ll show this attribution on your public event cards and event pages.</p>
            </div>
            <div className="org-profile-preview" aria-label="Profile picture preview">
              {preview ? <img src={preview} alt="Profile preview" /> : <span>{initials(name)}</span>}
            </div>
          </div>

          <div className="org-profile-fields">
            <label className="org-profile-field">
              <span>Organizer name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoComplete="name" />
              <small>This is used in “Hosted by …” on your events.</small>
            </label>

            <div className="org-profile-field">
              <span>Phone number</span>
              <div className="org-profile-readonly">
                <Icon name="lock" size={15} />
                <input value={formatWhatsApp(storedUser.whatsapp) || "Not linked"} readOnly aria-readonly="true" />
                <b>Locked</b>
              </div>
              <small>Your WhatsApp number is protected because it links your organizer account to Tictify services.</small>
            </div>
          </div>

          <div className="org-profile-upload">
            <div>
              <span className="org-profile-label">Profile picture</span>
              <p>Use a clear square image. JPG, PNG, or WebP up to 5MB.</p>
            </div>
            <div className="org-profile-upload-actions">
              <label className="org-profile-upload-btn">
                <Icon name="image" size={16} />
                Choose image
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} />
              </label>
              {preview && <button type="button" className="org-profile-remove" onClick={removeAvatar}>Remove</button>}
            </div>
          </div>

          {(message || error) && <p className={`org-profile-feedback ${error ? "is-error" : "is-success"}`} role="status">{error || message}</p>}

          <div className="org-profile-actions">
            <button type="button" className="org-profile-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="org-profile-primary" disabled={saving}>
              {saving ? <><TictifyLoader inline label="Saving" /></> : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </OrganizerChrome>
  );
}

const CSS = `
.org-profile-page { width: min(100%, 900px); margin: 0 auto; }
.org-profile-card { overflow: hidden; border: 1px solid #e6dff0; border-radius: 22px; background: #fff; box-shadow: 0 18px 50px rgba(64, 30, 94, .06); }
.org-profile-card-head { display: flex; align-items: center; justify-content: space-between; gap: 28px; padding: clamp(22px, 4vw, 34px); background: linear-gradient(135deg, #fff 0%, #fbf8ff 100%); border-bottom: 1px solid #eee7f4; }
.org-profile-eyebrow, .org-profile-label { display: block; margin: 0 0 8px; color: #7418ed; font-size: 10px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
.org-profile-card h2 { margin: 0; color: #33203f; font: 800 clamp(22px, 3vw, 30px)/1.1 var(--font-h); letter-spacing: -.04em; }
.org-profile-card-head p:not(.org-profile-eyebrow) { max-width: 530px; margin: 10px 0 0; color: #8c8099; font-size: 13px; line-height: 1.6; }
.org-profile-preview { display: grid; width: 86px; height: 86px; flex: 0 0 86px; place-items: center; overflow: hidden; border: 5px solid #f0e6ff; border-radius: 50%; background: #eadbff; color: #7418ed; font-size: 24px; font-weight: 900; }
.org-profile-preview img { width: 100%; height: 100%; object-fit: cover; }
.org-profile-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; padding: 28px 34px 0; }
.org-profile-field > span { display: block; margin-bottom: 8px; color: #4f3f5d; font-size: 12px; font-weight: 800; }
.org-profile-field input { width: 100%; min-height: 44px; padding: 0 13px; border: 1px solid #ded4e8; border-radius: 10px; background: #fff; color: #33263f; font: 600 13px var(--font-b); outline: none; transition: border-color .2s, box-shadow .2s; }
.org-profile-field input:focus { border-color: #9b55e9; box-shadow: 0 0 0 3px rgba(116, 24, 237, .12); }
.org-profile-field small { display: block; margin-top: 7px; color: #9b8eaa; font-size: 11px; line-height: 1.45; }
.org-profile-readonly { position: relative; display: flex; align-items: center; gap: 8px; }
.org-profile-readonly svg { position: absolute; left: 13px; color: #9b8eaa; pointer-events: none; }
.org-profile-readonly input { padding-left: 37px; padding-right: 62px; color: #8c8099; background: #faf9fc; }
.org-profile-readonly b { position: absolute; right: 11px; color: #9b8eaa; font-size: 9px; letter-spacing: .07em; text-transform: uppercase; }
.org-profile-upload { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin: 28px 34px 0; padding: 17px 18px; border: 1px dashed #d8c8e8; border-radius: 14px; background: #fcfaff; }
.org-profile-upload p { margin: 0; color: #8c8099; font-size: 11px; }
.org-profile-upload-actions { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; }
.org-profile-upload-btn, .org-profile-remove { display: inline-flex; align-items: center; gap: 7px; min-height: 38px; padding: 0 13px; border: 1px solid #d9cae8; border-radius: 9px; background: #fff; color: #5f4472; font-size: 11px; font-weight: 800; cursor: pointer; }
.org-profile-upload-btn:hover, .org-profile-remove:hover { border-color: #9b55e9; color: #7418ed; }
.org-profile-upload-btn input { display: none; }
.org-profile-remove { border-color: #f1cbd4; color: #b3455d; background: #fff8f9; }
.org-profile-feedback { margin: 18px 34px 0; padding: 11px 13px; border-radius: 9px; font-size: 12px; }
.org-profile-feedback.is-success { color: #207d57; background: #f1fcf6; border: 1px solid #c1ead3; }
.org-profile-feedback.is-error { color: #b3455d; background: #fff7f8; border: 1px solid #f0cbd4; }
.org-profile-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 24px 34px 30px; }
.org-profile-actions button { min-height: 42px; padding: 0 18px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; }
.org-profile-secondary { border: 1px solid #ded4e8; background: #fff; color: #6b5a77; }
.org-profile-primary { border: 1px solid #7418ed; background: #7418ed; color: #fff; box-shadow: 0 10px 22px rgba(116, 24, 237, .2); }
.org-profile-primary:disabled { cursor: wait; opacity: .65; }
.org-profile-primary .tictify-loader { display: inline-flex; transform: scale(.58); transform-origin: left center; margin-right: -10px; }
@media (max-width: 680px) {
  .org-profile-card-head { align-items: flex-start; }
  .org-profile-fields { grid-template-columns: 1fr; padding: 22px 20px 0; }
  .org-profile-card-head, .org-profile-upload, .org-profile-actions { padding-left: 20px; padding-right: 20px; }
  .org-profile-upload { align-items: flex-start; flex-direction: column; margin-left: 20px; margin-right: 20px; }
  .org-profile-feedback { margin-left: 20px; margin-right: 20px; }
}
@media (max-width: 430px) {
  .org-profile-card-head { gap: 14px; }
  .org-profile-preview { width: 64px; height: 64px; flex-basis: 64px; font-size: 18px; }
  .org-profile-upload-actions { flex-wrap: wrap; }
}
`;
