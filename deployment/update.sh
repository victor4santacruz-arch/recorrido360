#!/usr/bin/env bash
# =============================================================================
# Recorrido 360 — update existing deployment via git pull
# Run as root.
# =============================================================================
set -euo pipefail

APP_DIR="/opt/recorrido360"
SERVICE_NAME="recorrido360-backend"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root."
  exit 1
fi

echo "→ Pulling latest code…"
cd "${APP_DIR}"
git pull --rebase

echo "→ Updating Python deps (if requirements.txt changed)…"
cd "${APP_DIR}/backend"
. .venv/bin/activate
pip install -q -r requirements.txt
deactivate

echo "→ Rebuilding frontend…"
cd "${APP_DIR}/frontend"
yarn install --frozen-lockfile
NODE_OPTIONS=--openssl-legacy-provider yarn build

echo "→ Reloading services…"
chown -R www-data:www-data "${APP_DIR}"
systemctl restart "${SERVICE_NAME}"
systemctl reload nginx

echo "✅ Recorrido 360 updated successfully"
echo "   Status: systemctl status ${SERVICE_NAME}"
echo "   Logs:   tail -f /var/log/recorrido360/backend.log"
