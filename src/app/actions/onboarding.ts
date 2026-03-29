'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function completeOnboarding(data: {
  name?: string
  mainGoal: string
  trackedSymptoms: string[]
  knownAllergies: string[]
  suspectedFoods: string[]
  dietaryRestrictions: string[]
  remindersEnabled: boolean
  mealsPerDay: number
}) {
  // 1. Get current user from Supabase
  const supabase = await createClient()
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    redirect('/login')
  }

  // 2. Find or create user in Prisma
  let user = await prisma.user.findUnique({
    where: { id: authUser.id },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        name: data.name ?? null,
      },
    })
  } else if (data.name) {
    // 3. Update user name if provided
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: data.name },
    })
  }

  // 4. Upsert UserProfile with onboardingComplete: true
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      mainGoal: data.mainGoal,
      trackedSymptoms: data.trackedSymptoms,
      knownAllergies: data.knownAllergies,
      suspectedFoods: data.suspectedFoods,
      dietaryRestrictions: data.dietaryRestrictions,
      remindersEnabled: data.remindersEnabled,
      mealsPerDay: data.mealsPerDay,
      onboardingComplete: true,
    },
    update: {
      mainGoal: data.mainGoal,
      trackedSymptoms: data.trackedSymptoms,
      knownAllergies: data.knownAllergies,
      suspectedFoods: data.suspectedFoods,
      dietaryRestrictions: data.dietaryRestrictions,
      remindersEnabled: data.remindersEnabled,
      mealsPerDay: data.mealsPerDay,
      onboardingComplete: true,
    },
  })

  // 5. Create default reminders if enabled
  if (data.remindersEnabled) {
    // Remove any existing default reminders first to avoid duplicates
    await prisma.reminder.deleteMany({
      where: {
        userId: user.id,
        type: 'meal',
      },
    })

    const defaultTimes = ['08:00', '13:00', '19:00']
    const defaultLabels = ['Breakfast reminder', 'Lunch reminder', 'Dinner reminder']

    // Create one reminder per meal slot up to mealsPerDay (max 3 default slots)
    const slotsToCreate = Math.min(data.mealsPerDay, defaultTimes.length)

    await prisma.reminder.createMany({
      data: Array.from({ length: slotsToCreate }, (_, i) => ({
        userId: user!.id,
        type: 'meal',
        time: defaultTimes[i],
        enabled: true,
        label: defaultLabels[i],
      })),
    })
  }

  redirect('/dashboard')
}
