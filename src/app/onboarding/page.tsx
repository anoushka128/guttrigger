'use client'

import { useState, useTransition } from 'react'
import { completeOnboarding } from '@/app/actions/onboarding'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6

const GOALS = [
  {
    id: 'identify_triggers',
    label: 'Find my trigger foods',
    emoji: '🔍',
    desc: 'Pinpoint exactly which foods are causing reactions',
  },
  {
    id: 'reduce_bloating',
    label: 'Reduce bloating',
    emoji: '💨',
    desc: 'Track patterns and find relief from bloating',
  },
  {
    id: 'reduce_discomfort',
    label: 'Reduce digestive discomfort',
    emoji: '🌿',
    desc: 'Identify foods that cause stomach pain or cramps',
  },
  {
    id: 'identify_allergies',
    label: 'Identify allergy patterns',
    emoji: '⚡',
    desc: 'Spot potential food allergies and sensitivities',
  },
]

const SYMPTOMS = [
  { id: 'bloating', label: 'Bloating' },
  { id: 'stomach_pain', label: 'Stomach pain' },
  { id: 'gas', label: 'Gas' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'reflux', label: 'Reflux' },
  { id: 'diarrhea', label: 'Diarrhea' },
  { id: 'constipation', label: 'Constipation' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'brain_fog', label: 'Brain fog' },
  { id: 'itching', label: 'Itching' },
  { id: 'rash', label: 'Rash' },
  { id: 'headache', label: 'Headache' },
  { id: 'swelling', label: 'Swelling' },
]

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten_free', label: 'Gluten-free' },
  { id: 'dairy_free', label: 'Dairy-free' },
  { id: 'low_fodmap', label: 'Low-FODMAP' },
  { id: 'keto', label: 'Keto' },
  { id: 'none', label: 'None' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string
  goals: string[]
  trackedSymptoms: string[]
  suspectedFoodsRaw: string
  knownAllergiesRaw: string
  dietaryRestrictions: string[]
  remindersEnabled: boolean
  mealsPerDay: number
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            'rounded-full transition-all duration-300',
            i < current
              ? 'w-4 h-2 bg-emerald-400'
              : i === current
              ? 'w-6 h-2 bg-emerald-600'
              : 'w-2 h-2 bg-stone-200',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-stone-900 mb-1.5 leading-tight">{title}</h1>
      <p className="text-stone-500 text-[15px] leading-relaxed">{subtitle}</p>
    </div>
  )
}

function SelectionChip({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        selected
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
          : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50',
      ].join(' ')}
    >
      {selected && <span className="mr-1 text-xs">✓</span>}
      {label}
    </button>
  )
}

