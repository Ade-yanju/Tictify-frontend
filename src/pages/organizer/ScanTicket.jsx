import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ScanTicket = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [scannedCount, setScannedCount] = useState(0);

  useEffect(() => {
    fetchStats();
    if (scanning) {
      startCamera();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/organizer/scanner/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();

      if (data.success) {
        const eventStats = data.stats.find(s => s.eventId === eventId);
        if (eventStats) {
          setStats(eventStats);
          setScannedCount(eventStats.scannedTickets);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Unable to access camera. Using manual entry only.');
      setScanning(false);
    }
  };

  const handleScan = async (code) => {
    if (lastScanned === code) return;
    setLastScanned(code);

    try {
      const response = await fetch('/api/v1/organizer/tickets/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketCode: code, eventId }),
      });

      const data = await response.json();
      if (data.success) {
        setTicketData({ ...data.ticket, status: 'valid' });
        setScannedCount(prev => prev + 1);
        // Play success sound
        playSuccessSound();
        setTimeout(() => {
          setTicketData(null);
          setLastScanned(null);
        }, 3000);
      } else {
        setTicketData({ status: 'invalid', message: data.message });
        playErrorSound();
        setTimeout(() => {
          setTicketData(null);
          setLastScanned(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setTicketData({ status: 'error', message: 'Verification failed' });
      setTimeout(() => setTicketData(null), 3000);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode);
      setManualCode('');
    }
  };

  const playSuccessSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playErrorSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 300;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        <h1>🎟️ Ticket Scanner</h1>
        <button
          className="btn-toggle"
          onClick={() => setScanning(!scanning)}
        >
          {scanning ? '⏹️ Stop Camera' : '🎥 Start Camera'}
        </button>
      </div>

      {scanning && (
        <div className="scanner-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="scanner-video"
          />
          <div className="scanner-overlay">
            <div className="scanner-box"></div>
            <p className="scanner-hint">Position QR code in the box</p>
          </div>
        </div>
      )}

      <div className="scanner-form">
        <h2>Manual Entry</h2>
        <p className="form-hint">Scan QR code or enter verification code</p>
        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Scan QR code or type verification code..."
            autoFocus
          />
          <button type="submit">✓ Verify Ticket</button>
        </form>
      </div>

      {ticketData && (
        <div className={`ticket-result ${ticketData.status}`}>
          <div className={`result-icon ${ticketData.status}`}>
            {ticketData.status === 'valid' ? '✅' : '❌'}
          </div>
          <h3>{ticketData.status === 'valid' ? 'Ticket Valid ✓' : 'Ticket Invalid ✗'}</h3>
          {ticketData.status === 'valid' ? (
            <div className="ticket-info">
              <p className="buyer-name"><strong>{ticketData.buyerName}</strong></p>
              <p className="ticket-number">Ticket #{ticketData.ticketNumber}</p>
              <p className="ticket-qty">{ticketData.quantity} ticket{ticketData.quantity > 1 ? 's' : ''}</p>
              <p className="scanned-time">Scanned: {new Date(ticketData.scannedAt).toLocaleTimeString()}</p>
            </div>
          ) : (
            <p className="error-message">{ticketData.message}</p>
          )}
        </div>
      )}

      <div className="scanner-stats">
        {loadingStats ? (
          <p>Loading stats...</p>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">{stats.totalTickets}</div>
              <div className="stat-label">Total Tickets</div>
            </div>
            <div className="stat-box highlight">
              <div className="stat-number">{scannedCount}</div>
              <div className="stat-label">Scanned ✓</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{stats.remainingTickets}</div>
              <div className="stat-label">Remaining</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{stats.scanRate}%</div>
              <div className="stat-label">Scan Rate</div>
            </div>
          </div>
        ) : (
          <p>No stats available</p>
        )}
      </div>

      <div className="scanner-footer">
        <button
          className="btn-history"
          onClick={() => navigate(`/organizer/events/${eventId}/scan-history`)}
        >
          📋 View Scan History
        </button>
      </div>
    </div>
  );
};

export default ScanTicket;
