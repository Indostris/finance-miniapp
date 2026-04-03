import React, { useState, useRef } from 'react'
import AddExpenseScreen from './AddExpenseScreen'
import AssistantScreen  from './AssistantScreen'

// ── Figma SVG assets ──────────────────────────────────────────────────────────
// Category icons (40×40 base, exact inner dimensions from Figma node 8109:6164)
const IC_CAT_HOUSE         = 'https://www.figma.com/api/mcp/asset/8e32fa90-7c71-46ea-b28b-0c2bff6e1049'
const IC_CAT_GLOBE         = 'https://www.figma.com/api/mcp/asset/fec1fbd4-4c12-48ac-954f-2e2d09e7f2df'
const IC_CAT_CLOTHING      = 'https://www.figma.com/api/mcp/asset/0be5cd94-9208-4dce-b544-00f716a7cfea'
const IC_CAT_TAXI          = 'https://www.figma.com/api/mcp/asset/26d34d88-0b58-49ca-837c-673b68d8a128'
const IC_CAT_ENTERTAINMENT = 'https://www.figma.com/api/mcp/asset/16ebb176-a091-47a3-b3bd-45c518e0bfd2'
const IC_CAT_GROCERY       = 'https://www.figma.com/api/mcp/asset/e08106a6-e861-450e-93ab-3e87e6b00365'
const IC_CAT_OTHER         = 'https://www.figma.com/api/mcp/asset/6424d656-c615-42fd-8d3f-0872306d6369'
// Tab bar icons
const IC_TAB_HOME      = 'https://www.figma.com/api/mcp/asset/5d291ff7-4e52-4b10-9eef-67c6578bec59'
const IC_TAB_ASSISTANT = 'https://www.figma.com/api/mcp/asset/056bec8c-366e-4482-92f6-15809d3ba1de'
const IC_TAB_BUDGET    = 'https://www.figma.com/api/mcp/asset/ee3a5711-3aa0-4d5b-afc2-0dbddddb2047'
const IC_TAB_ANALYTICS = 'https://www.figma.com/api/mcp/asset/40c46fba-9055-43c8-b857-721c87d94584'
const IC_FAB_PLUS      = 'https://www.figma.com/api/mcp/asset/0b60fffe-6ded-484b-8cb8-e52264684cd7'
// Toolbar
const IC_PROFILE  = 'https://www.figma.com/api/mcp/asset/14b04d2f-2b8f-42f4-a9c0-dfd853f71f36'
const IC_SETTINGS = 'https://www.figma.com/api/mcp/asset/33bf8d4e-2b84-470b-94d5-5f25922655ab'

