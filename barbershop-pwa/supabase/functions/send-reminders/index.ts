import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_FROM  = Deno.env.get('TWILIO_PHONE_NUMBER')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const BARBERS: Record<number, string> = { 1: 'Karen', 2: 'David', 3: 'Narek', 4: 'Gor' }
const SERVICES: Record<number, string> = { 1: 'Haircut', 2: 'Haircut + Beard', 3: 'Beard Trim', 4: 'Kids Cut' }

async function sendSMS(to: string, body: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }).toString(),
  })
}

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', dateStr)

  if (!bookings?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  for (const b of bookings) {
    const barberName  = BARBERS[b.barber_id] || 'your barber'
    const serviceName = SERVICES[b.service_id] || 'your service'
    const msg =
      `✂️ Reminder from BarberHub!\n` +
      `Hi ${b.name}, your appointment is tomorrow.\n` +
      `${serviceName} with ${barberName} at ${b.time}.\n` +
      `See you then! 💈`
    await sendSMS(b.phone, msg)
  }

  return new Response(JSON.stringify({ sent: bookings.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
