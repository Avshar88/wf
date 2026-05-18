import { useState } from 'react'
import { IconUser, IconPhone, IconCard, serviceIcon } from './Icons'
import StepIndicator from './StepIndicator'

const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function StepDetails({ initial, onChange, service, barber, datetime }) {
  const [name, setName]   = useState(initial?.name  || '')
  const [phone, setPhone] = useState(initial?.phone || '')

  function handle(field, value) {
    const updated = { name, phone, [field]: value }
    if (field === 'name')  setName(value)
    else                   setPhone(value)
    onChange(updated.name.trim() && updated.phone.trim() ? updated : null)
  }

  // Format date/time label
  let dateLabel = ''
  let timeLabel = ''
  if (datetime?.date) {
    const d = datetime.date
    dateLabel = `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
    timeLabel = datetime.time || ''
  }

  return (
    <div className="step-content">
      <StepIndicator currentStep={3} />

      <div className="step-title-section">
        <div className="step-eyebrow">STEP 04</div>
        <h1 className="step-h1">Final <span>Touches</span></h1>
        <p className="step-sub">A few details so we can welcome you properly.</p>
      </div>

      {/* Booking summary card */}
      {service && (
        <div className="booking-summary-card">
          <div className="bsc-top">
            <div className="bsc-icon">
              {serviceIcon(service.id, 20, 'var(--bh-gold)')}
            </div>
            <div style={{ flex: 1 }}>
              <div className="bsc-name">{service.name}</div>
              {barber && <div className="bsc-with">with {barber.fullName || barber.name}</div>}
            </div>
            <div className="bsc-price">${service.price}</div>
          </div>

          {dateLabel && (
            <div className="bsc-divider">
              <div className="bsc-col">
                <div className="bsc-col-label">Date</div>
                <div className="bsc-col-value">{dateLabel}</div>
              </div>
              <div className="bsc-divider-v" />
              <div className="bsc-col">
                <div className="bsc-col-label">Time</div>
                <div className="bsc-col-value gold">{timeLabel}</div>
              </div>
              <div className="bsc-divider-v" />
              <div className="bsc-col">
                <div className="bsc-col-label">Duration</div>
                <div className="bsc-col-value">{service.duration} min</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{
          fontSize: 10, letterSpacing: '2px',
          color: 'var(--bh-ink-faint)', fontWeight: 600, marginBottom: 14,
          textTransform: 'uppercase',
        }}>
          YOUR DETAILS
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <div className="form-field">
            <IconUser size={18} color="var(--bh-gold)" />
            <input
              type="text"
              placeholder="e.g. Artur Petrosyan"
              value={name}
              onChange={e => handle('name', e.target.value)}
              autoComplete="name"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <div className="form-field">
            <IconPhone size={18} color="var(--bh-gold)" />
            <input
              type="tel"
              placeholder="+374 __ __ __ __"
              value={phone}
              onChange={e => handle('phone', e.target.value)}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Pay on site note */}
        <div className="pay-note">
          <IconCard size={18} color="var(--bh-green)" />
          <div style={{ flex: 1 }}>
            <div className="pay-note-title">Pay on site</div>
            <div className="pay-note-sub">No deposit required · Cancel up to 2h prior</div>
          </div>
        </div>
      </div>
    </div>
  )
}
