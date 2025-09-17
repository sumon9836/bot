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
          <span className="header-icon">🤖</span>
          <div>
            <h1>𝐊ąìʂҽղ-𝐌𝐃</h1>
            <div className="header-subtitle">Bot Dashboard</div>
            <div className="developer-credit">by Sumon Developer</div>
          </div>
        </div>
        <div className="header-right">
          {showRefreshButton && onRefresh && (
            <button 
              onClick={onRefresh}
              className="btn btn-secondary btn-sm"
              title="Refresh Dashboard"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          )}
        </div>
      </div>
    </header>
  );
}