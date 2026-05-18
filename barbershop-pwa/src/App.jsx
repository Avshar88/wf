import { useState, useRef } from 'react'
import Home from './components/Home'
import StepService from './components/StepService'
import StepBarber from './components/StepBarber'
import StepDateTime from './components/StepDateTime'
import StepDetails from './components/StepDetails'
import StepConfirm from './components/StepConfirm'
import MyBookings from './components/MyBookings'
import AdminPanel from './components/AdminPanel'
import { BrandMark, IconArrowLeft, IconArrowRight, IconCalendar } from './components/Icons'
import { saveBooking, generateId } from './utils/storage'
import { supabase } from './utils/supabase'
import { formatDate } from './utils/availability'
import { vibrate } from './utils/haptic'

const STEPS = ['service', 'barber', 'datetime', 'details', 'confirm']

export default function App() {
  const [screen, setScreen]                   = useState('home')
  const [stepIndex, setStepIndex]             = useState(0)
  const [dir, setDir]                         = useState('forward')
  const [service, setService]                 = useState(null)
  const [barber, setBarber]                   = useState(null)
  const [datetime, setDatetime]               = useState(null)
  const [details, setDetails]                 = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState(null)
  const touchStartX = useRef(null)

  const step          = STEPS[stepIndex]
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
    if (step === 'service')  return !!service
    if (step === 'barber')   return !!barber
    if (step === 'datetime') return !!datetime
    if (step === 'details')  return !!details
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

  // ── Admin ──────────────────────────────────────────────────
  if (screen === 'admin') return (
    <div className="app ambient-bg"><AdminPanel onBack={() => setScreen('home')} /></div>
  )

  // ── Home ───────────────────────────────────────────────────
  if (screen === 'home') return (
    <div className="app">
      <Home onBook={startBooking} onMyBookings={() => setScreen('mybookings')} onAdmin={() => setScreen('admin')} />
    </div>
  )

  // ── My Bookings ────────────────────────────────────────────
  if (screen === 'mybookings') return (
    <div className="app ambient-bg">
      <div className="topbar">
        <button className="back-btn" onClick={() => setScreen('home')}>
          <IconArrowLeft size={18} color="var(--bh-gold)" />
          Back
        </button>
        <BrandMark size={20} />
        <span style={{ minWidth: 60 }} />
      </div>
      <MyBookings onBack={startBooking} />
    </div>
  )

  // ── Booking flow ───────────────────────────────────────────
  const animClass = dir === 'forward' ? 'slide-in-right' : 'slide-in-left'

  // CTA label
  let ctaLabel = loading ? 'Saving…' : isLastInputStep ? 'Confirm Appointment' : 'Continue'

  // CTA summary content
  function renderSummary() {
    if (step === 'service' && service) {
      return (
        <>
          <div className="cta-summary-left">
            <span className="cta-summary-label">Selected</span>
            <span className="cta-summary-value">{service.name}</span>
          </div>
          <span className="cta-summary-price">${service.price}</span>
        </>
      )
    }
    if (step === 'barber' && barber && service) {
      return (
        <>
          <div className="cta-summary-left">
            <span className="cta-summary-label">Barber</span>
            <span className="cta-summary-value">{barber.name}</span>
          </div>
          <span className="cta-summary-price">${service.price}</span>
        </>
      )
    }
    if (step === 'datetime' && datetime && service) {
      const d    = datetime.date
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return (
        <>
          <div className="cta-summary-left" style={{ gap: 6 }}>
            <IconCalendar size={13} color="var(--bh-gold)" />
            <span className="cta-summary-value">{days[d.getDay()]}, {mons[d.getMonth()]} {d.getDate()}</span>
            <span style={{ color: 'var(--bh-ink-faint)' }}>·</span>
            <span style={{ color: 'var(--bh-gold)', fontWeight: 600, fontSize: 12 }}>{datetime.time}</span>
          </div>
          <span className="cta-summary-price">${service.price}</span>
        </>
      )
    }
    return null
  }

  const summary = renderSummary()
  const disabled = !canProceed() || loading

  return (
    <div className="app ambient-bg" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Top bar */}
      <div className="topbar">
        <button className="back-btn" onClick={goBack}>
          <IconArrowLeft size={18} color="var(--bh-gold)" />
          {step === 'confirm' ? 'Home' : 'Back'}
        </button>
        <BrandMark size={20} />
        <span style={{ minWidth: 60 }} />
      </div>

      {/* Step content */}
      <div className={`step-wrapper ${animClass}`} key={stepIndex}>
        {step === 'service'  && (
          <StepService selected={service} onSelect={setService} />
        )}
        {step === 'barber'   && (
          <StepBarber selected={barber} onSelect={setBarber} service={service} />
        )}
        {step === 'datetime' && (
          <StepDateTime
            barberId={barber.id}
            serviceDuration={service.duration}
            selected={datetime}
            onSelect={setDatetime}
            service={service}
            barber={barber}
          />
        )}
        {step === 'details'  && (
          <StepDetails
            initial={details}
            onChange={setDetails}
            service={service}
            barber={barber}
            datetime={datetime}
          />
        )}
        {step === 'confirm'  && <StepConfirm booking={confirmedBooking} />}
        {error && <p className="error-msg">{error}</p>}
      </div>

      {/* Sticky CTA */}
      {step !== 'confirm' ? (
        <div className="cta-bar">
          {summary && (
            <div className="cta-summary">
              {summary}
            </div>
          )}
          <button
            className="btn-cta"
            disabled={disabled}
            onClick={handleNext}
          >
            {ctaLabel}
            {!disabled && (
              <IconArrowRight size={17} color="var(--bh-btn-text)" strokeWidth={2} />
            )}
          </button>
        </div>
      ) : (
        <div className="cta-bar">
          <button className="btn-ghost-gold" onClick={() => setScreen('home')}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  )
}
