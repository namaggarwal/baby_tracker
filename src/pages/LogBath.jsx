import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../hooks/useEvents';
import { useSettings } from '../hooks/useSettings';
import { formatTime } from '../utils/timeFormat';
import './LogFeed.css'; // Shared layout
import './LogBath.css';
import { useToast } from '../context/ToastContext';

export default function LogBath() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const timeInputRef = useRef(null);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  });

  const quickTags = ['Warm water', 'Oil applied', 'Lotion applied', 'Hair washed', 'No soap'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    now.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const finalNotes = selectedTags.length > 0 
      ? `${selectedTags.join(', ')}. ${notes}`.trim()
      : notes;

    await addEvent({
      type: 'bath',
      notes: finalNotes,
      timestamp: now.toISOString(),
    });
    showToast('Bath time logged!');
    navigate('/');
  };

  const displayTime = formatTime(new Date(`2000-01-01T${time}`), settings?.timeFormat);

  return (
    <div className="log-page">
      <header className="log-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2>Log Bath</h2>
        <div className="avatar-placeholder-small">
          <img src={settings?.profileImage || "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=100&q=80"} alt="Baby" className="avatar-small" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23d8dbd6"/></svg>' }} />
        </div>
      </header>

      <div className="container">
        <div className="log-bath-hero">
          <div className="hero-icon-circle">
            <span className="material-symbols-outlined" style={{ fontSize: '80px' }}>bathtub</span>
          </div>
          <div className="hero-text">
            <h1>Fresh & Clean</h1>
            <p>Log baby's bath time routine</p>
          </div>
        </div>

        <div className="time-block glass-card mt-24">
          <div className="time-info">
            <span className="time-label">Bath Time</span>
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

        <div className="notes-block mt-24">
          <span className="notes-label">Notes (Optional)</span>
          <textarea 
            placeholder="e.g. Baby enjoyed the bubbles..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-8"
          ></textarea>
        </div>

        <div className="quick-tags-section mt-16">
          <span className="notes-label">Quick Notes</span>
          <div className="quick-tags">
            {quickTags.map(tag => (
              <button 
                key={tag}
                className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-action-bar">
        <button className="save-btn bath-save" onClick={handleSave}>
          <span className="material-symbols-outlined">check_circle</span>
          Save Bath Log
        </button>
      </div>
    </div>
  );
}
