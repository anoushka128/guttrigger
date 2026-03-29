'use server'

import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { runTriggerAnalysis } from '@/lib/analysis/triggerEngine'

const SEVERE_SYMPTOM_CATEGORIES = [
  'throat_tightness',
  'wheezing',
  'trouble_breathing',
  'swelling_lips',
  'swelling_tongue',
  'fainting',
  'severe_rash',
]

export async function createSymptom(data: {
  timeStarted: string
  severity: number
  categories: string[]
  duration?: string
  onset?: string
  notes?: string
  linkedMealIds?: string[]
}) {
  const user = await requireDbUser()

  const isSevere = data.categories.some(cat => SEVERE_SYMPTOM_CATEGORIES.includes(cat))

  const symptom = await prisma.symptom.create({
    data: {
      userId: user.id,
      timeStarted: new Date(data.timeStarted),
      severity: data.severity,
      categories: data.categories,
      duration: data.duration,
      onset: data.onset,
      notes: data.notes,
      isSevere,
      linkedMeals: data.linkedMealIds
        ? { connect: data.linkedMealIds.map(id => ({ id })) }
        : undefined,
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/timeline')

  await runTriggerAnalysis(user.id)

  return { success: true, symptomId: symptom.id, isSevere }
}

export async function deleteSymptom(symptomId: string) {
  const user = await requireDbUser()
  await prisma.symptom.deleteMany({ where: { id: symptomId, userId: user.id } })
  revalidatePath('/dashboard')
  revalidatePath('/timeline')
}