function GoalCard({
  goal,
  selected,
  onSelect,
}: {
  goal: (typeof GOALS)[number]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-4 transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5" role="img" aria-label={goal.label}>
          {goal.emoji}
        </span>
        <div>
          <p
            className={`font-medium text-sm ${
              selected ? 'text-emerald-900' : 'text-stone-900'
            }`}
          >
            {goal.label}
          </p>
          <p className="text-stone-500 text-xs mt-0.5">{goal.desc}</p>
        </div>
        {selected && (
          <span className="ml-auto text-emerald-500 text-lg leading-none">✓</span>
        )}
      </div>
    </button>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepWelcome({
  data,
  onChange,
}: {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}) {
  return (
    <div>
      {/* Hero graphic */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-24 h-24 rounded-3xl bg-emerald-100 flex items-center justify-center shadow-sm">
          <span className="text-5xl" role="img" aria-label="Plant">🌿</span>
        </div>
      </div>
      <StepHeader
        title="Welcome to GutTrigger"
        subtitle="Let's personalise your experience. This only takes a minute — and will make your food tracking much more powerful."
      />
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-stone-700">
          What should we call you?
        </label>
        <input
          id="name"
          type="text"
          autoComplete="given-name"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Your first name"
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>
    </div>
  )
}

function StepGoal({
  data,
  onChange,
}: {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}) {
  function toggle(id: string) {
    const next = data.goals.includes(id)
      ? data.goals.filter((g) => g !== id)
      : [...data.goals, id]
    onChange({ goals: next })
  }

  return (
    <div>
      <StepHeader
        title="What are your goals?"
        subtitle="Select all that apply. We'll tailor your insights around these."
      />
      <div className="space-y-3">
        {GOALS.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            selected={data.goals.includes(goal.id)}
            onSelect={() => toggle(goal.id)}
          />
        ))}
      </div>
    </div>
  )
}

function StepSymptoms({
  data,
  onChange,
}: {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}) {
  function toggle(id: string) {
    const next = data.trackedSymptoms.includes(id)
      ? data.trackedSymptoms.filter((s) => s !== id)
      : [...data.trackedSymptoms, id]
    onChange({ trackedSymptoms: next })
  }

  return (
    <div>
      <StepHeader
        title="Which symptoms do you experience?"
        subtitle="Select all that apply. You can change these later."
      />
      <div className="flex flex-wrap gap-2">
        {SYMPTOMS.map((s) => (
          <SelectionChip
            key={s.id}
            label={s.label}
            selected={data.trackedSymptoms.includes(s.id)}
            onToggle={() => toggle(s.id)}
          />
        ))}
      </div>
    </div>
  )
}

function StepKnownInfo({
  data,
  onChange,
}: {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}) {
  return (
    <div>
      <StepHeader
        title="Any foods you already suspect?"
        subtitle="Optional — share what you know so far."
      />
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="suspectedFoods"
            className="block text-sm font-medium text-stone-700"
          >
            Suspected trigger foods
          </label>
          <input
            id="suspectedFoods"
            type="text"
            value={data.suspectedFoodsRaw}
            onChange={(e) => onChange({ suspectedFoodsRaw: e.target.value })}
            placeholder="e.g. dairy, onions, wheat"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          <p className="text-xs text-stone-400">Separate with commas</p>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="knownAllergies"
            className="block text-sm font-medium text-stone-700"
          >
            Known allergies or intolerances
          </label>
          <input
            id="knownAllergies"
            type="text"
            value={data.knownAllergiesRaw}
            onChange={(e) => onChange({ knownAllergiesRaw: e.target.value })}
            placeholder="e.g. peanuts, shellfish, lactose"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          <p className="text-xs text-stone-400">Separate with commas</p>
        </div>
      </div>
    </div>
  )
}

function StepDietary({
  data,
  onChange,
}: {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}) {
  function toggle(id: string) {
    if (id === 'none') {
      // selecting "none" clears everything else
      onChange({
        dietaryRestrictions: data.dietaryRestrictions.includes('none') ? [] : ['none'],
      })
      return
    }
    // selecting a real restriction removes "none"
    const without = data.dietaryRestrictions.filter((r) => r !== 'none')
    const next = without.includes(id)
      ? without.filter((r) => r !== id)
      : [...without, id]
    onChange({ dietaryRestrictions: next })
  }

  return (
    <div>
      <StepHeader
        title="Any dietary restrictions?"
        subtitle="Select all that apply — we'll factor these into your insights."
      />
      <div className="flex flex-wrap gap-2">
        {DIETARY_RESTRICTIONS.map((r) => (
          <SelectionChip
            key={r.id}
            label={r.label}
            selected={data.dietaryRestrictions.includes(r.id)}
            onToggle={() => toggle(r.id)}
          />
        ))}
      </div>
    </div>
  )
}

function StepSetup({
  data,
  onChange,
  isPending,
}: {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
  isPending: boolean
}) {
  return (
    <div>
      <StepHeader
        title="Final setup"
        subtitle="Customise how GutTrigger works for you."
      />
      <div className="space-y-6">
        {/* Reminders toggle */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-stone-200 px-4 py-4">
          <div>
            <p className="text-sm font-medium text-stone-900">Meal reminders</p>
            <p className="text-xs text-stone-500 mt-0.5">
              Get notified to log your meals
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={data.remindersEnabled}
            onClick={() => onChange({ remindersEnabled: !data.remindersEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              data.remindersEnabled ? 'bg-emerald-500' : 'bg-stone-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                data.remindersEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Meals per day stepper */}
        <div className="bg-white rounded-2xl border border-stone-200 px-4 py-4">
          <p className="text-sm font-medium text-stone-900 mb-3">
            How many meals do you eat per day?
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                onChange({ mealsPerDay: Math.max(1, data.mealsPerDay - 1) })
              }
              disabled={data.mealsPerDay <= 1}
              className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Decrease meals per day"
            >
              −
            </button>
            <span className="text-2xl font-semibold text-stone-900 w-8 text-center tabular-nums">
              {data.mealsPerDay}
            </span>
            <button
              type="button"
              onClick={() =>
                onChange({ mealsPerDay: Math.min(6, data.mealsPerDay + 1) })
              }
              disabled={data.mealsPerDay >= 6}
              className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Increase meals per day"
            >
              +
            </button>
          </div>
        </div>

        {isPending && (
          <p className="text-sm text-stone-500 text-center">
            Setting up your account…
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const STEP_LABELS = [
  'Welcome',
  'Your goal',
  'Symptoms',
  'Known info',
  'Diet',
  'Setup',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    goals: [],
    trackedSymptoms: [],
    suspectedFoodsRaw: '',
    knownAllergiesRaw: '',
    dietaryRestrictions: [],
    remindersEnabled: true,
    mealsPerDay: 3,
  })

  function update(updates: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return formData.name.trim().length > 0
      case 1:
        return formData.goals.length > 0
      case 2:
        return formData.trackedSymptoms.length > 0
      case 3:
        return true // optional step
      case 4:
        return true // optional step
      case 5:
        return true
      default:
        return false
    }
  }

  function parseCsv(raw: string): string[] {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  function handleFinish() {
    startTransition(async () => {
      await completeOnboarding({
        name: formData.name.trim() || undefined,
        mainGoal: formData.goals.join(','),
        trackedSymptoms: formData.trackedSymptoms,
        knownAllergies: parseCsv(formData.knownAllergiesRaw),
        suspectedFoods: parseCsv(formData.suspectedFoodsRaw),
        dietaryRestrictions: formData.dietaryRestrictions,
        remindersEnabled: formData.remindersEnabled,
        mealsPerDay: formData.mealsPerDay,
      })
    })
  }

  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div className="flex flex-col min-h-svh bg-stone-50">
      {/* Top bar: back link + step label + dots */}
      <div className="sticky top-0 bg-stone-50/95 backdrop-blur-sm z-10 border-b border-stone-100/60">
        <div className="max-w-md mx-auto px-4 pt-4 pb-1 flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              aria-label="Go back"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="w-8 h-8 flex-shrink-0" />
          )}
          <div className="flex-1" />
          <span className="text-xs text-stone-400 font-medium">
            {step + 1} of {TOTAL_STEPS}
          </span>
        </div>
        {/* Progress bar */}
        <div className="max-w-md mx-auto px-4 pb-3 pt-2">
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-6 pb-36">
        {step === 0 && <StepWelcome data={formData} onChange={update} />}
        {step === 1 && <StepGoal data={formData} onChange={update} />}
        {step === 2 && <StepSymptoms data={formData} onChange={update} />}
        {step === 3 && <StepKnownInfo data={formData} onChange={update} />}
        {step === 4 && <StepDietary data={formData} onChange={update} />}
        {step === 5 && (
          <StepSetup data={formData} onChange={update} isPending={isPending} />
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent pt-8 pb-safe px-4 pb-10">
        <div className="max-w-md mx-auto space-y-2">
          <button
            type="button"
            disabled={!canAdvance() || isPending}
            onClick={isLastStep ? handleFinish : () => setStep((s) => s + 1)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[15px] rounded-2xl px-4 py-4 transition shadow-sm shadow-emerald-200"
          >
            {isPending
              ? 'Setting up your account…'
              : isLastStep
              ? 'Get started →'
              : 'Continue'}
          </button>
          {step === 0 && (
            <p className="text-center text-xs text-stone-400">
              Your data stays private and is never sold.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
