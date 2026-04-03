import React, { useState, useRef, useEffect } from 'react'
import BackButton from '../components/BackButton'

function formatPhone(p) {
  if (p.length < 9) return p
  return `${p.slice(0,2)} ${p.slice(2,5)} ${p.slice(5,7)} ${p.slice(7)}`
}

export default function OTPScreen({ phone, onBack, onComplete }) {
  const [code, setCode]       = useState('')
  const [countdown, setCd]    = useState(60)
  const inputRef              = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 350)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const id = setInterval(() => setCd(c => c > 0 ? c - 1 : 0), 1000)
    return () => clearInterval(id)
  }, [countdown])

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(raw)
    if (raw.length === 6) {
      inputRef.current?.blur()
      setTimeout(onComplete, 250)
    }
  }

  const g1 = code.slice(0, 3)
  const g2 = code.slice(3, 6)

  return (
    <div data-file="src/screens/OTPScreen.jsx" style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        value={code}
        onChange={handleChange}
        style={{ position: 'absolute', opacity: 0.001, width: 1, height: 1, top: 0, left: 0 }}
      />

      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 65px)', left: '24px' }}>
        <BackButton onClick={onBack} />
      </div>

      <div style={{ paddingTop: 'calc(var(--safe-top) + 135px)', paddingLeft: '24px', paddingRight: '24px', flex: 1 }}>
        <div style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif", fontSize: '40px', fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1.1, color: '#fff', marginBottom: '16px' }}>
          Tasdiqlash<br />kodini kiriting
        </div>
        <div style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.43px', lineHeight: 1.5, maxWidth: '312px', marginBottom: '32px' }}>
          +998 {formatPhone(phone)} raqamiga<br />6 xonali kod yuborildi.
        </div>

        {/* OTP Boxes */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }} onClick={() => inputRef.current?.focus()}>
          <OTPBox digits={g1} isActive={code.length < 3} cursorPos={code.length < 3 ? code.length : -1} />
          <OTPBox digits={g2} isActive={code.length >= 3 && code.length < 6} cursorPos={code.length >= 3 ? code.length - 3 : -1} />
        </div>

        {/* Resend */}
        <div style={{ display: 'flex', fontSize: '17px', letterSpacing: '-0.43px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Kod kelmadimi? </span>
          {countdown > 0
            ? <span style={{ color: 'rgba(255,255,255,0.4)' }}>{String(countdown).padStart(2, '0')} s</span>
            : <button style={{ color: '#0088FF', background: 'none', border: 'none', fontSize: '17px', letterSpacing: '-0.43px', cursor: 'pointer' }} onClick={() => setCd(60)}>Qayta yuborish</button>
          }
        </div>
      </div>
    </div>
  )
}

function OTPBox({ digits, isActive, cursorPos }) {
  const cells = [0, 1, 2]
  return (
    <div style={{
      width: '140px', height: '75px', borderRadius: '28px',
      background: '#1C1C1E',
      border: `2.5px solid ${isActive ? '#0088FF' : 'transparent'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '2px',
      transition: 'border-color 0.25s',
    }}>
      {cells.map(i => {
        const char  = i < digits.length ? digits[i] : ''
        const empty = char === ''
        const isCur = isActive && cursorPos === i
        return (
          <span key={i} style={{
            fontSize: '52px', fontWeight: 600, letterSpacing: '-0.6px',
            color: empty ? `rgba(255,255,255,${isCur ? 0.45 : 0.18})` : '#fff',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}>
            {empty ? '0' : char}
          </span>
        )
      })}
    </div>
  )
}
