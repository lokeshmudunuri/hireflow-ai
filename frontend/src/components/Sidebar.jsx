import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  Briefcase, 
  Users, 
  CalendarCheck, 
  ShieldAlert, 
  Sparkles,
  ChevronRight,
  UserCheck,
  X,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, quickLogin } = useAuth();

  // Role-aware navigation definitions
  let navItems = [];

  if (user?.role === 'interviewer') {
    // Simplified interviewer workspace
    navItems = [
      { name: 'My Interviews', path: '/interviews', icon: CalendarCheck, exact: true },
      { name: 'Candidate Dossiers', path: '/candidates', icon: Users, exact: false }
    ];
  } else {
    // Recruiter & Admin workspace
    navItems = [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
      { name: 'Screening Pipeline', path: '/pipeline', icon: Kanban, exact: false },
      { name: 'Job Requisitions', path: '/jobs', icon: Briefcase, exact: false },
      { name: 'Candidates', path: '/candidates', icon: Users, exact: false },
      { name: 'Interviews', path: '/interviews', icon: CalendarCheck, exact: false },
    ];

    if (user?.role === 'admin') {
      navItems.push({ name: 'Team & Security', path: '/team', icon: ShieldAlert, exact: false });
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 45
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          zIndex: 50,
          transition: 'transform var(--transition-normal)'
        }}
        className={isOpen ? 'sidebar-mobile-open' : ''}
      >
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)'
            }}>
              <Layers size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                HireFlow
                <span style={{ fontSize: '0.625rem', padding: '1px 5px', background: 'var(--primary-subtle)', color: 'var(--primary-text)', borderRadius: 'var(--radius-xs)', fontWeight: 700 }}>
                  ATS
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>Applicant Operations</p>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="btn-icon"
              style={{ display: 'none' }}
              id="sidebar-close-btn"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '0 0.5rem 0.4rem 0.5rem', letterSpacing: '0.04em' }}>
            {user?.role === 'interviewer' ? 'Evaluation Workspace' : 'Recruitment Operations'}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => onClose && onClose()}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-subtle)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all var(--transition-fast)'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <item.icon size={16} />
                <span>{item.name}</span>
              </div>
              <ChevronRight size={13} style={{ opacity: 0.35 }} />
            </NavLink>
          ))}

          {/* Demo Access Role Switcher Pill Container */}
          <div style={{
            marginTop: 'auto',
            padding: '0.75rem',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <UserCheck size={13} />
              WORKSPACE ROLE SWITCHER
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <button
                onClick={() => quickLogin('recruiter')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0.55rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  background: user?.role === 'recruiter' ? 'var(--primary-subtle)' : 'transparent',
                  color: user?.role === 'recruiter' ? 'var(--primary-text)' : 'var(--text-muted)',
                  border: user?.role === 'recruiter' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent'
                }}
              >
                <span>Recruiter (Sarah)</span>
                {user?.role === 'recruiter' && <span style={{ fontSize: '0.65rem', color: '#818cf8' }}>Active</span>}
              </button>
              <button
                onClick={() => quickLogin('interviewer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0.55rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  background: user?.role === 'interviewer' ? 'var(--success-subtle)' : 'transparent',
                  color: user?.role === 'interviewer' ? 'var(--success-text)' : 'var(--text-muted)',
                  border: user?.role === 'interviewer' ? '1px solid var(--success-border)' : '1px solid transparent'
                }}
              >
                <span>Interviewer (Alex)</span>
                {user?.role === 'interviewer' && <span style={{ fontSize: '0.65rem', color: '#34d399' }}>Active</span>}
              </button>
              <button
                onClick={() => quickLogin('admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0.55rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  background: user?.role === 'admin' ? 'var(--danger-subtle)' : 'transparent',
                  color: user?.role === 'admin' ? 'var(--danger-text)' : 'var(--text-muted)',
                  border: user?.role === 'admin' ? '1px solid var(--danger-border)' : '1px solid transparent'
                }}
              >
                <span>Admin (System)</span>
                {user?.role === 'admin' && <span style={{ fontSize: '0.65rem', color: '#f87171' }}>Active</span>}
              </button>
            </div>
          </div>
        </nav>

        {/* Footer Subtitle */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.6875rem',
          color: 'var(--text-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>v1.0.0 Production</span>
          <span style={{ color: 'var(--success-text)' }}>● Online</span>
        </div>
      </aside>
    </>
  );
}
