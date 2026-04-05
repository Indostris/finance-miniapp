import React, { useState, useRef, useEffect } from 'react'
import AddExpenseScreen from './AddExpenseScreen'
import AssistantScreen  from './AssistantScreen'
import { CATEGORY_ICON_MAP } from '../categoryMeta'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

// ── Figma SVG assets ──────────────────────────────────────────────────────────
import {
  IC_TAB_HOME, IC_TAB_ASSISTANT, IC_TAB_BUDGET, IC_TAB_ANALYTICS,
  IC_FAB_PLUS, IC_PROFILE, IC_SETTINGS,
} from '../icons'

// ── Static data ───────────────────────────────────────────────────────────────
const CARDS = [
  { id: 0, title: 'Add spending limits',  desc: 'Set limits for key categories. This helps you keep spending under control.' },
  { id: 1, title: 'Connect your bank',    desc: 'Link your bank account and let AI categorise transactions automatically.' },
]

const TABS = [
  { icon: IC_TAB_HOME,      iw: 27.984, ih: 24.645, label: 'Home'      },
  { icon: IC_TAB_ASSISTANT, iw: 21.68,  ih: 26.73,  label: 'Assistant' },
  { icon: IC_TAB_BUDGET,    iw: 23.355, ih: 21.574, label: 'Budget'    },
  { icon: IC_TAB_ANALYTICS, iw: 23.906, ih: 23.895, label: 'Analytics' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n) {
  return Math.round(Number(n)).toLocaleString('en-US')
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function groupByDate(transactions) {
  const map = new Map()
  for (const tx of transactions) {
    const key = tx.date
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(tx)
  }
  return [...map.entries()].map(([date, items]) => ({ date, items }))
}

function groupTotal(items) {
  const income  = items.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = items.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const parts   = []
  if (expense) parts.push(`-${fmt(expense)} sums`)
  if (income)  parts.push(`+${fmt(income)} sums`)
  return parts.join(', ') || '0 sums'
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomeScreen({ userId }) {
  const [selectedTab, setSelectedTab] = useState(0)
  const [cardPage,    setCardPage]    = useState(0)
  const [showMenu,    setShowMenu]    = useState(false)
  const [addType,     setAddType]     = useState(null)
  const [showAI,      setShowAI]      = useState(false)
  const carouselRef = useRef(null)

  // API data
  const [transactions, setTransactions] = useState([])
  const [accounts,     setAccounts]     = useState([])
  const [categories,   setCategories]   = useState([])

  useEffect(() => {
    if (!userId) return
    Promise.all([
      fetch(`${API_BASE}/users/${userId}/transactions`).then(r => r.json()),
      fetch(`${API_BASE}/users/${userId}/accounts`).then(r => r.json()),
      fetch(`${API_BASE}/categories`).then(r => r.json()),
    ]).then(([txs, accs, cats]) => {
      setTransactions(txs)
      setAccounts(accs)
      setCategories(cats)
    }).catch(console.error)
  }, [userId])

  // Build lookup maps
  const catById  = Object.fromEntries(categories.map(c => [c.id, c]))
  const accById  = Object.fromEntries(accounts.map(a => [a.id, a]))

  // Derived financial figures
  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0)
  const monthPrefix  = currentMonth()
  const monthlyTxs   = transactions.filter(t => t.date?.startsWith(monthPrefix))
  const monthlyIncome = monthlyTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthlySpent  = monthlyTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  // Group transactions by date
  const txGroups = groupByDate(transactions)

  function handleScroll(e) {
    const el = e.currentTarget
    setCardPage(Math.round(el.scrollLeft / 318))
  }

  function handleAddClose() {
    // Re-fetch transactions after adding one
    fetch(`${API_BASE}/users/${userId}/transactions`)
      .then(r => r.json())
      .then(setTransactions)
      .catch(console.error)
    setAddType(null)
  }

  if (addType) return (
    <AddExpenseScreen
      type={addType}
      userId={userId}
      accounts={accounts}
      onClose={handleAddClose}
    />
  )
  if (showAI) return <AssistantScreen onBack={() => { setShowAI(false); setSelectedTab(0) }} userId={userId} accounts={accounts} />

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>

      {/* Blue gradient background */}
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
              Monthly income: {fmt(monthlyIncome)} sums
            </div>
            <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, letterSpacing: '-0.5px', color: 'rgba(235,235,245,0.6)', marginBottom: 8 }}>
              {accounts.length > 0
                ? `Balance: ${fmt(totalBalance)} sums • You spent:`
                : 'You spent:'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif", fontSize: 40, fontWeight: 700, letterSpacing: '-0.6px', lineHeight: '41px', color: '#fff' }}>
                {fmt(monthlySpent)}
              </span>
              <span style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 20, color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.45px' }}>sums</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 24px' }}>
            <CTAButton title="Add manually" blue={false} onClick={() => setAddType('Expense')} />
            <CTAButton title={`Add with AI \u{1001BF}`} blue={true} onClick={() => setAddType('Expense')} />
          </div>

          {/* Carousel */}
          <div style={{ marginBottom: 24 }}>
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              style={{
                display: 'flex', gap: 8, overflowX: 'auto', scrollSnapType: 'x mandatory',
                paddingLeft: 16, paddingRight: 16,
                scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
              }}
            >
              {CARDS.map(c => <SuggestionCard key={c.id} card={c} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
              {CARDS.map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i === cardPage ? '#fff' : 'rgba(255,255,255,0.3)',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <SectionHeader title="Recent transactions" />
          <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {txGroups.length === 0 ? (
              <div style={{ color: 'rgba(235,235,245,0.4)', fontSize: 15, textAlign: 'center', paddingTop: 8 }}>
                No transactions yet
              </div>
            ) : (
              txGroups.map(g => (
                <TxGroup
                  key={g.date}
                  group={g}
                  catById={catById}
                  accById={accById}
                />
              ))
            )}
          </div>
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
            fontSize: 40, fontWeight: 700, letterSpacing: '-0.6px', lineHeight: '41px', color: '#fff',
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

      {/* Action menu overlay */}
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
            boxShadow: '0 10px 50px rgba(0,145,255,0.30), 0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          <img src={IC_FAB_PLUS} alt="+" style={{ width: 25, height: 25, mixBlendMode: 'plus-lighter' }} />
        </button>
      </div>
    </div>
  )
}

// ── Category icon ─────────────────────────────────────────────────────────────
function CategoryIcon({ catKey, color }) {
  const def = CATEGORY_ICON_MAP[catKey]
  if (!def) return <div style={{ width: 40, height: 40, borderRadius: 12, background: color ?? '#8E8E93', flexShrink: 0 }} />
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: color ?? '#8E8E93',
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

// ── Sub-components ────────────────────────────────────────────────────────────
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
        opacity: p ? 0.8 : 1, transition: 'opacity 0.12s',
        cursor: 'pointer',
      }}
    >{title}</button>
  )
}

