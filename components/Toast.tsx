
'use client';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  };

  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <div 
      className={`toast toast-${toast.type}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        border: `1px solid ${getToastColor()}`,
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <i 
          className={getToastIcon()} 
          style={{ 
            color: getToastColor(), 
            fontSize: '18px',
            marginTop: '2px'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ 
            color: '#FFFFFF', 
            fontWeight: '600', 
            marginBottom: '4px',
            fontSize: '14px'
          }}>
            {toast.title}
          </div>
          <div style={{ 
            color: '#D1D5DB', 
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            {toast.message}
          </div>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className="fas fa-times" />
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
