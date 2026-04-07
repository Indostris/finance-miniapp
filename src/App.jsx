import React, { useState, useCallback, useEffect } from 'react'
import OnboardingScreen from './screens/OnboardingScreen'
import PhoneScreen      from './screens/PhoneScreen'
import OTPScreen        from './screens/OTPScreen'
import CategoryScreen   from './screens/CategoryScreen'
import HomeScreen       from './screens/HomeScreen'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const tg       = window.Telegram?.WebApp
const TG_USER  = tg?.initDataUnsafe?.user
const userId   = TG_USER?.id       ?? 1
const username = TG_USER?.username ?? null

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [phone,  setPhone]  = useState('')

  const go = useCallback((s) => setScreen(s), [])

  // On mount: check if this Telegram user already exists in the DB
  useEffect(() => {
    // In browser (not Telegram), skip auth check and go straight to onboarding
    if (!window.Telegram?.WebApp?.initData) {
      go('onboarding')
      return
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    fetch(`${API_BASE}/users/${userId}`, { signal: controller.signal })
      .then(r => {
        clearTimeout(timeout)
        if (r.ok)        return go('home')       // returning user → skip onboarding
        if (r.status === 404) return go('onboarding') // new user → show onboarding
        throw new Error(`HTTP ${r.status}`)
      })
      .catch(() => { clearTimeout(timeout); go('onboarding') }) // on network error, fall through to onboarding
  }, [])

  // Called when OTP screen completes — register the user then continue
  async function handleOTPComplete() {
    try {
      await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, username }),
      })
    } catch (e) {
      console.error('Failed to register user:', e)
    }
    go('categories')
  }

  if (screen === 'loading') {
    return (
      <div style={{
        position: 'absolute', inset: 0, background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.12)',
          borderTopColor: '#0088FF',
          animation: 'spin 0.75s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000' }}>
      {screen === 'onboarding' && (
        <OnboardingScreen
          onPhone={() => go('phone')}
          onEmail={() => go('phone')}
        />
      )}
      {screen === 'phone' && (
        <PhoneScreen
          onBack={() => go('onboarding')}
          onNext={(p) => { setPhone(p); go('otp') }}
        />
      )}
      {screen === 'otp' && (
        <OTPScreen
          phone={phone}
          onBack={() => go('phone')}
          onComplete={handleOTPComplete}
        />
      )}
      {screen === 'categories' && (
        <CategoryScreen
          onBack={() => go('otp')}
          onContinue={() => go('home')}
        />
      )}
      {screen === 'home' && (
        <HomeScreen userId={userId} />
      )}
    </div>
  )
}
