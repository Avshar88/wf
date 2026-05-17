import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { QRCodeSVG } from 'qrcode.react'

const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function addToCalendar(booking) {
  const { service, barber, date, time } = booking
  const [h, m] = time.split(':').map(Number)
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m)
  const end = new Date(start.getTime() + service.duration * 60000)

  const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(`Haircut @ BarberHub - ${barber.name}`)}` +
    `&dates=${fmt(start)}/${fmt(end)}` +
    `&details=${encodeURIComponent(`${service.name} with ${barber.name}. Pay $${service.price} on site.`)}`
  window.open(url, '_blank')
}

export default function StepConfirm({ booking }) {
  const { service, barber, date, time, name, id } = booking
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dateLabel = `${DAY_FULL[d.getDay()]}, ${MONTH_FULL[d.getMonth()]} ${d.getDate()}`

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#c9a84c', '#e3c06e', '#ffffff', '#f0d080'],
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="step-content confirm-step">
      <div className="confirm-icon">✅</div>
      <h2>Booking Confirmed!</h2>
      <p className="confirm-sub">See you soon, {name.split(' ')[0]}!</p>

      <div className="ticket">
        <div className="ticket-top">
          <div className="ticket-shop">💈 BarberHub Yerevan</div>
          <div className="ticket-service">{service.icon} {service.name}</div>
          <div className="ticket-barber">with <strong>{barber.name}</strong></div>
        </div>

        <div className="ticket-divider">
          <div className="ticket-notch left" />
          <div className="ticket-dash" />
          <div className="ticket-notch right" />
        </div>

        <div className="ticket-bottom">
          <div className="ticket-row">
            <div className="ticket-cell">
              <span className="tc-label">Date</span>
              <span className="tc-value">{dateLabel}</span>
            </div>
            <div className="ticket-cell">
              <span className="tc-label">Time</span>
              <span className="tc-value time-big">{time}</span>
            </div>
          </div>
          <div className="ticket-row">
            <div className="ticket-cell">
              <span className="tc-label">Duration</span>
              <span className="tc-value">{service.duration} min</span>
            </div>
            <div className="ticket-cell">
              <span className="tc-label">Price</span>
              <span className="tc-value price-gold">${service.price}</span>
            </div>
          </div>
          <div className="ticket-qr">
            <QRCodeSVG
              value={`BARBERHUB:${id}`}
              size={80}
              bgColor="transparent"
              fgColor="#c9a84c"
            />
            <div className="ticket-id">#{id}</div>
          </div>
        </div>
      </div>

      <p className="confirm-note">💳 Pay on site · No deposit required</p>

      <button className="btn-calendar" onClick={() => addToCalendar(booking)}>
        📅 Add to Calendar
      </button>
    </div>
  )
}
