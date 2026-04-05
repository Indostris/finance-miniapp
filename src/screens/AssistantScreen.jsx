import React, { useState, useRef, useEffect, useCallback } from 'react'
import IC_BACK from '../assets/icons/ui/back.png'

// ── Mock AI parser ────────────────────────────────────────────────────────────
// Replace with real API call (Claude / OpenAI) in production

const CATEGORY_META = {
  food:        { label: 'Meal',        color: '#6155F5', icon: '🍔' },
  transport:   { label: 'Transport',   color: '#34C759', icon: '🚗' },
  grocery:     { label: 'Grocery',     color: '#FF3830', icon: '🛒' },
  home:        { label: 'Home',        color: '#0088FF', icon: '🏠' },
  clothing:    { label: 'Clothing',    color: '#FF9500', icon: '👕' },
  entertainment: { label: 'Fun',       color: '#FF2D55', icon: '🎮' },
  other:       { label: 'Other',       color: '#8E8E93', icon: '⋯'  },
}

function mockParse(text) {
  const t = text.toLowerCase()
  const results = []
  const patterns = [
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(oshga|ovqatga|taoml?|meal|food|restoran|cafe|kafe)/i, cat: 'food' },
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(taksi|taxi|avtobus|metro|transport|yo'l)/i,           cat: 'transport' },
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(oziq-ovqat|bozor|supermarket|grocery)/i,              cat: 'grocery' },
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(uy|home|kvartira|kommunal)/i,                         cat: 'home' },
    { re: /(\d[\d\s]*)\s*(so['']?m|sum)?\s*(kiyim|clothing|magazin)/i,                            cat: 'clothing' },
  ]
  // Try multi-expense "X oshga, Y ga, Z ga" pattern
  const parts = text.split(/,|;|\bva\b/)
  parts.forEach(part => {
    const amtMatch = part.match(/(\d[\d\s]{0,9})/)
    if (!amtMatch) return
    const amount = parseInt(amtMatch[1].replace(/\s/g, ''), 10)
    if (isNaN(amount) || amount <= 0) return
    let matched = false
    for (const { re, cat } of patterns) {
      if (re.test(part)) {
        results.push({ id: Date.now() + Math.random(), amount, cat, account: 'TBC Salom' })
        matched = true
        break
      }
    }
    if (!matched) results.push({ id: Date.now() + Math.random(), amount, cat: 'other', account: 'TBC Salom' })
  })
  if (results.length === 0 && /\d/.test(text)) {
    const amtMatch = text.match(/(\d[\d\s]{0,9})/)
    if (amtMatch) results.push({ id: Date.now(), amount: parseInt(amtMatch[1].replace(/\s/g,''),10), cat: 'other', account: 'TBC Salom' })
  }
  return results
}

// ── Frame 76 spark icon (empty state) ────────────────────────────────────────
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

// ── AI sparkle gradient avatar ────────────────────────────────────────────────
const AIAvatar = () => (
  <div style={{
    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
    background: 'radial-gradient(circle at 50% 25%, #C7FFF2, #95E4F5 25%, #63C8F9 50%, #4BBAFA 62%, #32ADFC 75%, #199FFD 87%, #0C98FE 94%, #0091FF)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
  }}>✦</div>
)

// ── Typing dots animation ─────────────────────────────────────────────────────
const TypingDots = () => {
  const [dot, setDot] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setDot(d => (d + 1) % 4), 420)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ letterSpacing: 1 }}>
      {'Aniqlamoqdaman' + '.'.repeat(dot)}
    </span>
  )
}

// ── Waveform bars animation (recording) ──────────────────────────────────────
const Waveform = () => {
  const bars = 28
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 40 }}>
      {Array.from({ length: bars }, (_, i) => (
        <WaveBar key={i} delay={i * 60} />
      ))}
    </div>
  )
}
const WaveBar = ({ delay }) => {
  const [h, setH] = useState(4)
  useEffect(() => {
    const id = setInterval(() => setH(4 + Math.random() * 28), 120 + delay % 200)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{
      width: 3, height: h, borderRadius: 2,
      background: '#0088FF',
      transition: 'height 0.12s ease',
    }} />
  )
}

// ── Category icon ─────────────────────────────────────────────────────────────
const CatIcon = ({ cat }) => {
  const meta = CATEGORY_META[cat] || CATEGORY_META.other
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
      background: meta.color,
      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.56) 0%, transparent 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18,
    }}>{meta.icon}</div>
  )
}

