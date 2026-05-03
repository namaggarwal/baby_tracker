import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent, useEvents } from '../hooks/useEvents';
import { useSettings } from '../hooks/useSettings';
import { formatTime } from '../utils/timeFormat';
import { useToast } from '../context/ToastContext';
import './LogFeed.css';

export default function LogFeed() {
  const navigate = useNavigate();
  const events = useEvents();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const lastFeed = events?.find(e => e.type === 'feed');
  const lastQuantity = lastFeed?.quantity_ml ? `${lastFeed.quantity_ml}ml` : '--ml';
  const timeInputRef = useRef(null);
  const [type, setType] = useState('breast'); // 'breast' | 'formula'
  const [size, setSize] = useState('M'); // S, M, L, XL
  const [quantity, setQuantity] = useState(120);
  const [side, setSide] = useState('left'); // 'left' | 'right'
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  });

  const displayTime = formatTime(new Date(`2000-01-01T${time}`), settings?.timeFormat);

  const sizes = [
    { id: 'S', ml: 30 },
    { id: 'M', ml: 60 },
    { id: 'L', ml: 90 },
    { id: 'XL', ml: 120 },
  ];

  const quantities = [60, 120, 180, 240];

  const handleSave = async () => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    now.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const eventData = {
      type: 'feed',
      subtype: type,
      size: type === 'breast' ? size : null,
      quantity_ml: type === 'breast' ? sizes.find(s => s.id === size).ml : quantity,
      side: type === 'breast' ? side : null,
      notes,
      timestamp: now.getTime(),
    };
    await addEvent(eventData);
    showToast('Feeding session logged!');
    navigate('/');
  };

  return (
    <div className="log-page">
      <header className="log-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#012108' }}>arrow_back</span>
        </button>
        <h2>{type === 'breast' ? 'Log Feeding' : 'Log Feed'}</h2>
        <div className="avatar-placeholder-small">
          <img src={settings?.profileImage || "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=100&q=80"} alt="Baby" className="avatar-small" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23d8dbd6"/></svg>' }} />
        </div>
      </header>

      <div className="container">
        {/* Toggle */}
        <div className="segment-control">
          <button 
            className={`segment-btn ${type === 'breast' ? 'active' : ''}`}
            onClick={() => setType('breast')}
          >
            Breast
          </button>
          <button 
            className={`segment-btn ${type === 'formula' ? 'active' : ''}`}
            onClick={() => setType('formula')}
          >
            Formula
          </button>
        </div>

        {type === 'breast' ? (
          <>
            <div className="section-header-row">
              <h3>Select Size</h3>
              <span className="last-log-tag">Last: {lastQuantity}</span>
            </div>
            
            <div className="grid-2x2">
              {sizes.map(s => (
                <button 
                  key={s.id} 
                  className={`size-card ${size === s.id ? 'active' : ''}`}
                  onClick={() => setSize(s.id)}
                >
                  <div className="baby-icon-placeholder">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>face</span>
                  </div>
                  <div className="size-label">{s.id}</div>
                  <div className="ml-label">{s.ml}ml</div>
                </button>
              ))}
            </div>

            <h3 className="section-title mt-24">Details</h3>
            <div className="side-selector">
              <button 
                className={`side-btn ${side === 'left' ? 'active' : ''}`}
                onClick={() => setSide('left')}
              >
                {side === 'left' && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>} Left
              </button>
              <button 
                className={`side-btn ${side === 'both' ? 'active' : ''}`}
                onClick={() => setSide('both')}
              >
                {side === 'both' && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>} Both
              </button>
              <button 
                className={`side-btn ${side === 'right' ? 'active' : ''}`}
                onClick={() => setSide('right')}
              >
                {side === 'right' && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>} Right
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="section-title mt-24">Select Quantity (ml)</h3>
            <div className="grid-2x2">
              {quantities.map(q => (
                <button 
                  key={q} 
                  className={`size-card ${quantity === q ? 'active' : ''}`}
                  onClick={() => setQuantity(q)}
                >
                  <div className="size-label large">{q}</div>
                  <div className="ml-label">ml</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Common details */}
        <div className="time-block glass-card mt-16">
          <div className="time-info">
            <span className="time-label">Time of feeding</span>
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
            placeholder={type === 'breast' ? "How was the feeding today?" : "e.g. Fussy during burping..."}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="bottom-action-bar">
        <button className="save-btn" onClick={handleSave}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span> {type === 'breast' ? 'Log Entry' : 'Save Feeding Log'}
        </button>
      </div>
    </div>
  );
}
