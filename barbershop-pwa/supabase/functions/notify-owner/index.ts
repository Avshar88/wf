import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TELEGRAM_TOKEN   = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendTelegram(text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  })
  const json = await res.json()
  console.log('Telegram response:', JSON.stringify(json))
  return json
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const { booking, service, barber } = await req.json()

    const msg =
      `📅 <b>New Booking!</b>\n\n` +
      `👤 <b>${booking.name}</b>\n` +
      `📞 ${booking.phone}\n` +
      `✂️ ${service.name} with ${barber.name}\n` +
      `🕐 ${booking.date} at ${booking.time}\n` +
      `💰 $${service.price} (pay on site)`

    await sendTelegram(msg)

    return new Response(JSON.stringify({ ok: true }), {
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
