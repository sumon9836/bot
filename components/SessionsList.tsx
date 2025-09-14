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
    status: string;
    lastSeen?: string;
    platform?: string;
  };
  onDelete?: (number: string) => void;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

function SessionCard({ session, onDelete, showToast }: SessionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: session.number })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast?.('Success', 'Session deleted successfully', 'success');
        onDelete(session.number);
      } else {
        showToast?.('Delete Failed', data.error || 'Failed to delete session', 'error');
      }
    } catch (error) {
      showToast?.('Network Error', 'Failed to connect to server', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="session-card">
      <div className="user-info">
        <div className="user-avatar">
          <i className="fab fa-whatsapp"></i>
        </div>
        <div className="user-details">
          <h3 className="user-number">+{session.number}</h3>
          <span className="user-status">
            <i className="fas fa-circle" style={{ color: '#25D366' }}></i>
            {session.status || 'Active'}
          </span>
          {session.lastSeen && (
            <small style={{ color: 'var(--gray-light)', fontSize: '0.7rem' }}>
              Last seen: {new Date(session.lastSeen).toLocaleString()}
            </small>
          )}
        </div>
      </div>
      <div className="user-actions">
        <button 
          className="btn btn-sm btn-danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Deleting...
            </>
          ) : (
            <>
              <i className="fas fa-trash"></i>
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function SessionsList({ showToast }: SessionsListProps) {
  const { sessions, loading, error, refreshSessions, sessionsCount } = useSessions({
    showToast
  });

  const handleSessionDeleted = () => {
    refreshSessions();
  };

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
            <button onClick={refreshSessions} className="btn btn-primary">
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
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
          <button onClick={refreshSessions} className="btn btn-primary">
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
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
                onDelete={handleSessionDeleted}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Import React for useState
import { useState } from 'react';