function formatAmt(n) {
  return n.toLocaleString('ru').replace(/,/g, ' ')
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AssistantScreen({ onBack }) {
  const [uiState,    setUiState]    = useState('empty')   // empty | chat | thinking | result
  const [inputText,  setInputText]  = useState('')
  const [recording,  setRecording]  = useState(false)
  const [messages,   setMessages]   = useState([])        // {role:'user'|'ai', text, items}
  const [editItem,   setEditItem]   = useState(null)
  const scrollRef      = useRef(null)
  const inputRef       = useRef(null)
  const recogRef       = useRef(null)
  const fileRef        = useRef(null)
  const transcriptRef  = useRef('')

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, uiState])

  // ── Send message ────────────────────────────────────────────────────────────
  const send = useCallback((text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setUiState('thinking')

    setTimeout(() => {
      const items = mockParse(text)
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: items.length > 0
          ? `Tayyor. Xarajatlarni tayyorladim, iltimos, hisob raqami va narxni yana bir bor tekshirib ko'ring`
          : `Kechirasiz, xarajatlarni aniqlay olmadim. Iltimos qaytadan yozing.`,
        items,
      }
      setMessages(prev => [...prev, aiMsg])
      setUiState('result')
    }, 1600)
  }, [])

  // ── Voice recording ─────────────────────────────────────────────────────────
  const startRecording = useCallback((e) => {
    e?.preventDefault()
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Голосовой ввод не поддерживается. Используйте Chrome.')
      return
    }
    transcriptRef.current = ''
    const recog = new SpeechRecognition()
    recog.lang = 'uz-UZ'
    recog.interimResults = true
    recog.continuous = true
    recog.onresult = (ev) => {
      const transcript = Array.from(ev.results).map(r => r[0].transcript).join('')
      transcriptRef.current = transcript
      setInputText(transcript)
      if (uiState === 'empty' && transcript) setUiState('chat')
    }
    recog.onend = () => {
      setRecording(false)
      recogRef.current = null
      const text = transcriptRef.current.trim()
      if (text) {
        send(text)
        setInputText('')
        transcriptRef.current = ''
      }
    }
    recog.onerror = () => {
      setRecording(false)
      recogRef.current = null
    }
    recog.start()
    recogRef.current = recog
    setRecording(true)

    // Stop on pointerup anywhere on screen (finger may have moved off button)
    const handleUp = () => {
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('touchend', handleUp)
      recogRef.current?.stop()
    }
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('touchend', handleUp)
  }, [send, uiState])

  const stopRecording = useCallback(() => {
    recogRef.current?.stop()
  }, [])

  // ── Add transactions ────────────────────────────────────────────────────────
  const addAll = useCallback((items) => {
    // In production: save to DB / state
    setMessages(prev => prev.map(m =>
      m.role === 'ai' && m.items ? { ...m, added: true } : m
    ))
  }, [])

  // ── If editing a single item ────────────────────────────────────────────────
  if (editItem) {
    return <EditItemScreen item={editItem} onBack={() => setEditItem(null)} />
  }

  const isEmpty = uiState === 'empty'
  const isThinking = uiState === 'thinking'
  const lastAI = [...messages].reverse().find(m => m.role === 'ai' && m.items?.length > 0)

  return (
    <div data-file="src/screens/AssistantScreen.jsx" style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Nav ──────────────────────────────────────────────────────────── */}
      <div style={{
        paddingTop: 'calc(var(--safe-top) + 10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 'calc(var(--safe-top) + 62px)',
        paddingTop: 'var(--safe-top)', flexShrink: 0,
        zIndex: 5,
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

      {/* ── Content area ─────────────────────────────────────────────────────── */}
      {isEmpty ? (
        /* EMPTY STATE */
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
        /* CHAT MESSAGES */
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0, scrollbarWidth: 'none' }}>
          {messages.map((msg, i) => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                /* User bubble — white, right */
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, paddingLeft: 64 }}>
                  <div style={{
                    background: '#fff', color: '#000',
                    padding: '8px 10px', borderRadius: 16,
                    fontSize: 17, letterSpacing: '-0.75px', lineHeight: '22px',
                    position: 'relative',
                  }}>
                    {msg.text}
                    {/* tail */}
                    <div style={{ position: 'absolute', bottom: -1, right: -4, width: 16, height: 17, overflow: 'hidden' }}>
                      <svg viewBox="0 0 16 17" width="16" height="17"><path d="M16 17 Q0 17 0 0 L16 0Z" fill="white"/></svg>
                    </div>
                  </div>
                </div>
              ) : (
                /* AI message */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, paddingRight: 64 }}>
                  {/* AI bubble */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <AIAvatar />
                    <div style={{
                      background: '#1C1C1E', color: '#fff',
                      padding: '8px 10px', borderRadius: 16,
                      fontSize: 17, letterSpacing: '-0.75px', lineHeight: '22px',
                      position: 'relative',
                    }}>
                      {msg.text}
                      {/* tail */}
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
                          <div key={item.id} style={{
                            background: '#1C1C1E', borderRadius: 20, height: 64,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0 12px', cursor: 'pointer',
                          }} onClick={() => setEditItem(item)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <CatIcon cat={item.cat} />
                              <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.5px', color: '#fff' }}>
                                {meta.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: '-0.75px' }}>
                                  -{formatAmt(item.amount)} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>sums</span>
                                </div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{item.account}</div>
                              </div>
                              {/* Edit pencil icon */}
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

                      {/* Add all button */}
                      {!msg.added && (
                        <button onClick={() => addAll(msg.items)} style={{
                          width: '100%', height: 60, borderRadius: 999,
                          background: '#0088FF', border: 'none', color: '#fff',
                          fontSize: 17, fontWeight: 500, cursor: 'pointer',
                          letterSpacing: '-0.43px', marginTop: 2,
                        }}>
                          Add {msg.items.length} Transaction{msg.items.length > 1 ? 's' : ''}
                        </button>
                      )}
                      {msg.added && (
                        <div style={{
                          textAlign: 'center', padding: '10px',
                          fontSize: 15, color: '#00E8B3', letterSpacing: '-0.3px',
                        }}>
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
          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingRight: 64 }}>
              <AIAvatar />
              <div style={{
                background: '#1C1C1E', color: 'rgba(255,255,255,0.6)',
                padding: '8px 12px', borderRadius: 16,
                fontSize: 17, letterSpacing: '-0.43px',
                position: 'relative',
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

      {/* ── Write Bar ────────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: 6,
        padding: '4px 16px',
        paddingBottom: 'calc(var(--safe-bottom) + 8px)',
      }}>
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) {
              const name = file.name
              setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: `📎 ${name}` }])
              if (uiState === 'empty') setUiState('chat')
            }
            e.target.value = ''
          }}
        />

        {/* LEFT: Attach (+) button */}
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: 42, height: 42, borderRadius: 999, flexShrink: 0,
            background: '#1C1C1E',
            border: 'none', color: 'rgba(255,255,255,0.6)',
            fontSize: 22, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          +
        </button>

        {/* MIDDLE: Input field or waveform */}
        <div style={{
          flex: 1, minHeight: 42, borderRadius: 21,
          background: '#1C1C1E', display: 'flex', alignItems: 'center',
          padding: '3px',
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

        {/* RIGHT: Send (↑) when text typed, mic (🎙) on hold when no text */}
        <button
          onClick={inputText.trim() ? () => send(inputText) : undefined}
          onPointerDown={!inputText.trim() ? startRecording : undefined}
          style={{
            width: 42, height: 42, borderRadius: 999, flexShrink: 0,
            background: recording ? '#FF3B30' : inputText.trim() ? '#0088FF' : '#1C1C1E',
            border: 'none', color: '#fff',
            fontSize: inputText.trim() ? 20 : 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
            userSelect: 'none', WebkitUserSelect: 'none',
          }}
        >
          {inputText.trim() ? '↑' : recording ? '◼' : '🎙'}
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
      {/* Toolbar */}
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

        {/* Type switcher */}
        <div style={{ display: 'flex', background: '#1C1C1E', borderRadius: 999, padding: 4, gap: 2 }}>
          {['+','⇄','↓','→'].map((ic,i) => (
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

      {/* Amount display */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>New expense</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif", fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '-0.6px' }}>
            -{parseInt(digits.replace(',',''), 10).toLocaleString('ru').replace(/,/g,' ')}
          </span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>sums</span>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ padding: '0 16px', paddingBottom: 'calc(var(--safe-bottom) + 32px)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Chips */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {[['📅','Today'],['🍴', meta.label],['💳','TBC']].map(([ic,lb]) => (
            <button key={lb} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '12px 14px',
              borderRadius: 999, flexShrink: 0, background: 'rgba(118,118,128,0.24)',
              border: 'none', color: '#fff', fontSize: 17, fontWeight: 500, cursor: 'pointer',
            }}>{ic} {lb} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>⌄</span></button>
          ))}
        </div>

        {/* Note */}
        <div style={{
          height: 50, borderRadius: 16, background: 'rgba(118,118,128,0.24)',
          display: 'flex', alignItems: 'center', padding: '0 16px',
          color: 'rgba(255,255,255,0.6)', fontSize: 17,
        }}>Note</div>

        {/* Numpad */}
        {NUMPAD_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 2 }}>
            {row.map(k => {
              const isPill = ['⌫','+','−','×','÷'].includes(k)
              return (
                <button key={k} onClick={() => tap(k)} style={{
                  flex: 1, height: 60, borderRadius: isPill ? 999 : 16,
                  background: 'rgba(118,118,128,0.24)', border: 'none',
                  color: '#fff', fontSize: 20, fontWeight: 500, cursor: 'pointer',
                }}>{k}</button>
              )
            })}
          </div>
        ))}

        {/* Save */}
        <button onClick={onBack} style={{
          height: 60, borderRadius: 999, background: '#fff',
          border: 'none', color: '#1A1B1B', fontSize: 17,
          fontWeight: 500, cursor: 'pointer',
        }}>Save</button>
      </div>
    </div>
  )
}
