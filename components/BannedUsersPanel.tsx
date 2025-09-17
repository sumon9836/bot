
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
  const { bannedUsers, loading, error, unblockUser } = useBanlist();

  const handleUnblock = async (number: string) => {
    try {
      await unblockUser(number);
      showToast?.('Success', `User ${number} has been unblocked`, 'success');
    } catch (error) {
      showToast?.('Error', 'Failed to unblock user', 'error');
    }
  };

  if (loading) {
    return (
      <section className="card banned-users-section">
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
      <section className="card banned-users-section">
        <div className="card-header">
          <h2><i className="fas fa-user-slash"></i> Banned Users</h2>
        </div>
        <div className="card-content">
          <div className="error-state">
            <p>Failed to load banned users: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card banned-users-section">
      <div className="card-header">
        <h2><i className="fas fa-user-slash"></i> Banned Users</h2>
        <div className="card-actions">
          <div className="session-count">
            {bannedUsers.length} banned user{bannedUsers.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      <div className="card-content">
        {bannedUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h3>No Banned Users</h3>
            <p>No users are currently banned from the system.</p>
          </div>
        ) : (
          <div className="banned-users-grid">
            {bannedUsers.map(user => (
              <div key={user.number} className="banned-user-item">
                <BannedUserCard user={user} />
                <button 
                  onClick={() => handleUnblock(user.number)}
                  className="btn btn-sm btn-outline"
                  title="Unblock User"
                >
                  <i className="fas fa-unlock"></i>
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
