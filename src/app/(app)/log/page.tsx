'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

const QUICK_SYMPTOMS = [
  { id: 'bloating', emoji: '🫧', label: 'Bloating', severity: 5 },
  { id: 'stomach_pain', emoji: '😣', label: 'Stomach Pain', severity: 6 },
  { id: 'gas', emoji: '💨', label: 'Gas', severity: 4 },
  { id: 'nausea', emoji: '🤢', label: 'Nausea', severity: 5 },
  { id: 'fatigue', emoji: '😴', label: 'Fatigue', severity: 4 },
]

export default function LogPage() {
  const router = useRouter()

  function handleQuickSymptom(id: string, severity: number) {
    const params = new URLSearchParams({ quick: id, severity: String(severity) })
    router.push(`/log-symptom?${params.toString()}`)
  }

  return (
    <div className="pt-8 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-900">Log</h1>
          <p className="text-sm text-stone-500">What would you like to track?</p>
        </div>
      </div>

      {/* Main action cards */}
      <div className="space-y-3">
        <Link
          href="/log-meal"
          className="flex items-start gap-4 bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 active:scale-[0.98] transition-transform hover:border-emerald-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
            🍽️
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-stone-900 text-base">Log a Meal</p>
            <p className="text-sm text-stone-500 mt-0.5 leading-snug">
              Record what you ate — takes 15 seconds. Include specific foods for best insights.
            </p>
          </div>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-stone-300 self-center flex-shrink-0">
            <path d="M6 14l6-5-6-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <Link
          href="/log-symptom"
          className="flex items-start gap-4 bg-white rounded-2xl border border-amber-100 shadow-sm p-5 active:scale-[0.98] transition-transform hover:border-amber-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
            😣
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-stone-900 text-base">Log a Symptom</p>
            <p className="text-sm text-stone-500 mt-0.5 leading-snug">
              Track bloating, pain, fatigue, nausea, or any reaction after eating.
            </p>
          </div>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-stone-300 self-center flex-shrink-0">
            <path d="M6 14l6-5-6-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <Link
          href="/check-in"
          className="flex items-start gap-4 bg-white rounded-2xl border border-blue-100 shadow-sm p-5 active:scale-[0.98] transition-transform hover:border-blue-200"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
            📋
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-stone-900 text-base">Daily Check-In</p>
            <p className="text-sm text-stone-500 mt-0.5 leading-snug">
              Quick gut health snapshot — energy, sleep, overall how you feel today.
            </p>
          </div>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-stone-300 self-center flex-shrink-0">
            <path d="M6 14l6-5-6-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Quick symptom presets */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-stone-900 mb-1">Quick symptom log</h2>
        <p className="text-xs text-stone-400 mb-3">Tap to log a symptom instantly with default severity</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_SYMPTOMS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleQuickSymptom(s.id, s.severity)}
              className="flex items-center gap-1.5 bg-stone-50 border border-stone-100 hover:border-amber-200 hover:bg-amber-50/40 text-stone-700 text-sm font-medium px-3 py-2 rounded-xl transition"
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-400 text-center px-4">
        The more consistently you log, the better your trigger insights will be.
      </p>
    </div>
  )
}
