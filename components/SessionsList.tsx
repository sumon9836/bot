'use client';

import { useSessions } from '../hooks/useSessions';
import { Loader } from './Loader';

interface SessionsListProps {
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface SessionCardProps {
  session: {
    id: string;
    number: string;
    status?: string;
    lastSeen?: string;
    platform?: string;
    user?: string;
  };
}

function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="session-card-transparent">
      <div className="session-info">
        <div className="session-number">+{session.number}</div>
        <div className="session-details">
          <span className="session-status">
            <i className={`fas fa-circle ${session.status === 'online' ? 'status-online' : 'status-offline'}`}></i>
            {session.status || 'Unknown'}
          </span>
          {session.platform && (
            <span className="session-platform">
              <i className="fas fa-mobile-alt"></i>
              {session.platform}
            </span>
          )}
        </div>
      </div>
      {session.lastSeen && (
        <div className="session-last-seen">
          Last seen: {new Date(session.lastSeen).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export function SessionsList({ showToast }: SessionsListProps) {
  const { sessions, loading, error, refresh } = useSessions({ showToast });

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <i className="fas fa-mobile-alt card-icon"></i>
          <h2>Active Sessions</h2>
        </div>
        <div className="card-content">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <i className="fas fa-mobile-alt card-icon"></i>
          <h2>Active Sessions</h2>
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
    <div className="card">
      <div className="card-header">
        <i className="fas fa-mobile-alt card-icon"></i>
        <h2>Active Sessions ({sessions.length})</h2>
        <button 
          onClick={refresh}
          className="btn btn-secondary btn-small"
          title="Refresh sessions"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      <div className="card-content">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-mobile-alt"></i>
            <p>No active sessions</p>
            <small>Pair a number to create your first session</small>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}