import { useState, useRef, useEffect, useCallback } from 'react'
import AddExpenseScreen from './AddExpenseScreen'

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

const API = import.meta.env.VITE_API_URL ?? '/api'

function fmt(n) { return Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') }

// ── AI Avatar ─────────────────────────────────────────────────────────────────
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
export default function AssistantScreen({ onBack, userId, accounts = [], categories = [] }) {
  const [messages,  setMessages]  = useState([])
  const [inputText, setInputText] = useState('')
  const [thinking,  setThinking]  = useState(false)
  const [recording, setRecording] = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const scrollRef    = useRef(null)
  const inputRef     = useRef(null)
  const fileRef      = useRef(null)
  const mediaRef     = useRef(null)
  const chunksRef    = useRef([])
  const cancelledRef = useRef(false)

  const isEmpty = messages.length === 0 && !thinking

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

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
  const send = useCallback(async (text) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: text.trim() }])
    setInputText('')
    setThinking(true)
    try {
      const res = await fetch(`${API}/text_separate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, user_id: Number(userId) }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      const items = (Array.isArray(data) ? data : data.items ?? []).map(item => ({
        id: Date.now() + Math.random(),
        amount: item.amount ?? 0,
        cat: item.category || item.cat || 'other',
        note: item.note ?? '',
        account: accounts[0]?.name ?? 'Account',
      }))
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai', items,
        text: items.length > 0
          ? `Tayyor. Xarajatlarni tayyorladim, iltimos, hisob raqami va narxni yana bir bor tekshirib ko'ring`
          : `Kechirasiz, xarajatlarni aniqlay olmadim. Iltimos qaytadan yozing.`,
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai', items: [],
        text: `Kechirasiz, xarajatlarni aniqlay olmadim. Iltimos qaytadan yozing.`,
      }])
    }
    setThinking(false)
  }, [userId, accounts])

  // ── Recording ───────────────────────────────────────────────────────────────
  const startRecording = useCallback(async (e) => {
    e?.preventDefault()
    if (recording) return
    cancelledRef.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      mr.ondataavailable = ev => { if (ev.data.size > 0) chunksRef.current.push(ev.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        if (cancelledRef.current) { chunksRef.current = []; return }
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []
        const fd = new FormData()
        fd.append('file', blob, 'audio.webm')
        fd.append('user_id', String(userId))
        setThinking(true)
        try {
          const res = await fetch(`${API}/transcribe_audio`, { method: 'POST', body: fd })
          if (!res.ok) throw new Error()
          const data = await res.json()
          const text = data.text || data.transcript || ''
          if (text.trim()) await send(text)
        } catch { /* silent */ }
        setThinking(false)
      }
      mr.start()
      setRecording(true)
    } catch { /* no mic */ }
  }, [recording, userId, send])

  const stopRecording = useCallback((cancel = false) => {
    cancelledRef.current = cancel
    mediaRef.current?.stop()
    setRecording(false)
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, paddingLeft: 64 }}>
                  <div style={{ background: '#fff', color: '#000', padding: '8px 10px', borderRadius: 16, fontSize: 17, letterSpacing: '-0.75px', lineHeight: '22px' }}>
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18, paddingRight: 64 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <AIAvatar />
                    <div style={{ background: '#1C1C1E', color: '#fff', padding: '8px 10px', borderRadius: 16, fontSize: 17, letterSpacing: '-0.75px', lineHeight: '22px' }}>
                      {msg.text}
                    </div>
                  </div>

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
                        <button onClick={() => addAll(msg.id, msg.items)} style={{
                          width: '100%', height: 60, borderRadius: 999,
                          background: '#0091FF', border: 'none', color: '#fff',
                          fontSize: 17, fontWeight: 510, letterSpacing: '-0.4px',
                          cursor: 'pointer', marginTop: 2, fontFamily: SF,
                        }}>
                          Add {msg.items.length} Transaction{msg.items.length !== 1 ? 's' : ''}
                        </button>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px', fontSize: 15, color: '#fff', letterSpacing: '-0.3px' }}>
                          ✓ Added to history
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingRight: 64, marginBottom: 16 }}>
              <AIAvatar />
              <div style={{ background: '#1C1C1E', color: 'rgba(235,235,245,0.6)', padding: '8px 12px', borderRadius: 16, fontSize: 17, letterSpacing: '-0.43px', lineHeight: '22px' }}>
                <TypingDots />
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
            onClick={inputText.trim() ? () => send(inputText) : recording ? () => stopRecording(false) : undefined}
            onPointerDown={!inputText.trim() && !recording ? startRecording : undefined}
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
