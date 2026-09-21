import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { ToggleRow } from '../../../shared/components/ToggleRow';
import { Badge } from '../../../shared/components/Badge';
import { AVAILABLE_VOICES, AVAILABLE_LLM_MODELS, AVAILABLE_REASONING_EFFORTS, INITIAL_SETTINGS } from './fridayData';

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
      title="FRIDAY Voice & Intelligence Configuration"
      subtitle="Configure Moonshot AI Kimi LLM models, neural speech synthesis, and voice parameters."
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
        {/* Section 0: Kimi (Moonshot AI) LLM Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-accent-light)', letterSpacing: '0.05em' }}>
              Moonshot AI (Kimi) Engine Tiers
            </h4>
            <Badge variant="teal" size="sm">Sole LLM Provider</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-2)' }}>
            {AVAILABLE_LLM_MODELS.map((m) => {
              const isSelected = (settings.selectedModel || 'moonshotai/kimi-k3') === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => onUpdateSettings({ selectedModel: m.id })}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text-primary)' }}>
                        {m.name}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {m.provider}
                      </span>
                    </div>
                    <Badge variant={isSelected ? 'teal' : 'neutral'} size="sm">
                      {m.badge}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', lineHeight: '1.3', margin: 0 }}>
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 0B: Reasoning Depth & Thinking Effort */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-accent-light)', letterSpacing: '0.05em' }}>
              Reasoning Depth & Thinking Effort
            </h4>
            <Badge variant="cyan" size="sm">User Controlled</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            {AVAILABLE_REASONING_EFFORTS.map((effort) => {
              const isSelected = (settings.reasoningEffort || 'medium') === effort.id;
              return (
                <div
                  key={effort.id}
                  onClick={() => onUpdateSettings({ reasoningEffort: effort.id })}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--color-accent-subtle)' : 'var(--color-bg-tertiary)',
                    border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: isSelected ? 'var(--color-accent-light)' : 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {effort.label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                    {effort.speed}
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', lineHeight: '1.2', margin: 0 }}>
                    {effort.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 1: Wake Engine & Hands-Free */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-accent-light)', letterSpacing: '0.05em' }}>
              Conversational Engine
            </h4>
            <Badge variant="amber" size="sm">Wake Word in Development</Badge>
          </div>
          <ToggleRow
            title="Continuous Hands-Free Dialogue"
            description="Keep the mic open for follow-up responses without pressing Spacebar after each answer."
            checked={settings.handsFree !== false}
            onChange={(val) => onUpdateSettings({ handsFree: val })}
            badge={<Badge variant="teal" size="sm">Active</Badge>}
          />
          <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-border-subtle)', fontSize: '11px', color: 'var(--color-text-tertiary)', lineHeight: '1.4' }}>
            ⚠️ <strong>Neural Wake Word (&quot;Hey FRIDAY&quot;):</strong> We are actively working on this component. Currently, activate voice via Spacebar or the mic orb, then enjoy uninterrupted continuous hands-free dialogue.
          </div>
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
