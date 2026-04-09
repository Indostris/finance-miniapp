import React, { useState } from 'react'
import BackButton from '../components/BackButton'
import icWeb      from '../assets/icons/categories/web.svg'
import icMeal     from '../assets/icons/categories/meal.svg'
import icHouse    from '../assets/icons/categories/house.svg'
import icClothing from '../assets/icons/categories/clothing.svg'
import icGrocery  from '../assets/icons/categories/grocery.svg'
import icTransport from '../assets/icons/categories/transport.svg'
import icGaming   from '../assets/icons/categories/gaming.svg'
import icOther    from '../assets/icons/categories/other.svg'

const CATEGORIES = [
  { id: 0, label: 'Online purchase', icon: icWeb       },
  { id: 1, label: 'Eats',            icon: icMeal      },
  { id: 2, label: 'Home',            icon: icHouse     },
  { id: 3, label: 'Clothing',        icon: icClothing  },
  { id: 4, label: 'Grocery',         icon: icGrocery   },
  { id: 5, label: 'Transport',       icon: icTransport },
  { id: 6, label: 'Entertainment',   icon: icGaming    },
  { id: 7, label: 'Custom',          icon: icOther     },
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

function CategoryIcon({ icon }) {
  return <img src={icon} alt="" style={{ width: 40, height: 40, display: 'block', flexShrink: 0 }} />
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
        boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: 8,
        background: '#1C1C1E', borderRadius: 20,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        opacity: pressed ? 0.75 : 1,
        transition: 'opacity 0.12s',
      }}
    >
      <CategoryIcon icon={cat.icon} />

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
