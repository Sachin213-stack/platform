import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Modal } from '../../../shared/components/Modal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { useToast } from '../../../shared/components/Toast';
import { getStoredUser } from '../../../shared/services/apiClient';

const user = getStoredUser();
const currentUserName = user?.name || (user?.email ? user.email.split('@')[0] : 'Workspace Owner');
const currentUserEmail = user?.email || 'admin@aicto.io';
const initials = currentUserName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'WO';

const INITIAL_MEMBERS = [
  {
    id: 'mem_owner',
    name: `${currentUserName} (You)`,
    email: currentUserEmail,
    role: 'Owner',
    avatarInitials: initials,
    avatarBg: '#8b5cf6',
    lastActive: 'Active now',
  },
];

const INITIAL_INVITES = [];

const PERMISSION_MATRIX = [
  { feature: 'View Dashboard & Vitals', viewer: true, analyst: true, admin: true, owner: true },
  { feature: 'Analytics & Forecasting Studio', viewer: true, analyst: true, admin: true, owner: true },
  { feature: 'Interact with FRIDAY AI Chat', viewer: false, analyst: true, admin: true, owner: true },
  { feature: 'Execute Automated Playbooks & Rollbacks', viewer: false, analyst: false, admin: true, owner: true },
  { feature: 'Configure Alert Rules & Snoozes', viewer: false, analyst: true, admin: true, owner: true },
  { feature: 'Manage API Keys & Webhooks', viewer: false, analyst: false, admin: true, owner: true },
  { feature: 'Invite & Manage Team Roles', viewer: false, analyst: false, admin: true, owner: true },
  { feature: 'Billing, Tier Plans & Invoices', viewer: false, analyst: false, admin: true, owner: true },
  { feature: 'Transfer Ownership & Delete Business', viewer: false, analyst: false, admin: false, owner: true },
];

