import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function getDbUser(supabaseUserId: string) {
  return prisma.user.findUnique({
    where: { email: supabaseUserId },
    include: { profile: true },
  })
}

export async function requireDbUser() {
  const user = await requireUser()

  try {
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { profile: true },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        },
        include: { profile: true },
      })
    }

    return dbUser
  } catch (err) {
    console.error('Database error in requireDbUser:', err)
    // Redirect to a helpful error page rather than crashing
    redirect('/login?error=db')
  }
}
