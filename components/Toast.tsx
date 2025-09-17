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
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-info-circle';
    }
  };

  return (
    <div 
      className={`toast toast-${toast.type}`}
      style={{
        marginBottom: '10px',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '400px',
        backgroundColor: toast.type === 'success' ? '#10B981' :
                        toast.type === 'error' ? '#EF4444' :
                        toast.type === 'warning' ? '#F59E0B' : '#3B82F6',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <i className={getTypeIcon(toast.type)}></i>
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {toast.title}
        </div>
        <div style={{ fontSize: '14px' }}>
          {toast.message}
        </div>
      </div>
      <button 
        onClick={() => onRemove(toast.id)}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ×
      </button>
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