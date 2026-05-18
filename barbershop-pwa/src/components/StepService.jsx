import { SERVICES } from '../data/config'
import { vibrate } from '../utils/haptic'
import { IconCheck, IconClock, serviceIcon } from './Icons'
import StepIndicator from './StepIndicator'

export default function StepService({ selected, onSelect }) {
  return (
    <div className="step-content">
      <StepIndicator currentStep={0} />

      <div className="step-title-section">
        <div className="step-eyebrow">STEP 01</div>
        <h1 className="step-h1">Choose Your <span>Service</span></h1>
        <p className="step-sub">Each service is performed with care, premium products, and a complimentary espresso.</p>
      </div>

      <div className="service-list">
        {SERVICES.map(s => {
          const isSel = selected?.id === s.id
          return (
            <button
              key={s.id}
              className={`service-row ${isSel ? 'selected' : ''}`}
              onClick={() => { vibrate(); onSelect(s) }}
            >
              {/* Icon block */}
              <div className="service-row-icon">
                {serviceIcon(s.id, 24, isSel ? 'var(--bh-gold-hi)' : 'var(--bh-gold)')}
              </div>

              {/* Content */}
              <div className="service-row-body">
                <div className="service-row-name">
                  {s.name}
                  {s.popular && (
                    <span className="popular-badge-inline">POPULAR</span>
                  )}
                </div>
                <div className="service-row-tagline">{s.tagline}</div>
                <div className="service-row-duration">
                  <IconClock size={11} color="var(--bh-ink-faint)" />
                  {s.duration} min
                </div>
              </div>

              {/* Price + check */}
              <div className="service-row-right">
                <div className={`price-pill ${isSel ? 'selected' : ''}`}>${s.price}</div>
                {isSel && (
                  <div className="check-circle">
                    <IconCheck size={13} color="var(--bh-btn-text)" strokeWidth={2.4} />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
