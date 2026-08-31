# AI-CTO Frontend UI Feature Inventory & Backend Architecture Specification

> **Document Version:** 1.0.0  
> **Target System:** AI-CTO Autonomous Infrastructure & Telemetry Engineering Platform  
> **Scope:** Exhaustive catalog of screens, features, interactive elements, state flows, and backend requirements.

---

## 1. App Overview

### 1.1 Architecture & Technology Stack
- **Framework:** React (Vite SPA) with client-side reactive routing.
- **Styling Paradigm:** Pure Vanilla CSS Design System with semantic tokens, fluid typography, dark/light themes, CSS variables, and high-performance SVG graphics (zero heavy third-party UI library bloat).
- **State Management:** React Context Architecture (`TenantContext`, `ThemeContext`, `AnalyticsContext`, `ToastProvider`, local component state machines, and `localStorage` persistence).
- **Audio & Voice Layer:** Web Audio API synth oscillators (`soundFX.js`), simulated Web Speech API / WebSocket voice streaming loop.

---

### 1.2 Top-Level Routes & Screens

| Route / View ID | Navigation Hierarchy | URL Pattern | Auth Required | Purpose / Description |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | Root Public | `/` | No | High-converting marketing landing page, interactive live demo modal, feature highlights, and onboarding trigger. |
| **Operations Dashboard** | Sidebar: `MONITOR` | `/app` (`currentNav: 'dashboard'`) | Yes | Live operations command center, cluster vitals, health score banner, dual-axis traffic/revenue stream, active anomalies, prescriptive mitigations, telemetry drawer, and decision logs. |
| **Analytics & Forecasting** | Sidebar: `MONITOR` | `/app` (`currentNav: 'analytics'`) | Yes | Predictive capacity planning studio, 24h crash risk gauge, ML sensitivity controls, confidence envelope curves, multi-metric regression correlation, and SHAP root-cause breakdown. |
| **FRIDAY AI Ops Co-Pilot** | Sidebar: `ACT` | `/app` (`currentNav: 'friday-ai'`) | Yes | Real-time AI infrastructure engineer chat & voice co-pilot, ambient state machine (idle/listening/processing/speaking), synthetic speech replay, context panel, and Dev Simulator. |
| **Audit & Decision Log** | Sidebar: `ACT` / Topbar | `/app` (`currentNav: 'audit-logs'`) | Yes | Immutable chronological audit ledger of all automated AI mitigations, scale operations, secret rotations, and engineer actions. |
| **Platform Settings** | Sidebar: `MANAGE` | `/app` (`currentNav: 'settings'`) | Yes | Multi-tab configuration suite: General organization profile, Appearance/theming, API keys & webhook HMAC secrets, Team RBAC, Alert rule policies, Data privacy & retention. |
| **Billing & Subscriptions** | Sidebar: `MANAGE` | `/app` (`currentNav: 'billing'`) | Yes | Compute quota meters, tier plans (Starter, Pro, Enterprise), proration modals, multi-card vault, tax/GST invoicing, usage alerts, and retention cancellation flow. |
| **Onboarding Wizard** | Modal Overlay | Any authed screen (`isOnboardingOpen`) | Yes | 5-step modal wizard for registering a new business tenant, generating edge tracking snippets, verifying live edge probes, configuring KPIs, and connecting integrations. |

---

### 1.3 Persistent Shell Components

```
+-------------------------------------------------------------------------------------------------------+
|  TOPBAR: [Collapse Ctrl+B] [Active Business Dropdown v] | [Stream: Live (5s) v] [Bell 🔔] [Sign Out]   |
+------------------------------------+------------------------------------------------------------------+
|  SIDEBAR                           |  MAIN VIEWPORT (DYNAMIC ACTIVE SCREEN)                           |
|  - MONITOR                         |                                                                  |
|    * Operations Dashboard          |  (Dashboard / Analytics / FRIDAY AI / Settings / Billing / Logs) |
|    * Analytics & Forecasting       |                                                                  |
|  - ACT                             |                                                                  |
|    * FRIDAY AI Co-Pilot            |                                                                  |
|  - MANAGE                          |                                                                  |
|    * Platform Settings             |                                                                  |
|    * Billing & Subscriptions       |                                                                  |
|  [Sidebar Footer: System Status]   |                                                                  |
+------------------------------------+------------------------------------------------------------------+
|  FLOATING OVERLAYS: [Toast Notifications] [FRIDAY Dev Voice Simulator Pill] [Onboarding Wizard Modal] |
+-------------------------------------------------------------------------------------------------------+
```

1. **App Topbar (`AppShell.jsx`)**:
   - **Sidebar Toggle Button:** Collapses sidebar into compact icon mode (keyboard shortcut: `Ctrl+B`).
   - **Tenant Switcher Dropdown:** Shows currently active business (e.g. Acme Global Commerce, Apex Retail Labs, CloudScale SaaS), allows 1-click switching, or triggers `+ Add New Business` to launch Onboarding Wizard.
   - **Live Stream Indicator:** Status pill toggling between "Live Stream (Active)" and "Offline / Paused".
   - **Auto-Refresh Rate Selector:** Polling frequency dropdown (`5s`, `10s`, `30s`, `60s`).
   - **Manual Refresh Button:** Triggers spinning sync icon and forces metric refresh.
   - **System Alerts Notification Bell:** Displays unread anomaly badge; clicking toggles a popover listing recent critical alerts with individual dismiss and "Dismiss All" actions.
   - **User Profile & Sign Out Button:** Displays active user initials (`AM`) and signs out to Landing Page (`aicto_is_logged_in = false`).
2. **App Sidebar (`AppShell.jsx`)**:
   - **Brand Header:** AI-CTO logo with version tag (`v2.4.0-prod`).
   - **Navigation Groups:**
     - **MONITOR:** Operations Dashboard (badge shows active anomaly count), Analytics & Forecasting.
     - **ACT:** FRIDAY AI (shows glowing live dot).
     - **MANAGE:** Platform Settings, Billing & Subscriptions.
   - **Sidebar Footer:** Cluster health indicator (`99.98% SLA Nominal`) and keyboard shortcut hints.
3. **Floating Overlays**:
   - **Toast System (`Toast.jsx` / `ToastProvider`):** Top-right floating feedback alerts (`success`, `info`, `warning`, `error`) with auto-dismiss timers.
   - **FRIDAY Dev Voice Simulator:** Bottom-right floating pill that expands to simulate speech synthesis cycles, state stepping, and preset voice directives.

---

## 2. Per-Screen Breakdown

---

### 2.1 Landing Page (`src/pages/landing/`)

#### Purpose & User Story
Marketing storefront designed to educate visitors on the AI-CTO value proposition (autonomous engineering, zero-downtime microservice healing, revenue protection), showcase high-fidelity dashboard previews, and convert users via self-serve onboarding or live interactive demo exploration.

#### Data Displayed
- **Hero Metrics Mockup:** Interactive live metrics (Response Time: `142ms`, Checkout Conversion: `3.82%`, Active Anomalies: `0`, Error Rate: `0.04%`).
- **Feature Cards Grid:** 6 core value pillars (Autonomous Auto-Healing, Multi-Metric Correlation, Sub-Second Anomaly Detection, Resource Runway Planning, FRIDAY Natural Language Interface, Immutable Decision Ledger).
- **Social Proof / Customer Quotes:** Enterprise logos, performance metrics (+34% uptime efficiency, -82% MTTR).
- **Interactive Scenarios in Demo Modal:** Latency Spike mitigation, Cache Contention resolution, Flash Sale autoscaling.

