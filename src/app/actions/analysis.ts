'use server'

import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { runTriggerAnalysis } from '@/lib/analysis/triggerEngine'

export async function triggerAnalysisForUser() {
  const user = await requireDbUser()
  await runTriggerAnalysis(user.id)
  revalidatePath('/insights')
  revalidatePath('/dashboard')
}
