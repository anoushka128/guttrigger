import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getMobileUser(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null

  const token = auth.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  // Find or create DB user
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
      },
      include: { profile: true },
    })
  }

  return dbUser
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
