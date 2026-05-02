import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../hooks/useEvents';
import { useSettings } from '../hooks/useSettings';
import './LogFeed.css'; // Reusing some shared layout styles
import './LogMedicine.css';

export default function LogMedicine() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const timeInputRef = useRef(null);
  const [medicineName, setMedicineName] = useState('Vitamin D');
  const [dosage, setDosage] = useState('1');
  const [unit, setUnit] = useState('drop'); // 'drop' | 'ml' | 'tsp' | 'tablet'
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  });

  const commonMedicines = ['Vitamin D', 'Calpol', 'Ibuprofen', 'Gaviscon'];
  const units = ['drop', 'ml', 'tsp', 'tablet'];

  const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSave = async () => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    now.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const eventData = {
      type: 'medicine',
      subtype: medicineName,
      dosage: `${dosage} ${unit}`,
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
        <h2>Log Medicine</h2>
        <div className="avatar-placeholder-small">
          <img src={settings?.profileImage || "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=100&q=80"} alt="Baby" className="avatar-small" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23d8dbd6"/></svg>' }} />
        </div>
      </header>

      <div className="container">
        <h3 className="section-title">Select Medicine</h3>
        <div className="medicine-presets">
          {commonMedicines.map(med => (
            <button 
              key={med}
              className={`preset-btn ${medicineName === med ? 'active' : ''}`}
              onClick={() => setMedicineName(med)}
            >
              {med}
            </button>
          ))}
        </div>

        <div className="custom-input-group mt-16">
          <span className="input-label">Medicine Name</span>
          <input 
            type="text" 
            placeholder="Enter medicine name..."
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            className="text-input"
          />
        </div>

        <h3 className="section-title mt-24">Dosage</h3>
        <div className="dosage-input-row">
          <input 
            type="text" 
            placeholder="Amount"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="dosage-value-input"
          />
          <div className="unit-selector">
            {units.map(u => (
              <button 
                key={u}
                className={`unit-btn ${unit === u ? 'active' : ''}`}
                onClick={() => setUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Time selector */}
        <div className="time-block glass-card mt-24">
          <div className="time-info">
            <span className="time-label">Time given</span>
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
            placeholder="e.g. For mild fever..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="bottom-action-bar">
        <button className="save-btn medicine-save" onClick={handleSave}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>medical_services</span> Log Medicine
        </button>
      </div>
    </div>
  );
}
