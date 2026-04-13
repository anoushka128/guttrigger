import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // Support both cookie-based (web) and Bearer token (mobile) auth
  const authHeader = request.headers.get('authorization')
  let authed = false

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    authed = !!user
  } else {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    authed = !!user
  }

  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set')
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  const body = await request.json()
  // Support both { imageData, mediaType } (web) and { image } (mobile base64)
  const imageData = body.imageData ?? body.image
  const mediaType = body.mediaType ?? 'image/jpeg'
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
