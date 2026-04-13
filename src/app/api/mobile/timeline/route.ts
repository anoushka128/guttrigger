import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [meals, symptoms, checkins] = await Promise.all([
    prisma.meal.findMany({
      where: { userId: user.id, date: { gte: since } },
      include: { foods: true },
      orderBy: { date: 'desc' },
    }),
    prisma.symptom.findMany({
      where: { userId: user.id, timeStarted: { gte: since } },
      orderBy: { timeStarted: 'desc' },
    }),
    prisma.checkIn.findMany({
      where: { userId: user.id, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const items = [
    ...meals.map(m => ({ type: 'meal' as const, date: m.date.toISOString(), data: m })),
    ...symptoms.map(s => ({ type: 'symptom' as const, date: s.timeStarted.toISOString(), data: s })),
    ...checkins.map(c => ({ type: 'checkin' as const, date: c.createdAt.toISOString(), data: c })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return Response.json({ items })
}
