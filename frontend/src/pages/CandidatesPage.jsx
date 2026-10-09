import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  Briefcase, 
  Eye, 
  ShieldCheck, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { candidatesApi, applicationsApi, jobsApi, interviewsApi } from '../api/client';
import CandidateDetailModal from '../components/CandidateDetailModal';
import ValidationModal from '../components/ValidationModal';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';

export default function CandidatesPage() {
  const [searchParams] = useSearchParams();
  const urlJobId = searchParams.get('jobId') || '';
  const urlStage = searchParams.get('stage') || '';

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(urlJobId);
  const [selectedStage, setSelectedStage] = useState(urlStage);
  const [sortBy, setSortBy] = useState('score-desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    if (urlJobId) setSelectedJobId(urlJobId);
    if (urlStage) setSelectedStage(urlStage);
  }, [urlJobId, urlStage]);

  // Modals
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [validationApplication, setValidationApplication] = useState(null);
  const [scheduleApplication, setScheduleApplication] = useState(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidatesApi.getCandidates({
        search,
        page,
        limit: 15
      });
      if (res.data.success) {
        setCandidates(res.data.candidates || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.getJobs();
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load jobs for filter:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, page]);

  // Client-side filtering & sorting across the returned batch
  const filteredCandidates = candidates.filter((c) => {
    const primaryApp = c.applications?.[0];
    if (selectedJobId && primaryApp?.jobId !== parseInt(selectedJobId, 10)) {
      return false;
    }
    if (selectedStage && primaryApp?.status !== selectedStage) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    const appA = a.applications?.[0];
    const appB = b.applications?.[0];
    if (sortBy === 'score-desc') return (appB?.score || 0) - (appA?.score || 0);
    if (sortBy === 'score-asc') return (appA?.score || 0) - (appB?.score || 0);
    if (sortBy === 'exp-desc') return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const handleValidationSubmit = async (payload) => {
    if (!validationApplication) return;
    try {
      await applicationsApi.validateApplication(validationApplication.id, payload);
      toast.success('Candidate screening verification successfully recorded.');
      setValidationApplication(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Validation error');
    }
  };

  const handleScheduleSubmit = async (payload) => {
    try {
      await interviewsApi.scheduleInterview(payload);
      toast.success('Interview round scheduled successfully.');
      setScheduleApplication(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Scheduling error');
    }
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title & Stats Overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Users size={24} color="#818cf8" />
            Candidate Talent Pool & Dossiers
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Audited recruitment records with verified skills, deterministic match scoring, and interview history.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.45rem 0.85rem',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78125rem',
            color: 'var(--text-secondary)'
          }}>
            Total Candidates: <strong style={{ color: '#fff' }}>{pagination.total}</strong>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by candidate name, email, location..."
              style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="select-field"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">All Requisitions ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            className="select-field"
            style={{ width: 'auto', minWidth: '160px' }}
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            <option value="">All Stages</option>
            <option value="APPLIED">Applied</option>
            <option value="SCREENING">Screening</option>
            <option value="VALIDATED">Validated</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEW_COMPLETED">Interview Completed</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
            <option value="HOLD">Hold</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
            <ArrowUpDown size={14} />
            <span>Sort:</span>
          </div>
          <select
            className="select-field"
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="score-desc">Score: High to Low</option>
            <option value="score-asc">Score: Low to High</option>
            <option value="exp-desc">Experience: Highest</option>
            <option value="newest">Recently Applied</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading/Empty States */}
      {loading ? (
        <SkeletonTable rows={8} />
      ) : filteredCandidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates match your criteria"
          description="Try broadening your search term or resetting the stage and requisition filters."
          actionText={search || selectedJobId || selectedStage ? "Clear Filters" : undefined}
          onAction={() => {
            setSearch('');
            setSelectedJobId('');
            setSelectedStage('');
          }}
        />
      ) : (
        <div className="data-table-wrapper card-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Profile</th>
                <th>Target Requisition</th>
                <th>Deterministic Score</th>
                <th>Experience</th>
                <th>Key Skills</th>
                <th>Current Stage</th>
                <th>Applied Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => {
                const primaryApp = candidate.applications?.[0];
                const score = primaryApp?.score ?? 0;
                const status = primaryApp?.status || 'APPLIED';

                return (
                  <tr key={candidate.id}>
                    {/* Candidate Name & Contact */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>
                          {candidate.firstName} {candidate.lastName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '2px' }}>
                          <span>{candidate.email}</span>
                          {candidate.location && <span>• {candidate.location}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Applied Role */}
                    <td>
                      <div style={{ color: '#fff', fontWeight: 500 }}>
                        {primaryApp?.job?.title || 'General Pool'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {primaryApp?.job?.department || 'Engineering'}
                      </div>
                    </td>

                    {/* Score Bar */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          fontFamily: 'ui-monospace, monospace',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: score >= 80 ? 'var(--success-text)' : score >= 60 ? 'var(--warning-text)' : 'var(--text-muted)',
                          minWidth: '26px'
                        }}>
                          {score}
                        </span>
                        <div className="progress-track" style={{ width: '60px' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${score}%`,
                              backgroundColor: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : '#64748b'
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Experience */}
                    <td>
                      <div style={{ color: '#fff', fontWeight: 500 }}>
                        {candidate.yearsOfExperience} yrs
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {candidate.educationLevel || 'Graduate'}
                      </div>
                    </td>

                    {/* Skills Chips */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '280px' }}>
                        {candidate.skills?.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            style={{
                              fontSize: '0.6875rem',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-xs)',
                              background: 'var(--primary-subtle)',
                              color: 'var(--primary-text)',
                              border: '1px solid rgba(99, 102, 241, 0.25)'
                            }}
                          >
                            {s.name}
                          </span>
                        ))}
                        {candidate.skills?.length > 3 && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', alignSelf: 'center' }}>
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stage Badge */}
                    <td>
                      <span className={`status-badge ${status.toLowerCase()}`}>
                        {status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td>
                      <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                        {new Date(primaryApp?.createdAt || candidate.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {primaryApp && (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Inspect Candidate Dossier"
                            onClick={() => setSelectedApplicationId(primaryApp.id)}
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem' }}
                          >
                            <Eye size={13} /> Dossier
                          </button>
                        )}

                        {primaryApp && (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Screening Verification"
                            onClick={() => setValidationApplication(primaryApp)}
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                          >
                            <ShieldCheck size={13} color="var(--info-text)" />
                          </button>
                        )}

                        {primaryApp && (
                          <button
                            className="btn btn-primary btn-sm"
                            title="Schedule Interview Round"
                            onClick={() => setScheduleApplication(primaryApp)}
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                          >
                            <Calendar size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
          <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total candidates)
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedApplicationId && (
        <CandidateDetailModal
          applicationId={selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
          onStatusChange={fetchCandidates}
          onOpenValidation={(app) => setValidationApplication(app)}
          onScheduleInterview={(app) => setScheduleApplication(app)}
        />
      )}

      {/* Validation Checklist Modal */}
      {validationApplication && (
        <ValidationModal
          application={validationApplication}
          onClose={() => setValidationApplication(null)}
          onValidate={handleValidationSubmit}
        />
      )}

      {/* Schedule Interview Modal */}
      {scheduleApplication && (
        <ScheduleInterviewModal
          application={scheduleApplication}
          onClose={() => setScheduleApplication(null)}
          onSchedule={handleScheduleSubmit}
        />
      )}
    </div>
  );
}
