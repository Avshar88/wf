import { BARBERS } from '../data/config'
import { vibrate } from '../utils/haptic'

export default function StepBarber({ selected, onSelect }) {
  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Choose Barber</h2>
        <p>Pick your preferred barber</p>
      </div>
      <div className="option-list">
        {BARBERS.map(b => (
          <button
            key={b.id}
            className={`option-card ${selected?.id === b.id ? 'selected' : ''}`}
            onClick={() => { vibrate(); onSelect(b) }}
          >
            <div className={`barber-avatar-lg avatar-${b.id}`}>{b.name[0]}</div>
            <div className="opt-body">
              <span className="opt-name">{b.name}</span>
              <span className="opt-sub">{b.speciality}</span>
            </div>
            <span className="opt-check">{selected?.id === b.id ? '✓' : ''}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
