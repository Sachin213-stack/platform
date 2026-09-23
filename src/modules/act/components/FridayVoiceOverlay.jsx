import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FridayVoiceOverlay.css';
import { FridayVoiceOrb } from './FridayVoiceOrb';
import { voiceEngine } from '../services/voiceEngine';
import { soundFX } from './soundFX';
import { fridayApi } from '../../../shared/services/apiClient';
import { fridayMemory } from '../services/fridayMemoryService';
import { FridaySettingsModal } from './FridaySettingsModal';
import { INITIAL_SETTINGS } from './fridayData';

export function FridayVoiceOverlay({
  isOpen,
  onClose,
  onMinimize,
  activeRoute = 'dashboard',
  analyticsContext = null,
  onActionExecuted = null,
}) {
  const [micState, setMicState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [interimText, setInterimText] = useState('');
  const [activeSpeechText, setActiveSpeechText] = useState('');
  const [messages, setMessages] = useState(() => fridayMemory.getMessages());
  const [stagedAction, setStagedAction] = useState(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [screenVisionActive, setScreenVisionActive] = useState(true);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [connectionLatency] = useState(18);

  const transcriptScrollRef = useRef(null);
  const startListeningSessionRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Subscribe to shared memory updates (so chat & voice remain perfectly in sync)
  useEffect(() => {
    const unsubscribe = fridayMemory.subscribe((newMsgs) => {
      setMessages(newMsgs);
    });
    return unsubscribe;
  }, []);

  // Sync settings with voiceEngine
  useEffect(() => {
    voiceEngine.updateSettings({
      selectedVoice: settings.selectedVoice,
      speechRate: settings.speechRate,
      speechPitch: settings.speechPitch,
      handsFree: true,
      vadSensitivityMs: 1100,
    });
    soundFX.setEnabled(settings.soundEffects);
  }, [settings]);

  // Auto-scroll transcript drawer
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [messages, stagedAction]);

  // ─────────────────────────────────────────────────────────────────
  // Omniscient Context Gathering ("See Everything")
  // ─────────────────────────────────────────────────────────────────
  const buildOmniscientContext = useCallback(() => {
    const ctx = {
      active_route: activeRoute,
      timestamp: new Date().toISOString(),
      screen_vision_enabled: screenVisionActive,
    };

    if (analyticsContext) {
      ctx.vitals = {
        crash_risk_pct: analyticsContext.liveCrashRisk,
        headroom_pct: analyticsContext.liveHeadroom,
        active_anomalies_count: analyticsContext.activeAnomaliesCount,
        anomalies: (analyticsContext.anomalies || []).slice(0, 3).map((a) => ({
          service: a.service,
          title: a.title,
          severity: a.severity,
          deviation: a.deviation,
        })),
      };
    }

    // Viewport Vision summary
    if (screenVisionActive && typeof document !== 'undefined') {
      const activeHeading = document.querySelector('h1, h2')?.textContent || '';
      const visibleBadges = Array.from(document.querySelectorAll('.badge, [class*="badge"]'))
        .map((el) => el.textContent.trim())
        .slice(0, 5);
      ctx.viewport_summary = {
        visible_heading: activeHeading,
        active_kpis: visibleBadges,
      };
    }

    return ctx;
  }, [activeRoute, analyticsContext, screenVisionActive]);

  // ─────────────────────────────────────────────────────────────────
  // Action Execution ("Do Everything")
  // ─────────────────────────────────────────────────────────────────
  const executeAction = useCallback(async (action) => {
    setIsExecutingAction(true);
    soundFX.playMicStart();

    try {
      const res = await fridayApi.executeAction({
        action_type: action.action_type,
        service: action.service,
        params: action.params,
        conversation_id: fridayMemory.getConversationId(),
      });

      setIsExecutingAction(false);
      setStagedAction(null);
      soundFX.playSuccessChime();

      if (onActionExecuted) onActionExecuted(res);

      const confirmMsg = `Executed ${action.action_type.replace(/_/g, ' ')} on ${action.service}. Target status is healthy.`;
      fridayMemory.appendTurn('friday', `✅ ${confirmMsg}`);

      setActiveSpeechText(confirmMsg);
      setMicState('speaking');

      voiceEngine.playNeuralSpeech(confirmMsg, {
        voice: settings.selectedVoice,
        rate: settings.speechRate,
        onEnd: () => {
          setMicState('idle');
          setActiveSpeechText('');
          if (settings.handsFree !== false && startListeningSessionRef.current) {
            setTimeout(() => {
              if (!isProcessingRef.current) {
                startListeningSessionRef.current();
              }
            }, 700);
          }
        },
      });
    } catch (err) {
      setIsExecutingAction(false);
      const failMsg = `Action failed: ${err.message || 'Cluster API error'}.`;
      setActiveSpeechText(failMsg);
      voiceEngine.fallbackBrowserSpeech(failMsg, 1.0, settings.selectedVoice);
    }
  }, [onActionExecuted, settings.selectedVoice, settings.speechRate, settings.handsFree]);

  // ─────────────────────────────────────────────────────────────────
  // Voice Turn Dispatcher (STT -> LLM -> Streaming TTS)
  // ─────────────────────────────────────────────────────────────────
  const handleUserUtterance = useCallback(async (userText) => {
    if (!userText || !userText.trim()) {
      setMicState('idle');
      return;
    }

    // Guard: Prevent duplicate dispatches from concurrent VAD and UI click events
    if (isProcessingRef.current) return;

    // 1. Guard against trailing assistant speech acoustic echo
    if (voiceEngine.isPlayingAudio || (typeof window !== 'undefined' && window.speechSynthesis?.speaking)) {
      console.debug('Acoustic guard: dropping utterance during active speech');
      return;
    }
    const timeSinceSpeech = Date.now() - (voiceEngine.lastSpeechEndTime || 0);
    if (timeSinceSpeech < 900) {
      console.debug('Acoustic guard: dropping room acoustic tail utterance');
      return;
    }

    // 2. Guard against speech recognition picking up the assistant's own output (self-echo)
    const lastSpoken = (voiceEngine.lastSpokenText || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const normalizedUser = userText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    if (lastSpoken && normalizedUser.length >= 6) {
      if (lastSpoken.includes(normalizedUser) || normalizedUser.includes(lastSpoken.slice(0, 30))) {
        console.warn('Echo filter: dropped microphone loopback of assistant speech:', userText);
        setMicState('idle');
        setInterimText('');
        return;
      }
    }

    isProcessingRef.current = true;

    // Check for verbal action confirmation ("confirm", "yes", "do it", "execute")
    const lower = userText.toLowerCase().trim();
    if (stagedAction && (lower.includes('confirm') || lower === 'yes' || lower.includes('do it') || lower.includes('execute'))) {
      executeAction(stagedAction);
      isProcessingRef.current = false;
      return;
    }

    setMicState('processing');
    soundFX.playMicStop();
    setInterimText('');

    fridayMemory.appendTurn('user', userText);

    const hints = buildOmniscientContext();

    try {
      // Call Friday chat API with mode="voice" and shared conversation_id
      const res = await fridayApi.sendMessage({
        message: userText,
        conversation_id: fridayMemory.getConversationId(),
        mode: 'voice',
        model: settings.selectedModel || 'moonshotai/kimi-k3',
        context_hints: hints,
      });

      const proposedActions = res.suggested_actions || [];
      const reply = res.response || res.content || (proposedActions.length > 0 ? 'Mitigation action proposed. Ready to execute on your confirmation.' : 'All systems nominal.');

      if (proposedActions.length > 0) {
        setStagedAction(proposedActions[0]);
      } else {
        setStagedAction(null);
      }

      fridayMemory.appendTurn('friday', reply, proposedActions);

      setActiveSpeechText(reply);
      setMicState('speaking');

      // Play Neural Speech
      await voiceEngine.playNeuralSpeech(reply, {
        voice: settings.selectedVoice,
        rate: settings.speechRate,
        onEnd: () => {
          setMicState('idle');
          setActiveSpeechText('');
          soundFX.playSuccessChime();
          // Wait 900ms for completion chime to finish and room acoustic tail to clear
          if (settings.handsFree !== false && startListeningSessionRef.current) {
            setTimeout(() => {
              if (!isProcessingRef.current && !voiceEngine.isPlayingAudio) {
                startListeningSessionRef.current();
              }
            }, 900);
          }
        },
      });
    } catch (err) {
      console.error('Voice processing failed:', err);
      setMicState('idle');
      const errReply = `I ran into an issue reaching the neural core: ${err.message || 'Network error'}.`;
      setActiveSpeechText(errReply);
      voiceEngine.fallbackBrowserSpeech(errReply, 1.0, settings.selectedVoice, () => {
        setActiveSpeechText('');
        if (settings.handsFree !== false && startListeningSessionRef.current) {
          setTimeout(() => {
            if (!isProcessingRef.current && !voiceEngine.isPlayingAudio) {
              startListeningSessionRef.current();
            }
          }, 900);
        }
      });
    } finally {
      isProcessingRef.current = false;
    }
  }, [stagedAction, buildOmniscientContext, settings, executeAction]);


  // ─────────────────────────────────────────────────────────────────
  // Mic Control & State Management
  // ─────────────────────────────────────────────────────────────────
  const startListeningSession = useCallback(() => {
    // Safety check: ensure assistant is not currently speaking before opening mic
    if (voiceEngine.isPlayingAudio || (typeof window !== 'undefined' && window.speechSynthesis?.speaking)) {
      console.debug('Delaying startListeningSession: assistant is still speaking');
      setTimeout(() => {
        if (startListeningSessionRef.current) startListeningSessionRef.current();
      }, 500);
      return;
    }
    soundFX.playMicStart();
    setInterimText('Listening to you...');
    voiceEngine.startListening({
      onStateChange: (state) => setMicState(state),
      onInterimTranscript: (text) => setInterimText(text),
      onFinalTranscript: (text) => handleUserUtterance(text),
      onError: (err) => {
        console.warn('VoiceEngine error:', err);
        setMicState('idle');
        const errMsg = err?.message || 'Voice input interrupted.';
        setInterimText(`⚠️ ${errMsg}`);
      },
    });
  }, [handleUserUtterance]);

  useEffect(() => {
    startListeningSessionRef.current = startListeningSession;
  }, [startListeningSession]);

  const toggleMic = useCallback(() => {
    if (micState === 'listening') {
      voiceEngine.stopListening();
      const text = interimText.replace('Listening to you...', '').trim();
      if (text) {
        handleUserUtterance(text);
      } else {
        setMicState('idle');
        setInterimText('');
      }
    } else if (micState === 'speaking' || micState === 'processing') {
      voiceEngine.interrupt();
      setMicState('idle');
      setActiveSpeechText('');
      setInterimText('');
    } else {
      startListeningSession();
    }
  }, [micState, interimText, handleUserUtterance, startListeningSession]);

  const handleInterrupt = useCallback(() => {
    voiceEngine.interrupt();
    setMicState('idle');
    setActiveSpeechText('');
    setInterimText('');
    soundFX.playMicStop();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleMic();
      }
      if (e.key === 'Escape') {
        if (micState !== 'idle') {
          handleInterrupt();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, micState, toggleMic, handleInterrupt, onClose]);


  // Clean up voice engine on unmount or when overlay closes
  useEffect(() => {
    if (!isOpen) {
      voiceEngine.interrupt();
      voiceEngine.stopListening();
    }
    return () => {
      voiceEngine.interrupt();
      voiceEngine.stopListening();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="friday-voice-overlay-backdrop" role="dialog" aria-modal="true">
      {/* Dynamic Ambient Space Glow */}
      <div className={`friday-voice-backdrop-glow friday-voice-backdrop-glow--${micState}`} />

      {/* ── Top Floating Navigation HUD ───────────────────────────── */}
      <div className="friday-voice-top-hud">
        <div className="friday-voice-hud-left">
          <div className="friday-voice-brand">
            <span className="friday-voice-sparkle">✦</span>
            <span className="friday-voice-brand-title">FRIDAY</span>
            <span className="friday-voice-brand-subtitle">AI-CTO Voice Companion</span>
          </div>

          <div className="friday-voice-status-pill">
            <span className={`friday-status-dot friday-status-dot--${micState}`} />
            <span className="friday-status-text">
              {micState === 'listening' && 'Listening...'}
              {micState === 'processing' && 'Reasoning with Kimi K3...'}
              {micState === 'speaking' && 'Speaking...'}
              {micState === 'idle' && (settings.handsFree !== false ? 'Ready • Continuous Voice Active' : 'Ready • Push-to-Talk')}
            </span>
            <span className="friday-status-latency">• {connectionLatency}ms</span>
          </div>
        </div>

        <div className="friday-voice-hud-right">
          {/* Screen Vision Badge */}
          <button
            type="button"
            className={`friday-hud-btn ${screenVisionActive ? 'friday-hud-btn--active' : ''}`}
            onClick={() => setScreenVisionActive((prev) => !prev)}
            title="Toggle Screen Vision (lets FRIDAY see current screen charts and anomalies)"
          >
            <span>{screenVisionActive ? '👁️ Screen Vision: Active' : '👁️ Screen Vision: Off'}</span>
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            className="friday-hud-icon-btn"
            onClick={onMinimize}
            title="Minimize to Floating Companion Pill"
            aria-label="Minimize"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            type="button"
            className="friday-hud-icon-btn"
            onClick={() => {
              handleInterrupt();
              onClose();
            }}
            title="Close Voice Assistant (Esc)"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Central Showcase: Living Harmonic Audio Orb ────────────── */}
      <div className="friday-voice-stage-center">
        <div className="friday-voice-orb-wrapper">
          <FridayVoiceOrb
            micState={micState}
            size={280}
            onClick={toggleMic}
          />
        </div>

        {/* Real-time Subtitle Ticker */}
        <div className="friday-voice-subtitles-container">
          {micState === 'listening' && (
            <div className="friday-voice-subtitles friday-voice-subtitles--user">
              <span>{interimText || 'Listening... Speak your directive'}</span>
            </div>
          )}

          {micState === 'processing' && (
            <div className="friday-voice-subtitles friday-voice-subtitles--processing">
              <span className="friday-voice-typing-dot" />
              <span>Analyzing live cluster telemetry & computing response...</span>
            </div>
          )}

          {micState === 'speaking' && (
            <div className="friday-voice-subtitles friday-voice-subtitles--assistant">
              <span>"{activeSpeechText}"</span>
            </div>
          )}

          {micState === 'idle' && (
            <div className="friday-voice-subtitles friday-voice-subtitles--idle">
              <span>
                {settings.handsFree !== false
                  ? 'Continuous voice active — speak naturally or press Space'
                  : 'Tap the orb or press Space to talk'}
              </span>
            </div>
          )}
        </div>

        {/* Interactive Staged Action Card (When mitigation is proposed) */}
        {stagedAction && (
          <div className="friday-staged-action-popup animate-fadeIn">
            <div className="friday-staged-action-header">
              <span className="friday-staged-action-tag">⚡ Autonomous Action Proposed</span>
              <span className="friday-staged-action-hint">Say "Confirm" or tap below</span>
            </div>
            <div className="friday-staged-action-title">
              {stagedAction.action_type.replace(/_/g, ' ').toUpperCase()} on <code>{stagedAction.service}</code>
            </div>
            <p className="friday-staged-action-desc">{stagedAction.rationale}</p>
            <div className="friday-staged-action-actions">
              <button
                type="button"
                className="friday-action-confirm-btn"
                disabled={isExecutingAction}
                onClick={() => executeAction(stagedAction)}
              >
                {isExecutingAction ? 'Executing Zero-Downtime Mitigation...' : 'Confirm & Execute Action'}
              </button>
              <button
                type="button"
                className="friday-action-cancel-btn"
                onClick={() => setStagedAction(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sliding Transcript Drawer ─────────────────────────────── */}
      {showTranscript && (
        <div className="friday-voice-transcript-drawer animate-slideUp">
          <div className="friday-transcript-drawer-header">
            <h4>Conversation & Action History</h4>
            <button
              type="button"
              className="friday-hud-icon-btn"
              onClick={() => setShowTranscript(false)}
            >
              ✕
            </button>
          </div>
          <div ref={transcriptScrollRef} className="friday-transcript-drawer-body">
            {messages.length === 0 ? (
              <p className="friday-transcript-empty">No conversation turns yet in this voice session.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`friday-drawer-msg friday-drawer-msg--${m.sender}`}
                >
                  <div className="friday-drawer-msg-meta">
                    <strong>{m.sender === 'user' ? 'You' : 'FRIDAY'}</strong> • {m.time}
                  </div>
                  <div className="friday-drawer-msg-content">{m.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Bottom Floating Control Bar (ChatGPT Style) ─────────────── */}
      <div className="friday-voice-bottom-controls">
        {/* Mic Toggle Button */}
        <button
          type="button"
          className={`friday-control-pill-btn friday-control-pill-btn--mic ${micState === 'listening' ? 'friday-control-pill-btn--active' : ''}`}
          onClick={toggleMic}
          aria-label={micState === 'listening' ? 'Finish speaking' : 'Start speaking'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
          <span>{micState === 'listening' ? 'Finish' : 'Speak'}</span>
        </button>

        {/* Instant Interrupt Button */}
        <button
          type="button"
          className="friday-control-pill-btn"
          disabled={micState === 'idle'}
          onClick={handleInterrupt}
          title="Instant Interrupt (Pause speaking and listen)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          <span>Interrupt</span>
        </button>

        {/* Transcript Drawer Toggle */}
        <button
          type="button"
          className={`friday-control-pill-btn ${showTranscript ? 'friday-control-pill-btn--active' : ''}`}
          onClick={() => setShowTranscript((prev) => !prev)}
          title="Toggle conversation transcript history"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Transcript</span>
        </button>

        {/* Voice Settings Gear Button */}
        <button
          type="button"
          className="friday-control-pill-btn"
          onClick={() => setIsSettingsOpen(true)}
          title="Configure voice engine, neural models, and audio"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Voice</span>
        </button>
      </div>

      {/* Voice Settings Modal */}
      <FridaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
      />
    </div>
  );
}
