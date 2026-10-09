import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  ShieldCheck, 
  Calendar, 
  CheckSquare, 
  ArrowRight,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { applicationsApi, jobsApi, interviewsApi } from '../api/client';
import CandidateDetailModal from '../components/CandidateDetailModal';
import ValidationModal from '../components/ValidationModal';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import EmptyState from '../components/EmptyState';
import { SkeletonCards, SkeletonTable } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';

export default function PipelinePage() {
  const [searchParams] = useSearchParams();
  const urlJobId = searchParams.get('jobId') || '';
  const urlStatus = searchParams.get('status') || '';

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(urlJobId);
  const [selectedStatus, setSelectedStatus] = useState(urlStatus);
  const [scoreFilter, setScoreFilter] = useState('');
  const [minExp, setMinExp] = useState('');
  const [sortBy, setSortBy] = useState('score-desc');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  useEffect(() => {
    if (urlJobId) setSelectedJobId(urlJobId);
    if (urlStatus) setSelectedStatus(urlStatus);
  }, [urlJobId, urlStatus]);

  // Modals state
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [validationApp, setValidationApp] = useState(null);
  const [scheduleApp, setScheduleApp] = useState(null);

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkTargetStatus, setBulkTargetStatus] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        search,
        jobId: selectedJobId || undefined,
        status: selectedStatus || undefined,
        minExp: minExp || undefined
      };
      const res = await applicationsApi.getApplications(params);
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobsApi.getJobs();
        if (res.data.success) {
          setJobs(res.data.jobs || []);
        }
      } catch (e) {
        console.error('Failed to fetch jobs for filter:', e);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedJobId, selectedStatus, minExp]);

  // Client-side score filter & sorting
  const processedApplications = applications.filter((app) => {
    if (scoreFilter === 'high' && app.score < 80) return false;
    if (scoreFilter === 'mid' && (app.score < 60 || app.score >= 80)) return false;
    if (scoreFilter === 'low' && app.score >= 60) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score-desc') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'score-asc') return (a.score || 0) - (b.score || 0);
    if (sortBy === 'exp-desc') return (b.candidate?.yearsOfExperience || 0) - (a.candidate?.yearsOfExperience || 0);
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const handleBulkUpdate = async () => {
    if (!bulkTargetStatus || selectedIds.length === 0) return;
    try {
      setBulkProcessing(true);
      await applicationsApi.bulkUpdateStatus(
        selectedIds,
        bulkTargetStatus,
        `Bulk moved to ${bulkTargetStatus}`
      );
      toast.success(`Successfully transitioned ${selectedIds.length} candidate applications to ${bulkTargetStatus}.`);
      setSelectedIds([]);
      setBulkTargetStatus('');
      await fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Bulk update failed');
    } finally {
      setBulkProcessing(false);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(processedApplications.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectId = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedJobId('');
    setSelectedStatus('');
    setScoreFilter('');
    setMinExp('');
    setSortBy('score-desc');
  };

  const formatAge = (dateString) => {
    if (!dateString) return 'recently';
    const diff = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1d ago';
    return `${diff}d ago`;
  };

  // 9 Explicit Kanban Columns as required
  const kanbanColumns = [
    { key: 'APPLIED', title: 'Applied', color: '#6366f1' },
    { key: 'SCREENING', title: 'Screening', color: '#8b5cf6' },
    { key: 'VALIDATED', title: 'Validated', color: '#06b6d4' },
    { key: 'SHORTLISTED', title: 'Shortlisted', color: '#3b82f6' },
    { key: 'INTERVIEW_SCHEDULED', title: 'Interview Scheduled', color: '#f59e0b' },
    { key: 'INTERVIEW_COMPLETED', title: 'Interview Completed', color: '#10b981' },
    { key: 'SELECTED', title: 'Selected', color: '#059669' },
    { key: 'REJECTED', title: 'Rejected', color: '#ef4444' },
    { key: 'HOLD', title: 'Hold', color: '#eab308' },
  ];

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            Recruitment Kanban Pipeline
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            State machine governed pipeline: 9 audit stages, explainable match ratings, and bulk transitions.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.78125rem',
              fontWeight: 600,
              background: viewMode === 'kanban' ? 'var(--primary-subtle)' : 'transparent',
              color: viewMode === 'kanban' ? 'var(--primary-text)' : 'var(--text-muted)',
              border: viewMode === 'kanban' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.78125rem',
              fontWeight: 600,
              background: viewMode === 'table' ? 'var(--primary-subtle)' : 'transparent',
              color: viewMode === 'table' ? 'var(--primary-text)' : 'var(--text-muted)',
              border: viewMode === 'table' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <TableIcon size={14} /> Data Table
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
            placeholder="Search candidate by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Job Requisition Filter */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            className="select-field"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">All Requisitions ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ flex: '0 1 160px' }}>
          <select
            className="select-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All 9 Stages</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="VALIDATED">Validated</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEW_COMPLETED">Interview Completed</option>
            <option value="SELECTED">Selected</option>
            <option value="HOLD">Hold</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Score Filter */}
        <div style={{ flex: '0 1 140px' }}>
          <select
            className="select-field"
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
          >
            <option value="">All Scores</option>
            <option value="high">Score 80+ (Strong)</option>
            <option value="mid">Score 60-79 (Mid)</option>
            <option value="low">Score &lt; 60 (Low)</option>
          </select>
        </div>

        {/* Experience Filter */}
        <div style={{ flex: '0 1 140px' }}>
          <select
            className="select-field"
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
          >
            <option value="">Min Experience</option>
            <option value="1">1+ Years</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
            <option value="8">8+ Years</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div style={{ flex: '0 1 160px' }}>
          <select
            className="select-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="score-desc">Score: High to Low</option>
            <option value="score-asc">Score: Low to High</option>
            <option value="exp-desc">Experience: High to Low</option>
            <option value="newest">Recently Applied</option>
          </select>
        </div>

        {(search || selectedJobId || selectedStatus || scoreFilter || minExp) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={clearFilters}
            style={{ fontSize: '0.75rem' }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          padding: '0.65rem 1.25rem',
          background: 'var(--primary-subtle)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-text)' }}>
            {selectedIds.length} candidate application{selectedIds.length !== 1 ? 's' : ''} selected
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="select-field"
              style={{ fontSize: '0.75rem', width: 'auto', padding: '0.3rem 0.6rem' }}
              value={bulkTargetStatus}
              onChange={(e) => setBulkTargetStatus(e.target.value)}
            >
              <option value="">Bulk Transition To Stage...</option>
              <option value="SCREENING">Screening</option>
              <option value="VALIDATED">Validated</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="HOLD">Hold</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleBulkUpdate}
              disabled={!bulkTargetStatus || bulkProcessing}
            >
              {bulkProcessing ? 'Processing...' : 'Apply Transition'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <SkeletonCards count={4} />
      ) : processedApplications.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No candidates match your pipeline filters"
          description="Adjust your search, experience, or requisition filters to view candidates."
          actionText="Reset All Filters"
          onAction={clearFilters}
        />
      ) : viewMode === 'kanban' ? (
        /* VIEW 1: 9-COLUMN KANBAN BOARD */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, minmax(260px, 1fr))',
          gap: '0.85rem',
          overflowX: 'auto',
          paddingBottom: '1.5rem',
          alignItems: 'start'
        }}>
          {kanbanColumns.map((col) => {
            const colApps = processedApplications.filter(a => a.status === col.key);

            return (
              <div
                key={col.key}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 270px)',
                  minWidth: '260px'
                }}
              >
                {/* Column Header */}
                <div style={{
                  padding: '0.75rem 0.85rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${col.color}`,
                  borderTopLeftRadius: 'var(--radius-md)',
                  borderTopRightRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#fff' }}>{col.title}</span>
                  </div>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-muted)',
                    fontFamily: 'ui-monospace, monospace'
                  }}>
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards Feed */}
                <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto' }}>
                  {colApps.length === 0 ? (
                    <div style={{ padding: '2rem 0.5rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.75rem' }}>
                      No candidates in this stage
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="card-panel"
                        style={{
                          padding: '0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          background: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          transition: 'all var(--transition-fast)'
                        }}
                        onClick={() => setSelectedAppId(app.id)}
                      >
                        {/* Top: Name & Score */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                            {app.candidate?.firstName} {app.candidate?.lastName}
                          </span>
                          <span style={{
                            fontFamily: 'ui-monospace, monospace',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)',
                            background: app.score >= 80 ? 'var(--success-subtle)' : app.score >= 60 ? 'var(--warning-subtle)' : 'rgba(255, 255, 255, 0.05)',
                            color: app.score >= 80 ? 'var(--success-text)' : app.score >= 60 ? 'var(--warning-text)' : 'var(--text-muted)',
                            border: `1px solid ${app.score >= 80 ? 'var(--success-border)' : app.score >= 60 ? 'var(--warning-border)' : 'var(--border-subtle)'}`
                          }}>
                            {app.score}
                          </span>
                        </div>

                        {/* Applied Role */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {app.job?.title || 'Engineer'}
                        </div>

                        {/* Experience & Application Age */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-subtle)', marginBottom: '0.45rem' }}>
                          <span>{app.candidate?.yearsOfExperience || 1} yrs exp</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={11} /> {formatAge(app.appliedAt || app.createdAt)}
                          </span>
                        </div>

                        {/* Skills Chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginBottom: '0.55rem' }}>
                          {app.candidate?.skills?.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              style={{
                                fontSize: '0.625rem',
                                padding: '1px 5px',
                                borderRadius: 'var(--radius-xs)',
                                background: 'var(--primary-subtle)',
                                color: 'var(--primary-text)'
                              }}
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>

                        {/* Card Quick Action Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
                          <span className={`status-badge ${app.status.toLowerCase()}`} style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                            {app.status.replace(/_/g, ' ')}
                          </span>

                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 5px', fontSize: '0.68rem' }}
                              title="Verify Screening Checklist"
                              onClick={(e) => {
                                e.stopPropagation();
                                setValidationApp(app);
                              }}
                            >
                              <ShieldCheck size={12} color="var(--info-text)" />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 5px', fontSize: '0.68rem' }}
                              title="Schedule Interview Round"
                              onClick={(e) => {
                                e.stopPropagation();
                                setScheduleApp(app);
                              }}
                            >
                              <Calendar size={12} color="var(--warning-text)" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: DATA TABLE */
        <div className="card-panel data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}>
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={selectedIds.length === processedApplications.length && processedApplications.length > 0}
                  />
                </th>
                <th>Candidate</th>
                <th>Target Requisition</th>
                <th>Experience</th>
                <th>Score</th>
                <th>Stage</th>
                <th>Age</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedApplications.map((app) => (
                <tr key={app.id}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app.id)}
                      onChange={() => toggleSelectId(app.id)}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>
                      {app.candidate?.firstName} {app.candidate?.lastName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {app.candidate?.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ color: '#fff', fontWeight: 500 }}>{app.job?.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{app.job?.department}</div>
                  </td>
                  <td>
                    <div style={{ color: '#fff' }}>{app.candidate?.yearsOfExperience} yrs</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{app.candidate?.educationLevel}</div>
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatAge(app.appliedAt || app.createdAt)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        onClick={() => setSelectedAppId(app.id)}
                      >
                        <Eye size={12} /> Dossier
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        onClick={() => setValidationApp(app)}
                      >
                        <ShieldCheck size={12} color="var(--info-text)" />
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        onClick={() => setScheduleApp(app)}
                      >
                        <Calendar size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate Dossier Modal */}
      {selectedAppId && (
        <CandidateDetailModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onStatusChange={fetchApplications}
          onOpenValidation={(app) => setValidationApp(app)}
          onScheduleInterview={(app) => setScheduleApp(app)}
        />
      )}

      {/* Validation Checklist Modal */}
      {validationApp && (
        <ValidationModal
          application={validationApp}
          onClose={() => setValidationApp(null)}
          onValidate={async (payload) => {
            await applicationsApi.validateApplication(validationApp.id, payload);
            await fetchApplications();
          }}
        />
      )}

      {/* Schedule Interview Modal */}
      {scheduleApp && (
        <ScheduleInterviewModal
          application={scheduleApp}
          onClose={() => setScheduleApp(null)}
          onSchedule={async (formData) => {
            await interviewsApi.scheduleInterview(formData);
            await fetchApplications();
          }}
        />
      )}
    </div>
  );
}
