
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
      <div className="session-header">
        <div className="session-info">
          <div className="session-number">+{session.number}</div>
          <div className="session-status">
            <span className={`status-indicator ${session.status?.toLowerCase() || 'offline'}`}></span>
            {session.status || 'Offline'}
          </div>
        </div>
        <div className="session-actions">
          <button className="btn btn-danger btn-sm" title="Delete Session">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div className="session-details">
        {session.platform && (
          <div className="detail-item">
            <i className="fas fa-mobile-alt"></i>
            <span>{session.platform}</span>
          </div>
        )}
        {session.lastSeen && (
          <div className="detail-item">
            <i className="fas fa-clock"></i>
            <span>Last seen: {new Date(session.lastSeen).toLocaleString()}</span>
          </div>
        )}
        {session.user && (
          <div className="detail-item">
            <i className="fas fa-user"></i>
            <span>{session.user}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SessionsList({ showToast }: SessionsListProps) {
  const { sessions, loading, error, refreshSessions } = useSessions({
    showToast,
    autoRefresh: true,
    pollingInterval: 30000
  });

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <i className="fas fa-list card-icon"></i>
          <h2>Active Sessions</h2>
        </div>
        <div className="card-content">
          <Loader message="Loading sessions..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <i className="fas fa-list card-icon"></i>
          <h2>Active Sessions</h2>
        </div>
        <div className="card-content">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Failed to load sessions: {error}</p>
            <button onClick={refreshSessions} className="btn btn-primary">
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
        <i className="fas fa-list card-icon"></i>
        <h2>Active Sessions</h2>
        <button 
          onClick={refreshSessions}
          className="btn btn-secondary btn-sm"
          title="Refresh Sessions"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      <div className="card-content">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>No active sessions found</p>
            <small>Pair a phone number to create a new session</small>
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
