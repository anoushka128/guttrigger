import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const data = await req.json()

  await prisma.checkIn.create({
    data: {
      userId: user.id,
      feelingScore: data.feelingScore,
      energyLevel: data.energyLevel,
      stressLevel: data.stressLevel,
      sleepHours: data.sleepHours,
      sleepQuality: data.sleepQuality,
      hadBM: data.hadBM,
      bmType: data.bmType,
      cravings: data.cravings,
      notes: data.notes,
      symptoms: data.symptoms ?? [],
    },
  })

  return Response.json({ success: true })
}
