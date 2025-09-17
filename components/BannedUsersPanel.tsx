
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
      <button className="unblock-btn" title="Unblock User">
        <i className="fas fa-unlock"></i>
      </button>
    </div>
  );
}

export function BannedUsersPanel({ showToast }: BannedUsersPanelProps) {
  const { bannedUsers, loading, error, refreshBanlist } = useBanlist({
    showToast,
    autoRefresh: true
  });

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <i className="fas fa-ban card-icon"></i>
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
      <div className="card">
        <div className="card-header">
          <i className="fas fa-ban card-icon"></i>
          <h2>Banned Users</h2>
        </div>
        <div className="card-content">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Failed to load banned users: {error}</p>
            <button onClick={refreshBanlist} className="btn btn-primary">
              <i className="fas fa-redo"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <i className="fas fa-ban card-icon"></i>
        <h2>Banned Users</h2>
        <button 
          onClick={refreshBanlist}
          className="btn btn-secondary btn-sm"
          title="Refresh Banned Users"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      <div className="card-content">
        {bannedUsers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <p>No banned users</p>
            <small>All users are currently allowed to use the bot</small>
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
