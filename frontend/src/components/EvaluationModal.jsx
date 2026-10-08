import React, { useState } from 'react';
import { X, Award, CheckCircle, ThumbsUp, ThumbsDown, AlertCircle, Star } from 'lucide-react';

export default function EvaluationModal({ interview, onClose, onSubmitEvaluation }) {
  const [scores, setScores] = useState({
    technicalKnowledge: 4,
    problemSolving: 4,
    communication: 4,
    systemUnderstanding: 4,
    collaboration: 4
  });

  const [recommendation, setRecommendation] = useState('Hire');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate 1.0 - 5.0 average score
  const overall = (
    (scores.technicalKnowledge +
      scores.problemSolving +
      scores.communication +
      scores.systemUnderstanding +
      scores.collaboration) / 5
  ).toFixed(1);

  const competencies = [
    { key: 'technicalKnowledge', label: '1. Technical Knowledge & Core Depth', desc: 'Syntax mastery, fundamentals, runtime execution' },
    { key: 'problemSolving', label: '2. Problem Solving & Algorithmic Logic', desc: 'Edge cases, efficiency, data structures' },
    { key: 'communication', label: '3. Communication & Articulation', desc: 'Clarity, explaining trade-offs, structured thinking' },
    { key: 'systemUnderstanding', label: '4. System / Domain Understanding', desc: 'Microservices, APIs, performance, scalability' },
    { key: 'collaboration', label: '5. Collaboration & Team Fit', desc: 'Receptiveness to feedback, growth mindset' },
  ];

  const recommendations = [
    { label: 'Strong Hire', val: 'Strong Hire', color: 'var(--success-text)', bg: 'var(--success-subtle)', border: 'var(--success-border)', icon: Award },
    { label: 'Hire', val: 'Hire', color: 'var(--info-text)', bg: 'var(--info-subtle)', border: 'var(--info-border)', icon: ThumbsUp },
    { label: 'Hold', val: 'Hold', color: 'var(--warning-text)', bg: 'var(--warning-subtle)', border: 'var(--warning-border)', icon: AlertCircle },
    { label: 'No Hire', val: 'No Hire', color: 'var(--danger-text)', bg: 'var(--danger-subtle)', border: 'var(--danger-border)', icon: ThumbsDown },
    { label: 'Strong No Hire', val: 'Strong No Hire', color: '#f87171', bg: 'rgba(239, 68, 68, 0.2)', border: 'var(--danger-border)', icon: AlertCircle },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!comments.trim()) {
      setErrorMsg('Please enter detailed interviewer feedback comments.');
      return;
    }

    setSubmitting(true);
    try {
      // Scale 1-5 to 1-10 for backend schema compatibility (e.g. 4 -> 8)
      await onSubmitEvaluation({
        interviewId: interview.id,
        technicalSkillsScore: scores.technicalKnowledge * 2,
        problemSolvingScore: scores.problemSolving * 2,
        communicationScore: scores.communication * 2,
        projectKnowledgeScore: scores.systemUnderstanding * 2,
        roleFitScore: scores.collaboration * 2,
        recommendation,
        comments: comments.trim()
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
              Structured Interview Scorecard
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {interview?.application?.candidate?.firstName} {interview?.application?.candidate?.lastName} • {interview?.interviewType} Round
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-subtle)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger-text)',
              fontSize: '0.78125rem'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Aggregate Rating Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.04em' }}>
                Candidate Overall Score (1.0 – 5.0)
              </span>
              <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                Average across 5 competencies
              </div>
            </div>

            <div style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: overall >= 4 ? 'var(--success-text)' : overall >= 3 ? 'var(--warning-text)' : 'var(--danger-text)'
            }}>
              {overall} <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>/ 5.0</span>
            </div>
          </div>

          {/* 5 Competency Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {competencies.map((c) => (
              <div key={c.key} style={{ background: 'var(--bg-app)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{c.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>{c.desc}</div>
                  </div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-text)' }}>
                    {scores[c.key]} / 5
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setScores({ ...scores, [c.key]: val })}
                      style={{
                        flex: 1,
                        padding: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-xs)',
                        background: scores[c.key] === val ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                        color: scores[c.key] === val ? '#fff' : 'var(--text-muted)',
                        border: scores[c.key] === val ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Overall Recommendation */}
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.45rem' }}>
              Final Recommendation
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '0.4rem' }}>
              {recommendations.map((rec) => (
                <button
                  key={rec.val}
                  type="button"
                  onClick={() => setRecommendation(rec.val)}
                  style={{
                    padding: '0.5rem 0.35rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    background: recommendation === rec.val ? rec.bg : 'rgba(255, 255, 255, 0.02)',
                    color: recommendation === rec.val ? rec.color : 'var(--text-muted)',
                    border: recommendation === rec.val ? `1px solid ${rec.border}` : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <rec.icon size={14} />
                  <span>{rec.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Comments */}
          <div className="form-group">
            <label className="form-label">Interviewer Comments & Technical Justification</label>
            <textarea
              className="textarea-field"
              rows={3}
              required
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Candidate demonstrated clean architectural thinking, handled edge cases well, strong communication on trade-offs..."
            />
          </div>

          <div className="modal-footer" style={{ padding: '0.75rem 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting Scorecard...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
