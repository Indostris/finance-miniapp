import { useState, useEffect, useRef } from 'react'
import AddExpenseScreen from './AddExpenseScreen'
import AssistantScreen  from './AssistantScreen'

// ── Icons ─────────────────────────────────────────────────────────────────────
import IC_CAT_FOOD         from '../assets/icons/categories/meal.svg'
import IC_CAT_TRANSPORT    from '../assets/icons/categories/transport.svg'
import IC_CAT_GROCERY      from '../assets/icons/categories/grocery.svg'
import IC_CAT_HOME         from '../assets/icons/categories/house.svg'
import IC_CAT_CLOTHING     from '../assets/icons/categories/clothing.svg'
import IC_CAT_ENTERTAINMENT from '../assets/icons/categories/gaming.svg'
import IC_CAT_SHOPPING     from '../assets/icons/categories/web.svg'
import IC_CAT_OTHER        from '../assets/icons/categories/other.svg'
import IC_TAB_HOME      from '../assets/icons/ic_tab_home.svg'
import IC_TAB_ASSISTANT from '../assets/icons/ic_tab_assistant.svg'
import IC_TAB_BUDGET    from '../assets/icons/ic_tab_budget.svg'
import IC_TAB_ANALYTICS from '../assets/icons/ic_tab_analytics.svg'
import IC_FAB_PLUS      from '../assets/icons/ic_fab_plus.svg'
import IC_PROFILE       from '../assets/icons/ic_profile.svg'
import IC_SETTINGS      from '../assets/icons/ic_settings.svg'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

// ── Inject rolling digit keyframes once ───────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('droll-kf')) {
  const s = document.createElement('style')
  s.id = 'droll-kf'
  s.textContent =
    '@keyframes dRollUp{from{transform:translateY(0)}to{transform:translateY(-50%)}}' +
    '@keyframes dRollDown{from{transform:translateY(-50%)}to{transform:translateY(0)}}'
  document.head.appendChild(s)
}

const CAT_ICONS = {
  food:          IC_CAT_FOOD,
  transport:     IC_CAT_TRANSPORT,
  grocery:       IC_CAT_GROCERY,
  home:          IC_CAT_HOME,
  clothing:      IC_CAT_CLOTHING,
  entertainment: IC_CAT_ENTERTAINMENT,
  shopping:      IC_CAT_SHOPPING,
  utilities:     IC_CAT_OTHER,
  health:        IC_CAT_OTHER,
  education:     IC_CAT_OTHER,
  other:         IC_CAT_OTHER,
}

const TABS = [
  { icon: IC_TAB_HOME,      label: 'Home'      },
  { icon: IC_TAB_ASSISTANT, label: 'Assistant' },
  { icon: IC_TAB_BUDGET,    label: 'Budget'    },
  { icon: IC_TAB_ANALYTICS, label: 'Analytics' },
]

function fmtAmt(n) {
  return Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function groupByDate(txs) {
  const map = {}
  for (const tx of txs) {
    const key = (tx.date ?? tx.created_at?.split('T')[0]) || 'Unknown'
    if (!map[key]) map[key] = []
    map[key].push(tx)
  }
  return Object.entries(map)
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([date, items]) => ({ date, items }))
}

