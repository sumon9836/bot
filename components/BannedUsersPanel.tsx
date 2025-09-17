
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
        {user.blockedAt ? new Date(user.blockedAt).toLocaleDateString() : 'Unknown'}
      </div>
    </div>
  );
}

export function BannedUsersPanel({ showToast }: BannedUsersPanelProps) {
  const { bannedUsers, loading, error, refresh } = useBanlist({ showToast });

  if (loading) {
    return (
      <div className="card action-card">
        <div className="card-header">
          <i className="fas fa-user-slash card-icon"></i>
          <h2>Banned Users</h2>
        </div>
        <div className="card-content">
          <Loader message="Loading banned users..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card action-card">
        <div className="card-header">
          <i className="fas fa-user-slash card-icon"></i>
          <h2>Banned Users</h2>
        </div>
        <div className="card-content">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={refresh} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const usersList = Object.keys(bannedUsers || {}).map(number => ({
    number,
    blockedAt: bannedUsers[number]?.blockedAt
  }));

  return (
    <div className="card action-card">
      <div className="card-header">
        <i className="fas fa-user-slash card-icon"></i>
        <h2>Banned Users</h2>
        <span className="banned-count">{usersList.length}</span>
      </div>
      <div className="card-content">
        {usersList.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-check"></i>
            <p>No banned users</p>
            <small>All users have access to the service</small>
          </div>
        ) : (
          <div className="banned-users-grid">
            {usersList.map((user) => (
              <BannedUserCard key={user.number} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
