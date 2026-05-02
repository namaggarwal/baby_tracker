import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import QuickAddMenu from './QuickAddMenu';
import './AppShell.css';

export default function AppShell() {
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="app-container">
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
