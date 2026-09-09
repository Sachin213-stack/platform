#!/bin/sh
set -e

# Default to port 80 if PORT is unset or empty
TARGET_PORT="${PORT:-80}"

# Backend upstream for Nginx reverse proxy.
# LOCAL Docker Compose: "backend:8000" (Docker DNS service name + port)
# Render / cloud:       set BACKEND_UPSTREAM to the reachable host:port
#                       e.g. "my-backend.onrender.com:443" or "my-backend.onrender.com"
TARGET_BACKEND="${BACKEND_UPSTREAM:-backend:8000}"

# Substitute placeholders into Nginx default config
sed -i "s/__PORT__/${TARGET_PORT}/g" /etc/nginx/conf.d/default.conf
sed -i "s/__BACKEND_UPSTREAM__/${TARGET_BACKEND}/g" /etc/nginx/conf.d/default.conf

# Execute CMD
exec "$@"
