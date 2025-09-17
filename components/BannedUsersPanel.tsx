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
    <div className="banned-user-card-compact">
      <div className="user-number">+{user.number}</div>
      <div className="blocked-date">
        {user.blockedAt ? new Date(user.blockedAt).toLocaleString() : 'Unknown date'}
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
'use client';

import { useBanlist } from '../hooks/useBanlist';
import { Loader } from './Loader';

interface BannedUsersPanelProps {
  showToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function BannedUsersPanel({ showToast }: BannedUsersPanelProps) {
  const { bannedUsers, isLoading, error, refetch } = useBanlist();

  if (isLoading) {
    return <Loader message="Loading banned users..." />;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Failed to Load Banned Users</h3>
          <p>{error}</p>
          <button onClick={refetch} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="banlist-section">
      <div className="card">
        <div className="card-header">
          <span className="card-icon">🚫</span>
          <div>
            <h2>Banned Users</h2>
            <p>Users restricted from using the service</p>
          </div>
          <button onClick={refetch} className="btn btn-secondary btn-sm">
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>

        {!bannedUsers || Object.keys(bannedUsers).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No Banned Users</h3>
            <p>No users are currently banned from the service</p>
          </div>
        ) : (
          <div className="banlist-grid">
            {Object.entries(bannedUsers).map(([phoneNumber, banInfo]: [string, any]) => (
              <div key={phoneNumber} className="banned-user-card-compact">
                <div className="user-info">
                  <div className="user-number">{phoneNumber}</div>
                  <div className="blocked-date">
                    {banInfo.date || 'Unknown date'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
