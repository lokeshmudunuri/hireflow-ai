import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = 'No records found', 
  description = 'There are currently no items matching your criteria.',
  actionLabel,
  actionText,
  onAction 
}) {
  const buttonLabel = actionLabel || actionText;
  return (
    <div style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--border-default)',
      margin: '1rem 0'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        marginBottom: '0.85rem'
      }}>
        <Icon size={22} />
      </div>

      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>
        {title}
      </h4>

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '380px', lineHeight: 1.4, marginBottom: buttonLabel ? '1rem' : 0 }}>
        {description}
      </p>

      {buttonLabel && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          <Plus size={14} /> {buttonLabel}
        </button>
      )}
    </div>
  );
}
