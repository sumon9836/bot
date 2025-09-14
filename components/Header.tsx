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
            href="https://chat.whatsapp.com/CQyxExEBMGvEnkA32zqbNY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-support" 
            title="Join Support Group"
          >
            <i className="fab fa-whatsapp"></i>
            <span className="support-text">Support</span>
          </a>
          {showRefreshButton && onRefresh && (
            <button 
              onClick={onRefresh}
              className="btn btn-secondary" 
              title="Refresh Sessions"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}