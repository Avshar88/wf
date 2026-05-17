import { getBookings } from '../utils/storage'
import { BARBERS, SERVICES } from '../data/config'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MyBookings({ onBack }) {
  const bookings = getBookings().slice().reverse()

  return (
    <div className="my-bookings">
      <div className="step-header">
        <h2>My Bookings</h2>
        <p>{bookings.length === 0 ? 'No bookings yet' : `${bookings.length} appointment${bookings.length > 1 ? 's' : ''}`}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>You have no bookings yet.</p>
          <button className="btn-primary" onClick={onBack}>Book Now</button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(b => {
            const [y, m, d] = b.date.split('-').map(Number)
            const dateLabel = `${MONTH_SHORT[m - 1]} ${d}, ${y}`
            const service = SERVICES.find(s => s.id === b.serviceId)
            const barber = BARBERS.find(br => br.id === b.barberId)
            return (
              <div key={b.id} className="booking-item">
                <div className="bi-left">
                  <div className="bi-icon">{service?.icon || '💈'}</div>
                </div>
                <div className="bi-body">
                  <div className="bi-name">{b.name}</div>
                  <div className="bi-service">{service?.name} · {barber?.name}</div>
                  <div className="bi-time">{dateLabel} at {b.time}</div>
                </div>
                <div className="bi-right">
                  <span className="bi-price">${b.price}</span>
                  <span className="bi-status confirmed">Confirmed</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {bookings.length > 0 && (
        <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={onBack}>
          Book Another
        </button>
      )}
    </div>
  )
}
