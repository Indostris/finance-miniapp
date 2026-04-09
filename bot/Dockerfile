FROM node:20-alpine
RUN apk add --no-cache curl
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY bot.js start-bot.sh ./
RUN chmod +x start-bot.sh

CMD ["./start-bot.sh"]
