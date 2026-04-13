import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  return Response.json({
    user: { id: user.id, name: user.name, email: user.email },
    profile: user.profile ? {
      mainGoal: (user.profile as any).mainGoal,
      trackedSymptoms: (user.profile as any).trackedSymptoms,
      knownAllergies: (user.profile as any).knownAllergies,
      suspectedFoods: (user.profile as any).suspectedFoods,
      dietaryRestrictions: (user.profile as any).dietaryRestrictions,
      remindersEnabled: (user.profile as any).remindersEnabled,
      mealsPerDay: (user.profile as any).mealsPerDay,
      onboardingComplete: (user.profile as any).onboardingComplete,
    } : null,
  })
}

export async function PUT(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const body = await req.json()

  if (body.name) {
    await prisma.user.update({ where: { id: user.id }, data: { name: body.name } })
  }

  if (body.mainGoal !== undefined) {
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...body },
      update: body,
    })
  }

  return Response.json({ success: true })
}
