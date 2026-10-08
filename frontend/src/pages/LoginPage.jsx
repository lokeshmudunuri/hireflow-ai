import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Shield, 
  Users, 
  UserCheck, 
  Layers, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Cpu, 
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, quickLogin, user } = useAuth();
  const navigate = useNavigate();

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser?.role === 'interviewer') {
        navigate('/interviews');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const loggedUser = await quickLogin(role);
      if (role === 'interviewer') {
        navigate('/interviews');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Unable to authenticate workspace account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      background: 'var(--bg-main)'
    }}>
      {/* Left Column: Platform Identity, Workflow & Metrics */}
      <div style={{
        background: 'linear-gradient(145deg, #0b1120 0%, #070a12 100%)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '3.5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Top Brand Identity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}>
              <Layers size={22} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                HireFlow
              </span>
              <span style={{ marginLeft: '6px', fontSize: '0.65rem', padding: '1px 6px', background: 'var(--primary-subtle)', color: 'var(--primary-text)', borderRadius: '4px', fontWeight: 700 }}>
                ATS ENTERPRISE
              </span>
            </div>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Applicant Screening & Interview Management Platform
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '480px' }}>
            A structured recruitment operations engine featuring deterministic 100-point candidate scoring, role-based workflows, and auditable candidate dossiers.
          </p>
        </div>

        {/* Recruitment Pipeline Workflow Preview */}
        <div style={{ margin: '2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Recruitment State Machine Architecture
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {[
              { label: 'Screening Verification', desc: 'Automated requirement validation against requisition criteria' },
              { label: 'Deterministic Scoring', desc: '100-pt explainable engine across skills, experience & projects' },
              { label: 'Collaborative Evaluations', desc: 'Standardized 5-competency interview scorecards & audit logs' }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <CheckCircle2 size={16} color="var(--primary-text)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{step.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Live Stats Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'ui-monospace, monospace' }}>12+</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>Seeded Candidates</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-text)', fontFamily: 'ui-monospace, monospace' }}>100%</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>Explainable Logic</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-text)', fontFamily: 'ui-monospace, monospace' }}>3 Roles</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>Admin / Recruiter / Panel</div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>HireFlow ATS v1.0.0 Production</span>
          <span style={{ color: 'var(--success-text)' }}>● System Online</span>
        </div>
      </div>

      {/* Right Column: Sign In Form & Demo Access */}
      <div style={{
        padding: '3.5rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Sign in to Workspace
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Enter your corporate credentials to access recruitment operations.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-subtle)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger-text)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Corporate Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="recruiter@hireflow.dev"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Password123!"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Remember session</span>
              </label>
              <span style={{ color: 'var(--text-subtle)' }}>Secure JWT Auth</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating Session...' : 'Sign In to Workspace'}
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Polished Demo Access Section */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Quick Workspace Role Access
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--primary-text)' }}>Active ATS Profiles</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('recruiter')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ padding: '4px', background: 'var(--primary-subtle)', borderRadius: '4px' }}>
                    <Users size={16} color="var(--primary-text)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>Recruiter (Sarah Jenkins)</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>recruiter@hireflow.dev • Full ATS Workflow</div>
                  </div>
                </div>
                <span className="status-badge shortlisting" style={{ fontSize: '0.65rem' }}>Recruiter</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('interviewer')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ padding: '4px', background: 'var(--success-subtle)', borderRadius: '4px' }}>
                    <UserCheck size={16} color="var(--success-text)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>Interviewer (Alex Rivera)</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>interviewer@hireflow.dev • Evaluations Only</div>
                  </div>
                </div>
                <span className="status-badge interview_completed" style={{ fontSize: '0.65rem' }}>Interviewer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ padding: '4px', background: 'var(--danger-subtle)', borderRadius: '4px' }}>
                    <Shield size={16} color="var(--danger-text)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>Administrator (Elena Vance)</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>admin@hireflow.dev • User & Security Management</div>
                  </div>
                </div>
                <span className="status-badge rejected" style={{ fontSize: '0.65rem' }}>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
