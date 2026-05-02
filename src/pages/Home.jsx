import { useEvents } from '../hooks/useEvents';
import { useSettings } from '../hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const events = useEvents();
  const { settings } = useSettings();
  const babyName = settings?.babyName || 'Leo'; // Matching mockup default

  // Simple ring component for daily progress
  const ProgressRing = ({ value, max, label, color }) => {
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
            <span className="max">/ {max}{label.includes('Time') ? 'M' : ' FEEDS'}</span>
          </div>
        </div>
        <div className="progress-label">{label}</div>
      </div>
    );
  };

  return (
    <div className="container home-page">
      <header className="page-header">
        <div className="header-left">
          <img src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=100&q=80" alt="Baby" className="avatar" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="%23d8dbd6"/></svg>' }} />
          <h2>{babyName}'s Day</h2>
        </div>
        <button className="icon-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#012108' }}>notifications</span>
        </button>
      </header>

      {/* Current Status Card */}
      <section className="status-card">
        <div className="status-top">
          <div className="status-main">
            <div className="status-icon"><span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#494265' }}>bedtime</span></div>
            <div className="status-text">
              <span className="status-subtitle">Current Status</span>
              <span className="status-title">{babyName} is sleeping</span>
            </div>
          </div>
          <div className="status-timer">01:42:15</div>
        </div>
        <div className="status-footer">
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#625a7f' }}>history</span>
          <span>Started at 1:45 PM • Nap 2 of the day</span>
        </div>
      </section>

      {/* Suggested next feeding */}
      <section className="suggestion-card">
        <div className="suggestion-icon-circle">
          <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#2e4e30' }}>nutrition</span>
        </div>
        <div className="suggestion-text">
          <span>Next feeding suggested around</span>
          <strong>4:30 PM</strong>
        </div>
        <div className="suggestion-chevron">
           <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2e4e30' }}>chevron_right</span>
        </div>
      </section>

      {/* Daily Progress */}
      <section className="daily-progress">
        <h3 className="section-title">Daily Progress</h3>
        <div className="rings-container">
          <ProgressRing value={15} max={30} label="Tummy Time" color="#2e4e30" />
          <ProgressRing value={4} max={8} label="Daily Feeds" color="#494265" />
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
            <div key={event.id} className="activity-item">
               <div className="activity-icon-container">
                 {event.type === 'feed' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#436444' }}>nutrition</span>}
                 {event.type === 'sleep' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#61597e' }}>bedtime</span>}
                 {event.type === 'diaper' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#5d5c55' }}>water_drop</span>}
                 {event.type === 'tummy' && <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#5d5c55' }}>face</span>}
                 {event.type === 'bath' && <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#5d5c55' }}>bathtub</span>}
               </div>
               <div className="activity-details">
                 <span className="activity-name">
                   {event.type === 'feed' 
                     ? (event.subtype === 'breast' ? 'Breast Feed' : 'Formula Feed') 
                     : event.type === 'diaper' ? `${event.subtype ? event.subtype.charAt(0).toUpperCase() + event.subtype.slice(1) : 'Wet'} Nappy` : event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                 </span>
                 <span className="activity-time">
                   {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {
                     event.type === 'feed' ? `${event.quantity_ml}ml ${event.subtype === 'breast' ? 'Breastmilk' : 'Formula'}` 
                     : event.type === 'diaper' ? (event.size ? `${event.size === 'S' ? 'Small' : event.size === 'M' ? 'Medium' : 'Large'}` : 'Normal')
                     : 'Normal'
                   }
                 </span>
               </div>
            </div>
          )) : (
            <>
              <div className="activity-item">
                 <div className="activity-icon-container">
                   <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#5d5c55' }}>water_drop</span>
                 </div>
                 <div className="activity-details">
                   <span className="activity-name">Wet Diaper</span>
                   <span className="activity-time">12:45 PM • Normal</span>
                 </div>
              </div>
              <div className="activity-item">
                 <div className="activity-icon-container">
                   <span className="material-symbols-outlined material-icons-filled" style={{ fontSize: '24px', color: '#436444' }}>nutrition</span>
                 </div>
                 <div className="activity-details">
                   <span className="activity-name">Bottle Feed</span>
                   <span className="activity-time">11:30 AM • 120ml Breastmilk</span>
                 </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
