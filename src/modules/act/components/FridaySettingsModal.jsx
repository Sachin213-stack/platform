import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { ToggleRow } from '../../../shared/components/ToggleRow';
import { Badge } from '../../../shared/components/Badge';
import { AVAILABLE_VOICES, INITIAL_SETTINGS } from './fridayData';

export function FridaySettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) {
  const [meterLevel, setMeterLevel] = useState(25);

  // Simulate dynamic live mic input meter while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const base = (settings.micSensitivity / 100) * 45;
      const jitter = Math.random() * 25;
      setMeterLevel(Math.min(100, Math.max(5, base + jitter)));
    }, 180);
    return () => clearInterval(interval);
  }, [isOpen, settings.micSensitivity]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="FRIDAY Voice & Synthesis Configuration"
      subtitle="Configure speech recognition, wake engine, and synthetic neural voice parameters."
      maxWidth="580px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdateSettings(INITIAL_SETTINGS)}
          >
            Reset Defaults
          </Button>
          <Button variant="primary" size="md" onClick={onClose}>
            Save Preferences
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Section 1: Wake Word */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h4 style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-accent-light)', letterSpacing: '0.05em' }}>
            Wake Engine
          </h4>
          <ToggleRow
            title="Hands-Free Wake Word"
            description={`Activate FRIDAY automatically when you say "${settings.wakeWordPhrase}".`}
            checked={settings.wakeWordEnabled}
            onChange={(val) => onUpdateSettings({ wakeWordEnabled: val })}
            badge={<Badge variant="violet" size="sm">Neural VAD</Badge>}
          />
        </div>

        {/* Section 2: Voice Model Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h4 style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-accent-light)', letterSpacing: '0.05em' }}>
            Synthetic Voice Model
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            {AVAILABLE_VOICES.map((v) => {
              const isSelected = settings.selectedVoice === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => onUpdateSettings({ selectedVoice: v.id })}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--color-accent-subtle)' : 'var(--color-bg-tertiary)',
                    border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
                      {v.name.split(' (')[0]}
                    </span>
                    <Badge variant={isSelected ? 'violet' : 'neutral'} size="sm">
                      {v.badge}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', lineHeight: '1.3' }}>
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Audio Dynamics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h4 style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-accent-light)', letterSpacing: '0.05em' }}>
            Input & Synthesis Dynamics
          </h4>
          
          <div style={{ background: 'var(--color-bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Mic Sensitivity Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                <span>Microphone Input Sensitivity</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-light)' }}>{settings.micSensitivity}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={settings.micSensitivity}
                onChange={(e) => onUpdateSettings({ micSensitivity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-accent)' }}
              />
              {/* Gain Meter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>Live Gain:</span>
                <div style={{ flex: 1, height: '6px', background: 'var(--color-bg-secondary)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${meterLevel}%`,
                      background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)',
                      transition: 'width 150ms ease',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Speech Rate Slider */}
            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                <span>TTS Speech Playback Rate</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-light)' }}>{settings.speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.1"
                value={settings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-accent)' }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Noise Suppression & Sound Effects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <ToggleRow
            title="Active Noise Suppression"
            description="Filter background keyboard strokes and ambient noise via spectral subtraction."
            checked={settings.noiseSuppression}
            onChange={(val) => onUpdateSettings({ noiseSuppression: val })}
          />
          <ToggleRow
            title="Sci-Fi UI Audio FX"
            description="Play subtle synth chirps on voice recognition start and completion."
            checked={settings.soundEffects}
            onChange={(val) => onUpdateSettings({ soundEffects: val })}
          />
        </div>
      </div>
    </Modal>
  );
}