#### Interactive Elements
| Element Label / Identifier | Element Type | Current Handler / Behavior | Likely Backend / AI Need |
| :--- | :--- | :--- | :--- |
| **"Start Free Trial" (Header & Hero)** | Button | Calls `onGetStarted()`, which opens `OnboardingWizard` modal directly or sets auth session. | `POST /api/v1/auth/signup` or guest session initialization. |
| **"Log In" (Header)** | Button | Calls `onLogin()`, setting `localStorage.setItem('aicto_is_logged_in', 'true')` and navigating to `/app`. | `POST /api/v1/auth/login` (OAuth2 / SAML SSO / JWT). |
| **"Explore Live Demo" (Hero)** | Button | Opens `DemoModal` with simulated infrastructure scenarios. | Read-only sandbox session with pre-seeded mock telemetry. |
| **"Copy Tracking Snippet" (Hero Mockup)** | Button | Copies JavaScript tracking script `<script src="https://cdn.aicto.io/track.js"...>` to clipboard. | Static CDN delivery of telemetry collection script. |
| **"Simulate Scenario" Buttons (Demo Modal)** | Buttons | Switches active demo preview scenario (e.g. Black Friday Surge vs Edge DNS Outage). | Demo simulation driver or mock event playback engine. |
| **Theme Toggle (Header)** | Button | Toggles between `dark` and `light` themes via `ThemeContext`. | User profile appearance preference persistence (`PATCH /api/v1/users/me`). |

---

### 2.2 Onboarding Wizard (`src/modules/onboarding/`)

#### Purpose & User Story
Guided 5-step modal workflow allowing new or existing users to onboard a new business entity, install tracking telemetry, configure primary business KPIs, connect third-party integrations (Shopify, Stripe, Cloudflare, GitHub, Slack, Datadog), and verify live edge telemetry ingestion before launching into the dashboard.

#### Screen-by-Screen Steps

```
+-------------------------------------------------------------------------------------------------+
| ONBOARDING WIZARD STEPPER: [1. Details] -> [2. Snippet] -> [3. KPIs] -> [4. Connect] -> [5. Launch] |
+-------------------------------------------------------------------------------------------------+
```

#### Step 1: Business Details (`Step1BusinessDetails.jsx`)
- **Data Displayed:** Business Name, Type, Website URL, Timezone.
- **Interactive Elements:**
  - `Business Name` input (validates non-empty).
  - `Business Type` select dropdown (`ecommerce`, `saas`, `marketplace`, `enterprise`, `agency`).
  - `Website / Storefront URL` input (validates domain format).
  - `Timezone` select dropdown (all global timezones).
  - `Use Browser Timezone` button (auto-detects `Intl.DateTimeFormat().resolvedOptions().timeZone`).
  - `Continue to Step 2 →` button (validates and advances stepper).
- **Backend Need:** `POST /api/v1/tenants` (validates domain ownership and creates tenant record).

#### Step 2: Tracking Snippet & Edge Verification (`Step2TrackingSnippet.jsx`)
- **Data Displayed:** Unique business ID token (`biz_live_...`), code snippet tabs (HTML Script, Google Tag Manager, React / Next.js npm, Shopify Theme Liquid), live verification probe animation status.
- **Interactive Elements:**
  - `Framework Selector Tabs` (HTML, GTM, React, Shopify): switches syntax-highlighted code block.
  - `Copy Snippet to Clipboard` button: copies framework snippet with embedded tenant key.
  - `Verify Installation Probe` button: initiates `verifySnippetInstallation()`, showing animated radar pinging the edge URL. Simulates HTTP 200 payload handshake.
  - `Skip for now` link: bypasses probe requirement.
  - `← Back` / `Next: Select KPIs →` buttons.
- **Backend Need:** `POST /api/v1/tenants/:id/verify-edge-probe` (server-side edge crawler checks if `track.js` is firing real HTTP beacons).

#### Step 3: KPI Confirmation (`Step3KpiConfirmation.jsx`)
- **Data Displayed:** Recommended core KPIs (Checkout Latency, API Error Rate, Cart Abandonment, Server CPU Saturation) and Additional KPIs (Database Lock Contention, Cache Hit Ratio, Third-party Webhook Lag).
- **Interactive Elements:**
  - KPI Checkbox cards: toggles individual metric tracking.
  - `Reset to Recommended Defaults` button.
  - `Select All Available` button.
  - `← Back` / `Next: Integrations →` buttons.
- **Backend Need:** `PUT /api/v1/tenants/:id/kpi-targets` (stores alert baselines and anomaly target weights).

#### Step 4: Third-Party Integrations (`Step4Integrations.jsx`)
- **Data Displayed:** 6 connector cards (Shopify, Stripe, Cloudflare, GitHub CI/CD, Slack, Datadog) with sync badges and capability descriptions.
- **Interactive Elements:**
  - `Connect` / `Connected` toggle buttons for each card: opens OAuth popup or marks connector active.
  - `Skip this step` button.
  - `← Back` / `Next: Review & Launch →` buttons.
- **Backend Need:** OAuth2 flow endpoints (`/api/v1/integrations/:provider/oauth/authorize` and callback endpoints for Shopify, GitHub, Slack).

#### Step 5: Review & Launch (`Step5ReviewFinish.jsx`)
- **Data Displayed:** Comprehensive summary card of tenant name, domain, verified snippet status, enabled KPIs list, and active connector badges.
- **Interactive Elements:**
  - `Launch & Go to Dashboard` button: calls `saveDraft()`, updates `TenantContext` with newly created tenant, selects it as active, closes modal, and redirects to `/app`.
- **Backend Need:** `POST /api/v1/tenants/:id/finalize-onboarding` (provisions dedicated Redis/TimescaleDB time-series partitions).

---

### 2.3 Operations Dashboard (`src/modules/monitor/`)

#### Purpose & User Story
The primary day-to-day command center for SREs and engineering leadership. Displays real-time operational health scores, high-frequency revenue & traffic curves, active anomaly cards with 1-click FRIDAY autonomous mitigation execution, collapsible telemetry drawers, and decision audit trails.

#### Data Displayed & Types
- **Health Status Banner (`HealthStatusBanner.jsx`):** Composite Health Score (`94/100`), status variant (`Optimal` / `Degraded` / `Critical`), MTTR average (`1.4 mins`), Active Incidents count, Autonomous Auto-Heal rate (`98.2%`).
- **Primary KPI Strip (`KpiStrip.jsx`):**
  - Response Time (`142ms`, delta `-18ms`).
  - Checkout Error Rate (`0.08%`, delta `+0.01%`).
  - Revenue Protected (`$42,850`, delta `+$12,400`).
  - Autonomous Mitigations (`14 Actions`, `100% Success`).
  - Comparison baseline toggles: "vs Yesterday" or "vs Last Week".
