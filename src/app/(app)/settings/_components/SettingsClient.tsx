'use client'

import { useTransition } from 'react'
import { logout } from '@/app/actions/auth'

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
    <div className="pt-1">
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {isPending ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
