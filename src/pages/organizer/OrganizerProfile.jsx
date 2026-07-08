import React, { useState, useEffect } from 'react';

const OrganizerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    bankAccount: {
      accountName: '',
      accountNumber: '',
      bankName: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/v1/organizer/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setProfile(data.profile);
      setFormData(data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('bankAccount.')) {
      const field = name.replace('bankAccount.', '');
      setFormData(prev => ({
        ...prev,
        bankAccount: { ...prev.bankAccount, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/organizer/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Organizer Profile</h1>
        {!editing && (
          <button className="btn-edit" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <fieldset>
            <legend>Organization Details</legend>

            <div className="form-group">
              <label>Company/Organization Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Bank Account (For Payouts)</legend>

            <div className="form-group">
              <label>Account Name</label>
              <input
                type="text"
                name="bankAccount.accountName"
                value={formData.bankAccount.accountName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="bankAccount.accountNumber"
                  value={formData.bankAccount.accountNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bankAccount.bankName"
                  value={formData.bankAccount.bankName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-view">
          <div className="profile-section">
            <h2>Organization Details</h2>
            <div className="profile-item">
              <span className="label">Company Name:</span>
              <span className="value">{profile?.companyName}</span>
            </div>
            <div className="profile-item">
              <span className="label">Description:</span>
              <span className="value">{profile?.description || 'Not provided'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Email:</span>
              <span className="value">{profile?.email}</span>
            </div>
            <div className="profile-item">
              <span className="label">Phone:</span>
              <span className="value">{profile?.phone || 'Not provided'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Website:</span>
              <span className="value">
                {profile?.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                ) : (
                  'Not provided'
                )}
              </span>
            </div>
          </div>

          <div className="profile-section">
            <h2>Bank Account</h2>
            <div className="profile-item">
              <span className="label">Account Name:</span>
              <span className="value">{profile?.bankAccount?.accountName || 'Not set'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Account Number:</span>
              <span className="value">{profile?.bankAccount?.accountNumber || 'Not set'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Bank Name:</span>
              <span className="value">{profile?.bankAccount?.bankName || 'Not set'}</span>
            </div>
          </div>

          {profile?.kycStatus && (
            <div className="profile-section">
              <h2>KYC Verification</h2>
              <div className="profile-item">
                <span className="label">Status:</span>
                <span className={`status ${profile.kycStatus.toLowerCase()}`}>
                  {profile.kycStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizerProfile;
