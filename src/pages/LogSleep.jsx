import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent, useEvents, updateEvent } from '../hooks/useEvents';
import './LogSleep.css';

export default function LogSleep() {
  const navigate = useNavigate();
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  
  const sleepEvents = useEvents('sleep');
  const activeSleep = sleepEvents?.find(e => !e.endTime);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('0h 0m');

  // Initialize from active sleep or current time
  useEffect(() => {
    const now = new Date();
    if (activeSleep) {
      const startDt = new Date(activeSleep.timestamp);
      setStartTime(startDt.toTimeString().slice(0, 5));
      setEndTime(now.toTimeString().slice(0, 5));
      setNotes(activeSleep.notes || '');
    } else {
      setStartTime(now.toTimeString().slice(0, 5));
      setEndTime(now.toTimeString().slice(0, 5));
    }
  }, [activeSleep]);

  // Calculate duration
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      let end = new Date(`2000-01-01T${endTime}`);
      
      if (end < start) {
         end.setDate(end.getDate() + 1);
      }
      const diffMs = end - start;
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setDuration(`${hrs}h ${mins}m`);
    }
  }, [startTime, endTime]);

  const displayStart = startTime ? new Date(`2000-01-01T${startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const displayEnd = endTime ? new Date(`2000-01-01T${endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

  const handleSnapToEnd = () => {
    const now = new Date();
    setEndTime(now.toTimeString().slice(0, 5));
  };

  const handleSave = async () => {
    const now = new Date();
    const [startH, startM] = startTime.split(':');
    const startDt = new Date(now);
    startDt.setHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0);

    if (activeSleep) {
      // Ending an existing sleep
      const [endH, endM] = endTime.split(':');
      const endDt = new Date(now);
      endDt.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0);
      if (endDt < startDt) endDt.setDate(endDt.getDate() + 1);

      await updateEvent(activeSleep.id, {
        timestamp: startDt.toISOString(), // Allow updating start time if edited
        endTime: endDt.toISOString(),
        duration,
        notes
      });
    } else {
      // Starting a new sleep
      const eventData = {
        type: 'sleep',
        timestamp: startDt.toISOString(),
        endTime: null, // Keep it open
        notes,
      };
      await addEvent(eventData);
    }
    navigate('/');
  };

  return (
    <div className="log-page sleep-page">
      <header className="log-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#012108' }}>arrow_back</span>
        </button>
        <h2>{activeSleep ? 'End Sleep' : 'Start Sleep'}</h2>
        <button className="icon-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#012108' }}>notifications</span>
        </button>
      </header>

      <div className="container pb-120">
        {/* Timer UI */}
        <div className="timer-section">
          <div className="timer-circle">
            <span className="timer-label">Duration</span>
            <span className="timer-value">{activeSleep ? duration : '--'}</span>
            <div className="moon-bg">
               <span className="material-symbols-outlined" style={{ fontSize: '120px', opacity: 0.05 }}>bedtime</span>
            </div>
          </div>
          <div className="timer-status">
            {activeSleep ? `Currently resting since ${displayStart}` : 'Not currently tracking'}
          </div>
          
          {activeSleep && (
            <button className="end-sleep-btn" onClick={handleSnapToEnd}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>schedule</span> Snap to Current Time
            </button>
          )}
        </div>

        {/* Manual Entry */}
        <div className="manual-entry-card">
          <h3 className="card-title">Entry Details</h3>
          
          <div className="time-row">
            <div className="time-col">
              <span className="col-label">Start Time</span>
              <div className="time-input-container">
                <span className="display-time">{displayStart}</span>
                <div className="time-picker-wrapper" style={{ position: 'relative' }}>
                  <button className="change-btn" style={{ pointerEvents: 'none' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span> Change
                  </button>
                  <input 
                    type="time" 
                    ref={startTimeRef} 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
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
            </div>
            
            {activeSleep && (
              <div className="time-col">
                <span className="col-label">End Time</span>
                <div className="time-input-container">
                  <span className="display-time">{displayEnd}</span>
                  <div className="time-picker-wrapper" style={{ position: 'relative' }}>
                    <button className="change-btn" style={{ pointerEvents: 'none' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span> Change
                    </button>
                    <input 
                      type="time" 
                      ref={endTimeRef} 
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)} 
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
              </div>
            )}
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
      </div>

      <div className="bottom-action-bar">
        <button className="save-btn" onClick={handleSave}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{activeSleep ? 'stop_circle' : 'play_circle'}</span> 
          {activeSleep ? 'Save & End Sleep' : 'Start Sleep Record'}
        </button>
      </div>
    </div>
  );
}
