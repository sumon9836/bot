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
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '12px',
        border: `2px solid ${getToastColor()}`,
        backdropFilter: 'blur(10px)',
        minWidth: '300px',
        maxWidth: '500px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ color: getToastColor(), fontSize: '18px', marginTop: '2px' }}>
          {getToastIcon()}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
            {toast.title}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.4' }}>
            {toast.message}
          </div>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
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