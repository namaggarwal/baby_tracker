import { useEvents } from '../hooks/useEvents';
import './Insights.css';

export default function Insights() {
  const events = useEvents();

  const getStats = () => {
    if (!events) return { feeds: 0, sleep: 0, diapers: 0 };
    
    // Filter events from the last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.timestamp) > last24h);
    
    return {
      feeds: recentEvents.filter(e => e.type === 'feed').length,
      sleep: recentEvents.filter(e => e.type === 'sleep').length,
      diapers: recentEvents.filter(e => e.type === 'diaper').length,
    };
  };

  const stats = getStats();

  return (
    <div className="container insights-page">
      <header className="page-header">
        <h2>Insights</h2>
      </header>
      
      <section className="insights-card">
        <h3>Last 24 Hours</h3>
        <div className="stats-grid">
          <div className="stat-box" style={{ borderColor: 'var(--color-sage)' }}>
            <div className="stat-value">{stats.feeds}</div>
            <div className="stat-label">Feeds</div>
          </div>
          <div className="stat-box" style={{ borderColor: 'var(--color-lavender)' }}>
            <div className="stat-value">{stats.sleep}</div>
            <div className="stat-label">Sleeps</div>
          </div>
          <div className="stat-box" style={{ borderColor: '#c2b280' }}>
            <div className="stat-value">{stats.diapers}</div>
            <div className="stat-label">Diapers</div>
          </div>
        </div>
      </section>
      
      <div className="coming-soon-banner">
        More detailed charts and trends coming soon!
      </div>
    </div>
  );
}
