import { SHOP, SERVICES, BARBERS } from '../data/config'

const GREETINGS = {
  morning: "Good morning! Ready for a fresh cut? ☀️",
  afternoon: "Good afternoon! Time for a fresh look? 💈",
  evening: "Good evening! Book your next appointment 🌙",
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return GREETINGS.morning
  if (h < 17) return GREETINGS.afternoon
  return GREETINGS.evening
}

export default function Home({ onBook, onMyBookings }) {
  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-badge">💈</div>
        <p className="hero-greeting">{getGreeting()}</p>
        <h1>{SHOP.name}</h1>
        <p className="tagline">{SHOP.tagline}</p>
        <div className="hero-meta">
          <span>📍 {SHOP.address}</span>
          <span>Mon – Sat · 10:00 – 19:00</span>
        </div>
      </div>

      <div className="home-services">
        <h2>Our Services</h2>
        <div className="service-grid">
          {SERVICES.map((s, i) => (
            <div key={s.id} className={`service-card ${i === 0 ? 'popular' : ''}`}>
              {i === 0 && <div className="popular-badge">⭐ Most Popular</div>}
              <span className="s-icon">{s.icon}</span>
              <span className="s-name">{s.name}</span>
              <div className="s-meta">
                <span>{s.duration} min</span>
                <span className="s-price">${s.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-team">
        <h2>Our Team</h2>
        <div className="barber-row">
          {BARBERS.map(b => (
            <div key={b.id} className="barber-chip">
              <div className={`barber-avatar avatar-${b.id}`}>{b.name[0]}</div>
              <span>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="home-actions">
        <button className="btn-primary btn-lg pulse-btn" onClick={onBook}>
          Book Appointment
        </button>
        <button className="btn-ghost" onClick={onMyBookings}>
          My Bookings
        </button>
      </div>
    </div>
  )
}
