import { useState, useRef, useEffect, useCallback } from 'react'
import IC_BACK from '../assets/icons/ui/back.svg'
import IC_CAT_FOOD         from '../assets/icons/categories/meal.svg'
import IC_CAT_TRANSPORT    from '../assets/icons/categories/transport.svg'
import IC_CAT_GROCERY      from '../assets/icons/categories/grocery.svg'
import IC_CAT_HOME         from '../assets/icons/categories/house.svg'
import IC_CAT_CLOTHING     from '../assets/icons/categories/clothing.svg'
import IC_CAT_ENTERTAINMENT from '../assets/icons/categories/gaming.svg'
import IC_CAT_SHOPPING     from '../assets/icons/categories/web.svg'
import IC_CAT_OTHER        from '../assets/icons/categories/other.svg'

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

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const CATEGORY_META = {
  food:          { label: 'Meal',        color: '#6155F5', icon: '🍔' },
  transport:     { label: 'Transport',   color: '#34C759', icon: '🚗' },
  grocery:       { label: 'Grocery',     color: '#FF3830', icon: '🛒' },
  home:          { label: 'Home',        color: '#0088FF', icon: '🏠' },
  clothing:      { label: 'Clothing',    color: '#FF9500', icon: '👕' },
  entertainment: { label: 'Fun',         color: '#FF2D55', icon: '🎮' },
  shopping:      { label: 'Shopping',    color: '#FF9500', icon: '🛍️' },
  utilities:     { label: 'Utilities',   color: '#636366', icon: '💡' },
  health:        { label: 'Health',      color: '#30D158', icon: '💊' },
  education:     { label: 'Education',   color: '#0088FF', icon: '📚' },
  other:         { label: 'Other',       color: '#8E8E93', icon: '⋯'  },
}

// ── Spark icon ────────────────────────────────────────────────────────────────
const SparkIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M37.7896 21.728C37.342 21.728 37.0622 21.426 37.0062 21.0142C36.2788 16.5937 36.3067 16.4839 31.5503 15.6602C31.0746 15.5779 30.7948 15.3033 30.7948 14.864C30.7948 14.4522 31.0746 14.1776 31.4943 14.0952C36.3347 13.1892 36.3067 13.0794 37.0062 8.74131C37.0622 8.30202 37.342 8 37.7896 8C38.2373 8 38.5171 8.30202 38.601 8.71386C39.3285 13.1892 39.2725 13.3265 44.085 14.0952C44.5047 14.1502 44.8124 14.4522 44.8124 14.864C44.8124 15.3033 44.5326 15.5779 44.085 15.6602C39.2725 16.5663 39.3565 16.6486 38.601 21.0416C38.5171 21.426 38.2373 21.728 37.7896 21.728ZM24.1917 41.4414C23.5202 41.4414 23.0166 40.9747 22.9326 40.2608C22.0373 33.0948 21.7855 32.8477 14.2591 31.722C13.4756 31.6122 13 31.1729 13 30.4865C13 29.8275 13.4756 29.3608 14.1192 29.251C21.7855 27.8782 22.0373 27.8507 22.9326 20.7121C23.0166 19.9983 23.5202 19.5315 24.1917 19.5315C24.8632 19.5315 25.3668 19.9983 25.4508 20.6847C26.4021 28.0429 26.6259 28.2351 34.2642 29.251C34.9078 29.3333 35.3834 29.8275 35.3834 30.4865C35.3834 31.1454 34.9078 31.6122 34.2642 31.722C26.5699 33.0948 26.4021 33.1497 25.4508 40.3432C25.3668 40.9747 24.8352 41.4414 24.1917 41.4414ZM44.2249 72C43.1337 72 42.2943 71.2312 42.0984 70.1055C39.7762 55.5264 37.9016 53.7143 23.4363 51.7649C22.2611 51.6002 21.4497 50.749 21.4497 49.6508C21.4497 48.5526 22.2891 47.674 23.4642 47.5367C37.9575 45.9442 40.028 43.7752 42.0984 29.2235C42.2663 28.0978 43.1337 27.329 44.2249 27.329C45.2881 27.329 46.1554 28.0978 46.3513 29.2235C48.5896 43.7752 50.5202 45.7795 65.0135 47.5367C66.1606 47.7014 67 48.58 67 49.6508C67 50.749 66.1606 51.6551 64.9855 51.7649C50.4642 53.3848 48.3938 55.5264 46.3513 70.1055C46.1554 71.2312 45.3161 72 44.2249 72Z" fill="url(#spark_grad)"/>
    <defs>
      <radialGradient id="spark_grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 19.6055) rotate(90) scale(57.32 48.3638)">
        <stop stopColor="#C7FFF2"/>
        <stop offset="1" stopColor="#0091FF"/>
      </radialGradient>
    </defs>
  </svg>
)

