import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import {
  Plus, Filter, Search, ChevronDown, Copy, Trash2, Edit2, Eye, Archive, MoreVertical,
  Calendar, Users, DollarSign, TrendingUp, Clock
} from 'lucide-react';
import Button from '../components/Button/Button';
import Loader from '../components/Loader/Loader';

export default function EventManager() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchEvents();
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.request('/organizer/events');
      setEvents(response.data?.events || getMockEvents());
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents(getMockEvents());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockEvents = () => [
    {
      id: 1,
      title: 'Afrobeats Summer Festival',
      date: '2026-08-15',
      status: 'active',
      ticketsSold: 1200,
      capacity: 2000,
      revenue: 240000,
      attendees: 1200,
      image: '🎵',
    },
    {
      id: 2,
      title: 'Jazz Night Live',
      date: '2026-08-20',
      status: 'active',
      ticketsSold: 450,
      capacity: 800,
      revenue: 45000,
      attendees: 450,
      image: '🎷',
    },
    {
      id: 3,
      title: 'Tech Conference 2026',
      date: '2026-09-10',
      status: 'draft',
      ticketsSold: 0,
      capacity: 500,
      revenue: 0,
      attendees: 0,
      image: '💻',
    },
    {
      id: 4,
      title: 'Comedy Night Extravaganza',
      date: '2026-07-20',
      status: 'archived',
      ticketsSold: 350,
      capacity: 400,
      revenue: 35000,
      attendees: 350,
      image: '😂',
    },
  ];

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'revenue':
          return b.revenue - a.revenue;
        case 'tickets':
          return b.ticketsSold - a.ticketsSold;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const toggleEventSelection = (eventId) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map(e => e.id)));
    }
  };

  const handleBulkArchive = async () => {
    try {
      await apiClient.request('/organizer/events/bulk-archive', {
        method: 'POST',
        body: JSON.stringify({ eventIds: Array.from(selectedEvents) }),
      });
      fetchEvents();
      setSelectedEvents(new Set());
    } catch (err) {
      console.error('Bulk archive failed:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete these events?')) return;
    try {
      await apiClient.request('/organizer/events/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ eventIds: Array.from(selectedEvents) }),
      });
      fetchEvents();
      setSelectedEvents(new Set());
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  const handleDuplicate = async (eventId) => {
    try {
      await apiClient.request(`/organizer/events/${eventId}/duplicate`, {
        method: 'POST',
      });
      fetchEvents();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: '#6BF0A0', text: 'Active' },
      draft: { bg: '#5B94FF', text: 'Draft' },
      archived: { bg: '#888', text: 'Archived' },
    };
    return badges[status] || badges.draft;
  };

  if (isLoading) {
    return (
      <div className="event-manager-loading">
        <Loader text="Loading events..." />
      </div>
    );
  }

  return (
    <div className="event-manager">
      {/* Header */}
      <header className="event-manager__header">
        <div className="header-content">
          <h1>Event Manager</h1>
          <p>Create, manage, and analyze your events</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/organizer/create-event')}
        >
          <Plus size={20} />
          Create Event
        </Button>
      </header>

      {/* Filters & Search */}
      <div className="event-manager__filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Date</option>
              <option value="revenue">Revenue</option>
              <option value="tickets">Tickets Sold</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="filter-info">
          Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEvents.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedEvents.size} selected</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBulkArchive}
          >
            <Archive size={16} />
            Archive
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 size={16} />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedEvents(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Events Table */}
      <div className="events-table-container">
        <div className="events-table">
          {/* Table Header */}
          <div className="table-header">
            <div className="table-cell checkbox">
              <input
                type="checkbox"
                checked={selectedEvents.size === filteredEvents.length && filteredEvents.length > 0}
                onChange={toggleAllSelection}
              />
            </div>
            <div className="table-cell title">Event</div>
            <div className="table-cell date">Date</div>
            <div className="table-cell status">Status</div>
            <div className="table-cell metric">Tickets</div>
            <div className="table-cell metric">Revenue</div>
            <div className="table-cell actions">Actions</div>
          </div>

          {/* Table Body */}
          {filteredEvents.map((event) => (
            <div key={event.id} className="table-row">
              <div className="table-cell checkbox">
                <input
                  type="checkbox"
                  checked={selectedEvents.has(event.id)}
                  onChange={() => toggleEventSelection(event.id)}
                />
              </div>
              <div className="table-cell title">
                <div className="event-title">
                  <span className="event-icon">{event.image}</span>
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.ticketsSold} / {event.capacity} tickets</p>
                  </div>
                </div>
              </div>
              <div className="table-cell date">
                <Clock size={16} />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="table-cell status">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusBadge(event.status).bg }}
                >
                  {getStatusBadge(event.status).text}
                </span>
              </div>
              <div className="table-cell metric">
                <div className="metric-value">
                  <Users size={16} />
                  <span>{event.ticketsSold}</span>
                </div>
              </div>
              <div className="table-cell metric">
                <div className="metric-value revenue">
                  <DollarSign size={16} />
                  <span>₦{(event.revenue / 1000).toFixed(0)}K</span>
                </div>
              </div>
              <div className="table-cell actions">
                <div className="action-buttons">
                  <button
                    className="action-btn"
                    onClick={() => navigate(`/events/${event.id}`)}
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleDuplicate(event.id)}
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </button>
                  <div className="dropdown">
                    <button className="action-btn">
                      <MoreVertical size={16} />
                    </button>
                    <div className="dropdown-menu">
                      <a href="#" onClick={() => handleBulkArchive()}>Archive</a>
                      <a href="#" onClick={() => handleBulkDelete()}>Delete</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="table-empty">
              <div className="empty-icon">📭</div>
              <h3>No events found</h3>
              <p>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first event to get started'}
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/organizer/create-event')}
              >
                Create Event
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="events-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h4>Total Events</h4>
            <p className="stat-value">{events.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h4>Total Attendees</h4>
            <p className="stat-value">{events.reduce((sum, e) => sum + e.attendees, 0)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h4>Total Revenue</h4>
            <p className="stat-value">₦{(events.reduce((sum, e) => sum + e.revenue, 0) / 1000).toFixed(0)}K</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h4>Avg. Occupancy</h4>
            <p className="stat-value">
              {events.length > 0
                ? ((events.reduce((sum, e) => sum + (e.ticketsSold / e.capacity), 0) / events.length) * 100).toFixed(0)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
