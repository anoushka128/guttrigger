import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const data = await req.json()

  const meal = await prisma.meal.create({
    data: {
      userId: user.id,
      date: new Date(data.date),
      mealType: data.mealType,
      title: data.title,
      location: data.location ?? 'home',
      notes: data.notes,
      logLevel: data.logLevel ?? 1,
      foods: data.foods?.length ? {
        create: data.foods.map((f: any) => ({
          name: f.name,
          portionSize: f.portionSize,
          portionDesc: f.portionDesc,
          category: f.category,
        })),
      } : undefined,
    },
    include: { foods: true },
  })

  return Response.json({ success: true, mealId: meal.id })
}
