import { useState, useRef, useEffect, useCallback } from 'react'
<<<<<<< Updated upstream

// ── Icons ─────────────────────────────────────────────────────────────────────
import IC_BACK     from '../assets/icons/ui/ai-back.svg'
import IC_LIST     from '../assets/icons/ui/ai-list.svg'
import IC_ATTACH   from '../assets/icons/ui/ai-attach.svg'
import IC_MIC      from '../assets/icons/ui/ai-mic.svg'
import IC_EDIT     from '../assets/icons/ui/ai-edit.svg'
import IC_SPARK_LG from '../assets/icons/ui/ai-spark-lg.svg'
import IC_SPARK_SM from '../assets/icons/ui/ai-spark-sm.svg'

// ── Category icons ─────────────────────────────────────────────────────────────
import IC_CAT_FOOD          from '../assets/icons/categories/meal.svg'
import IC_CAT_TRANSPORT     from '../assets/icons/categories/transport.svg'
import IC_CAT_GROCERY       from '../assets/icons/categories/grocery.svg'
import IC_CAT_HOME          from '../assets/icons/categories/house.svg'
import IC_CAT_CLOTHING      from '../assets/icons/categories/clothing.svg'
=======
import AddExpenseScreen from './AddExpenseScreen'
import IC_BACK from '../assets/icons/ui/back.svg'
import IC_CAT_FOOD         from '../assets/icons/categories/meal.svg'
import IC_CAT_TRANSPORT    from '../assets/icons/categories/transport.svg'
import IC_CAT_GROCERY      from '../assets/icons/categories/grocery.svg'
import IC_CAT_HOME         from '../assets/icons/categories/house.svg'
import IC_CAT_CLOTHING     from '../assets/icons/categories/clothing.svg'
>>>>>>> Stashed changes
import IC_CAT_ENTERTAINMENT from '../assets/icons/categories/gaming.svg'
import IC_CAT_SHOPPING      from '../assets/icons/categories/web.svg'
import IC_CAT_OTHER         from '../assets/icons/categories/other.svg'

const CAT_ICONS = {
  food: IC_CAT_FOOD, transport: IC_CAT_TRANSPORT, grocery: IC_CAT_GROCERY,
  home: IC_CAT_HOME, clothing: IC_CAT_CLOTHING, entertainment: IC_CAT_ENTERTAINMENT,
  shopping: IC_CAT_SHOPPING, utilities: IC_CAT_OTHER, health: IC_CAT_OTHER,
  education: IC_CAT_OTHER, other: IC_CAT_OTHER,
}

const CATEGORY_META = {
  food:          { label: 'Meal',      color: '#6155F5' },
  transport:     { label: 'Transport', color: '#34C759' },
  grocery:       { label: 'Grocery',   color: '#FF3830' },
  home:          { label: 'Home',      color: '#0088FF' },
  clothing:      { label: 'Clothing',  color: '#FF9500' },
  entertainment: { label: 'Fun',       color: '#FF2D55' },
  shopping:      { label: 'Shopping',  color: '#FF9500' },
  other:         { label: 'Other',     color: '#8E8E93' },
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

// ── Mock parser ────────────────────────────────────────────────────────────────
function mockParse(text) {
  const results = []
  const patterns = [
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(oshga|ovqatga|taoml?|meal|food|restoran|cafe)/i, cat: 'food' },
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(taksi|taxi|avtobus|metro|transport)/i,            cat: 'transport' },
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(oziq-ovqat|bozor|supermarket|grocery)/i,          cat: 'grocery' },
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(uy|home|kvartira|kommunal)/i,                     cat: 'home' },
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(kiyim|clothing)/i,                                cat: 'clothing' },
  ]
  const parts = text.split(/,|;|\bva\b/)
  parts.forEach(part => {
    const m = part.match(/(\d[\d\s]{0,9})/)
    if (!m) return
    const amount = parseInt(m[1].replace(/\s/g, ''), 10)
    if (!amount) return
    let cat = 'other'
    for (const p of patterns) { if (p.re.test(part)) { cat = p.cat; break } }
    results.push({ id: Date.now() + Math.random(), amount, cat, account: 'TBC Salom' })
  })
  if (!results.length && /\d/.test(text)) {
    const m = text.match(/(\d[\d\s]{0,9})/)
    if (m) results.push({ id: Date.now(), amount: parseInt(m[1].replace(/\s/g,''),10), cat: 'other', account: 'TBC Salom' })
  }
  return results
}

function fmt(n) { return n.toLocaleString('ru').replace(/,/g, ' ') }

