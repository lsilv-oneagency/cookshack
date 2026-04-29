#!/usr/bin/env bash
# =============================================================================
# Staging droplet (Ubuntu 22.04+ / Debian 12+). Run ON the server after clone:
#
#   ssh root@YOUR_DROPLET_IP
#   apt-get update && apt-get install -y git
#   git clone https://github.com/lsilv-oneagency/cookshack.git /opt/cookshack
#   cd /opt/cookshack
#   # Copy secrets (scp from laptop or nano):
#   #   .env.production   ← MIVA_* , NEXT_PUBLIC_* , etc. (see .env.example)
#   sudo bash scripts/provision-staging-droplet.sh
#
# Then open http://YOUR_DROPLET_IP/ (nginx → Next on :3000).
# Remove or tighten firewall rules as needed; add TLS with certbot when DNS points here.
# =============================================================================
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/provision-staging-droplet.sh"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git nginx

# Node.js 20 LTS (NodeSource)
if ! command -v node >/dev/null 2>&1 || [[ "$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "node: $(node -v)  npm: $(npm -v)"

# Firewall (adjust if you use nonstandard SSH port)
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH || true
  ufw allow "Nginx Full" || true
  ufw --force enable || true
fi

if [[ ! -f .env.production ]]; then
  echo "WARNING: .env.production is missing. Create it from .env.example before relying on production."
  echo "         NEXT_PUBLIC_* vars are baked in at build time — add .env.production then re-run this script, or run npm run build again after."
fi

npm ci
npm run build

npm install -g pm2
pm2 delete cookshack 2>/dev/null || true
cd "$REPO_ROOT"
PORT=3000 NODE_ENV=production pm2 start npm --name cookshack -- start
pm2 save
pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.sh 2>/dev/null || true
if [[ -f /tmp/pm2-startup.sh ]]; then
  bash /tmp/pm2-startup.sh || true
fi

cat >/etc/nginx/sites-available/cookshack <<'NGINX'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
  }
}
NGINX

ln -sf /etc/nginx/sites-available/cookshack /etc/nginx/sites-enabled/cookshack
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
systemctl enable nginx

echo ""
echo "Done. Next.js should be on :3000 (pm2: cookshack), nginx on :80."
echo "  pm2 logs cookshack"
echo "  pm2 restart cookshack   # after editing .env.production run: npm run build && pm2 restart cookshack"
