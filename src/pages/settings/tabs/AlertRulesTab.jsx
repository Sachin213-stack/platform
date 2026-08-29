import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { useToast } from '../../../shared/components/Toast';

const INITIAL_RULES = [
  {
    id: 'rule_1',
    metric: 'Checkout Failure Rate',
    operator: '>=',
    threshold: '2.5',
    unit: '%',
    channels: ['Email', 'Slack', 'SMS'],
    cooldownMins: 15,
    enabled: true,
  },
  {
    id: 'rule_2',
    metric: '95th Percentile Response Time',
    operator: '>',
    threshold: '650',
    unit: 'ms',
    channels: ['Slack', 'In-app'],
    cooldownMins: 10,
    enabled: true,
  },
  {
    id: 'rule_3',
    metric: 'Storefront JS Error Rate',
    operator: '>=',
    threshold: '4.0',
    unit: '%',
    channels: ['Slack', 'Email'],
    cooldownMins: 30,
    enabled: true,
  },
  {
    id: 'rule_4',
    metric: 'Redis / Database Queue Lag',
    operator: '>',
    threshold: '120',
    unit: 'items',
    channels: ['Slack'],
    cooldownMins: 20,
    enabled: false,
  },
];

const AVAILABLE_CHANNELS = ['Email', 'Slack', 'SMS', 'In-app'];

const METRIC_OPTIONS = [
  { label: 'Checkout Failure Rate', unit: '%' },
  { label: '95th Percentile Response Time', unit: 'ms' },
  { label: 'Storefront JS Error Rate', unit: '%' },
  { label: 'HTTP 5xx Server Error Rate', unit: '%' },
  { label: 'Redis / Database Queue Lag', unit: 'items' },
  { label: 'CPU Core Saturation', unit: '%' },
  { label: 'Memory Leak Utilization', unit: '%' },
  { label: 'Cart Abandonment Anomaly Spike', unit: '%' },
];

