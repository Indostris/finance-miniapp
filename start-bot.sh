#!/bin/sh
set -e

echo "Bot starting — APP_URL=${APP_URL}"
exec node bot.js
