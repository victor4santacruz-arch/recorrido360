#!/usr/bin/env bash
# =============================================================================
# Recorrido 360 — first-time VPS deployment script (Ubuntu 22.04+)
# Run as root on a fresh /opt/recorrido360 checkout. Idempotent.
# =============================================================================
set -euo pipefail

APP_DIR="/opt/recorrido360"
DOMAIN="recorrido360.net"
WWW_DOMAIN="www.recorrido360.net"
BACKEND_PORT=8002
SERVICE_NAME="recorrido360-backend"
ADMIN_EMAIL_FOR_CERTBOT="vic_enne@yahoo.com"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root."
  exit 1
fi

cd "${APP_DIR}"
echo "================================================================"
echo " Recorrido 360 — installing on $(hostname)"
echo " App dir:   ${APP_DIR}"
echo " Domain:    ${DOMAIN} (+ ${WWW_DOMAIN})"
echo " Back port: ${BACKEND_PORT}"
echo "================================================================"

# -----------------------------------------------------------------------------
# 1. System packages (skip the ones that are already there from the POS2GTO install)
# -----------------------------------------------------------------------------
echo "→ Ensuring system packages…"
apt-get update -qq
apt-get install -y python3 python3-venv python3-pip nodejs build-essential \
                   nginx curl ca-certificates ufw certbot python3-certbot-nginx
# Yarn (CRA project uses it)
if ! command -v yarn >/dev/null 2>&1; then
  npm install -g yarn
fi

# -----------------------------------------------------------------------------
# 2. Backend — Python venv + deps
# -----------------------------------------------------------------------------
echo "→ Installing backend Python deps…"
cd "${APP_DIR}/backend"
python3 -m venv .venv
. .venv/bin/activate
pip install --upgrade pip wheel
pip install -r requirements.txt
deactivate

# Generate .env from example if missing
if [[ ! -f "${APP_DIR}/backend/.env" ]]; then
  cp "${APP_DIR}/backend/.env.example" "${APP_DIR}/backend/.env"
  # Replace JWT placeholder with a real random secret
  JWT=$(openssl rand -hex 32)
  sed -i "s|CHANGE_ME_TO_A_RANDOM_64_CHAR_STRING|${JWT}|" "${APP_DIR}/backend/.env"
  echo "   ✓ Generated /opt/recorrido360/backend/.env (review it before going live!)"
else
  echo "   ✓ Existing backend/.env kept untouched"
fi

# -----------------------------------------------------------------------------
# 3. Frontend — build static bundle
# -----------------------------------------------------------------------------
echo "→ Building frontend…"
cd "${APP_DIR}/frontend"
if [[ ! -f "${APP_DIR}/frontend/.env" ]]; then
  cp "${APP_DIR}/frontend/.env.example" "${APP_DIR}/frontend/.env"
fi
yarn install --frozen-lockfile
NODE_OPTIONS=--openssl-legacy-provider yarn build

# -----------------------------------------------------------------------------
# 4. Logs + systemd unit
# -----------------------------------------------------------------------------
echo "→ Configuring systemd…"
mkdir -p /var/log/recorrido360
chown -R www-data:www-data /var/log/recorrido360 "${APP_DIR}"

cp "${APP_DIR}/deployment/${SERVICE_NAME}.service" "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"

# -----------------------------------------------------------------------------
# 5. Nginx (HTTP first; HTTPS done by certbot below)
# -----------------------------------------------------------------------------
echo "→ Configuring Nginx…"
mkdir -p /var/www/certbot
cp "${APP_DIR}/deployment/nginx-recorrido360.conf" /etc/nginx/sites-available/recorrido360
ln -sf /etc/nginx/sites-available/recorrido360 /etc/nginx/sites-enabled/recorrido360
nginx -t
systemctl reload nginx

# -----------------------------------------------------------------------------
# 6. Let's Encrypt SSL — only if HTTPS isn't already provisioned
# -----------------------------------------------------------------------------
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  echo "→ Requesting Let's Encrypt cert for ${DOMAIN} and ${WWW_DOMAIN}…"
  echo "   Make sure both A records point to this server first!"
  certbot --nginx --non-interactive --agree-tos \
          --email "${ADMIN_EMAIL_FOR_CERTBOT}" \
          -d "${DOMAIN}" -d "${WWW_DOMAIN}" || \
    echo "   ⚠️  certbot failed — check your DNS A records and re-run later."
else
  echo "→ HTTPS cert already present, skipping certbot."
fi

# -----------------------------------------------------------------------------
# 7. UFW firewall (assumes 22/80/443 already opened for POS2GTO)
# -----------------------------------------------------------------------------
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q active; then
  ufw allow 'Nginx Full' || true
fi

systemctl reload nginx
echo "================================================================"
echo " ✅ Recorrido 360 deployed."
echo "    Frontend: https://${DOMAIN}"
echo "    Admin:    https://${DOMAIN}/admin/login"
echo "    API:      https://${DOMAIN}/api/health"
echo "    Logs:     tail -f /var/log/recorrido360/backend.log"
echo "    Status:   systemctl status ${SERVICE_NAME}"
echo "================================================================"
