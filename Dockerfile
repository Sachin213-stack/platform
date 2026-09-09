# ============================================
# AI-CTO Frontend — Multi-Stage Production Dockerfile
# ============================================

# -------------------------------------------------------------
# Stage 1: Build & Bundle Compilation (Node.js)
# -------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies using lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Accept build-time API URL argument (defaults to relative /api if not provided)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy application source code
COPY . .

# Build production artifacts (outputs to /app/dist)
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Minimal Static Web Server (Nginx Alpine)
# -------------------------------------------------------------
FROM nginx:alpine AS runtime

# Default port (can be overridden at runtime by Render with $PORT)
ENV PORT=80

# Remove default nginx static assets and config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration template
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy and configure entrypoint script for dynamic port binding
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Expose default HTTP port
EXPOSE 80

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:${PORT:-80}/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
