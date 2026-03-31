import React, { useState, useRef } from 'react'
import AddExpenseScreen from './AddExpenseScreen'
import AssistantScreen  from './AssistantScreen'

// ── Data ──────────────────────────────────────────────────────────────────────

const CARDS = [
  { id: 0, title: 'Add spending limits',  desc: 'Set limits for key categories. This helps you keep spending under control.' },
  { id: 1, title: 'Connect your bank',    desc: 'Link your bank account and let AI categorise transactions automatically.' },
]

const TX_GROUPS = [
  { id: 0, date: 'Thu, Sep 12', total: '-480 000 sums', items: [
    { id: 0, title: 'Groceries',  sub: 'TBC Salom', amount: '- 128 000', icon: '🛒', color: '#FF4244' },
    { id: 1, title: 'Other',      sub: 'TBC Salom', amount: '-128 000',  icon: '⋯',  color: '#8E8E93' },
  ]},
  { id: 1, date: 'Thu, Sep 11', total: '-480 000 sums, +129 000 sums', items: [
    { id: 0, title: 'Groceries',   sub: 'TBC Salom', amount: '-128 000', icon: '🛒', color: '#FF4244' },
    { id: 1, title: 'Web service', sub: 'TBC Salom', amount: '128 000',  icon: '🚗', color: '#30D158' },
  ]},
]

const LIMITS = [
  { id: 0, title: 'Clothing',      detail: '1 500 000 of 4 000 000 left', icon: '👕', color: '#FF9530', progress: 0.625 },
  { id: 1, title: 'Entertainment', detail: '1 500 000 of 4 000 000 left', icon: '🎮', color: '#FF375F', progress: 0.625 },
  { id: 2, title: 'Housing',       detail: '1 500 000 of 4 000 000 left', icon: '🏠', color: '#0091FF', progress: 0.35 },
  { id: 3, title: 'Taxi',          detail: '1 500 000 of 4 000 000 left', icon: '🚗', color: '#30D158', progress: 0.18 },
]

const BILLS = [
  { id: 0, title: 'Housing',     sub: 'Billz • 30 March', amount: '28 000', icon: '🏠', color: '#0091FF' },
  { id: 1, title: 'Web service', sub: 'Billz • 30 March', amount: '28 000', icon: '🌐', color: '#FF375F' },
]

