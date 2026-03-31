// Simple bot server for handling /start command
// Run: node bot.js
// Or deploy alongside the webapp

const BOT_TOKEN = process.env.BOT_TOKEN || '8699075346:AAHpJdywJgql5DI6qT5tYcSy38y4FCWvk60'
const APP_URL   = process.env.APP_URL   || 'https://webapp-blond-theta.vercel.app'

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function sendMessage(chatId, text, replyMarkup) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML' }
  if (replyMarkup) body.reply_markup = replyMarkup
  await fetch(`${TG_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function poll() {
  let offset = 0
  while (true) {
    try {
      const res  = await fetch(`${TG_API}/getUpdates?offset=${offset}&timeout=30`)
      const data = await res.json()
      if (!data.ok) { await sleep(3000); continue }

      for (const upd of data.result) {
        offset = upd.update_id + 1
        const msg = upd.message
        if (!msg) continue
        if (msg.text === '/start') {
          await sendMessage(msg.chat.id, '👋 Finance App ga xush kelibsiz!', {
            inline_keyboard: [[{
              text: '💰 Ilovani ochish',
              web_app: { url: APP_URL },
            }]],
          })
        }
      }
    } catch (e) {
      console.error(e.message)
      await sleep(3000)
    }
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

console.log(`🤖 Bot started. App URL: ${APP_URL}`)
poll()
