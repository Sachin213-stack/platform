export const INITIAL_SETTINGS = {
  handsFree: true,
  wakeWordEnabled: false,
  wakeWordPhrase: 'Hey FRIDAY (In Development)',
  wakeWordStatus: 'in_development',
  selectedModel: 'moonshotai/kimi-k3',
  reasoningEffort: 'medium', // 'low' | 'medium' | 'max'
  selectedVoice: 'friday-core-female',
  speechRate: 1.0,
  micSensitivity: 80,
  noiseSuppression: true,
  soundEffects: true,
  mockLatencyMs: 1200,
};

export const AVAILABLE_REASONING_EFFORTS = [
  {
    id: 'low',
    label: 'Low',
    speed: 'Fastest',
    desc: 'Rapid triage and instant operational answers (2k tokens).',
  },
  {
    id: 'medium',
    label: 'Medium',
    speed: 'Balanced',
    desc: 'Standard MoE reasoning with deep context awareness (4k tokens).',
  },
  {
    id: 'max',
    label: 'Max',
    speed: 'Deep MoE',
    desc: 'Exhaustive reasoning chain for critical incident forensics (16k tokens).',
  },
];

export const AVAILABLE_LLM_MODELS = [
  {
    id: 'moonshotai/kimi-k3',
    name: 'Kimi K3 (Moonshot AI / NVIDIA NIM)',
    provider: 'Moonshot AI • NVIDIA NIM',
    description: 'Flagship reasoning MoE model with 16,384 max tokens, native tool calling, and deep reasoning effort via NVIDIA NIM.',
    badge: 'Flagship Active',
  },
];

export const AVAILABLE_VOICES = [
  {
    id: 'friday-core-female',
    edgeVoice: 'en-US-AriaNeural',
    name: 'FRIDAY Aria (Conversational US Female)',
    description: 'Warm, highly expressive companion voice inspired by ChatGPT',
    badge: 'ChatGPT Style',
  },
  {
    id: 'friday-nova-neutral',
    edgeVoice: 'en-GB-SoniaNeural',
    name: 'FRIDAY Sonia (Elite British Female)',
    description: 'Crisp British female AI-CTO tone with razor-sharp prosody',
    badge: 'Classic FRIDAY',
  },
  {
    id: 'friday-echo-male',
    edgeVoice: 'en-US-GuyNeural',
    name: 'FRIDAY Guy (Deep US Engineering Male)',
    description: 'Calm, authoritative senior engineering partner voice',
    badge: 'Senior Co-Pilot',
  },
  {
    id: 'friday-solis-female',
    edgeVoice: 'hi-IN-SwaraNeural',
    name: 'FRIDAY Swara (Natural Indian & Hinglish)',
    description: 'Fluent English and Hinglish technical partner with natural cadence',
    badge: 'Hinglish Pro',
  },
];

export const INITIAL_COMMAND_HISTORY = [];

export const SIMULATION_PRESETS = [
  {
    id: 'sim-1',
    label: 'Cluster Health Check',
    category: 'system',
    userText: 'FRIDAY, run a deep telemetry sweep across all edge nodes.',
    assistantResponse: 'Telemetry sweep complete across all 18 cluster nodes. CPU load is balanced at 34%, Redis memory headroom is 42%, and zero TLS handshake failures were detected.',
    durationMs: 4200,
  },
  {
    id: 'sim-2',
    label: 'Incident Root Cause',
    category: 'telemetry',
    userText: 'FRIDAY, what is causing the latency spike on checkout-v2?',
    assistantResponse: 'Analyzing APM traces for checkout-v2: p99 latency is elevated due to Redis session lock contention under peak checkout load. Recommended fix: scale replicas to 8 and apply memory cache tier.',
    durationMs: 4800,
  },
  {
    id: 'sim-3',
    label: 'Mitigation Auto-Scale',
    category: 'action',
    userText: 'FRIDAY, execute recommended replica scaling for checkout service.',
    assistantResponse: 'Executing rolling scale: checkout-v2 deployment scaled from 4 to 8 replicas. Kubernetes ingress has rebalanced traffic. p99 latency dropped from 420ms to 48ms.',
    durationMs: 4500,
  },
  {
    id: 'sim-4',
    label: 'Security & TLS Verification',
    category: 'security',
    userText: 'FRIDAY, verify edge SSL certificates and API rate limits.',
    assistantResponse: 'Edge security audit complete. Wildcard SSL certificates valid for 84 days. Global API gateway rate limiting active with 0 blocked legitimate requests.',
    durationMs: 4000,
  },
];
