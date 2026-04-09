import React, { useState, useCallback, useEffect, useRef } from 'react'
import OnboardingScreen from './screens/OnboardingScreen'
import PhoneScreen      from './screens/PhoneScreen'
import OTPScreen        from './screens/OTPScreen'
import CategoryScreen   from './screens/CategoryScreen'
import HomeScreen       from './screens/HomeScreen'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [phone,  setPhone]  = useState('')
  // userId/username resolved after tg.ready() fires — safe on iOS WKWebView
  const userIdRef  = useRef(1)
  const usernameRef = useRef(null)

  const go = useCallback((s) => setScreen(s), [])

  // On mount: wait for Telegram WebApp to be ready, then check if user exists
  useEffect(() => {
    const tg = window.Telegram?.WebApp

    function init() {
      const user = tg?.initDataUnsafe?.user
      userIdRef.current  = user?.id       ?? 1
      usernameRef.current = user?.username ?? null

      if (!tg?.initData) {
        go('onboarding')
        return
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      fetch(`${API_BASE}/users/${userIdRef.current}`, { signal: controller.signal })
        .then(r => {
          clearTimeout(timeout)
          if (r.ok)             return go('home')
          if (r.status === 404) return go('onboarding')
          throw new Error(`HTTP ${r.status}`)
        })
        .catch(() => { clearTimeout(timeout); go('onboarding') })
    }

    if (tg) {
      // ready() signals Telegram that the app is loaded;
      // on iOS the JS bridge may not be fully set up until this call resolves
      tg.ready()
      // Give the bridge a tick to populate initDataUnsafe on iOS
      setTimeout(init, 50)
    } else {
      init()
    }
  }, [])

  // Called when OTP screen completes — register the user then continue
  async function handleOTPComplete() {
    try {
      await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userIdRef.current, username: usernameRef.current }),
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
        <HomeScreen userId={userIdRef.current} />
      )}
    </div>
  )
}
