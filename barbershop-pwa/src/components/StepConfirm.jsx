const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function StepConfirm({ booking }) {
  const { service, barber, date, time, name } = booking
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dateLabel = `${DAY_FULL[d.getDay()]}, ${MONTH_FULL[d.getMonth()]} ${d.getDate()}`

  return (
    <div className="step-content confirm-step">
      <div className="confirm-icon">✅</div>
      <h2>Booking Confirmed!</h2>
      <p className="confirm-sub">See you soon, {name.split(' ')[0]}!</p>

      <div className="confirm-card">
        <div className="confirm-row">
          <span>Service</span>
          <strong>{service.icon} {service.name}</strong>
        </div>
        <div className="confirm-row">
          <span>Duration</span>
          <strong>{service.duration} min</strong>
        </div>
        <div className="confirm-row">
          <span>Price</span>
          <strong>${service.price} (pay on site)</strong>
        </div>
        <div className="confirm-divider" />
        <div className="confirm-row">
          <span>Barber</span>
          <strong>{barber.name}</strong>
        </div>
        <div className="confirm-row">
          <span>Date</span>
          <strong>{dateLabel}</strong>
        </div>
        <div className="confirm-row">
          <span>Time</span>
          <strong>{time}</strong>
        </div>
        <div className="confirm-divider" />
        <div className="confirm-row">
          <span>Booking ID</span>
          <strong className="booking-id">{booking.id}</strong>
        </div>
      </div>

      <p className="confirm-note">
        💳 Payment is collected at the barbershop. No deposit required.
      </p>
    </div>
  )
}
