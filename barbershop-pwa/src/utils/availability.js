import { SCHEDULE } from '../data/config'

export function getSlots(date, serviceDuration) {
  const slots = []
  const { openHour, closeHour, slotInterval } = SCHEDULE
  const totalMinutes = (closeHour - openHour) * 60

  for (let m = 0; m + serviceDuration <= totalMinutes; m += slotInterval) {
    const h = openHour + Math.floor(m / 60)
    const min = m % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
  }
  return slots
}

export function isSlotAvailable(bookings, barberId, date, time, serviceDuration) {
  const dateStr = formatDate(date)
  const [newH, newM] = time.split(':').map(Number)
  const newStart = newH * 60 + newM
  const newEnd = newStart + serviceDuration

  return !bookings.some(b => {
    if (b.barber_id !== barberId || b.date !== dateStr) return false
    const [bH, bM] = b.time.split(':').map(Number)
    const bStart = bH * 60 + bM
    const bEnd = bStart + b.service_duration
    return newStart < bEnd && newEnd > bStart
  })
}

export function isWorkDay(date) {
  return SCHEDULE.workDays.includes(date.getDay())
}

export function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getAvailableDates(daysAhead = 30) {
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (isWorkDay(d)) dates.push(d)
  }
  return dates
}
