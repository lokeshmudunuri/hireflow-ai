import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  CheckCircle, 
  Star, 
  Award, 
  AlertCircle, 
  MessageSquare,
  Search,
  Filter,
  Eye,
  CalendarCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { interviewsApi, evaluationsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import EvaluationModal from '../components/EvaluationModal';
import CandidateDetailModal from '../components/CandidateDetailModal';
import EmptyState from '../components/EmptyState';
import { SkeletonCards } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'TODAY' | 'COMPLETED'
  const [search, setSearch] = useState('');
  const [evaluatingInterview, setEvaluatingInterview] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const { user } = useAuth();
  const toast = useToast();

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewsApi.getInterviews();
      if (res.data.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredInterviews = interviews.filter((inv) => {
    // Search
    if (search) {
      const q = search.toLowerCase();
      const candName = `${inv.application?.candidate?.firstName} ${inv.application?.candidate?.lastName}`.toLowerCase();
      const jobTitle = (inv.application?.job?.title || '').toLowerCase();
      const panelName = (inv.interviewer?.name || '').toLowerCase();
      if (!candName.includes(q) && !jobTitle.includes(q) && !panelName.includes(q)) {
        return false;
      }
    }

    // Role-specific check: if user is interviewer, show their interviews or all assigned
    if (user?.role === 'interviewer' && inv.interviewerId !== user.id) {
      // Still show if in dev, but can prioritize theirs
    }

    // Tab Filters
    if (activeTab === 'TODAY') {
      return inv.scheduledDate === todayStr && inv.status === 'SCHEDULED';
    }
    if (activeTab === 'UPCOMING') {
      return inv.status === 'SCHEDULED' && inv.scheduledDate >= todayStr;
    }
    if (activeTab === 'COMPLETED') {
      return inv.status === 'COMPLETED';
    }

    return true;
  });

  const todayCount = interviews.filter(i => i.scheduledDate === todayStr && i.status === 'SCHEDULED').length;
  const upcomingCount = interviews.filter(i => i.status === 'SCHEDULED' && i.scheduledDate >= todayStr).length;
  const completedCount = interviews.filter(i => i.status === 'COMPLETED').length;

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CalendarCheck size={24} color="#818cf8" />
            Interview Rounds & Evaluation Scorecards
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Coordinate technical panels, track scheduled rounds, and submit 5-competency evaluation scorecards.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            padding: '0.45rem 0.85rem',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78125rem',
            color: 'var(--text-secondary)'
          }}>
            Completed Scorecards: <strong style={{ color: 'var(--success-text)' }}>{completedCount}</strong>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'ALL', label: `All Rounds (${interviews.length})` },
            { id: 'UPCOMING', label: `Upcoming (${upcomingCount})` },
            { id: 'TODAY', label: `Today (${todayCount})` },
            { id: 'COMPLETED', label: `Completed (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.78125rem',
                fontWeight: 600,
                background: activeTab === tab.id ? 'var(--primary-subtle)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-text)' : 'var(--text-muted)',
                border: activeTab === tab.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search candidate, role, or panelist..."
            style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Interviews Grid */}
      {loading ? (
        <SkeletonCards count={4} />
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interview rounds found"
          description={search ? "No interviews match your search term." : "No interviews scheduled in this view."}
          actionText={search ? "Clear Search" : undefined}
          onAction={() => setSearch('')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {filteredInterviews.map((inv) => (
            <div
              key={inv.id}
              className="card-panel"
              style={{
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                borderLeft: inv.status === 'COMPLETED' ? '3px solid var(--success)' : '3px solid var(--warning)'
              }}
            >
              <div>
                {/* Header: Candidate & Round Type */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                      {inv.application?.candidate?.firstName} {inv.application?.candidate?.lastName}
                    </h3>
                    <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                      {inv.application?.job?.title || 'Engineering Role'}
                    </p>
                  </div>
                  <span className={`status-badge ${inv.status.toLowerCase()}`}>
                    {inv.status}
                  </span>
                </div>

                {/* Round Details Pill Container */}
                <div style={{
                  padding: '0.75rem 0.85rem',
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  fontSize: '0.78125rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fff', fontWeight: 600 }}>
                      <Calendar size={13} color="var(--warning-text)" />
                      {inv.scheduledDate} at {inv.scheduledTime}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'var(--primary-subtle)', color: 'var(--primary-text)', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                      {inv.interviewType} Round
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
                    <User size={13} color="#818cf8" />
                    <span>Panelist: <strong style={{ color: '#fff' }}>{inv.interviewer?.name}</strong></span>
                  </div>

                  {inv.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Video size={13} color="var(--info-text)" />
                      <a href={inv.location} target="_blank" rel="noreferrer" style={{ color: 'var(--info-text)', textDecoration: 'underline', fontSize: '0.75rem' }}>
                        Join Virtual Room (Google Meet)
                      </a>
                    </div>
                  )}
                </div>

                {/* Feedback Card if Completed */}
                {inv.feedback ? (
                  <div style={{
                    padding: '0.85rem',
                    background: 'var(--success-subtle)',
                    border: '1px solid var(--success-border)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78125rem', fontWeight: 700, color: 'var(--success-text)' }}>
                        Recommendation: {inv.feedback.recommendation}
                      </span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                        Score: {inv.feedback.overallScore}/10
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, fontStyle: 'italic' }}>
                      "{inv.feedback.comments}"
                    </p>
                  </div>
                ) : (
                  inv.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                      <strong>Interviewer Brief:</strong> {inv.notes}
                    </div>
                  )
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                {inv.application?.id && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                    onClick={() => setSelectedAppId(inv.application.id)}
                  >
                    <Eye size={12} /> Inspect Dossier
                  </button>
                )}

                {inv.status === 'SCHEDULED' && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.75rem' }}
                    onClick={() => setEvaluatingInterview(inv)}
                  >
                    <Star size={12} /> Submit Scorecard
                  </button>
                )}

                {inv.status === 'COMPLETED' && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle size={12} /> Evaluated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evaluation Scorecard Modal */}
      {evaluatingInterview && (
        <EvaluationModal
          interview={evaluatingInterview}
          onClose={() => setEvaluatingInterview(null)}
          onSubmitEvaluation={async (evaluationData) => {
            await evaluationsApi.submitEvaluation(evaluationData);
            toast.success('Interview evaluation scorecard submitted successfully.');
            await fetchInterviews();
          }}
        />
      )}

      {/* Candidate Detail Modal */}
      {selectedAppId && (
        <CandidateDetailModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onStatusChange={fetchInterviews}
        />
      )}
    </div>
  );
}
