'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, UtensilsCrossed, Activity, CheckCircle2 } from 'lucide-react'

const LOG_OPTIONS = [
  {
    href: '/log-meal',
    icon: UtensilsCrossed,
    title: 'Log a Meal',
    description: 'Record what you just ate — takes 15 seconds.',
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    href: '/log-symptom',
    icon: Activity,
    title: 'Log a Symptom',
    description: 'Track bloating, pain, fatigue, or any reaction.',
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
  },
  {
    href: '/check-in',
    icon: CheckCircle2,
    title: 'Daily Check-In',
    description: 'Quick gut health snapshot — energy, sleep, how you feel.',
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
  },
]

export default function LogPage() {
  const router = useRouter()

  return (
    <div className="pt-8 pb-8 space-y-6">
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 active:bg-stone-200 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Log</h1>
          <p className="text-sm text-stone-500">What would you like to track?</p>
        </div>
      </div>

      <div className="space-y-3">
        {LOG_OPTIONS.map(({ href, icon: Icon, title, description, color, border }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-start gap-4 bg-white rounded-2xl border ${border} shadow-sm p-5 active:scale-[0.98] transition-transform`}
          >
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900">{title}</p>
              <p className="text-sm text-stone-500 mt-0.5 leading-snug">{description}</p>
            </div>
            <ChevronLeft size={18} className="text-stone-300 rotate-180 self-center flex-shrink-0" />
          </Link>
        ))}
      </div>

      <p className="text-xs text-stone-400 text-center px-4">
        The more consistently you log, the better your trigger insights will be.
      </p>
    </div>
  )
}
