import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_FROM  = Deno.env.get('TWILIO_PHONE_NUMBER')!
const OWNER_PHONE  = Deno.env.get('OWNER_PHONE')!

async function sendSMS(to: string, body: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }).toString(),
  })
  return res.json()
}

serve(async (req) => {
  const { booking, service, barber } = await req.json()

  const ownerMsg =
    `📅 New Booking!\n` +
    `👤 ${booking.name} · ${booking.phone}\n` +
    `✂️ ${service.name} with ${barber.name}\n` +
    `🕐 ${booking.date} at ${booking.time}`

  await sendSMS(OWNER_PHONE, ownerMsg)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
