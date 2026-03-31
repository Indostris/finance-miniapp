import React, { useState } from 'react'
import BackButton from '../components/BackButton'

const CATEGORIES = [
  { id: 0, label: 'Online purchase', color: '#FF2D55', icon: '🛒' },
  { id: 1, label: 'Eats',            color: '#6155F5', icon: '🍔' },
  { id: 2, label: 'Home',            color: '#0088FF', icon: '🏠' },
  { id: 3, label: 'Clothing',        color: '#FF8D28', icon: '👕' },
  { id: 4, label: 'Grocery',         color: '#FF383C', icon: '🛍' },
  { id: 5, label: 'Transport',       color: '#34C759', icon: '🚌' },
  { id: 6, label: 'Entertainment',   color: '#FF2D55', icon: '🎮' },
  { id: 7, label: 'Custom',          color: '#8E8E93', icon: '✨' },
]

// Pair categories into rows of 2
const ROWS = []
for (let i = 0; i < CATEGORIES.length; i += 2) {
  ROWS.push(CATEGORIES.slice(i, i + 2))
}

export default function CategoryScreen({ onBack, onContinue }) {
  const [selected, setSelected] = useState(new Set())

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Back */}
      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 65px)', left: '24px', zIndex: 2 }}>
        <BackButton onClick={onBack} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 'calc(var(--safe-top) + 135px)', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Title */}
        <div style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.6px', lineHeight: 1.15, color: '#fff', marginBottom: '16px' }}>
          Nimaga ko'proq<br />pul sarflaysiz?
        </div>
        <div style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.75px', lineHeight: 1.6, marginBottom: '32px' }}>
          Mos keladigan barcha variantlarni tanlang — kerakli toifalarni o'zimiz qo'shamiz
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
          {ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '2px' }}>
              {row.map(cat => (
                <CategoryChip key={cat.id} cat={cat} selected={selected.has(cat.id)} onToggle={() => toggle(cat.id)} />
              ))}
            </div>
          ))}
        </div>

        {selected.size > 0 && (
          <div style={{ textAlign: 'center', fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
            Selected: {selected.size} {selected.size === 1 ? 'category' : 'categories'}
          </div>
        )}
      </div>

      {/* Continue */}
      <div style={{ padding: '8px 16px', paddingBottom: 'calc(var(--safe-bottom) + 36px)', background: '#000' }}>
        <ContinueBtn enabled={selected.size > 0} onClick={() => selected.size > 0 && onContinue()} />
      </div>
    </div>
  )
}

function CategoryChip({ cat, selected, onToggle }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onToggle() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px',
        background: '#1C1C1E', borderRadius: '20px',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '12px',
        background: cat.color,
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.56) 0%, transparent 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', flexShrink: 0,
      }}>
        {cat.icon}
      </div>

      {/* Label */}
      <span style={{
        fontSize: '16px', fontWeight: 500, letterSpacing: '-0.5px',
        color: '#fff', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        {cat.label}
      </span>

      {/* Checkbox */}
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
        background: selected ? '#0088FF' : 'transparent',
        border: selected ? 'none' : '1.5px solid rgba(200,200,200,0.78)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, border 0.15s',
      }}>
        {selected && <span style={{ fontSize: '12px', color: '#fff', fontWeight: 700 }}>✓</span>}
      </div>
    </button>
  )
}

function ContinueBtn({ enabled, onClick }) {
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
