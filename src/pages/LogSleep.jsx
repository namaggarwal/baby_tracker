import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../hooks/useEvents';
import './LogSleep.css';

export default function LogSleep() {
  const navigate = useNavigate();
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() - 2);
    return now.toTimeString().slice(0, 5);
  });
  
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [notes, setNotes] = useState('');

  // Calculate duration
  const [duration, setDuration] = useState('0h 0m');

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      let end = new Date(`2000-01-01T${endTime}`);
      
      if (end < start) {
         // Assume it crossed midnight
         end.setDate(end.getDate() + 1);
      }
      const diffMs = end - start;
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setDuration(`${hrs}h ${mins}m`);
    }
  }, [startTime, endTime]);

  const displayStart = new Date(`2000-01-01T${startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const displayEnd = new Date(`2000-01-01T${endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleEndSleep = () => {
    const now = new Date();
    setEndTime(now.toTimeString().slice(0, 5));
  };

  const handleSave = async () => {
    const now = new Date();
    const [startH, startM] = startTime.split(':');
    const startDt = new Date(now);
    startDt.setHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0);

    const [endH, endM] = endTime.split(':');
    const endDt = new Date(now);
    endDt.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0);

    if (endDt < startDt) {
      startDt.setDate(startDt.getDate() - 1);
    }

    const eventData = {
      type: 'sleep',
      timestamp: startDt.toISOString(),
      endTime: endDt.toISOString(),
      duration,
      notes,
    };
    await addEvent(eventData);
    navigate('/');
  };

  return (
    <div className="log-page sleep-page">
      <header className="log-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#012108' }}>arrow_back</span>
        </button>
        <h2>Log Sleep</h2>
        <button className="icon-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#012108' }}>notifications</span>
        </button>
      </header>

      <div className="container pb-120">
        {/* Timer UI */}
        <div className="timer-section">
          <div className="timer-circle">
            <span className="timer-label">Duration</span>
            <span className="timer-value">{duration}</span>
            <div className="moon-bg">
               <span className="material-symbols-outlined" style={{ fontSize: '120px', opacity: 0.05 }}>bedtime</span>
            </div>
          </div>
          <div className="timer-status">Currently resting since {displayStart}</div>
          <button className="end-sleep-btn" onClick={handleEndSleep}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>stop_circle</span> End Sleep
          </button>
        </div>

        {/* Manual Entry */}
        <div className="manual-entry-card">
          <h3 className="card-title">Manual Entry</h3>
          
          <div className="time-row">
            <div className="time-col">
              <span className="col-label">Start Time</span>
              <div className="time-input-container" onClick={() => startTimeRef.current?.showPicker && startTimeRef.current.showPicker()}>
                <span className="display-time">{displayStart}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                <input 
                  type="time" 
                  ref={startTimeRef} 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="hidden-time-input" 
                />
              </div>
            </div>
            <div className="time-col">
              <span className="col-label">End Time</span>
              <div className="time-input-container" onClick={() => endTimeRef.current?.showPicker && endTimeRef.current.showPicker()}>
                <span className="display-time">{displayEnd}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                <input 
                  type="time" 
                  ref={endTimeRef} 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="hidden-time-input"
                />
              </div>
            </div>
          </div>

          <div className="notes-col">
            <span className="col-label">Notes</span>
            <textarea 
              placeholder="e.g. Baby woke up once, very calm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <img src="https://images.unsplash.com/photo-1544281665-c9945a8053a4?auto=format&fit=crop&w=400&q=80" alt="Sleeping baby" className="info-img" />
          <div className="info-overlay">
             <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>info</span>
             <span>Consistency helps baby develop routines</span>
          </div>
        </div>
      </div>

      <div className="bottom-action-bar">
        <button className="save-btn" onClick={handleSave}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span> Save Record
        </button>
      </div>
    </div>
  );
}
