import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'
import { runTriggerAnalysis } from '@/lib/analysis/triggerEngine'

const SEVERE = ['throat_tightness','wheezing','trouble_breathing','swelling_lips','swelling_tongue','fainting','severe_rash']

export async function POST(req: NextRequest) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const data = await req.json()
  const isSevere = (data.categories ?? []).some((c: string) => SEVERE.includes(c))

  const symptom = await prisma.symptom.create({
    data: {
      userId: user.id,
      timeStarted: new Date(data.timeStarted),
      severity: data.severity,
      categories: data.categories ?? [],
      duration: data.duration,
      onset: data.onset,
      notes: data.notes,
      isSevere,
      linkedMeals: data.linkedMealIds?.length
        ? { connect: data.linkedMealIds.map((id: string) => ({ id })) }
        : undefined,
    },
  })

  await runTriggerAnalysis(user.id)

  return Response.json({ success: true, symptomId: symptom.id, isSevere })
}
