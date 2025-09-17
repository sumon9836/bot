
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
        {user.blockedAt ? new Date(user.blockedAt).toLocaleDateString() : 'Recently blocked'}
      </div>
    </div>
  );
}

export function BannedUsersPanel({ showToast }: BannedUsersPanelProps) {
  const { bannedUsers, loading, error, refresh } = useBanlist({ showToast });

  if (loading) {
    return (
      <div className="card admin-card">
        <div className="card-header">
          <i className="fas fa-ban card-icon"></i>
          <h2>Banned Users</h2>
        </div>
        <div className="card-content">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card admin-card">
        <div className="card-header">
          <i className="fas fa-ban card-icon"></i>
          <h2>Banned Users</h2>
        </div>
        <div className="card-content">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
          <button onClick={refresh} className="btn btn-secondary">
            <i className="fas fa-sync-alt"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card admin-card">
      <div className="card-header">
        <i className="fas fa-ban card-icon"></i>
        <h2>Banned Users ({bannedUsers.length})</h2>
        <button 
          onClick={refresh}
          className="btn btn-secondary btn-small"
          title="Refresh banned users list"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      <div className="card-content">
        {bannedUsers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-shield-alt"></i>
            <p>No banned users</p>
            <small>All users are currently allowed to use the service</small>
          </div>
        ) : (
          <div className="banned-users-grid">
            {bannedUsers.map((user, index) => (
              <BannedUserCard key={`${user.number}-${index}`} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