export function TeamAccessTab() {
  const { addToast } = useToast();

  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [invites, setInvites] = useState(INITIAL_INVITES);
  const [showMatrix, setShowMatrix] = useState(false);

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Analyst');
  const [inviting, setInviting] = useState(false);

  // Remove Member Confirm
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Transfer Ownership
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferSuccessor, setTransferSuccessor] = useState('Elena Rostova (elena.r@acmeglobal.com)');

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    setInviting(true);
    setTimeout(() => {
      const newInv = {
        id: `inv_${Date.now()}`,
        email: inviteEmail.trim(),
        role: inviteRole,
        invitedDate: 'Just now',
        invitedBy: 'Alex Mercer',
      };
      setInvites((prev) => [newInv, ...prev]);
      setInviting(false);
      setIsInviteOpen(false);
      setInviteEmail('');
      addToast(`Invitation sent to ${newInv.email}`, 'success');
    }, 500);
  };

  const handleResendInvite = (inv) => {
    addToast(`Invitation resent to ${inv.email}`, 'info');
  };

  const handleCancelInvite = (invId) => {
    setInvites((prev) => prev.filter((i) => i.id !== invId));
    addToast('Invitation cancelled', 'info');
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    setTimeout(() => {
      setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
      setIsRemoving(false);
      addToast(`Removed ${memberToRemove.name} from team`, 'info');
      setMemberToRemove(null);
    }, 400);
  };

  const handleTransferOwnership = () => {
    addToast(`Ownership transfer request initiated for ${transferSuccessor}`, 'success');
    setIsTransferOpen(false);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Owner':
        return 'violet';
      case 'Admin':
        return 'info';
      case 'Analyst':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="settings-tab-pane">
      <div className="settings-tab-pane__header">
        <h2 className="settings-tab-pane__title">Team Access & Roles</h2>
        <p className="settings-tab-pane__subtitle">
          Manage platform collaborators, role-based access control, pending invitations, and ownership delegation.
        </p>
      </div>

      <div className="settings-form-grid">
        {/* Active Members Table */}
        <Card>
          <CardHeader
            title="Team Members"
            subtitle={`${members.length} active seat${members.length > 1 ? 's' : ''} assigned to your organization.`}
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsInviteOpen(true)}
                icon={
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 14a6 6 0 0 1 12 0" />
                  </svg>
                }
              >
                Invite Member
              </Button>
            }
          />
          <CardBody padding="none">
            <div className="settings-table-wrapper">
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="settings-user-cell">
                          <div
                            className="settings-user-avatar"
                            style={{ backgroundColor: m.avatarBg }}
                          >
                            {m.avatarInitials}
                          </div>
                          <span className="settings-table__main-text">{m.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="settings-table__meta-val">{m.email}</span>
                      </td>
                      <td>
                        <Badge variant={getRoleBadgeVariant(m.role)} size="sm">
                          {m.role}
                        </Badge>
                      </td>
                      <td>
                        <span className="settings-table__sub-text">{m.lastActive}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {m.role === 'Owner' ? (
                          <span
                            className="settings-table__sub-text"
                            title="Organization Owner cannot be removed"
                            style={{ fontStyle: 'italic' }}
                          >
                            Primary Owner
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMemberToRemove(m)}
                            style={{ color: 'var(--color-status-error)' }}
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <Card>
            <CardHeader
              title="Pending Invitations"
              subtitle="Invited teammates who have not yet accepted their onboard link."
            />
            <CardBody padding="none">
              <div className="settings-table-wrapper">
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>Invited Email</th>
                      <th>Assigned Role</th>
                      <th>Sent Date</th>
                      <th>Sent By</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <span className="settings-table__main-text">{inv.email}</span>
                        </td>
                        <td>
                          <Badge variant={getRoleBadgeVariant(inv.role)} size="sm">
                            {inv.role}
                          </Badge>
                        </td>
                        <td>
                          <span className="settings-table__sub-text">{inv.invitedDate}</span>
                        </td>
                        <td>
                          <span className="settings-table__sub-text">{inv.invitedBy}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleResendInvite(inv)}
                            >
                              Resend
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelInvite(inv.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Role Permission Matrix (Collapsible) */}
        <Card>
          <CardHeader
            title="Role Permission Matrix"
            subtitle="Understand granular capability breakdowns across Viewer, Analyst, Admin, and Owner."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMatrix(!showMatrix)}
              >
                {showMatrix ? 'Collapse Matrix' : 'Expand Matrix'}
              </Button>
            }
          />
          {showMatrix && (
            <CardBody padding="none">
              <div className="settings-table-wrapper">
                <table className="settings-table settings-table--matrix">
                  <thead>
                    <tr>
                      <th>Capability / Resource</th>
                      <th style={{ textAlign: 'center' }}>Viewer</th>
                      <th style={{ textAlign: 'center' }}>Analyst</th>
                      <th style={{ textAlign: 'center' }}>Admin</th>
                      <th style={{ textAlign: 'center' }}>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_MATRIX.map((row, idx) => (
                      <tr key={idx}>
                        <td className="settings-table__main-text">{row.feature}</td>
                        <td style={{ textAlign: 'center' }}>
                          {row.viewer ? <span className="matrix-check">✓</span> : <span className="matrix-dash">—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {row.analyst ? <span className="matrix-check">✓</span> : <span className="matrix-dash">—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {row.admin ? <span className="matrix-check">✓</span> : <span className="matrix-dash">—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {row.owner ? <span className="matrix-check">✓</span> : <span className="matrix-dash">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          )}
        </Card>

        {/* Transfer Ownership Card */}
        <Card variant="subtle">
          <CardHeader
            title="Transfer Organization Ownership"
            subtitle="Delegates full billing and root administrative control to another team member."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsTransferOpen(true)}
              >
                Transfer Ownership
              </Button>
            }
          />
        </Card>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Collaborator"
        subtitle="Send an email invite with role-tailored dashboard access."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsInviteOpen(false)} disabled={inviting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendInvite} loading={inviting}>
              Send Invitation
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendInvite} className="settings-fields-stack">
          <div className="settings-field">
            <label className="settings-field__label" htmlFor="invite-email">
              Colleague Email Address <span style={{ color: 'var(--color-status-error)' }}>*</span>
            </label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="e.g. devops.lead@acmeglobal.com"
              autoFocus
            />
          </div>

          <div className="settings-field">
            <label className="settings-field__label" htmlFor="invite-role">
              Platform Role
            </label>
            <select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <option value="Admin">Admin (Full playbook execution + billing + keys)</option>
              <option value="Analyst">Analyst (FRIDAY AI Chat + anomaly analysis)</option>
              <option value="Viewer">Viewer (Read-only dashboards & charts)</option>
            </select>
            <span className="settings-field__hint">
              You can adjust or revoke permissions at any time from this screen.
            </span>
          </div>
        </form>
      </Modal>

      {/* Remove Member Confirmation */}
      <ConfirmModal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} (${memberToRemove?.email}) from this business workspace? Their active sessions will be terminated immediately.`}
        confirmLabel="Remove Member"
        variant="danger"
        loading={isRemoving}
      />

      {/* Transfer Ownership Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Organization Ownership"
        subtitle="Transfer the primary root administrator role to another Admin on your team."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsTransferOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleTransferOwnership}>
              Confirm Transfer
            </Button>
          </>
        }
      >
        <div className="settings-fields-stack">
          <div className="settings-alert-banner settings-alert-banner--warning">
            <span className="settings-alert-banner__icon">⚠️</span>
            <div>
              You will be downgraded to <strong>Admin</strong> and will lose exclusive ownership controls (such as workspace deletion).
            </div>
          </div>

          <div className="settings-field" style={{ marginTop: 'var(--space-3)' }}>
            <label className="settings-field__label">Select New Owner</label>
            <select
              value={transferSuccessor}
              onChange={(e) => setTransferSuccessor(e.target.value)}
            >
              {members
                .filter((m) => m.role !== 'Owner')
                .map((m) => (
                  <option key={m.id} value={`${m.name} (${m.email})`}>
                    {m.name} — {m.email} ({m.role})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
