import React from 'react';

export function FridayVoiceMic({
  micState,
  activeTranscription,
  activeSpeakingText,
  onMicPress,
  onMicRelease,
  onCancelVoice,
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
      <div className="friday-voice-stage__ambient" />

      {/* Live status or transcription readout */}
      {micState === 'listening' && (
        <div className="friday-live-transcription">
          <span style={{ width: '8px', height: '8px', borderRadius: '99px', background: 'var(--color-accent)', animation: 'pulse 1s infinite' }} />
          <span>{activeTranscription || 'Listening for speech input...'}</span>
        </div>
      )}

      {micState === 'processing' && (
        <div className="friday-live-transcription" style={{ borderColor: '#a855f7', color: '#a855f7' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '99px', background: '#a855f7', animation: 'pulse 1s infinite' }} />
          <span>Synthesizing intent & querying cluster telemetry...</span>
        </div>
      )}

      {micState === 'speaking' && (
        <div className="friday-live-transcription" style={{ borderColor: 'var(--color-status-success)', color: 'var(--color-status-success)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '99px', background: 'var(--color-status-success)' }} />
          <span style={{ maxWidth: '420px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{activeSpeakingText}"
          </span>
        </div>
      )}

      {/* Hero Mic Button Container */}
      <div className="friday-mic-container">
        {/* Ripple Rings (Listening) */}
        {micState === 'listening' && (
          <>
            <div className="friday-mic-ripple" />
            <div className="friday-mic-ripple friday-mic-ripple--delayed" />
          </>
        )}

        {/* Orbital Spinning Rings (Processing) */}
        {micState === 'processing' && (
          <>
            <div className="friday-mic-orbit" />
            <div className="friday-mic-orbit friday-mic-orbit--inner" />
          </>
        )}

        {/* Main Hero Button */}
        <button
          id="friday-mic-action-button"
          onClick={handleClick}
          aria-label={
            micState === 'idle'
              ? 'Start voice listening'
              : micState === 'listening'
              ? 'Finish speaking'
              : 'Interrupt speech'
          }
          className={`friday-mic-btn friday-mic-btn--${micState}`}
        >
          {/* State 1: IDLE */}
          {micState === 'idle' && (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}

          {/* State 2: LISTENING */}
          {micState === 'listening' && (
            <div className="friday-equalizer-bars">
              <span className="friday-equalizer-bar" style={{ background: '#ffffff' }} />
              <span className="friday-equalizer-bar" style={{ background: '#ffffff' }} />
              <span className="friday-equalizer-bar" style={{ background: '#ffffff' }} />
              <span className="friday-equalizer-bar" style={{ background: '#ffffff' }} />
              <span className="friday-equalizer-bar" style={{ background: '#ffffff' }} />
            </div>
          )}

          {/* State 3: PROCESSING / THINKING */}
          {micState === 'processing' && (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1.5s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}

          {/* State 4: SPEAKING */}
          {micState === 'speaking' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div className="friday-equalizer-bars">
                <span className="friday-equalizer-bar" style={{ background: 'var(--color-status-success)' }} />
                <span className="friday-equalizer-bar" style={{ background: 'var(--color-status-success)' }} />
                <span className="friday-equalizer-bar" style={{ background: 'var(--color-status-success)' }} />
                <span className="friday-equalizer-bar" style={{ background: 'var(--color-status-success)' }} />
                <span className="friday-equalizer-bar" style={{ background: 'var(--color-status-success)' }} />
              </div>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-status-error)' }}>
                Stop
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Subtitle & Keyboard Hint */}
      <div className="friday-mic-status-label">
        {micState === 'idle' && (
          <>
            <span>Tap to speak or hold</span>
            <span className="friday-hotkey-badge">Space</span>
          </>
        )}
        {micState === 'listening' && (
          <span style={{ color: 'var(--color-accent-light)' }}>
            Listening... Tap when finished speaking
          </span>
        )}
        {micState === 'processing' && (
          <span style={{ color: '#a855f7' }}>
            FRIDAY AI reasoning & telemetry analysis...
          </span>
        )}
        {micState === 'speaking' && (
          <span style={{ color: 'var(--color-status-success)' }}>
            FRIDAY is speaking... Tap button to interrupt
          </span>
        )}
      </div>
    </div>
  );
}