const AIAvatar = () => (
  <div style={{
    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
    background: 'radial-gradient(circle at 50% 25%, #C7FFF2, #95E4F5 25%, #63C8F9 50%, #4BBAFA 62%, #32ADFC 75%, #199FFD 87%, #0C98FE 94%, #0091FF)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
  }}>✦</div>
)

const TypingDots = () => {
  const [dot, setDot] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setDot(d => (d + 1) % 4), 420)
    return () => clearInterval(id)
  }, [])
  return <span style={{ letterSpacing: 1 }}>{'Aniqlamoqdaman' + '.'.repeat(dot)}</span>
}

const Waveform = () => (
  <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 40 }}>
    {Array.from({ length: 28 }, (_, i) => <WaveBar key={i} delay={i * 60} />)}
  </div>
)
const WaveBar = ({ delay }) => {
  const [h, setH] = useState(4)
  useEffect(() => {
    const id = setInterval(() => setH(4 + Math.random() * 28), 120 + delay % 200)
    return () => clearInterval(id)
  }, [])
  return <div style={{ width: 3, height: h, borderRadius: 2, background: '#0088FF', transition: 'height 0.12s ease' }} />
}

const CatIcon = ({ cat }) => (
  <img src={CAT_ICONS[cat] ?? IC_CAT_OTHER} alt="" style={{ width: 40, height: 40, display: 'block', flexShrink: 0 }} />
)

