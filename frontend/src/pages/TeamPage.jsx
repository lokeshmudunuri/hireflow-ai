import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  X, 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  Search,
  Filter,
  Lock,
  Edit2
} from 'lucide-react';
import { usersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonTable } from '../components/SkeletonLoader';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [changeRoleUser, setChangeRoleUser] = useState(null);
  const [confirmDeactivateUser, setConfirmDeactivateUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('recruiter');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'recruiter',
    department: 'Talent Acquisition',
    title: 'Technical Recruiter'
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getUsers();
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Unable to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await usersApi.createUser(formData);
      toast.success(`User account for "${formData.name}" created successfully.`);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: 'Password123!',
        role: 'recruiter',
        department: 'Talent Acquisition',
        title: 'Technical Recruiter'
      });
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (targetUser) => {
    if (targetUser.isActive) {
      setConfirmDeactivateUser(targetUser);
    } else {
      executeToggleStatus(targetUser);
    }
  };

  const executeToggleStatus = async (targetUser) => {
    try {
      await usersApi.toggleStatus(targetUser.id);
      const newState = !targetUser.isActive;
      toast.info(`User "${targetUser.name}" has been ${newState ? 'activated' : 'deactivated'}.`);
      setConfirmDeactivateUser(null);
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update user status');
    }
  };

  const handleChangeRoleSubmit = async () => {
    if (!changeRoleUser || !selectedNewRole) return;
    try {
      setUpdatingRole(true);
      await usersApi.changeRole(changeRoleUser.id, selectedNewRole);
      toast.success(`Role for "${changeRoleUser.name}" updated to ${selectedNewRole}.`);
      setChangeRoleUser(null);
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to change role');
    } finally {
      setUpdatingRole(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <EmptyState
          icon={ShieldAlert}
          title="Access Restricted: Administrator Privileges Required"
          description="Your current role does not have authorization to view user management or modify team permissions."
        />
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (roleFilter && u.role !== roleFilter) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldAlert size={24} color="#f87171" />
            Security & Team Administration
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            System-level user directory, role permissions, active session tracking, and lifecycle administration.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Add Team Member
        </button>
      </div>

      {/* Control Bar: Search & Role Filter */}
      <div className="card-panel" style={{ padding: '0.85rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search user by name or email..."
              style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-field"
            style={{ width: 'auto', minWidth: '160px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="recruiter">Recruiter</option>
            <option value="interviewer">Interviewer</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
          Active Accounts: <strong style={{ color: 'var(--success-text)' }}>{users.filter(u => u.isActive).length}</strong> / {users.length}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No team members found"
          description="No users matched your search criteria."
          actionText={search || roleFilter ? "Clear Filter" : undefined}
          onAction={() => { setSearch(''); setRoleFilter(''); }}
        />
      ) : (
        <div className="card-panel data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Assigned Role</th>
                <th>Department / Title</th>
                <th>Lifecycle Status</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const roleBadge = u.role === 'admin' ? 'rejected' : u.role === 'recruiter' ? 'shortlisting' : 'interview_completed';

                return (
                  <tr key={u.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                          {u.name} {u.id === currentUser?.id && <span style={{ fontSize: '0.65rem', color: 'var(--primary-text)', marginLeft: '4px' }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {u.email}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`status-badge ${roleBadge}`} style={{ fontSize: '0.6875rem' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div style={{ color: '#fff', fontWeight: 500 }}>
                        {u.department || 'Talent Acquisition'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {u.interviewerProfile?.title || 'Team Member'}
                      </div>
                    </td>

                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: u.isActive ? 'var(--success-text)' : 'var(--danger-text)'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.isActive ? 'var(--success)' : 'var(--danger)' }} />
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never logged in'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* Change Role Button */}
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                          title="Change User Role"
                          onClick={() => {
                            setChangeRoleUser(u);
                            setSelectedNewRole(u.role);
                          }}
                        >
                          <Edit2 size={12} /> Role
                        </button>

                        {/* Activate / Deactivate Button */}
                        {u.id !== currentUser?.id && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.25rem 0.55rem',
                              color: u.isActive ? 'var(--danger-text)' : 'var(--success-text)'
                            }}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '520px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} color="var(--primary-text)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Add New Team Member</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  className="input-field"
                  required
                  placeholder="rachel@hireflow.dev"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Role Assignment *
                  </label>
                  <select
                    className="select-field"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="recruiter">Recruiter</option>
                    <option value="interviewer">Interviewer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating User...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {changeRoleUser && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '440px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Change Role: {changeRoleUser.name}</h3>
              <button onClick={() => setChangeRoleUser(null)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Select the new authorization role for <strong>{changeRoleUser.email}</strong>:
              </p>

              <select
                className="select-field"
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
              >
                <option value="admin">Administrator (Full Access)</option>
                <option value="recruiter">Recruiter (Screening, Jobs, Candidates, Pipelines)</option>
                <option value="interviewer">Interviewer (Assigned Rounds & Scorecards)</option>
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button className="btn btn-secondary" onClick={() => setChangeRoleUser(null)} disabled={updatingRole}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleChangeRoleSubmit} disabled={updatingRole}>
                  {updatingRole ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate User Confirmation Modal */}
      {confirmDeactivateUser && (
        <ConfirmModal
          isOpen={Boolean(confirmDeactivateUser)}
          title="Deactivate Team Member Account"
          message={`Are you sure you want to deactivate ${confirmDeactivateUser.name} (${confirmDeactivateUser.email})? They will immediately lose access to the HireFlow workspace.`}
          confirmText="Deactivate Account"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={() => executeToggleStatus(confirmDeactivateUser)}
          onCancel={() => setConfirmDeactivateUser(null)}
        />
      )}
    </div>
  );
}
