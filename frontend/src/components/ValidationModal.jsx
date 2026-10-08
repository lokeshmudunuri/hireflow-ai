import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, XCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ValidationModal({ application, onClose, onValidate }) {
  const toast = useToast();
  const [checklist, setChecklist] = useState({
    requiredDetails: application?.validationChecklist?.requiredDetails ?? true,
    resumeAvailable: application?.validationChecklist?.resumeAvailable ?? true,
    qualificationMet: application?.validationChecklist?.qualificationMet ?? true,
    experienceMet: application?.validationChecklist?.experienceMet ?? true,
    skillsAvailable: application?.validationChecklist?.skillsAvailable ?? true,
  });

  const [validationNotes, setValidationNotes] = useState(application?.validationNotes || '');
  const [decision, setDecision] = useState('VALIDATED');
  const [submitting, setSubmitting] = useState(false);

  const checklistItems = [
    { key: 'requiredDetails', label: 'Candidate personal details & contact info verified' },
    { key: 'resumeAvailable', label: 'Resume document uploaded and successfully parsed' },
    { key: 'qualificationMet', label: `Education matches or exceeds requirement (${application?.job?.qualification || 'Degree'})` },
    { key: 'experienceMet', label: `Professional experience meets minimum (${application?.job?.experienceRequirement || 0}+ Years)` },
    { key: 'skillsAvailable', label: 'Required technical skills verified in work history / projects' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onValidate({
        checklist,
        validationNotes,
        decision
      });
      toast.success(`Screening decision "${decision}" recorded for candidate.`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Validation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color="#22d3ee" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Application Screening Verification
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {application?.candidate?.firstName} {application?.candidate?.lastName} • {application?.job?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              borderRadius: '6px',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.6rem' }}>
              Verification Checklist
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {checklistItems.map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: checklist[item.key] ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Validation Decision */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.6rem' }}>
              Screening Decision
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDecision('VALIDATED')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: decision === 'VALIDATED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: decision === 'VALIDATED' ? '#34d399' : 'var(--text-muted)',
                  border: decision === 'VALIDATED' ? '2px solid #10b981' : '1px solid var(--border-subtle)'
                }}
              >
                <CheckCircle size={18} />
                <span>Pass & Validate</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('MORE_INFO')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: decision === 'MORE_INFO' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: decision === 'MORE_INFO' ? '#fbbf24' : 'var(--text-muted)',
                  border: decision === 'MORE_INFO' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)'
                }}
              >
                <AlertCircle size={18} />
                <span>Request Info / Hold</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: decision === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: decision === 'REJECTED' ? '#f87171' : 'var(--text-muted)',
                  border: decision === 'REJECTED' ? '2px solid #ef4444' : '1px solid var(--border-subtle)'
                }}
              >
                <XCircle size={18} />
                <span>Reject Screening</span>
              </button>
            </div>
          </div>

          {/* Recruiter Notes */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Validation Observations & Notes
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              placeholder="e.g. Strong university background, verified projects on GitHub, recommended to move forward..."
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Confirm Validation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
