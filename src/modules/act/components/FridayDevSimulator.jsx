import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { SIMULATION_PRESETS } from './fridayData';

export function FridayDevSimulator({
  micState,
  isSimulating,
  onTriggerSimulation,
  onStepState,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(SIMULATION_PRESETS[0].id);

  const handleSimulate = () => {
    const preset = SIMULATION_PRESETS.find((p) => p.id === selectedPresetId) || SIMULATION_PRESETS[0];
    onTriggerSimulation(preset);
  };

  return (
    <div className="friday-dev-simulator">
      {isExpanded ? (
        <div className="friday-dev-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-light)' }}>
                DEV VOICE SIMULATOR
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: '12px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Current State:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--color-accent-light)', textTransform: 'uppercase' }}>
              {micState}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              Preset Directive:
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 6px',
                color: 'var(--color-text-primary)',
                fontSize: '11px',
              }}
            >
              {SIMULATION_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            <Button
              variant="primary"
              size="sm"
              disabled={isSimulating}
              onClick={handleSimulate}
            >
              Simulate Cycle
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onStepState}
            >
              Step State
            </Button>
          </div>
        </div>
      ) : (
        <button
          className="friday-dev-pill"
          onClick={() => setIsExpanded(true)}
          title="Open Dev Voice Simulator"
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '99px', background: 'var(--color-accent)' }} />
          <span>Simulate Voice</span>
        </button>
      )}
    </div>
  );
}
