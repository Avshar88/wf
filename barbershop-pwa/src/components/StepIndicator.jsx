import { IconCheck } from './Icons'

const STEPS = ['Service', 'Barber', 'Date & Time', 'Details']

export default function StepIndicator({ currentStep = 0 }) {
  const total = STEPS.length
  const progressWidth = total > 1
    ? `calc((100% - 48px) * ${currentStep / (total - 1)})`
    : '0px'

  return (
    <div className="step-indicator">
      <div className="step-indicator-inner">
        <div className="step-indicator-line-bg" />
        <div className="step-indicator-line-progress" style={{ width: progressWidth }} />
        {STEPS.map((label, i) => {
          const done   = i < currentStep
          const active = i === currentStep
          const state  = done ? 'done' : active ? 'active' : 'future'
          return (
            <div key={label} className="step-dot-wrapper">
              <div className={`step-dot ${state}`}>
                {done
                  ? <IconCheck size={14} color="var(--bh-green)" strokeWidth={2} />
                  : i + 1
                }
              </div>
              <span className={`step-dot-label ${state}`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
