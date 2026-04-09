#!/bin/sh
set -e

echo "Waiting for cloudflare tunnel URL..."
TUNNEL_URL=""
while [ -z "$TUNNEL_URL" ]; do
  sleep 2
  TUNNEL_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' /tunnel/tunnel.log 2>/dev/null | head -1)
done

export APP_URL="${TUNNEL_URL}/finance-miniapp/"
echo "Bot starting — APP_URL=${APP_URL}"
exec node bot.js