// ── Category icon definitions (icon url + exact inner px from Figma) ──────────
const CAT = {
  Grocery:       { url: IC_CAT_GROCERY,       iw: 22.539, ih: 19.199 },
  Other:         { url: IC_CAT_OTHER,         iw: 14.578, ih: 2.961  },
  Taxi:          { url: IC_CAT_TAXI,          iw: 27.836, ih: 12.57  },
  Clothing:      { url: IC_CAT_CLOTHING,      iw: 25.72,  ih: 21.27  },
  Entertainment: { url: IC_CAT_ENTERTAINMENT, iw: 28.193, ih: 17.695 },
  House:         { url: IC_CAT_HOUSE,         iw: 23.32,  ih: 20.537 },
  Globe:         { url: IC_CAT_GLOBE,         iw: 19.883, ih: 19.727 },
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CARDS = [
  { id: 0, title: 'Add spending limits',  desc: 'Set limits for key categories. This helps you keep spending under control.' },
  { id: 1, title: 'Connect your bank',    desc: 'Link your bank account and let AI categorise transactions automatically.' },
]

const TX_GROUPS = [
  { id: 0, date: 'Thu, Sep 12', total: '-480 000 sums', items: [
    { id: 0, title: 'Groceries',  sub: 'TBC Salom', amount: '- 128 000', cat: 'Grocery', color: '#FF4244' },
    { id: 1, title: 'Other',      sub: 'TBC Salom', amount: '-128 000',  cat: 'Other',   color: '#8E8E93' },
  ]},
  { id: 1, date: 'Thu, Sep 11', total: '-480 000 sums, +129 000 sums', items: [
    { id: 0, title: 'Groceries',   sub: 'TBC Salom', amount: '-128 000', cat: 'Grocery', color: '#FF4244' },
    { id: 1, title: 'Web service', sub: 'TBC Salom', amount: '128 000',  cat: 'Taxi',    color: '#30D158' },
  ]},
]

const LIMITS = [
  { id: 0, title: 'Clothing',      detail: '1 500 000 of 4 000 000 left', cat: 'Clothing',      color: '#FF9530', progress: 0.625 },
  { id: 1, title: 'Entertainment', detail: '1 500 000 of 4 000 000 left', cat: 'Entertainment', color: '#FF375F', progress: 0.625 },
  { id: 2, title: 'Housing',       detail: '1 500 000 of 4 000 000 left', cat: 'House',          color: '#0091FF', progress: 0.35  },
  { id: 3, title: 'Taxi',          detail: '1 500 000 of 4 000 000 left', cat: 'Taxi',           color: '#30D158', progress: 0.18  },
]

const BILLS = [
  { id: 0, title: 'Housing',     sub: 'Billz • 30 March', amount: '28 000', cat: 'House', color: '#0091FF' },
  { id: 1, title: 'Web service', sub: 'Billz • 30 March', amount: '28 000', cat: 'Globe', color: '#FF375F' },
]

const TABS = [
  { icon: IC_TAB_HOME,      iw: 27.984, ih: 24.645, label: 'Home'      },
  { icon: IC_TAB_ASSISTANT, iw: 21.68,  ih: 26.73,  label: 'Assistant' },
  { icon: IC_TAB_BUDGET,    iw: 23.355, ih: 21.574, label: 'Budget'    },
  { icon: IC_TAB_ANALYTICS, iw: 23.906, ih: 23.895, label: 'Analytics' },
]

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState(0)
  const [cardPage,    setCardPage]    = useState(0)
  const [showMenu,    setShowMenu]    = useState(false)
  const [addType,     setAddType]     = useState(null)
  const [showAI,      setShowAI]      = useState(false)
  const carouselRef = useRef(null)

  function handleScroll(e) {
    const el = e.currentTarget
    setCardPage(Math.round(el.scrollLeft / 318))
  }

  if (addType) return <AddExpenseScreen type={addType} onClose={() => setAddType(null)} />
  if (showAI)  return <AssistantScreen onBack={() => { setShowAI(false); setSelectedTab(0) }} />

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
              Monthli income: 24,000,000 sums
            </div>
            <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, letterSpacing: '-0.5px', color: 'rgba(235,235,245,0.6)', marginBottom: 8 }}>
              Budget: 16,000,000 sums • You spent:
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif", fontSize: 40, fontWeight: 700, letterSpacing: '-0.6px', lineHeight: '41px', color: '#fff' }}>
                12,643,000
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
            {TX_GROUPS.map(g => <TxGroup key={g.id} group={g} />)}
          </div>

          {/* Limits */}
          <SectionHeader title="Limits" />
          <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LIMITS.map(l => <LimitRow key={l.id} item={l} />)}
          </div>

          {/* Upcoming Bills */}
          <SectionHeader title="Upcoming bills" />
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {BILLS.map(b => <BillRow key={b.id} item={b} />)}
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: 'calc(var(--safe-top) + 62px)',
        padding: 'calc(var(--safe-top) + 62px) 16px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 52 }}>
          <span style={{
            fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
            fontSize: 40, fontWeight: 700, letterSpacing: '-0.6px', lineHeight: '41px', color: '#fff',
          }}>Home</span>
          <div style={{ flex: 1 }} />
          {/* Toolbar button group */}
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
      {showMenu && <ActionMenu onClose={() => setShowMenu(false)} onSelect={t => { setShowMenu(false); setTimeout(() => setAddType(t), 250) }} />}

      {/* Tab bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'flex-end',
        padding: '16px 25px',
        paddingBottom: 'calc(var(--safe-bottom) + 8px)',
      }}>
        {/* Tabs pill */}
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

        {/* FAB */}
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

// ── Category icon — exact Figma structure ─────────────────────────────────────
function CategoryIcon({ cat, color }) {
  const def = CAT[cat]
  if (!def) return <div style={{ width: 40, height: 40, borderRadius: 12, background: color, flexShrink: 0 }} />
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

function TxGroup({ group }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, letterSpacing: '-0.5px', color: 'rgba(235,235,245,0.6)' }}>
        <span>{group.date}</span><span>{group.total}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {group.items.map(tx => <TxRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  )
}

function TxRow({ tx }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px', height: 60, background: '#1C1C1E', borderRadius: 20 }}>
      <CategoryIcon cat={tx.cat} color={tx.color} />
      <span style={{ flex: 1, fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 16, fontWeight: 510, letterSpacing: '-0.5px', color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{tx.title}</span>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 15, fontWeight: 510, letterSpacing: '-0.75px', color: '#fff' }}>
          {tx.amount} <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(235,235,245,0.6)' }}>sums</span>
        </div>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, color: 'rgba(235,235,245,0.6)' }}>{tx.sub}</div>
      </div>
    </div>
  )
}

function LimitRow({ item }) {
  const grad = `linear-gradient(90deg, #16E18C 0%, #F3E100 40%, #FF8000 70%, #FF3300 100%)`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: '#1C1C1E', borderRadius: 20 }}>
      <CategoryIcon cat={item.cat} color={item.color} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 16, fontWeight: 510, letterSpacing: '-0.5px', color: '#fff', marginBottom: 2 }}>{item.title}</div>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, color: 'rgba(235,235,245,0.6)', marginBottom: 8 }}>{item.detail}</div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${item.progress * 100}%`, borderRadius: 3, background: grad }} />
        </div>
      </div>
    </div>
  )
}

function BillRow({ item }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px', height: 60, background: '#1C1C1E', borderRadius: 20 }}>
      <CategoryIcon cat={item.cat} color={item.color} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 16, fontWeight: 510, letterSpacing: '-0.5px', color: '#fff' }}>{item.title}</div>
        <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 13, color: 'rgba(235,235,245,0.6)' }}>{item.sub}</div>
      </div>
      <div style={{ fontFamily: "'SF Pro', -apple-system, sans-serif", fontSize: 15, fontWeight: 510, letterSpacing: '-0.75px', color: '#fff', flexShrink: 0 }}>
        {item.amount} <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(235,235,245,0.6)' }}>sums</span>
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
        position: 'relative',
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
