import React from 'react';
import { FridayVoiceOrb } from './FridayVoiceOrb';

export function FridayVoiceMic({
  micState,
  activeTranscription,
  activeSpeakingText,
  onMicPress,
  onMicRelease,
  onCancelVoice,
  onOpenImmersive,
}) {
  const handleClick = () => {
    if (micState === 'idle') {
      onMicPress();
    } else if (micState === 'listening') {
      onMicRelease();
    } else if (micState === 'speaking' || micState === 'processing') {
      onCancelVoice();
    }
  };

  return (
    <div className="friday-voice-stage">
      {/* Background ambient lighting */}
      <div className={`friday-voice-stage__ambient friday-voice-stage__ambient--${micState}`} />

      {/* Live status or transcription readout */}
      {micState === 'listening' && (
        <div className="friday-live-transcription">
          <span style={{ width: '8px', height: '8px', borderRadius: '99px', background: '#10b981', animation: 'pulse 1s infinite' }} />
          <span>{activeTranscription || 'Listening to your directive...'}</span>
        </div>
      )}

      {micState === 'processing' && (
        <div className="friday-live-transcription" style={{ borderColor: '#a855f7', color: '#c084fc' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '99px', background: '#a855f7', animation: 'pulse 1s infinite' }} />
          <span>Synthesizing intent & querying cluster telemetry...</span>
        </div>
      )}

      {micState === 'speaking' && (
        <div className="friday-live-transcription" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '99px', background: '#38bdf8' }} />
          <span style={{ maxWidth: '440px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{activeSpeakingText}"
          </span>
        </div>
      )}

      {/* Living Harmonic 3D Audio Orb */}
      <div className="friday-mic-container" style={{ margin: '16px 0' }}>
        <FridayVoiceOrb
          micState={micState}
          size={180}
          onClick={handleClick}
        />
      </div>

      {/* Action and Hint Controls */}
      <div className="friday-mic-status-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {micState === 'idle' && (
          <>
            <span>Tap the orb or hold</span>
            <span className="friday-hotkey-badge">Space</span>
            <span>to talk</span>
          </>
        )}
        {micState === 'listening' && (
          <span style={{ color: '#34d399' }}>
            Listening... Tap orb when finished speaking
          </span>
        )}
        {micState === 'processing' && (
          <span style={{ color: '#c084fc' }}>
            FRIDAY AI reasoning & telemetry analysis...
          </span>
        )}
        {micState === 'speaking' && (
          <button
            type="button"
            onClick={onCancelVoice}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ⏹️ Tap to Interrupt Speech
          </button>
        )}

        {onOpenImmersive && (
          <button
            type="button"
            onClick={onOpenImmersive}
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: '8px',
            }}
          >
            ⤢ Fullscreen Companion View
          </button>
        )}
      </div>
    </div>
  );
}
