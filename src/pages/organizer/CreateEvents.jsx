import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateEvents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Concert',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venue: '',
    venueAddress: '',
    capacity: 100,
    ticketPrice: 5000,
    image: null,
    imagePreview: null,
    recurrence: 'none',
    ticketTypes: [{ name: 'General Admission', quantity: 100, price: 5000 }],
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Event title is required';
    if (!formData.description) newErrors.description = 'Event description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.venue) newErrors.venue = 'Venue name is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (!formData.ticketPrice || formData.ticketPrice < 1) newErrors.ticketPrice = 'Ticket price must be at least ₦1';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('startDate', `${formData.startDate}T${formData.startTime}`);
      if (formData.endDate) {
        formDataToSend.append('endDate', `${formData.endDate}T${formData.endTime}`);
      }
      formDataToSend.append('venue', JSON.stringify({
        name: formData.venue,
        address: formData.venueAddress,
      }));
      formDataToSend.append('capacity', formData.capacity);
      formDataToSend.append('ticketPrice', formData.ticketPrice);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      formDataToSend.append('recurrence', formData.recurrence);

      const response = await fetch('/api/v1/organizer/events', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/organizer/my-events/${data.event._id}`);
      } else {
        alert('Event creation failed: ' + data.message);
      }
    } catch (error) {
      console.error('Event creation error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="organizer-container">
      <div className="form-header">
        <h1>Create New Event</h1>
        <p>Fill in the details to create and publish your event</p>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        {/* Basic Info */}
        <fieldset className="form-section">
          <legend>Event Information</legend>

          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Annual Music Festival 2024"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event..."
              rows="5"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option>Concert</option>
                <option>Comedy</option>
                <option>Conference</option>
                <option>Workshop</option>
                <option>Sports</option>
                <option>Festival</option>
              </select>
            </div>

            <div className="form-group">
              <label>Event Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {formData.imagePreview && (
                <img src={formData.imagePreview} alt="Preview" className="image-preview" />
              )}
            </div>
          </div>
        </fieldset>

        {/* Date & Time */}
        <fieldset className="form-section">
          <legend>Date & Time</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={errors.startDate ? 'error' : ''}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={errors.startTime ? 'error' : ''}
              />
              {errors.startTime && <span className="error-text">{errors.startTime}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>End Date (Optional)</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>End Time (Optional)</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        {/* Venue */}
        <fieldset className="form-section">
          <legend>Venue Information</legend>

          <div className="form-group">
            <label>Venue Name</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              placeholder="e.g., Convention Center"
              className={errors.venue ? 'error' : ''}
            />
            {errors.venue && <span className="error-text">{errors.venue}</span>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleInputChange}
              placeholder="Full venue address"
            />
          </div>
        </fieldset>

        {/* Tickets */}
        <fieldset className="form-section">
          <legend>Ticket Information</legend>

          <div className="form-row">
            <div className="form-group">
              <label>Total Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                className={errors.capacity ? 'error' : ''}
              />
              {errors.capacity && <span className="error-text">{errors.capacity}</span>}
            </div>

            <div className="form-group">
              <label>Ticket Price (₦)</label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleInputChange}
                min="1"
                step="100"
                className={errors.ticketPrice ? 'error' : ''}
              />
              {errors.ticketPrice && <span className="error-text">{errors.ticketPrice}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Recurrence</label>
            <select name="recurrence" value={formData.recurrence} onChange={handleInputChange}>
              <option value="none">One-time event</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </fieldset>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button
            type="submit"
            className={`btn-submit ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvents;