- **Business Tier Metrics Row (`BusinessMetricsRow.jsx`):**
  - Ingress Throughput (`4,820 req/s`).
  - Redis Cache Hit Rate (`94.2%`).
  - Edge TLS Handshake Time (`18ms`).
  - Active Visitor Concurrency (`12,480 users`).
- **Traffic & Revenue SVG Dual-Axis Chart (`TrafficRevenueChart.jsx`):**
  - 24-hour / 7-day / 30-day time ranges.
  - Granularity: `5m`, `15m`, `1h`.
  - Metric Modes: `Traffic (req/s)`, `Revenue ($/hr)`, or `Both (Dual-Axis)`.
  - Interactive hover crosshair with floating tooltip displaying exact throughput, revenue, and active anomaly markers.
- **Active Anomalies (`ActiveAnomalies.jsx`):** List of live incidents with severity badges (`Critical`, `High`, `Medium`), service names (`checkout-v2`, `cart-service`), observed vs baseline deviations, financial risk estimates, root-cause summaries, and prescriptive AI actions.
- **Capacity Snapshot (`CapacitySnapshot.jsx`):** Resource runway gauge (`24 days until Redis saturation`), memory headroom (`18%`), and 1-click jump link to Analytics Studio.
- **Collapsible Telemetry Drawer:** Deep trace breakdown showing live HTTP status distributions (`2xx: 99.2%`, `4xx: 0.7%`, `5xx: 0.1%`), pod memory pressure, and Envoy ingress latency.
- **Decision Log Drawer (`RecentActivityFeed.jsx`):** Expandable history of autonomous actions executed by FRIDAY AI and manual engineer actions.

#### Interactive Elements
| Element Label / Identifier | Element Type | Current Handler / Behavior | Likely Backend / AI Need |
| :--- | :--- | :--- | :--- |
| **"Execute Mitigation" (Anomaly Card)** | Button | Dispatches local mitigation, appends to `decisionLogs`, reduces `activeAnomaliesCount`, and plays success audio chime. | `POST /api/v1/remediations/execute` (triggers Kubernetes rolling update, CDN edge cache purge, or replica autoscaler). |
| **"Investigate with FRIDAY" (Anomaly Card)** | Button | Calls `onNavigate('friday-ai', { anomaly })`, opening FRIDAY pre-seeded with full root-cause prompt. | Contextual prompt injection into LLM orchestrator session. |
| **"Time Range" (24h / 7d / 30d)** | Pill Buttons | Updates local chart state, filtering time-series arrays. | `GET /api/v1/telemetry/time-series?range=24h&granularity=15m`. |
| **"Metric View" (Traffic / Revenue / Both)** | Pill Buttons | Re-renders SVG dual-axis curves. | Telemetry metric stream filtering. |
| **"Acknowledge All Alerts"** | Quick Action Button | Sets unread alerts to read state, clears notification popover badge. | `POST /api/v1/alerts/acknowledge-all`. |
| **"Restart Service"** | Quick Action Button | Opens confirmation dialog and simulates pod restart. | `POST /api/v1/infrastructure/services/:name/restart`. |
| **"Purge Edge CDN Cache"** | Quick Action Button | Triggers simulated Cloudflare/CloudFront cache invalidation. | `POST /api/v1/integrations/cloudflare/purge-cache`. |
| **"Consult FRIDAY AI"** | Quick Action Button | Jumps to FRIDAY AI chat with generic health check inquiry. | Navigation + LLM query initialization. |
| **"Toggle Telemetry Drawer"** | Expand Button | Slides open collapsible bottom drawer with deep pod vitals. | WebSocket live metrics telemetry subscription (`ws://.../vitals`). |

---

### 2.4 Analytics & Capacity Forecasting Studio (`src/modules/monitor/analytics/`)

#### Purpose & User Story
Predictive infrastructure engineering laboratory. Empowers CTOs and SREs to forecast future traffic bottlenecks, run what-if flash sale simulations, adjust ML anomaly sensitivity thresholds, inspect Pearson correlation coefficients between tech latency and business conversions, and inspect ML SHAP attribution root causes.

#### Data Displayed
- **24h Projected Crash Risk Card (`AnalyticsHeader.jsx`):** Real-time calculated risk score (`14% - Low Risk`), headroom percentage (`86%`), risk progress bar.
- **ML Anomaly Sensitivity Slider (`AnalyticsHeader.jsx`):** Active sensitivity level (`50% - 99%`), tolerance label ("Broad Tolerance" vs "Ultra Precision"). Synchronized live with `AnalyticsContext` and FRIDAY AI.
- **Model Performance & Confidence Card (`ModelMetrics.jsx`):** Version (`v3.2 - XGBoost + Temporal LSTM`), Precision (`94.8%`), Recall (`98.2%`), False Positive Rate (`0.4%`), F1-Score (`96.4%`), Dataset Vectors (`1.42M`), Last Retrained timestamp.
- **Predictive Capacity Curve & Confidence Envelope (`ForecastChart.jsx`):**
  - Historical throughput solid curve.
  - ML predicted peak dotted curve.
  - 95% Confidence Envelope transparent gradient band.
  - Comparative overlays: "vs Last Week" or "vs Previous Deployment".
  - Provisioned cluster ceiling line (`11,000 req/s`).
- **Multi-Metric Correlation View (`CorrelationView.jsx`):**
  - Dual-axis regression curves for presets:
    - *Checkout Latency vs Conversion Rate* (Pearson $r = -0.88$).
    - *CPU Saturation vs Error Rate* (Pearson $r = +0.92$).
    - *Memory Leak vs DB Query Queue* (Pearson $r = +0.79$).
  - ML Predictive Insight text banner.
- **Resource Runway Projection (`CapacityPlanner.jsx`):**
  - Days remaining until exhaustion (`~24 Days`).
  - Bottleneck indicator (`Redis In-Memory Session Cluster`).
  - Current utilization (`76%`) vs Critical Ceiling (`90%`).
  - Proactive Scale Recommendation action.
- **What-If Traffic Spike Simulator (`CapacityPlanner.jsx`):** Interactive slider (`+0%` to `+300%`), calculating projected crash risk delta and simulated autoscaling replica costs.
- **Cost Projection Model (`CapacityPlanner.jsx`):** Monthly baseline cost (`$4,850/mo`) with simulated delta breakdown (Compute nodes, Redis cache tier, Data transfer).
- **Anomaly Detection Timeline (`AnomalyTimeline.jsx`):** Chronological audit feed with search filtering, severity pills, observed vs baseline deviations, and expandable remediation cards.
- **ML Root Cause & Feature Attribution (`RootCauseBreakdown.jsx`):** Ranked SHAP importance bar chart (e.g. Service Load Contention `55%`, Upstream Gateway Latency `30%`, Cache Misses `15%`).

