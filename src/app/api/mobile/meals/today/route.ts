import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const meals = await prisma.meal.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    include: { foods: true },
    orderBy: { date: 'desc' },
  })

  return Response.json(meals)
}
