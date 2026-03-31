import React, { useState } from 'react'

const ALL_TYPES  = ['Expense', 'Transfer', 'Income', 'Debt']
const TYPE_ICONS = { Expense: '+', Transfer: '⇄', Income: '↓', Debt: '→' }

const ROWS = [
  [['1',null,false],  ['2',null,false],  ['3',null,false],  ['+',true, true]],
  [['4',null,false],  ['5',null,false],  ['6',null,false],  ['−',true, true]],
  [['7',null,false],  ['8',null,false],  ['9',null,false],  ['×',true, true]],
  [[',',null,false],  ['0',null,false],  ['000',null,true], ['⌫',true, true]],
]

function formatAmount(digits) {
  const raw = digits.replace(/,/g, '').replace(/\s/g, '')
  if (!raw) return '0'
  return parseInt(raw, 10).toLocaleString('en').replace(/,/g, ' ')
}

export default function AddExpenseScreen({ type: initType, onClose }) {
  const [type,   setType]   = useState(initType)
  const [digits, setDigits] = useState('')
  const [note,   setNote]   = useState('')

  function tap(label) {
    if (label === '⌫') {
      setDigits(d => d.slice(0, -1))
    } else if (label === '000') {
      setDigits(d => d ? d + '000' : d)
    } else if (label === ',') {
      setDigits(d => d.includes(',') ? d : (d || '0') + ',')
    } else if (['+', '−', '×'].includes(label)) {
      // future
    } else {
      setDigits(d => d === '0' ? label : d + label)
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        paddingTop: 'calc(var(--safe-top) + 62px)',
        paddingBottom: '0',
      }}>
        {/* Back */}
        <button onClick={onClose} style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: '#1C1C1E', border: 'none', color: 'rgba(255,255,255,0.8)',
          fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>

        {/* Type switcher */}
        <div style={{
          display: 'flex', gap: 0, padding: '4px',
          background: '#1C1C1E', borderRadius: '999px',
        }}>
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              width: '36px', height: '36px', borderRadius: '999px', border: 'none',
              background: type === t ? 'rgba(0,232,179,0.2)' : 'transparent',
              color: type === t ? '#00E8B3' : 'rgba(255,255,255,0.7)',
              fontSize: '16px', fontWeight: type === t ? 600 : 400,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}>{TYPE_ICONS[t]}</button>
          ))}
        </div>

        {/* More */}
        <button style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: '#1C1C1E', border: 'none', color: 'rgba(255,255,255,0.8)',
          fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>•••</button>
      </div>

      {/* Amount */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
          New {type.toLowerCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '48px', fontWeight: 700, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
            {formatAmount(digits)}
          </span>
          <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }}>sums</span>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ padding: '0 16px', paddingBottom: 'calc(var(--safe-bottom) + 36px)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Chip row */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {['📅 Today', '⋯ Other', '💳 Visa'].map(c => (
            <button key={c} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '12px 14px', borderRadius: '999px', flexShrink: 0,
              background: 'rgba(118,118,128,0.24)', border: 'none',
              color: '#fff', fontSize: '17px', fontWeight: 500, cursor: 'pointer',
            }}>
              {c} <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>⌄</span>
            </button>
          ))}
        </div>

        {/* Note field */}
        <div style={{ position: 'relative', height: '50px', borderRadius: '16px', background: 'rgba(118,118,128,0.24)', display: 'flex', alignItems: 'center' }}>
          {!note && <span style={{ position: 'absolute', left: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '17px', pointerEvents: 'none' }}>Note</span>}
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ width: '100%', padding: '0 16px', fontSize: '17px', background: 'none', border: 'none', color: '#fff', outline: 'none' }}
          />
        </div>

        {/* Numpad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '2px' }}>
              {row.map(([label, isSymbol, pill], ci) => (
                <NumKey key={ci} label={label} pill={pill} isSymbol={isSymbol} onTap={() => tap(label)} />
              ))}
            </div>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={onClose}
          style={{
            height: '60px', borderRadius: '999px', border: 'none',
            background: '#00E8B3', color: '#fff',
            fontSize: '17px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Add {type.toLowerCase()}
        </button>
      </div>
    </div>
  )
}

function NumKey({ label, pill, isSymbol, onTap }) {
  const [p, setP] = useState(false)
  return (
    <button
      onPointerDown={() => setP(true)}
      onPointerUp={() => { setP(false); onTap() }}
      onPointerLeave={() => setP(false)}
      style={{
        flex: 1, height: '60px', border: 'none', cursor: 'pointer',
        borderRadius: pill ? '999px' : '16px',
        background: 'rgba(118,118,128,0.24)',
        color: '#fff', fontSize: '20px', fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: p ? 'scale(0.95)' : 'scale(1)', transition: 'transform 0.1s',
      }}
    >
      {label === '⌫' ? '⌫' : label}
    </button>
  )
}
