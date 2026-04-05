import { useState, useEffect, useMemo } from 'react'
import IC_CAT_OTHER         from '../assets/icons/categories/other.svg'
import IC_CAT_GROCERY       from '../assets/icons/categories/grocery.svg'
import IC_CAT_TRANSPORT     from '../assets/icons/categories/transport.svg'
import IC_CAT_CLOTHING      from '../assets/icons/categories/clothing.svg'
import IC_CAT_MEAL          from '../assets/icons/categories/meal.svg'
import IC_CAT_WEB           from '../assets/icons/categories/web.svg'
import IC_CAT_HOUSE         from '../assets/icons/categories/house.svg'
import IC_CAT_GAMING        from '../assets/icons/categories/gaming.svg'

const CAT_ICON_MAP = {
  food:          IC_CAT_MEAL,
  grocery:       IC_CAT_GROCERY,
  transport:     IC_CAT_TRANSPORT,
  clothing:      IC_CAT_CLOTHING,
  home:          IC_CAT_HOUSE,
  entertainment: IC_CAT_GAMING,
  shopping:      IC_CAT_WEB,
  utilities:     IC_CAT_OTHER,
  health:        IC_CAT_OTHER,
  education:     IC_CAT_OTHER,
  other:         IC_CAT_OTHER,
}

import IC_TYPE_ADD from '../assets/icons/ui/type-add.svg'
import IC_TYPE_TRN from '../assets/icons/ui/type-transfer.svg'
import IC_TYPE_INC from '../assets/icons/ui/type-income.svg'
import IC_MORE     from '../assets/icons/ui/more.svg'
import IC_CALENDAR from '../assets/icons/ui/calendar.svg'
import IC_CARD     from '../assets/icons/ui/card.svg'
import IC_CHEVRON  from '../assets/icons/ui/chevron.svg'
import IC_DELETE   from '../assets/icons/ui/delete.svg'
import IC_BACK     from '../assets/icons/ui/back.svg'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

// fallback categories shown before DB loads
const FALLBACK_CATEGORIES = [
  { key: 'other',         label: 'Other',         icon: IC_CAT_OTHER    },
  { key: 'grocery',       label: 'Grocery',        icon: IC_CAT_GROCERY  },
  { key: 'transport',     label: 'Transport',      icon: IC_CAT_TRANSPORT},
  { key: 'clothing',      label: 'Clothing',       icon: IC_CAT_CLOTHING },
  { key: 'food',          label: 'Meal',           icon: IC_CAT_MEAL     },
  { key: 'shopping',      label: 'Shopping',       icon: IC_CAT_WEB      },
  { key: 'home',          label: 'Home',           icon: IC_CAT_HOUSE    },
  { key: 'entertainment', label: 'Entertainment',  icon: IC_CAT_GAMING   },
]

const NAV_TYPES = [
  { key: 'Expense',  icon: IC_TYPE_ADD },
  { key: 'Transfer', icon: IC_TYPE_TRN },
  { key: 'Income',   icon: IC_TYPE_INC },
]
const VALID_TYPES = new Set(NAV_TYPES.map(t => t.key))

const ROWS = [
  [['1',false],['2',false],['3',false],['+',true ]],
  [['4',false],['5',false],['6',false],['−',true ]],
  [['7',false],['8',false],['9',false],['×',true ]],
  [[',',false],['0',false],['⌫',true ],['÷',true ]],
]

