import { useState } from 'react'
import IC_BACK   from '../assets/icons/ui/back.svg'
import IC_DELETE from '../assets/icons/ui/delete.svg'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

const CURRENCIES = [
  { key: 'UZS', label: 'Uzbek sum' },
  { key: 'USD', label: 'US Dollar' },
  { key: 'RUB', label: 'Russian ruble' },
  { key: 'EUR', label: 'Euro' },
]

const WALLET_ICONS = ['💰','💳','🏦','🎮','🛒','👕','🍽️','🏠','🌐','✈️','🎓','💊']

const NUMPAD_ROWS = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  [',','0','⌫'],
]

function formatAmt(str) {
  const raw = str.replace(/[^\d]/g, '')
  if (!raw) return '0'
  return parseInt(raw, 10).toLocaleString('ru-RU').replace(/,/g, ' ')
}

// ── Step 1: Wallet details ─────────────────────────────────────────────────────
function Step1({ name, setName, currency, setCurrency, icon, setIcon, limitEnabled, setLimitEnabled, onContinue }) {
  const canContinue = name.trim().length > 0

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', scrollbarWidth: 'none' }}>
      <div style={{ paddingTop: 'calc(var(--safe-top) + 80px)', paddingBottom: 40 }}>

        {/* Title */}
        <div style={{ padding: '16px 24px 24px' }}>
          <div style={{
            fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
            fontSize: 40, fontWeight: 700, letterSpacing: '-0.6px', lineHeight: '41px',
            color: '#fff',
          }}>
            How do you call<br />this wallet?
          </div>
        </div>

        {/* Name input */}
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{
            background: 'rgba(118,118,128,0.18)', borderRadius: 24,
            height: 52, display: 'flex', alignItems: 'center', padding: '0 16px',
          }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Wallet Name"
              autoFocus
              style={{
                width: '100%', background: 'none', border: 'none', outline: 'none',
                fontFamily: "'SF Pro', -apple-system, sans-serif",
                fontSize: 17, fontWeight: 400, letterSpacing: '-0.43px',
                color: '#fff',
              }}
            />
          </div>
          <div style={{
            padding: '6px 16px 0',
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 13, color: 'rgba(235,235,245,0.45)', letterSpacing: '-0.5px',
          }}>
            Choose a clear, short name your members will recognize.
          </div>
        </div>

        {/* Currency selector */}
        <div style={{ padding: '8px 16px' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {CURRENCIES.slice(0, 2).map(c => (
              <button
                key={c.key}
                onClick={() => setCurrency(c.key)}
                style={{
                  flex: 1, height: 57, borderRadius: 28, border: 'none', cursor: 'pointer',
                  background: currency === c.key ? 'rgba(118,118,128,0.3)' : 'rgba(118,118,128,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.15s',
                }}
              >
                <span style={{
                  fontFamily: "'SF Pro', -apple-system, sans-serif",
                  fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px',
                  color: currency === c.key ? '#fff' : 'rgba(235,235,245,0.35)',
                  letterSpacing: '-0.45px',
                }}>
                  {c.label}
                </span>
                {currency === c.key && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#0088FF', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet icon */}
        <div style={{ padding: '8px 16px' }}>
          <div style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 12, fontWeight: 510, letterSpacing: '-0.2px', color: 'rgba(235,235,245,0.45)',
            textTransform: 'uppercase', padding: '0 4px 8px',
          }}>
            WALLET ICON
          </div>
          <div style={{
            background: 'rgba(118,118,128,0.18)', borderRadius: 24,
            height: 52, display: 'flex', alignItems: 'center', padding: '0 12px',
            gap: 4, overflowX: 'auto', scrollbarWidth: 'none',
          }}>
            {WALLET_ICONS.map(ic => (
              <button
                key={ic}
                onClick={() => setIcon(ic)}
                style={{
                  flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: icon === ic ? 'rgba(255,255,255,0.15)' : 'none',
                  cursor: 'pointer', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                {ic}
              </button>
            ))}
          </div>
          <div style={{
            padding: '6px 4px 0',
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 13, color: 'rgba(235,235,245,0.45)', letterSpacing: '-0.43px',
          }}>
            Select a different icon for this wallet
          </div>
        </div>

        {/* Monthly limit toggle */}
        <div style={{ padding: '8px 16px' }}>
          <div style={{
            background: 'rgba(118,118,128,0.18)', borderRadius: 26,
            padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, background: '#0088FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>
                📊
              </div>
              <span style={{
                fontFamily: "'SF Pro', -apple-system, sans-serif",
                fontSize: 16, fontWeight: 510, color: '#fff', letterSpacing: '-0.5px',
              }}>Monthly limit</span>
            </div>
            <button
              onClick={() => setLimitEnabled(v => !v)}
              style={{
                width: 51, height: 28, borderRadius: 100, border: 'none', cursor: 'pointer',
                background: limitEnabled ? '#30D158' : 'rgba(120,120,128,0.32)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 2,
                left: limitEnabled ? 25 : 2,
                width: 24, height: 24, borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        </div>

        {/* Continue button */}
        <div style={{ padding: '16px 16px 0' }}>
          <button
            onClick={() => canContinue && onContinue()}
            style={{
              width: '100%', height: 60, borderRadius: 999, border: 'none',
              background: canContinue ? 'rgba(118,118,128,0.24)' : 'rgba(118,118,128,0.1)',
              color: canContinue ? '#fff' : 'rgba(235,235,245,0.25)',
              fontFamily: "'SF Pro', -apple-system, sans-serif",
              fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px',
              cursor: canContinue ? 'pointer' : 'default',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Balance entry ──────────────────────────────────────────────────────
function Step2({ digits, onTap, onCreate, saving, currency }) {
  const displayAmt = formatAmt(digits)

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Title + subtitle */}
      <div style={{ padding: 'calc(var(--safe-top) + 80px) 24px 0' }}>
        <div style={{
          fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
          fontSize: 40, fontWeight: 700, letterSpacing: '-0.6px', lineHeight: '41px',
          color: '#fff', marginBottom: 12,
        }}>
          Current balance
        </div>
        <div style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 17, fontWeight: 400, letterSpacing: '-0.75px',
          color: 'rgba(235,235,245,0.6)',
        }}>
          How much is in this wallet right now?
        </div>
      </div>

      {/* Amount display — centered in remaining space */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 16, fontWeight: 400, letterSpacing: '-0.31px',
          color: 'rgba(235,235,245,0.6)', marginBottom: 8,
        }}>
          Current balance
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
            fontSize: displayAmt.length > 8 ? 32 : 40,
            fontWeight: 700, color: '#fff',
            letterSpacing: '-0.6px', lineHeight: '41px',
            transition: 'font-size 0.15s',
          }}>
            {displayAmt}
          </span>
          <span style={{
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 20, fontWeight: 400,
            color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.45px',
          }}>
            {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'sums'}
          </span>
        </div>
      </div>

      {/* Numpad + button */}
      <div style={{ padding: '0 16px', paddingBottom: 'calc(30px + var(--safe-bottom))', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 }}>
          {NUMPAD_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 4 }}>
              {row.map((label, ci) => (
                <NumKey key={ci} label={label} onTap={() => onTap(label)} />
              ))}
            </div>
          ))}
        </div>
        <button
          onClick={onCreate}
          disabled={saving}
          style={{
            width: '100%', height: 60, borderRadius: 999, border: 'none',
            background: saving ? 'rgba(255,255,255,0.6)' : '#fff',
            color: '#1A1B1B',
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px', cursor: 'pointer',
          }}
        >
          {saving ? 'Creating…' : 'Create wallet'}
        </button>
      </div>
    </div>
  )
}

function NumKey({ label, onTap }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onTap() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        flex: 1, height: 60, border: 'none', cursor: 'pointer',
        borderRadius: label === ',' || label === '⌫' ? 999 : 16,
        background: 'rgba(118,118,128,0.18)',
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        color: '#fff', fontSize: 17, fontWeight: 510,
        letterSpacing: '-0.43px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: pressed ? 0.5 : 1, transition: 'opacity 0.1s',
      }}
    >
      {label === '⌫' ? (
        <div style={{ position: 'relative', width: 28, height: 28, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: '16.41% 10.56% 16.39% 6.54%' }}>
            <img src={IC_DELETE} alt="⌫" style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </div>
      ) : label}
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AddWalletScreen({ userId, onClose, onCreated }) {
  const [step,          setStep]         = useState(1)
  const [name,          setName]         = useState('')
  const [currency,      setCurrency]     = useState('UZS')
  const [icon,          setIcon]         = useState('💰')
  const [limitEnabled,  setLimitEnabled] = useState(false)
  const [digits,        setDigits]       = useState('')
  const [saving,        setSaving]       = useState(false)

  function tapNum(label) {
    if (label === '⌫') {
      setDigits(d => d.slice(0, -1))
    } else if (label === ',') {
      setDigits(d => d.includes(',') ? d : d + ',')
    } else {
      setDigits(d => d + label)
    }
  }

  async function handleCreate() {
    const balance = parseInt(digits.replace(/\D/g, ''), 10) || 0
    setSaving(true)
    try {
      await fetch(`${API_BASE}/users/${userId}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), currency, balance }),
      })
      onCreated?.()
    } catch (e) {
      console.error('[AddWallet]', e)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div data-file="src/screens/AddWalletScreen.jsx" style={{ position: 'absolute', inset: 0, background: '#000' }}>

      {/* Blue gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
        background: 'linear-gradient(180deg, rgba(0,136,255,0.12) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Back button */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: 'calc(var(--safe-top) + 10px) 16px 0',
        height: 'calc(var(--safe-top) + 62px)',
        display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={step === 1 ? onClose : () => setStep(1)}
          style={{
            width: 60, height: 45, borderRadius: 999,
            background: 'rgba(28,28,30,0.85)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ width: 32, height: 32, mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)' }}>
            <img src={IC_BACK} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </button>

        {/* Step indicator */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6,
        }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              width: s === step ? 20 : 8, height: 8, borderRadius: 999,
              background: s === step ? '#0088FF' : 'rgba(255,255,255,0.2)',
              transition: 'width 0.2s, background 0.2s',
            }} />
          ))}
        </div>
      </div>

      {/* Screens */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {step === 1 ? (
          <Step1
            name={name} setName={setName}
            currency={currency} setCurrency={setCurrency}
            icon={icon} setIcon={setIcon}
            limitEnabled={limitEnabled} setLimitEnabled={setLimitEnabled}
            onContinue={() => setStep(2)}
          />
        ) : (
          <Step2
            digits={digits}
            onTap={tapNum}
            onCreate={handleCreate}
            saving={saving}
            currency={currency}
          />
        )}
      </div>
    </div>
  )
}