// ── AI Avatar (gradient circle + spark) ──────────────────────────────────────
function AIAvatar() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
      background: 'radial-gradient(circle at 50% 20%, #C7FFF2 0%, #95E4F5 25%, #63C8F9 50%, #4BBAFA 62%, #32ADFC 75%, #199FFD 87%, #0C98FE 94%, #0091FF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img src={IC_SPARK_SM} alt="" style={{ width: 22, height: 22, display: 'block' }} />
    </div>
  )
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  const [dot, setDot] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setDot(d => (d + 1) % 4), 420)
    return () => clearInterval(id)
  }, [])
  return <span>{'Aniqlamoqdaman' + '.'.repeat(dot)}</span>
}

// ── Waveform ──────────────────────────────────────────────────────────────────
function WaveBar({ delay }) {
  const [h, setH] = useState(4)
  useEffect(() => {
    const id = setInterval(() => setH(4 + Math.random() * 24), 130 + delay % 180)
    return () => clearInterval(id)
  }, [])
  return <div style={{ width: 3, height: h, borderRadius: 2, background: '#0088FF', transition: 'height 0.13s ease' }} />
}
function Waveform() {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 34, padding: '0 8px', flex: 1 }}>
      {Array.from({ length: 26 }, (_, i) => <WaveBar key={i} delay={i * 60} />)}
    </div>
  )
}

// ── Category icon ─────────────────────────────────────────────────────────────
function CatIcon({ cat }) {
  return <img src={CAT_ICONS[cat] || CAT_ICONS.other} alt="" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'block' }} />
}