#### Interactive Elements
| Element Label / Identifier | Element Type | Current Handler / Behavior | Likely Backend / AI Need |
| :--- | :--- | :--- | :--- |
| **"Export Forecast Report (CSV)"** | Button | Generates and triggers browser download of `forecast-report.csv`. | `GET /api/v1/analytics/export?format=csv`. |
| **"Sensitivity Range Slider" (50–99%)** | Range Slider | Calls `setSensitivity(val)` in `AnalyticsContext`, dynamically updating anomaly detection thresholds. | `PATCH /api/v1/ml/models/thresholds` (recalibrates detector sigma bounds). |
| **"What-If Traffic Surge Slider" (0–300%)** | Range Slider | Computes `liveCrashRisk` and `liveHeadroom` in real time, updating monthly cost estimates. | Dynamic serverless simulation calculation or capacity model evaluator. |
| **"Compare Overlay Selector"** | Pill Buttons | Toggles `none`, `last_week`, `previous_deploy` baseline curves on the SVG forecast chart. | `GET /api/v1/telemetry/forecast?compare=previous_deploy`. |
| **"Correlation Preset Selector"** | Tab Buttons | Switches active correlation pair and dual-axis regression rendering. | `GET /api/v1/analytics/correlations/:pairId`. |
| **"Ask FRIDAY" Button on every card** | Button | Jumps to FRIDAY AI page with specialized contextual question regarding the specific card data. | Contextual routing to conversational AI orchestrator. |
| **"Apply Proactive Scale Recommendation"** | Button | Dispatches autoscaling policy update and notifies user. | `POST /api/v1/infrastructure/autoscale/apply`. |

---

### 2.5 Act - FRIDAY AI Autonomous Co-Pilot (`src/modules/act/`)

#### Purpose & User Story
The interactive "brain" and voice co-pilot of AI-CTO. Allows engineers to query real-time cluster health, diagnose root causes, inspect APM traces, trigger deployment rollbacks, and adjust platform sensitivity using conversational text or hands-free synthetic voice.

#### Data Displayed
- **Voice Stage & Visualizer (`FridayVoiceMic.jsx`):** Central interactive mic sphere with 4 visual state modes:
  - *Idle:* Ambient violet glow.
  - *Listening:* Dynamic expanding audio ripple waves and live transcription preview text.
  - *Processing / Thinking:* Dual rotating orbital rings with status subtitle.
  - *Speaking:* Audio equalizer frequency bars, active synthetic speech subtitle readout, and click-to-interrupt button.
- **Conversation Transcript Feed (`FridayAIPage.jsx`):** Chat bubble stream with timestamps, sender badges (User vs FRIDAY AI), copy snippet buttons, and synthetic speech "Replay" buttons.
- **Context & Telemetry Sync Panel (`FridayContextPanel.jsx`):**
  - *Telemetry & Context Tab:* Target service name, active incident description, vitals grid (Crash Risk, Headroom, Sensitivity %, Inference Lag), and auto-ingested live SRE notes.
  - *Command History Tab:* Searchable historical directives with execution status badges, latency indicators (`380ms`), and 1-click re-run buttons.
- **Status Footer:** Live connection indicator (`online` / `connecting` / `offline`), latency meter (`24ms`), wake word status (`Hey FRIDAY`), and keyboard spacebar hotkey hints.
- **Voice & Synthesis Config Modal (`FridaySettingsModal.jsx`):** Hands-free wake word toggle, synthetic voice selector (4 neural models), live mic sensitivity slider with gain meter, speech playback rate (0.6x–1.6x), active noise suppression toggle, and sci-fi audio FX toggle.
- **Dev Voice Simulator (`FridayDevSimulator.jsx`):** Floating tool to test full 4-stage voice cycles across preset directives (Cluster Health Check, Incident Root Cause, Mitigation Auto-Scale, Security TLS Verification).

#### Interactive Elements
| Element Label / Identifier | Element Type | Current Handler / Behavior | Likely Backend / AI Need |
| :--- | :--- | :--- | :--- |
| **Hero Mic Button (`#friday-mic-action-button`)** | Main Button | Toggles voice states: Click from Idle -> Starts listening; Click from Listening -> Transcribes & processes; Click from Speaking -> Interrupts speech. | WebSocket bi-directional audio stream (`wss://.../voice/stream` via Whisper STT + ElevenLabs / Neural TTS). |
| **Spacebar Keybinding** | Keyboard Shortcut | Press/Hold Space triggers voice listening; Release triggers processing. | Client-side hotkey hook tied to audio capture. |
| **Mode Switcher (Chat vs Voice)** | Pill Switcher | Toggles view between text input row and full visualizer voice stage. | UI presentation mode. |
| **Chat Input Field & "Send" Button** | Text Input + Button | Sends query to `processNLQuery()`, appends user message, returns AI response after simulated inference latency. | `POST /api/v1/ai/chat/completions` (LLM orchestrator with RAG telemetry context). |
| **"Replay" Button on AI Message** | Button | Re-triggers synthetic voice playback and audio equalizer animation. | Text-to-Speech synthesis stream / cached audio buffer. |
| **"Voice Config" Button** | Header Button | Opens `FridaySettingsModal` to customize voice model, wake word, and audio dynamics. | `PATCH /api/v1/users/me/ai-preferences`. |
| **"Simulate Cycle" (Dev Simulator)** | Button | Executes automated 4-step listening -> processing -> speaking sequence. | Developer debugging utility. |

---

### 2.6 Detect - Audit & Immutable Decision Log (`src/modules/detect/`)

#### Purpose & User Story
Immutable operational ledger recording every action taken within the platform—whether by FRIDAY AI autonomous agents (e.g. autoscaling SQS worker pods, executing rolling restarts) or human engineers (e.g. rotating API keys, updating alert thresholds).

#### Data Displayed
- **Ledger Entries:** Actor name (e.g. `FRIDAY AI Optimizer`, `Sarah Jenkins (SRE Lead)`), timestamp, action taken, verified impact summary, confidence score, and status badge (`Applied`, `Resolved`, `Verified`).

#### Interactive Elements
| Element Label / Identifier | Element Type | Current Handler / Behavior | Likely Backend / AI Need |
| :--- | :--- | :--- | :--- |
| **"← Return to Dashboard"** | Button | Navigates back to operations dashboard. | Client-side navigation (`currentNav: 'dashboard'`). |
| **Audit Filter & Search (Future Hook)** | Filter | Filters log items by actor or service. | `GET /api/v1/audit-logs?actor=friday-ai&limit=50`. |

---

### 2.7 Manage - Platform Settings (`src/pages/settings/`)

#### Purpose & User Story
Central administrative control center for managing organization identity, light/dark appearance, API access keys, team member RBAC permissions, threshold alert rules, and telemetry retention compliance.

#### Tab 1: General Settings (`GeneralTab.jsx`)
- **Data Displayed:** Business Name, immutable Business ID, Business Type, CTO Support Email, System Timezone, Platform Currency, Dashboard Auto-Refresh Interval.
- **Interactive Elements:**
  - `Business Name` input.
  - `Copy ID` button (copies unique tenant key to clipboard).
  - `Business Type` dropdown (`ecommerce`, `marketplace`, `saas`, `enterprise`, `agency`).
  - `System Timezone` dropdown.
  - `Platform Currency` dropdown (USD, EUR, GBP, CAD, AUD, JPY, INR).
  - `Dashboard Auto-Refresh Interval` dropdown (`10s`, `30s`, `1m`, `5m`, `manual`).
  - `Connect a New Business` button (opens Onboarding Wizard).
  - `Discard Changes` / `Save Changes` buttons (validates dirty state, shows toast).
