import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  const body = await request.json()
  const { audio, mimeType = 'audio/m4a' } = body

  if (!audio) {
    return NextResponse.json({ error: 'Missing audio data' }, { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType as any,
          data: audio,
        },
      },
      `Listen to this audio. The person is describing food they ate or want to log.
Extract the food name(s) they mentioned.

Return ONLY valid JSON, no markdown:
{"foodName": "the food name they said"}

If multiple foods, combine them: {"foodName": "chicken, rice, and broccoli"}
If unclear or silent, return: {"foodName": ""}`,
    ])

    const text = result.response.text().trim()
    let parsed = { foodName: '' }
    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Gemini transcription error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
