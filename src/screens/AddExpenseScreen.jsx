import React, { useState } from 'react'

// ── Figma SVG assets ─────────────────────────────────────────────────────────
const IC_TYPE_ADD = 'https://www.figma.com/api/mcp/asset/0bbb37ae-99ec-4eef-a610-3182faf1e6cb'
const IC_TYPE_TRN = 'https://www.figma.com/api/mcp/asset/9b554be5-c241-4d12-9ac4-2fc694cb4dbe'
const IC_TYPE_INC = 'https://www.figma.com/api/mcp/asset/f2d452bf-97f0-4f68-a67c-410b55c5c69d'
const IC_MORE     = 'https://www.figma.com/api/mcp/asset/1ea56f75-fcaa-45a0-b53f-b3326d64c1d3'
const IC_CALENDAR = 'https://www.figma.com/api/mcp/asset/a6a66353-2303-4dd5-855b-dd6b8974e7a2'
const IC_CARD     = 'https://www.figma.com/api/mcp/asset/b12e6732-587a-4438-8cc3-0a201d6ee9f5'
const IC_CHEVRON  = 'https://www.figma.com/api/mcp/asset/347f8f0d-a9e8-491a-843c-c09447c3d6cd'
const IC_DELETE   = 'https://www.figma.com/api/mcp/asset/0070a0a5-688c-4d5a-b338-f40ad1874f61'
const IC_BACK     = 'https://www.figma.com/api/mcp/asset/ac249b7c-6580-45de-8141-f0c0c5cf34a8'

// ── Category icon assets (Figma node 8141:25585, refreshed) ──────────────────
const IC_CAT_HOUSE         = 'https://www.figma.com/api/mcp/asset/48fad630-71f4-4e73-82f5-3c1e7dc38e83'
const IC_CAT_MEAL          = 'https://www.figma.com/api/mcp/asset/db46d06c-7272-4041-b50d-804d61393dc9'
const IC_CAT_GLOBE         = 'https://www.figma.com/api/mcp/asset/ad164a0b-0034-4147-8c7d-5c50510ff9cb'
const IC_CAT_CLOTHING      = 'https://www.figma.com/api/mcp/asset/9b866578-f9c6-4b5f-8ad3-e4a64d925389'
const IC_CAT_TRANSPORT     = 'https://www.figma.com/api/mcp/asset/55b0b36b-0eeb-4a2c-9fd6-4798a82899ae'
const IC_CAT_ENTERTAINMENT = 'https://www.figma.com/api/mcp/asset/04b94254-3020-4dc0-a350-5cfc8c32e653'
const IC_CAT_GROCERY       = 'https://www.figma.com/api/mcp/asset/948e02da-4677-40c5-b0c6-806e41a40329'
const IC_CAT_OTHER         = 'https://www.figma.com/api/mcp/asset/76ddcc04-fb71-474d-980b-b6068fdabfaa'
const IC_CAT_PLUS          = 'https://www.figma.com/api/mcp/asset/22af1966-0aa2-4887-905b-ea99677865a7'

// ── Data ────────────────────────────────────────────────────────────────────
const NAV_TYPES = [
  { key: 'Expense',  icon: IC_TYPE_ADD },
  { key: 'Transfer', icon: IC_TYPE_TRN },
  { key: 'Income',   icon: IC_TYPE_INC },
]
const VALID_TYPES = new Set(NAV_TYPES.map(t => t.key))

