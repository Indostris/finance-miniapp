import { useState } from 'react'
import IC_BACK        from '../assets/icons/ui/back.svg'
import IC_CHEVRON     from '../assets/icons/ui/chevron.svg'
import IC_CROWN       from '../assets/icons/custom/crown.svg'
import IC_PERSON      from '../assets/icons/custom/person.svg'
import IC_CREDIT_CARD from '../assets/icons/custom/credit-card.svg'
import IC_BASKET      from '../assets/icons/custom/basket.svg'
import IC_SHIELD      from '../assets/icons/custom/shield.svg'
import IC_MEGAPHONE   from '../assets/icons/custom/megaphone.svg'

const SF = "'SF Pro', -apple-system, sans-serif"

function Row({ icon, label, onClick }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick?.() }}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', height: 60, borderRadius: 20,
        background: pressed ? '#2c2c2e' : '#1c1c1e',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12,
        transition: 'background 0.1s',
      }}
    >
      <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={icon} alt="" style={{ width: 22, height: 22, display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.6, pointerEvents: 'none' }} />
      </div>
      <span style={{ flex: 1, fontFamily: SF, fontSize: 16, fontWeight: 510, color: '#fff', letterSpacing: '-0.5px', textAlign: 'left' }}>
        {label}
      </span>
      <img src={IC_CHEVRON} alt="" style={{ width: 16, height: 16, display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.3, transform: 'rotate(-90deg)', pointerEvents: 'none' }} />
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ width: '100%' }}>
      <p style={{
        fontFamily: SF, fontSize: 12, fontWeight: 510, letterSpacing: '-0.2px',
        textTransform: 'uppercase', color: 'rgba(235,235,245,0.6)',
        padding: '8px 16px', margin: 0,
      }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  )
}

export default function ProfileScreen({ onClose, userId, username }) {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const firstName = tgUser?.first_name ?? username ?? 'User'
  const lastName  = tgUser?.last_name  ?? ''
  const fullName  = [firstName, lastName].filter(Boolean).join(' ')
  const initials  = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'U'
  const photoUrl  = tgUser?.photo_url ?? null

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', zIndex: 20 }}>

      {/* Nav bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 16px 0', height: 'calc(var(--safe-top) + 52px)',
        paddingTop: 'calc(var(--safe-top) + 6px)', flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{ width: 60, height: 45, borderRadius: 999, background: '#1c1c1e', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ mixBlendMode: 'plus-lighter', transform: 'rotate(90deg)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <img src={IC_BACK} alt="" style={{ width: 32, height: 32, display: 'block' }} />
          </div>
        </button>
        <span style={{ fontFamily: SF, fontSize: 17, fontWeight: 400, color: '#fff', letterSpacing: '-0.43px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          More
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '24px 16px 40px' }}>

          {/* Avatar */}
          <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: 45, border: '2.5px solid #8ccdff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 120, height: 120, borderRadius: 40,
                background: '#1c1c1e', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: "'SF Pro Rounded', -apple-system, sans-serif", fontSize: 44, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Crown badge */}
            <div style={{
              position: 'absolute', top: -12, right: -8,
              width: 45, height: 45, borderRadius: 22.5,
              background: '#0091ff', border: '3px solid #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0) 100%)',
                mixBlendMode: 'screen', pointerEvents: 'none',
              }} />
              <img src={IC_CROWN} alt="" style={{ width: 22, height: 22, display: 'block', filter: 'brightness(0) invert(1)', position: 'relative', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Username */}
          <span style={{
            fontFamily: "'SF Pro Rounded', -apple-system, sans-serif",
            fontSize: 40, fontWeight: 700, lineHeight: '41px', letterSpacing: '-0.6px',
            color: '#fff', textAlign: 'center', width: '100%',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {fullName}
          </span>

          {/* Subscription row */}
          <button style={{
            width: '100%', height: 60, borderRadius: 20,
            background: '#1c1c1e', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
          }}>
            <img src={IC_CROWN} alt="" style={{ width: 22, height: 22, display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.6, flexShrink: 0, pointerEvents: 'none' }} />
            <span style={{ flex: 1, fontFamily: SF, fontSize: 16, fontWeight: 510, color: '#fff', letterSpacing: '-0.5px', textAlign: 'left' }}>
              Subscription Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759', flexShrink: 0 }} />
              <span style={{ fontFamily: SF, fontSize: 16, fontWeight: 510, color: '#fff', letterSpacing: '-0.5px' }}>Active</span>
            </div>
            <img src={IC_CHEVRON} alt="" style={{ width: 14, height: 14, display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.3, marginLeft: 4, transform: 'rotate(-90deg)', pointerEvents: 'none' }} />
          </button>

          {/* PERSONALIZE */}
          <Section title="Personalize">
            <Row icon={IC_PERSON} label="Personal Details" />
          </Section>

          {/* BALANCES */}
          <Section title="Balances">
            <Row icon={IC_CREDIT_CARD} label="Balances" />
            <Row icon={IC_BASKET}      label="Categories" />
          </Section>

          {/* NEED HELP? */}
          <Section title="Need Help?">
            <Row icon={IC_SHIELD}    label="Frequently Asked Questions" />
            <Row icon={IC_MEGAPHONE} label="Contact us" />
          </Section>

        </div>
      </div>
    </div>
  )
}
