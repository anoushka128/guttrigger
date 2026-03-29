'use server'

import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCheckIn(data: {
  feelingScore?: number
  energyLevel?: number
  stressLevel?: number
  sleepHours?: number
  sleepQuality?: number
  hadBM?: boolean
  bmType?: string
  cravings?: string
  notes?: string
  symptoms?: string[]
}) {
  const user = await requireDbUser()

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

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
