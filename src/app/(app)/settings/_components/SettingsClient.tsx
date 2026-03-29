'use client'

import { useTransition } from 'react'
import { logout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

interface Props {
  userName: string
  userEmail: string
}

export default function SettingsClient({ userName, userEmail }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-60 mt-1"
    >
      <LogOut size={16} />
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
