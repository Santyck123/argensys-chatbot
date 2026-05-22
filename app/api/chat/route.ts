import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || ''

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()
    if (!message || !sessionId)
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    if (!N8N_WEBHOOK_URL)
      return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 })

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
    })

    if (!response.ok) throw new Error(`n8n status ${response.status}`)

    const data = await response.json()
    const botResponse =
      data?.response || data?.output || data?.message ||
      (typeof data === 'string' ? data : 'No pude procesar tu mensaje.')

    return NextResponse.json({ response: botResponse })
  } catch (error) {
    console.error('Error en /api/chat:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