// iw/ih = exact icon pixel dimensions at 40px container size (from Figma)
const CATEGORIES = [
  { key: 'other',    label: 'Other',     color: '#8E8E93', icon: IC_CAT_OTHER,         iw: 14.578, ih: 2.961  },
  { key: 'grocery',  label: 'Grocery',   color: '#FF383C', icon: IC_CAT_GROCERY,       iw: 22.539, ih: 19.199 },
  { key: 'transport',label: 'Transport', color: '#34C759', icon: IC_CAT_TRANSPORT,      iw: 27.836, ih: 12.57  },
  { key: 'clothing', label: 'Clothing',  color: '#FF8D28', icon: IC_CAT_CLOTHING,       iw: 25.72,  ih: 21.27  },
  { key: 'meal',     label: 'Meal',      color: '#6155F5', icon: IC_CAT_MEAL,           iw: 13.425, ih: 22.646 },
  { key: 'web',      label: 'Web',       color: '#FF2D55', icon: IC_CAT_GLOBE,          iw: 19.883, ih: 19.727 },
  { key: 'home',     label: 'Home',      color: '#0088FF', icon: IC_CAT_HOUSE,          iw: 23.32,  ih: 20.537 },
  { key: 'gaming',   label: 'Gaming',    color: '#FF2D55', icon: IC_CAT_ENTERTAINMENT,  iw: 28.193, ih: 17.695 },
]

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
export default function AddExpenseScreen({ type: initType, onClose }) {
  const [type,        setType]        = useState(VALID_TYPES.has(initType) ? initType : 'Expense')
  const [digits,      setDigits]      = useState('')
  const [note,        setNote]        = useState('')
  const [category,    setCategory]    = useState(CATEGORIES[0])
  const [showPicker,  setShowPicker]  = useState(false)

  const displayAmt = formatAmount(digits)

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

  return (
    <div data-file="src/screens/AddExpenseScreen.jsx" style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

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
        <button
          onClick={onClose}
          style={{
            width: 60, height: 45, borderRadius: 999,
            background: '#1C1C1E', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ width: 32, height: 32, mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)' }}>
            <img src={IC_BACK} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </button>

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
        paddingTop: 120, padding: '120px 16px 0',
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
          {/* Date chip */}
          <button style={chipStyle}>
            <img src={IC_CALENDAR} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
            Today
            <img src={IC_CHEVRON} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
          </button>

          {/* Category chip — dynamic */}
          <button onClick={() => setShowPicker(true)} style={chipStyle}>
            <CategoryIconMini color={category.color} icon={category.icon} iw={category.iw} ih={category.ih} />
            {category.label}
            <img src={IC_CHEVRON} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
          </button>

          {/* Account chip */}
          <button style={chipStyle}>
            <img src={IC_CARD} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
            Visa
            <img src={IC_CHEVRON} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
          </button>
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
          onClick={onClose}
          style={{
            height: 60, borderRadius: 999, border: 'none',
            background: '#fff', color: '#1A1B1B',
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px', cursor: 'pointer',
          }}
        >
          Add {type.toLowerCase()}
        </button>
      </div>

      {/* ── Category Picker overlay ── */}
      {showPicker && (
        <CategoryPicker
          selected={category}
          onSelect={cat => { setCategory(cat); setShowPicker(false) }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// ── Shared chip style ─────────────────────────────────────────────────────────
const chipStyle = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '13px 16px', borderRadius: 999, flexShrink: 0,
  background: 'rgba(118,118,128,0.24)', border: 'none', cursor: 'pointer',
  fontFamily: "'SF Pro', -apple-system, sans-serif",
  color: '#fff', fontSize: 17, fontWeight: 510,
}

// ── Category icon — matches Figma structure exactly ───────────────────────────
// Figma: colored bg → fill-div (mix-blend-screen, overflow hidden) → icon (mix-blend-plus-lighter, exact px size)
function CategoryIcon({ color, icon, iw, ih, size = 40, radius = 12 }) {
  const scale = size / 40
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: color,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* gradient fill — mix-blend-screen over the colored bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0) 100%)',
        mixBlendMode: 'screen', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* icon — mix-blend-plus-lighter over the gradient */}
        <img
          src={icon}
          alt=""
          style={{
            display: 'block',
            width: iw * scale,
            height: ih * scale,
            mixBlendMode: 'plus-lighter',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  )
}

function CategoryIconMini({ color, icon, iw, ih }) {
  return <CategoryIcon color={color} icon={icon} iw={iw} ih={ih} size={28} radius={8} />
}

function CategoryIconFull({ color, icon, iw, ih }) {
  return <CategoryIcon color={color} icon={icon} iw={iw} ih={ih} size={40} radius={12} />
}

// ── Category Picker ───────────────────────────────────────────────────────────
function CategoryPicker({ selected, onSelect, onClose }) {
  const [pending, setPending] = useState(selected)

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column', zIndex: 20,
    }}>
      {/* Toolbar */}
      <div style={{
        padding: 'calc(var(--safe-top) + 10px) 16px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 'calc(var(--safe-top) + 62px)', flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            width: 60, height: 45, borderRadius: 999,
            background: '#1C1C1E', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ width: 32, height: 32, mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)' }}>
            <img src={IC_BACK} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </button>
        <span style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontSize: 17, fontWeight: 590, color: '#fff', letterSpacing: '-0.43px',
        }}>
          Kategoriya
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Category list card */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 16px 0',
        scrollbarWidth: 'none',
      }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', background: '#1C1C1E' }}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.key}
              onClick={() => setPending(cat)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 12, padding: '12px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <CategoryIconFull color={cat.color} icon={cat.icon} iw={cat.iw} ih={cat.ih} />
              <span style={{
                flex: 1, textAlign: 'left',
                fontFamily: "'SF Pro', -apple-system, sans-serif",
                fontSize: 16, fontWeight: 510, color: '#fff', letterSpacing: '-0.5px',
              }}>
                {cat.label}
              </span>
              {pending.key === cat.key && (
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

          {/* Add category row */}
          <button style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 12, padding: '12px 16px',
            background: 'none', border: 'none', cursor: 'pointer',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(0,136,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={IC_CAT_PLUS} alt="+" style={{ width: 24, height: 24, mixBlendMode: 'plus-lighter' }} />
            </div>
            <span style={{
              fontFamily: "'SF Pro', -apple-system, sans-serif",
              fontSize: 17, fontWeight: 510, color: '#0088FF', letterSpacing: '-0.43px',
            }}>
              Add category
            </span>
          </button>
        </div>
      </div>

      {/* Continue button */}
      <div style={{
        padding: '14px 16px',
        paddingBottom: 'calc(14px + var(--safe-bottom))',
        flexShrink: 0,
      }}>
        <button
          onClick={() => onSelect(pending)}
          style={{
            width: '100%', height: 60, borderRadius: 999, border: 'none',
            background: '#fff', color: '#1A1B1B',
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px', cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
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
