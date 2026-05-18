import { useState, useEffect } from 'react'
import { getAvailableDates, getSlots, isSlotAvailable, formatDate } from '../utils/availability'
import { getBookings } from '../utils/storage'
import { vibrate } from '../utils/haptic'
import StepIndicator from './StepIndicator'

const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function StepDateTime({ barberId, serviceDuration, selected, onSelect, service, barber }) {
  const dates = getAvailableDates(30)
  const [selectedDate, setSelectedDate] = useState(selected?.date || null)
  const [bookings, setBookings] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    setLoadingSlots(true)
    getBookings().then(data => { setBookings(data); setLoadingSlots(false) })
  }, [])

  const slots = selectedDate
    ? getSlots(selectedDate, serviceDuration).map(time => ({
        time,
        available: isSlotAvailable(bookings, barberId, selectedDate, time, serviceDuration),
      }))
    : []

  const availableCount = slots.filter(s => s.available).length

  function handleDate(date) { setSelectedDate(date); onSelect(null) }
  function handleSlot(time) { vibrate(); onSelect({ date: selectedDate, time }) }

  return (
    <div className="step-content">
      <StepIndicator currentStep={2} />

      <div className="step-title-section">
        <div className="step-eyebrow">STEP 03</div>
        <h1 className="step-h1">Pick a <span>Moment</span></h1>
        <p className="step-sub">
          {barber
            ? `Available slots with ${barber.name}, your chosen master barber.`
            : 'Select an available slot.'}
        </p>
      </div>

      {service && barber && (
        <div className="mini-summary">
          <span className="mini-summary-item">{service.name}</span>
          <span className="mini-summary-dot">◆</span>
          <span className="mini-summary-item">{barber.name}</span>
          <span className="mini-summary-dot">◆</span>
          <span className="mini-summary-item">${service.price}</span>
        </div>
      )}

      {/* Date selector */}
      <div style={{ padding: '0 20px 8px' }}>
        <div style={{
          fontSize: 10, letterSpacing: '2px',
          color: 'var(--bh-ink-faint)', fontWeight: 600, marginBottom: 12,
          textTransform: 'uppercase',
        }}>
          SELECT DATE
        </div>
        <div className="date-scroll">
          {dates.map(d => {
            const active = selectedDate && formatDate(d) === formatDate(selectedDate)
            return (
              <button
                key={formatDate(d)}
                className={`date-chip ${active ? 'selected' : ''}`}
                onClick={() => { vibrate(); handleDate(d) }}
              >
                <span className="dc-day">{DAY_NAMES[d.getDay()]}</span>
                <span className="dc-num">{d.getDate()}</span>
                <span className="dc-mon">{MONTH_NAMES[d.getMonth()]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="slots-section">
          <div className="slots-header">
            <h3>Available Times</h3>
            {!loadingSlots && availableCount > 0 && availableCount <= 4 && (
              <span className="slots-urgency">🔥 Only {availableCount} left!</span>
            )}
          </div>

          {loadingSlots ? (
            <p className="no-slots">Loading slots…</p>
          ) : (
            <div className="slots-grid">
              {slots.map(({ time, available }) => {
                const isSel = selected?.time === time && selectedDate &&
                  formatDate(selected.date) === formatDate(selectedDate)
                return (
                  <button
                    key={time}
                    disabled={!available}
                    className={`slot-btn ${!available ? 'taken' : ''} ${isSel ? 'selected' : ''}`}
                    onClick={() => available && handleSlot(time)}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          )}

          {!loadingSlots && slots.every(s => !s.available) && (
            <p className="no-slots">No available slots. Please choose another date.</p>
          )}
        </div>
      )}
    </div>
  )
}
