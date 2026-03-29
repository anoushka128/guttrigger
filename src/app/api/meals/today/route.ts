import { NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  try {
    const user = await requireDbUser()
    const meals = await prisma.meal.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
      orderBy: { date: 'asc' },
      select: { id: true, title: true, mealType: true, date: true },
    })
    return NextResponse.json(meals)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
