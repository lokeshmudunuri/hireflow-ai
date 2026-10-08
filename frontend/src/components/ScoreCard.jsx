import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Code2, 
  FolderGit2, 
  Award, 
  CheckCircle, 
  RefreshCw,
  Info
} from 'lucide-react';

export default function ScoreCard({ score = 0, breakdown = {}, onRecalculate, loading }) {
  const getScoreStyle = (val) => {
    if (val >= 80) return { color: 'var(--success-text)', bg: 'var(--success-subtle)', border: 'var(--success-border)', label: 'Strong Match' };
    if (val >= 60) return { color: 'var(--warning-text)', bg: 'var(--warning-subtle)', border: 'var(--warning-border)', label: 'Moderate Match' };
    return { color: 'var(--danger-text)', bg: 'var(--danger-subtle)', border: 'var(--danger-border)', label: 'Prerequisite Gap' };
  };

  const status = getScoreStyle(score);

  const categories = [
    { key: 'education', label: 'Education & Degree', max: 20, icon: GraduationCap, color: '#818cf8' },
    { key: 'experience', label: 'Experience Threshold', max: 20, icon: Briefcase, color: '#38bdf8' },
    { key: 'skills', label: 'Required Skills Match', max: 20, icon: Code2, color: '#a78bfa' },
    { key: 'projects', label: 'Verified Projects', max: 20, icon: FolderGit2, color: '#34d399' },
    { key: 'certifications', label: 'Certifications', max: 10, icon: Award, color: '#fbbf24' },
    { key: 'completeness', label: 'Profile Completeness', max: 10, icon: CheckCircle, color: '#f472b6' },
  ];

  return (
    <div className="card-panel" style={{ padding: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.04em' }}>
              Screening Engine
            </span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
            Candidate Match Score
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onRecalculate && (
            <button
              onClick={onRecalculate}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              title="Recalculate deterministic scoring rules"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Recalculating...' : 'Recalculate'}</span>
            </button>
          )}

          {/* Large Clean Score Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.25rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: status.bg,
            border: `1px solid ${status.border}`,
            color: status.color,
            fontFamily: 'ui-monospace, monospace'
          }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{score}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Explicit Deterministic Engine Note */}
      <div style={{
        padding: '0.55rem 0.75rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <Info size={14} color="var(--primary-text)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Deterministic rule-based scoring:</strong> Evaluated strictly against job prerequisites, skill overlap, and verified credentials — not an opaque AI model.
        </span>
      </div>

      {/* Criteria Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {categories.map((cat) => {
          const item = breakdown?.[cat.key] || { score: 0, max: cat.max, details: 'Evaluating...' };
          const percent = Math.min(100, Math.round(((item.score || 0) / cat.max) * 100));

          return (
            <div
              key={cat.key}
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.8rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <cat.icon size={14} color={cat.color} />
                  <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: '#fff' }}>
                    {cat.label}
                  </span>
                </div>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ color: cat.color }}>{item.score || 0}</span>
                  <span style={{ color: 'var(--text-subtle)' }}>/{cat.max}</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="progress-track" style={{ height: '4px', marginBottom: '0.35rem' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${percent}%`,
                    background: cat.color
                  }}
                />
              </div>

              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.details}>
                {item.details || 'Rule evaluated'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
