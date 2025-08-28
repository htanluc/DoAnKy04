import { NextRequest, NextResponse } from 'next/server'

// NOTE: Set OPENAI_API_KEY in environment (e.g., .env.local) and DO NOT expose it on the client

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const { messages, model = 'gpt-4o-mini', temperature = 0.3, max_tokens } = body || {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'Upstream error', detail: err }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: 'Unexpected error', detail: error?.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