<<<<<<< Updated upstream
// ── Shared styles ─────────────────────────────────────────────────────────────
const SF = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif"
const pillBtn = {
  width: 60, height: 45, borderRadius: 999,
  background: '#1C1C1E', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
const circBtn = {
  width: 42, height: 42, borderRadius: 999, flexShrink: 0,
  background: '#1C1C1E', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AssistantScreen({ onBack }) {
  const [messages,   setMessages]   = useState([])
  const [inputText,  setInputText]  = useState('')
  const [thinking,   setThinking]   = useState(false)
  const [recording,  setRecording]  = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const scrollRef     = useRef(null)
  const inputRef      = useRef(null)
  const fileRef       = useRef(null)
  const recogRef      = useRef(null)
  const transcriptRef = useRef('')

  const isEmpty = messages.length === 0 && !thinking
=======
// ── Main screen ───────────────────────────────────────────────────────────────
export default function AssistantScreen({ onBack, userId, accounts = [], categories = [] }) {
  const [uiState,   setUiState]   = useState('empty')
  const [inputText, setInputText] = useState('')
  const [recording, setRecording] = useState(false)
  const [messages,  setMessages]  = useState([])
  const [editItem,  setEditItem]  = useState(null)
  const scrollRef    = useRef(null)
  const inputRef     = useRef(null)
  const fileRef      = useRef(null)
  const mediaRef     = useRef(null)   // MediaRecorder instance
  const chunksRef    = useRef([])     // recorded audio chunks
  const cancelledRef = useRef(false)  // true = discard audio on stop
>>>>>>> Stashed changes

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

<<<<<<< Updated upstream
=======
  // ── Add all to DB ───────────────────────────────────────────────────────────
  const addAll = useCallback(async (msgId, items) => {
    const body = {
      user_id: Number(userId),
      source: 'ai',
      items: items.map(item => ({
        category_key: item.cat && item.cat !== 'other' ? item.cat : null,
        type: 'expense',
        amount: Math.round(Number(String(item.amount).replace(/\s/g, '').replace(/,/g, ''))) || 0,
        note: item.note ? String(item.note) : null,
        account_id: accounts.length > 0 ? Number(accounts[0].id) : null,
      })),
    }
    const res = await fetch(`${API}/transactions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}))
      console.error('[addAll] error:', detail)
      return
    }
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, added: true } : m))
    setTimeout(() => onBack(), 800)
  }, [userId, accounts, onBack])

  // ── Send text to AI ─────────────────────────────────────────────────────────
>>>>>>> Stashed changes
  const send = useCallback(async (text) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: text.trim() }])
    setInputText('')
    setThinking(true)
    try {
      const res = await fetch(`${API}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const items = res.ok ? await res.json() : mockParse(text)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', items,
        text: items.length > 0
          ? `Tayyor. Xarajatlarni tayyorladim, iltimos, hisob raqami va narxni yana bir bor tekshirib ko'ring`
          : `Kechirasiz, xarajatlarni aniqlay olmadim. Iltimos qaytadan yozing.`,
      }])
    } catch {
      const items = mockParse(text)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', items,
        text: items.length > 0
          ? `Tayyor. Xarajatlarni tayyorladim, iltimos, hisob raqami va narxni yana bir bor tekshirib ko'ring`
          : `Kechirasiz, xarajatlarni aniqlay olmadim. Iltimos qaytadan yozing.`,
      }])
    }
    setThinking(false)
  }, [])

  const startRecording = useCallback((e) => {
    e?.preventDefault()
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Голосовой ввод не поддерживается'); return }
    transcriptRef.current = ''
    const recog = new SR()
    recog.lang = 'uz-UZ'; recog.interimResults = true; recog.continuous = true
    recog.onresult = ev => {
      const t = Array.from(ev.results).map(r => r[0].transcript).join('')
      transcriptRef.current = t; setInputText(t)
    }
    recog.onend = () => {
      setRecording(false); recogRef.current = null
      const t = transcriptRef.current.trim()
      if (t) { send(t); setInputText(''); transcriptRef.current = '' }
    }
    recog.onerror = () => { setRecording(false); recogRef.current = null }
    recog.start(); recogRef.current = recog; setRecording(true)
    const up = () => { window.removeEventListener('pointerup', up); recogRef.current?.stop() }
    window.addEventListener('pointerup', up)
  }, [send])

  const addAll = useCallback((msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, added: true } : m))
  }, [])

  if (editItem) return (
    <AddExpenseScreen
      type="Expense"
      userId={userId}
      accounts={accounts}
      categories={categories}
      initialAmount={String(editItem.amount ?? '')}
      initialCategoryKey={editItem.cat}
      initialNote={editItem.note ?? ''}
      onClose={() => setEditItem(null)}
      onSave={({ amount, cat, note }) => {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          items: msg.items?.map(it =>
            it.id === editItem.id ? { ...it, amount, cat, note } : it
          ),
        })))
        setEditItem(null)
      }}
    />
  )

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', fontFamily: SF }}>

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        paddingTop: 'var(--safe-top, env(safe-area-inset-top, 44px))',
        height: 'calc(var(--safe-top, env(safe-area-inset-top, 44px)) + 52px)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={pillBtn}>
          <div style={{ mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)', display: 'flex', alignItems: 'center' }}>
            <img src={IC_BACK} alt="" style={{ width: 32, height: 32, display: 'block' }} />
          </div>
        </button>
        <span style={{ fontSize: 17, color: '#fff', letterSpacing: '-0.43px' }}>New chat</span>
        <button style={pillBtn}>
          <div style={{ mixBlendMode: 'plus-lighter', display: 'flex', alignItems: 'center' }}>
            <img src={IC_LIST} alt="" style={{ width: 32, height: 32, display: 'block' }} />
          </div>
        </button>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {isEmpty ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 12 }}>
          <img src={IC_SPARK_LG} alt="" style={{ width: 80, height: 80, display: 'block' }} />
          <div style={{ fontSize: 20, fontWeight: 510, letterSpacing: '-0.45px', color: '#fff', textAlign: 'center', lineHeight: '25px' }}>
            Add expenses in one message
          </div>
          <div style={{ fontSize: 15, color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.23px', textAlign: 'center', lineHeight: '20px' }}>
            Type, speak, or attach a receipt screenshot
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ marginTop: 8, height: 40, borderRadius: 999, background: '#fff', color: '#1A1B1B', fontSize: 16, fontWeight: 510, padding: '0 20px', border: 'none', cursor: 'pointer', letterSpacing: '-0.4px', fontFamily: SF }}
          >
            Upload photo
          </button>
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', scrollbarWidth: 'none' }}>
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                /* User bubble — white, right */
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, paddingLeft: 64 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ background: '#fff', color: '#000', padding: '8px 10px', borderRadius: 16, fontSize: 17, letterSpacing: '-0.75px', lineHeight: '22px' }}>
                      {msg.text}
                    </div>
                    <div style={{ position: 'absolute', bottom: -1, right: -4, width: 16, height: 17, overflow: 'hidden' }}>
                      <svg viewBox="0 0 16 17" width="16" height="17"><path d="M16 17 Q0 17 0 0 L16 0Z" fill="white"/></svg>
                    </div>
                  </div>
                </div>
              ) : (
                /* AI message */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18, paddingRight: 64 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <AIAvatar />
                    <div style={{ position: 'relative' }}>
                      <div style={{ background: '#1C1C1E', color: '#fff', padding: '8px 10px', borderRadius: 16, fontSize: 17, letterSpacing: '-0.75px', lineHeight: '22px' }}>
                        {msg.text}
                      </div>
                      <div style={{ position: 'absolute', bottom: -1, left: -4, width: 16, height: 17, overflow: 'hidden' }}>
                        <svg viewBox="0 0 16 17" width="16" height="17"><path d="M0 17 Q16 17 16 0 L0 0Z" fill="#1C1C1E"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Expense rows */}
                  {msg.items?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      {msg.items.map(item => {
                        const meta = CATEGORY_META[item.cat] || CATEGORY_META.other
                        return (
                          <div key={item.id} onClick={() => setEditItem(item)} style={{
                            background: '#1C1C1E', borderRadius: 20, height: 64,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0 12px', cursor: 'pointer',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <CatIcon cat={item.cat} />
                              <span style={{ fontSize: 16, fontWeight: 510, letterSpacing: '-0.5px', color: '#fff', lineHeight: '21px' }}>
                                {meta.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 15, fontWeight: 510, letterSpacing: '-0.75px', color: '#fff', lineHeight: '20px' }}>
                                  -{fmt(item.amount)}{' '}
                                  <span style={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', fontWeight: 400 }}>sums</span>
                                </div>
                                <div style={{ fontSize: 13, color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.5px', lineHeight: '18px' }}>
                                  {item.account}
                                </div>
                              </div>
                              <img src={IC_EDIT} alt="" style={{ width: 28, height: 28, display: 'block', flexShrink: 0 }} />
                            </div>
                          </div>
                        )
                      })}

                      {!msg.added ? (
                        <button onClick={() => addAll(msg.id)} style={{
                          width: '100%', height: 60, borderRadius: 999,
                          background: '#0091FF', border: 'none', color: '#fff',
                          fontSize: 17, fontWeight: 510, letterSpacing: '-0.4px',
                          cursor: 'pointer', marginTop: 2, fontFamily: SF,
                        }}>
                          Add {msg.items.length} Transaction{msg.items.length !== 1 ? 's' : ''}
                        </button>
                      ) : (
<<<<<<< Updated upstream
                        <div style={{ textAlign: 'center', padding: 10, fontSize: 15, color: '#00E8B3', letterSpacing: '-0.3px' }}>
=======
                        <div style={{ textAlign: 'center', padding: '10px', fontSize: 15, color: '#fff', letterSpacing: '-0.3px' }}>
>>>>>>> Stashed changes
                          ✓ Added to history
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Thinking state */}
          {thinking && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingRight: 64, marginBottom: 16 }}>
              <AIAvatar />
              <div style={{ position: 'relative' }}>
                <div style={{ background: '#1C1C1E', color: 'rgba(235,235,245,0.6)', padding: '8px 12px', borderRadius: 16, fontSize: 17, letterSpacing: '-0.43px', lineHeight: '22px' }}>
                  <TypingDots />
                </div>
                <div style={{ position: 'absolute', bottom: -1, left: -4, width: 16, height: 17, overflow: 'hidden' }}>
                  <svg viewBox="0 0 16 17" width="16" height="17"><path d="M0 17 Q16 17 16 0 L0 0Z" fill="#1C1C1E"/></svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Write Bar ────────────────────────────────────────────────────────── */}
      <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: `📎 ${f.name}` }])
          e.target.value = ''
        }}
      />
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: 6,
        padding: '4px 16px',
        paddingBottom: 'calc(var(--safe-bottom, env(safe-area-inset-bottom, 0px)) + 8px)',
      }}>
        <button onClick={() => fileRef.current?.click()} style={circBtn}>
          <img src={IC_ATTACH} alt="" style={{ width: 20, height: 20, display: 'block', mixBlendMode: 'plus-lighter' }} />
        </button>

        <div style={{ flex: 1, minHeight: 42, borderRadius: 21, background: '#1C1C1E', display: 'flex', alignItems: 'center', padding: 3 }}>
          {recording ? (
            <Waveform />
          ) : (
            <input
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(inputText)}
              placeholder="Add expense or ask"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: 17, letterSpacing: '-0.43px',
                padding: '6px 10px 8px', fontFamily: SF,
              }}
            />
          )}
          <button
            onClick={inputText.trim() ? () => send(inputText) : undefined}
            onPointerDown={!inputText.trim() ? startRecording : undefined}
            style={{
              width: 36, height: 36, borderRadius: 999, border: 'none',
              background: recording ? '#FF3B30' : inputText.trim() ? '#0088FF' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.18s',
              userSelect: 'none', WebkitUserSelect: 'none', flexShrink: 0,
            }}
          >
            {inputText.trim() ? (
              <span style={{ color: '#fff', fontSize: 20, lineHeight: 1 }}>↑</span>
            ) : recording ? (
              <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>◼</span>
            ) : (
              <img src={IC_MIC} alt="" style={{ width: 20, height: 20, display: 'block', mixBlendMode: 'plus-lighter' }} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
<<<<<<< Updated upstream

// ── Edit Item Screen ───────────────────────────────────────────────────────────
const NUMPAD = [
  ['1','2','3','+'],
  ['4','5','6','−'],
  ['7','8','9','×'],
  [',','0','⌫','÷'],
]

function EditItemScreen({ item, onBack }) {
  const meta = CATEGORY_META[item.cat] || CATEGORY_META.other
  const [digits, setDigits] = useState(String(item.amount))

  function tap(k) {
    if (k === '⌫') setDigits(d => d.slice(0,-1) || '0')
    else if (['+','−','×','÷'].includes(k)) return
    else if (k === ',') setDigits(d => d.includes(',') ? d : d + ',')
    else setDigits(d => d === '0' ? k : d + k)
  }

  const display = parseInt(digits.replace(',',''), 10)

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', fontFamily: SF }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        paddingTop: 'var(--safe-top, env(safe-area-inset-top, 44px))',
        height: 'calc(var(--safe-top, env(safe-area-inset-top, 44px)) + 52px)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={pillBtn}>
          <div style={{ mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)', display: 'flex' }}>
            <img src={IC_BACK} alt="" style={{ width: 32, height: 32, display: 'block' }} />
          </div>
        </button>
        <div style={{ display: 'flex', background: '#1C1C1E', borderRadius: 999, padding: 4, gap: 2 }}>
          {['+','⇄','↓','→'].map((ic, i) => (
            <div key={i} style={{
              width: 36, height: 36, borderRadius: 999,
              background: i === 0 ? 'rgba(0,232,179,0.2)' : 'transparent',
              color: i === 0 ? '#00E8B3' : 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, cursor: 'pointer',
            }}>{ic}</div>
          ))}
        </div>
        <button style={pillBtn}>
          <div style={{ mixBlendMode: 'plus-lighter', display: 'flex' }}>
            <img src={IC_LIST} alt="" style={{ width: 32, height: 32, display: 'block' }} />
          </div>
        </button>
      </div>

      {/* Amount */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: 'rgba(235,235,245,0.6)', marginBottom: 8, letterSpacing: '-0.43px' }}>New expense</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 48, fontWeight: 700, color: '#fff', letterSpacing: '-0.6px', lineHeight: 1 }}>
            -{isNaN(display) ? 0 : fmt(display)}
          </span>
          <span style={{ fontSize: 20, color: 'rgba(235,235,245,0.6)' }}>sums</span>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ padding: '0 16px', paddingBottom: 'calc(var(--safe-bottom, env(safe-area-inset-bottom, 0px)) + 32px)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {[['📅','Today'],['🍽', meta.label],['💳','TBC']].map(([ic, lb]) => (
            <button key={lb} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '12px 14px',
              borderRadius: 999, flexShrink: 0, background: 'rgba(118,118,128,0.24)',
              border: 'none', color: '#fff', fontSize: 17, fontWeight: 510,
              fontFamily: SF, cursor: 'pointer', letterSpacing: '-0.43px',
            }}>
              {ic} {lb} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⌄</span>
            </button>
          ))}
        </div>

        <div style={{ height: 50, borderRadius: 16, background: 'rgba(118,118,128,0.24)', display: 'flex', alignItems: 'center', padding: '0 16px', color: 'rgba(255,255,255,0.6)', fontSize: 17, fontFamily: SF }}>
          Note
        </div>

        {NUMPAD.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 2 }}>
            {row.map(k => {
              const isPill = ['⌫','+','−','×','÷'].includes(k)
              return (
                <button key={k} onClick={() => tap(k)} style={{
                  flex: 1, height: 60, borderRadius: isPill ? 999 : 16,
                  background: 'rgba(118,118,128,0.24)', border: 'none',
                  color: '#fff', fontSize: 20, fontWeight: 500,
                  cursor: 'pointer', fontFamily: SF,
                }}>{k}</button>
              )
            })}
          </div>
        ))}

        <button onClick={onBack} style={{
          height: 60, borderRadius: 999, background: '#fff',
          border: 'none', color: '#1A1B1B', fontSize: 17,
          fontWeight: 510, cursor: 'pointer', letterSpacing: '-0.43px', fontFamily: SF,
        }}>Save</button>
      </div>
    </div>
  )
}
=======
>>>>>>> Stashed changes
