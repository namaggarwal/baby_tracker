import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../hooks/useEvents';
import { useSettings } from '../hooks/useSettings';
import './LogNappy.css';

export default function LogNappy() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const timeInputRef = useRef(null);
  const [type, setType] = useState('wet'); // 'wet' | 'dirty' | 'mixed'
  const [size, setSize] = useState('M'); // S, M, L
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  });

  const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const types = [
    { id: 'wet', label: 'Wet', icon: 'water_drop', color: '#8fbcd4' },
    { id: 'dirty', label: 'Dirty', icon: 'layers', color: '#c2b280' },
    { id: 'mixed', label: 'Mixed', icon: 'auto_awesome_motion', color: '#9fa8a3' }
  ];

  const sizes = [
    { id: 'S', label: 'Small' },
    { id: 'M', label: 'Medium' },
    { id: 'L', label: 'Large' }
  ];

  const handleSave = async () => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    now.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const eventData = {
      type: 'diaper',
      subtype: type,
      size,
      notes,
      timestamp: now.toISOString(),
    };
    await addEvent(eventData);
    navigate('/');
  };

  return (
    <div className="log-page">
      <header className="log-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#012108' }}>arrow_back</span>
        </button>
        <h2>Log Nappy</h2>
        <div className="avatar-placeholder-small">
          <img src={settings?.profileImage || "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=100&q=80"} alt="Baby" className="avatar-small" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23d8dbd6"/></svg>' }} />
        </div>
      </header>

      <div className="container">
        <h3 className="section-title">Select Type</h3>
        <div className="type-grid">
          {types.map(t => (
            <button 
              key={t.id} 
              className={`type-card ${type === t.id ? 'active' : ''}`}
              onClick={() => setType(t.id)}
            >
              <div className="type-icon-wrapper" style={{ color: type === t.id ? '#fff' : t.color }}>
                <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '32px' }}>
                  {t.icon}
                </span>
              </div>
              <span className="type-label">{t.label}</span>
            </button>
          ))}
        </div>

        <h3 className="section-title mt-24">Select Amount</h3>
        <div className="side-selector">
          {sizes.map(s => (
            <button 
              key={s.id}
              className={`side-btn ${size === s.id ? 'active' : ''}`}
              onClick={() => setSize(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Common details */}
        <div className="time-block glass-card mt-24">
          <div className="time-info">
            <span className="time-label">Time of change</span>
            <span className="time-value">{displayTime}</span>
          </div>
          <div className="time-picker-wrapper" style={{ position: 'relative' }}>
            <button className="change-btn" style={{ pointerEvents: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span> Change
            </button>
            <input 
              type="time" 
              ref={timeInputRef}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                border: 'none'
              }}
            />
          </div>
        </div>

        <div className="notes-block mt-16">
          <span className="notes-label">Notes (Optional)</span>
          <textarea 
            placeholder="e.g. Rash clearing up..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="bottom-action-bar">
        <button className="save-btn" onClick={handleSave}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span> Save Nappy Log
        </button>
      </div>
    </div>
  );
}
