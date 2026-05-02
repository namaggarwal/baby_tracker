import { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import './Insights.css';

export default function Insights() {
  const events = useEvents();
  const [viewMode, setViewMode] = useState('weekly'); // 'daily' or 'weekly'

  const stats = useMemo(() => {
    if (!events) return null;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const getDayKey = (date) => new Date(date).toLocaleDateString();
    
    // Process last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayKey = getDayKey(d);
      
      const dayEvents = events.filter(e => getDayKey(e.timestamp) === dayKey);
      
      // Calculate sleep duration
      let sleepSeconds = 0;
      dayEvents.filter(e => e.type === 'sleep').forEach(e => {
        if (e.endTime) {
          const start = new Date(e.timestamp);
          const end = new Date(e.endTime);
          sleepSeconds += (end - start) / 1000;
        } else {
          // If still sleeping, count up to now if today
          if (dayKey === getDayKey(new Date())) {
            const start = new Date(e.timestamp);
            sleepSeconds += (new Date() - start) / 1000;
          }
        }
      });

      const feeds = dayEvents.filter(e => e.type === 'feed');
      const breastFeeds = feeds.filter(e => e.subtype === 'breast');
      const formulaFeeds = feeds.filter(e => e.subtype === 'formula');

      dailyStats.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        fullDayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        date: d,
        sleepHours: (sleepSeconds / 3600).toFixed(1),
        feedVolume: feeds.reduce((acc, f) => acc + (parseInt(f.quantity_ml) || 0), 0),
        breastPct: feeds.length ? Math.round((breastFeeds.length / feeds.length) * 100) : 0,
        formulaPct: feeds.length ? Math.round((formulaFeeds.length / feeds.length) * 100) : 0,
        diapers: {
          wet: dayEvents.filter(e => e.type === 'diaper' && (e.subtype === 'wet' || !e.subtype)).length,
          dirty: dayEvents.filter(e => e.type === 'diaper' && e.subtype === 'dirty').length,
          mixed: dayEvents.filter(e => e.type === 'diaper' && e.subtype === 'mixed').length,
        },
        sleepSessions: dayEvents.filter(e => e.type === 'sleep').map(e => ({
          id: e.id,
          startTime: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: e.endTime ? new Date(e.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing',
          duration: e.duration || '...'
        }))
      });
    }

    const currentDay = dailyStats[dailyStats.length - 1];
    const weeklyAvgSleep = (dailyStats.reduce((acc, d) => acc + parseFloat(d.sleepHours), 0) / 7).toFixed(1);
    const weeklyAvgFeed = Math.round(dailyStats.reduce((acc, d) => acc + d.feedVolume, 0) / 7);
    const weeklyAvgDiapers = (dailyStats.reduce((acc, d) => acc + d.diapers.wet + d.diapers.dirty + d.diapers.mixed, 0) / 7).toFixed(1);

    const allFeeds = events.filter(e => {
      const d = new Date(e.timestamp);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return d > sevenDaysAgo && e.type === 'feed';
    });
    const weeklyBreast = allFeeds.filter(e => e.subtype === 'breast').length;
    const weeklyFormula = allFeeds.filter(e => e.subtype === 'formula').length;
    const totalWeeklyFeeds = allFeeds.length;

    const weeklyBreastPct = totalWeeklyFeeds ? Math.round((weeklyBreast / totalWeeklyFeeds) * 100) : 0;
    const weeklyFormulaPct = totalWeeklyFeeds ? Math.round((weeklyFormula / totalWeeklyFeeds) * 100) : 0;

    return {
      daily: currentDay,
      weekly: dailyStats,
      averages: {
        sleep: weeklyAvgSleep,
        feed: weeklyAvgFeed,
        diapers: weeklyAvgDiapers,
        breastPct: weeklyBreastPct,
        formulaPct: weeklyFormulaPct
      }
    };
  }, [events]);

  if (!stats) return <div className="container">Loading insights...</div>;

  const displaySleep = viewMode === 'daily' ? stats.daily.sleepHours : stats.averages.sleep;
  const displayFeed = viewMode === 'daily' ? stats.daily.feedVolume : stats.averages.feed;
  const displayDiapers = viewMode === 'daily' ? 
    (stats.daily.diapers.wet + stats.daily.diapers.dirty + stats.daily.diapers.mixed) : 
    stats.averages.diapers;

  const breastPct = viewMode === 'daily' ? stats.daily.breastPct : stats.averages.breastPct;
  const formulaPct = viewMode === 'daily' ? stats.daily.formulaPct : stats.averages.formulaPct;

  return (
    <div className="container insights-page">
      <header className="page-header">
        <div className="header-top">
          <h2>Insights</h2>
          <div className="tab-switcher">
            <button 
              className={viewMode === 'daily' ? 'active' : ''} 
              onClick={() => setViewMode('daily')}
            >Daily</button>
            <button 
              className={viewMode === 'weekly' ? 'active' : ''} 
              onClick={() => setViewMode('weekly')}
            >Weekly</button>
          </div>
        </div>
        <p className="subtitle">
          {viewMode === 'weekly' ? 'Last 7 days' : 'Today'} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </header>

      <div className="insights-grid">
        {/* Sleep Card */}
        <section className="insight-card sleep-card">
          <div className="card-header">
            <div className="icon-title">
              <span className="material-symbols-outlined icon-secondary">bedtime</span>
              <h3>Sleep</h3>
            </div>
            <div className="stat-summary">
              <span className="value">{displaySleep}h</span>
              <span className="label">{viewMode === 'weekly' ? 'Daily Avg' : 'Total'}</span>
            </div>
          </div>
          
          {viewMode === 'weekly' ? (
            <div className="chart-container sleep-chart">
              {stats.weekly.map((day, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ height: `${Math.min((day.sleepHours / 20) * 100, 100)}%` }}
                  ></div>
                  <span className="bar-label">{day.dayName}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="nap-details">
              {stats.daily.sleepSessions.length > 0 ? (
                <div className="nap-list">
                  {stats.daily.sleepSessions.slice(0, 3).map(session => (
                    <div key={session.id} className="nap-item">
                      <span className="nap-time">{session.startTime} - {session.endTime}</span>
                      <span className="nap-duration">{session.duration}</span>
                    </div>
                  ))}
                  {stats.daily.sleepSessions.length > 3 && (
                    <div className="more-naps">+{stats.daily.sleepSessions.length - 3} more sessions</div>
                  )}
                </div>
              ) : (
                <p className="no-data">No sleep recorded today</p>
              )}
            </div>
          )}
        </section>

        {/* Feeding Card */}
        <section className="insight-card feeding-card">
          <div className="card-header">
            <div className="icon-title">
              <span className="material-symbols-outlined icon-primary">nutrition</span>
              <h3>Feeding</h3>
            </div>
            <div className="stat-summary">
              <span className="value">{displayFeed}ml</span>
              <span className="label">{viewMode === 'weekly' ? 'Daily Avg' : 'Total Volume'}</span>
            </div>
          </div>

          <div className="rings-row">
            <div className="ring-stat">
              <div className="progress-ring-mini">
                <svg viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray={`${breastPct}, 100`} />
                </svg>
                <span className="ring-text">{breastPct}%</span>
              </div>
              <span className="ring-label">Breast</span>
            </div>
            <div className="ring-stat">
              <div className="progress-ring-mini">
                <svg viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray={`${formulaPct}, 100`} />
                </svg>
                <span className="ring-text">{formulaPct}%</span>
              </div>
              <span className="ring-label">Bottle</span>
            </div>
          </div>
        </section>

        {/* Diaper Card */}
        <section className="insight-card diaper-card full-width">
          <div className="card-header-horizontal">
            <div className="icon-title">
              <span className="material-symbols-outlined icon-white">opacity</span>
              <div>
                <h3>Diaper Changes</h3>
                <p className="card-subtitle">{displayDiapers} {viewMode === 'weekly' ? 'changes per day average' : 'changes today'}</p>
              </div>
            </div>
          </div>

          <div className="diaper-pills">
            <div className="diaper-pill">
              <span className="pill-label">Wet</span>
              <div className="pill-value-row">
                <span className="pill-value">{viewMode === 'daily' ? stats.daily.diapers.wet : stats.weekly.reduce((acc, d) => acc + d.diapers.wet, 0)}</span>
                <span className="material-symbols-outlined pill-icon">water_drop</span>
              </div>
            </div>
            <div className="diaper-pill">
              <span className="pill-label">Dirty</span>
              <div className="pill-value-row">
                <span className="pill-value">{viewMode === 'daily' ? stats.daily.diapers.dirty : stats.weekly.reduce((acc, d) => acc + d.diapers.dirty, 0)}</span>
                <span className="material-symbols-outlined pill-icon">eco</span>
              </div>
            </div>
            <div className="diaper-pill glass-pill">
              <span className="pill-label">Mixed</span>
              <div className="pill-value-row">
                <span className="pill-value">{viewMode === 'daily' ? stats.daily.diapers.mixed : stats.weekly.reduce((acc, d) => acc + d.diapers.mixed, 0)}</span>
                <span className="material-symbols-outlined pill-icon">layers</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
