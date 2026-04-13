import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const [results, totalMeals, totalSymptoms] = await Promise.all([
    prisma.analysisResult.findMany({
      where: { userId: user.id },
      orderBy: { confidenceScore: 'desc' },
    }),
    prisma.meal.count({ where: { userId: user.id } }),
    prisma.symptom.count({ where: { userId: user.id } }),
  ])

  const triggers = results.filter(r =>
    r.suspicionLevel === 'high' || r.suspicionLevel === 'moderate' || r.suspicionLevel === 'low'
  )
  const safeFoods = results.filter(r => r.suspicionLevel === 'probably_safe')

  return Response.json({
    triggers,
    safeFoods,
    totalMeals,
    totalSymptoms,
    analysisDate: new Date().toISOString(),
  })
}
