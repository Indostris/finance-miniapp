import React, { useState, useRef, useEffect, useCallback } from 'react'

const API = 'https://chancellor-night-express-delhi.trycloudflare.com'

const CATEGORY_META = {
  food:          { label: 'Meal',          color: '#6155F5', icon: '🍔' },
  transport:     { label: 'Transport',     color: '#34C759', icon: '🚗' },
  grocery:       { label: 'Grocery',       color: '#FF3830', icon: '🛒' },
  home:          { label: 'Home',          color: '#0088FF', icon: '🏠' },
  clothing:      { label: 'Clothing',      color: '#FF9500', icon: '👕' },
  entertainment: { label: 'Fun',           color: '#FF2D55', icon: '🎮' },
  shopping:      { label: 'Shopping',      color: '#FF9500', icon: '🛍️' },
  health:        { label: 'Health',        color: '#30D158', icon: '💊' },
  education:     { label: 'Education',     color: '#0088FF', icon: '📚' },
  utilities:     { label: 'Utilities',     color: '#636366', icon: '💡' },
  other:         { label: 'Other',         color: '#8E8E93', icon: '⋯'  },
}

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
  return (
    <span style={{ letterSpacing: 1 }}>
      {'Aniqlamoqdaman' + '.'.repeat(dot)}
    </span>
  )
}
const Waveform = () => (
  <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 40 }}>
    {Array.from({ length: 28 }, (_, i) => (
      <WaveBar key={i} delay={i * 60} />
    ))}
  </div>
)

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

