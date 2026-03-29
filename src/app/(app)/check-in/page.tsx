'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckIn } from '@/app/actions/checkin'
import { SYMPTOM_CATEGORIES } from '@/lib/utils'

// Feeling emoji scale (maps 1–5 emoji to 1–10 internal score)
const FEELING_SCALE = [
  { emoji: '😣', label: 'Rough', score: 1 },
  { emoji: '😕', label: 'Not great', score: 3 },
  { emoji: '😐', label: 'Okay', score: 5 },
  { emoji: '🙂', label: 'Good', score: 7 },
  { emoji: '😊', label: 'Great', score: 10 },
]

const ENERGY_SCALE = [
  { emoji: '🪫', label: 'Drained', value: 1 },
  { emoji: '😴', label: 'Low', value: 2 },
  { emoji: '⚡', label: 'Okay', value: 3 },
  { emoji: '🔋', label: 'Good', value: 4 },
  { emoji: '🚀', label: 'High', value: 5 },
]

const STRESS_SCALE = [
  { emoji: '😌', label: 'Calm', value: 1 },
  { emoji: '🙂', label: 'Relaxed', value: 2 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😟', label: 'Stressed', value: 4 },
  { emoji: '😤', label: 'Overwhelmed', value: 5 },
]

const SLEEP_HOURS = ['4', '5', '6', '7', '8', '9+']
const SLEEP_QUALITY = [
  { id: 'poor', label: 'Poor', color: 'text-red-600' },
  { id: 'ok', label: 'OK', color: 'text-amber-600' },
  { id: 'good', label: 'Good', color: 'text-emerald-600' },
]

const BM_TYPE = [
  { id: 'normal', label: 'Normal' },
  { id: 'loose', label: 'Loose' },
  { id: 'constipated', label: 'Constipated' },
]

// Abbreviated symptom list for check-in
const CHECKIN_SYMPTOMS = SYMPTOM_CATEGORIES.slice(0, 10)

export default function CheckInPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [feelingIdx, setFeelingIdx] = useState<number | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [energyIdx, setEnergyIdx] = useState<number | null>(null)
  const [stressIdx, setStressIdx] = useState<number | null>(null)
  const [sleepHours, setSleepHours] = useState<string>('')
  const [sleepQuality, setSleepQuality] = useState<string>('')
  const [hadBM, setHadBM] = useState<boolean | null>(null)
  const [bmType, setBmType] = useState<string>('')
  const [cravings, setCravings] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function toggleSymptom(id: string) {
    setSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit() {
    setError(null)

    // Map sleep quality to number
    const sleepQualityMap: Record<string, number> = { poor: 1, ok: 2, good: 3 }
    const sleepHoursNum = sleepHours === '9+' ? 9 : sleepHours ? Number(sleepHours) : undefined

    startTransition(async () => {
      try {
        await createCheckIn({
          feelingScore: feelingIdx !== null ? FEELING_SCALE[feelingIdx].score : undefined,
          energyLevel: energyIdx !== null ? ENERGY_SCALE[energyIdx].value : undefined,
          stressLevel: stressIdx !== null ? STRESS_SCALE[stressIdx].value : undefined,
          sleepHours: sleepHoursNum,
          sleepQuality: sleepQuality ? sleepQualityMap[sleepQuality] : undefined,
          hadBM: hadBM ?? undefined,
          bmType: bmType || undefined,
          cravings: cravings || undefined,
          notes: notes || undefined,
          symptoms,
        })
        // createCheckIn redirects to /dashboard on success
      } catch (e) {
        // createCheckIn uses redirect() which throws — only catch real errors
        const msg = e instanceof Error ? e.message : ''
        if (!msg.includes('NEXT_REDIRECT')) {
          setError('Something went wrong. Please try again.')
        }
      }
    })
  }

  const chipBase = 'px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
  const chipSelected = 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
  const chipUnselected = 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:bg-emerald-50/60'

  function EmojiScaleButton({
    emoji,
    label,
    selected,
    onClick,
  }: {
    emoji: string
    label: string
    selected: boolean
    onClick: () => void
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          'flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
          selected
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-stone-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50',
        ].join(' ')}
      >
        <span className={['text-2xl leading-none transition-transform', selected ? 'scale-125' : ''].join(' ')}>
          {emoji}
        </span>
        <span className={['text-[10px] font-medium leading-none', selected ? 'text-emerald-700' : 'text-stone-400'].join(' ')}>
          {label}
        </span>
      </button>
    )
  }

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
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Daily Check-in</h1>
          <p className="text-xs text-stone-400 mt-0.5">Takes about 60 seconds</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* 1. How do you feel? */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">How do you feel right now?</h2>
          <div className="grid grid-cols-5 gap-2">
            {FEELING_SCALE.map((item, idx) => (
              <EmojiScaleButton
                key={item.score}
                emoji={item.emoji}
                label={item.label}
                selected={feelingIdx === idx}
                onClick={() => setFeelingIdx(prev => prev === idx ? null : idx)}
              />
            ))}
          </div>
        </div>

        {/* 2. Symptoms right now */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-1">Any symptoms right now?</h2>
          <p className="text-xs text-stone-400 mb-3">Select all that apply, or skip if none</p>
          <div className="flex flex-wrap gap-2">
            {CHECKIN_SYMPTOMS.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleSymptom(cat.id)}
                className={[chipBase, symptoms.includes(cat.id) ? chipSelected : chipUnselected].join(' ')}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Energy level */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Energy level</h2>
          <div className="grid grid-cols-5 gap-2">
            {ENERGY_SCALE.map((item, idx) => (
              <EmojiScaleButton
                key={item.value}
                emoji={item.emoji}
                label={item.label}
                selected={energyIdx === idx}
                onClick={() => setEnergyIdx(prev => prev === idx ? null : idx)}
              />
            ))}
          </div>
        </div>

        {/* 4. Stress level */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Stress level</h2>
          <div className="grid grid-cols-5 gap-2">
            {STRESS_SCALE.map((item, idx) => (
              <EmojiScaleButton
                key={item.value}
                emoji={item.emoji}
                label={item.label}
                selected={stressIdx === idx}
                onClick={() => setStressIdx(prev => prev === idx ? null : idx)}
              />
            ))}
          </div>
        </div>

        {/* 5. Sleep */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Sleep last night</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-stone-500 mb-2">Hours</p>
              <div className="flex flex-wrap gap-2">
                {SLEEP_HOURS.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSleepHours(prev => prev === h ? '' : h)}
                    className={[chipBase, sleepHours === h ? chipSelected : chipUnselected].join(' ')}
                  >
                    {h} hrs
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-2">Quality</p>
              <div className="flex gap-2">
                {SLEEP_QUALITY.map(q => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSleepQuality(prev => prev === q.id ? '' : q.id)}
                    className={[chipBase, sleepQuality === q.id ? chipSelected : chipUnselected].join(' ')}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Bowel movement */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Bowel movement today?</h2>
          <div className="flex gap-3 mb-3">
            {[
              { val: true, label: 'Yes' },
              { val: false, label: 'No' },
            ].map(opt => (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() => {
                  setHadBM(prev => prev === opt.val ? null : opt.val)
                  if (!opt.val) setBmType('')
                }}
                className={[
                  'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  hadBM === opt.val
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-200',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {hadBM === true && (
            <div>
              <p className="text-xs text-stone-500 mb-2">Type</p>
              <div className="flex gap-2">
                {BM_TYPE.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBmType(prev => prev === t.id ? '' : t.id)}
                    className={[chipBase, bmType === t.id ? chipSelected : chipUnselected].join(' ')}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. Cravings */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Cravings? <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={cravings}
            onChange={e => setCravings(e.target.value)}
            placeholder='e.g. "sweets", "salty", "carbs"'
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* 8. Notes */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Notes <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything else you want to note today…"
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
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl px-4 py-3.5 transition"
          >
            {isPending ? 'Saving…' : 'Save Check-in'}
          </button>
        </div>
      </div>
    </div>
  )
}
