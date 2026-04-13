import { NextRequest } from 'next/server'
import { getMobileUser, unauthorized } from '@/lib/mobileAuth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(req)
  if (!user) return unauthorized()

  const { id } = await params
  await prisma.symptom.deleteMany({ where: { id, userId: user.id } })
  return Response.json({ success: true })
}
