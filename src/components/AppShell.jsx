import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import QuickAddMenu from './QuickAddMenu';
import { useToast } from '../context/ToastContext';
import { fetchFromCloud } from '../utils/sync';
import './AppShell.css';

const POLL_INTERVAL_MS = 30000; // 30 seconds

export default function AppShell() {
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { showToast } = useToast();

  const autoSync = useCallback(async (silent = true) => {
    if (!navigator.onLine) return;
    const success = await fetchFromCloud();
    if (!silent && success) {
      showToast('Synced latest updates!', 'success');
    }
  }, [showToast]);

  // Poll every 30 seconds when online
  useEffect(() => {
    const interval = setInterval(() => autoSync(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [autoSync]);

  // Sync immediately when the user brings the app back into focus (picks up phone)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        autoSync(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoSync]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Back online! All set.', 'success');
      autoSync(true); // Sync immediately on reconnect
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, autoSync]);

  return (
    <div className="app-container">
      {isOffline && (
        <div className="offline-banner">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cloud_off</span>
          Offline Mode • Working Locally
        </div>
      )}
      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <div className="nav-icon-container"><span className="material-symbols-outlined" style={{ fontSize: '24px' }}>home</span></div>
          <span className="nav-label">HOME</span>
        </Link>
        <Link to="/history" className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}>
          <div className="nav-icon-container"><span className="material-symbols-outlined" style={{ fontSize: '24px' }}>history</span></div>
          <span className="nav-label">HISTORY</span>
        </Link>
        
        <div className="fab-container">
          <button className={`fab-button ${isQuickAddOpen ? 'open' : ''}`} onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}>
            {isQuickAddOpen ? <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#fff' }}>close</span> : <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#fff' }}>add</span>}
          </button>
        </div>

        <Link to="/insights" className={`nav-item ${location.pathname === '/insights' ? 'active' : ''}`}>
          <div className="nav-icon-container"><span className="material-symbols-outlined" style={{ fontSize: '24px' }}>monitoring</span></div>
          <span className="nav-label">INSIGHTS</span>
        </Link>
        <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
          <div className="nav-icon-container"><span className="material-symbols-outlined" style={{ fontSize: '24px' }}>settings</span></div>
          <span className="nav-label">SETTINGS</span>
        </Link>
      </nav>

      {isQuickAddOpen && <QuickAddMenu onClose={() => setIsQuickAddOpen(false)} />}
    </div>
  );
}
