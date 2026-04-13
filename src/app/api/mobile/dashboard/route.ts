import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [todayMeals, recentSymptoms, topTriggers, hasCheckedInToday] = await Promise.all([
    prisma.meal.findMany({
      where: { userId: user.id, date: { gte: todayStart, lte: todayEnd } },
      include: { foods: true },
      orderBy: { date: 'asc' },
    }),
    prisma.symptom.findMany({
      where: { userId: user.id },
      orderBy: { timeStarted: 'desc' },
      take: 5,
    }),
    prisma.analysisResult.findMany({
      where: { userId: user.id, suspicionLevel: { in: ['high', 'moderate'] } },
      orderBy: { confidenceScore: 'desc' },
      take: 5,
    }),
    prisma.checkIn.findFirst({
      where: { userId: user.id, createdAt: { gte: todayStart, lte: todayEnd } },
    }),
  ])

  const safeFoods = await prisma.analysisResult.findMany({
    where: { userId: user.id, suspicionLevel: 'probably_safe' },
    orderBy: { exposureCount: 'desc' },
    take: 10,
  })

  // Streak: count consecutive days with at least one meal or symptom logged
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentMeals = await prisma.meal.findMany({
    where: { userId: user.id, date: { gte: thirtyDaysAgo } },
    select: { date: true },
  })
  const activeDays = new Set(recentMeals.map(m => m.date.toDateString()))
  let streakDays = 0
  const check = new Date()
  while (activeDays.has(check.toDateString())) {
    streakDays++
    check.setDate(check.getDate() - 1)
  }

  return Response.json({
    user: { name: user.name, email: user.email },
    todayMeals,
    recentSymptoms,
    topTriggers,
    safeFoods,
    hasCheckedInToday: !!hasCheckedInToday,
    streakDays,
  })
}
