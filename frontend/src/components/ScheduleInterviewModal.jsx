import React, { useState, useEffect } from 'react';
import { X, Calendar, Video, Clock, UserCheck } from 'lucide-react';
import { usersApi } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function ScheduleInterviewModal({ application, onClose, onSchedule }) {
  const [interviewers, setInterviewers] = useState([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  const toast = useToast();

  const [formData, setFormData] = useState({
    applicationId: application?.id,
    interviewerId: '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '14:00',
    interviewType: 'Technical',
    location: 'https://meet.google.com/hireflow-interview',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const res = await usersApi.getInterviewers();
        if (res.data.success) {
          setInterviewers(res.data.interviewers || []);
          if (res.data.interviewers?.length > 0) {
            setFormData(prev => ({ ...prev, interviewerId: res.data.interviewers[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load interviewers:', err);
      } finally {
        setLoadingInterviewers(false);
      }
    };

    fetchInterviewers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.interviewerId) {
      toast.warning('Please select an interviewer from the directory.');
      return;
    }

    setSubmitting(true);
    try {
      await onSchedule(formData);
      toast.success(`Interview scheduled with ${application?.candidate?.firstName || 'candidate'}.`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
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
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={18} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Schedule Candidate Interview
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

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Assigned Interviewer */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Select Interviewer
            </label>
            {loadingInterviewers ? (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>Loading engineering interviewers...</div>
            ) : (
              <select
                className="form-select"
                value={formData.interviewerId}
                onChange={(e) => setFormData({ ...formData, interviewerId: e.target.value })}
                required
              >
                {interviewers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.interviewerProfile?.title || 'Engineer'} ({u.interviewerProfile?.specialization || 'General'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Time (24h)
              </label>
              <input
                type="time"
                className="form-input"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Interview Type & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Round Type
              </label>
              <select
                className="form-select"
                value={formData.interviewType}
                onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
              >
                <option value="Technical">Technical Deep Dive</option>
                <option value="System Design">System Architecture</option>
                <option value="HR">HR & Cultural Alignment</option>
                <option value="Cultural">Team Fit & Values</option>
                <option value="Final">Final Executive Review</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Meeting Link / Location
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Google Meet, Zoom, or Office Room"
                required
              />
            </div>
          </div>

          {/* Agenda & Notes */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Interviewer Brief / Agenda
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Focus on concurrency, API performance, and past production outage experiences..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Confirm & Schedule Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
