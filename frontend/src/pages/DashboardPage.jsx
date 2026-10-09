import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Briefcase, 
  ArrowUpRight, 
  TrendingUp,
  Award,
  XCircle,
  Eye,
  ChevronRight,
  Filter,
  BarChart2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/client';
import CandidateDetailModal from '../components/CandidateDetailModal';
import EmptyState from '../components/EmptyState';
import { SkeletonCards, SkeletonTable } from '../components/SkeletonLoader';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getStats();
      if (res.data.success) {
        setStats(res.data.data || res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Unable to connect to recruitment analytics services. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SkeletonCards count={6} />
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <EmptyState
          icon={AlertCircle}
          title="Recruitment Analytics Unavailable"
          description={error || "Could not retrieve recruitment metrics from the operational database."}
          actionText="Retry Connection"
          onAction={fetchStats}
        />
      </div>
    );
  }

  const { metrics, pipeline, scoreDistribution, recentApplications, upcomingInterviews } = stats;

  const kpis = [
    { 
      label: 'Total Applications', 
      value: metrics.totalApplications, 
      desc: 'Active candidate profiles', 
      trend: `${metrics.activeJobs || 0} active requisitions`, 
      icon: Users, 
      color: 'var(--primary)' 
    },
    { 
      label: 'In Screening', 
      value: metrics.pendingReview, 
      desc: 'Pending recruiter review', 
      trend: `${metrics.pendingReview || 0} requiring audit`, 
      icon: Clock, 
      color: 'var(--warning-text)' 
    },
    { 
      label: 'Shortlisted', 
      value: metrics.shortlisted, 
      desc: 'Passed initial screening', 
      trend: `${metrics.shortlisted || 0} ready for rounds`, 
      icon: CheckCircle2, 
      color: 'var(--info-text)' 
    },
    { 
      label: 'Interviews', 
      value: metrics.interviews, 
      desc: 'Scheduled & in evaluation', 
      trend: `${metrics.interviews || 0} active panels`, 
      icon: Calendar, 
      color: '#a855f7' 
    },
    { 
      label: 'Selected', 
      value: metrics.selected, 
      desc: 'Offer extended / hired', 
      trend: `${metrics.totalApplications > 0 ? Math.round((metrics.selected / metrics.totalApplications) * 100) : 0}% pipeline conversion`, 
      icon: Award, 
      color: 'var(--success-text)' 
    },
    { 
      label: 'Rejected', 
      value: metrics.rejected, 
      desc: 'Criteria not matched', 
      trend: `${metrics.rejected || 0} archived records`, 
      icon: XCircle, 
      color: 'var(--danger-text)' 
    },
  ];

  const pipelineStages = [
    { name: 'Applications', count: metrics.totalApplications, key: 'APPLIED', color: '#6366f1' },
    { name: 'Screening', count: metrics.pendingReview, key: 'SCREENING', color: '#8b5cf6' },
    { name: 'Validated', count: metrics.validated, key: 'VALIDATED', color: '#06b6d4' },
    { name: 'Shortlisted', count: metrics.shortlisted, key: 'SHORTLISTED', color: '#3b82f6' },
    { name: 'Interview', count: metrics.interviews, key: 'INTERVIEW', color: '#f59e0b' },
    { name: 'Selected', count: metrics.selected, key: 'SELECTED', color: '#10b981' }
  ];

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            Recruitment Operations Overview
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Audited funnel pipeline, score distributions, and real-time interview operations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jobs')}>
            <Briefcase size={14} /> Open Roles ({metrics.activeJobs})
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/pipeline')}>
            Recruitment Pipeline <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className="card-panel" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{kpi.label}</span>
              <kpi.icon size={16} color={kpi.color} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', fontFamily: 'ui-monospace, monospace', lineHeight: 1.15, marginBottom: '0.35rem' }}>
              {kpi.value}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
              <span style={{ color: 'var(--text-subtle)' }}>{kpi.desc}</span>
              <span style={{ color: kpi.color, fontWeight: 600 }}>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recruitment Pipeline Visual Funnel */}
      <div className="card-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Recruitment Pipeline Progression</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Applications → Screening → Validated → Shortlisted → Interview → Selected
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
          {pipelineStages.map((st, i) => (
            <div
              key={st.key}
              onClick={() => navigate(`/pipeline?status=${st.key === 'INTERVIEW' ? 'INTERVIEW_SCHEDULED' : st.key}`)}
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderTop: `3px solid ${st.color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                cursor: 'pointer',
                transition: 'transform var(--transition-fast)'
              }}
              title={`View ${st.name} candidates in pipeline`}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {st.name}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', fontFamily: 'ui-monospace, monospace' }}>
                {st.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Candidate Score Distribution & Upcoming Interviews */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* Candidate Score Distribution */}
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <BarChart2 size={16} color="var(--primary-text)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Candidate Match Score Distribution</h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Deterministic 100-Pt</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {Object.entries(scoreDistribution).map(([range, count]) => {
              const max = Math.max(...Object.values(scoreDistribution), 1);
              const pct = Math.round((count / max) * 100);
              let color = 'var(--success)';
              if (range.includes('60') || range.includes('75')) color = 'var(--primary)';
              if (range.includes('40')) color = 'var(--warning)';
              if (range.includes('0-39')) color = 'var(--danger)';

              return (
                <div key={range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>Score {range}</span>
                    <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-muted)' }}>
                      {count} candidate{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: '7px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={16} color="var(--warning-text)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Upcoming Interview Rounds</h3>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/interviews')} style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
              All Rounds
            </button>
          </div>

          {upcomingInterviews.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming interviews"
              description="No candidate interviews currently scheduled for today or tomorrow."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {upcomingInterviews.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>
                      {inv.application?.candidate?.firstName} {inv.application?.candidate?.lastName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {inv.application?.job?.title} • Panel: {inv.interviewer?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--warning-text)' }}>
                      {inv.scheduledDate}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                      {inv.scheduledTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="card-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Recent Applications Intake</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest applicant dossiers submitted through talent requisitions</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pipeline')}>
            View Kanban Pipeline <ChevronRight size={14} />
          </button>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Target Requisition</th>
                <th>Deterministic Score</th>
                <th>Current Stage</th>
                <th>Applied Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>
                      {app.candidate?.firstName} {app.candidate?.lastName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {app.candidate?.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ color: '#fff', fontWeight: 500 }}>{app.job?.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{app.job?.department}</div>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      color: app.score >= 80 ? 'var(--success-text)' : app.score >= 60 ? 'var(--warning-text)' : 'var(--text-muted)'
                    }}>
                      {app.score} / 100
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${app.status.toLowerCase()}`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                      onClick={() => setSelectedAppId(app.id)}
                    >
                      <Eye size={12} /> Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedAppId && (
        <CandidateDetailModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onStatusChange={fetchStats}
        />
      )}
    </div>
  );
}
