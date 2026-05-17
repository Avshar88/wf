import { useState, useEffect } from 'react'
import { getAvailableDates, getSlots, isSlotAvailable, formatDate } from '../utils/availability'
import { getBookings } from '../utils/storage'
import { vibrate } from '../utils/haptic'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function StepDateTime({ barberId, serviceDuration, selected, onSelect }) {
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
      <div className="step-header">
        <h2>Choose Date & Time</h2>
        <p>Select an available slot</p>
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

      {selectedDate && (
        <div className="slots-section">
          <div className="slots-header">
            <h3>Available Times</h3>
            {!loadingSlots && availableCount > 0 && availableCount <= 4 && (
              <span className="slots-urgency">🔥 Only {availableCount} left!</span>
            )}
          </div>
          {loadingSlots ? (
            <p className="no-slots">Loading slots...</p>
          ) : (
            <div className="slots-grid">
              {slots.map(({ time, available }) => (
                <button
                  key={time}
                  disabled={!available}
                  className={`slot-btn ${!available ? 'taken' : ''} ${selected?.time === time && formatDate(selected.date) === formatDate(selectedDate) ? 'selected' : ''}`}
                  onClick={() => available && handleSlot(time)}
                >
                  {time}
                </button>
              ))}
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
