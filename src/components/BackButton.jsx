import React, { useState } from 'react'

export default function BackButton({ onClick }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick?.() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '60px', height: '45px', borderRadius: '999px',
        background: '#1C1C1E', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '18px', fontWeight: 600,
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.12s',
      }}
    >
      ‹
    </button>
  )
}