function fmtDateLabel(s) {
  if (!s || s === 'Unknown') return 'Unknown'
  try {
    return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } catch { return s }
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomeScreen({ userId }) {
  const [selectedTab,  setSelectedTab]  = useState(0)
  const [addType,      setAddType]      = useState(null)
  const [showAI,       setShowAI]       = useState(false)
  const [showMenu,     setShowMenu]     = useState(false)
  const [transactions, setTransactions] = useState([])
  const [accounts,     setAccounts]     = useState([])
  const [categories,   setCategories]   = useState([])

  function fetchData() {
    Promise.all([
      fetch(`${API_BASE}/users/${userId}/transactions`).then(r => r.json()),
      fetch(`${API_BASE}/users/${userId}/accounts`).then(r => r.json()),
      fetch(`${API_BASE}/categories`).then(r => r.json()),
    ]).then(([txs, accs, cats]) => {
      setTransactions(Array.isArray(txs) ? txs : [])
      setAccounts(Array.isArray(accs) ? accs : [])
      setCategories(Array.isArray(cats) ? cats : [])
    }).catch(console.error)
  }

  useEffect(() => { fetchData() }, [userId])

  // Build lookup maps
  const catMap = {}
  for (const c of categories) catMap[c.id] = c
  const accMap = {}
  for (const a of accounts) accMap[a.id] = a

  // Monthly totals (current month)
  const thisMonth = new Date().toISOString().slice(0, 7)
  let monthIncome = 0, monthSpent = 0
  for (const tx of transactions) {
    const m = (tx.date ?? tx.created_at?.split('T')[0] ?? '').slice(0, 7)
    if (m !== thisMonth) continue
    if (tx.type === 'income')  monthIncome += Number(tx.amount)
    if (tx.type === 'expense') monthSpent  += Number(tx.amount)
  }

  const txGroups = groupByDate(transactions)

  if (addType) return (
    <AddExpenseScreen
      type={addType}
      userId={userId}
      accounts={accounts}
      categories={categories}
      onClose={() => setAddType(null)}
      onAdd={fetchData}
    />
  )
  if (showAI) return (
    <AssistantScreen
      userId={userId}
      accounts={accounts}
      onBack={() => { setShowAI(false); setSelectedTab(0); fetchData() }}
    />
  )

  return (
    <div data-file="src/screens/HomeScreen.jsx" style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>

      {/* Blue gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg, rgba(0,136,255,0.18) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Scrollable content */}
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', zIndex: 1 }}>
        <div style={{ paddingTop: 'calc(var(--safe-top) + 120px)', paddingBottom: '120px' }}>

          {/* Balance */}
          <div style={{ textAlign: 'center', padding: '0 66px 32px' }}>
            <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, letterSpacing: '-0.5px', color: '#fff', marginBottom: 2 }}>
              Monthly income: {fmtAmt(monthIncome)} sums
            </div>
            <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, letterSpacing: '-0.5px', color: 'rgba(235,235,245,0.6)', marginBottom: 8 }}>
              You spent this month:
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <RollingNumber value={monthSpent} size={40} weight={700} lineH={41} color="#fff" spacing="-0.6px" />
              <span style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 20, color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.45px' }}>sums</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 24px' }}>
            <CTAButton title="Add manually" blue={false} onClick={() => setAddType('Expense')} />
            <CTAButton title={`Add with AI \u{1001BF}`} blue={true} onClick={() => { setSelectedTab(1); setShowAI(true) }} />
          </div>

          {/* Recent Transactions */}
          <SectionHeader title="Recent transactions" />
          {txGroups.length === 0 ? (
            <div style={{ padding: '0 16px 24px', textAlign: 'center', color: 'rgba(235,235,245,0.35)', fontSize: 15, letterSpacing: '-0.3px' }}>
              No transactions yet
            </div>
          ) : (
            <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {txGroups.slice(0, 6).map(g => (
                <TxGroup key={g.date} group={g} catMap={catMap} accMap={accMap} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: 'calc(var(--safe-top) + 62px) 16px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 52 }}>
          <span style={{
            fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
            fontSize: 48, fontWeight: 700, letterSpacing: '-0.6px', lineHeight: '49px', color: '#fff',
          }}>Home</span>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', gap: 12, alignItems: 'center',
            padding: '0 4px', height: 44,
            background: 'rgba(28,28,30,0.85)', borderRadius: 999,
          }}>
            <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', mixBlendMode: 'plus-lighter' }}>
              <img src={IC_PROFILE} alt="profile" style={{ width: 36, height: 36 }} />
            </button>
            <button style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', mixBlendMode: 'plus-lighter' }}>
              <img src={IC_SETTINGS} alt="settings" style={{ width: 36, height: 36 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Action menu */}
      {showMenu && (
        <ActionMenu
          onClose={() => setShowMenu(false)}
          onSelect={t => { setShowMenu(false); setTimeout(() => setAddType(t), 250) }}
        />
      )}

      {/* Tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'flex-end',
        padding: '16px 25px',
        paddingBottom: 'calc(var(--safe-bottom) + 8px)',
      }}>
        <div style={{
          display: 'flex', flex: 1,
          background: 'rgba(28,28,30,0.85)', borderRadius: 999,
          padding: '3px 16px 3px 4px',
        }}>
          {TABS.map((t, i) => (
            <TabBtn key={i} tab={t} active={selectedTab === i} onClick={() => {
              setSelectedTab(i)
              if (i === 1) setShowAI(true)
            }} />
          ))}
        </div>
        <button
          onClick={() => setShowMenu(true)}
          style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0, marginLeft: 8,
            background: '#0091FF', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.25)',
          }}
        >
          <img src={IC_FAB_PLUS} alt="+" style={{ width: 25, height: 25, mixBlendMode: 'plus-lighter' }} />
        </button>
      </div>
    </div>
  )
}

// ── Rolling digit animation ───────────────────────────────────────────────────
function RollingNumber({ value, size, weight, lineH, color, spacing }) {
  const currRef = useRef(value)
  const [prev, setPrev] = useState(value)
  const [curr, setCurr] = useState(value)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (value === currRef.current) return
    setPrev(currRef.current)
    setCurr(value)
    currRef.current = value
    setTick(t => t + 1)
  }, [value])

  const direction = curr >= prev ? 'up' : 'down'
  const cs = fmtAmt(curr)
  const ps = fmtAmt(prev)
  const maxLen = Math.max(cs.length, ps.length)
  const cPad = cs.padStart(maxLen, '\u200b')
  const pPad = ps.padStart(maxLen, '\u200b')

  const base = {
    fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
    fontSize: size, fontWeight: weight, color, letterSpacing: spacing,
  }

  let ci = 0
  const chars = Array.from({ length: maxLen }, (_, i) => {
    const c = cPad[i], p = pPad[i]
    const changed = c !== p && /\d/.test(c)
    return { c, p, changed, stagger: changed ? ci++ : 0 }
  })

  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end' }}>
      {chars.map((ch, i) => {
        if (ch.c === '\u200b') return null

        if (!ch.changed) {
          return (
            <span key={i} style={{ ...base, display: 'inline-block', lineHeight: `${lineH}px` }}>
              {ch.c}
            </span>
          )
        }

        const anim = direction === 'up' ? 'dRollUp' : 'dRollDown'
        const delay = ch.stagger * 28

        return (
          <span key={`${tick}-${i}`} style={{ display: 'inline-block', height: lineH, overflow: 'hidden', verticalAlign: 'top' }}>
            <span style={{ display: 'block', animation: `${anim} 420ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}>
              <span style={{ ...base, display: 'block', lineHeight: `${lineH}px` }}>
                {direction === 'up' ? ch.p : ch.c}
              </span>
              <span style={{ ...base, display: 'block', lineHeight: `${lineH}px` }}>
                {direction === 'up' ? ch.c : ch.p}
              </span>
            </span>
          </span>
        )
      })}
    </span>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function CategoryIcon({ catKey }) {
  return <img src={CAT_ICONS[catKey] ?? IC_CAT_OTHER} alt="" style={{ width: 40, height: 40, display: 'block', flexShrink: 0 }} />
}

function CTAButton({ title, blue, onClick }) {
  const [p, setP] = useState(false)
  return (
    <button
      onPointerDown={() => setP(true)} onPointerUp={() => { setP(false); onClick?.() }} onPointerLeave={() => setP(false)}
      style={{
        flex: 1, height: 50, borderRadius: 999, border: 'none',
        background: blue ? 'rgba(0,136,255,0.16)' : 'rgba(118,118,128,0.24)',
        color: blue ? 'rgba(0,136,255,0.96)' : '#fff',
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px',
        opacity: p ? 0.8 : 1, transition: 'opacity 0.12s', cursor: 'pointer',
      }}
    >{title}</button>
  )
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 16px' }}>
      <span style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 22, fontWeight: 590, letterSpacing: '-0.5px', lineHeight: '28px', color: '#fff' }}>{title}</span>
      <div style={{ flex: 1 }} />
      <span style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 17, fontWeight: 400, color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.43px' }}>
        {`View all \u{10018A}`}
      </span>
    </div>
  )
}

function TxGroup({ group, catMap, accMap }) {
  const total = group.items.reduce((sum, tx) => {
    return tx.type === 'expense' ? sum - Number(tx.amount) : sum + Number(tx.amount)
  }, 0)
  const totalStr = (total < 0 ? `-${fmtAmt(-total)}` : `+${fmtAmt(total)}`) + ' sums'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, letterSpacing: '-0.5px', color: 'rgba(235,235,245,0.6)' }}>
        <span>{fmtDateLabel(group.date)}</span>
        <span>{totalStr}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {group.items.map(tx => {
          const cat = catMap[tx.category_id]
          const acc = accMap[tx.account_id]
          return <TxRow key={tx.id} tx={tx} catKey={cat?.key} accName={acc?.name ?? ''} />
        })}
      </div>
    </div>
  )
}

function TxRow({ tx, catKey, accName }) {
  const label = tx.note || (catKey ? catKey.charAt(0).toUpperCase() + catKey.slice(1) : 'Transaction')
  const prefix = tx.type === 'expense' ? '- ' : '+ '
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px', height: 60, background: '#1C1C1E', borderRadius: 20 }}>
      <CategoryIcon catKey={catKey ?? 'other'} />
      <span style={{ flex: 1, fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 16, fontWeight: 510, letterSpacing: '-0.5px', color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {label}
      </span>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 15, fontWeight: 510, letterSpacing: '-0.75px', color: '#fff' }}>
          {prefix}{fmtAmt(tx.amount)} <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(235,235,245,0.6)' }}>sums</span>
        </div>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, color: 'rgba(235,235,245,0.6)' }}>{accName}</div>
      </div>
    </div>
  )
}

function TabBtn({ tab, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 1, padding: '6px 8px 7px', border: 'none', cursor: 'pointer',
        background: active ? 'rgba(20,20,20,0.8)' : 'transparent',
        borderRadius: 100,
      }}
    >
      <div style={{ width: 28, height: 28, flexShrink: 0, overflow: 'hidden' }}>
        <img
          src={tab.icon} alt={tab.label}
          style={{
            display: 'block', width: '100%', height: '100%', objectFit: 'contain',
            mixBlendMode: active ? 'normal' : 'plus-lighter',
            opacity: active ? 1 : 0.75,
          }}
        />
      </div>
      <span style={{
        fontFamily: "'SF Pro', -apple-system, sans-serif",
        fontSize: 10, fontWeight: active ? 700 : 510,
        lineHeight: '12px',
        color: active ? '#fff' : 'rgba(191,191,191,0.75)',
      }}>{tab.label}</span>
    </button>
  )
}

const ACTION_ITEMS = ['Debt', 'Expense', 'Income', 'Transfer']
const ACTION_ICONS = { Debt: '→', Expense: '+', Income: '↓', Transfer: '⇄' }

function ActionMenu({ onClose, onSelect }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'rgba(0,0,0,0.15)',
        backdropFilter: 'blur(12px) brightness(0.6)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', justifyContent: 'flex-end',
        padding: '0 20px',
        paddingBottom: 'calc(var(--safe-bottom) + 90px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }} onClick={e => e.stopPropagation()}>
        {ACTION_ITEMS.map(item => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            style={{
              width: 170, height: 50, borderRadius: 999,
              background: 'rgba(255,255,255,0.15)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.88)',
              fontFamily: "'SF Pro', -apple-system, sans-serif",
              fontSize: 17, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {item} <span style={{ fontSize: 14 }}>{ACTION_ICONS[item]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
