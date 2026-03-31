# Finance Tracker — Telegram Mini App

Telegram Mini App для учёта личных финансов. Написан на React + Vite, задеплоен на Vercel.

**Бот:** [@soqqahisoblabot](https://t.me/soqqahisoblabot)
**Живая версия:** https://webapp-blond-theta.vercel.app

---

## Экраны

| Экран | Описание |
|-------|----------|
| Onboarding | Анимированный слот с категориями, кнопки входа |
| Phone | Ввод номера телефона с маской (+998 XX XXX XX XX) |
| OTP | Ввод 6-значного кода подтверждения |
| Categories | Выбор категорий расходов |
| Home | Главный экран: баланс, CTA, карусель, транзакции, лимиты, счета |
| Add Expense | Цифровой ввод суммы с numpad |

## Стек

- **React 18** + **Vite 5**
- **Telegram Web App SDK** (`telegram-web-app.js`)
- Чистый CSS-in-JS без внешних UI-библиотек
- Деплой: **Vercel**

## Запуск локально

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Деплой на Vercel

```bash
npx vercel --prod
```

## Бот (polling)

```bash
node bot.js
```

Бот обрабатывает команду `/start` и отправляет inline-кнопку для открытия Mini App.

Переменные окружения:

```
BOT_TOKEN=<telegram_bot_token>
APP_URL=<vercel_url>
```

## Структура

```
webapp/
├── index.html
├── vite.config.js
├── bot.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   └── global.css
    ├── components/
    │   └── BackButton.jsx
    └── screens/
        ├── OnboardingScreen.jsx
        ├── PhoneScreen.jsx
        ├── OTPScreen.jsx
        ├── CategoryScreen.jsx
        ├── HomeScreen.jsx
        └── AddExpenseScreen.jsx
```
