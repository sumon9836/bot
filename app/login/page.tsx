'use client';

import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      showToast('Error', 'Please enter the admin password', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: password.trim() })
      });

      if (response.ok) {
        // Login successful, redirect to admin
        window.location.href = '/admin';
      } else {
        const data = await response.json();
        showToast('Login Failed', data.error || 'Invalid password', 'error');
      }
    } catch (error) {
      showToast('Network Error', 'Failed to connect to server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <i className="fas fa-user-shield header-icon"></i>
            <div>
              <h1>𝐊ąìʂҽղ-𝐌𝐃</h1>
              <p className="header-subtitle">Admin Login</p>
            </div>
          </div>
          <div className="header-right">
            <a href="/" className="btn btn-secondary">
              <i className="fas fa-home"></i>
              Main Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="card-header">
            <h2><i className="fas fa-lock"></i> Admin Access</h2>
            <p>Enter your admin password to continue</p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="action-form">
              <div className="form-group">
                <label htmlFor="password">Admin Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-key input-icon"></i>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    autoComplete="current-password"
                    style={{ color: 'var(--blue-text)', fontSize: '16px' }}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%' }}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Login
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}