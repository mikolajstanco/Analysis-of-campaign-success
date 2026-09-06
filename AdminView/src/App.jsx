import { useState } from 'react';
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

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'campaigns': return <Campaigns />;
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

        {/* Footer info */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>API Tracker</div>
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
