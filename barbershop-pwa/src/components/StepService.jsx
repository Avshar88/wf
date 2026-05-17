import { SERVICES } from '../data/config'

export default function StepService({ selected, onSelect }) {
  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Choose Service</h2>
        <p>Select the service you'd like</p>
      </div>
      <div className="option-list">
        {SERVICES.map(s => (
          <button
            key={s.id}
            className={`option-card ${selected?.id === s.id ? 'selected' : ''}`}
            onClick={() => onSelect(s)}
          >
            <span className="opt-icon">{s.icon}</span>
            <div className="opt-body">
              <span className="opt-name">{s.name}</span>
              <span className="opt-sub">{s.duration} min</span>
            </div>
            <span className="opt-price">${s.price}</span>
            <span className="opt-check">{selected?.id === s.id ? '✓' : ''}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
