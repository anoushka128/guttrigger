import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key')
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.DATABASE_URL ?? ''
  const maskedUrl = url.replace(/:([^:@]+)@/, ':***@')

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, url: maskedUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, url: maskedUrl, error: message }, { status: 500 })
  }
}
