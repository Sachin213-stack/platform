import React from 'react';
import './FridayFloatingCompanion.css';
import { FridayVoiceOrb } from './FridayVoiceOrb';

export function FridayFloatingCompanion({
  isOpen,
  micState = 'idle',
  onExpand,
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`friday-floating-companion friday-floating-companion--${micState}`}
      onClick={onExpand}
      role="button"
      tabIndex={0}
      title="Click to expand FRIDAY Voice Companion"
      aria-label="Expand FRIDAY Voice Companion"
    >
      <div className="friday-floating-orb-wrapper">
        <FridayVoiceOrb
          micState={micState}
          size={54}
        />
      </div>

      <div className="friday-floating-info">
        <span className="friday-floating-name">FRIDAY</span>
        <span className="friday-floating-status">
          {micState === 'listening' && 'Listening...'}
          {micState === 'processing' && 'Thinking...'}
          {micState === 'speaking' && 'Speaking...'}
          {micState === 'idle' && 'Tap to talk'}
        </span>
      </div>

      <span className="friday-floating-expand-icon">⤢</span>
    </div>
  );
}
