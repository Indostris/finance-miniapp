import { useState } from 'react'
import IC_BACK         from '../assets/icons/ui/back.svg'
import BG_VECTOR       from '../assets/subscription/bg-vector.svg'
import USER_PHOTO      from '../assets/subscription/user-photo.png'
import CROWN_BADGE     from '../assets/subscription/crown-badge.svg'
import FEATURE_ICON    from '../assets/subscription/feature-icon.svg'
import CHECKMARK       from '../assets/subscription/checkmark.svg'
import WATERMARK_CROWN from '../assets/subscription/watermark-crown.svg'
import BLUR_TOP        from '../assets/subscription/blur-top.svg'
import BLUR_BOTTOM     from '../assets/subscription/blur-bottom.svg'

const SF       = "'SF Pro', -apple-system, sans-serif"
const SF_ROUND = "'SF Pro Rounded', -apple-system, sans-serif"

// Exact watermark positions from Figma
const WATERMARKS = [
  { left: 66.06, top: 87   },
  { left: 19,    top: 153  },
  { left: 66.06, top: 223  },
  { left: 294.06,top: 87   },
  { left: 232.06,top: 64   },
  { left: 127.06,top: 64   },
  { left: 104,   top: 115  },
  { left: 105,   top: 189  },
  { left: 254,   top: 115  },
  { left: 180.06,top: 87   },
  { left: 294.06,top: 153  },
  { left: 340.46,top: 153  },
  { left: 254,   top: 189  },
  { left: 294.06,top: 223  },
]

const FEATURES = [
  { title: 'Unlimited Wallets',      desc: 'Add as many wallets and accounts as you need with no restrictions.' },
  { title: 'Smart Categories',       desc: 'Create custom spending categories and get AI-powered insights.' },
  { title: 'Advanced Analytics',     desc: 'Detailed monthly reports and charts to track your financial health.' },
  { title: 'Priority Support',       desc: 'Get help faster with dedicated priority customer support.' },
  { title: 'AI Finance Assistant',   desc: 'Unlimited AI-powered expense tracking and personal finance advice.' },
]

