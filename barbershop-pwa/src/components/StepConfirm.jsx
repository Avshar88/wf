import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { QRCodeSVG } from 'qrcode.react'
import { IconCheck, IconCalendar, IconPin, IconPhone, IconChevron, BrandMark } from './Icons'

const DAY_FULL   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function addToCalendar(booking) {
  const { service, barber, date, time } = booking
  const [h, m] = time.split(':').map(Number)
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m)
  const end   = new Date(start.getTime() + service.duration * 60000)

  const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const url  = `https://calendar.google.com/calendar/render?action=TEMPLATE`
    + `&text=${encodeURIComponent(`Haircut @ BarberHub - ${barber.name}`)}`
    + `&dates=${fmt(start)}/${fmt(end)}`
    + `&details=${encodeURIComponent(`${service.name} with ${barber.name}. Pay $${service.price} on site.`)}`
  window.open(url, '_blank')
}

function ActionRow({ icon: Icon, label, hint, onClick }) {
  return (
    <button className="action-row" onClick={onClick}>
      <div className="action-icon-wrap">
        <Icon size={17} color="var(--bh-gold)" />
      </div>
      <div style={{ flex: 1 }}>
        <div className="action-label">{label}</div>
        <div className="action-hint">{hint}</div>
      </div>
      <IconChevron size={15} color="var(--bh-ink-faint)" />
    </button>
  )
}

export default function StepConfirm({ booking }) {
  const { service, barber, date, time, name, id } = booking
  const d         = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayFull   = DAY_FULL[d.getDay()]
  const dateLabel = `${dayFull}, ${MONTH_FULL[d.getMonth()]} ${d.getDate()}`
  const firstName = name.split(' ')[0]

  // Format booking ID for display
  const bookingCode = `BH-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}-${id.slice(-4).toUpperCase()}`

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D9C28E', '#EFE0B5', '#A5BD7E', '#F5EEDC'],
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ overflowY: 'auto', paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 20px 8px' }}>
        <BrandMark size={20} />
      </div>

      {/* Check circle + title */}
      <div style={{ textAlign: 'center', padding: '28px 20px 4px' }}>
        <div className="confirm-check-ring">
          <IconCheck size={38} color="var(--bh-green)" strokeWidth={2} />
        </div>

        {/* Ornament */}
        <div style={{ margin: '12px auto 0', display: 'flex', justifyContent: 'center' }}>
          <svg width="54" height="18" viewBox="0 0 54 18" fill="none">
            <path d="M2 9h18" stroke="var(--bh-gold)" strokeWidth="1" opacity="0.4"/>
            <path d="M34 9h18" stroke="var(--bh-gold)" strokeWidth="1" opacity="0.4"/>
            <path d="M27 3l4 6-4 6-4-6z" stroke="var(--bh-gold)" strokeWidth="1" fill="none"/>
            <circle cx="27" cy="9" r="1" fill="var(--bh-gold)"/>
          </svg>
        </div>

        <h1 className="confirm-headline">
          Your Chair <span>Awaits</span>
        </h1>
        <p className="confirm-sub-text">See you {dayFull}, {firstName}.</p>
      </div>

      {/* Ticket */}
      <div style={{ padding: '24px 20px 0' }}>
        <div className="ticket-premium">
          <div className="ticket-stripe" />

          <div className="ticket-header">
            <div className="ticket-shop-label">BARBERHUB · YEREVAN</div>
            <div className="ticket-service-name">{service.name}</div>
            <div className="ticket-barber-line">
              with <strong>{barber.fullName || barber.name}</strong>
            </div>
          </div>

          {/* Notch divider */}
          <div className="ticket-notch">
            <div className="ticket-notch-left" />
            <div className="ticket-notch-dash" />
            <div className="ticket-notch-right" />
          </div>

          {/* Stats grid */}
          <div className="ticket-grid">
            <div className="ticket-cell">
              <div className="tc-label">DATE</div>
              <div className="tc-value">{dayFull}</div>
              <div className="tc-sub">{MONTH_FULL[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</div>
            </div>
            <div className="ticket-cell">
              <div className="tc-label">TIME</div>
              <div className="tc-value gold">{time}</div>
              <div className="tc-sub">{service.duration} minute slot</div>
            </div>
            <div className="ticket-cell">
              <div className="tc-label">MASTER</div>
              <div className="tc-value">{barber.name}</div>
              <div className="tc-sub">{barber.role?.split(' · ')[0] || 'Barber'}</div>
            </div>
            <div className="ticket-cell">
              <div className="tc-label">TOTAL</div>
              <div className="tc-value gold">${service.price}</div>
              <div className="tc-sub">Pay on site</div>
            </div>
          </div>

          {/* QR code */}
          <div className="ticket-qr-section">
            <div className="ticket-qr-wrap">
              <QRCodeSVG
                value={`BARBERHUB:${id}`}
                size={100}
                bgColor="#F5EEDC"
                fgColor="#0E0805"
              />
            </div>
            <div className="ticket-booking-id">{bookingCode}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ActionRow
          icon={IconCalendar}
          label="Add to Calendar"
          hint=".ics file"
          onClick={() => addToCalendar(booking)}
        />
        <ActionRow
          icon={IconPin}
          label="Get Directions"
          hint="Saryan 23 · 0.8 km"
          onClick={() => window.open('https://maps.google.com/?q=Saryan+23+Yerevan', '_blank')}
        />
        <ActionRow
          icon={IconPhone}
          label="Call BarberHub"
          hint="+374 10 22 88 11"
          onClick={() => window.open('tel:+37410228811')}
        />
      </div>
    </div>
  )
}
