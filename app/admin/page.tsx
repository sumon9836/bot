'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import { Loader } from '../../components/Loader';
import { useSessions } from '../../hooks/useSessions';

interface BlockedUser {
  number: string;
  blockedAt?: string;
}

interface DashboardStats {
  totalSessions: number;
  blockedUsers: number;
  activeConnections: number;
  serverStatus: 'online' | 'offline' | 'error';
}

export default function AdminDashboard() {
  const [blockNumber, setBlockNumber] = useState('');
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    blockedUsers: 0,
    activeConnections: 0,
    serverStatus: 'online'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  const { sessions, sessionsCount, refreshSessions } = useSessions({ showToast, autoRefresh: true });

  // Prevent hydration issues by only showing time after mount
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Update stats when sessions or blocked users change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalSessions: sessionsCount,
      blockedUsers: blockedUsers.length,
      activeConnections: sessionsCount,
      serverStatus: 'online'
    }));
  }, [sessionsCount, blockedUsers.length]);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/blocklist', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        console.log('Authentication failed, redirecting to login');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        loadBlockedUsers();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/login';
      return;
    }
  };

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/blocklist', {
        credentials: 'include'
      });

      if (!response.ok) {
        setBlockedUsers([]);
        return;
      }

      const responseText = await response.text();
      
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        setBlockedUsers([]);
        return;
      }

      try {
        const data = JSON.parse(responseText);
        
        let userList: BlockedUser[] = [];
        if (typeof data === 'object' && data !== null) {
          userList = Object.keys(data).map(number => ({
            number,
            blockedAt: data[number].blockedAt || new Date().toISOString()
          }));
        }
        
        setBlockedUsers(userList);
      } catch {
        setBlockedUsers([]);
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
      setBlockedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(number.trim());
  };

  const formatPhoneNumber = (number: string) => {
    return number.trim().replace(/\D/g, '');
  };

  const handleAction = async (action: 'block' | 'unblock' | 'delete') => {
    const number = formatPhoneNumber(blockNumber);
    
    if (!validatePhoneNumber(number)) {
      showToast('Invalid Number', 'Please enter a valid phone number (10-15 digits)', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify({ number })
      });

      if (response.status === 401 || response.status === 403) {
        showToast('Authentication Failed', 'Please log in again', 'error');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        const messages = {
          block: 'User blocked successfully',
          unblock: 'User unblocked successfully', 
          delete: 'User deleted/logged out successfully'
        };
        
        showToast('Success', messages[action], 'success');
        setBlockNumber('');
        loadBlockedUsers();
      } else {
        showToast('Action Failed', data.error || `Failed to ${action} user`, 'error');
      }
    } catch (error) {
      showToast('Network Error', 'Failed to connect to server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblockUser = async (number: string) => {
    try {
      const response = await fetch('/api/admin/unblock', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify({ number })
      });

      if (response.status === 401 || response.status === 403) {
        showToast('Authentication Failed', 'Please log in again', 'error');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Success', 'User unblocked successfully', 'success');
        loadBlockedUsers();
      } else {
        showToast('Unblock Failed', data.error || 'Failed to unblock user', 'error');
      }
    } catch (error) {
      showToast('Network Error', 'Failed to connect to server', 'error');
    }
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="brand">
            <div className="logo">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="brand-text">
              <h1>𝐊ąìʂҽղ-𝐌𝐃</h1>
              <span>Admin Dashboard</span>
            </div>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link">
              <i className="fas fa-home"></i>
              Main Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Dashboard Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users" style={{color: 'var(--blue-primary)'}}></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalSessions}</h3>
              <p>Active Sessions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-ban" style={{color: 'var(--pink-primary)'}}></i>
            </div>
            <div className="stat-content">
              <h3>{stats.blockedUsers}</h3>
              <p>Blocked Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-signal" style={{color: 'var(--green-primary, #10b981)'}}></i>
            </div>
            <div className="stat-content">
              <h3>{stats.activeConnections}</h3>
              <p>Connections</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-server" style={{color: stats.serverStatus === 'online' ? 'var(--green-primary, #10b981)' : 'var(--red-primary, #ef4444)'}}></i>
            </div>
            <div className="stat-content">
              <h3 style={{textTransform: 'capitalize', color: stats.serverStatus === 'online' ? 'var(--green-primary, #10b981)' : 'var(--red-primary, #ef4444)'}}>{stats.serverStatus}</h3>
              <p>Server Status</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="card">
          <div className="card-header">
            <h2><i className="fas fa-tachometer-alt"></i> Quick Actions</h2>
            <p>Server Time: {mounted && currentTime ? currentTime.toLocaleTimeString() : '--:--:--'}</p>
          </div>
          <div className="card-content">
            <div className="quick-actions">
              <button className="btn btn-info" onClick={refreshSessions}>
                <i className="fas fa-sync-alt"></i>
                Refresh Sessions
              </button>
              <button className="btn btn-primary" onClick={loadBlockedUsers}>
                <i className="fas fa-shield-alt"></i>
                Reload Blocklist
              </button>
              <button className="btn btn-warning" onClick={() => window.location.reload()}>
                <i className="fas fa-redo"></i>
                Full Refresh
              </button>
              <a href="/" className="btn btn-secondary">
                <i className="fas fa-home"></i>
                Main Dashboard
              </a>
            </div>
          </div>
        </section>

        {/* Block Management Section */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2><i className="fas fa-ban"></i> Block Management</h2>
              <p>Block or unblock users from using the bot</p>
            </div>
          </div>
          <div className="card-content">
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <label htmlFor="blockNumber">
                  <i className="fab fa-whatsapp"></i>
                  Phone Number
                </label>
                <input 
                  type="text" 
                  id="blockNumber"
                  value={blockNumber}
                  onChange={(e) => setBlockNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter phone number (e.g., 917003816486)" 
                  maxLength={15}
                  pattern="[0-9]{10,15}"
                  required
                />
                <small>Enter phone number without country code prefix (+) or spaces</small>
              </div>
              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-danger" 
                  onClick={() => handleAction('block')}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-ban"></i>
                  {isSubmitting ? 'Processing...' : 'Block User'}
                </button>
                <button 
                  type="button"
                  className="btn btn-warning"
                  onClick={() => handleAction('delete')}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Force Logout
                </button>
                <button 
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleAction('unblock')}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-unlock"></i>
                  Unblock User
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Blocked Users List */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2><i className="fas fa-list"></i> Blocked Users</h2>
            </div>
            <div className="card-actions">
              <button onClick={loadBlockedUsers} className="btn btn-info">
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          </div>
          <div className="card-content">
            {loading ? (
              <Loader message="Loading blocked users..." />
            ) : blockedUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-users-slash"></i>
                </div>
                <h3>No Blocked Users</h3>
                <p>No users are currently blocked.</p>
              </div>
            ) : (
              <>
                <div className="blocklist-grid">
                  {blockedUsers.map(user => (
                    <div key={user.number} className="blocked-user-card">
                      <div className="user-info">
                        <div className="user-avatar">
                          <i className="fas fa-user-slash"></i>
                        </div>
                        <div className="user-details">
                          <h3 className="user-number">+{user.number}</h3>
                          <span className="user-status">
                            <i className="fas fa-ban"></i>
                            Blocked
                          </span>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleUnblockUser(user.number)}
                        >
                          <i className="fas fa-unlock"></i>
                          Unblock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="stats-summary">
                  <div className="stat-item">
                    <span className="stat-label">Total Blocked:</span>
                    <span className="stat-value">{blockedUsers.length}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}