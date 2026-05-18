import { SHOP, SERVICES, BARBERS } from '../data/config'
import { BrandMark, IconBell, IconStar, IconPin, IconClock, IconArrowRight, serviceIcon } from './Icons'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home({ onBook, onMyBookings, onAdmin }) {
  return (
    <div className="home ambient-bg">
      <div className="home-scroll">

        {/* Greeting row */}
        <div className="home-greeting-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="home-avatar"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80)' }}
            />
            <div className="home-greeting-text-wrap">
              <div className="home-greeting-sub">{getGreeting()}</div>
              <div className="home-greeting-name">Guest</div>
            </div>
          </div>
          <button className="home-bell-btn" onClick={onMyBookings} aria-label="My Bookings">
            <IconBell size={18} color="var(--bh-ink)" strokeWidth={1.5} />
            <div className="home-bell-dot" />
          </button>
        </div>

        {/* Headline */}
        <div className="home-headline">
          <h1 className="home-h1">
            Discover top barbers<br />and book your <span>look</span> instantly.
          </h1>
        </div>

        {/* Hero photo card */}
        <div
          className="hero-card"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80')`,
          }}
        >
          <div className="hero-overlay" />
          <div className="hero-open-badge">
            <div className="hero-open-dot" />
            OPEN · UNTIL 19:00
          </div>
          <div className="hero-bottom">
            <div className="hero-shop-label">BARBERHUB YEREVAN</div>
            <div className="hero-shop-name">The grooming lounge on Saryan</div>
            <div className="hero-meta-row">
              <div className="hero-meta-item">
                <IconPin size={12} color="var(--bh-ink-sub)" />
                <span>0.8 km</span>
              </div>
              <div className="hero-meta-item">
                <IconStar size={11} />
                <span>4.9 · 488 reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="home-section">
          <div className="home-section-header">
            <h3 className="home-section-title">Services</h3>
            <button className="home-section-link" onClick={onBook}>See all →</button>
          </div>
          <div className="home-scroll-row">
            {SERVICES.map(s => (
              <button
                key={s.id}
                className={`service-pill-card ${s.popular ? 'popular-card' : ''}`}
                onClick={onBook}
              >
                {s.popular && <div className="service-pill-pop-badge">POPULAR</div>}
                <div className="service-pill-icon">
                  {serviceIcon(s.id, 18, 'var(--bh-gold)')}
                </div>
                <div className="service-pill-name">{s.name}</div>
                <div className="service-pill-meta">
                  <span className="service-pill-dur">
                    <IconClock size={10} color="var(--bh-ink-sub)" />
                    {s.duration} min
                  </span>
                  <span className="service-pill-price">${s.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Barbers */}
        <div className="home-section">
          <div className="home-section-header">
            <h3 className="home-section-title">Featured barbers</h3>
            <button className="home-section-link" onClick={onBook}>View team →</button>
          </div>
          <div className="home-scroll-row">
            {BARBERS.map(b => (
              <button key={b.id} className="barber-portrait-card" onClick={onBook}>
                <div
                  className="barber-portrait-photo"
                  style={{ backgroundImage: `url(${b.photo})` }}
                >
                  <div className="barber-portrait-overlay" />
                  <div className="barber-portrait-rating">
                    <IconStar size={9} />
                    {b.rating}
                  </div>
                </div>
                <div className="barber-portrait-info">
                  <div className="barber-portrait-name">{b.name}</div>
                  <div className="barber-portrait-spec">{b.speciality}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Admin link */}
        <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
          <button className="btn-admin" onClick={onAdmin}>⚙ Admin</button>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="home-cta-bar">
        <button className="home-cta-btn" onClick={onBook}>
          Reserve your chair
          <IconArrowRight size={17} color="var(--bh-btn-text)" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}
