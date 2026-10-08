import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home, Layers } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.08) 0%, var(--bg-app) 70%)',
    }}>
      <div className="card-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-modal)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--primary-subtle)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <Compass size={28} color="var(--primary-text)" />
        </div>

        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--primary-text)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.4rem',
        }}>
          404 — PAGE NOT FOUND
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Recruitment Route Unreachable
        </h1>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
          The applicant dossier, requisition URL, or workspace path you requested does not exist or has been relocated within the pipeline.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={15} /> Go Back
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            <Home size={15} /> Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
