import { useState, useRef } from 'react'
import Home from './components/Home'
import StepService from './components/StepService'
import StepBarber from './components/StepBarber'
import StepDateTime from './components/StepDateTime'
import StepDetails from './components/StepDetails'
import StepConfirm from './components/StepConfirm'
import MyBookings from './components/MyBookings'
import { saveBooking, generateId } from './utils/storage'
import { supabase } from './utils/supabase'
import { formatDate } from './utils/availability'
import { vibrate } from './utils/haptic'

const STEPS = ['service', 'barber', 'datetime', 'details', 'confirm']
const STEP_LABELS = { service: 'Service', barber: 'Barber', datetime: 'Date & Time', details: 'Details' }

export default function App() {
  const [screen, setScreen] = useState('home')
  const [stepIndex, setStepIndex] = useState(0)
  const [dir, setDir] = useState('forward')
  const [service, setService] = useState(null)
  const [barber, setBarber] = useState(null)
  const [datetime, setDatetime] = useState(null)
  const [details, setDetails] = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const touchStartX = useRef(null)

  const step = STEPS[stepIndex]
  const isLastInputStep = step === 'details'

  function startBooking() {
    setScreen('booking'); setStepIndex(0)
    setService(null); setBarber(null); setDatetime(null); setDetails(null)
    setConfirmedBooking(null); setError(null)
  }

  function goBack() {
    vibrate()
    if (step === 'confirm') { setScreen('home'); return }
    setDir('back')
    if (stepIndex === 0) setScreen('home')
    else setStepIndex(i => i - 1)
  }

  function canProceed() {
    if (step === 'service') return !!service
    if (step === 'barber') return !!barber
    if (step === 'datetime') return !!datetime
    if (step === 'details') return !!details
    return false
  }

  async function handleNext() {
    vibrate()
    if (!isLastInputStep) { setDir('forward'); setStepIndex(i => i + 1); return }
    setLoading(true); setError(null)
    try {
      const booking = {
        id: generateId(),
        service_id: service.id,
        barber_id: barber.id,
        date: formatDate(datetime.date),
        time: datetime.time,
        service_duration: service.duration,
        price: service.price,
        name: details.name,
        phone: details.phone,
      }
      await saveBooking(booking)
      supabase.functions.invoke('notify-owner', { body: { booking, service, barber } }).catch(() => {})
      setConfirmedBooking({ ...booking, service, barber, date: datetime.date })
      setDir('forward')
      setStepIndex(STEPS.indexOf('confirm'))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (!touchStartX.current) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 60) return
    if (diff > 0 && canProceed() && step !== 'confirm') handleNext()
    else if (diff < 0) goBack()
    touchStartX.current = null
  }

  if (screen === 'home') return (
    <div className="app"><Home onBook={startBooking} onMyBookings={() => setScreen('mybookings')} /></div>
  )

  if (screen === 'mybookings') return (
    <div className="app">
      <div className="topbar">
        <button className="back-btn" onClick={() => setScreen('home')}>← Back</button>
        <span className="topbar-title">BarberHub</span>
        <span />
      </div>
      <MyBookings onBack={startBooking} />
    </div>
  )

  const progressSteps = STEPS.slice(0, -1)
  const animClass = dir === 'forward' ? 'slide-in-right' : 'slide-in-left'

  return (
    <div className="app" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="topbar">
        <button className="back-btn" onClick={goBack}>{step === 'confirm' ? '← Home' : '← Back'}</button>
        <span className="topbar-title">BarberHub</span>
        <span />
      </div>

      {step !== 'confirm' && (
        <div className="progress-bar">
          {progressSteps.map((s, i) => (
            <div key={s} className={`progress-step ${i < stepIndex ? 'done' : ''} ${i === stepIndex ? 'active' : ''}`}>
              <div className="ps-dot">{i < stepIndex ? '✓' : i + 1}</div>
              <span>{STEP_LABELS[s]}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`step-wrapper ${animClass}`} key={stepIndex}>
        {step === 'service'  && <StepService selected={service} onSelect={setService} />}
        {step === 'barber'   && <StepBarber selected={barber} onSelect={setBarber} />}
        {step === 'datetime' && <StepDateTime barberId={barber.id} serviceDuration={service.duration} selected={datetime} onSelect={setDatetime} />}
        {step === 'details'  && <StepDetails initial={details} onChange={setDetails} />}
        {step === 'confirm'  && <StepConfirm booking={confirmedBooking} />}
        {error && <p className="error-msg">{error}</p>}
      </div>

      <div className="bottom-bar">
        {step !== 'confirm' ? (
          <button className="btn-primary btn-full" disabled={!canProceed() || loading} onClick={handleNext}>
            {loading ? 'Saving...' : isLastInputStep ? 'Confirm Booking' : 'Continue →'}
          </button>
        ) : (
          <button className="btn-primary btn-full" onClick={() => setScreen('home')}>Back to Home</button>
        )}
      </div>
    </div>
  )
}