function SuggestionCard({ card }) {
  return (
    <div style={{
      minWidth: 310, borderRadius: 24,
      background: 'rgba(0,136,255,0.12)',
      scrollSnapAlign: 'start', flexShrink: 0,
      display: 'flex', alignItems: 'center', padding: 16, gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 16, fontWeight: 510, letterSpacing: '-0.5px', color: 'rgba(0,136,255,0.96)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.title}
        </div>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, letterSpacing: '-0.5px', color: 'rgba(0,136,255,0.64)', lineHeight: '18px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {card.desc}
        </div>
      </div>
      <button style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(0,136,255,0.16)', border: 'none',
        color: 'rgba(0,136,255,0.96)', fontSize: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
    </div>
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

function TxGroup({ group, catById, accById }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, letterSpacing: '-0.5px', color: 'rgba(235,235,245,0.6)' }}>
        <span>{formatDate(group.date)}</span>
        <span>{groupTotal(group.items)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {group.items.map(tx => (
          <TxRow key={tx.id} tx={tx} cat={catById[tx.category_id]} acc={accById[tx.account_id]} />
        ))}
      </div>
    </div>
  )
}

function TxRow({ tx, cat, acc }) {
  const prefix = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '→' : '-'
  const title  = cat?.label ?? tx.note ?? tx.type
  const sub    = acc?.name  ?? '—'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px', height: 60, background: '#1C1C1E', borderRadius: 20 }}>
      <CategoryIcon catKey={cat?.key} color={cat?.color} />
      <span style={{ flex: 1, fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 16, fontWeight: 510, letterSpacing: '-0.5px', color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {title}
      </span>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 15, fontWeight: 510, letterSpacing: '-0.75px', color: '#fff' }}>
          {prefix}{fmt(tx.amount)} <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(235,235,245,0.6)' }}>sums</span>
        </div>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, color: 'rgba(235,235,245,0.6)' }}>{sub}</div>
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
      <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={tab.icon} alt={tab.label}
          style={{
            width: tab.iw, height: tab.ih,
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
