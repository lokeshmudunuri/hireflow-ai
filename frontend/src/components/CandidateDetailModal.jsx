import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  Calendar, 
  MessageSquare, 
  Send, 
  Award, 
  FileText,
  Clock,
  ArrowRight,
  Download,
  CheckCircle,
  FileCode2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import ScoreCard from './ScoreCard';
import { applicationsApi, candidatesApi } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function CandidateDetailModal({ 
  applicationId, 
  onClose, 
  onStatusChange, 
  onOpenValidation, 
  onScheduleInterview 
}) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedTargetStatus, setSelectedTargetStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionChoice, setDecisionChoice] = useState('SELECTED');
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const toast = useToast();

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.getApplicationById(applicationId);
      if (res.data.success) {
        setApplication(res.data.application);
      }
    } catch (err) {
      console.error('Failed to load application:', err);
      toast.error('Unable to fetch candidate dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await applicationsApi.recalculateScore(applicationId);
      if (res.data.success) {
        setApplication(prev => ({
          ...prev,
          score: res.data.score,
          scoreBreakdown: res.data.scoreBreakdown
        }));
        toast.success(`Deterministic score recalculated: ${res.data.score}/100.`);
      }
    } catch (err) {
      toast.error('Failed to recalculate score: ' + err.message);
    } finally {
      setRecalculating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      await candidatesApi.addNote(application.candidateId, newNote.trim(), application.id);
      setNewNote('');
      toast.success('Recruiter note logged to dossier.');
      await fetchApplication();
    } catch (err) {
      toast.error('Failed to add note: ' + err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleTransition = async () => {
    if (!selectedTargetStatus) return;
    try {
      setUpdatingStatus(true);
      await applicationsApi.updateStatus(
        application.id, 
        selectedTargetStatus, 
        `Stage advanced to ${selectedTargetStatus}`
      );
      toast.success(`Application state advanced to ${selectedTargetStatus.replace(/_/g, ' ')}.`);
      setSelectedTargetStatus('');
      await fetchApplication();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Transition error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!decisionReason.trim()) return;
    try {
      setSubmittingDecision(true);
      await applicationsApi.makeFinalDecision(application.id, decisionChoice, decisionReason.trim());
      toast.success(`Hiring decision recorded: ${decisionChoice}.`);
      setShowDecisionModal(false);
      setDecisionReason('');
      await fetchApplication();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to record decision');
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="modal-overlay">
        <div className="modal-dialog" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading ATS Candidate Dossier...</div>
        </div>
      </div>
    );
  }

  const { candidate, job } = application;

  const transitionOptions = {
    APPLIED: ['SCREENING', 'VALIDATED', 'REJECTED', 'HOLD'],
    SCREENING: ['VALIDATED', 'SHORTLISTED', 'REJECTED', 'HOLD'],
    VALIDATED: ['SHORTLISTED', 'SCREENING', 'REJECTED', 'HOLD'],
    SHORTLISTED: ['INTERVIEW_SCHEDULED', 'VALIDATED', 'REJECTED', 'HOLD'],
    INTERVIEW_SCHEDULED: ['INTERVIEW_COMPLETED', 'SHORTLISTED', 'REJECTED', 'HOLD'],
    INTERVIEW_COMPLETED: ['SELECTED', 'REJECTED', 'HOLD', 'INTERVIEW_SCHEDULED'],
    HOLD: ['SCREENING', 'VALIDATED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'],
    REJECTED: ['SCREENING', 'HOLD'],
    SELECTED: ['HOLD']
  };

  const nextAllowed = transitionOptions[application.status] || [];

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '960px', height: '90vh' }}>
        {/* Dossier Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                {candidate.firstName} {candidate.lastName}
              </h2>
              <span className={`status-badge ${application.status.toLowerCase()}`}>
                {application.status.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                Target: {job?.title}
              </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              {candidate.headline || `${candidate.currentTitle || 'Engineer'} at ${candidate.currentCompany || 'Technology'}`}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Mail size={12} /> {candidate.email}
              </span>
              {candidate.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Phone size={12} /> {candidate.phone}
                </span>
              )}
              {candidate.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={12} /> {candidate.location}
                </span>
              )}
              {candidate.noticePeriod && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-text)' }}>
                  <Clock size={12} /> Notice: {candidate.noticePeriod}
                </span>
              )}
              {candidate.expectedSalary && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success-text)' }}>
                  <DollarSign size={12} /> Expected: {candidate.expectedSalary}
                </span>
              )}
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.5rem' }}>
              {candidate.linkedinUrl && (
                <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                  <Linkedin size={11} color="#38bdf8" /> LinkedIn
                </a>
              )}
              {candidate.githubUrl && (
                <a href={candidate.githubUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                  <Github size={11} /> GitHub
                </a>
              )}
              {candidate.portfolioUrl && (
                <a href={candidate.portfolioUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                  <Globe size={11} /> Portfolio
                </a>
              )}
            </div>
          </div>

          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* State Machine Action Bar */}
        <div style={{
          padding: '0.65rem 1.5rem',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={13} color="var(--primary-text)" />
            <span>State Machine: <strong style={{ color: '#fff' }}>{application.status}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {nextAllowed.length > 0 && (
              <>
                <select
                  className="select-field"
                  style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', width: 'auto' }}
                  value={selectedTargetStatus}
                  onChange={(e) => setSelectedTargetStatus(e.target.value)}
                >
                  <option value="">Advance Stage To...</option>
                  {nextAllowed.map((st) => (
                    <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
                  onClick={handleTransition}
                  disabled={!selectedTargetStatus || updatingStatus}
                >
                  {updatingStatus ? 'Updating...' : 'Advance'}
                </button>
              </>
            )}

            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
              onClick={() => onOpenValidation && onOpenValidation(application)}
            >
              <ShieldCheck size={13} color="var(--info-text)" /> Screening
            </button>

            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
              onClick={() => onScheduleInterview && onScheduleInterview(application)}
            >
              <Calendar size={13} color="var(--warning-text)" /> Schedule Round
            </button>

            {application.status === 'INTERVIEW_COMPLETED' && (
              <button
                className="btn btn-primary btn-sm"
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', background: '#059669', borderColor: '#059669' }}
                onClick={() => setShowDecisionModal(true)}
              >
                <Award size={13} /> Final Decision
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 1.5rem',
          background: 'var(--bg-surface-elevated)',
          flexShrink: 0,
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: 'Overview & Score' },
            { id: 'skills', label: 'Skills' },
            { id: 'resume', label: 'Resume' },
            { id: 'projects', label: 'Projects' },
            { id: 'audit', label: 'Screening Audit' },
            { id: 'interviews', label: `Interviews (${application.interviews?.length || 0})` },
            { id: 'timeline', label: `Timeline & Notes (${(application.statusHistory?.length || 0) + (candidate.notes?.length || 0)})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.65rem 0.85rem',
                fontSize: '0.78125rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: OVERVIEW & SCORE */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ScoreCard
                score={application.score}
                breakdown={application.scoreBreakdown}
                onRecalculate={handleRecalculate}
                loading={recalculating}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div className="card-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
                    <GraduationCap size={15} color="#818cf8" />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Education Credentials</h4>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#fff', fontWeight: 600 }}>
                    {candidate.educationLevel} in {candidate.educationMajor || 'Computer Science'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {candidate.educationInstitution} ({candidate.educationYear || 'Graduated'})
                  </div>
                </div>

                <div className="card-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
                    <Briefcase size={15} color="#38bdf8" />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Experience Profile</h4>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#fff', fontWeight: 600 }}>
                    {candidate.yearsOfExperience} Years Professional Experience
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Current: {candidate.currentTitle} at {candidate.currentCompany}
                  </div>
                </div>
              </div>

              {candidate.summary && (
                <div className="card-panel" style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>Professional Summary</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{candidate.summary}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Validated Skills Inventory</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {candidate.skills?.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-subtle)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      fontSize: '0.78125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <strong style={{ color: '#fff' }}>{s.name}</strong>
                    <span style={{ color: 'var(--primary-text)', fontSize: '0.7rem' }}>
                      ({s.CandidateSkill?.yearsOfExperience || 1}y • {s.CandidateSkill?.proficiencyLevel || 'Mid'})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RESUME */}
          {activeTab === 'resume' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <FileText size={20} color="var(--primary-text)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                      {candidate.resumes?.[0]?.fileName || `${candidate.firstName}_${candidate.lastName}_Resume.pdf`}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                      PDF Document • Parsed & Indexed for Screening
                    </div>
                  </div>
                </div>

                <a
                  href={candidate.resumes?.[0]?.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  download
                >
                  <Download size={13} /> Download
                </a>
              </div>

              {candidate.resumes?.[0]?.parsedText && (
                <div className="card-panel" style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Parsed Resume Content
                  </h4>
                  <pre style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.45,
                    maxHeight: '340px',
                    overflowY: 'auto',
                    background: 'var(--bg-app)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {candidate.resumes[0].parsedText}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Portfolio & Production Projects</h4>
              {candidate.projects?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No projects documented.</div>
              ) : (
                candidate.projects?.map((proj, idx) => (
                  <div key={idx} className="card-panel" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{proj.name}</h5>
                      {proj.url && (
                        <a href={proj.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                          <ExternalLink size={12} /> Source
                        </a>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      <strong>Stack:</strong> {proj.tech}
                    </p>
                    {proj.impact && (
                      <p style={{ fontSize: '0.78125rem', color: 'var(--success-text)', background: 'var(--success-subtle)', padding: '0.35rem 0.55rem', borderRadius: 'var(--radius-xs)', display: 'inline-block' }}>
                        <strong>Impact:</strong> {proj.impact}
                      </p>
                    )}
                  </div>
                ))
              )}

              {/* Certifications */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginTop: '0.75rem' }}>Verified Certifications</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {candidate.certifications?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78125rem', color: 'var(--warning-text)' }}>
                    <Award size={13} />
                    <span>{typeof c === 'string' ? c : c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SCREENING AUDIT */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Screening Checklist Audit Log</h4>
                  <span className={`status-badge ${application.isValidated ? 'validated' : 'screening'}`}>
                    {application.isValidated ? 'Validated' : 'Pending Verification'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {Object.entries(application.validationChecklist || {}).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                      <span style={{ color: val ? 'var(--success-text)' : 'var(--danger-text)', fontWeight: 700 }}>
                        {val ? '✓' : '✗'}
                      </span>
                      <span style={{ color: '#fff' }}>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    </div>
                  ))}
                </div>

                {application.validationNotes && (
                  <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                    <strong>Validator Notes:</strong> {application.validationNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: INTERVIEWS */}
          {activeTab === 'interviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Assigned Interview Rounds</h4>
                <button className="btn btn-primary btn-sm" onClick={() => onScheduleInterview && onScheduleInterview(application)}>
                  Schedule Round
                </button>
              </div>

              {application.interviews?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No interview rounds scheduled yet.</div>
              ) : (
                application.interviews?.map((inv) => (
                  <div key={inv.id} className="card-panel" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{inv.interviewType} Round</h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {inv.scheduledDate} at {inv.scheduledTime} • Interviewer: {inv.interviewer?.name}
                        </p>
                      </div>
                      <span className={`status-badge ${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </div>

                    {inv.feedback && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--success-text)' }}>
                            Recommendation: {inv.feedback.recommendation}
                          </span>
                          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>
                            Score: {inv.feedback.overallScore}/10
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          "{inv.feedback.comments}"
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: TIMELINE & RECRUITER NOTES */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Application Status History Timeline */}
              <div className="card-panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                  Application Status History Timeline
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid var(--border-default)' }}>
                  {application.statusHistory?.map((hist, i) => (
                    <div key={hist.id || i} style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-1.55rem',
                        top: '2px',
                        width: '8px',
                        height: '8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary)'
                      }} />
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>
                        {hist.previousStatus ? `${hist.previousStatus} → ${hist.newStatus}` : hist.newStatus}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {new Date(hist.createdAt).toLocaleDateString()} {new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • By {hist.changedBy?.name || 'Recruiter'}
                      </div>
                      {hist.reason && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {hist.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Private Recruiter Notes Feed */}
              <div className="card-panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                  Private Recruiter Notes
                </h4>

                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.45rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Log recruiter notes, phone screen observations..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" disabled={addingNote || !newNote.trim()}>
                    <Send size={14} /> Note
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {candidate.notes?.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78125rem' }}>No notes logged yet.</div>
                  ) : (
                    candidate.notes?.map((n) => (
                      <div key={n.id} style={{ padding: '0.65rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>
                          <span>{n.author?.name || 'Recruiter'} ({n.author?.role})</span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>{n.note}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiring Decision Modal Dialog */}
      {showDecisionModal && (
        <div className="modal-overlay" style={{ zIndex: 60 }}>
          <div className="modal-dialog" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--success-text)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Record Hiring Decision</h3>
              </div>
              <button onClick={() => setShowDecisionModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleDecisionSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Decision</label>
                <select
                  className="select-field"
                  value={decisionChoice}
                  onChange={(e) => setDecisionChoice(e.target.value)}
                >
                  <option value="SELECTED">SELECTED (Offer Extended)</option>
                  <option value="REJECTED">REJECTED (Criteria / Bar Gap)</option>
                  <option value="HOLD">HOLD (Future Requisition / Talent Pool)</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Decision Justification & Notes</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  required
                  placeholder="Summarize panel feedback, bar assessment, and hiring decision rationale..."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                />
              </div>
              <div className="modal-footer" style={{ padding: '0.75rem 0 0 0', background: 'transparent' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDecisionModal(false)} disabled={submittingDecision}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingDecision || !decisionReason.trim()}>
                  {submittingDecision ? 'Recording Decision...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
