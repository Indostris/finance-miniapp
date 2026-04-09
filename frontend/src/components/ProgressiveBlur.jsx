const TOP_LAYERS = [
  { blur: '32px', mask: 'linear-gradient(rgba(0,0,0,1) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 30%)' },
  { blur: '16px', mask: 'linear-gradient(rgba(0,0,0,1) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 40%)' },
  { blur:  '8px', mask: 'linear-gradient(rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 55%)' },
  { blur:  '4px', mask: 'linear-gradient(rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 65%)' },
  { blur:  '2px', mask: 'linear-gradient(rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 80%)' },
  { blur:  '1px', mask: 'linear-gradient(rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)' },
]
const BOT_LAYERS = [
  { blur: '32px', mask: 'linear-gradient(rgba(0,0,0,0) 70%, rgba(0,0,0,1) 90%, rgba(0,0,0,1) 100%)' },
  { blur: '16px', mask: 'linear-gradient(rgba(0,0,0,0) 60%, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)' },
  { blur:  '8px', mask: 'linear-gradient(rgba(0,0,0,0) 45%, rgba(0,0,0,1) 70%, rgba(0,0,0,1) 100%)' },
  { blur:  '4px', mask: 'linear-gradient(rgba(0,0,0,0) 35%, rgba(0,0,0,1) 60%, rgba(0,0,0,1) 100%)' },
  { blur:  '2px', mask: 'linear-gradient(rgba(0,0,0,0) 20%, rgba(0,0,0,1) 45%, rgba(0,0,0,1) 100%)' },
  { blur:  '1px', mask: 'linear-gradient(rgba(0,0,0,0) 0%,  rgba(0,0,0,1) 30%, rgba(0,0,0,1) 100%)' },
]

export default function ProgressiveBlur({ edge = 'top', height, zIndex = 5 }) {
  const top = edge === 'top'
  const layers = top ? TOP_LAYERS : BOT_LAYERS
  const defaultH = top
    ? 'calc(var(--safe-top) + 140px)'
    : 'calc(var(--safe-bottom) + 140px)'

  return (
    <div style={{
      position: 'absolute',
      ...(top ? { top: 0 } : { bottom: 0 }),
      left: 0, right: 0,
      height: height ?? defaultH,
      pointerEvents: 'none',
      zIndex,
    }}>
      {layers.map((l, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          backdropFilter: `blur(${l.blur})`,
          WebkitBackdropFilter: `blur(${l.blur})`,
          mask: l.mask,
          WebkitMask: l.mask,
        }} />
      ))}
    </div>
  )
}