- **Backend Need:** `PATCH /api/v1/tenants/:id` (updates tenant configuration).

#### Tab 2: Appearance & Theming (`AppearanceTab.jsx`)
- **Data Displayed:** Theme Mode preview cards (Dark Violet vs Light Daylight), 6 Accent Palette swatches (Dark Violet, Cyber Gold, Emerald Teal, Neon Rose, Electric Blue, Matrix Emerald), Viewport Density selector (Comfortable vs Compact), Font Size selector (Small 90%, Medium 100%, Large 110%), and live interactive component preview card.
- **Interactive Elements:**
  - `Dark / Light Mode Cards`: updates `theme` in `ThemeContext` and root `data-theme` attribute.
  - `Accent Swatch Cards`: updates `accentColor` in `ThemeContext` and root `data-accent` attribute.
  - `Density Segmented Control`: updates `density` and root `data-density` attribute.
  - `Font Size Segmented Control`: updates `fontSize` and root `data-font-size` attribute.
- **Backend Need:** `PATCH /api/v1/users/me/theme-preferences`.

#### Tab 3: API Keys & Webhooks (`ApiKeysTab.jsx`)
- **Data Displayed:** Active API Keys table (Key Name, Token preview with masked characters `sk_live_••••882a`, Scope, Rate Limit, Created Date, Last Active), Shopify Webhook HMAC Signing Secret card with reveal/hide toggle.
- **Interactive Elements:**
  - `Generate New Key` button: opens modal with Key Name input and Scope selector (`full_access` vs `read_only`).
  - `Copy Secret Token` button inside modal: displays full token once (`sk_live_...`) with warning.
  - `Revoke Key` button: opens `ConfirmModal` to permanently deactivate key.
  - `Reveal / Hide Webhook Secret` button: toggles password mask on HMAC secret.
  - `Regenerate Webhook Secret` button: opens `ConfirmModal` warning that active Shopify webhooks will require updating.
- **Backend Need:** `GET /api/v1/api-keys`, `POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/:id`, `POST /api/v1/webhooks/regenerate-secret`.

#### Tab 4: Team Access & Roles (`TeamAccessTab.jsx`)
- **Data Displayed:** Active team members list (Name, Email, Role badge: Owner/Admin/Analyst/Viewer, Avatar initials, Last Active), Pending Invitations table (Invited Email, Role, Sent Date, Sent By), Collapsible Role Permission Matrix (9 capabilities mapped across 4 roles).
- **Interactive Elements:**
  - `Invite Member` button: opens modal with Colleague Email input and Role selector (`Admin`, `Analyst`, `Viewer`).
  - `Resend Invite` / `Cancel Invite` buttons.
  - `Remove Member` button: opens `ConfirmModal` (prohibited for Primary Owner).
  - `Expand / Collapse Permission Matrix` button.
  - `Transfer Organization Ownership` button: opens modal selecting an Admin successor.
- **Backend Need:** `GET /api/v1/team/members`, `POST /api/v1/team/invites`, `DELETE /api/v1/team/members/:id`, `POST /api/v1/team/transfer-ownership`.

#### Tab 5: Alert Rules & Incident Policies (`AlertRulesTab.jsx`)
- **Data Displayed:** Platform Anomaly Sensitivity slider (`20%` to `99%` with tier labels), Active Threshold Rules table (Target Metric, Comparison Operator, Threshold Value, Multi-Channel notification chips: Email/Slack/SMS/In-app, Cooldown snooze minutes, Active toggle switch, Delete button).
- **Interactive Elements:**
  - `Platform Sensitivity Slider`: adjusts global threshold deviation baseline.
  - `Apply Default` button: saves global sensitivity.
  - `Add Rule` button: opens modal with Metric selector, Operator dropdown (`>`, `>=`, `<`, `<=`), Threshold input, Channel multi-select chips, and Cooldown number input.
  - `Active Switch` per rule row: toggles rule enabled state.
  - `Channel Chips` toggle: toggles notification delivery endpoints.
  - `Delete Rule` button: opens confirmation dialog.
- **Backend Need:** `GET /api/v1/alert-rules`, `POST /api/v1/alert-rules`, `PUT /api/v1/alert-rules/:id`, `DELETE /api/v1/alert-rules/:id`.

#### Tab 6: Data, Privacy & Compliance (`DataPrivacyTab.jsx`)
- **Data Displayed:** Raw Time-Series Retention dropdown (`30d`, `90d`, `1y`, `forever`), Third-Party Data Sharing toggle list (Shopify, Stripe, Datadog, Google Analytics 4, Sentry, FRIDAY AI Tuning), Settings Audit Log table with IP sources, Danger Zone delete account card.
- **Interactive Elements:**
  - `Retention Window` dropdown: updates time-series aggregation policies.
  - `Export All Data (JSON)` button: generates and downloads comprehensive compliance archive `aicto-telemetry-export.json`.
  - `Third-Party Sharing Toggles`: enables/disables telemetry stream pipes per vendor.
  - `View Full Audit Log` button: opens modal with full 30-day compliance table.
  - `Delete Business` button: opens two-step `ConfirmModal` requiring the user to type the exact business name (e.g. `Acme Global Commerce`) to execute permanent purge.
- **Backend Need:** `POST /api/v1/compliance/export`, `PATCH /api/v1/tenants/:id/retention`, `DELETE /api/v1/tenants/:id` (initiates data purge worker).

---

### 2.8 Manage - Billing & Subscriptions (`src/pages/billing/`)

#### Purpose & User Story
Enterprise billing center allowing engineering managers to monitor telemetry quotas, upgrade/downgrade subscription tiers with proration calculations, manage payment methods in an encrypted vault, enter corporate GST/tax IDs, download itemized tax invoices, set overage alerts, and handle cancellations with retention discount offers.

#### Data Displayed
- **Usage Overview & Mini Trend Chart (`UsageOverview.jsx`):**
  - Quota meters: Monthly Telemetry Compute (`4.2M / 10M Events - 42%`), FRIDAY AI Invocations (`842 / 2,500 Actions - 33.7%`), Vector DB Storage (`14.2 / 25 GB - 56.8%`), API Egress (`128 / 500 GB - 25.6%`).
  - Active Cycle Dates: Start date, End date, Renewal date.
  - 3-Cycle Usage Trend SVG Chart: Area chart comparing June, July, August consumption with interactive hover points.
  - Overage Warning Banner: Appears if any metric breaches 80% or 95% threshold.
- **Subscription Plans Grid (`TierCards.jsx`):**
  - 3 Tiers: Starter (`$0`), Pro Performance (`$199/mo` or `$159/yr`), Enterprise Co-Pilot (`$799/mo` or `$639/yr`).
  - Monthly vs Annual Billing toggle (saves 20%).
  - Promotional code entry strip with validation (e.g. `AICTO20` for 20% off, `STARTUP50` for 50% off).
  - Feature checklists and active plan indicators.
- **Payment Methods Vault (`PaymentMethods.jsx`):**
  - Saved card rows with brand icons (Visa, Mastercard, Amex), last 4 digits, expiration dates, primary badge, "Make Primary", and "Remove" actions.
  - Auto-Renew subscription toggle row.
  - Corporate Billing Address form with GSTIN / VAT / EIN tax ID field.