function formatAmount(digits) {
  const raw = digits.replace(/[^\d]/g, '')
  if (!raw) return '0'
  return parseInt(raw, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AddExpenseScreen({ type: initType, onClose, onAdd, userId, accounts = [], categories: dbCats = [] }) {
  // Map DB categories to local icons
  const CATEGORIES = useMemo(() =>
    (dbCats.length > 0 ? dbCats : FALLBACK_CATEGORIES).map(c => ({
      key:   c.key,
      label: c.label,
      icon:  CAT_ICON_MAP[c.key] ?? IC_CAT_OTHER,
    })),
  [dbCats])

  const [type,       setType]       = useState(VALID_TYPES.has(initType) ? initType : 'Expense')
  const [digits,     setDigits]     = useState('')
  const [note,       setNote]       = useState('')
  const [category,   setCategory]   = useState(null)
  const [accIdx,     setAccIdx]     = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [saving,     setSaving]     = useState(false)

  // Default to "other" category when DB data arrives
  useEffect(() => {
    if (CATEGORIES.length > 0) {
      setCategory(CATEGORIES.find(c => c.key === 'other') ?? CATEGORIES[0])
    }
  }, [CATEGORIES])

  const selectedCategory = category ?? CATEGORIES[0]

  const selectedAcc = accounts[accIdx] ?? null
  const displayAmt  = formatAmount(digits)

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

  async function handleAdd() {
    const amount = parseInt(digits.replace(/\s/g, '').replace(/,/g, ''), 10)
    if (!amount || amount <= 0) { onClose(); return }
    setSaving(true)
    try {
      await fetch(`${API_BASE}/users/${userId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type.toLowerCase(),
          amount,
          note: note || null,
          category_key: selectedCategory.key !== 'other' ? selectedCategory.key : null,
          account_id: selectedAcc?.id ?? null,
          source: 'manual',
        }),
      })
      onAdd?.()
    } catch (e) {
      console.error('[AddExpense] save error:', e)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div data-file="src/screens/AddExpenseScreen.jsx" style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

      {/* Top progressive blur */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        zIndex: 5, pointerEvents: 'none',
        background: 'rgba(0,0,0,0.7)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }} />

      {/* Toolbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: 'calc(var(--safe-top) + 10px) 16px 0',
        height: 'calc(var(--safe-top) + 62px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={onClose}
          style={{
            width: 60, height: 45, borderRadius: 999,
            background: '#1C1C1E', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <div style={{ width: 32, height: 32, mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)' }}>
            <img src={IC_BACK} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </button>

        <div style={{ background: '#1C1C1E', borderRadius: 999, padding: 4, display: 'flex', gap: 0, flexShrink: 0 }}>
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

        <div style={{ width: 60, height: 45, borderRadius: 999, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <img src={IC_MORE} alt="more" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Amount display */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 16px 0',
      }}>
        <div style={{
          fontFamily: "'SF Pro', -apple-system, sans-serif",
          fontWeight: 400, fontSize: 16, color: 'rgba(235,235,245,0.6)',
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
            fontWeight: 400, fontSize: 20, color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.45px',
          }}>
            sums
          </span>
        </div>
      </div>

      {/* Bottom section */}
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

          {/* Category chip */}
          <button onClick={() => setShowPicker(true)} style={chipStyle}>
            <img src={selectedCategory.icon} alt="" style={{ width: 28, height: 28, display: 'block', flexShrink: 0 }} />
            {selectedCategory.label}
            <img src={IC_CHEVRON} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
          </button>

          {/* Account chip — tap to cycle through accounts */}
          <button
            onClick={() => accounts.length > 1 && setAccIdx(i => (i + 1) % accounts.length)}
            style={chipStyle}
          >
            <img src={IC_CARD} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
            {selectedAcc?.name ?? 'Account'}
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
          onClick={handleAdd}
          disabled={saving}
          style={{
            height: 60, borderRadius: 999, border: 'none',
            background: saving ? 'rgba(255,255,255,0.5)' : '#fff',
            color: '#1A1B1B',
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px', cursor: 'pointer',
          }}
        >
          {saving ? 'Saving...' : `Add ${type.toLowerCase()}`}
        </button>
      </div>

      {/* Category Picker overlay */}
      {showPicker && (
        <CategoryPicker
          categories={CATEGORIES}
          selected={selectedCategory}
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

// ── Category Picker ───────────────────────────────────────────────────────────
function CategoryPicker({ categories, selected, onSelect, onClose }) {
  const [pending, setPending] = useState(selected)

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column', zIndex: 20,
    }}>
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
        <span style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 17, fontWeight: 590, color: '#fff', letterSpacing: '-0.43px' }}>
          Kategoriya
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0', scrollbarWidth: 'none' }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', background: '#1C1C1E' }}>
          {categories.map((cat, i) => (
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
              <img src={cat.icon} alt="" style={{ width: 40, height: 40, display: 'block', flexShrink: 0 }} />
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
        </div>
      </div>

      <div style={{ padding: '14px 16px', paddingBottom: 'calc(14px + var(--safe-bottom))', flexShrink: 0 }}>
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
        opacity: pressed ? 0.55 : 1, transition: 'opacity 0.1s',
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
