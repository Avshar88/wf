const KEY = 'barberhub_bookings'

export function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveBooking(booking) {
  const bookings = getBookings()
  bookings.push(booking)
  localStorage.setItem(KEY, JSON.stringify(bookings))
  return booking
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase()
}
