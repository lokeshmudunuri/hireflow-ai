import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return {
          icon: <AlertCircle size={22} color="var(--danger-text)" />,
          btnClass: 'btn-danger',
          iconBg: 'var(--danger-subtle)',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={22} color="var(--warning-text)" />,
          btnClass: 'btn',
          btnStyle: { background: 'var(--warning)', color: '#000', borderColor: 'var(--warning)' },
          iconBg: 'var(--warning-subtle)',
        };
      default:
        return {
          icon: <CheckCircle2 size={22} color="var(--primary-text)" />,
          btnClass: 'btn-primary',
          iconBg: 'var(--primary-subtle)',
        };
    }
  };

  const { icon, btnClass, btnStyle, iconBg } = getVariantStyles();

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '460px' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-icon"
            style={{ padding: '4px', marginTop: '-4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.65rem',
          background: 'var(--bg-surface)',
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${btnClass}`}
            style={btnStyle}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
