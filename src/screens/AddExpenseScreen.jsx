import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

// ── Figma SVG assets ─────────────────────────────────────────────────────────
import {
  IC_TYPE_ADD, IC_TYPE_TRN, IC_TYPE_INC, IC_MORE,
  IC_CALENDAR, IC_DOTS, IC_CARD, IC_CHEVRON, IC_DELETE,
} from '../icons'

// ── Data ────────────────────────────────────────────────────────────────────
const NAV_TYPES = [
  { key: 'Expense',  icon: IC_TYPE_ADD },
  { key: 'Transfer', icon: IC_TYPE_TRN },
  { key: 'Income',   icon: IC_TYPE_INC },
]
const VALID_TYPES = new Set(NAV_TYPES.map(t => t.key))

// [label, isPill]
const ROWS = [
  [['1',false],['2',false],['3',false],['+',true ]],
  [['4',false],['5',false],['6',false],['−',true ]],
  [['7',false],['8',false],['9',false],['×',true ]],
  [[',',false],['0',false],['⌫',true ],['÷',true ]],
]

function formatAmount(digits) {
  const raw = digits.replace(/,/g, '').replace(/\s/g, '')
  if (!raw) return '0'
  return parseInt(raw, 10).toLocaleString('en').replace(/,/g, ' ')
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AddExpenseScreen({ type: initType, userId, accounts = [], onClose }) {
  const [type,      setType]      = useState(VALID_TYPES.has(initType) ? initType : 'Expense')
  const [digits,    setDigits]    = useState('')
  const [note,      setNote]      = useState('')
  const [accountIdx, setAccountIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const displayAmt   = formatAmount(digits)
  const selectedAcc  = accounts[accountIdx] ?? null

  function tap(label) {
    if (label === '⌫') {
      setDigits(d => d.slice(0, -1))
    } else if (label === ',') {
      setDigits(d => d.includes(',') ? d : (d || '0') + ',')
    } else if (['+','−','×','÷'].includes(label)) {
      // future arithmetic
    } else {
      setDigits(d => d === '0' ? label : d + label)
    }
  }

  function cycleAccount() {
    if (accounts.length > 1) setAccountIdx(i => (i + 1) % accounts.length)
  }

  async function handleAdd() {
    const amount = parseInt(digits.replace(/,/g, '').replace(/\s/g, '') || '0', 10)
    if (!amount) return

    const body  = {
      type:       type.toLowerCase(),
      amount,
      note:       note || null,
      account_id: selectedAcc?.id ?? null,
      source:     'manual',
    }

    setSubmitting(true)
    try {
      await fetch(`${API_BASE}/users/${userId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      onClose()
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const accountLabel = selectedAcc ? selectedAcc.name : 'No account'

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top progressive blur ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        zIndex: 5, pointerEvents: 'none',
        background: 'rgba(0,0,0,0.7)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }} />

      {/* ── Toolbar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: 'calc(var(--safe-top) + 10px)',
        padding: 'calc(var(--safe-top) + 10px) 16px 0',
        height: 'calc(var(--safe-top) + 62px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Back */}
        <button
          onClick={onClose}
          style={{
            width: 60, height: 45, borderRadius: 999,
            background: '#1C1C1E', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{
            fontFamily: "'SF Pro Symbols', -apple-system, sans-serif",
            fontSize: 14, color: '#fff',
            display: 'inline-block',
            transform: 'rotate(-90deg)',
            fontFeatureSettings: "'ss16' 1",
            lineHeight: '30px',
            mixBlendMode: 'plus-lighter',
          }}>{'\u{100188}'}</span>
        </button>

        {/* Type switcher */}
        <div style={{
          background: '#1C1C1E', borderRadius: 999,
          padding: 4, display: 'flex', gap: 0, flexShrink: 0,
        }}>
          {NAV_TYPES.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setType(key)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', cursor: 'pointer',
                background: key === type ? 'rgba(118,118,128,0.24)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mixBlendMode: key === type ? 'normal' : 'plus-lighter',
                transition: 'background 0.2s',
              }}
            >
              <img src={icon} alt={key} style={{ width: 32, height: 32 }} />
            </button>
          ))}
        </div>

        {/* More */}
        <div style={{
          width: 60, height: 45, borderRadius: 999, overflow: 'hidden',
          flexShrink: 0, position: 'relative',
        }}>
          <img src={IC_MORE} alt="more" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* ── Amount display ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 16px 0',
      }}>
        <div style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 16, color: 'rgba(235,235,245,0.6)',
          marginBottom: 12, letterSpacing: '-0.31px',
        }}>
          New {type.toLowerCase()}
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
            fontWeight: 400,
            fontSize: 20, color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.45px',
          }}>
            sums
          </span>
        </div>
      </div>

      {/* ── Bottom section ── */}
      <div style={{
        padding: '0 16px',
        paddingBottom: 'calc(32px + var(--safe-bottom))',
        display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
      }}>

        {/* Chips */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {/* Date chip — static */}
          <ChipButton label="Today" icon={IC_CALENDAR} />
          {/* Other chip — static */}
          <ChipButton label="Other" icon={IC_DOTS} />
          {/* Account chip — dynamic */}
          <ChipButton
            label={accountLabel}
            icon={IC_CARD}
            onClick={accounts.length > 1 ? cycleAccount : undefined}
          />
        </div>

        {/* Note */}
        <div style={{
          height: 50, borderRadius: 16,
          background: 'rgba(118,118,128,0.24)',
          display: 'flex', alignItems: 'center', padding: '0 16px',
        }}>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note"
            style={{
              width: '100%', fontSize: 17, letterSpacing: '-0.43px',
              fontFamily: "'SF Pro', -apple-system, sans-serif",
              fontWeight: 400, color: '#fff',
            }}
          />
        </div>

        {/* Numpad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 2 }}>
              {row.map(([label, pill], ci) => (
                <NumKey key={ci} label={label} pill={pill} onTap={() => tap(label)} />
              ))}
            </div>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={submitting || !digits}
          style={{
            height: 60, borderRadius: 999, border: 'none',
            background: digits ? '#fff' : 'rgba(255,255,255,0.15)',
            color: digits ? '#1A1B1B' : 'rgba(255,255,255,0.35)',
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px',
            cursor: digits ? 'pointer' : 'default',
            opacity: submitting ? 0.6 : 1,
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {submitting ? 'Saving…' : `Add ${type.toLowerCase()}`}
        </button>
      </div>
    </div>
  )
}

// ── ChipButton ────────────────────────────────────────────────────────────────
function ChipButton({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '13px 16px', borderRadius: 999, flexShrink: 0,
        background: 'rgba(118,118,128,0.24)', border: 'none', cursor: onClick ? 'pointer' : 'default',
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        color: '#fff', fontSize: 17, fontWeight: 510,
      }}
    >
      <img src={icon} alt={label} style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
      {label}
      <img src={IC_CHEVRON} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
    </button>
  )
}

// ── NumKey ───────────────────────────────────────────────────────────────────
function NumKey({ label, pill, onTap }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onTap() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        flex: 1, height: 60, border: 'none', cursor: 'pointer',
        borderRadius: pill ? 999 : 16,
        background: 'rgba(118,118,128,0.24)',
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        color: '#fff', fontSize: 17, fontWeight: 510,
        letterSpacing: '-0.43px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: pressed ? 0.55 : 1,
        transition: 'opacity 0.1s',
      }}
    >
      {label === '⌫'
        ? (
          <div style={{ position: 'relative', width: 28, height: 28, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: '16.41% 10.56% 16.39% 6.54%' }}>
              <img src={IC_DELETE} alt="⌫" style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>
          </div>
        )
        : label
      }
    </button>
  )
}