const TABS = [
  { icon: '⌂', label: 'Home' },
  { icon: '✦', label: 'Assistant' },
  { icon: '▦', label: 'Budget' },
  { icon: '◕', label: 'Analytics' },
]

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [selectedTab,  setSelectedTab]  = useState(0)
  const [cardPage,     setCardPage]     = useState(0)
  const [showMenu,     setShowMenu]     = useState(false)
  const [addType,      setAddType]      = useState(null)
  const [showAI,       setShowAI]       = useState(false)
  const carouselRef = useRef(null)

  function handleScroll(e) {
    const el = e.currentTarget
    const idx = Math.round(el.scrollLeft / 318)
    setCardPage(idx)
  }

  if (addType) return <AddExpenseScreen type={addType} onClose={() => setAddType(null)} />
  if (showAI)  return <AssistantScreen onBack={() => { setShowAI(false); setSelectedTab(0) }} />

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
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
            <div style={{ fontSize: '13px', letterSpacing: '-0.5px', color: '#fff', marginBottom: '2px' }}>
              Monthli income: 24,000,000 sums
            </div>
            <div style={{ fontSize: '13px', letterSpacing: '-0.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              Budget: 16,000,000 sums • You spent:
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.6px', color: '#fff' }}>12,643,000</span>
              <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }}>sums</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '8px', padding: '0 16px 24px' }}>
            <CTAButton title="Add manually" blue={false} onClick={() => setAddType('Expense')} />
            <CTAButton title="Add with AI ✦" blue={true}  onClick={() => setAddType('Expense')} />
          </div>

          {/* Carousel */}
          <div style={{ marginBottom: '24px' }}>
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              style={{
                display: 'flex', gap: '8px', overflowX: 'auto', scrollSnapType: 'x mandatory',
                paddingLeft: '16px', paddingRight: '16px',
                scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
              }}
            >
              {CARDS.map(c => <SuggestionCard key={c.id} card={c} />)}
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
              {CARDS.map((c, i) => (
                <div key={i} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: i === cardPage ? '#fff' : 'rgba(255,255,255,0.3)',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <SectionHeader title="Recent transactions" />
          <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TX_GROUPS.map(g => <TxGroup key={g.id} group={g} />)}
          </div>

          {/* Limits */}
          <SectionHeader title="Limits" />
          <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {LIMITS.map(l => <LimitRow key={l.id} item={l} />)}
          </div>

          {/* Upcoming Bills */}
          <SectionHeader title="Upcoming bills" />
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {BILLS.map(b => <BillRow key={b.id} item={b} />)}
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: 'calc(var(--safe-top) + 62px)',
        paddingLeft: '16px', paddingRight: '16px',
        paddingBottom: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '52px' }}>
          <span style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.6px', color: '#fff' }}>Home</span>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', gap: '12px', alignItems: 'center',
            padding: '0 10px', height: '44px',
            background: '#1C1C1E', borderRadius: '999px',
          }}>
            <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '22px', cursor: 'pointer' }}>👤</button>
            <button style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '22px', cursor: 'pointer' }}>⚙</button>
          </div>
        </div>
      </div>

      {/* Action menu overlay */}
      {showMenu && <ActionMenu onClose={() => setShowMenu(false)} onSelect={t => { setShowMenu(false); setTimeout(() => setAddType(t), 250) }} />}

      {/* Tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'flex-end',
        padding: '16px 25px',
        paddingBottom: 'calc(var(--safe-bottom) + 8px)',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', flex: 1,
          background: '#1C1C1E', borderRadius: '999px',
          padding: '3px 16px 3px 4px',
        }}>
          {TABS.map((t, i) => (
            <TabBtn key={i} tab={t} active={selectedTab === i} onClick={() => {
              setSelectedTab(i)
              if (i === 1) setShowAI(true)
            }} />
          ))}
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowMenu(true)}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: '#0088FF', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', color: '#fff', flexShrink: 0, marginLeft: '8px',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
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
        flex: 1, height: '46px', borderRadius: '999px', border: 'none',
        background: blue ? 'rgba(0,136,255,0.16)' : 'rgba(118,118,128,0.24)',
        color: blue ? 'rgba(0,136,255,0.96)' : '#fff',
        fontSize: '17px', fontWeight: 500, letterSpacing: '-0.43px',
        transform: p ? 'scale(0.97)' : 'scale(1)', transition: 'transform 0.12s',
        cursor: 'pointer',
      }}
    >{title}</button>
  )
}

function SuggestionCard({ card }) {
  return (
    <div style={{
      minWidth: '310px', height: '84px', borderRadius: '24px',
      background: 'rgba(0,136,255,0.12)',
      scrollSnapAlign: 'start', flexShrink: 0,
      display: 'flex', alignItems: 'center', padding: '16px', gap: '16px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.5px', color: 'rgba(0,136,255,0.96)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {card.title}
        </div>
        <div style={{ fontSize: '13px', letterSpacing: '-0.5px', color: 'rgba(0,136,255,0.64)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {card.desc}
        </div>
      </div>
      <button style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: 'rgba(0,136,255,0.16)', border: 'none',
        color: 'rgba(0,136,255,0.96)', fontSize: '14px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 16px' }}>
      <span style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.5px', color: '#fff' }}>{title}</span>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.43px' }}>View all ›</span>
    </div>
  )
}

function TxGroup({ group }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', letterSpacing: '-0.5px', color: 'rgba(255,255,255,0.6)' }}>
        <span>{group.date}</span><span>{group.total}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {group.items.map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  )
}

function TxRow({ tx }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px', height: '60px', background: '#1C1C1E', borderRadius: '20px' }}>
      <CategoryIcon icon={tx.icon} color={tx.color} />
      <span style={{ flex: 1, fontSize: '16px', fontWeight: 500, letterSpacing: '-0.5px', color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{tx.title}</span>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '-0.75px', color: '#fff' }}>{tx.amount} <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>sums</span></div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{tx.sub}</div>
      </div>
    </div>
  )
}

function LimitRow({ item }) {
  const grad = `linear-gradient(90deg, #16E18C 0%, #F3E100 40%, #FF8000 70%, #FF3300 100%)`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#1C1C1E', borderRadius: '20px' }}>
      <CategoryIcon icon={item.icon} color={item.color} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.5px', color: '#fff' }}>{item.title}</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>{item.detail}</div>
        <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${item.progress * 100}%`, borderRadius: '3px', background: grad }} />
        </div>
      </div>
    </div>
  )
}

function BillRow({ item }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px', height: '60px', background: '#1C1C1E', borderRadius: '20px' }}>
      <CategoryIcon icon={item.icon} color={item.color} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.5px', color: '#fff' }}>{item.title}</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{item.sub}</div>
      </div>
      <div style={{ fontSize: '15px', fontWeight: 500, color: '#fff' }}>{item.amount} <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>sums</span></div>
    </div>
  )
}

function CategoryIcon({ icon, color }) {
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
      background: color,
      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.56) 0%, transparent 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '20px',
    }}>{icon}</div>
  )
}

function TabBtn({ tab, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '1px', padding: '7px 8px', border: 'none', cursor: 'pointer',
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        borderRadius: '999px',
        transition: 'background 0.2s',
      }}
    >
      <span style={{ fontSize: '22px', color: active ? '#fff' : 'rgba(255,255,255,0.42)', lineHeight: 1 }}>{tab.icon}</span>
      <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.42)' }}>{tab.label}</span>
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
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '0 20px',
        paddingBottom: 'calc(var(--safe-bottom) + 90px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }} onClick={e => e.stopPropagation()}>
        {ACTION_ITEMS.map(item => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            style={{
              width: '170px', height: '50px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.15)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '17px', fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {item} <span style={{ fontSize: '14px' }}>{ACTION_ICONS[item]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
