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

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

// ── Custom categories (persisted in localStorage) ─────────────────────────────
const CUSTOM_CATS_KEY = 'custom_categories'
function loadCustomCats() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_CATS_KEY) || '[]') } catch { return [] }
}
function saveCustomCats(cats) {
  localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(cats))
}

// ── fallback categories shown before DB loads
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
  const raw = String(digits).replace(/[^\d]/g, '')
  if (!raw) return '0'
  return parseInt(raw, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
}

// ── Component ────────────────────────────────────────────────────────────────
export default function AddExpenseScreen({ type: initType, onClose, onAdd, onSave, userId, accounts = [], categories: dbCats = [], initialAmount = '', initialCategoryKey = null, initialNote = '' }) {
  // Map DB categories to local icons
  const CATEGORIES = useMemo(() =>
    (dbCats.length > 0 ? dbCats : FALLBACK_CATEGORIES).map(c => ({
      key:   c.key,
      label: c.label,
      icon:  CAT_ICON_MAP[c.key] ?? IC_CAT_OTHER,
    })),
  [dbCats])

  const [customCats, setCustomCats] = useState(loadCustomCats)
  const allCategories = useMemo(() => [...CATEGORIES, ...customCats], [CATEGORIES, customCats])

  const [type,       setType]       = useState(VALID_TYPES.has(initType) ? initType : 'Expense')
  const [digits,     setDigits]     = useState(initialAmount)
  const [note,       setNote]       = useState(initialNote)
  const [category,   setCategory]   = useState(null)
  const [accIdx,     setAccIdx]     = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [saving,     setSaving]     = useState(false)

  function handleAddCategory(newCat) {
    const updated = [...customCats, newCat]
    setCustomCats(updated)
    saveCustomCats(updated)
  }

  // Set category from DB: prefer initialCategoryKey, fallback to 'other'
  useEffect(() => {
    if (allCategories.length > 0) {
      const target = initialCategoryKey ?? 'other'
      setCategory(allCategories.find(c => c.key === target) ?? allCategories.find(c => c.key === 'other') ?? allCategories[0])
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

    // Edit mode from AI screen — don't POST, just return updated data
    if (onSave) {
      onSave({ amount, cat: selectedCategory.key, note: note || null })
      onClose()
      return
    }

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
            <CategoryIcon cat={selectedCategory} size={28} />
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
          {saving ? 'Saving...' : onSave ? 'Save changes' : `Add ${type.toLowerCase()}`}
        </button>
      </div>

      {/* Category Picker overlay */}
      {showPicker && (
        <CategoryPicker
          categories={allCategories}
          selected={selectedCategory}
          onSelect={cat => { setCategory(cat); setShowPicker(false) }}
          onClose={() => setShowPicker(false)}
          onAddCategory={handleAddCategory}
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

// ── Category Icon (supports both SVG and custom emoji+color) ──────────────────
function CategoryIcon({ cat, size = 40 }) {
  if (cat?.emoji) {
    return (
      <div style={{
        width: size, height: size, borderRadius: size * 0.3,
        background: cat.color ?? '#8E8E93', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.55,
      }}>
        {cat.emoji}
      </div>
    )
  }
  return <img src={cat?.icon} alt="" style={{ width: size, height: size, display: 'block', flexShrink: 0 }} />
}

// ── Category Picker ───────────────────────────────────────────────────────────
function CategoryPicker({ categories, selected, onSelect, onClose, onAddCategory }) {
  const [pending, setPending] = useState(selected)
  const [showAdd, setShowAdd] = useState(false)

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
              <CategoryIcon cat={cat} size={40} />
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
          <button
            onClick={() => setShowAdd(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: 12, padding: '12px 16px',
              background: 'none', border: 'none', cursor: 'pointer',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              border: '1.5px solid #0088FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#0088FF', fontSize: 22, lineHeight: 1, marginTop: -1 }}>+</span>
            </div>
            <span style={{
              fontFamily: "'SF Pro', -apple-system, sans-serif",
              fontSize: 16, fontWeight: 510, color: '#0088FF', letterSpacing: '-0.5px',
            }}>
              Add category
            </span>
          </button>
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

      {showAdd && (
        <AddCategoryModal
          onClose={() => setShowAdd(false)}
          onSave={newCat => {
            onAddCategory(newCat)
            setPending(newCat)
            setShowAdd(false)
          }}
        />
      )}
    </div>
  )
}

// ── Add Category Modal ────────────────────────────────────────────────────────
const CAT_EMOJI_OPTIONS = [
  { key: 'other',         emoji: '🔘' },
  { key: 'entertainment', emoji: '🎮' },
  { key: 'grocery',       emoji: '🛒' },
  { key: 'clothing',      emoji: '👕' },
  { key: 'food',          emoji: '🍴' },
  { key: 'home',          emoji: '🏠' },
  { key: 'shopping',      emoji: '🌐' },
  { key: 'transport',     emoji: '🚗' },
]
const CAT_COLORS = ['#37a6ff','#27b537','#e67100','#dc4442','#9e59e2','#00a1bd','#ff2d55','#00e8b3']

function AddCategoryModal({ onClose, onSave }) {
  const [name,          setName]          = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(CAT_EMOJI_OPTIONS[1].emoji)
  const [color,         setColor]         = useState('#ff2d55')
  const [monthlyLimit,  setMonthlyLimit]  = useState(false)
  const [limitAmount,   setLimitAmount]   = useState('')
  const [saving,        setSaving]        = useState(false)

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed || saving) return
    setSaving(true)
    const newCat = { key: 'custom_' + Date.now(), label: trimmed, emoji: selectedEmoji, color, icon: null }
    // Save to DB first — so category_id resolves correctly when transaction is created
    try {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newCat.key, label: newCat.label, icon: newCat.emoji, color: newCat.color }),
      })
    } catch (e) {
      console.error('Failed to save category:', e)
    }
    setSaving(false)
    onSave(newCat)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', zIndex: 30 }}>

      {/* Back button */}
      <div style={{
        padding: 'calc(var(--safe-top) + 6px) 16px 0',
        height: 'calc(var(--safe-top) + 52px)', flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{ width: 60, height: 45, borderRadius: 999, background: '#1C1C1E', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: 32, height: 32, mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)' }}>
            <img src={IC_BACK} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

        {/* Large icon preview */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 16 }}>
          <div style={{
            width: 104, height: 104, borderRadius: 24,
            background: color, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, transparent 100%)',
              mixBlendMode: 'screen',
            }} />
            <span style={{ fontSize: 52, lineHeight: 1, position: 'relative' }}>{selectedEmoji}</span>
          </div>
        </div>

        {/* Name input */}
        <div style={{ padding: '8px 16px' }}>
          <div style={{ borderRadius: 24, background: '#1C1C1E', height: 52, display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 16 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Category Name"
              maxLength={30}
              autoFocus
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontFamily: "'SF Pro', -apple-system, sans-serif",
                fontSize: 17, fontWeight: 400, color: '#fff', letterSpacing: '-0.43px',
              }}
            />
          </div>
          <p style={{ fontSize: 13, color: 'rgba(235,235,245,0.5)', letterSpacing: '-0.5px', lineHeight: '18px', margin: '6px 16px 0' }}>
            Choose a clear, short name your members will recognize.
          </p>
        </div>

        {/* Category icon section */}
        <div style={{ padding: '8px 16px' }}>
          <p style={{
            fontSize: 12, fontWeight: 510, letterSpacing: '-0.2px', textTransform: 'uppercase',
            color: 'rgba(235,235,245,0.5)', padding: '8px 16px',
          }}>CATEGORY ICON</p>
          <div style={{ borderRadius: 24, background: '#1C1C1E', height: 52, display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 12 }}>
            <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {CAT_EMOJI_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedEmoji(opt.emoji)}
                  style={{
                    width: 28, height: 28, flexShrink: 0, border: 'none', cursor: 'pointer', padding: 2,
                    background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    opacity: selectedEmoji === opt.emoji ? 1 : 0.3,
                  }}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
            <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2.5L9.5 7L5 11.5" stroke="rgba(235,235,245,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(235,235,245,0.5)', letterSpacing: '-0.43px', lineHeight: '16px', margin: '6px 16px 0' }}>
            Select a different icon for this category
          </p>
        </div>

        {/* Category color section */}
        <div style={{ padding: '8px 16px' }}>
          <p style={{
            fontSize: 12, fontWeight: 510, letterSpacing: '-0.2px', textTransform: 'uppercase',
            color: 'rgba(235,235,245,0.5)', padding: '8px 16px',
          }}>CATEGORY COLOR</p>
          <div style={{ borderRadius: 24, background: '#1C1C1E', height: 52, display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 16 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {CAT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: c,
                    border: 'none', cursor: 'pointer', flexShrink: 0, position: 'relative',
                    outline: color === c ? `3px solid ${c}` : '3px solid transparent',
                    outlineOffset: 3,
                  }}
                />
              ))}
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(235,235,245,0.5)', letterSpacing: '-0.43px', lineHeight: '16px', margin: '6px 16px 0' }}>
            Select a different color for this category
          </p>
        </div>

        {/* Monthly limit toggle */}
        <div style={{ padding: '8px 16px 24px' }}>
          <div style={{ borderRadius: 26, background: '#1C1C1E', padding: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Toggle row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src="https://www.figma.com/api/mcp/asset/4800b4be-8092-4029-a446-0b21c5ee113a"
                  alt=""
                  style={{ width: 30, height: 30, display: 'block', flexShrink: 0 }}
                />
                <span style={{ fontSize: 16, fontWeight: 510, color: '#fff', letterSpacing: '-0.5px' }}>Monthly limit</span>
              </div>
              <button
                onClick={() => setMonthlyLimit(v => !v)}
                style={{
                  width: 51, height: 28, borderRadius: 100, border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: monthlyLimit ? '#34C759' : 'rgba(120,120,128,0.32)',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, borderRadius: '50%', background: '#fff',
                  width: 24, height: 24,
                  left: monthlyLimit ? 'calc(100% - 26px)' : 2,
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
            {/* Limit amount input — shown when toggle ON */}
            {monthlyLimit && (
              <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.07)', height: 48, display: 'flex', alignItems: 'center', paddingLeft: 14, paddingRight: 14, gap: 8 }}>
                  <span style={{ fontSize: 17, color: 'rgba(235,235,245,0.5)', fontWeight: 400 }}>Limit:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={limitAmount}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^\d]/g, '')
                      setLimitAmount(raw ? parseInt(raw, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : '')
                    }}
                    placeholder="0"
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      fontFamily: "'SF Pro', -apple-system, sans-serif",
                      fontSize: 17, fontWeight: 510, color: '#fff', letterSpacing: '-0.43px',
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: 15, color: 'rgba(235,235,245,0.4)', fontWeight: 400 }}>/ mo</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Continue button */}
      <div style={{ padding: '14px 10px', paddingBottom: 'calc(28px + var(--safe-bottom))', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', height: 60, borderRadius: 999, border: 'none',
            background: (name.trim() && !saving) ? '#fff' : 'rgba(255,255,255,0.15)',
            color: (name.trim() && !saving) ? '#1A1B1B' : 'rgba(255,255,255,0.35)',
            fontFamily: "'SF Pro', -apple-system, sans-serif",
            fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px',
            cursor: (name.trim() && !saving) ? 'pointer' : 'default',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
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
