import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const data = await req.json()

  if (data.name) {
    await prisma.user.update({ where: { id: user.id }, data: { name: data.name } })
  }

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      mainGoal: data.mainGoal,
      trackedSymptoms: data.trackedSymptoms ?? [],
      knownAllergies: data.knownAllergies ?? [],
      suspectedFoods: data.suspectedFoods ?? [],
      dietaryRestrictions: data.dietaryRestrictions ?? [],
      remindersEnabled: data.remindersEnabled ?? true,
      mealsPerDay: data.mealsPerDay ?? 3,
      onboardingComplete: true,
    },
    update: {
      mainGoal: data.mainGoal,
      trackedSymptoms: data.trackedSymptoms ?? [],
      knownAllergies: data.knownAllergies ?? [],
      suspectedFoods: data.suspectedFoods ?? [],
      dietaryRestrictions: data.dietaryRestrictions ?? [],
      remindersEnabled: data.remindersEnabled ?? true,
      mealsPerDay: data.mealsPerDay ?? 3,
      onboardingComplete: true,
    },
  })

  if (data.remindersEnabled) {
    await prisma.reminder.deleteMany({ where: { userId: user.id, type: 'meal' } })
    const slots = Math.min(data.mealsPerDay ?? 3, 3)
    const times = ['08:00', '13:00', '19:00']
    const labels = ['Breakfast reminder', 'Lunch reminder', 'Dinner reminder']
    await prisma.reminder.createMany({
      data: Array.from({ length: slots }, (_, i) => ({
        userId: user.id, type: 'meal', time: times[i], enabled: true, label: labels[i],
      })),
    })
  }

  return Response.json({ success: true })
}
