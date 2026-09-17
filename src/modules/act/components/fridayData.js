export const INITIAL_SETTINGS = {
  wakeWordEnabled: true,
  wakeWordPhrase: 'Hey FRIDAY',
  selectedModel: 'moonshotai/kimi-k3',
  selectedVoice: 'friday-core-female',
  speechRate: 1.0,
  micSensitivity: 80,
  noiseSuppression: true,
  soundEffects: true,
  mockLatencyMs: 1200,
};

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
    name: 'FRIDAY Core (Neural UK Female)',
    description: 'Crisp British female tone with precise technical prosody',
    badge: 'Flagship Neural',
  },
  {
    id: 'friday-echo-male',
    name: 'FRIDAY Echo (Deep US Male)',
    description: 'Resonant and authoritative engineering lead voice',
    badge: 'Neural HD',
  },
  {
    id: 'friday-nova-neutral',
    name: 'FRIDAY Nova (Crisp Neutral)',
    description: 'Fast, concise synthetic voice optimized for ops briefings',
    badge: 'Turbo Gen-4',
  },
  {
    id: 'friday-solis-female',
    name: 'FRIDAY Solis (Adaptive Natural)',
    description: 'Warm natural cadence with contextual inflection',
    badge: 'Natural Pro',
  },
];

export const INITIAL_COMMAND_HISTORY = [
  {
    id: 'cmd-1',
    command: 'Run cluster health check and audit error budgets.',
    time: '18:20',
    category: 'system',
    status: 'completed',
    responseSummary: 'All 18 nodes nominal. Error budget at 99.94%.',
    latencyMs: 380,
  },
  {
    id: 'cmd-2',
    command: 'Scale checkout-v2 deployment from 4 to 8 replicas.',
    time: '17:45',
    category: 'action',
    status: 'completed',
    responseSummary: 'Scale directive dispatched to Kubernetes cluster. Pods healthy.',
    latencyMs: 510,
  },
  {
    id: 'cmd-3',
    command: 'Summarize unmitigated anomalies in payment gateway.',
    time: '16:30',
    category: 'telemetry',
    status: 'completed',
    responseSummary: 'Redis lock contention flagged; memory cache patch proposed.',
    latencyMs: 440,
  },
  {
    id: 'cmd-4',
    command: 'Set tactical anomaly watch for 60 minutes.',
    time: '14:15',
    category: 'ops',
    status: 'completed',
    responseSummary: 'High-frequency telemetry logging enabled for 60m.',
    latencyMs: 290,
  },
];

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
