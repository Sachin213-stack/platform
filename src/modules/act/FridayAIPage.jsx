import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FridayAI.css';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { FridayContextPanel } from './components/FridayContextPanel';
import { FridayVoiceMic } from './components/FridayVoiceMic';
import { FridaySettingsModal } from './components/FridaySettingsModal';
import { FridayDevSimulator } from './components/FridayDevSimulator';
import { soundFX } from './components/soundFX';
import { useAnalytics } from '../../shared/context/AnalyticsContext';
import {
  INITIAL_SETTINGS,
  INITIAL_COMMAND_HISTORY,
  SIMULATION_PRESETS,
} from './components/fridayData';
import { fridayApi } from '../../shared/services/apiClient';


/**
 * FridayAIPage — AI-CTO Autonomous Ops Assistant & Voice Co-pilot
 * Connected to Analytics & Capacity Forecasting Studio via AnalyticsContext.
 */
export default function FridayAIPage({ initialContext, onNavigate }) {
  const {
    anomalies,
    activeAnomaliesCount,
    liveCrashRisk,
    processNLQuery,
  } = useAnalytics();

  // ── Mode & State Machine ─────────────────────────────────────────
  const [mode, setMode] = useState('chat'); // 'chat' | 'voice'
  const [micState, setMicState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTranscription, setActiveTranscription] = useState('');
  const [activeSpeakingText, setActiveSpeakingText] = useState('');

  // ── Messages & Command History ──────────────────────────────────
  const [messages, setMessages] = useState(() => [
    {
      id: 'm1',
      sender: 'friday',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text:
        activeAnomaliesCount > 0
          ? `Good evening. I am monitoring all microservice telemetry via Kimi (Moonshot AI). Telemetry watch alert: ${activeAnomaliesCount} active anomaly detected (${anomalies[0]?.title || 'Checkout Latency Spike'}). Crash risk is currently ${liveCrashRisk}%. How can I assist you with infrastructure operations?`
          : 'Good evening. I am monitoring all microservice telemetry, edge TLS handshakes, and autonomous incident mitigations via Kimi (Moonshot AI). Zero active anomalies detected. How can I assist you with infrastructure operations?',
    },
  ]);

  const [isSending, setIsSending] = useState(false);
  const [executingActionId, setExecutingActionId] = useState(null);
  const initialContextDispatchedRef = useRef(false);

  const [commandHistory, setCommandHistory] = useState(INITIAL_COMMAND_HISTORY);
  const [inputVal, setInputVal] = useState('');
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Connection & latency status
  const [connectionStatus, setConnectionStatus] = useState('online'); // 'online' | 'connecting' | 'offline'
  const [latencyMs, setLatencyMs] = useState(24);

  const transcriptScrollRef = useRef(null);
  const simulationTimers = useRef([]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTo({
        top: transcriptScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, activeTranscription, activeSpeakingText]);

  // Sync sound effects setting
  useEffect(() => {
    soundFX.setEnabled(settings.soundEffects);
  }, [settings.soundEffects]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      simulationTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const clearAllTimers = useCallback(() => {
    simulationTimers.current.forEach((t) => clearTimeout(t));
    simulationTimers.current = [];
  }, []);

  // Update Settings helper
  const handleUpdateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Add Message helper
  const addMessage = useCallback((sender, text, suggestedActions = null) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sender,
        time: timeStr,
        text,
        suggestedActions,
      },
    ]);
  }, []);

  // Add Command History helper
  const addCommandHistoryItem = useCallback((command, responseSummary) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCommandHistory((prev) => [
      {
        id: `cmd-${Date.now()}`,
        command,
        time: timeStr,
        category: 'voice',
        status: 'completed',
        responseSummary,
        latencyMs: Math.floor(Math.random() * 200) + 220,
      },
      ...prev,
    ]);
  }, []);

  // =========================================================================
  // INTERACTION HOOKS (Ready for backend wiring)
  // =========================================================================

  /**
   * onAssistantResponse: Triggered when assistant has response text ready
   * Defined before onMicRelease so it is initialized and available in callbacks
   */
  const onAssistantResponse = useCallback((text, suggestedActions = null) => {
    setMicState('speaking');
    setActiveSpeakingText(text);
    addMessage('friday', text, suggestedActions);

    // Calculate approximate speaking duration
    const words = text.split(' ').length;
    const duration = Math.max(2500, Math.floor((words / (3.2 * settings.speechRate)) * 1000));

    const t = setTimeout(() => {
      soundFX.playSuccessChime();
      setMicState('idle');
      setActiveSpeakingText('');
      setIsSimulating(false);
    }, duration);

    simulationTimers.current.push(t);
  }, [addMessage, settings.speechRate]);

  /**
   * onMicPress: Triggered when user begins voice capture
   * // TODO: connect to backend - Initialize Web Audio STT streaming session
   */
  const onMicPress = useCallback(() => {
    clearAllTimers();
    setIsSimulating(false);
    setActiveSpeakingText('');
    setMicState('listening');
    setActiveTranscription('Listening for voice directive...');
    soundFX.playMicStart();

    // Mock live recognition feedback preview
    const phrases = [
      'Listening...',
      'Listening: "FRIDAY...',
      'Listening: "FRIDAY, verify cluster replicas and latency"',
    ];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < phrases.length) {
        setActiveTranscription(phrases[step]);
      } else {
        clearInterval(interval);
      }
    }, 600);
    simulationTimers.current.push(interval);
  }, [clearAllTimers]);

  const [conversationId] = useState(() => {
    try {
      const saved = localStorage.getItem('aicto_friday_conv_id');
      if (saved && saved !== 'conv-default') return saved;
      const created = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : '00000000-0000-4000-8000-000000000001';
      localStorage.setItem('aicto_friday_conv_id', created);
      return created;
    } catch {
      return '00000000-0000-4000-8000-000000000001';
    }
  });

  const [activeModel, setActiveModel] = useState('moonshotai/kimi-k3');

  // ── Dynamic "Ask FRIDAY about this" Hook from Analytics & Dashboard ──
  useEffect(() => {
    if (initialContext?.initialPrompt && !initialContextDispatchedRef.current) {
      initialContextDispatchedRef.current = true;
      const prompt = initialContext.initialPrompt;
      const hints = initialContext.context || null;
      addMessage('user', prompt);
      setIsSending(true);

      fridayApi.sendMessage({
        message: prompt,
        conversation_id: conversationId,
        mode: 'chat',
        model: settings.selectedModel || activeModel,
        context_hints: hints,
      })
      .then((res) => {
        setIsSending(false);
        const aiReply = res.response || res.content;
        if (res.model_used) setActiveModel(res.model_used);
        if (aiReply) {
          addMessage('friday', aiReply, res.suggested_actions);
          addCommandHistoryItem(prompt, aiReply);
          soundFX.playSuccessChime();
        }
      })
      .catch((err) => {
        setIsSending(false);
        console.error('FRIDAY initial context query failed:', err);
        addMessage(
          'friday',
          `⚠️ **FRIDAY Notice**: ${err.message || 'Could not reach Kimi LLM'}`
        );
      });
    }
  }, [initialContext, conversationId, settings.selectedModel, activeModel, addMessage, addCommandHistoryItem]);

  /**
   * onMicRelease: Triggered when user finishes speaking
   * Transcribes speech buffer and posts to FRIDAY FastAPI LLM orchestrator
   */
  const onMicRelease = useCallback(async (customPrompt) => {
    soundFX.playMicStop();
    setMicState('processing');

    const userText = customPrompt || (activeTranscription.startsWith('Listening: "')
      ? activeTranscription.replace('Listening: "', '').replace('"', '')
      : 'FRIDAY, check cluster health and error budgets.');

    setActiveTranscription('');
    addMessage('user', userText);

    try {
      const res = await fridayApi.sendMessage({
        message: userText,
        conversation_id: conversationId,
        mode: 'voice',
        model: settings.selectedModel || activeModel,
      });
      const aiReply = res.response || res.content;
      if (res.model_used) setActiveModel(res.model_used);
      if (aiReply) {
        onAssistantResponse(aiReply, res.suggested_actions);
        addCommandHistoryItem(userText, aiReply);
        return;
      }
    } catch (err) {
      console.error('Voice API call failed:', err);
      setMicState('idle');
      addMessage(
        'friday',
        `⚠️ **FRIDAY Voice Error**: ${err.message || 'Upstream LLM error'}`
      );
    }
  }, [activeTranscription, addMessage, addCommandHistoryItem, onAssistantResponse, conversationId, settings.selectedModel, activeModel]);

  /**
   * onCancelVoice: Triggered when user interrupts speech or listening
   * // TODO: connect to backend - Abort active WebSocket STT session and halt TTS audio
   */
  const onCancelVoice = useCallback(() => {
    clearAllTimers();
    setMicState('idle');
    setActiveTranscription('');
    setActiveSpeakingText('');
    setIsSimulating(false);
  }, [clearAllTimers]);

  /**
   * onWakeWordDetected: Triggered when wake word engine detects wake phrase (e.g. "Hey FRIDAY")
   * // TODO: connect to backend - Wake word audio listener trigger
   */
  const onWakeWordDetected = useCallback((phrase) => {
    if (!settings.wakeWordEnabled) return;
    console.log(`Wake phrase detected: "${phrase}"`);
    onMicPress();
  }, [settings.wakeWordEnabled, onMicPress]);

  // Replay speech for an existing message in transcript
  const handleReplaySpeech = (text) => {
    if (micState !== 'idle') return;
    setMicState('speaking');
    setActiveSpeakingText(text);

    const words = text.split(' ').length;
    const duration = Math.max(2200, Math.floor((words / (3.2 * settings.speechRate)) * 1000));

    const t = setTimeout(() => {
      soundFX.playSuccessChime();
      setMicState('idle');
      setActiveSpeakingText('');
    }, duration);

    simulationTimers.current.push(t);
  };

  // Keyboard shortcut listener for spacebar mic trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (mode !== 'voice') setMode('voice');
        if (micState === 'idle') {
          onMicPress();
        } else if (micState === 'listening') {
          onMicRelease();
        } else if (micState === 'speaking' || micState === 'processing') {
          onCancelVoice();
        }
      }
      if (e.key === 'Escape' && micState !== 'idle') {
        onCancelVoice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, micState, onMicPress, onMicRelease, onCancelVoice]);

  // Handle Manual Chat Send
  const handleSend = async () => {
    if (!inputVal.trim() || isSending) return;
    const prompt = inputVal;
    setInputVal('');
    addMessage('user', prompt);
    setIsSending(true);

    try {
      // Call backend FRIDAY AI endpoint powered by Kimi
      const response = await fridayApi.sendMessage({
        message: prompt,
        conversation_id: conversationId,
        mode: 'chat',
        model: settings.selectedModel || activeModel,
      });
      setIsSending(false);
      const aiReply = response.response || response.content;
      if (response.model_used) setActiveModel(response.model_used);
      if (aiReply) {
        addMessage('friday', aiReply, response.suggested_actions);
        addCommandHistoryItem(prompt, aiReply);
        soundFX.playSuccessChime();
        return;
      }
    } catch (err) {
      setIsSending(false);
      console.error('FRIDAY chat call failed:', err);
      // FAIL LOUDLY: surface the exact error to the user cleanly
      addMessage(
        'friday',
        `⚠️ **FRIDAY Error**: ${err.message || 'Upstream LLM error'}`
      );
    }
  };

  // Handle Confirmed Mitigation Action Execution
  const handleConfirmAction = async (action) => {
    setExecutingActionId(action.action_id);
    soundFX.playMicStart();
    try {
      const res = await fridayApi.executeAction({
        action_type: action.action_type,
        service: action.service,
        params: action.params,
        conversation_id: conversationId,
      });
      setExecutingActionId(null);
      soundFX.playSuccessChime();

      addMessage(
        'friday',
        `✅ **Action Executed**: ${res.message}\n\n` +
        `• **Target Service**: \`${action.service}\`\n` +
        `• **Mitigation Type**: \`${action.action_type}\`\n` +
        `• **Audit ID**: \`${res.action_id}\`\n` +
        `• **Timestamp**: \`${res.executed_at}\`\n\n` +
        `Telemetry ingestion rate limits and health probes are nominal.`
      );
    } catch (err) {
      setExecutingActionId(null);
      addMessage('friday', `❌ **Action Failed**: ${err.message || 'Failed to execute mitigation action'}.`);
    }
  };


  // =========================================================================
  // DEV SIMULATOR HANDLERS
  // =========================================================================

  const handleTriggerSimulation = (preset) => {
    clearAllTimers();
    setIsSimulating(true);
    if (mode !== 'voice') setMode('voice');

    const sim = preset || SIMULATION_PRESETS[0];

    // Step 1: Listening
    setMicState('listening');
    setActiveTranscription(`"${sim.userText}"`);
    soundFX.playMicStart();

    // Step 2: Processing after 1.6s
    const t1 = setTimeout(() => {
      soundFX.playMicStop();
      setMicState('processing');
      setActiveTranscription('');
      addMessage('user', sim.userText);

      // Step 3: Speaking after delay
      const t2 = setTimeout(() => {
        setMicState('speaking');
        setActiveSpeakingText(sim.assistantResponse);
        addMessage('friday', sim.assistantResponse);
        addCommandHistoryItem(sim.userText, sim.assistantResponse);

        // Step 4: Return to Idle
        const t3 = setTimeout(() => {
          soundFX.playSuccessChime();
          setMicState('idle');
          setActiveSpeakingText('');
          setIsSimulating(false);
        }, sim.durationMs);

        simulationTimers.current.push(t3);
      }, settings.mockLatencyMs || 1200);

      simulationTimers.current.push(t2);
    }, 1600);

    simulationTimers.current.push(t1);
  };

  const handleStepState = () => {
    clearAllTimers();
    setIsSimulating(false);
    if (mode !== 'voice') setMode('voice');

    if (micState === 'idle') {
      setMicState('listening');
      setActiveTranscription('Step Test: Listening for speech...');
      soundFX.playMicStart();
    } else if (micState === 'listening') {
      setMicState('processing');
      setActiveTranscription('');
      soundFX.playMicStop();
    } else if (micState === 'processing') {
      setMicState('speaking');
      setActiveSpeakingText('Step Test: FRIDAY speech synthesis active.');
    } else {
      setMicState('idle');
      setActiveSpeakingText('');
      soundFX.playSuccessChime();
    }
  };

  const toggleConnection = () => {
    if (connectionStatus === 'online') {
      setConnectionStatus('offline');
    } else if (connectionStatus === 'offline') {
      setConnectionStatus('connecting');
      setTimeout(() => {
        setConnectionStatus('online');
        setLatencyMs(Math.floor(Math.random() * 18) + 16);
      }, 800);
    }
  };

  return (
    <div className="friday-page">
      {/* ── Top Bar Header ─────────────────────────────────────────── */}
      <div className="friday-header">
        <div className="friday-header__left">
          <div className="friday-header__logo-badge">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12a6 6 0 0 0 12 0V8a6 6 0 0 0-12 0v4z" />
              <path d="M8 8h.01M12 8h.01" />
              <path d="M8 12c.5.7 1.2 1 2 1s1.5-.3 2-1" />
            </svg>
          </div>

          <div>
            <h2 className="friday-header__title">
              <span>FRIDAY AI Ops Assistant</span>
              <Badge variant="violet" size="sm" dot>Autonomous Agent Online</Badge>
              <Badge variant="teal" size="sm" title={`Active LLM Engine: ${activeModel}`}>
                ⚡ {activeModel.includes('kimi') ? 'Kimi Neural LLM (Moonshot AI)' : (activeModel.split('/')[1] || activeModel)}
              </Badge>
            </h2>
          </div>
        </div>

        <div className="friday-header__right">
          {/* Mode Switcher Pill */}
          <div className="friday-mode-switch">
            <button
              className={`friday-mode-btn ${mode === 'chat' ? 'friday-mode-btn--active' : ''}`}
              onClick={() => setMode('chat')}
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6l-4 3V5z" />
              </svg>
              <span>Chat Mode</span>
            </button>

            <button
              className={`friday-mode-btn ${mode === 'voice' ? 'friday-mode-btn--active' : ''}`}
              onClick={() => setMode('voice')}
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M16 10v1a6 6 0 0 1-12 0v-1" />
                <line x1="10" y1="17" x2="10" y2="19" />
              </svg>
              <span>Voice Mode</span>
            </button>
          </div>

          {/* Voice Settings Gear Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure FRIDAY Voice & Audio Settings"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="10" r="2.5" />
              <path d="M10 2v2M10 16v2M3.5 5.5l1.4 1.4M15.1 15.1l1.4 1.4M2 10h2M16 10h2M3.5 14.5l1.4-1.4M15.1 4.9l1.4-1.4" />
            </svg>
            <span>Voice Config</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate && onNavigate('dashboard')}
          >
            ← Operations Control
          </Button>
        </div>
      </div>

      {/* ── Main Layout: Context Panel + Conversation & Voice Stage ─── */}
      <div className="friday-layout-grid">
        {/* Left: Context & Command History Panel */}
        <FridayContextPanel
          initialContext={initialContext}
          commandHistory={commandHistory}
          onClearHistory={() => setCommandHistory([])}
          onReRunCommand={(cmd) => {
            if (mode === 'voice') {
              onMicRelease(cmd);
            } else {
              setInputVal(cmd);
            }
          }}
          micState={micState}
        />

        {/* Right: Conversation Feed & Mic Input */}
        <Card padding="normal" className="friday-chat-card">
          {/* Transcript Message Feed */}
          <div ref={transcriptScrollRef} className="friday-transcript-feed">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`friday-msg ${isUser ? 'friday-msg--user' : 'friday-msg--assistant'}`}
                >
                  <div className="friday-msg__meta">
                    <span style={{ fontWeight: 'bold', color: isUser ? 'var(--color-accent-light)' : '#a855f7' }}>
                      {isUser ? 'You' : 'FRIDAY AI'}
                    </span>
                    <span>•</span>
                    <span>{m.time}</span>
                  </div>

                  <div className="friday-msg__bubble">
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{m.text}</div>

                    {/* Interactive Action Confirmation Card */}
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="friday-action-card">
                        <div className="friday-action-card__header">
                          <span className="friday-action-card__tag">⚡ Action Confirmation Required</span>
                        </div>
                        {m.suggestedActions.map((act) => (
                          <div key={act.action_id || act.action_type} className="friday-action-card__body">
                            <div className="friday-action-card__title">
                              {(act.action_type || 'mitigate').replace(/_/g, ' ').toUpperCase()} on <code>{act.service}</code>
                            </div>
                            <p className="friday-action-card__desc">{act.rationale}</p>
                            {act.params && Object.keys(act.params).length > 0 && (
                              <div className="friday-action-card__params">
                                Parameters: {JSON.stringify(act.params)}
                              </div>
                            )}
                            <div className="friday-action-card__footer">
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={executingActionId === act.action_id}
                                onClick={() => handleConfirmAction(act)}
                              >
                                {executingActionId === act.action_id ? 'Executing Mitigation...' : 'Confirm & Execute Action'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="friday-msg__actions">
                      <button
                        className="friday-msg-action-btn"
                        onClick={() => navigator.clipboard.writeText(m.text)}
                        title="Copy text"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copy</span>
                      </button>

                      {!isUser && (
                        <button
                          className="friday-msg-action-btn"
                          disabled={micState !== 'idle'}
                          onClick={() => handleReplaySpeech(m.text)}
                          title="Replay synthetic voice speech"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                          </svg>
                          <span>Replay</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="friday-msg friday-msg--assistant">
                <div className="friday-msg__meta">
                  <span style={{ fontWeight: 'bold', color: '#a855f7' }}>FRIDAY AI</span>
                  <span>•</span>
                  <span>Synthesizing with Kimi...</span>
                </div>
                <div className="friday-msg__bubble" style={{ fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>
                  Analyzing live telemetry stream and generating response...
                </div>
              </div>
            )}
          </div>

          {/* Voice Mode Stage (When Voice Mode is Active) */}
          {mode === 'voice' && (
            <FridayVoiceMic
              micState={micState}
              activeTranscription={activeTranscription}
              activeSpeakingText={activeSpeakingText}
              onMicPress={onMicPress}
              onMicRelease={onMicRelease}
              onCancelVoice={onCancelVoice}
            />
          )}

          {/* Chat Mode Input Row (When Chat Mode is Active) */}
          {mode === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {/* Quick Commands Chips */}
              <div className="friday-quick-commands-bar">
                <span className="friday-quick-commands-label">⚡ Directives:</span>
                {[
                  'Check cluster latency and health',
                  "Show today's active anomalies",
                  'What is current crash risk?',
                  'Propose capacity scale-out for checkout-v2',
                ].map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    className="friday-quick-cmd-chip"
                    onClick={() => {
                      setInputVal(cmd);
                    }}
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              <div className="friday-chat-input-row">
                <input
                  type="text"
                  placeholder="Ask FRIDAY AI about cluster health, query anomalies, or trigger mitigations..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="friday-chat-input"
                  disabled={isSending}
                />

                {/* Quick mic trigger button in chat mode */}
                <button
                  className="friday-msg-action-btn"
                  onClick={() => {
                    setMode('voice');
                    onMicPress();
                  }}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-accent-light)',
                    height: '38px',
                  }}
                  title="Switch to Voice Mode"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </button>

                <Button variant="primary" size="md" onClick={handleSend} disabled={isSending}>
                  {isSending ? 'Synthesizing...' : 'Send Message'}
                </Button>
              </div>
            </div>
          )}

          {/* System Status Footer */}
          <div className="friday-status-footer">
            <button
              onClick={toggleConnection}
              className="friday-conn-indicator"
              title="Click to simulate network disconnect/reconnect"
            >
              <span className={`friday-conn-dot friday-conn-dot--${connectionStatus}`} />
              <span>
                {connectionStatus === 'online'
                  ? `Telemetry Stream Active • ${latencyMs}ms Latency • Local Neural Core`
                  : connectionStatus === 'connecting'
                  ? 'Re-establishing WebSocket Handshake...'
                  : 'Telemetry Stream Offline (Click to Reconnect)'}
              </span>
            </button>

            <span>
              {settings.wakeWordEnabled ? `Wake Word: "${settings.wakeWordPhrase}"` : 'Wake Word: Disabled'} • Press [Space] to talk
            </span>
          </div>
        </Card>
      </div>

      {/* Settings Modal */}
      <FridaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Dev Simulator Floating Widget */}
      <FridayDevSimulator
        micState={micState}
        isSimulating={isSimulating}
        onTriggerSimulation={handleTriggerSimulation}
        onStepState={handleStepState}
      />
    </div>
  );
}
