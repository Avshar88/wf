import { useState } from 'react'
import { getAvailableDates, getSlots, isSlotAvailable, formatDate } from '../utils/availability'
import { getBookings } from '../utils/storage'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function StepDateTime({ barberId, serviceDuration, selected, onSelect }) {
  const dates = getAvailableDates(30)
  const [selectedDate, setSelectedDate] = useState(selected?.date || null)
  const bookings = getBookings()

  const slots = selectedDate
    ? getSlots(selectedDate, serviceDuration).map(time => ({
        time,
        available: isSlotAvailable(bookings, barberId, selectedDate, time, serviceDuration),
      }))
    : []

  function handleDate(date) {
    setSelectedDate(date)
    onSelect(null)
  }

  function handleSlot(time) {
    onSelect({ date: selectedDate, time })
  }

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
              onClick={() => handleDate(d)}
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
          <h3>Available Times</h3>
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
          {slots.every(s => !s.available) && (
            <p className="no-slots">No available slots for this day. Please choose another date.</p>
          )}
        </div>
      )}
    </div>
  )
}
