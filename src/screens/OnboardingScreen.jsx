import React, { useState, useEffect } from 'react'

const CATEGORIES = [
  { label: 'Tushumlar', color: '#0088FF',  icon: '↓' },
  { label: 'Chiqimlar', color: '#FF9500',  icon: '↗' },
  { label: 'Qarzlar',   color: '#FF3B30',  icon: '💳' },
]

const styles = {
  root: {
    position: 'absolute', inset: 0,
    background: '#000',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute', bottom: '-20%', left: '50%',
    transform: 'translateX(-50%)',
    width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,136,255,0.22) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  slotWrap: {
    paddingTop: 'calc(var(--safe-top) + 110px)',
    paddingLeft: '30px',
    paddingRight: '30px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    overflow: 'hidden',
  },
  dimLabel: {
    fontSize: '40px', fontWeight: 700,
    color: 'rgba(255,255,255,0.20)',
    lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden',
  },
  activeRow: {
    display: 'flex', alignItems: 'center', gap: '14px',
  },
  catIcon: (color) => ({
    width: '60px', height: '60px', borderRadius: '16px',
    background: color,
    backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, transparent 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '26px', flexShrink: 0,
    transition: 'opacity 0.28s, transform 0.28s',
  }),
  activeLabel: {
    fontSize: '48px', fontWeight: 900,
    color: '#fff', lineHeight: 1.1,
    whiteSpace: 'nowrap',
    transition: 'opacity 0.28s, transform 0.28s',
  },
  bottom: {
    display: 'flex', flexDirection: 'column', gap: 0,
    paddingBottom: 'calc(var(--safe-bottom) + 45px)',
  },
  featureCard: {
    display: 'flex', flexDirection: 'column', gap: '10px',
    padding: '0 30px 28px',
  },
  appIconPill: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.12)',
    border: '0.5px solid rgba(255,255,255,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px',
  },
  featureTitle: {
    fontSize: '22px', fontWeight: 600, letterSpacing: '-0.5px',
    color: '#fff',
  },
  featureDesc: {
    fontSize: '13px', color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.5, maxWidth: '264px',
  },
  buttons: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    padding: '0 16px',
  },
  btnWhite: {
    height: '60px', borderRadius: '999px',
    background: '#fff', color: '#1A1B1B',
    fontSize: '17px', fontWeight: 500, letterSpacing: '-0.43px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.12s', cursor: 'pointer',
  },
  btnBlue: {
    height: '60px', borderRadius: '999px',
    background: 'rgba(0,136,255,0.16)', color: '#0088FF',
    fontSize: '17px', fontWeight: 500, letterSpacing: '-0.43px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.12s', cursor: 'pointer',
  },
}

function PressableButton({ style, onClick, children }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      style={{ ...style, transform: pressed ? 'scale(0.97)' : 'scale(1)', border: 'none', outline: 'none' }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick?.() }}
      onPointerLeave={() => setPressed(false)}
    >
      {children}
    </button>
  )
}

export default function OnboardingScreen({ onPhone, onEmail }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx(i => (i + 1) % CATEGORIES.length)
      setAnimKey(k => k + 1)
    }, 2400)
    return () => clearInterval(id)
  }, [])

  const prev = (activeIdx - 1 + CATEGORIES.length) % CATEGORIES.length
  const next = (activeIdx + 1) % CATEGORIES.length
  const cat  = CATEGORIES[activeIdx]

  return (
    <div style={styles.root}>
      <div style={styles.glow} />

      {/* Slot */}
      <div style={styles.slotWrap}>
        <div key={`prev-${animKey}`} style={styles.dimLabel}>
          {CATEGORIES[prev].label}
        </div>

        <div style={styles.activeRow}>
          <div key={`icon-${animKey}`} style={styles.catIcon(cat.color)}>
            {cat.icon}
          </div>
          <div key={`lbl-${animKey}`} style={styles.activeLabel}>
            {cat.label}
          </div>
        </div>

        <div key={`next-${animKey}`} style={styles.dimLabel}>
          {CATEGORIES[next].label}
        </div>
      </div>

      {/* Bottom */}
      <div style={styles.bottom}>
        <div style={styles.featureCard}>
          <div style={styles.appIconPill}>💬</div>
          <div style={styles.featureTitle}>Pullarningiz ko'z oldingizda</div>
          <div style={styles.featureDesc}>
            Kategoriyalar bo'yicha limitlar belgilang.{'\n'}
            Bu xarajatlarni nazorat qilishga yordam beradi.
          </div>
        </div>

        <div style={styles.buttons}>
          <PressableButton style={styles.btnWhite} onClick={onPhone}>
            Telefon raqam orqali kirish
          </PressableButton>
          <PressableButton style={styles.btnBlue} onClick={onEmail}>
            E-mail orqali kirish
          </PressableButton>
        </div>
      </div>
    </div>
  )
}
