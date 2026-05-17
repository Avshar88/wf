import { useState } from 'react'
import { getAvailableDates, getSlots, isSlotAvailable, formatDate } from '../utils/availability'
import { getBookings, updateBookingTime } from '../utils/storage'
import { supabase } from '../utils/supabase'
import { BARBERS, SERVICES } from '../data/config'

const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function RescheduleModal({ booking, onClose, onDone }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [saving, setSaving] = useState(false)

  const dates = getAvailableDates(30).filter(d => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return d >= tomorrow
  })

  async function handleDate(date) {
    setSelectedDate(date)
    setSelectedTime(null)
    const all = await getBookings()
    setBookings(all.filter(b => b.id !== booking.id))
  }

  const slots = selectedDate && bookings
    ? getSlots(selectedDate, booking.service_duration).map(time => ({
        time,
        available: isSlotAvailable(bookings, booking.barber_id, selectedDate, time, booking.service_duration),
      }))
    : []

  async function handleSave() {
    if (!selectedDate || !selectedTime) return
    setSaving(true)
    try {
      const dateStr = formatDate(selectedDate)
      await updateBookingTime(booking.id, dateStr, selectedTime)
      const barber  = BARBERS.find(b => b.id === booking.barber_id)
      const service = SERVICES.find(s => s.id === booking.service_id)
      supabase.functions.invoke('notify-owner', {
        body: {
          booking: { ...booking, date: dateStr, time: selectedTime, name: booking.name + ' (Rescheduled)', phone: booking.phone },
          service, barber,
        }
      }).catch(() => {})
      onDone()
    } catch {
      alert('Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Reschedule Appointment</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="date-scroll" style={{ margin: '16px 0 8px' }}>
          {dates.map(d => {
            const active = selectedDate && formatDate(d) === formatDate(selectedDate)
            return (
              <button key={formatDate(d)} className={`date-chip ${active ? 'selected' : ''}`} onClick={() => handleDate(d)}>
                <span className="dc-day">{DAY_NAMES[d.getDay()]}</span>
                <span className="dc-num">{d.getDate()}</span>
                <span className="dc-mon">{MONTH_NAMES[d.getMonth()]}</span>
              </button>
            )
          })}
        </div>

        {selectedDate && (
          <div className="slots-grid" style={{ marginTop: 12 }}>
            {slots.map(({ time, available }) => (
              <button
                key={time}
                disabled={!available}
                className={`slot-btn ${!available ? 'taken' : ''} ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => available && setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        )}

        <button
          className="btn-primary btn-full"
          style={{ marginTop: 20 }}
          disabled={!selectedDate || !selectedTime || saving}
          onClick={handleSave}
        >
          {saving ? 'Saving...' : 'Confirm New Time'}
        </button>
      </div>
    </div>
  )
}