- **Invoices & Payment History (`BillingHistory.jsx`):**
  - Search input (by invoice ID or description) and status filter pills (`All`, `Paid`, `Pending`, `Failed`).
  - Itemized table: Invoice ID, Date, Description, Subtotal, 18% GST/VAT Tax, Total Amount, Status badge, "Details" modal action, "PDF Receipt" download, and "Retry Payment" action for failed invoices.
  - `Download All` batch download button.
- **Usage Alerts Configuration (`UsageAlerts.jsx`):** Threshold slider (50%–95%), channel selector chips (Email, Slack, In-app), recipient email input.
- **Danger Zone (`DangerZone.jsx`):** Cancel Subscription button and Purge All Payment Methods button.

#### Modals & Interactive Flows
1. **Plan Change Modal (`PlanChangeModal.jsx`):** Calculates recurring rate delta, immediate proration charge (for upgrades), unused balance credit (for downgrades), effective date, and unlocked/reduced capabilities.
2. **Add Card Modal (`AddCardModal.jsx`):** Form with Cardholder Name, 16-digit card number with brand detection, MM/YY expiry, CVC, and "Set as primary" checkbox.
3. **Contact Sales Modal (`ContactSalesModal.jsx`):** Enterprise inquiry form with Name, Work Email, Company, Engineering Team Size, and custom architecture requirements.
4. **Cancel Subscription Modal (`CancelSubscriptionModal.jsx`):**
   - *Step 1 (Retention Offer):* Lists capabilities that will be lost and presents a 1-click **30% Retention Discount Offer** (`Claim 30% Off`).
   - *Step 2 (Final Confirmation):* Cancellation reason selector, expiration warning, and required `CANCEL` confirmation input.
5. **Invoice Detail Modal (`InvoiceDetailModal.jsx`):** Itemized breakdown of base plan subscription, GST/VAT tax calculation (18%), applied promo discounts, and PDF download button.
6. **Retry Payment Modal (`RetryPaymentModal.jsx`):** Allows selecting any saved payment card to re-attempt payment authorization on failed invoices.

---

## 3. Cross-Cutting Features & Shared State

```
+---------------------------------------------------------------------------------------------------+
|  REACT ROOT (App.jsx)                                                                             |
|  ├── TenantContext        -> activeTenantId, businessProfiles, isOnboardingOpen, onboardingDraft  |
|  ├── ThemeContext         -> theme ('dark'|'light'), accentColor, density, fontSize               |
|  ├── AnalyticsContext     -> sensitivity, anomalies, liveCrashRisk, liveHeadroom, processNLQuery   |
|  └── ToastProvider        -> toasts [], addToast(msg, type), removeToast(id)                      |
+---------------------------------------------------------------------------------------------------+
```

### 3.1 Theme & Design System (`ThemeContext.jsx`)
- **Theme Modes:** `dark` (default deep violet dark mode) and `light` (daylight high-contrast). Sets `<html data-theme="...">`.
- **Accent Color Palettes:** `violet` (`#8b5cf6`), `gold` (`#f59e0b`), `teal` (`#14b8a6`), `rose` (`#f43f5e`), `blue` (`#3b82f6`), `emerald` (`#10b981`). Sets `<html data-accent="...">`.
- **Display Density:** `comfortable` (standard 16px grid) and `compact` (12px dense operations grid). Sets `<html data-density="...">`.
- **Font Size Scaling:** `small` (90%), `medium` (100%), `large` (110%). Sets `<html data-font-size="...">`.
- **Persistence:** Saved in `localStorage` under `aicto_theme_prefs`.

### 3.2 Authentication & Session State (`App.jsx`)
- **Session Key:** `localStorage.getItem('aicto_is_logged_in')`.
- **Routing Gate:** If false, renders `LandingPage.jsx`; if true, renders authenticated `AppShell.jsx` with active navigation modules.
- **Login Trigger:** Landing page login buttons or wizard completion sets `aicto_is_logged_in = 'true'`.
- **Logout Trigger:** User profile dropdown "Sign Out" button clears auth key and redirects to `/`.

### 3.3 Multi-Tenant Business Switching (`TenantContext.jsx`)
- **Tenant Registry:** Array of business entities (`BUSINESS_PROFILES`):
  - `biz_acme_prod` (Acme Global Commerce - E-commerce).
  - `biz_apex_retail` (Apex Retail Labs - Multi-vendor Marketplace).
  - `biz_cloudscale` (CloudScale SaaS - Subscription Service).
- **Active Selection:** `localStorage.getItem('aicto_active_tenant_id')`.
- **Draft Persistence:** Onboarding wizard form state is auto-saved to `localStorage.getItem('aicto_onboarding_draft_v1')`.

### 3.4 Notification & Toast System (`Toast.jsx`)
- **Global Toast Container:** Fixed top-right portal rendering animated notification toasts with icon, title, message, and auto-dismiss after 4000ms.
- **Toast Types:** `success` (green), `info` (blue/violet), `warning` (amber), `error` (red).

### 3.5 FRIDAY AI Surface Points Across Platform
FRIDAY AI is integrated contextually across every major screen in the system:
1. **Operations Dashboard:** Anomaly mitigation cards feature "Consult FRIDAY AI" and prescriptive recommendation summaries.
2. **Analytics Studio:** Every metric card (Crash Risk, Sensitivity, Forecast Curve, Correlation View, Capacity Planner, Root Cause Breakdown) features an `Ask FRIDAY` button passing exact metric context.
3. **Natural Language Parser (`AnalyticsContext.processNLQuery`):** Handles text queries for crash risk, resource runway, active anomaly diagnostics, ML accuracy, and natural language sensitivity adjustments (e.g. *"Set sensitivity to 88%"*).
4. **Platform Settings (Data Privacy):** Anonymized telemetry sharing toggle for continuous LLM prompt tuning.
5. **Billing Page:** Invocations quota meter (`842 / 2,500 Actions`) and retention feature checklist.

---

## 4. Full Master Feature Inventory Table

