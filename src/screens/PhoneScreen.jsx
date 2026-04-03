import React, { useState, useRef, useEffect } from 'react'
import BackButton from '../components/BackButton'

const TEMPLATE = 'XX XXX XX XX'

function formatMasked(digits) {
  const chars = [...TEMPLATE]
  let used = 0
  return chars.map((ch, i) => {
    if (ch === ' ') return { char: ' ', filled: false, isSpace: true }
    if (used < digits.length) {
      const c = digits[used++]
      return { char: c, filled: true, isSpace: false }
    }
    return { char: '0', filled: false, isSpace: false }
  })
}

export default function PhoneScreen({ onBack, onNext }) {
  const [digits, setDigits] = useState('')
  const inputRef = useRef(null)
  const isReady = digits.length === 9

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 350)
  }, [])

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
    setDigits(raw)
  }

  const masked = formatMasked(digits)

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden real input */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        value={digits}
        onChange={handleChange}
        style={{ position: 'absolute', opacity: 0.001, width: 1, height: 1, top: 0, left: 0 }}
      />

      {/* Back */}
      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 65px)', left: '24px' }}>
        <BackButton onClick={onBack} />
      </div>

      {/* Content */}
      <div style={{ paddingTop: 'calc(var(--safe-top) + 135px)', paddingLeft: '24px', paddingRight: '24px', flex: 1 }}>
        <div style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif", fontSize: '40px', fontWeight: 700, letterSpacing: '-0.6px', lineHeight: 1.1, color: '#fff', marginBottom: '16px' }}>
          Telefon raqamingizni<br />kiriting
        </div>
        <div style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.75px', lineHeight: 1.5, maxWidth: '312px', marginBottom: '24px' }}>
          SMS orqali tasdiqlash kodi yuboriladi.<br />Telefon raqamingizni kiriting.
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} onClick={() => inputRef.current?.focus()}>
          {/* Flag + code */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '0 12px', height: '66px',
            background: '#1C1C1E', borderRadius: '20px',
          }}>
            <UzFlag />
            <span style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-1px', color: '#fff' }}>998</span>
          </div>

          {/* Masked number */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '0 16px', height: '66px',
            background: '#1C1C1E', borderRadius: '20px',
            fontSize: '28px', fontWeight: 700, letterSpacing: '-1px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {masked.map((m, i) =>
              m.isSpace
                ? <span key={i}>&nbsp;</span>
                : <span key={i} style={{ color: m.filled ? '#fff' : 'rgba(235,235,245,0.3)' }}>{m.char}</span>
            )}
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div style={{
        padding: '8px 16px 36px',
        paddingBottom: 'calc(var(--safe-bottom) + 36px)',
        background: '#000',
      }}>
        <ContinueButton enabled={isReady} onClick={() => isReady && onNext(digits)} />
      </div>
    </div>
  )
}

function ContinueButton({ enabled, onClick }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', height: '60px', borderRadius: '999px', border: 'none',
        background: enabled ? '#fff' : 'rgba(255,255,255,0.15)',
        color: enabled ? '#1A1B1B' : 'rgba(255,255,255,0.35)',
        fontSize: '17px', fontWeight: 500, letterSpacing: '-0.43px',
        transition: 'background 0.2s, color 0.2s, transform 0.12s',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        cursor: enabled ? 'pointer' : 'default',
      }}
    >
      Davom etish
    </button>
  )
}

function UzFlag() {
  return (
    <svg width="32" height="24" viewBox="0 0 32 24" style={{ borderRadius: '3px', flexShrink: 0 }}>
      <rect y="0"  width="32" height="8"  fill="#0099B5" />
      <rect y="8"  width="32" height="8"  fill="#fff" />
      <rect y="16" width="32" height="8"  fill="#1EB53A" />
      <rect y="7.5"  width="32" height="1" fill="#CE1126" />
      <rect y="15.5" width="32" height="1" fill="#CE1126" />
    </svg>
  )
}
