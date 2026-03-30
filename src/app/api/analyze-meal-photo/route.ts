import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { imageData, mediaType } = await request.json()
  if (!imageData || !mediaType) {
    return NextResponse.json({ error: 'Missing imageData or mediaType' }, { status: 400 })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageData },
          },
          {
            type: 'text',
            text: `Identify all the distinct food items visible in this meal photo.

Return ONLY a valid JSON array, no explanation or markdown:
[{"name": "specific food name", "portionSize": "Small" | "Medium" | "Large"}, ...]

Rules:
- Be specific (e.g. "grilled salmon" not "fish")
- Estimate portion sizes as Small, Medium, or Large
- Include every distinct food item visible
- Return [] if no food is visible`,
          },
        ],
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]'

    let foods = []
    try {
      foods = JSON.parse(text)
    } catch {
      const match = text.match(/\[[\s\S]*\]/)
      if (match) foods = JSON.parse(match[0])
    }

    return NextResponse.json({ foods })
  } catch (err) {
    console.error('Claude API error:', err)
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}
