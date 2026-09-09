# AI-CTO Frontend — Render Deployment Guide

This guide details deploying the AI-CTO React + Vite frontend to [Render](https://render.com) as a containerized **Web Service using Docker**.

---

## 1. Architecture Overview

```text
                    INTERNET
                        │
                        ▼
              ┌──────────────────┐
              │ Frontend Service │
              │   Docker (Nginx) │ (e.g., https://aicto-platform.onrender.com)
              └────────┬─────────┘
                       │
                    HTTPS API (VITE_API_BASE_URL)
                       │
                       ▼
              ┌──────────────────┐
              │ Backend Service  │
              │ FastAPI Docker   │ (e.g., https://aicto-backend.onrender.com)
              └───────┬─────┬────┘
                      │     │
                      ▼     ▼
                  Postgres Redis
                      │
                      ▼
                 NVIDIA NIM
```

The frontend and backend run as separate deployable services on Render. The browser loads the static frontend from the Nginx container and makes direct HTTPS API calls to the FastAPI backend.

---

## 2. Service Configuration on Render

1. Click **New +** > **Web Service**.
2. Connect your Git repository.
3. Configure the following settings:
   - **Name**: `aicto-platform` (or your preferred service name)
   - **Region**: Same region as your backend service (minimizes latency)
   - **Branch**: `main`
   - **Root Directory**: `aicto-platform` (if deploying from repository subfolder)
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `./Dockerfile` (relative to the Root Directory)
   - **Instance Type**: Starter / Free (or your required tier)

---

## 3. Environment & Build Variables

In the Render Dashboard under **Environment** (or Docker Build Arguments):

| Variable Name | Type | Required | Description | Example |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | Build Argument / Env | **Yes** | HTTPS URL of your deployed FastAPI backend API root | `https://aicto-backend.onrender.com/api` |
| `PORT` | Runtime Env | Optional | Automatically injected by Render; `docker-entrypoint.sh` binds Nginx dynamically to this port | `10000` |

> [!NOTE]
> Because Vite embeds environment variables into the static bundle during `npm run build`, `VITE_API_BASE_URL` is passed as a build argument (`ARG VITE_API_BASE_URL`).

---

## 4. Health Check Endpoint

In Render under **Health Check Path** (Service Settings):

```text
/health
```

Nginx responds immediately with HTTP `200 "healthy\n"`. Render uses this to ensure zero-downtime rolling deploys.

---

## 5. Backend CORS Configuration (Critical)

Once your frontend service is provisioned on Render, obtain its URL (e.g. `https://aicto-platform.onrender.com`).

In your **Backend Web Service** settings on Render:
1. Go to the **Environment** tab.
2. Update `ALLOWED_ORIGINS` to include the frontend URL:
   ```text
   ALLOWED_ORIGINS=https://aicto-platform.onrender.com,http://localhost:5173
   ```
3. Save changes. The backend will automatically reload with the new allowed origin.
