import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set')
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  const { imageData, mediaType } = await request.json()
  if (!imageData || !mediaType) {
    return NextResponse.json({ error: 'Missing imageData or mediaType' }, { status: 400 })
  }

  // Gemini only supports these image types
  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const resolvedType = supportedTypes.includes(mediaType) ? mediaType : 'image/jpeg'

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: resolvedType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: imageData,
        },
      },
      `Identify all the distinct food items visible in this meal photo.

Return ONLY a valid JSON array, no explanation or markdown:
[{"name": "specific food name", "portionSize": "Small" | "Medium" | "Large"}, ...]

Rules:
- Be specific (e.g. "grilled salmon" not "fish")
- Estimate portion sizes as Small, Medium, or Large
- Include every distinct food item visible
- Return [] if no food is visible`,
    ])

    const text = result.response.text().trim()
    console.log('Gemini raw response:', text)

    let foods = []
    try {
      foods = JSON.parse(text)
    } catch {
      const match = text.match(/\[[\s\S]*\]/)
      if (match) foods = JSON.parse(match[0])
    }

    return NextResponse.json({ foods })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Gemini API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
