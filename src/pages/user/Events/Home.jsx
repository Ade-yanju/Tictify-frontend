import React, { useState, useEffect } from 'react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('upcoming');

  const categories = ['Concert', 'Comedy', 'Conference', 'Workshop', 'Sports', 'Festival'];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchQuery, selectedCategory, sortBy]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/v1/events', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    if (sortBy === 'upcoming') {
      filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.ticketPrice - b.ticketPrice);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.ticketPrice - a.ticketPrice);
    }

    setFilteredEvents(filtered);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      padding: '3rem 2rem',
      textAlign: 'center',
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      margin: '0 0 0.5rem 0',
    },
    headerSubtitle: {
      fontSize: '1.125rem',
      opacity: 0.9,
      margin: 0,
    },
    searchSection: {
      padding: '2rem',
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
    },
    searchContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      maxWidth: '600px',
    },
    searchInput: {
      flex: 1,
      padding: '0.75rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s',
    },
    searchBtn: {
      padding: '0.75rem 1.5rem',
      background: '#667eea',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.25rem',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    filters: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
    },
    filterSelect: {
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '0.95rem',
      cursor: 'pointer',
      background: '#fff',
      transition: 'all 0.3s',
    },
    eventsSection: {
      padding: '3rem 2rem',
    },
    eventsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '2rem',
    },
    eventCard: {
      background: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    eventCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)',
    },
    eventImage: {
      position: 'relative',
      width: '100%',
      height: '200px',
      background: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    eventImageImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s',
    },
    placeholderImage: {
      fontSize: '3rem',
    },
    eventCategory: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(102, 126, 234, 0.9)',
      color: '#fff',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    eventInfo: {
      padding: '1rem',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    eventTitle: {
      fontSize: '1.125rem',
      fontWeight: '700',
      margin: '0 0 0.5rem 0',
      color: '#1f2937',
    },
    eventVenue: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0 0 0.75rem 0',
    },
    eventMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.875rem',
      marginBottom: '0.75rem',
      flex: 1,
    },
    eventDate: {
      color: '#6b7280',
    },
    eventPrice: {
      fontWeight: '700',
      color: '#667eea',
    },
    eventCapacity: {
      fontSize: '0.8rem',
      color: '#9ca3af',
      marginBottom: '0.75rem',
    },
    btnDetails: {
      padding: '0.75rem 1rem',
      background: '#667eea',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    noEvents: {
      textAlign: 'center',
      padding: '3rem',
      background: '#fff',
      borderRadius: '12px',
    },
    loader: {
      textAlign: 'center',
      padding: '3rem',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>Loading events...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        button:hover { opacity: 0.9; }
        @media (max-width: 768px) {
          .events-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
          .search-container { flex-direction: column; }
        }
        @media (max-width: 480px) {
          .events-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Discover Amazing Events</h1>
        <p style={styles.headerSubtitle}>Find and book tickets to the best events near you</p>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search events, venues, organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button style={styles.searchBtn}>🔍</button>
        </div>

        <div style={styles.filters} className="search-container">
          <select
            style={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            style={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="upcoming">Upcoming First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div style={styles.eventsSection}>
        {filteredEvents.length === 0 ? (
          <div style={styles.noEvents}>
            <p>No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div style={styles.eventsGrid} className="events-grid">
            {filteredEvents.map(event => (
              <div
                key={event._id}
                style={styles.eventCard}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.eventCardHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: styles.eventCard.boxShadow })}
                onClick={() => window.location.href = `/event/${event._id}`}
              >
                <div style={styles.eventImage}>
                  {event.image ? (
                    <img src={event.image} alt={event.title} style={styles.eventImageImg} />
                  ) : (
                    <div style={styles.placeholderImage}>📅</div>
                  )}
                  <span style={styles.eventCategory}>{event.category}</span>
                </div>
                <div style={styles.eventInfo}>
                  <h3 style={styles.eventTitle}>{event.title}</h3>
                  <p style={styles.eventVenue}>{event.venue?.name || 'TBA'}</p>
                  <div style={styles.eventMeta}>
                    <span style={styles.eventDate}>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                    <span style={styles.eventPrice}>₦{event.ticketPrice?.toLocaleString()}</span>
                  </div>
                  <div style={styles.eventCapacity}>
                    {event.capacity - (event.ticketsSold || 0)} tickets left
                  </div>
                  <button style={styles.btnDetails} onClick={() => window.location.href = `/event/${event._id}`}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
