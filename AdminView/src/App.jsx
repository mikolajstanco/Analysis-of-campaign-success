import { useState, useEffect } from 'react';
import './index.css';
import Dashboard from './pages/Dashboard.jsx';
import Campaigns from './pages/Campaigns.jsx';
import Analytics from './pages/Analytics.jsx';

const NAV_ITEMS = [
  { id: 'dashboard',  icon: '🏠', label: 'Dashboard' },
  { id: 'campaigns',  icon: '📣', label: 'Kampanie' },
  { id: 'analytics',  icon: '📊', label: 'Analityka' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [defaultTargetUrl, setDefaultTargetUrl] = useState(() => localStorage.getItem('defaultTargetUrl') || 'https://www.mikolajstanco.pl');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('defaultTargetUrl', defaultTargetUrl);
  }, [defaultTargetUrl]);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'campaigns': return <Campaigns defaultTargetUrl={defaultTargetUrl} />;
      case 'analytics': return <Analytics />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Campaign<br />Tracker</h1>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Settings */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase' }}>Ustawienia</div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Domyślny link docelowy</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ fontSize: 12, padding: '6px 10px' }}
              value={defaultTargetUrl}
              onChange={e => setDefaultTargetUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <button 
            className="btn btn-ghost" 
            style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️ Tryb jasny' : '🌙 Tryb ciemny'}
          </button>
        </div>

        {/* Footer info */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>API Tracker</div>
            <div>localhost:5000</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
