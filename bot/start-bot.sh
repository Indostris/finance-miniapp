#!/bin/sh
set -e

echo "Waiting for Cloudflare tunnel URL..."
for i in $(seq 1 30); do
  TUNNEL_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' /tunnel/tunnel.log 2>/dev/null | head -1)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 2
done

if [ -z "$TUNNEL_URL" ]; then
  echo "Could not detect tunnel URL, falling back to APP_URL=${APP_URL}"
else
  export APP_URL="$TUNNEL_URL/finance-miniapp/"
  echo "Detected tunnel URL: $APP_URL"
fi

exec node bot.js
