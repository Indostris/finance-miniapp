import React, { useState } from 'react'

// U+100188 = SF Symbol chevron (points right by default)
// rotate(-90deg) makes it point left ←
const CHEVRON = '\u{100188}'

export default function BackButton({ onClick }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick?.() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: 60, height: 45, borderRadius: 999,
        background: '#1C1C1E', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
        transition: 'opacity 0.12s',
      }}
    >
      <span style={{
        fontFamily: "'SF Pro Symbols', -apple-system, sans-serif",
        fontSize: 14, color: '#fff',
        display: 'inline-block',
        transform: 'rotate(-90deg)',
        fontFeatureSettings: "'ss16' 1",
        lineHeight: '30px',
        mixBlendMode: 'plus-lighter',
        pointerEvents: 'none',
      }}>
        {CHEVRON}
      </span>
    </button>
  )
}