| Screen / Module | Element / Feature Name | UI Component Type | Current State / Code Behavior | Likely Backend / AI Need |
| :--- | :--- | :--- | :--- | :--- |
| **Landing** | "Start Free Trial" / "Get Started" | Primary Button | Opens Onboarding Wizard modal | `POST /api/v1/auth/signup` |
| **Landing** | "Log In" | Secondary Button | Sets `aicto_is_logged_in = true` and routes to `/app` | `POST /api/v1/auth/login` (JWT / OAuth) |
| **Landing** | "Explore Live Demo" | Button | Opens `DemoModal` with simulated scenario switcher | Read-only demo session generator |
| **Landing** | Copy Code Snippet | Copy Button | Copies script tag to clipboard | Static CDN script asset |
| **Onboarding** | Business Name & Type | Input & Select | Local state validation in Step 1 | `POST /api/v1/tenants` |
| **Onboarding** | "Use Browser Timezone" | Button | Auto-detects client timezone via Intl API | Client-side helper |
| **Onboarding** | Framework Snippet Tabs | Tab Buttons | Switches HTML/GTM/React/Shopify snippet syntax | Static template renderer |
| **Onboarding** | "Verify Installation" | Button | Runs simulated 1.8s radar ping animation | `POST /api/v1/tenants/:id/verify-probe` |
| **Onboarding** | KPI Checklist | Checkbox Cards | Selects recommended & additional KPIs | `PUT /api/v1/tenants/:id/kpis` |
| **Onboarding** | Integration Cards | Toggle Buttons | Toggles connected badges (Shopify, Stripe, etc.) | OAuth2 connect endpoints |
| **Onboarding** | "Launch & Go to Dashboard" | Primary Button | Appends tenant to `TenantContext` and launches app | `POST /api/v1/tenants/:id/provision` |
| **Topbar** | Tenant Switcher | Dropdown Select | Switches active tenant profile in `TenantContext` | Multi-tenant session switch / DB partition |
| **Topbar** | Live Stream Status Toggle | Toggle Pill | Toggles streaming state between live and paused | WebSocket stream pause/resume |
| **Topbar** | Auto-Refresh Cadence | Dropdown Select | Updates dashboard polling interval (5s–60s) | Polling interval timer configuration |
| **Topbar** | Manual Refresh Button | Button | Triggers rotating icon and re-computes metrics | Cache invalidation & telemetry fetch |
| **Topbar** | Notification Bell & Popover | Icon Button + Popover | Toggles unread alerts popover with dismiss buttons | `GET /api/v1/alerts/unread`, `POST /api/v1/alerts/dismiss` |
| **Topbar** | User Sign Out | Button | Clears auth state and redirects to `/` | `POST /api/v1/auth/logout` |
| **Dashboard** | Health Status Banner | Metric Card | Displays composite score (94/100) and MTTR | `GET /api/v1/telemetry/health-score` |
| **Dashboard** | KPI Baseline Switcher | Pill Selector | Toggles delta comparisons ("vs Yesterday" / "vs Last Week") | Time-shifted metric query comparison |
| **Dashboard** | Traffic & Revenue SVG Chart | Dual-Axis Chart | Renders SVG curves with hover crosshair and tooltips | `GET /api/v1/telemetry/time-series` |
| **Dashboard** | "Execute Mitigation" | Action Button | Dispatches local fix, adds to decision log, plays audio FX | `POST /api/v1/remediations/execute` |
| **Dashboard** | "Investigate with FRIDAY" | Action Button | Jumps to FRIDAY AI with pre-seeded anomaly prompt | Contextual prompt injection to LLM |
| **Dashboard** | "Acknowledge Alerts" | Quick Action Button | Clears active alert banner | `POST /api/v1/alerts/acknowledge` |
| **Dashboard** | "Restart Service" | Quick Action Button | Simulates microservice rolling restart | `POST /api/v1/infrastructure/restart` |
| **Dashboard** | "Purge Edge CDN" | Quick Action Button | Simulates Cloudflare edge cache invalidation | `POST /api/v1/integrations/cdn/purge` |
| **Dashboard** | Collapsible Telemetry Drawer | Expandable Drawer | Shows detailed pod memory, CPU, and HTTP status codes | `GET /api/v1/telemetry/deep-vitals` |
| **Dashboard** | Recent Decision Log | Expandable Feed | Lists chronological automated and manual actions | `GET /api/v1/audit-logs/recent` |
| **Analytics** | Projected 24h Crash Risk | Gauge Metric Card | Computes dynamic risk percentage from sensitivity & spike | ML inference crash risk model |
| **Analytics** | ML Anomaly Sensitivity Slider | Range Slider (50–99%) | Updates `AnalyticsContext` sensitivity in real time | `PATCH /api/v1/ml/models/sensitivity` |
| **Analytics** | What-If Traffic Spike Slider | Range Slider (0–300%) | Dynamically scales crash risk and projected server cost | Serverless simulation calculator |
| **Analytics** | Predictive Capacity Curve | SVG Canvas Chart | Renders actual throughput, ML forecast & 95% envelope | `GET /api/v1/analytics/capacity-curve` |
| **Analytics** | Forecast Baseline Overlays | Pill Buttons | Overlays Last Week and Previous Deploy curves | Multi-series time-series comparison |
| **Analytics** | Multi-Metric Correlation View | Dual-Axis Chart | Computes Pearson $r$ for latency vs conversion rates | `GET /api/v1/analytics/correlations` |
| **Analytics** | Resource Runway Card | Metric Card | Displays days remaining (~24 days) and bottleneck | `GET /api/v1/analytics/resource-runway` |
| **Analytics** | Apply Scale Recommendation | Primary Button | Applies autoscaling recommendation to Redis cluster | `POST /api/v1/infrastructure/scale` |
| **Analytics** | Anomaly Detection Timeline | Filterable Feed | Lists deviations with tab filters (All/Active/Critical/Resolved) | `GET /api/v1/anomalies/history` |
| **Analytics** | ML Root Cause Breakdown | SHAP Bar Chart | Displays ranked feature attribution percentages | ML SHAP explainability model output |
| **Analytics** | "Export Forecast Report" | Secondary Button | Generates and downloads `forecast-report.csv` | `GET /api/v1/analytics/export?format=csv` |
| **FRIDAY AI** | Hero Mic Button | Animated Sphere | Toggles voice states (Idle -> Listening -> Thinking -> Speaking) | WebSocket STT/TTS bi-directional stream |
| **FRIDAY AI** | Spacebar Hotkey | Key Listener | Press/Hold to speak, release to transcribe | Audio buffer capture hook |
| **FRIDAY AI** | Mode Switcher (Chat/Voice) | Pill Switcher | Switches between visual voice stage and text chat input | Client UI presentation mode |
| **FRIDAY AI** | Chat Input & Send Button | Text Input + Button | Sends natural language query, returns AI response | `POST /api/v1/ai/agent/chat` (LLM RAG) |
| **FRIDAY AI** | Speech Replay Button | Icon Button | Plays synthetic speech audio and visualizes equalizer | Audio buffer TTS playback |
| **FRIDAY AI** | Context & Vitals Tab | Side Panel | Displays target service, crash risk, headroom, live notes | Live telemetry cache inspection |
| **FRIDAY AI** | Command History Tab | Searchable List | Lists past voice/text directives with 1-click re-run | `GET /api/v1/ai/agent/history` |
| **FRIDAY AI** | Voice & Synthesis Settings | Modal | Configures wake word, 4 voice models, gain, speech rate | `PATCH /api/v1/users/me/voice-settings` |
| **FRIDAY AI** | Dev Voice Simulator | Floating Widget | Simulates full 4-state voice cycles and steps | Client debugging simulator |
| **Audit Logs** | Immutable Decision Ledger | Table Feed | Lists all automated AI mitigations and engineer actions | `GET /api/v1/audit-logs` |
| **Settings** | General Identity & Timezone | Form | Updates business name, currency, timezone, polling rate | `PATCH /api/v1/tenants/:id` |
| **Settings** | Theme & Accent Selectors | Cards & Swatches | Sets theme (dark/light), accent color, density, font size | `PATCH /api/v1/users/me/preferences` |
| **Settings** | Generate API Key | Modal Form | Generates bearer token (`sk_live_...`) with scope | `POST /api/v1/api-keys` |
| **Settings** | Revoke API Key | Confirm Modal | Deactivates key immediately | `DELETE /api/v1/api-keys/:id` |
| **Settings** | Webhook HMAC Secret Reveal | Action Button | Toggles password visibility on webhook signing secret | Encrypted secret vault read |
| **Settings** | Regenerate Webhook Secret | Confirm Modal | Generates new HMAC signing secret | `POST /api/v1/webhooks/secret/regenerate` |
| **Settings** | Invite Team Member | Modal Form | Sends email invitation with RBAC role assignment | `POST /api/v1/team/invites` |
| **Settings** | Remove Team Member | Confirm Modal | Revokes user session and workspace access | `DELETE /api/v1/team/members/:id` |
| **Settings** | Transfer Workspace Ownership | Modal Form | Reassigns primary owner to an Admin teammate | `POST /api/v1/team/transfer-ownership` |
| **Settings** | Anomaly Sensitivity Slider | Range Slider | Sets global anomaly sensitivity baseline | `PATCH /api/v1/alert-rules/sensitivity` |
| **Settings** | Add Alert Rule | Modal Form | Configures metric threshold, channels (Slack/SMS), cooldown | `POST /api/v1/alert-rules` |
| **Settings** | Delete Alert Rule | Confirm Modal | Removes threshold alert rule | `DELETE /api/v1/alert-rules/:id` |
| **Settings** | Retention Window Selector | Dropdown Select | Sets raw time-series retention (30d/90d/1y/forever) | `PATCH /api/v1/compliance/retention` |
| **Settings** | Export Organization Archive | Button | Generates and downloads `aicto-telemetry-export.json` | `POST /api/v1/compliance/export` |
| **Settings** | Third-Party Telemetry Toggles | Toggle Rows | Controls connector data ingestion permissions | `PATCH /api/v1/integrations/permissions` |
| **Settings** | Delete Business (Danger Zone) | Two-step Modal | Requires typing business name to permanently wipe tenant | `DELETE /api/v1/tenants/:id` |
| **Billing** | Quota Progress Meters | Progress Bars | Displays compute, FRIDAY AI, vector storage, egress usage | `GET /api/v1/billing/usage-meters` |
| **Billing** | 3-Cycle Usage Trend Mini-Chart | SVG Canvas | Compares resource consumption across last 3 billing months | `GET /api/v1/billing/usage-trends` |
| **Billing** | Monthly / Annual Toggle | Toggle Switch | Adjusts plan rates with 20% annual discount | Billing cycle calculation |
| **Billing** | Promo Code Form | Input + Button | Validates promo codes (`AICTO20`, `STARTUP50`, etc.) | `POST /api/v1/billing/promo/validate` |
| **Billing** | Plan Upgrade / Downgrade | Action Buttons | Opens `PlanChangeModal` with proration calculation | `POST /api/v1/billing/subscription/change` |
| **Billing** | Enterprise Contact Sales | Modal Form | Submits sales inquiry with team size and VPC needs | `POST /api/v1/sales/inquiry` |
| **Billing** | Add Credit Card | Modal Form | Encrypts and adds card to payment vault | `POST /api/v1/billing/payment-methods` (Stripe) |
| **Billing** | Make Primary Card | Action Button | Sets default billing payment method | `PUT /api/v1/billing/payment-methods/:id/primary` |
| **Billing** | Remove Credit Card | Confirm Modal | Removes card from vault (requires at least 1 for paid plans) | `DELETE /api/v1/billing/payment-methods/:id` |
| **Billing** | Auto-Renew Toggle | Toggle Row | Toggles automatic cycle renewal | `PATCH /api/v1/billing/subscription/auto-renew` |
| **Billing** | Billing Address & GST Form | Form | Saves company address and corporate tax/GSTIN ID | `PUT /api/v1/billing/address` |
| **Billing** | Invoice Search & Status Filter | Input & Pills | Filters invoice history table by ID, text, or status | Filter query parameters |
| **Billing** | View Invoice Details | Modal | Shows line items, subtotal, 18% GST/VAT, and payment status | `GET /api/v1/billing/invoices/:id` |
| **Billing** | Download PDF Invoice | Action Button | Generates and downloads tax receipt file | `GET /api/v1/billing/invoices/:id/pdf` |
| **Billing** | Download All Invoices | Action Button | Batch downloads all filtered invoice receipts | `GET /api/v1/billing/invoices/export-all` |
| **Billing** | Retry Failed Payment | Modal | Re-authorizes failed invoice with a selected saved card | `POST /api/v1/billing/invoices/:id/retry` |
| **Billing** | Usage Alerts Configuration | Form | Sets quota threshold percentage and notification channels | `PUT /api/v1/billing/usage-alerts` |
| **Billing** | Cancel Subscription Step 1 | Retention Offer | Presents **30% Retention Discount Offer** button | `POST /api/v1/billing/subscription/retention` |
| **Billing** | Cancel Subscription Step 2 | Confirm Modal | Requires typing `CANCEL` to downgrade to Starter tier | `POST /api/v1/billing/subscription/cancel` |
| **Billing** | Purge All Cards (Danger Zone)| Confirm Modal | Removes all stored cards (only allowed on Starter tier) | `DELETE /api/v1/billing/payment-methods/purge` |