export default function SubscriptionScreen({ onClose }) {
  const [selected, setSelected] = useState('monthly')

  const ctaText = selected === 'weekly'   ? 'Purchase for $7/week'
                : selected === 'monthly'  ? 'Purchase for $10/month'
                : 'Purchase for $15/3 months'

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      zIndex: 30, overflow: 'hidden',
    }}>

      {/* Blue gradient circle background — from Figma */}
      <div style={{
        position: 'absolute',
        left: 'calc(50% + 9.79px)',
        top: '-37.19%',
        bottom: '23.05%',
        width: 997.579,
        transform: 'translateX(-50%)',
        opacity: 0.9,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <img src={BG_VECTOR} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Crown watermarks — exact positions from Figma */}
      {WATERMARKS.map((w, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: w.left, top: w.top,
          width: 42.455, height: 42.455,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 0,
        }}>
          <div style={{ transform: 'rotate(17deg)', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, overflow: 'hidden', position: 'relative' }}>
              <img src={WATERMARK_CROWN} alt="" style={{
                position: 'absolute',
                width: 30, height: 23,
                left: '50%', top: 'calc(50% + 0.5px)',
                transform: 'translate(-50%, -50%)',
                display: 'block',
              }} />
            </div>
          </div>
        </div>
      ))}

      {/* Top blur overlay (scroll edge) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
        zIndex: 3, pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: '#000',
          backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          mixBlendMode: 'screen', opacity: 0.9,
          maskImage: `url(${BLUR_TOP})`,
          WebkitMaskImage: `url(${BLUR_TOP})`,
          maskSize: '100% 100%', WebkitMaskSize: '100% 100%',
        }} />
      </div>

      {/* Status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '21px 16px 19px', zIndex: 4, pointerEvents: 'none',
      }}>
        <span style={{ fontFamily: SF, fontSize: 17, fontWeight: 590, color: '#fff', flex: 1, textAlign: 'center', letterSpacing: '-0.4px' }}>9:41</span>
      </div>

      {/* Nav — back button */}
      <div style={{
        position: 'absolute', top: 62, left: 0, right: 0, height: 52,
        display: 'flex', alignItems: 'center', padding: '0 16px',
        zIndex: 4,
      }}>
        <button onClick={onClose} style={{
          width: 60, height: 45, borderRadius: 999,
          background: 'rgba(255,255,255,0.12)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ transform: 'rotate(90deg)', mixBlendMode: 'plus-lighter', display: 'flex', pointerEvents: 'none' }}>
            <img src={IC_BACK} alt="" style={{ width: 32, height: 32 }} />
          </div>
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{
        position: 'absolute', inset: 0,
        overflowY: 'auto', scrollbarWidth: 'none',
        zIndex: 1,
      }}>
        <div style={{ paddingTop: 114, paddingBottom: 40 }}>

          {/* Avatar + Title group — top: 114 in Figma */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 14,
            padding: '10px 10px 0',
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
              <div style={{
                width: 130, height: 130, borderRadius: 45,
                border: '2.5px solid rgba(255,255,255,0.6)',
                background: '#0089e4',
                overflow: 'hidden', position: 'relative',
                boxSizing: 'border-box',
              }}>
                {/* Inner white container */}
                <div style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 120, height: 120,
                  borderRadius: 40,
                  background: '#fff',
                  overflow: 'hidden',
                }}>
                  {/* Photo positioned like Figma: left -11px, top -34px, 142x199 */}
                  <div style={{ position: 'absolute', left: -11, top: -34, width: 142, height: 199 }}>
                    <img src={USER_PHOTO} alt="" style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover', pointerEvents: 'none',
                    }} />
                  </div>
                </div>
              </div>

              {/* Crown badge — white bg, blue border, crown icon rotated 17deg */}
              <div style={{
                position: 'absolute', top: -12.5, right: -8.5,
                width: 45, height: 45, borderRadius: 22.5,
                background: '#fff',
                border: '3px solid #0089e4',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Screen-blend gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0) 100%)',
                  mixBlendMode: 'screen', pointerEvents: 'none',
                }} />
                {/* Crown icon */}
                <div style={{ transform: 'rotate(17deg)', display: 'flex', position: 'relative' }}>
                  <img src={CROWN_BADGE} alt="" style={{ width: 30, height: 23, display: 'block', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <div style={{
              fontFamily: SF_ROUND, fontSize: 40, fontWeight: 700,
              lineHeight: '41px', letterSpacing: '-0.6px',
              color: '#fff', textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              <p style={{ margin: 0, lineHeight: '41px' }}>No limits</p>
              <p style={{ margin: 0, lineHeight: '41px' }}>with Finance Pro</p>
            </div>
          </div>

          {/* Feature cards — gap 22 from avatar group, gap 4 between cards */}
          <div style={{
            margin: '22px 10px 0',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 32,
                padding: 16,
                display: 'flex', gap: 16, alignItems: 'center',
              }}>
                <img src={FEATURE_ICON} alt="" style={{ width: 24, height: 24, flexShrink: 0, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <span style={{
                    fontFamily: SF, fontSize: 16, fontWeight: 510,
                    letterSpacing: '-0.5px', color: '#fff', lineHeight: '21px',
                  }}>{f.title}</span>
                  <span style={{
                    fontFamily: SF, fontSize: 12, fontWeight: 400,
                    color: 'rgba(255,255,255,0.5)', lineHeight: '16px',
                  }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing + CTA — margin-top 16 from feature cards */}
          <div style={{ margin: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 3 plan cards */}
            <div style={{ display: 'flex', gap: 4 }}>
              {/* Weekly */}
              <PlanCard
                id="weekly" selected={selected} onSelect={setSelected}
                price="$7" period="/week" daily="$1/day"
              />
              {/* Monthly (active by default) */}
              <PlanCard
                id="monthly" selected={selected} onSelect={setSelected}
                price="$10" period="/мес" daily="$0.3/day"
                checkmarkSrc={CHECKMARK}
              />
              {/* 3 Months */}
              <PlanCard
                id="quarter" selected={selected} onSelect={setSelected}
                price="$15" period="/month" daily="$0.5/day"
                badge="-28%"
              />
            </div>

            {/* CTA + Disclaimer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button style={{
                width: '100%', height: 60, borderRadius: 100,
                background: '#0091ff',
                border: 'none', cursor: 'pointer',
                overflow: 'hidden', position: 'relative',
                fontFamily: SF, fontSize: 17, fontWeight: 510,
                color: '#fff', letterSpacing: '-0.4px', lineHeight: '22px',
              }}>
                {ctaText}
              </button>

              <p style={{
                fontFamily: SF, fontSize: 13, fontWeight: 400,
                letterSpacing: '-0.5px', color: 'rgba(255,255,255,0.6)',
                textAlign: 'center', margin: 0, lineHeight: '18px',
              }}>
                You can pay with a foreign card. No automatic charges — only honest payment for the selected period.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom blur overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 102,
        transform: 'rotate(180deg) scaleX(-1)',
        pointerEvents: 'none', zIndex: 3,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: '#000',
          backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          mixBlendMode: 'screen', opacity: 0.9,
          maskImage: `url(${BLUR_BOTTOM})`,
          WebkitMaskImage: `url(${BLUR_BOTTOM})`,
          maskSize: '100% 100%', WebkitMaskSize: '100% 100%',
        }} />
      </div>

      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        zIndex: 4, pointerEvents: 'none',
        mixBlendMode: 'difference',
      }}>
        <div style={{ width: 144, height: 5, borderRadius: 100, background: '#fff' }} />
      </div>
    </div>
  )
}

function PlanCard({ id, selected, onSelect, price, period, daily, badge, checkmarkSrc }) {
  const active = id === selected
  const SF = "'SF Pro', -apple-system, sans-serif"

  return (
    <button onClick={() => onSelect(id)} style={{
      flex: 1,
      height: 66.72,
      borderRadius: 24,
      background: active ? '#fff' : 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      padding: 0,
    }}>
      {/* Discount badge */}
      {badge && (
        <div style={{
          position: 'absolute', top: -8, right: -6,
          background: '#ff7733', borderRadius: 8,
          height: 20, padding: '0 6px',
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 12, fontWeight: 500, color: '#fff', lineHeight: '18px',
          }}>{badge}</span>
        </div>
      )}

      {/* Radio circle — vertically centered, left: 16px */}
      <div style={{
        position: 'absolute',
        left: 16, top: '50%', transform: 'translateY(-50%)',
        width: 24, height: 24, borderRadius: 12,
        background: active ? 'var(--colors-accent, #08f)' : 'transparent',
        border: `2px solid ${active ? 'var(--colors-accent, #08f)' : 'rgba(255,255,255,0.5)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && checkmarkSrc && (
          <img src={checkmarkSrc} alt="" style={{ width: 14, height: 14, display: 'block', pointerEvents: 'none' }} />
        )}
      </div>

      {/* Price + period row — top: 13.5px, left: 48px */}
      <div style={{
        position: 'absolute', left: 48, top: 13.5,
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{
          fontFamily: SF, fontSize: 16, fontWeight: 510,
          color: active ? '#222' : '#fff',
          letterSpacing: '-0.5px', lineHeight: '21px',
          whiteSpace: 'nowrap',
        }}>{price}</span>
        <span style={{
          fontFamily: SF, fontSize: 12, fontWeight: 400,
          color: active ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
          lineHeight: '16px',
          whiteSpace: 'nowrap',
        }}>{period}</span>
      </div>

      {/* Daily price — top: calc(50% + 12.36px), left: 48px */}
      <div style={{
        position: 'absolute', left: 48,
        top: 'calc(50% + 12.36px)',
        display: 'flex', alignItems: 'center', height: 18,
      }}>
        <span style={{
          fontFamily: SF, fontSize: 12, fontWeight: 400,
          color: active ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
          lineHeight: '16px',
        }}>{daily}</span>
      </div>
    </button>
  )
}
