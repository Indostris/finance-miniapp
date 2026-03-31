import React, { useState, useCallback } from 'react'
import OnboardingScreen from './screens/OnboardingScreen'
import PhoneScreen      from './screens/PhoneScreen'
import OTPScreen        from './screens/OTPScreen'
import CategoryScreen   from './screens/CategoryScreen'
import HomeScreen       from './screens/HomeScreen'

const SCREENS = ['onboarding', 'phone', 'otp', 'categories', 'home']

export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [phone,  setPhone]  = useState('')

  const go = useCallback((s) => setScreen(s), [])

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
          onComplete={() => go('categories')}
        />
      )}
      {screen === 'categories' && (
        <CategoryScreen
          onBack={() => go('otp')}
          onContinue={() => go('home')}
        />
      )}
      {screen === 'home' && (
        <HomeScreen />
      )}
    </div>
  )
}
