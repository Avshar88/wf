import { useState } from 'react'
import Home from './components/Home'
import StepService from './components/StepService'
import StepBarber from './components/StepBarber'
import StepDateTime from './components/StepDateTime'
import StepDetails from './components/StepDetails'
import StepConfirm from './components/StepConfirm'
import MyBookings from './components/MyBookings'
import { saveBooking, generateId } from './utils/storage'
import { formatDate } from './utils/availability'

const STEPS = ['service', 'barber', 'datetime', 'details', 'confirm']

const STEP_LABELS = {
  service: 'Service',
  barber: 'Barber',
  datetime: 'Date & Time',
  details: 'Details',
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [stepIndex, setStepIndex] = useState(0)
  const [service, setService] = useState(null)
  const [barber, setBarber] = useState(null)
  const [datetime, setDatetime] = useState(null)
  const [details, setDetails] = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const step = STEPS[stepIndex]
  const isLastInputStep = step === 'details'

  function startBooking() {
    setScreen('booking')
    setStepIndex(0)
    setService(null)
    setBarber(null)
    setDatetime(null)
    setDetails(null)
    setConfirmedBooking(null)
  }

  function goBack() {
    if (step === 'confirm') {
      setScreen('home')
      return
    }
    if (stepIndex === 0) {
      setScreen('home')
    } else {
      setStepIndex(i => i - 1)
    }
  }

  function canProceed() {
    if (step === 'service') return !!service
    if (step === 'barber') return !!barber
    if (step === 'datetime') return !!datetime
    if (step === 'details') return !!details
    return false
  }

  function handleNext() {
    if (isLastInputStep) {
      const booking = {
        id: generateId(),
        serviceId: service.id,
        barberId: barber.id,
        date: formatDate(datetime.date),
        time: datetime.time,
        serviceDuration: service.duration,
        price: service.price,
        name: details.name,
        phone: details.phone,
        createdAt: new Date().toISOString(),
      }
      saveBooking(booking)
      setConfirmedBooking({ ...booking, service, barber, date: datetime.date })
      setStepIndex(STEPS.indexOf('confirm'))
    } else {
      setStepIndex(i => i + 1)
    }
  }

  if (screen === 'home') {
    return (
      <div className="app">
        <Home onBook={startBooking} onMyBookings={() => setScreen('mybookings')} />
      </div>
    )
  }

  if (screen === 'mybookings') {
    return (
      <div className="app">
        <div className="topbar">
          <button className="back-btn" onClick={() => setScreen('home')}>← Back</button>
          <span className="topbar-title">BarberHub</span>
          <span />
        </div>
        <MyBookings onBack={startBooking} />
      </div>
    )
  }

  const progressSteps = STEPS.slice(0, -1)

  return (
    <div className="app">
      <div className="topbar">
        <button className="back-btn" onClick={goBack}>
          {step === 'confirm' ? '← Home' : '← Back'}
        </button>
        <span className="topbar-title">BarberHub</span>
        <span />
      </div>

      {step !== 'confirm' && (
        <div className="progress-bar">
          {progressSteps.map((s, i) => (
            <div
              key={s}
              className={`progress-step ${i < stepIndex ? 'done' : ''} ${i === stepIndex ? 'active' : ''}`}
            >
              <div className="ps-dot">{i < stepIndex ? '✓' : i + 1}</div>
              <span>{STEP_LABELS[s]}</span>
            </div>
          ))}
        </div>
      )}

      <div className="step-wrapper">
        {step === 'service' && <StepService selected={service} onSelect={setService} />}
        {step === 'barber' && <StepBarber selected={barber} onSelect={setBarber} />}
        {step === 'datetime' && (
          <StepDateTime
            barberId={barber.id}
            serviceDuration={service.duration}
            selected={datetime}
            onSelect={setDatetime}
          />
        )}
        {step === 'details' && <StepDetails initial={details} onChange={setDetails} />}
        {step === 'confirm' && <StepConfirm booking={confirmedBooking} />}
      </div>

      <div className="bottom-bar">
        {step !== 'confirm' ? (
          <button className="btn-primary btn-full" disabled={!canProceed()} onClick={handleNext}>
            {isLastInputStep ? 'Confirm Booking' : 'Continue'}
          </button>
        ) : (
          <button className="btn-primary btn-full" onClick={() => setScreen('home')}>
            Back to Home
          </button>
        )}
      </div>
    </div>
  )
}