---

## 5. Open Questions & Architectural Ambiguities for Backend/AI Design

1. **Telemetry Streaming Protocol & Ingestion Scale:**
   - *Question:* Should high-frequency frontend charts poll via HTTP SSE (Server-Sent Events) or maintain a bi-directional WebSocket connection (`/ws/telemetry`) with sub-second time-series compression (e.g. Protocol Buffers / Arrow Flight)?
   - *Recommendation:* WebSocket for live operations dashboard and SSE for background metrics polling.

2. **FRIDAY AI Agent Voice Latency Budget:**
   - *Question:* For voice mode, will Speech-To-Text (Whisper) and Text-To-Speech be streamed chunk-by-chunk over WebSockets to achieve `<400ms` conversational turnaround latency, or processed as discrete audio payloads?
   - *Recommendation:* Streaming WebSocket with audio chunking via VAD (Voice Activity Detection).

3. **Autonomous Mitigation Execution Safety & Rollback RBAC:**
   - *Question:* When an engineer clicks "Execute Mitigation" on an anomaly card, should the backend require two-factor authentication or an automated Canary rollback threshold (e.g. if error rate does not drop within 60s, automatically revert pod deployment)?
   - *Recommendation:* Implement an autonomous health check watchdog that auto-reverts Kubernetes deployment revisions if error budgets exceed 0.5% post-mitigation.

4. **Multi-Tenant Data Partitioning & Retention:**
   - *Question:* For the configurable time-series retention windows (30d, 90d, 1y, Forever in Data Privacy Settings), how should raw vs downsampled rollups be stored?
   - *Recommendation:* Ingest raw metrics into TimescaleDB / ClickHouse with continuous aggregate views downsampling data older than 14 days to 5-minute rollups.

5. **Billing Proration & Payment Gateway Integration:**
   - *Question:* Does the Stripe integration handle proration calculation server-side, or should the frontend pass custom calculated proration amounts based on billing cycle dates?
   - *Recommendation:* Leverage Stripe Billing Customer Portal & Proration Preview APIs (`/v1/invoices/upcoming`) for exact penny-accurate calculation.
