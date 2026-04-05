import React, { useState, useRef, useEffect, useCallback } from 'react'

const API = 'https://graham-salaries-trips-follow.trycloudflare.com'

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

export default function AssistantScreen({ onBack }) {
  const [uiState,   setUiState]   = useState('empty')
  const [inputText, setInputText] = useState('')
  const [recording, setRecording] = useState(false)
  const [messages,  setMessages]  = useState([])
  const [editItem,  setEditItem]  = useState(null)
  const scrollRef        = useRef(null)
  const inputRef         = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])

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
        amount: parseInt(item.amount) || 0,
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
            amount: parseInt(item.amount) || 0,
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

  const addAll = useCallback(() => {
    setMessages(prev => prev.map(m =>
      m.role === 'ai' && m.items ? { ...m, added: true } : m
    ))
  }, [])

  if (editItem) {
    return <EditItemScreen item={editItem} onBack={() => setEditItem(null)} />
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
                        <button onClick={() => addAll()} style={{
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
          onClick={handleMicPress}
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
            onClick={() => inputText.trim() ? send(inputText) : handleMicPress()}
            style={{
              width: 28, height: 36, background: 'none', border: 'none',
              color: inputText.trim() ? '#0088FF' : 'rgba(255,255,255,0.3)',
              fontSize: 18, cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s',
            }}
          >
            {inputText.trim() ? '↑' : '🎙'}
          </button>
        </div>
      </div>
    </div>
  )
}

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
          width: 44, height: 44, borderRadius: 999,
          background: '#1C1C1E', border: 'none', color: '#fff',
          fontSize: 18, cursor: 'pointer',
        }}>‹</button>

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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>New expense</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '-0.6px' }}>
            -{parseInt(digits.replace(',',''), 10).toLocaleString('ru').replace(/,/g,' ')}
          </span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>sums</span>
        </div>
      </div>

      <div style={{ padding: '0 16px', paddingBottom: 'calc(var(--safe-bottom) + 32px)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {[['📅','Today'],['🍴', meta.label],['💳','TBC']].map(([ic,lb]) => (
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
                  flex: 1, height: 60, borderRadius: isPill ? 999 : 16,
                  background: 'rgba(118,118,128,0.24)', border: 'none',
                  color: '#fff', fontSize: 20, fontWeight: 500, cursor: 'pointer',
                }}>{k}</button>
              )
            })}
          </div>
        ))}

        <button onClick={onBack} style={{
          height: 60, borderRadius: 999, background: '#fff',
          border: 'none', color: '#1A1B1B', fontSize: 17,
          fontWeight: 500, cursor: 'pointer',
        }}>Save</button>
      </div>
    </div>
  )
}
