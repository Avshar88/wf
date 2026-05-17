import { supabase } from './supabase'

export async function getBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function saveBooking(booking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelBooking(id) {
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw error
}

export async function updateBookingTime(id, date, time) {
  const { error } = await supabase
    .from('bookings')
    .update({ date, time })
    .eq('id', id)
  if (error) throw error
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase()
}

export function canCancel(booking) {
  const appt = new Date(`${booking.date}T${booking.time}:00`)
  return (appt - new Date()) > 60 * 60 * 1000 // > 1 hour
}

export function canChange(booking) {
  const appt = new Date(`${booking.date}T${booking.time}:00`)
  return (appt - new Date()) > 24 * 60 * 60 * 1000 // > 1 day
}
