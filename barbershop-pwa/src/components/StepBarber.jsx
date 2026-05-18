import { BARBERS } from '../data/config'
import { vibrate } from '../utils/haptic'
import { IconCheck, IconStar } from './Icons'
import StepIndicator from './StepIndicator'

export default function StepBarber({ selected, onSelect, service }) {
  return (
    <div className="step-content">
      <StepIndicator currentStep={1} />

      <div className="step-title-section">
        <div className="step-eyebrow">STEP 02</div>
        <h1 className="step-h1">Choose Your <span>Master</span></h1>
        <p className="step-sub">Hand-picked craftsmen, each with a distinct signature style.</p>
      </div>

      {service && (
        <div className="mini-summary">
          <span className="mini-summary-item">{service.name}</span>
          <span className="mini-summary-dot">◆</span>
          <span className="mini-summary-item">{service.duration} min</span>
          <span className="mini-summary-dot">◆</span>
          <span className="mini-summary-item">${service.price}</span>
        </div>
      )}

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {BARBERS.map(b => {
          const isSel = selected?.id === b.id
          return (
            <button
              key={b.id}
              className={`barber-card-premium ${isSel ? 'selected' : ''}`}
              onClick={() => { vibrate(); onSelect(b) }}
            >
              {/* Photo */}
              <div className="barber-photo-wrap">
                <div
                  className="barber-photo"
                  style={{ backgroundImage: `url(${b.photo})` }}
                />
                {isSel && (
                  <div className="barber-check-badge">
                    <IconCheck size={13} color="var(--bh-btn-text)" strokeWidth={2.4} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="barber-card-body">
                <div className="barber-card-name">{b.fullName || b.name}</div>
                <div className="barber-card-role">{b.role}</div>
                <div className="barber-card-spec">{b.speciality}</div>
              </div>

              {/* Rating */}
              <div style={{ alignSelf: 'flex-start', paddingTop: 4 }}>
                <div className="rating-pill">
                  <IconStar size={10} />
                  <span>{b.rating}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
