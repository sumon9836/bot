'use client';

import { useBanlist } from '../hooks/useBanlist';
import { Loader } from './Loader';

interface BannedUsersPanelProps {
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface BannedUserCardProps {
  user: {
    number: string;
    blockedAt?: string;
  };
}

function BannedUserCard({ user }: BannedUserCardProps) {
  return (
    <div className="banned-user-card">
      <div className="user-info">
        <div className="user-avatar">
          <i className="fas fa-user-slash"></i>
        </div>
        <div className="user-details">
          <h3 className="user-number">+{user.number}</h3>
          <span className="user-status">
            <i className="fas fa-ban"></i>
            Blocked
          </span>
          {user.blockedAt && (
            <small style={{ color: 'var(--gray-light)', fontSize: '0.7rem' }}>
              Blocked: {new Date(user.blockedAt).toLocaleString()}
            </small>
          )}
        </div>
      </div>
      <div className="user-actions">
        <div className="contact-admin">
          <small style={{ color: 'var(--gray-light)', fontSize: '0.7rem' }}>
            Contact admin to unblock
          </small>
        </div>
      </div>
    </div>
  );
}

export function BannedUsersPanel({ showToast }: BannedUsersPanelProps) {
  const { bannedUsers, loading, error, refreshBanlist, bannedCount } = useBanlist({
    showToast
  });

  if (loading) {
    return (
      <section className="card" id="banned-users-section">
        <div className="card-header">
          <h2><i className="fas fa-user-slash"></i> Banned Users</h2>
          <div className="card-actions">
            <button className="btn btn-secondary" disabled>
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>
        <div className="card-content">
          <Loader message="Loading banned users..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card" id="banned-users-section">
        <div className="card-header">
          <h2><i className="fas fa-user-slash"></i> Banned Users</h2>
          <div className="card-actions">
            <button onClick={refreshBanlist} className="btn btn-secondary">
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>
        <div className="card-content">
          <div className="error-state">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Failed to Load Banlist</h3>
            <p>{error}</p>
            <button onClick={refreshBanlist} className="btn btn-primary">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card" id="banned-users-section">
      <div className="card-header">
        <h2><i className="fas fa-user-slash"></i> Banned Users</h2>
        <div className="card-actions">
          <button onClick={refreshBanlist} className="btn btn-secondary">
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>
      <div className="card-content">
        {bannedCount === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>No Banned Users</h3>
            <p>No users are currently banned.</p>
          </div>
        ) : (
          <>
            <div className="banlist-grid">
              {bannedUsers.map(user => (
                <BannedUserCard
                  key={user.number}
                  user={user}
                />
              ))}
            </div>
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-label">Total Banned:</span>
                <span className="stat-value">{bannedCount}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}