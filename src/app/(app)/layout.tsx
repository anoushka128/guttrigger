import { redirect } from 'next/navigation'
import { requireDbUser } from '@/lib/auth'
import AppShell from '@/components/layout/AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireDbUser()

  if (!user.profile || !user.profile.onboardingComplete) {
    redirect('/onboarding')
  }

  return <AppShell>{children}</AppShell>
}
