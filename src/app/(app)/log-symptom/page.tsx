'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSymptom } from '@/app/actions/symptoms'
import { SYMPTOM_CATEGORIES, ONSET_OPTIONS } from '@/lib/utils'

function getNowLocal() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const DURATION_OPTIONS = [
  { id: '15min', label: '15 min' },
  { id: '30min', label: '30 min' },
  { id: '1hr', label: '1 hr' },
  { id: '2_3hr', label: '2–3 hr' },
  { id: 'all_day', label: 'All day' },
]

const ALERT_CATEGORIES = ['rash', 'swelling']

interface TodayMeal {
  id: string
  title: string
  mealType: string
  time: string
}

function getSeverityLabel(value: number) {
  if (value >= 7) return { label: 'Severe', color: 'text-red-600', bg: 'bg-red-100' }
  if (value >= 4) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-100' }
  return { label: 'Mild', color: 'text-emerald-700', bg: 'bg-emerald-100' }
}

export default function LogSymptomPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [timeStarted, setTimeStarted] = useState(getNowLocal)
  const [severity, setSeverity] = useState(3)
  const [categories, setCategories] = useState<string[]>([])
  const [onset, setOnset] = useState('')
  const [duration, setDuration] = useState('')
  const [linkedMealIds, setLinkedMealIds] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [todayMeals, setTodayMeals] = useState<TodayMeal[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState(false)

  // We don't have a client-side meals fetch action, so todayMeals stays empty
  // unless a server action is available. We'll leave this as a placeholder.
  useEffect(() => {
    // Meals would be loaded from a server action or passed as props
    // For now, this section gracefully renders empty
  }, [])

  function toggleCategory(id: string) {
    setCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  function toggleMeal(id: string) {
    setLinkedMealIds(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const showAlert = categories.some(c => ALERT_CATEGORIES.includes(c))
  const { label: sevLabel, color: sevColor, bg: sevBg } = getSeverityLabel(severity)

  async function handleSubmit() {
    if (categories.length === 0) {
      setError('Please select at least one symptom')
      return
    }
    setError(null)

    startTransition(async () => {
      try {
        await createSymptom({
          timeStarted: new Date(timeStarted).toISOString(),
          severity,
          categories,
          onset: onset || undefined,
          duration: duration || undefined,
          notes: notes || undefined,
          linkedMealIds: linkedMealIds.length > 0 ? linkedMealIds : undefined,
        })
        setSuccessBanner(true)
        setTimeout(() => router.push('/dashboard'), 1200)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      }
    })
  }

  const chipBase = 'px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
  const chipSelected = 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
  const chipUnselected = 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:bg-emerald-50/60'

  return (
    <div className="pt-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-stone-900">Log a Symptom</h1>
      </div>

      {/* Success banner */}
      {successBanner && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-emerald-700 text-sm font-medium">
          <span>✓</span> Symptom saved! Redirecting…
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Severe alert */}
      {showAlert && (
        <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 leading-relaxed">
          <p className="font-semibold mb-0.5">Some symptoms may need immediate attention.</p>
          <p>If you&apos;re experiencing throat tightness, trouble breathing, or severe reactions, seek medical attention now.</p>
        </div>
      )}

      <div className="space-y-5">
        {/* Time started */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <label className="block text-sm font-semibold text-stone-700 mb-2">Time started</label>
          <input
            type="datetime-local"
            value={timeStarted}
            onChange={e => setTimeStarted(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Severity slider */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-700">Severity</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold tabular-nums text-stone-900 leading-none">{severity}</span>
              <span className="text-sm text-stone-400 leading-none">/10</span>
              <span className={['text-xs font-semibold px-2 py-0.5 rounded-full', sevColor, sevBg].join(' ')}>
                {sevLabel}
              </span>
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={severity}
            onChange={e => setSeverity(Number(e.target.value))}
            aria-label="Severity"
            className="w-full mb-3"
          />

          <div className="flex justify-between">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setSeverity(n)}
                aria-label={`Set severity to ${n}`}
                className={[
                  'w-7 h-7 rounded-full text-[10px] font-semibold transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  n === severity
                    ? n >= 7
                      ? 'bg-red-500 text-white scale-110'
                      : n >= 4
                      ? 'bg-amber-400 text-white scale-110'
                      : 'bg-emerald-500 text-white scale-110'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
                ].join(' ')}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-2 px-0.5">
            <span className="text-xs text-emerald-600 font-medium">Mild</span>
            <span className="text-xs text-amber-600 font-medium">Moderate</span>
            <span className="text-xs text-red-600 font-medium">Severe</span>
          </div>
        </div>

        {/* Symptom categories */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            Symptoms <span className="text-stone-400 font-normal">(select all that apply)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={[chipBase, categories.includes(cat.id) ? chipSelected : chipUnselected].join(' ')}
              >
                <span className="mr-1">{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Onset */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            When did symptoms start? <span className="text-stone-400 font-normal">(optional)</span>
          </h2>
          <div className="space-y-2">
            {ONSET_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOnset(prev => prev === opt.id ? '' : opt.id)}
                className={[
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  onset === opt.id
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-200 hover:bg-emerald-50/50',
                ].join(' ')}
              >
                <span>{opt.label}</span>
                {onset === opt.id && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-emerald-600">
                    <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">
            Duration <span className="text-stone-400 font-normal">(optional)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDuration(prev => prev === opt.id ? '' : opt.id)}
                className={[chipBase, duration === opt.id ? chipSelected : chipUnselected].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Link to a meal */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-1">
            Link to a meal <span className="text-stone-400 font-normal">(optional)</span>
          </h2>
          <p className="text-xs text-stone-400 mb-3">Connect these symptoms to a meal you logged today</p>
          {todayMeals.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-3">
              No meals logged today yet
            </p>
          ) : (
            <div className="space-y-2">
              {todayMeals.map(meal => (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => toggleMeal(meal.id)}
                  className={[
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                    linkedMealIds.includes(meal.id)
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-stone-200 bg-white hover:border-emerald-200',
                  ].join(' ')}
                >
                  <div className="text-left">
                    <p className="font-medium text-stone-900">{meal.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5 capitalize">{meal.mealType} · {meal.time}</p>
                  </div>
                  <span className={[
                    'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                    linkedMealIds.includes(meal.id) ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300',
                  ].join(' ')}>
                    {linkedMealIds.includes(meal.id) && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Notes <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional context about these symptoms…"
            rows={3}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
          />
        </div>
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-stone-50/90 backdrop-blur-sm border-t border-stone-100 px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || successBanner}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl px-4 py-3.5 transition"
          >
            {isPending ? 'Saving…' : 'Save Symptom'}
          </button>
        </div>
      </div>
    </div>
  )
}
