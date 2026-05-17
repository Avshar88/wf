import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_FROM  = Deno.env.get('TWILIO_PHONE_NUMBER')!
const OWNER_PHONE  = Deno.env.get('OWNER_PHONE')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
  const json = await res.json()
  console.log('Twilio response:', JSON.stringify(json))
  return json
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    console.log('TWILIO_SID:', TWILIO_SID ? 'set' : 'MISSING')
    console.log('TWILIO_TOKEN:', TWILIO_TOKEN ? 'set' : 'MISSING')
    console.log('TWILIO_FROM:', TWILIO_FROM)
    console.log('OWNER_PHONE:', OWNER_PHONE)

    const { booking, service, barber } = await req.json()

    const ownerMsg =
      `New Booking! ${booking.name} - ${service.name} with ${barber.name} on ${booking.date} at ${booking.time}. Phone: ${booking.phone}`

    const result = await sendSMS(OWNER_PHONE, ownerMsg)

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('Error:', String(e))
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
