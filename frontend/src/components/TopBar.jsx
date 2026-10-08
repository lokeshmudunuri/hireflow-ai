import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Shield, User, LogOut, CheckCheck, Clock, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { notificationsApi } from '../api/client';

export default function TopBar({ title, subtitle, onToggleMobileSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const roleLabels = {
    admin: 'Administrator',
    recruiter: 'Lead Recruiter',
    interviewer: 'Engineering Panel'
  };

  const roleColors = {
    admin: { bg: 'var(--danger-subtle)', text: 'var(--danger-text)', border: 'var(--danger-border)' },
    recruiter: { bg: 'var(--primary-subtle)', text: 'var(--primary-text)', border: 'rgba(99, 102, 241, 0.3)' },
    interviewer: { bg: 'var(--success-subtle)', text: 'var(--success-text)', border: 'var(--success-border)' },
  };

  const currentRoleStyle = roleColors[user?.role] || roleColors.recruiter;

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      if (res.data.success) {
        const notifs = res.data.data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const handleNotificationClick = (path) => {
    setShowNotifications(false);
    if (path) navigate(path);
  };

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-topbar)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      flexShrink: 0
    }}>
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn-icon"
          onClick={onToggleMobileSidebar}
          style={{ display: 'none' }}
          id="mobile-sidebar-toggle"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            {title || 'HireFlow ATS'}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Role indicator, notification bell, user profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Role Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: currentRoleStyle.bg,
          color: currentRoleStyle.text,
          border: `1px solid ${currentRoleStyle.border}`
        }}>
          <span>{roleLabels[user?.role] || user?.role}</span>
        </div>

        {/* Notifications Popover Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon"
            style={{
              position: 'relative',
              background: showNotifications ? 'var(--bg-surface-hover)' : 'transparent',
              color: showNotifications ? '#fff' : 'var(--text-muted)',
            }}
            title="Recruitment Activity & Alerts"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--primary)',
                boxShadow: '0 0 0 2px var(--bg-surface)'
              }} />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '360px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-modal)',
              zIndex: 100,
              overflow: 'hidden',
              animation: 'modalFadeIn 150ms ease'
            }}>
              {/* Header */}
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Bell size={14} color="var(--primary-text)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>Activity Alerts</span>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '0.65rem', padding: '1px 5px', background: 'var(--primary-subtle)', color: 'var(--primary-text)', borderRadius: 'var(--radius-xs)', fontWeight: 700 }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <CheckCheck size={12} /> Mark read
                  </button>
                )}
              </div>

              {/* Feed List */}
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No recent activity notifications
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = !n.isRead;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.link || '/interviews')}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: isUnread ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = isUnread ? 'rgba(99, 102, 241, 0.05)' : 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: '#fff' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '0.5rem 1rem',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                background: 'var(--bg-surface)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                  HireFlow Audit Logging • Active Session
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />

        {/* User Mini Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#fff'
          }}>
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>
              {user?.name || 'Recruiter'}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>
              {user?.department || 'Talent Acquisition'}
            </span>
          </div>

          <button
            onClick={logout}
            className="btn-icon"
            style={{ marginLeft: '0.2rem' }}
            title="Sign out of HireFlow Workspace"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