const CatIcon = ({ cat, categoryMeta }) => {
  const meta = (categoryMeta || CATEGORY_META)[cat] || (categoryMeta || CATEGORY_META).other || { color: '#8E8E93', icon: '⋯' }
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

export default function AssistantScreen({ onBack, userId, accounts = [] }) {
  const [uiState,      setUiState]      = useState('empty')
  const [inputText,    setInputText]    = useState('')
  const [recording,    setRecording]    = useState(false)
  const [messages,     setMessages]     = useState([])
  const [editItem,     setEditItem]     = useState(null)
  const [categoryMeta, setCategoryMeta] = useState(CATEGORY_META)
  const scrollRef        = useRef(null)
  const inputRef         = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])
  const cancelledRef     = useRef(false)

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(list => {
        const map = {}
        list.forEach(c => { map[c.key] = { label: c.label, color: c.color, icon: c.icon } })
        setCategoryMeta(map)
      })
      .catch(() => {/* keep fallback CATEGORY_META */})
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, uiState])

  const send = useCallback(async (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setUiState('thinking')

    try {
      const response = await fetch(`${API}/text_separate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      })
      const data = await response.json()
      console.log('API response:', data)

      const raw = Array.isArray(data.result) ? data.result : []
      const items = raw.map(item => ({
        ...item,
        id: Date.now() + Math.random(),
        cat: item.category ?? 'other',
        amount: Math.round(Number(String(item.amount).replace(/\s/g, '').replace(/,/g, ''))) || 0,
      })).filter(item => item.amount > 0)

      console.log('Items:', items)

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
    } catch (err) {
      console.error('API error:', err)
      setUiState('result')
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        if (cancelledRef.current) {
          cancelledRef.current = false
          return // user cancelled — discard audio
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('file', audioBlob, 'recording.webm')
        setUiState('thinking')

        try {
          const transcribeRes = await fetch(`${API}/transcribe_audio`, {
            method: 'POST',
            body: formData
          })
          const transcribeData = await transcribeRes.json()
          const transcribedText = transcribeData.result

          if (!transcribedText) {
            setUiState('idle')
            return
          }

          const userMsg = { id: Date.now(), role: 'user', text: transcribedText }
          setMessages(prev => [...prev, userMsg])

          const extractRes = await fetch(`${API}/text_separate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcribedText })
          })
          const extractData = await extractRes.json()
          console.log('Voice API response:', extractData)

          const raw = Array.isArray(extractData.result) ? extractData.result : []
          const items = raw.map(item => ({
            ...item,
            id: Date.now() + Math.random(),
            cat: item.category ?? 'other',
            amount: Math.round(Number(String(item.amount).replace(/\s/g, '').replace(/,/g, ''))) || 0,
          })).filter(item => item.amount > 0)

          console.log('Voice items:', items)

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

        } catch (err) {
          console.error('Error:', err)
          setUiState('idle')
        }
      }
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setRecording(true)
    } catch (err) {
      console.error('Microphone error:', err)
      alert('Mikrofonga ruxsat berilmadi.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    // stop + process audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }, [])

  const cancelRecording = useCallback(() => {
    // stop + discard audio, no processing
    cancelledRef.current = true
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }, [])

  const handleMicPress = useCallback(() => {
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [recording, startRecording, stopRecording])

  const addAll = useCallback(async (msgId, items) => {
    const body = {
      user_id: Number(userId),
      source: 'ai',
      items: items.map(item => ({
        category_key: item.cat && item.cat !== 'other' ? item.cat : null,
        type: 'expense',
        amount: Math.round(Number(item.amount)),
        note: item.note ? String(item.note) : null,
        account_id: accounts.length > 0 ? Number(accounts[0].id) : null,
      })),
    }
    console.log('[addAll] sending:', JSON.stringify(body))
    try {
      const res = await fetch(`${API}/transactions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const detail = await res.json()
        console.error('[addAll] error:', JSON.stringify(detail))
        return
      }
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, added: true } : m))
    } catch (err) {
      console.error('[addAll] network error:', err)
    }
  }, [userId, accounts])

  const handleSaveEdit = useCallback((updatedItem) => {
    setMessages(prev => prev.map(msg => {
      if (!msg.items) return msg
      return { ...msg, items: msg.items.map(it => it.id === updatedItem.id ? updatedItem : it) }
    }))
  }, [])

  if (editItem) {
    return <EditItemScreen item={editItem} onBack={() => setEditItem(null)} onSave={handleSaveEdit} categoryMeta={categoryMeta} />
  }

  const isEmpty = uiState === 'empty'
  const isThinking = uiState === 'thinking'

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 'calc(var(--safe-top) + 62px)',
        paddingTop: 'var(--safe-top)', flexShrink: 0,
        zIndex: 5,
      }}>
        <button onClick={onBack} style={{
          width: 60, height: 45, borderRadius: 999,
          background: '#1C1C1E', border: 'none', color: '#fff',
          fontSize: 16, cursor: 'pointer',
        }}>‹</button>

        <span style={{ fontSize: 17, color: '#fff', letterSpacing: '-0.43px' }}>New chat</span>

        <button style={{
          width: 60, height: 45, borderRadius: 999,
          background: '#1C1C1E', border: 'none', color: 'rgba(255,255,255,0.6)',
          fontSize: 16, cursor: 'pointer',
        }}>≡</button>
      </div>

      {isEmpty ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 12 }}>
          <div style={{ fontSize: 60 }}>✦</div>
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
          {messages.map((msg) => (
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
                        const meta = categoryMeta[item.cat] || categoryMeta.other || { label: 'Other' }
                        return (
                          <div key={item.id} style={{
                            background: '#1C1C1E', borderRadius: 20, height: 64,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0 12px', cursor: 'pointer',
                          }} onClick={() => setEditItem(item)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <CatIcon cat={item.cat} categoryMeta={categoryMeta} />
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

                      {!msg.added && (
                        <button onClick={() => addAll(msg.id, msg.items)} style={{
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

      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: 6,
        padding: '4px 16px',
        paddingBottom: 'calc(var(--safe-bottom) + 8px)',
      }}>
        <button
          onClick={recording ? cancelRecording : handleMicPress}
          style={{
            width: 42, height: 42, borderRadius: 999, flexShrink: 0,
            background: recording ? '#FF3B30' : '#1C1C1E',
            border: 'none', color: 'rgba(255,255,255,0.6)',
            fontSize: 20, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
        >
          {recording ? '◼' : '+'}
        </button>

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

          <button
            onClick={() => recording ? stopRecording() : inputText.trim() ? send(inputText) : handleMicPress()}
            style={{
              width: 28, height: 36, background: 'none', border: 'none',
              color: recording || inputText.trim() ? '#0088FF' : 'rgba(255,255,255,0.3)',
              fontSize: 18, cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s',
            }}
          >
            {recording ? '↑' : inputText.trim() ? '↑' : '🎙'}
          </button>
        </div>
      </div>
    </div>
  )
}

import {
  IC_TYPE_ADD, IC_TYPE_TRN, IC_TYPE_INC, IC_MORE,
  IC_CALENDAR, IC_DOTS, IC_CARD, IC_CHEVRON, IC_DELETE,
} from '../icons'

const EDIT_NAV_TYPES = [
  { key: 'Expense',  icon: IC_TYPE_ADD },
  { key: 'Transfer', icon: IC_TYPE_TRN },
  { key: 'Income',   icon: IC_TYPE_INC },
]

const EDIT_CHIPS = [
  { label: 'Today', icon: IC_CALENDAR },
  { label: 'Other', icon: IC_DOTS     },
  { label: 'Visa',  icon: IC_CARD     },
]

const EDIT_ROWS = [
  [['1',false],['2',false],['3',false],['+',true ]],
  [['4',false],['5',false],['6',false],['−',true ]],
  [['7',false],['8',false],['9',false],['×',true ]],
  [[',',false],['0',false],['⌫',true ],['÷',true ]],
]

function EditNumKey({ label, pill, onTap }) {
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
        color: '#fff', fontSize: 17, fontWeight: 510,
        letterSpacing: '-0.43px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: pressed ? 0.55 : 1,
        transition: 'opacity 0.1s',
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

function EditItemScreen({ item, onBack, onSave, categoryMeta }) {
  const meta = (categoryMeta || CATEGORY_META)[item.cat] || (categoryMeta || CATEGORY_META).other || { label: 'Other' }
  const [digits, setDigits] = useState(String(item.amount))
  const [note,   setNote]   = useState(item.note || '')
  const [type,   setType]   = useState('Expense')

  const displayAmt = (() => {
    const raw = digits.replace(/,/g, '').replace(/\s/g, '')
    if (!raw) return '0'
    return parseInt(raw, 10).toLocaleString('en').replace(/,/g, ' ')
  })()

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

  function handleSave() {
    const amount = parseInt(digits.replace(',', ''), 10) || 0
    onSave({ ...item, amount, note })
    onBack()
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>

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
          onClick={onBack}
          style={{
            width: 60, height: 45, borderRadius: 999,
            background: '#1C1C1E', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <span style={{
            fontSize: 14, color: '#fff',
            display: 'inline-block', transform: 'rotate(-90deg)', lineHeight: '30px',
          }}>{'\u{100188}'}</span>
        </button>

        <div style={{
          background: '#1C1C1E', borderRadius: 999,
          padding: 4, display: 'flex', gap: 0, flexShrink: 0,
        }}>
          {EDIT_NAV_TYPES.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setType(key)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', cursor: 'pointer',
                background: key === type ? 'rgba(118,118,128,0.24)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <img src={icon} alt={key} style={{ width: 32, height: 32 }} />
            </button>
          ))}
        </div>

        <div style={{ width: 60, height: 45, borderRadius: 999, overflow: 'hidden', flexShrink: 0 }}>
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
          fontSize: 16, color: 'rgba(235,235,245,0.6)',
          marginBottom: 12, letterSpacing: '-0.31px',
        }}>
          Edit expense
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: displayAmt.length > 8 ? 32 : 40,
            fontWeight: 700, color: '#fff',
            letterSpacing: '-0.6px', lineHeight: '41px',
            transition: 'font-size 0.15s',
          }}>
            {displayAmt}
          </span>
          <span style={{ fontSize: 20, color: 'rgba(235,235,245,0.6)', letterSpacing: '-0.45px' }}>
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
          {EDIT_CHIPS.map(({ label, icon }) => (
            <button
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '13px 16px', borderRadius: 999, flexShrink: 0,
                background: 'rgba(118,118,128,0.24)', border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: 17, fontWeight: 510,
              }}
            >
              <img src={icon} alt={label} style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
              {label}
              <img src={IC_CHEVRON} alt="" style={{ width: 28, height: 28, mixBlendMode: 'plus-lighter' }} />
            </button>
          ))}
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
              background: 'none', border: 'none', outline: 'none',
              color: '#fff',
            }}
          />
        </div>

        {/* Numpad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EDIT_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 2 }}>
              {row.map(([label, pill], ci) => (
                <EditNumKey key={ci} label={label} pill={pill} onTap={() => tap(label)} />
              ))}
            </div>
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            height: 60, borderRadius: 999, border: 'none',
            background: '#fff', color: '#1A1B1B',
            fontSize: 17, fontWeight: 510, letterSpacing: '-0.43px', cursor: 'pointer',
          }}
        >
          Save expense
        </button>
      </div>
    </div>
  )
}