export function AlertRulesTab() {
  const { addToast } = useToast();

  const [rules, setRules] = useState(INITIAL_RULES);
  const [sensitivity, setSensitivity] = useState(82); // 0-100%
  const [isSavingSensitivity, setIsSavingSensitivity] = useState(false);

  // Add Rule Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMetric, setNewMetric] = useState(METRIC_OPTIONS[0].label);
  const [newOperator, setNewOperator] = useState('>');
  const [newThreshold, setNewThreshold] = useState('500');
  const [newChannels, setNewChannels] = useState(['Email', 'Slack']);
  const [newCooldown, setNewCooldown] = useState(15);

  // Delete Confirm
  const [ruleToDelete, setRuleToDelete] = useState(null);

  const handleToggleRule = (ruleId, newStatus) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: newStatus } : r))
    );
    addToast(`Alert rule ${newStatus ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleThresholdChange = (ruleId, value) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, threshold: value } : r))
    );
  };

  const handleCooldownChange = (ruleId, value) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, cooldownMins: Number(value) || 0 } : r))
    );
  };

  const handleChannelToggle = (ruleId, channel) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        const exists = r.channels.includes(channel);
        const updated = exists
          ? r.channels.filter((c) => c !== channel)
          : [...r.channels, channel];
        return { ...r, channels: updated.length ? updated : ['In-app'] };
      })
    );
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    const metricMeta = METRIC_OPTIONS.find((m) => m.label === newMetric) || { unit: '' };
    const newRule = {
      id: `rule_${Date.now()}`,
      metric: newMetric,
      operator: newOperator,
      threshold: newThreshold,
      unit: metricMeta.unit,
      channels: newChannels.length ? newChannels : ['Email'],
      cooldownMins: Number(newCooldown) || 10,
      enabled: true,
    };

    setRules((prev) => [newRule, ...prev]);
    setIsAddOpen(false);
    addToast(`New alert rule for "${newMetric}" created`, 'success');
  };

  const handleDeleteConfirm = () => {
    if (!ruleToDelete) return;
    setRules((prev) => prev.filter((r) => r.id !== ruleToDelete.id));
    addToast(`Deleted rule for ${ruleToDelete.metric}`, 'info');
    setRuleToDelete(null);
  };

  const handleSaveSensitivity = () => {
    setIsSavingSensitivity(true);
    setTimeout(() => {
      setIsSavingSensitivity(false);
      addToast(`Platform-wide anomaly sensitivity updated to ${sensitivity}%`, 'success');
    }, 400);
  };

  const getSensitivityTier = (val) => {
    if (val < 50) return { label: 'Conservative (Fewer Alerts)', color: 'var(--color-status-info)' };
    if (val < 85) return { label: 'Balanced AI (Recommended)', color: 'var(--color-accent)' };
    return { label: 'High Vigilance (Proactive)', color: 'var(--color-status-warning)' };
  };

  const tier = getSensitivityTier(sensitivity);

  return (
    <div className="settings-tab-pane">
      <div className="settings-tab-pane__header">
        <h2 className="settings-tab-pane__title">Alert Rules & Incident Policies</h2>
        <p className="settings-tab-pane__subtitle">
          Configure threshold triggers, notification routing (Slack/SMS/Email), cooldown dampening, and ML anomaly sensitivity.
        </p>
      </div>

      <div className="settings-form-grid">
        {/* Global Sensitivity Slider */}
        <Card glow>
          <CardHeader
            title="Platform Anomaly Sensitivity"
            subtitle="Global baseline for statistical threshold deviations. Mirrored across all AI anomaly detectors."
          />
          <CardBody>
            <div className="sensitivity-slider-box">
              <div className="sensitivity-slider-box__header">
                <div>
                  <span className="sensitivity-score">{sensitivity}%</span>
                  <span className="sensitivity-label" style={{ color: tier.color }}>
                    ● {tier.label}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSensitivity}
                  loading={isSavingSensitivity}
                >
                  Apply Default
                </Button>
              </div>

              <input
                type="range"
                min="20"
                max="99"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="sensitivity-range-input"
              />

              <div className="sensitivity-ticks">
                <span>20% (Low Noise)</span>
                <span>50% (Standard)</span>
                <span>80% (Recommended)</span>
                <span>99% (Maximum Vigilance)</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Active Alert Rules Table/List */}
        <Card>
          <CardHeader
            title="Threshold Alert Policies"
            subtitle="Automated evaluations executed continuously against telemetry data streams."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                icon={
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="3" x2="8" y2="13" />
                    <line x1="3" y1="8" x2="13" y2="8" />
                  </svg>
                }
              >
                Add Rule
              </Button>
            }
          />
          <CardBody padding="none">
            <div className="settings-table-wrapper">
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Metric & Trigger Condition</th>
                    <th>Threshold</th>
                    <th>Notification Channels</th>
                    <th>Cooldown</th>
                    <th style={{ textAlign: 'center' }}>Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.id} style={{ opacity: r.enabled ? 1 : 0.6 }}>
                      <td>
                        <div className="settings-table__main-text">{r.metric}</div>
                        <div className="settings-table__sub-text">
                          Fires when metric is <strong>{r.operator} {r.threshold} {r.unit}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                            {r.operator}
                          </span>
                          <input
                            type="text"
                            value={r.threshold}
                            onChange={(e) => handleThresholdChange(r.id, e.target.value)}
                            style={{ width: '70px', padding: '4px 8px', textAlign: 'center' }}
                          />
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                            {r.unit}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="channel-chips-group">
                          {AVAILABLE_CHANNELS.map((ch) => {
                            const isSelected = r.channels.includes(ch);
                            return (
                              <button
                                key={ch}
                                type="button"
                                className={`channel-chip ${isSelected ? 'channel-chip--active' : ''}`}
                                onClick={() => handleChannelToggle(r.id, ch)}
                                title={`Toggle ${ch} notifications`}
                              >
                                {ch}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            value={r.cooldownMins}
                            onChange={(e) => handleCooldownChange(r.id, e.target.value)}
                            min="1"
                            max="720"
                            style={{ width: '65px', padding: '4px 8px', textAlign: 'center' }}
                          />
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                            min
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="ui-switch" style={{ verticalAlign: 'middle' }}>
                          <input
                            type="checkbox"
                            checked={r.enabled}
                            onChange={(e) => handleToggleRule(r.id, e.target.checked)}
                          />
                          <span className="ui-switch__slider" />
                        </label>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRuleToDelete(r)}
                          style={{ color: 'var(--color-status-error)' }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Add Rule Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Telemetry Alert Policy"
        subtitle="Create automated incident triggers for response time spikes, checkout drops, and errors."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddRule}>
              Save Rule
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddRule} className="settings-fields-stack">
          <div className="settings-field">
            <label className="settings-field__label">Target Metric</label>
            <select
              value={newMetric}
              onChange={(e) => setNewMetric(e.target.value)}
            >
              {METRIC_OPTIONS.map((m) => (
                <option key={m.label} value={m.label}>
                  {m.label} ({m.unit || 'unit'})
                </option>
              ))}
            </select>
          </div>

          <div className="settings-field-row">
            <div className="settings-field">
              <label className="settings-field__label">Comparison Operator</label>
              <select
                value={newOperator}
                onChange={(e) => setNewOperator(e.target.value)}
              >
                <option value=">">&gt; Greater Than</option>
                <option value=">=">&gt;= Greater Than or Equal</option>
                <option value="<">&lt; Less Than</option>
                <option value="<=">&lt;= Less Than or Equal</option>
              </select>
            </div>

            <div className="settings-field">
              <label className="settings-field__label">Threshold Value</label>
              <input
                type="text"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                placeholder="e.g. 500"
                required
              />
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-field__label">Notification Channels</label>
            <div className="channel-chips-group" style={{ marginTop: 'var(--space-1)' }}>
              {AVAILABLE_CHANNELS.map((ch) => {
                const isSelected = newChannels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    className={`channel-chip ${isSelected ? 'channel-chip--active' : ''}`}
                    onClick={() => {
                      setNewChannels((prev) =>
                        prev.includes(ch)
                          ? prev.filter((c) => c !== ch)
                          : [...prev, ch]
                      );
                    }}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-field__label">Alert Cooldown / Snooze (Minutes)</label>
            <input
              type="number"
              value={newCooldown}
              onChange={(e) => setNewCooldown(e.target.value)}
              min="1"
              max="1440"
            />
            <span className="settings-field__hint">
              Suppresses repetitive notifications if the breach continues consecutively within this time window.
            </span>
          </div>
        </form>
      </Modal>

      {/* Delete Rule Confirmation */}
      <ConfirmModal
        isOpen={Boolean(ruleToDelete)}
        onClose={() => setRuleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Alert Rule"
        message={`Are you sure you want to delete the alert policy for "${ruleToDelete?.metric}"? You will no longer receive alerts when this threshold is breached.`}
        confirmLabel="Delete Rule"
        variant="danger"
      />
    </div>
  );
}
