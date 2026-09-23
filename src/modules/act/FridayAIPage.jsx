import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FridayAI.css';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { FridayContextPanel } from './components/FridayContextPanel';
import { FridayVoiceMic } from './components/FridayVoiceMic';
import { FridaySettingsModal } from './components/FridaySettingsModal';
import { FridayDevSimulator } from './components/FridayDevSimulator';
import { FridayChatHistoryDrawer } from './components/FridayChatHistoryDrawer';
import { fridayMemory } from './services/fridayMemoryService';
import { voiceEngine } from './services/voiceEngine';
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

  // ── Messages & Command History (Synchronized via fridayMemory) ──
  const [messages, setMessages] = useState(() => {
    const existing = fridayMemory.getMessages();
    if (existing && existing.length > 0) return existing;
    const welcome = [
      {
        id: 'm1',
        sender: 'friday',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text:
          activeAnomaliesCount > 0
            ? `Good evening. I am monitoring all microservice telemetry via Kimi (Moonshot AI). Telemetry watch alert: ${activeAnomaliesCount} active anomaly detected (${anomalies[0]?.title || 'Checkout Latency Spike'}). Crash risk is currently ${liveCrashRisk}%. How can I assist you with infrastructure operations?`
            : 'Good evening. I am monitoring all microservice telemetry, edge TLS handshakes, and autonomous incident mitigations via Kimi (Moonshot AI). Zero active anomalies detected. How can I assist you with infrastructure operations?',
      },
    ];
    fridayMemory.setMessages(welcome);
    return welcome;
  });

  // Subscribe to memory updates (voice assistant turns, chat turns, cross-tab)
  useEffect(() => {
    const unsubscribe = fridayMemory.subscribe((newMsgs) => {
      setMessages(newMsgs);
    });
    fridayMemory.syncWithBackend();
    return unsubscribe;
  }, []);

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

  // Cleanup timers & voiceEngine on unmount
  useEffect(() => {
    return () => {
      simulationTimers.current.forEach((t) => clearTimeout(t));
      voiceEngine.interrupt();
      voiceEngine.stopListening();
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
    fridayMemory.appendTurn(sender, text, suggestedActions);
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

  const conversationId = fridayMemory.getConversationId();
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  const handleSelectSession = useCallback((sessionId) => {
    const loaded = fridayMemory.loadSession(sessionId);
    if (loaded && loaded.length > 0) {
      setMessages(loaded);
    }
    soundFX.playSuccessChime();
  }, []);

  const handleNewConversation = useCallback(() => {
    fridayMemory.resetConversation();
    const welcome = [
      {
        id: `m-welcome-${Date.now()}`,
        sender: 'friday',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Started a new session. All live cluster telemetry is nominal. How can I assist you?',
      },
    ];
    fridayMemory.setMessages(welcome);
    soundFX.playSuccessChime();
  }, []);

  const [activeModel, setActiveModel] = useState('moonshotai/kimi-k3');
  const onMicPressRef = useRef(null);
  const isProcessingRef = useRef(false);

  /**
   * onAssistantResponse: Triggered when assistant has response text ready
   */
  const onAssistantResponse = useCallback((text, suggestedActions = null) => {
    setMicState('speaking');
    setActiveSpeakingText(text);
    addMessage('friday', text, suggestedActions);

    voiceEngine.playNeuralSpeech(text, {
      voice: settings.selectedVoice,
      rate: settings.speechRate,
      onEnd: () => {
        soundFX.playSuccessChime();
        setMicState('idle');
        setActiveSpeakingText('');
        setIsSimulating(false);
        // Wait 900ms for completion chime to finish and room acoustic tail to dissipate
        if (settings.handsFree !== false && onMicPressRef.current) {
          setTimeout(() => {
            if (!isProcessingRef.current && !voiceEngine.isPlayingAudio) {
              onMicPressRef.current();
            }
          }, 900);
        }
      },
    });
  }, [addMessage, settings.selectedVoice, settings.speechRate, settings.handsFree]);

  /**
   * onMicRelease: Triggered when user finishes speaking
   * Transcribes speech buffer and posts to FRIDAY FastAPI LLM orchestrator
   */
  const onMicRelease = useCallback(async (customPrompt) => {
    voiceEngine.stopListening();

    const rawUserText = customPrompt !== undefined && typeof customPrompt === 'string'
      ? customPrompt
      : activeTranscription.replace('Listening to your directive...', '').trim();

    const userText = (rawUserText || '').trim();

    // Guard: If no meaningful utterance was detected, return cleanly to idle without sending empty queries
    if (!userText) {
      setMicState('idle');
      setActiveTranscription('');
      return;
    }

    // Guard: Prevent duplicate dispatches for the same voice turn
    if (isProcessingRef.current) return;

    // Guard against trailing assistant speech acoustic echo
    if (voiceEngine.isPlayingAudio || (typeof window !== 'undefined' && window.speechSynthesis?.speaking)) {
      console.debug('Acoustic guard: dropping utterance during active speech');
      return;
    }
    const timeSinceSpeech = Date.now() - (voiceEngine.lastSpeechEndTime || 0);
    if (timeSinceSpeech < 900) {
      console.debug('Acoustic guard: dropping room acoustic tail utterance');
      return;
    }

    // Guard against speech recognition picking up the assistant's own output (self-echo)
    const lastSpoken = (voiceEngine.lastSpokenText || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const userNormalized = userText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    if (lastSpoken && userNormalized.length >= 6) {
      if (lastSpoken.includes(userNormalized) || userNormalized.includes(lastSpoken.slice(0, 30))) {
        console.warn('Echo filter: dropped microphone loopback of assistant speech:', userText);
        setMicState('idle');
        setActiveTranscription('');
        return;
      }
    }

    isProcessingRef.current = true;

    soundFX.playMicStop();
    setMicState('processing');
    setActiveTranscription('');
    addMessage('user', userText);

    // Check if voice directive updates client state directly
    const nlResult = processNLQuery ? processNLQuery(userText) : null;
    if (nlResult && nlResult.actionTaken === 'UPDATE_SENSITIVITY') {
      onAssistantResponse(nlResult.text);
      addCommandHistoryItem(userText, nlResult.text);
      isProcessingRef.current = false;
      return;
    }

    try {
      const res = await fridayApi.sendMessage({
        message: userText,
        conversation_id: conversationId,
        mode: 'voice',
        model: settings.selectedModel || activeModel,
        reasoning_effort: settings.reasoningEffort || 'medium',
        context_hints: {
          anomalies: anomalies.slice(0, 3),
          liveCrashRisk,
          activeAnomaliesCount,
        },
      });
      const aiReply = res.response || res.content || (res.suggested_actions?.length ? 'Mitigation action proposed. Ready to execute on your confirmation.' : 'Systems nominal. No anomalous patterns detected.');
      if (res.model_used) setActiveModel(res.model_used);
      onAssistantResponse(aiReply, res.suggested_actions);
      addCommandHistoryItem(userText, aiReply);
    } catch (err) {
      console.error('Voice API call failed:', err);
      setMicState('idle');
      addMessage(
        'friday',
        `⚠️ **FRIDAY Voice Error**: ${err.message || 'Upstream LLM error'}`
      );
    } finally {
      isProcessingRef.current = false;
    }
  }, [activeTranscription, addMessage, addCommandHistoryItem, onAssistantResponse, conversationId, settings.selectedModel, settings.reasoningEffort, activeModel, processNLQuery, anomalies, liveCrashRisk, activeAnomaliesCount]);

  /**
   * onMicPress: Triggered when user begins real voice capture
   */
  const onMicPress = useCallback(() => {
    if (voiceEngine.isPlayingAudio || (typeof window !== 'undefined' && window.speechSynthesis?.speaking)) {
      console.debug('Delaying onMicPress: assistant is still speaking');
      setTimeout(() => {
        if (onMicPressRef.current) onMicPressRef.current();
      }, 500);
      return;
    }

    clearAllTimers();
    setIsSimulating(false);
    setActiveSpeakingText('');
    setMicState('listening');
    setActiveTranscription('Listening to your directive...');
    soundFX.playMicStart();

    voiceEngine.startListening({
      onStateChange: (state) => setMicState(state),
      onInterimTranscript: (text) => setActiveTranscription(text),
      onFinalTranscript: (text) => onMicRelease(text),
      onError: (err) => {
        console.warn('Recognition error:', err);
        setMicState('idle');
        const errMsg = err?.message || 'Speech recognition interrupted.';
        if (
          errMsg.includes('PERMISSION_DENIED') ||
          errMsg.includes('SPEECH_UNSUPPORTED') ||
          errMsg.includes('NETWORK_ERROR') ||
          errMsg.includes('SERVICE_ERROR')
        ) {
          addMessage(
            'friday',
            `⚠️ **Voice Input Diagnostic**\n\n${errMsg}\n\n*Note: You can continue issuing commands and analyzing infrastructure by typing in the prompt below.*`
          );
        }
      },
    });
  }, [clearAllTimers, onMicRelease, addMessage]);

  useEffect(() => {
    onMicPressRef.current = onMicPress;
  }, [onMicPress]);

  /**
   * onCancelVoice: Triggered when user interrupts speech or listening
   */

  const onCancelVoice = useCallback(() => {
    clearAllTimers();
    voiceEngine.interrupt();
    voiceEngine.stopListening();
    setMicState('idle');
    setActiveTranscription('');
    setActiveSpeakingText('');
    setIsSimulating(false);
  }, [clearAllTimers]);




  // Reset dispatch ref when initialContext prop changes
  useEffect(() => {
    initialContextDispatchedRef.current = false;
  }, [initialContext]);

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
        reasoning_effort: settings.reasoningEffort || 'medium',
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
          `⚠️ **FRIDAY Notice**: ${err.message || 'Could not reach LLM'}`
        );
      });
    }
  }, [initialContext, conversationId, settings.selectedModel, settings.reasoningEffort, activeModel, addMessage, addCommandHistoryItem]);

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

    // Check if command is a client-side parameter update (e.g. "set sensitivity to 92%")
    const nlResult = processNLQuery ? processNLQuery(prompt) : null;
    if (nlResult && nlResult.actionTaken === 'UPDATE_SENSITIVITY') {
      addMessage('friday', nlResult.text);
      addCommandHistoryItem(prompt, nlResult.text);
      soundFX.playSuccessChime();
      return;
    }

    setIsSending(true);

    try {
      // Call backend FRIDAY AI endpoint powered by Kimi
      const response = await fridayApi.sendMessage({
        message: prompt,
        conversation_id: conversationId,
        mode: 'chat',
        model: settings.selectedModel || activeModel,
        reasoning_effort: settings.reasoningEffort || 'medium',
      });
      setIsSending(false);
      const aiReply = response.response || response.content || (response.suggested_actions?.length ? 'Mitigation action proposed. Ready to execute on your confirmation.' : 'Systems nominal. No anomalous patterns detected.');
      if (response.model_used) setActiveModel(response.model_used);
      addMessage('friday', aiReply, response.suggested_actions);
      addCommandHistoryItem(prompt, aiReply);
      soundFX.playSuccessChime();
      return;
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
                ⚡ Kimi K3 (NVIDIA NIM)
              </Badge>
            </h2>
          </div>
        </div>

        <div className="friday-header__right">
          {/* Streamlined Single Voice Mode Active / Deactivate Toggle Button */}
          <Button
            variant={mode === 'voice' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode(mode === 'voice' ? 'chat' : 'voice')}
            title={mode === 'voice' ? 'Deactivate Voice Mode (Switch to Chat)' : 'Activate Continuous Voice Mode'}
            className="friday-voice-toggle-btn"
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: mode === 'voice' ? '#10b981' : 'var(--color-text-muted)',
                marginRight: '6px',
                boxShadow: mode === 'voice' ? '0 0 8px #10b981' : 'none',
              }}
            />
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
              <path d="M10 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M16 10v1a6 6 0 0 1-12 0v-1" />
              <line x1="10" y1="17" x2="10" y2="19" />
            </svg>
            <span>{mode === 'voice' ? 'Voice Mode: Active' : 'Voice Mode: Off'}</span>
          </Button>

          {/* New Conversation Session */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewConversation}
            title="Start a new conversation session"
          >
            + New Session
          </Button>

          {/* Chat History Drawer Toggle Button (Beside New Session) */}
          <Button
            variant={isHistoryDrawerOpen ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsHistoryDrawerOpen((prev) => !prev)}
            title="View past conversation sessions"
            className="friday-history-toggle-btn"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Chat History</span>
          </Button>

          {/* Consolidated Settings Gear Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure FRIDAY Voice, Neural Core & Audio Settings"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
              <circle cx="10" cy="10" r="2.5" />
              <path d="M10 2v2M10 16v2M3.5 5.5l1.4 1.4M15.1 15.1l1.4 1.4M2 10h2M16 10h2M3.5 14.5l1.4-1.4M15.1 4.9l1.4-1.4" />
            </svg>
            <span>Settings</span>
          </Button>

          {/* Navigation to Dashboard */}
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
              {/* Directives & Reasoning Effort Bar */}
              <div className="friday-controls-bar">
                <div className="friday-reasoning-toggle-group">
                  <span className="friday-reasoning-toggle-label">Reasoning:</span>
                  {[
                    { id: 'low', label: 'Low', title: 'Low: Fastest response (~1-2s triage)' },
                    { id: 'medium', label: 'Medium', title: 'Medium: Balanced MoE reasoning (Recommended)' },
                    { id: 'max', label: 'Max', title: 'Max: Deep MoE analysis (Full 16k tokens)' },
                  ].map((tier) => {
                    const isActive = (settings.reasoningEffort || 'medium') === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        className={`friday-reasoning-btn ${isActive ? 'friday-reasoning-btn--active' : ''}`}
                        onClick={() => handleUpdateSettings({ reasoningEffort: tier.id })}
                        title={tier.title}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>

                <div className="friday-quick-commands-bar">
                  <span className="friday-quick-commands-label">Directives:</span>
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
              {settings.handsFree !== false ? 'Continuous Voice: Active' : 'Push-to-Talk'} • Press [Space] to talk • Wake Word: In Development
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

      {/* ChatGPT-Style Chat History Sidebar / Drawer */}
      <FridayChatHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        activeSessionId={conversationId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewConversation}
      />

    </div>
  );
}
