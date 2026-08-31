# AI-CTO Platform 🚀

> **Autonomous AI-Powered Technical Leadership & Infrastructure Operations Suite**

The **AI-CTO Platform** is a modern, enterprise-grade web interface designed for engineering leaders and DevOps teams. Powered by **FRIDAY AI** and integrated with live telemetry streams, the platform provides real-time infrastructure monitoring, automated anomaly detection, and conversational AI-driven architectural guidance.

---

## ✨ Features

- 🤖 **FRIDAY AI Assistant**: Intelligent, conversational AI-CTO powered by NVIDIA NIM endpoints with live system vitals context injection.
- 📊 **Real-Time Operations Dashboard**: High-density monitoring for cluster latency, CPU/Memory utilization, queue depth, and transaction throughput.
- 🚨 **Automated Anomaly Detection**: Proactive metric threshold tracking and instant incident alerts.
- 🔐 **Enterprise Security & Privacy**: Granular data privacy tabs, JWT authentication, and PII redaction prior to LLM dispatch.
- 💳 **Billing & Usage Center**: Interactive invoice inspection, usage tier visualizer, and payment alert controls.
- 🎨 **Modern Glassmorphic UI**: Built with custom CSS design tokens, dynamic dark mode, and smooth micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: Vanilla CSS Design System (Custom Tokens & Glassmorphism)
- **Linter**: [Oxlint](https://oxc.rs/)
- **Backend API**: FastAPI Modular Monolith ([`platform-backend`](https://github.com/Sachin213-stack/platform-backend))

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Sachin213-stack/platform.git
cd platform

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your environment variables:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## 🔌 Connecting with Backend Server

To enable full FRIDAY AI responses and live telemetry sync, run the companion FastAPI backend:
1. Clone [`platform-backend`](https://github.com/Sachin213-stack/platform-backend)
2. Run FastAPI on port `8000` (`uvicorn app.main:app --port 8000`)
3. Vite automatically proxies `/api` requests to `http://localhost:8000`

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server |
| `npm run build` | Builds production bundle into `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs Oxlint code verification |

---

## 📄 License

MIT © [AI-CTO Engineering Team](https://github.com/Sachin213-stack)
