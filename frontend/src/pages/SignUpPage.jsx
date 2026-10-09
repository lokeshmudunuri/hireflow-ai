import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Layers, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Talent Acquisition');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Password requirements evaluation
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSpecial = /[\d!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid corporate email address.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must acknowledge the Recruitment Operations and Data Privacy terms.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        department: department.trim() || 'Talent Acquisition',
        role: 'recruiter' // Default authorized role for public registration
      });

      toast.success(`Welcome to HireFlow, ${newUser.name}! Your workspace is ready.`);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Unable to complete account registration. Please check your information.');
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
      {/* Left Column: Platform Identity & Security Guarantees */}
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
            Create Your Talent Operations Account
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '480px' }}>
            Join hiring teams organizing candidate screening, deterministic match scoring, and standardized panel evaluations.
          </p>
        </div>

        {/* Enterprise Security Features */}
        <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Enterprise Account Governance
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            {[
              {
                title: 'Cryptographic Credential Security',
                desc: 'Passwords are irreversibly hashed using industry-standard bcrypt with 10 salt rounds.'
              },
              {
                title: 'Real Database Persistence',
                desc: 'User identity, recruitment requisitions, and audit histories are committed to real relational storage.'
              },
              {
                title: 'Strict Role-Based Access Control',
                desc: 'Granular server-side route guards isolate recruiter, interviewer, and administrator domains.'
              }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <ShieldCheck size={16} color="var(--success-text)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{item.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>HireFlow ATS v1.0.0 Production</span>
          <span style={{ color: 'var(--success-text)' }}>● System Online</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div style={{
        padding: '3rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Register Workspace Account
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Set up your recruitment profile with corporate credentials.
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
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Full Name <span style={{ color: 'var(--danger-text)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="e.g. Meera Krishnan"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Corporate Email Address <span style={{ color: 'var(--danger-text)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Department
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <select
                  className="select-field"
                  style={{ paddingLeft: '2.4rem' }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Talent Acquisition">Talent Acquisition</option>
                  <option value="Engineering & Technology">Engineering & Technology</option>
                  <option value="Product Operations">Product Operations</option>
                  <option value="People & HR">People & HR</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password <span style={{ color: 'var(--danger-text)' }}>*</span>
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Confirm Password <span style={{ color: 'var(--danger-text)' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div style={{
              background: 'var(--bg-surface)',
              padding: '0.75rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasMinLength ? 'var(--success-text)' : 'var(--text-subtle)' }}>
                <CheckCircle2 size={12} color={hasMinLength ? 'var(--success-text)' : 'var(--text-subtle)'} />
                <span>At least 6 characters in length</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: (hasLetter && hasNumberOrSpecial) ? 'var(--success-text)' : 'var(--text-subtle)' }}>
                <CheckCircle2 size={12} color={(hasLetter && hasNumberOrSpecial) ? 'var(--success-text)' : 'var(--text-subtle)'} />
                <span>Combination of letters and numbers/symbols</span>
              </div>
              {confirmPassword.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: passwordsMatch ? 'var(--success-text)' : 'var(--danger-text)' }}>
                  <CheckCircle2 size={12} color={passwordsMatch ? 'var(--success-text)' : 'var(--danger-text)'} />
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ accentColor: 'var(--primary)', marginTop: '2px' }}
                required
              />
              <span>
                I agree to the <strong style={{ color: '#fff' }}>Recruitment Data Governance Policy</strong> and confirm that candidate records will be handled in compliance with privacy guidelines.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account & Initializing...' : 'Create Workspace Account'}
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Link back to Sign In */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-text)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in to Workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