function fmtAmt(n) {
  return Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function AssistantScreen({ onBack, userId, accounts = [] }) {
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, uiState])

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
  }, [userId, accounts])

  // ── Send text to AI ─────────────────────────────────────────────────────────
  const send = useCallback(async (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setUiState('thinking')

    try {
      const res = await fetch(`${API}/text_separate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await res.json()
      const items = Array.isArray(data.result) ? data.result.map((item, i) => ({
        ...item,
        id:  Date.now() + i,
        cat: item.category || item.cat || 'other',
      })) : []
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: items.length > 0
          ? 'Tayyor. Xarajatlarni tayyorladim, iltimos, hisob raqami va narxni yana bir bor tekshirib ko\'ring'
          : 'Kechirasiz, xarajatlarni aniqlay olmadim. Iltimos qaytadan yozing.',
        items,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (e) {
      console.error('[send] error:', e)
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai',
        text: 'Xatolik yuz berdi. Internet aloqasini tekshiring.',
        items: [],
      }])
    }
    setUiState('result')
  }, [])

  // ── Voice recording (MediaRecorder → /transcribe_audio → /text_separate) ───
  const startRecording = useCallback(async (e) => {
    e?.preventDefault()
    if (recording) return
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      alert('Mikrofonga ruxsat berilmadi.')
      return
    }
    cancelledRef.current = false
    chunksRef.current = []
    const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '' })
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      if (cancelledRef.current) return  // user cancelled — discard
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
      setUiState('thinking')
      setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: '🎙 Voice message' }])
      try {
        const form = new FormData()
        form.append('file', blob, 'audio.webm')
        const r1 = await fetch(`${API}/transcribe_audio`, { method: 'POST', body: form })
        const d1 = await r1.json()
        const transcript = d1.result?.trim() ?? ''
        if (!transcript) throw new Error('empty transcript')
        await send(transcript)
      } catch (err) {
        console.error('[voice] error:', err)
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'ai',
          text: 'Ovozni tanib bo\'lmadi. Qaytadan urinib ko\'ring.',
          items: [],
        }])
        setUiState('result')
      }
    }
    mr.start()
    mediaRef.current = mr
    setRecording(true)
    if (uiState === 'empty') setUiState('chat')
  }, [recording, send, uiState])

  const stopRecording = useCallback(() => {
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop()
    setRecording(false)
  }, [])

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop()
    setRecording(false)
  }, [])

  if (editItem) return <EditItemScreen item={editItem} onBack={() => setEditItem(null)} />

  const isEmpty    = uiState === 'empty'
  const isThinking = uiState === 'thinking'

  return (
    <div data-file="src/screens/AssistantScreen.jsx" style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

      {/* Top Nav */}
      <div style={{
        padding: '0 16px', paddingTop: 'var(--safe-top)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 'calc(var(--safe-top) + 62px)', flexShrink: 0, zIndex: 5,
      }}>
        <button onClick={onBack} style={{
          width: 60, height: 45, borderRadius: 999,
          background: '#1C1C1E', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <div style={{ width: 32, height: 32, mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)' }}>
            <img src={IC_BACK} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </button>
        <span style={{ fontSize: 17, color: '#fff', letterSpacing: '-0.43px' }}>New chat</span>
        <button style={{
          width: 60, height: 45, borderRadius: 999,
          background: '#1C1C1E', border: 'none', color: 'rgba(255,255,255,0.6)',
          fontSize: 16, cursor: 'pointer',
        }}>≡</button>
      </div>

      {/* Content area */}
      {isEmpty ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 12 }}>
          <SparkIcon />
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.45px', color: '#fff', textAlign: 'center' }}>
            Add expenses in one message
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.23px', textAlign: 'center' }}>
            Type, speak, or attach a receipt screenshot
          </div>
          <button style={{
            marginTop: 8, height: 40, borderRadius: 999,
            background: '#fff', color: '#1A1B1B',
            fontSize: 16, fontWeight: 500, padding: '0 20px',
            border: 'none', cursor: 'pointer',
          }}>
            Upload photo
          </button>
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0, scrollbarWidth: 'none' }}>
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, paddingLeft: 64 }}>
                  <div style={{
                    background: '#fff', color: '#000',
                    padding: '8px 10px', borderRadius: 16,
                    fontSize: 17, letterSpacing: '-0.75px', lineHeight: '22px',
                    position: 'relative',
                  }}>
                    {msg.text}
                    <div style={{ position: 'absolute', bottom: -1, right: -4, width: 16, height: 17, overflow: 'hidden' }}>
                      <svg viewBox="0 0 16 17" width="16" height="17"><path d="M16 17 Q0 17 0 0 L16 0Z" fill="white"/></svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, paddingRight: 64 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <AIAvatar />
                    <div style={{
                      background: '#1C1C1E', color: '#fff',
                      padding: '8px 10px', borderRadius: 16,
                      fontSize: 17, letterSpacing: '-0.75px', lineHeight: '22px',
                      position: 'relative',
                    }}>
                      {msg.text}
                      <div style={{ position: 'absolute', bottom: -1, left: -4, width: 16, height: 17, overflow: 'hidden' }}>
                        <svg viewBox="0 0 16 17" width="16" height="17"><path d="M0 17 Q16 17 16 0 L0 0Z" fill="#1C1C1E"/></svg>
                      </div>
                    </div>
                  </div>

                  {msg.items?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      {msg.items.map(item => {
                        const meta = CATEGORY_META[item.cat] || CATEGORY_META.other
                        return (
                          <div key={item.id} style={{
                            background: '#1C1C1E', borderRadius: 20, height: 64,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0 12px', cursor: 'pointer',
                          }} onClick={() => setEditItem(item)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <CatIcon cat={item.cat} />
                              <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.5px', color: '#fff' }}>
                                {item.note || meta.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: '-0.75px' }}>
                                  -{fmtAmt(item.amount)} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>sums</span>
                                </div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                  {accounts[0]?.name ?? ''}
                                </div>
                              </div>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: 'rgba(118,118,128,0.24)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13,
                              }}>✎</div>
                            </div>
                          </div>
                        )
                      })}

                      {!msg.added ? (
                        <button onClick={() => addAll(msg.id, msg.items)} style={{
                          width: '100%', height: 60, borderRadius: 999,
                          background: '#0088FF', border: 'none', color: '#fff',
                          fontSize: 17, fontWeight: 500, cursor: 'pointer',
                          letterSpacing: '-0.43px', marginTop: 2,
                        }}>
                          Add {msg.items.length} Transaction{msg.items.length > 1 ? 's' : ''}
                        </button>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px', fontSize: 15, color: '#00E8B3', letterSpacing: '-0.3px' }}>
                          ✓ Added to history
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingRight: 64 }}>
              <AIAvatar />
              <div style={{
                background: '#1C1C1E', color: 'rgba(255,255,255,0.6)',
                padding: '8px 12px', borderRadius: 16,
                fontSize: 17, letterSpacing: '-0.43px', position: 'relative',
              }}>
                <TypingDots />
                <div style={{ position: 'absolute', bottom: -1, left: -4, width: 16, height: 17, overflow: 'hidden' }}>
                  <svg viewBox="0 0 16 17" width="16" height="17"><path d="M0 17 Q16 17 16 0 L0 0Z" fill="#1C1C1E"/></svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Write Bar */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: 6,
        padding: '4px 16px',
        paddingBottom: 'calc(var(--safe-bottom) + 8px)',
      }}>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) {
              setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: `📎 ${file.name}` }])
              if (uiState === 'empty') setUiState('chat')
            }
            e.target.value = ''
          }}
        />

        {/* Left: cancel (red) when recording, attach (+) otherwise */}
        <button
          onClick={recording ? cancelRecording : () => fileRef.current?.click()}
          style={{
            width: 42, height: 42, borderRadius: 999, flexShrink: 0,
            background: recording ? '#FF3B30' : '#1C1C1E',
            border: 'none', color: '#fff',
            fontSize: 22, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
        >
          {recording ? '✕' : '+'}
        </button>

        {/* Middle: input or waveform */}
        <div style={{
          flex: 1, minHeight: 42, borderRadius: 21,
          background: '#1C1C1E', display: 'flex', alignItems: 'center', padding: '3px',
        }}>
          {recording ? (
            <div style={{ flex: 1, padding: '0 10px', display: 'flex', alignItems: 'center', height: 36 }}>
              <Waveform />
            </div>
          ) : (
            <input
              ref={inputRef}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value)
                if (uiState === 'empty' && e.target.value) setUiState('chat')
              }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(inputText)}
              placeholder="Add expense or ask"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: 17, letterSpacing: '-0.43px',
                padding: '6px 10px 8px',
              }}
            />
          )}
        </div>

        {/* Right: stop (◼) when recording, send (↑) when text, mic (🎙) otherwise */}
        <button
          onClick={recording ? stopRecording : inputText.trim() ? () => send(inputText) : undefined}
          onPointerDown={!recording && !inputText.trim() ? startRecording : undefined}
          style={{
            width: 42, height: 42, borderRadius: 999, flexShrink: 0,
            background: recording ? '#0088FF' : inputText.trim() ? '#0088FF' : '#1C1C1E',
            border: 'none', color: '#fff',
            fontSize: inputText.trim() ? 20 : 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
            userSelect: 'none', WebkitUserSelect: 'none',
          }}
        >
          {recording ? '◼' : inputText.trim() ? '↑' : '🎙'}
        </button>
      </div>
    </div>
  )
}

// ── Edit single expense item ───────────────────────────────────────────────────
const NUMPAD_ROWS = [
  ['1','2','3','+'],
  ['4','5','6','−'],
  ['7','8','9','×'],
  [',','0','⌫','÷'],
]

function EditItemScreen({ item, onBack }) {
  const meta = CATEGORY_META[item.cat] || CATEGORY_META.other
  const [digits, setDigits] = useState(String(item.amount))

  function tap(k) {
    if (k === '⌫') setDigits(d => d.slice(0, -1) || '0')
    else if (['+','−','×','÷'].includes(k)) return
    else if (k === ',') setDigits(d => d.includes(',') ? d : d + ',')
    else setDigits(d => d === '0' ? k : d + k)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', paddingTop: 'var(--safe-top)',
        height: 'calc(var(--safe-top) + 62px)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 60, height: 45, borderRadius: 999,
          background: '#1C1C1E', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <div style={{ width: 32, height: 32, mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)' }}>
            <img src={IC_BACK} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
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
        <button style={{
          width: 44, height: 44, borderRadius: 999,
          background: '#1C1C1E', border: 'none', color: 'rgba(255,255,255,0.6)',
          fontSize: 18, cursor: 'pointer',
        }}>•••</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
          {item.note || meta.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif", fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '-0.6px' }}>
            -{parseInt(digits.replace(',', ''), 10).toLocaleString('ru').replace(/,/g, ' ')}
          </span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>sums</span>
        </div>
      </div>

      <div style={{ padding: '0 16px', paddingBottom: 'calc(var(--safe-bottom) + 32px)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {[['📅','Today'],['🍴', meta.label],['💳','Account']].map(([ic, lb]) => (
            <button key={lb} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '12px 14px',
              borderRadius: 999, flexShrink: 0, background: 'rgba(118,118,128,0.24)',
              border: 'none', color: '#fff', fontSize: 17, fontWeight: 500, cursor: 'pointer',
            }}>{ic} {lb} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⌄</span></button>
          ))}
        </div>
        <div style={{
          height: 50, borderRadius: 16, background: 'rgba(118,118,128,0.24)',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          color: 'rgba(255,255,255,0.6)', fontSize: 17,
        }}>Note</div>
        {NUMPAD_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 2 }}>
            {row.map(k => {
              const isPill = ['⌫','+','−','×','÷'].includes(k)
              return (
                <button key={k} onClick={() => tap(k)} style={{
                  flex: 1, height: 60, border: 'none', cursor: 'pointer',
                  borderRadius: isPill ? 999 : 16,
                  background: 'rgba(118,118,128,0.24)',
                  color: '#fff', fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px',
                }}>{k}</button>
              )
            })}
          </div>
        ))}
        <button onClick={onBack} style={{
          height: 60, borderRadius: 999, border: 'none',
          background: '#fff', color: '#1A1B1B',
          fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px', cursor: 'pointer',
        }}>
          Save
        </button>
      </div>
    </div>
  )
}
