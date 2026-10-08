import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  X, 
  Users, 
  AlertCircle,
  Calendar,
  DollarSign,
  UserCheck,
  Search,
  Filter,
  ArrowRight,
  Eye,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonCards } from '../components/SkeletonLoader';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [confirmCloseJob, setConfirmCloseJob] = useState(null);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Bengaluru / Remote',
    employmentType: 'Full-time',
    experienceRequirement: 4,
    qualification: "Bachelor's Degree",
    requiredSkills: 'React, Node.js, TypeScript, PostgreSQL',
    optionalSkills: 'Docker, AWS, GraphQL',
    salaryRange: '₹32,00,000 - ₹44,00,000',
    hiringManager: 'Technical Hiring Lead',
    description: '',
    deadline: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobsApi.getJobs();
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
      toast.error('Unable to fetch job requisitions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const skillsArray = formData.requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const optionalArray = formData.optionalSkills
        ? formData.optionalSkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await jobsApi.createJob({
        ...formData,
        requiredSkills: skillsArray,
        optionalSkills: optionalArray
      });

      toast.success(`Requisition "${formData.title}" published successfully!`);
      setShowCreateModal(false);
      setFormData({
        title: '',
        department: 'Engineering',
        location: 'Bengaluru / Remote',
        employmentType: 'Full-time',
        experienceRequirement: 4,
        qualification: "Bachelor's Degree",
        requiredSkills: 'React, Node.js, TypeScript, PostgreSQL',
        optionalSkills: 'Docker, AWS, GraphQL',
        salaryRange: '₹32,00,000 - ₹44,00,000',
        hiringManager: 'Technical Hiring Lead',
        description: '',
        deadline: ''
      });
      await fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to post requisition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleJob = async (job) => {
    if (job.status === 'ACTIVE') {
      setConfirmCloseJob(job);
      return;
    }
    // Reopen immediately
    try {
      await jobsApi.reopenJob(job.id);
      toast.success(`Requisition "${job.title}" has been reopened.`);
      await fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reopen job');
    }
  };

  const confirmCloseAction = async () => {
    if (!confirmCloseJob) return;
    try {
      await jobsApi.closeJob(confirmCloseJob.id);
      toast.info(`Requisition "${confirmCloseJob.title}" closed.`);
      setConfirmCloseJob(null);
      await fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to close job');
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.department.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (departmentFilter && j.department !== departmentFilter) {
      return false;
    }
    if (statusFilter && j.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const uniqueDepartments = [...new Set(jobs.map(j => j.department).filter(Boolean))];

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title & Post Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Briefcase size={24} color="#818cf8" />
            Job Requisitions & Headcount
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Open talent requisitions configured with screening criteria, salary bands, and hiring managers.
          </p>
        </div>

        {['recruiter', 'admin'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Post Requisition
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by job title or department..."
              style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-field"
            style={{ width: 'auto', minWidth: '160px' }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            className="select-field"
            style={{ width: 'auto', minWidth: '140px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: '#fff' }}>{filteredJobs.length}</strong> of {jobs.length} requisitions
        </div>
      </div>

      {/* Requisitions Grid */}
      {loading ? (
        <SkeletonCards count={6} />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job requisitions found"
          description={search || departmentFilter ? "Try adjusting your search criteria or clearing filters." : "Create your first job requisition to start receiving and screening candidate applications."}
          actionText={['recruiter', 'admin'].includes(user?.role) ? "Post Requisition" : undefined}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="card-panel"
              style={{
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                borderLeft: job.status === 'ACTIVE' ? '3px solid var(--primary)' : '3px solid var(--border-default)',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedJobDetail(job)}
            >
              <div>
                {/* Header: Title & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                    {job.title}
                  </h3>
                  <span className={`status-badge ${job.status === 'ACTIVE' ? 'selected' : 'hold'}`} style={{ fontSize: '0.65rem' }}>
                    {job.status}
                  </span>
                </div>

                {/* Metadata Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Briefcase size={12} color="#818cf8" /> {job.department}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} color="#38bdf8" /> {job.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} color="#fbbf24" /> {job.experienceRequirement}+ yrs exp
                  </span>
                  {job.employmentType && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                      • {job.employmentType}
                    </span>
                  )}
                </div>

                {/* Salary & Hiring Manager */}
                <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', background: 'var(--bg-app)', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  {job.salaryRange && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success-text)', fontWeight: 600 }}>
                      <DollarSign size={12} /> {job.salaryRange}
                    </span>
                  )}
                  {job.hiringManager && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                      <UserCheck size={12} /> HM: {job.hiringManager}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>

                {/* Required Skills */}
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-subtle)', marginBottom: '0.4rem' }}>
                    Screening Criteria Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {job.requiredSkills?.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.6875rem',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary-text)',
                          border: '1px solid rgba(99, 102, 241, 0.25)'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Applicant count & Action buttons */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem' }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {job.applications?.length || 0} candidate application{job.applications?.length !== 1 ? 's' : ''}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                    onClick={() => setSelectedJobDetail(job)}
                  >
                    <Eye size={12} /> Details
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                    onClick={() => navigate('/candidates')}
                  >
                    <Users size={12} /> Applicants
                  </button>

                  {['recruiter', 'admin'].includes(user?.role) && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => handleToggleJob(job)}
                    >
                      {job.status === 'ACTIVE' ? (
                        <>
                          <Lock size={12} color="var(--warning-text)" /> Close
                        </>
                      ) : (
                        <>
                          <Unlock size={12} color="var(--success-text)" /> Reopen
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Requisition Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '640px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} color="var(--primary-text)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Post New Job Requisition</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Job Requisition Title *
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="e.g. Senior Distributed Systems Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Department *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Employment Type
                  </label>
                  <select
                    className="select-field"
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Min Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    required
                    value={formData.experienceRequirement}
                    onChange={(e) => setFormData({ ...formData, experienceRequirement: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Salary Band
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. $140,000 - $175,000"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Hiring Manager
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.hiringManager}
                    onChange={(e) => setFormData({ ...formData, hiringManager: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Required Screening Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="React, TypeScript, Docker, Kubernetes"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Optional / Nice-to-Have Skills
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="AWS, GraphQL, Terraform"
                  value={formData.optionalSkills}
                  onChange={(e) => setFormData({ ...formData, optionalSkills: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Job Description & Scope *
                </label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  required
                  placeholder="Describe key responsibilities and architectural expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating Requisition...' : 'Publish Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requisition Details Dossier Modal */}
      {selectedJobDetail && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '720px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={16} color="var(--primary-text)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    {selectedJobDetail.title}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedJobDetail.department} • {selectedJobDetail.location} • {selectedJobDetail.employmentType}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedJobDetail(null)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', overflowY: 'auto' }}>
              {/* Status and Salary strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-app)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Salary Band</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success-text)' }}>
                    {selectedJobDetail.salaryRange || 'Competitive Market Rate'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Hiring Manager</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                    {selectedJobDetail.hiringManager || selectedJobDetail.creator?.name || 'Technical Hiring Lead'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>Experience Bar</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                    {selectedJobDetail.experienceRequirement}+ Years Minimum
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.4rem' }}>
                  Role Overview & Scope
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  {selectedJobDetail.description}
                </p>
              </div>

              {/* Screening Skills */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.45rem' }}>
                  Mandatory Screening Criteria Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedJobDetail.requiredSkills?.map((s, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.3rem 0.65rem',
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary-text)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.78125rem',
                        fontWeight: 600
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Optional Skills if available */}
              {selectedJobDetail.optionalSkills?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '0.45rem' }}>
                    Preferred / Nice-to-Have Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {selectedJobDetail.optionalSkills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.3rem 0.65rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.78125rem'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span className={`status-badge ${selectedJobDetail.status === 'ACTIVE' ? 'selected' : 'hold'}`}>
                  {selectedJobDetail.status}
                </span>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedJobDetail(null);
                      navigate('/candidates');
                    }}
                  >
                    <Users size={14} /> View All Candidates
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedJobDetail(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Closing a Job */}
      {confirmCloseJob && (
        <ConfirmModal
          isOpen={Boolean(confirmCloseJob)}
          title="Close Job Requisition"
          message={`Are you sure you want to close "${confirmCloseJob.title}"? This requisition will stop accepting new applicant submissions.`}
          confirmText="Close Requisition"
          cancelText="Keep Open"
          confirmVariant="warning"
          onConfirm={confirmCloseAction}
          onCancel={() => setConfirmCloseJob(null)}
        />
      )}
    </div>
  );
}
