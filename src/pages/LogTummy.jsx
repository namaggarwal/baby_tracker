import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEvent, useEvents } from '../hooks/useEvents';
import { useSettings } from '../hooks/useSettings';
import './LogTummy.css';

export default function LogTummy() {
  const navigate = useNavigate();
  const events = useEvents();
  const { settings } = useSettings();
  const [entryMode, setEntryMode] = useState('timer'); // 'timer' or 'manual'
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [manualMins, setManualMins] = useState(10);
  const [manualTime, setManualTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  });
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs].map(v => v < 10 ? '0' + v : v).join(':');
  };

  const handleToggle = async () => {
    if (isActive) {
      const durationMins = Math.max(1, Math.round(seconds / 60));
      await saveSession(durationMins, `Session lasted ${formatTimer(seconds)}`);
    } else {
      setIsActive(true);
    }
  };

  const saveSession = async (duration, notes, customTimestamp) => {
    await addEvent({
      type: 'tummy',
      duration: `${duration} min`,
      notes: notes,
      timestamp: customTimestamp || new Date().toISOString(),
    });
    setIsActive(false);
    setSeconds(0);
    navigate('/');
  };

  const handleManualSave = () => {
    const now = new Date();
    const [hours, minutes] = manualTime.split(':');
    now.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    saveSession(manualMins, 'Manual entry', now.toISOString());
  };

  // Calculate today's progress
  const todayGoalMins = 30;
  const todayMins = events
    ?.filter(e => {
      const d = new Date(e.timestamp);
      const today = new Date();
      return e.type === 'tummy' && d.toDateString() === today.toDateString();
    })
    .reduce((acc, e) => acc + (parseInt(e.duration) || 0), 0) || 0;

  const progressPct = Math.min((todayMins / todayGoalMins) * 100, 100);

  return (
    <div className="log-page">
      <header className="log-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2>Tummy Time</h2>
        <div className="avatar-placeholder-small">
          <img src={settings?.profileImage || "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=100&q=80"} alt="Baby" className="avatar-small" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23d8dbd6"/></svg>' }} />
        </div>
      </header>

      <div className="container">
        <div className="tab-switcher mt-24" style={{ width: '100%' }}>
          <button className={entryMode === 'timer' ? 'active' : ''} onClick={() => setEntryMode('timer')} style={{ flex: 1 }}>Timer</button>
          <button className={entryMode === 'manual' ? 'active' : ''} onClick={() => setEntryMode('manual')} style={{ flex: 1 }}>Manual Entry</button>
        </div>

        {entryMode === 'timer' ? (
          <>
            <div className="space-y-unit" style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700' }}>Tummy Time</h2>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>Strengthening muscles, one minute at a time.</p>
            </div>

            <section className="tummy-timer-container">
              <div className="timer-circle-outer">
                <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                  <circle 
                    className="text-surface-container-high" 
                    cx="120" cy="120" r="110" 
                    fill="transparent" 
                    stroke="var(--color-surface-container-high)" 
                    strokeWidth="8"
                  ></circle>
                  <circle 
                    cx="120" cy="120" r="110" 
                    fill="transparent" 
                    stroke="var(--color-primary-container)" 
                    strokeWidth="12"
                    strokeDasharray="691"
                    strokeDashoffset={691 - (691 * (seconds % 60) / 60)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  ></circle>
                </svg>
                <div className="timer-circle-inner">
                  <span className="timer-display">{formatTimer(seconds)}</span>
                  <span className="timer-label">Active Session</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="manual-entry-section mt-32">
            <div className="space-y-unit">
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Session Details</h2>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>Enter when it started and how long it lasted.</p>
            </div>

            <div className="time-picker-row mt-24 glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>schedule</span>
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>Start Time</span>
                </div>
                <input 
                  type="time" 
                  value={manualTime} 
                  onChange={(e) => setManualTime(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  style={{ border: 'none', background: 'transparent', fontSize: '20px', fontWeight: '700', color: 'var(--color-primary)', outline: 'none' }}
                />
              </div>
            </div>
            
            <div className="duration-picker mt-16 glass-card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <span style={{ fontSize: '64px', fontWeight: '800', color: 'var(--color-primary)' }}>{manualMins}</span>
                <span style={{ fontSize: '18px', fontWeight: '600', opacity: 0.7 }}>minutes</span>
                <input 
                  type="range" 
                  min="1" 
                  max="60" 
                  value={manualMins} 
                  onChange={(e) => setManualMins(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '32px', accentColor: 'var(--color-primary)' }}
                />
              </div>
            </div>
          </div>
        )}

        <section className="goal-tracker mt-32">
          <div className="goal-header">
            <span className="goal-title">Daily Goal</span>
            <span className="goal-progress-text">{todayMins} / {todayGoalMins} mins</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
          </div>
          <p className="goal-footer">
            {progressPct >= 100 ? 'Goal reached! Amazing job.' : 
             progressPct >= 50 ? 'Almost halfway there! Keep it up.' : 
             'Every minute counts! Let\'s go.'}
          </p>
        </section>
      </div>

      <div className="bottom-action-bar">
        {entryMode === 'timer' ? (
          <button 
            className={`timer-btn ${isActive ? 'stop' : 'start'}`}
            onClick={handleToggle}
          >
            <span className="material-symbols-outlined">{isActive ? 'stop' : 'play_arrow'}</span>
            {isActive ? 'Stop Session' : 'Start Session'}
          </button>
        ) : (
          <button className="save-btn" onClick={handleManualSave}>
            <span className="material-symbols-outlined">check_circle</span>
            Save Manual Log
          </button>
        )}
      </div>
    </div>
  );
}
