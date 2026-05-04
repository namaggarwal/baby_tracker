import { useState, useEffect, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useSettings } from '../hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import { formatTime, formatTimeRange } from '../utils/timeFormat';
import './Home.css';

// Move component outside to prevent remounts on every render
const ProgressCard = ({ value, max, label, color, unit }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(value, max);
  const strokeDashoffset = circumference - (safeValue / max) * circumference;

  return (
    <div className="progress-card">
      <div className="progress-ring-wrapper">
        <svg className="progress-ring" width="70" height="70">
          <circle stroke="#e6e9e4" strokeWidth="6" fill="transparent" r={radius} cx="35" cy="35"/>
          <circle stroke={color} strokeWidth="6" fill="transparent" r={radius} cx="35" cy="35"
            style={{ strokeDasharray: circumference, strokeDashoffset, strokeLinecap: 'round', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
        </svg>
        <div className="progress-value">
          <span className="current">{value}</span>
          <span className="max">/ {max}{unit}</span>
        </div>
      </div>
      <div className="progress-label">{label}</div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const events = useEvents();
  const { settings } = useSettings();
  const babyName = settings?.babyName || 'Tara';
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [activeSuggestion, setActiveSuggestion] = useState('feed');

  // Suggestion rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSuggestion(prev => prev === 'feed' ? 'nappy' : 'feed');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Memoize daily progress to avoid expensive filters on every tick
  const dailyStats = useMemo(() => {
    if (!events) return { sleepsToday: 0, tummyMins: 0, feedCount: 0, diaperCount: 0, todayEvents: [] };
    
    const todayStr = new Date().toDateString();
    const todayArr = events.filter(e => e.timestamp && new Date(e.timestamp).toDateString() === todayStr);

    return {
      sleepsToday: todayArr.filter(e => e.type === 'sleep').length,
      tummyMins: todayArr.filter(e => e.type === 'tummy').reduce((acc, e) => acc + (parseInt(e.duration) || 0), 0),
      feedCount: todayArr.filter(e => e.type === 'feed').length,
      diaperCount: todayArr.filter(e => e.type === 'diaper').length,
      todayEvents: todayArr
    };
  }, [events]);

  const { sleepsToday, tummyMins, feedCount, diaperCount } = dailyStats;

  // Status and timers
  const lastSleep = useMemo(() => events?.find(e => e.type === 'sleep'), [events]);
  const isSleeping = !!(lastSleep && !lastSleep.endTime);

  const lastFeed = useMemo(() => events?.find(e => e.type === 'feed'), [events]);
  const lastDiaper = useMemo(() => events?.find(e => e.type === 'diaper'), [events]);

  const feedInterval = parseFloat(settings?.feedingInterval || 3);
  const nextFeedingTime = lastFeed?.timestamp 
    ? new Date(new Date(lastFeed.timestamp).getTime() + feedInterval * 60 * 60 * 1000)
    : null;

  const nappyInterval = parseFloat(settings?.nappyInterval || 3);
  const nextDiaperTime = lastDiaper?.timestamp
    ? new Date(new Date(lastDiaper.timestamp).getTime() + nappyInterval * 60 * 60 * 1000)
    : null;

  useEffect(() => {
    const updateTimer = () => {
      const referenceTime = isSleeping 
        ? (lastSleep?.timestamp ? new Date(lastSleep.timestamp) : null)
        : (lastSleep?.endTime ? new Date(lastSleep.endTime) : null);

      if (referenceTime && !isNaN(referenceTime.getTime())) {
        const diff = Math.abs(new Date() - referenceTime);
        const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setElapsedTime(`${hrs}:${mins}:${secs}`);
      } else {
        setElapsedTime('00:00:00');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSleeping, lastSleep?.timestamp, lastSleep?.endTime]);

  const tummyGoal = settings?.tummyGoal || 30;
  const feedGoal = settings?.feedGoal || 8;
  const nappyGoal = settings?.nappyGoal || 6;

  return (
    <div className="container home-page">
      <header className="page-header">
        <div className="header-left">
          <img src={settings?.profileImage || "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=100&q=80"} alt="Baby" className="avatar" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="%23d8dbd6"/></svg>' }} />
          <h2>{babyName}'s Day</h2>
        </div>
        <button className="icon-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#012108' }}>notifications</span>
        </button>
      </header>

      {/* Current Status Card */}
      <section className={`status-card ${isSleeping ? 'is-sleeping' : 'is-awake'}`}>
        <div className="status-top">
          <div className="status-main">
            <div className="status-icon">
              <span className="material-symbols-outlined material-icons-filled" style={{ 
                fontSize: '24px', 
                color: isSleeping ? '#494265' : '#2e4e30' 
              }}>
                {isSleeping ? 'bedtime' : 'sunny'}
              </span>
            </div>
            <div className="status-text">
              <span className="status-subtitle">Current Status</span>
              <span className="status-title">{babyName} is {isSleeping ? 'sleeping' : 'awake'}</span>
            </div>
          </div>
          <div className="status-timer">{elapsedTime}</div>
        </div>
        <div className="status-footer">
          <span className="material-symbols-outlined" style={{ 
            fontSize: '16px', 
            color: isSleeping ? '#625a7f' : '#424841' 
          }}>history</span>
          {isSleeping ? (
            <span>Started at {formatTime(lastSleep.timestamp, settings?.timeFormat)} • Nap {sleepsToday} of the day</span>
          ) : (
            <span>{lastSleep ? `Woke up at ${formatTime(lastSleep.endTime, settings?.timeFormat)}` : 'No sleep records yet'}</span>
          )}
        </div>
      </section>

      {/* Suggested next action (Rotating) */}
      <section 
        className={`suggestion-card suggestion-fade ${activeSuggestion}`} 
        onClick={() => navigate(activeSuggestion === 'feed' ? '/log/feed' : '/log/nappy')}
      >
        <div className="suggestion-icon-circle">
          <span className="material-symbols-outlined material-icons-filled" style={{ 
            fontSize: '24px', 
            color: activeSuggestion === 'feed' ? '#2e4e30' : '#c2b280' 
          }}>
            {activeSuggestion === 'feed' ? 'nutrition' : 'water_drop'}
          </span>
        </div>
        <div className="suggestion-text">
          <span>Next {activeSuggestion === 'feed' ? 'feeding' : 'nappy change'} suggested around</span>
          <strong>
            {activeSuggestion === 'feed' 
              ? (nextFeedingTime ? formatTime(nextFeedingTime, settings?.timeFormat) : 'No feeds logged')
              : (nextDiaperTime ? formatTime(nextDiaperTime, settings?.timeFormat) : 'No nappies logged')
            }
          </strong>
        </div>
        <div className="suggestion-chevron">
           <span className="material-symbols-outlined" style={{ 
             fontSize: '24px', 
             color: activeSuggestion === 'feed' ? '#2e4e30' : '#c2b280' 
           }}>chevron_right</span>
        </div>
      </section>

      {/* Daily Progress */}
      <section className="daily-progress">
        <h3 className="section-title">Daily Progress</h3>
        <div className="rings-container">
          <ProgressCard value={tummyMins} max={tummyGoal} label="Tummy Time" color="#2e4e30" unit="M" />
          <ProgressCard value={feedCount} max={feedGoal} label="Feeds" color="#494265" unit="" />
          <ProgressCard value={diaperCount} max={nappyGoal} label="Nappies" color="#c2b280" unit="" />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="recent-activity">
        <div className="section-header">
          <h3 className="section-title">Recent Activity</h3>
          <button className="view-all-btn" onClick={() => navigate('/history')}>View All</button>
        </div>
        <div className="activity-list">
          {events && events.length > 0 ? events.slice(0, 3).map(event => (
            <div key={event.syncId} className="activity-item">
               <div className="activity-icon-container">
                 {event.type === 'feed' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#436444' }}>nutrition</span>}
                 {event.type === 'sleep' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#61597e' }}>bedtime</span>}
                 {event.type === 'diaper' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#5d5c55' }}>water_drop</span>}
                 {event.type === 'medicine' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#ba1a1a' }}>medical_services</span>}
                 {event.type === 'tummy' && <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#5d5c55' }}>face</span>}
                 {event.type === 'bath' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#5d5c55' }}>bathtub</span>}
               </div>
               <div className="activity-details">
                 <span className="activity-name">
                   {event.type === 'feed' 
                     ? (event.subtype === 'breast' ? 'Breast Feed' : 'Formula Feed') 
                     : event.type === 'diaper' ? `${event.subtype ? event.subtype.charAt(0).toUpperCase() + event.subtype.slice(1) : 'Wet'} Nappy` : 
                       event.type === 'medicine' ? `Medicine: ${event.subtype}` :
                       event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                 </span>
                 <span className="activity-time">
                   {event.type === 'sleep' ? (
                     formatTimeRange(event.timestamp, event.endTime, settings?.timeFormat)
                   ) : (
                     formatTime(event.timestamp, settings?.timeFormat)
                   )}
                   {event.type !== 'sleep' && ` • ${
                     event.type === 'feed' ? `${event.quantity_ml}ml ${event.subtype === 'breast' ? 'Breastmilk' : 'Formula'}` 
                     : event.type === 'diaper' ? (event.size ? `${event.size === 'S' ? 'Small' : event.size === 'M' ? 'Medium' : 'Large'}` : 'Normal')
                     : event.type === 'medicine' ? event.dosage
                     : event.type === 'tummy' ? event.duration
                     : (event.notes || 'Normal')
                   }`}
                   {event.type === 'sleep' && event.duration && ` • ${event.duration}`}
                 </span>
               </div>
            </div>
          )) : (
            <div className="empty-recent">
              <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.3 }}>event_busy</span>
              <p>No recent activity. Use the + button to log something!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
