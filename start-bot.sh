#!/bin/sh
set -e

echo "Waiting for ngrok tunnel to be ready..."
until curl -sf http://ngrok:4040/api/tunnels | grep -q 'public_url'; do
  echo "  ... still waiting"
  sleep 2
done

NGROK_URL=$(curl -s http://ngrok:4040/api/tunnels \
  | grep -o '"public_url":"https://[^"]*"' \
  | head -1 \
  | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
  echo "ERROR: could not extract ngrok URL"
  exit 1
fi

export APP_URL="${NGROK_URL}/finance-miniapp/"
echo "Bot starting — APP_URL=${APP_URL}"
exec node bot.js
