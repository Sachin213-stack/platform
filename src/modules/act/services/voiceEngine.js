/**
 * VoiceEngine — High-Fidelity Audio Ingestion, VAD, STT, and Sentence-Pipelined TTS
 * Inspired by ChatGPT Voice Mode architecture.
 *
 * Core Capabilities:
 * - Real-time continuous SpeechRecognition (STT) with interim token streaming
 * - Voice Activity Detection (VAD) with configurable silence timeout (~1.0s)
 * - Web Audio API AnalyserNode for 60fps real-time frequency extraction
 * - Streaming Neural MP3 playback via /api/friday/voice/synthesize
 * - Resilient fallback to browser SpeechSynthesis with sentence queueing
 * - Instant Barge-In (<20ms audio cutoff & stream cancellation)
 */
import { getAccessToken } from '../../../shared/services/apiClient';

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = RAW_BASE.replace(/\/+$/, '');

class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.audioCtx = null;
    this.micStream = null;
    this.micSource = null;
    this.micAnalyser = null;
    this.ttsAnalyser = null;
    this.dataArray = null;

    // TTS Audio Player
    this.audioPlayer = null;
    this.audioPlayerSource = null;
    this.isPlayingAudio = false;

    // VAD & Timing
    this.silenceTimer = null;
    this.silenceDelayMs = 1100; // 1.1s natural pause before sending
    this.currentInterimText = '';
    this.currentFinalText = '';

    // Active SSE / AbortController
    this.activeAbortController = null;

    // Listeners / Callbacks
    this.callbacks = {
      onStateChange: () => {},
      onInterimTranscript: () => {},
      onFinalTranscript: () => {},
      onError: () => {},
    };

    this.settings = {
      selectedVoice: 'friday-core-female',
      speechRate: 1.0,
      speechPitch: '+0Hz',
      handsFree: true,
      vadSensitivityMs: 1100,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Audio Context & Analyser Initialization
  // ─────────────────────────────────────────────────────────────────
  initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    if (this.audioCtx) {
      if (!this.micAnalyser) {
        this.micAnalyser = this.audioCtx.createAnalyser();
        this.micAnalyser.fftSize = 64; // 32 frequency bins
        this.micAnalyser.smoothingTimeConstant = 0.8;
      }
      if (!this.ttsAnalyser) {
        this.ttsAnalyser = this.audioCtx.createAnalyser();
        this.ttsAnalyser.fftSize = 64;
        this.ttsAnalyser.smoothingTimeConstant = 0.8;
      }
      if (!this.dataArray) {
        this.dataArray = new Uint8Array(32);
      }
    }
  }

  getFrequencyData() {
    const targetAnalyser = this.isPlayingAudio
      ? this.ttsAnalyser
      : (this.isListening ? this.micAnalyser : null);

    if (!targetAnalyser || !this.dataArray) {
      return { amplitude: 0, frequencies: new Uint8Array(32) };
    }
    targetAnalyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    const normalizedAmp = Math.min(1.0, avg / 128.0);

    return {
      amplitude: normalizedAmp,
      frequencies: this.dataArray,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Real-Time Speech Recognition (STT) + VAD
  // ─────────────────────────────────────────────────────────────────
  isSupported() {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  async startListening(callbacks = {}) {
    // If assistant is currently speaking, interrupt it before listening
    if (this.isPlayingAudio) {
      this.interrupt();
    }

    this.callbacks = { ...this.callbacks, ...callbacks };
    this.initAudioContext();

    // Cleanly tear down any prior listening session
    this.stopListening();

    // Setup microphone stream for visualization strictly with echo cancellation & noise suppression
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        if (this.audioCtx && this.micAnalyser) {
          if (this.micSource) {
            try { this.micSource.disconnect(); } catch {}
          }
          this.micSource = this.audioCtx.createMediaStreamSource(this.micStream);
          // CRITICAL: Connect micSource ONLY to micAnalyser for FFT visualization.
          // NEVER connect micAnalyser or micSource to audioCtx.destination!
          this.micSource.connect(this.micAnalyser);
        }
      }
    } catch (e) {
      console.warn('Microphone stream access for visualizer failed:', e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        this.callbacks.onError(new Error('PERMISSION_DENIED: Microphone access was blocked by browser permissions. Please allow microphone access in your browser settings.'));
        this.stopListening();
        return;
      }
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      this.callbacks.onError(new Error('SPEECH_UNSUPPORTED: Speech recognition is not supported in this browser. Please use Chrome, Edge, or a Chromium-based browser.'));
      this.callbacks.onStateChange('idle');
      return;
    }

    this.recognition = new SpeechRec();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.currentInterimText = '';
    this.currentFinalText = '';
    this.isListening = true;
    this.callbacks.onStateChange('listening');

    this.recognition.onresult = (event) => {
      // Guard: Ignore results if recognition was stopped or cancelled
      if (!this.isListening) return;

      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.currentFinalText += (this.currentFinalText ? ' ' : '') + transcript;
        } else {
          interim += transcript;
        }
      }

      const activeText = (this.currentFinalText + (interim ? ' ' + interim : '')).trim();
      this.currentInterimText = activeText;
      this.callbacks.onInterimTranscript(activeText);

      // Voice Activity Detection (VAD) Silence Timer
      if (this.settings.handsFree) {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        if (activeText.length > 0) {
          this.silenceTimer = setTimeout(() => {
            this.handleSilenceTimeout();
          }, this.settings.vadSensitivityMs || this.silenceDelayMs);
        }
      }
    };

    this.recognition.onerror = (event) => {
      if (!this.isListening) return;
      if (event.error === 'no-speech') return;
      if (event.error === 'aborted') return;
      console.warn('SpeechRecognition error:', event.error);

      let formattedMsg = `Speech recognition error: ${event.error}`;
      if (event.error === 'not-allowed') {
        formattedMsg = 'PERMISSION_DENIED: Microphone access was blocked. Please check site permissions in your browser URL bar.';
      } else if (event.error === 'network') {
        formattedMsg = 'NETWORK_ERROR: Speech service network error. Please verify your internet connection.';
      } else if (event.error === 'service-not-allowed') {
        formattedMsg = 'SERVICE_ERROR: Speech recognition service is currently unavailable or disabled by policy.';
      }
      this.callbacks.onError(new Error(formattedMsg));
    };

    this.recognition.onend = () => {
      // Restart only if still explicitly listening and assistant is not speaking
      if (this.isListening && !this.isPlayingAudio) {
        try {
          this.recognition.start();
        } catch {
          // already started or stopped
        }
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  }

  handleSilenceTimeout() {
    if (!this.isListening) return;
    const finalUtterance = (this.currentFinalText || this.currentInterimText).trim();
    if (!finalUtterance) return;

    // Immediately stop listening so trailing audio or room acoustics do not trigger new dispatches
    this.stopListening();
    this.callbacks.onFinalTranscript(finalUtterance);
  }

  stopListening() {
    this.isListening = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.micStream = null;
    }
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {}
      this.micSource = null;
    }
    this.currentInterimText = '';
    this.currentFinalText = '';
  }

  // ─────────────────────────────────────────────────────────────────
  // Instant Barge-In (Interruption)
  // ─────────────────────────────────────────────────────────────────
  interrupt() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }

    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
      this.isPlayingAudio = false;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Neural Speech Synthesis & Streaming Playback (TTS)
  // ─────────────────────────────────────────────────────────────────
  async playNeuralSpeech(text, { voice, rate, pitch, onEnd } = {}) {
    // 1. MUST completely shut off microphone and recognition during assistant speech
    this.stopListening();
    this.interrupt();
    this.initAudioContext();

    // Clean markdown tables, code, and symbols; respect backend 1,500 character limit
    const cleanText = (text || '')
      .replace(/```[\s\S]*?```/g, ' [technical code details provided in transcript] ')
      .replace(/\|[ -:|]+\|/g, ' ')
      .replace(/\|/g, ', ')
      .replace(/[*_#`~]/g, '')
      .slice(0, 1500)
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const selectedVoice = voice || this.settings.selectedVoice || 'friday-core-female';
    const playbackRate = rate || this.settings.speechRate || 1.0;
    const playbackPitch = pitch || this.settings.speechPitch || '+0Hz';

    // Primary: Call Backend Neural Edge-TTS Streaming Endpoint
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      this.activeAbortController = new AbortController();
      const response = await fetch(`${API_BASE}/friday/voice/synthesize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: cleanText,
          voice: selectedVoice,
          rate: playbackRate,
          pitch: playbackPitch,
        }),
        signal: this.activeAbortController.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS HTTP error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (!this.audioPlayer) {
        this.audioPlayer = new Audio();
        this.audioPlayer.crossOrigin = 'anonymous';
      }

      this.audioPlayer.src = audioUrl;

      // Connect audio player to ttsAnalyser so the orb pulses to Friday's voice
      if (this.audioCtx && this.ttsAnalyser && !this.audioPlayerSource) {
        try {
          this.audioPlayerSource = this.audioCtx.createMediaElementSource(this.audioPlayer);
          this.audioPlayerSource.connect(this.ttsAnalyser);
          this.ttsAnalyser.connect(this.audioCtx.destination);
        } catch (_e) {
          // MediaElementAudioSourceNode may already be connected
        }
      }

      // CRITICAL AUTOPLAY POLICY UNMUTING GUARD:
      // If Web Audio API is suspended, resume it so audio routes to speakers without being muted
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        try {
          await this.audioCtx.resume();
        } catch (resumeErr) {
          console.warn('AudioContext resume failed:', resumeErr);
        }
      }

      this.isPlayingAudio = true;
      this.callbacks.onStateChange('speaking');

      this.audioPlayer.onended = () => {
        this.isPlayingAudio = false;
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      this.audioPlayer.onerror = () => {
        this.isPlayingAudio = false;
        URL.revokeObjectURL(audioUrl);
        // Fall back to browser SpeechSynthesis
        this.fallbackBrowserSpeech(cleanText, playbackRate, onEnd);
      };

      await this.audioPlayer.play();
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('Edge-TTS playback failed, falling back to browser SpeechSynthesis:', err.message);
      this.fallbackBrowserSpeech(cleanText, playbackRate, onEnd);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Resilient Browser SpeechSynthesis Fallback with Sentence Chunking & Heartbeat
  // ─────────────────────────────────────────────────────────────────
  fallbackBrowserSpeech(text, rate = 1.0, onEnd) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Ensure microphone is stopped before fallback speech begins
    this.stopListening();
    this.isPlayingAudio = true;
    this.callbacks.onStateChange('speaking');

    try {
      window.speechSynthesis.cancel();
      // Chunk long text into short sentences to prevent Chrome's 15s freeze bug
      const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
      let currentIndex = 0;

      // Chrome SpeechSynthesis keepalive heartbeat
      const keepAlive = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 10000);

      const speakNext = () => {
        if (currentIndex >= sentences.length) {
          clearInterval(keepAlive);
          this.isPlayingAudio = false;
          if (onEnd) onEnd();
          return;
        }

        const part = sentences[currentIndex].trim();
        currentIndex++;
        if (!part) {
          speakNext();
          return;
        }

        const utter = new SpeechSynthesisUtterance(part);
        utter.rate = rate;

        // Select best available neural/English voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((v) =>
          v.name.includes('Google UK English Female') ||
          v.name.includes('Natural') ||
          v.name.includes('Aria') ||
          v.name.includes('Samantha') ||
          (v.lang.startsWith('en') && !v.name.includes('Robotic'))
        );
        if (preferred) utter.voice = preferred;

        utter.onend = () => speakNext();
        utter.onerror = () => speakNext();

        window.speechSynthesis.speak(utter);
      };

      speakNext();
    } catch (e) {
      console.warn('Browser SpeechSynthesis error:', e);
      this.isPlayingAudio = false;
      if (onEnd) onEnd();
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }
}

export const voiceEngine = new VoiceEngine();
