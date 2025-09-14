
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
      <div className="session-number">+{session.number}</div>
      <div className="session-status">
        <i className="fas fa-circle" style={{ color: '#25D366' }}></i>
        Active
      </div>
    </div>
  );
}

export function SessionsList({ showToast }: SessionsListProps) {
  const { sessions, loading, error, refreshSessions, sessionsCount } = useSessions({
    showToast
  });

  if (loading) {
    return (
      <section className="card sessions-section">
        <div className="card-header">
          <h2><i className="fas fa-users"></i> Active Sessions</h2>
          <div className="card-actions">
            <div className="session-count">0 sessions</div>
          </div>
        </div>
        <div className="card-content">
          <Loader message="Loading sessions..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card sessions-section">
        <div className="card-header">
          <h2><i className="fas fa-users"></i> Active Sessions</h2>
          <div className="card-actions">
            <div className="session-count">0 sessions</div>
          </div>
        </div>
        <div className="card-content">
          <div className="error-state">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Failed to Load Sessions</h3>
            <p>{error}</p>
            <button onClick={refreshSessions} className="btn btn-primary">
              <i className="fas fa-redo"></i>
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card sessions-section">
      <div className="card-header">
        <h2><i className="fas fa-users"></i> Active Sessions</h2>
        <div className="card-actions">
          <div className="session-count">
            {sessionsCount} session{sessionsCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      <div className="card-content">
        {sessionsCount === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>No Active Sessions</h3>
            <p>No paired numbers found. Add a new number to get started.</p>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
