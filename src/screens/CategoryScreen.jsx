import React, { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import { CATEGORY_ICON_MAP } from '../categoryMeta'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const CHECK_CHAR = '\u{100185}'

export default function CategoryScreen({ onBack, onContinue }) {
  const [categories, setCategories] = useState([])
  const [selected,   setSelected]   = useState(new Set())
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => setCategories(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

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

        {loading ? (
          <div style={{ color: 'rgba(235,235,245,0.4)', fontSize: 15, textAlign: 'center', paddingTop: 32 }}>
            Loading…
          </div>
        ) : error ? (
          <div style={{ color: '#FF453A', fontSize: 14, textAlign: 'center', paddingTop: 32, lineHeight: '20px' }}>
            Could not load categories.{'\n'}Check that the backend is running and VITE_API_URL is set.{'\n\n'}
            <span style={{ color: 'rgba(235,235,245,0.4)', fontSize: 12 }}>{API_BASE}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 24 }}>
            {categories.map(cat => (
              <CategoryChip
                key={cat.id}
                cat={cat}
                selected={selected.has(cat.id)}
                onToggle={() => toggle(cat.id)}
              />
            ))}
          </div>
        )}

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
function CategoryIcon({ color, catKey }) {
  const def = CATEGORY_ICON_MAP[catKey]
  if (!def) {
    return <div style={{ width: 40, height: 40, borderRadius: 12, background: color, flexShrink: 0 }} />
  }
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: color,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: def.iw, height: def.ih,
        mixBlendMode: 'plus-lighter',
      }}>
        <img src={def.url} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
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
      <CategoryIcon color={cat.color ?? '#8E8E93'} catKey={cat.key} />

      <span style={{
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        fontSize: 17, fontWeight: 510,
        letterSpacing: '-0.43px',
        color: '#fff', flex: 1,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
      }}>
        {cat.label ?? cat.key}
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
