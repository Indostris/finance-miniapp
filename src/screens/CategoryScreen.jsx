import React, { useState } from 'react'
import BackButton from '../components/BackButton'

// ── Category icons from Figma node 8006:20770 (40×40 base component) ─────────
// Each icon has exact pixel dimensions for perfect centering, no distortion
const CATEGORIES = [
  {
    id: 0, label: 'Online purchase', color: '#FF2D55',
    icon: 'https://www.figma.com/api/mcp/asset/ca4e81ad-ed99-4e0d-9368-dee2ab1fd193',
    iw: 19.883, ih: 19.727,
  },
  {
    id: 1, label: 'Eats', color: '#6155F5',
    icon: 'https://www.figma.com/api/mcp/asset/c06fb12e-cb79-4505-9dcb-5011169918af',
    iw: 13.425, ih: 22.646,
  },
  {
    id: 2, label: 'Home', color: '#0088FF',
    icon: 'https://www.figma.com/api/mcp/asset/6f1af81e-12e3-4870-9240-a19156ba0066',
    iw: 23.32, ih: 20.537,
  },
  {
    id: 3, label: 'Clothing', color: '#FF8D28',
    icon: 'https://www.figma.com/api/mcp/asset/eb5a14f5-e8d1-4c7d-bbca-08ccac5c7493',
    iw: 25.72, ih: 21.27,
  },
  {
    id: 4, label: 'Grocery', color: '#FF383C',
    icon: 'https://www.figma.com/api/mcp/asset/6741e452-f86a-47fb-a20f-c0630a70f4e1',
    iw: 22.539, ih: 19.199,
  },
  {
    id: 5, label: 'Transport', color: '#34C759',
    icon: 'https://www.figma.com/api/mcp/asset/7f3d8250-ffc6-4cb6-bcff-8a576afe5e8f',
    iw: 27.836, ih: 12.57,
  },
  {
    id: 6, label: 'Entertainment', color: '#FF2D55',
    icon: 'https://www.figma.com/api/mcp/asset/2a084be1-9c5d-43a8-865d-fe8d33de7455',
    iw: 28.193, ih: 17.695,
  },
  {
    id: 7, label: 'Custom', color: '#8E8E93',
    icon: 'https://www.figma.com/api/mcp/asset/0fdba60f-13c6-44cd-8342-f33d0cd17340',
    iw: 14.578, ih: 2.961,
  },
]

const CHECK_CHAR = '\u{100185}'

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
    <div data-file="src/screens/CategoryScreen.jsx" style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

      <div style={{ position: 'absolute', top: 'calc(var(--safe-top) + 65px)', left: 24, zIndex: 2 }}>
        <BackButton onClick={onBack} />
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        paddingTop: 'calc(var(--safe-top) + 135px)',
        paddingLeft: 24, paddingRight: 24,
      }}>
        <div style={{
          fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
          fontSize: 40, fontWeight: 700,
          letterSpacing: '-0.6px', lineHeight: '41px',
          color: '#fff', marginBottom: 16,
        }}>
          Nimaga ko'proq<br />pul sarflaysiz?
        </div>

        <div style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontWeight: 400,
          fontSize: 17, color: 'rgba(235,235,245,0.6)',
          letterSpacing: '-0.75px', lineHeight: '22px',
          marginBottom: 32,
        }}>
          Mos keladigan barcha variantlarni tanlang — kerakli toifalarni o'zimiz qo'shamiz
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <CategoryChip
              key={cat.id}
              cat={cat}
              selected={selected.has(cat.id)}
              onToggle={() => toggle(cat.id)}
            />
          ))}
        </div>

        {selected.size > 0 && (
          <div style={{
            textAlign: 'center', fontSize: 16, fontWeight: 400,
            color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.31px',
            marginBottom: 12,
          }}>
            Selected: {selected.size} {selected.size === 1 ? 'category' : 'categories'}
          </div>
        )}
      </div>

      <div style={{ padding: '8px 24px', paddingBottom: 'calc(var(--safe-bottom) + 36px)', background: '#000' }}>
        <ContinueBtn enabled={selected.size > 0} onClick={() => selected.size > 0 && onContinue()} />
      </div>
    </div>
  )
}

// ── Category icon — exact Figma structure ─────────────────────────────────────
function CategoryIcon({ color, icon, iw, ih }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: color,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Icon absolutely centered with exact pixel size — mix-blend: plus-lighter */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: iw, height: ih,
        mixBlendMode: 'plus-lighter',
      }}>
        <img
          src={icon}
          alt=""
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
      {/* Top-shine gradient overlay — mix-blend: screen, sibling of icon */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0) 100%)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />
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
        width: 'calc(50% - 1px)',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: 8,
        background: '#1C1C1E', borderRadius: 20,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        opacity: pressed ? 0.75 : 1,
        transition: 'opacity 0.12s',
      }}
    >
      <CategoryIcon color={cat.color} icon={cat.icon} iw={cat.iw} ih={cat.ih} />

      <span style={{
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        fontSize: 17, fontWeight: 510,
        letterSpacing: '-0.43px',
        color: '#fff', flex: 1,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        {cat.label}
      </span>

      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: selected ? '#0088FF' : 'transparent',
        border: selected ? 'none' : '1.5px solid rgba(199,199,204,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, border 0.15s',
      }}>
        {selected && (
          <span style={{
            fontFamily: "'SF Pro Symbols', -apple-system, sans-serif",
            fontSize: 14.5, fontWeight: 590, color: '#fff',
            fontFeatureSettings: "'ss15' 1",
            lineHeight: '22px',
          }}>
            {CHECK_CHAR}
          </span>
        )}
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
        width: '100%', height: 60, borderRadius: 999, border: 'none',
        background: enabled ? '#fff' : 'rgba(255,255,255,0.15)',
        color: enabled ? '#1A1B1B' : 'rgba(255,255,255,0.35)',
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px',
        opacity: pressed ? 0.8 : 1,
        transition: 'background 0.2s, color 0.2s, opacity 0.12s',
        cursor: enabled ? 'pointer' : 'default',
      }}
    >
      Davom etish
    </button>
  )
}
