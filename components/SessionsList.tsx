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
          {session.status && <span className="session-status">{session.status}</span>}
          {session.platform && <span className="session-platform">{session.platform}</span>}
        </div>
        {session.lastSeen && (
          <div className="session-last-seen">Last seen: {new Date(session.lastSeen).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}

export function SessionsList({ showToast }: SessionsListProps) {
  const { sessions, loading, error, refresh } = useSessions({ showToast });

  if (loading) {
    return (
      <div className="card action-card">
        <div className="card-header">
          <i className="fas fa-mobile-alt card-icon"></i>
          <h2>Active Sessions</h2>
        </div>
        <div className="card-content">
          <Loader message="Loading active sessions..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card action-card">
        <div className="card-header">
          <i className="fas fa-mobile-alt card-icon"></i>
          <h2>Active Sessions</h2>
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

  return (
    <div className="card action-card">
      <div className="card-header">
        <i className="fas fa-mobile-alt card-icon"></i>
        <h2>Active Sessions</h2>
        <span className="sessions-count">{sessions.length}</span>
      </div>
      <div className="card-content">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-mobile-alt"></i>
            <p>No active sessions found</p>
            <small>Paired devices will appear here</small>
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