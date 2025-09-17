
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
'use client';

import { useSessions } from '../hooks/useSessions';
import { Loader } from './Loader';

interface SessionsListProps {
  showToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function SessionsList({ showToast }: SessionsListProps) {
  const { sessions, isLoading, error, refetch } = useSessions();

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Success', 'Session deleted successfully', 'success');
        refetch();
      } else {
        showToast('Error', data.error || 'Failed to delete session', 'error');
      }
    } catch (error) {
      showToast('Error', 'Network error occurred', 'error');
    }
  };

  if (isLoading) {
    return <Loader message="Loading sessions..." />;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Failed to Load Sessions</h3>
          <p>{error}</p>
          <button onClick={refetch} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="sessions-section">
      <div className="card">
        <div className="card-header">
          <span className="card-icon">📊</span>
          <div>
            <h2>Active Sessions</h2>
            <p>Manage your WhatsApp bot sessions</p>
          </div>
          <button onClick={refetch} className="btn btn-secondary btn-sm">
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>

        {!sessions || Object.keys(sessions).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Active Sessions</h3>
            <p>Pair a phone number to create your first session</p>
          </div>
        ) : (
          <div className="sessions-grid">
            {Object.entries(sessions).map(([sessionId, session]: [string, any]) => (
              <div key={sessionId} className="session-card-transparent">
                <div className="session-info">
                  <div className="session-number">{sessionId}</div>
                  <div className="session-status">
                    <span className="status-indicator">🟢</span>
                    Active
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSession(sessionId)}
                  className="btn btn-danger btn-sm"
                  title="Delete Session"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
