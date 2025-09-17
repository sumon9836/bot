
'use client';

interface HeaderProps {
  onRefresh?: () => void;
  showRefreshButton?: boolean;
}

export function Header({ onRefresh, showRefreshButton = false }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <i className="fab fa-whatsapp header-icon"></i>
          <div>
            <h1>𝐊ąìʂҽղ-𝐌𝐃</h1>
            <p className="header-subtitle">Advanced Bot Management</p>
            <p className="developer-credit">Powered by Sumon Developer</p>
          </div>
        </div>
        <div className="header-right">
          <a 
            href="https://chat.whatsapp.com/CQyxExEBMGvEnkAAjRhF6o" 
            target="_blank" 
            rel="noopener noreferrer"
            className="support-button"
          >
            <i className="fas fa-headset"></i>
            <span>Support</span>
          </a>
          {showRefreshButton && (
            <button 
              onClick={onRefresh}
              className="refresh-button"
              title="Refresh data"
            >
              <i className="fas fa-sync-alt"></i>
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
