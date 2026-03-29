'use client'

import { useState } from 'react'
import { SYMPTOM_CATEGORIES, MEAL_TYPES } from '@/lib/utils'

type EntryType = 'meal' | 'symptom' | 'checkin'
type FilterType = 'all' | EntryType

interface MealEntry {
  type: 'meal'
  id: string
  time: string
  title: string
  mealType: string
  foodCount: number
  location: string
  notes: string | null
}

interface SymptomEntry {
  type: 'symptom'
  id: string
  time: string
  severity: number
  categories: string[]
  onset: string | null
  duration: string | null
  notes: string | null
  isSevere: boolean
}

interface CheckInEntry {
  type: 'checkin'
  id: string
  time: string
  feelingScore: number | null
  energyLevel: number | null
  notes: string | null
}

type TimelineEntry = MealEntry | SymptomEntry | CheckInEntry

export interface DayGroup {
  label: string
  dateKey: string
  entries: TimelineEntry[]
}

interface TimelineClientProps {
  groups: DayGroup[]
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'meal', label: 'Meals' },
  { value: 'symptom', label: 'Symptoms' },
  { value: 'checkin', label: 'Check-ins' },
]

function getMealTypeEmoji(mealType: string): string {
  return MEAL_TYPES.find((t) => t.id === mealType)?.emoji ?? '🍽️'
}

function getFeelingEmoji(score: number | null): string {
  if (score === null) return '😐'
  if (score >= 8) return '😊'
  if (score >= 6) return '🙂'
  if (score >= 4) return '😐'
  if (score >= 2) return '😕'
  return '😣'
}

function MealCard({ entry }: { entry: MealEntry }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left bg-white border border-stone-100 rounded-2xl shadow-sm p-4 transition-colors hover:border-emerald-100"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg shrink-0">
          {getMealTypeEmoji(entry.mealType)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900 truncate">{entry.title}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {MEAL_TYPES.find((t) => t.id === entry.mealType)?.label ?? entry.mealType}
            {' · '}
            {entry.foodCount} item{entry.foodCount !== 1 ? 's' : ''}
            {entry.location !== 'home' && ` · ${entry.location}`}
          </p>
        </div>
        <span className="text-xs text-stone-400 shrink-0">{entry.time}</span>
      </div>
      {expanded && entry.notes && (
        <p className="mt-3 text-xs text-stone-500 leading-relaxed border-t border-stone-50 pt-3">
          {entry.notes}
        </p>
      )}
    </button>
  )
}

function SymptomCard({ entry }: { entry: SymptomEntry }) {
  const [expanded, setExpanded] = useState(false)
  const severityColor =
    entry.severity >= 7
      ? 'bg-red-100 text-red-700 border-red-200'
      : entry.severity >= 4
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
  const cardBorder = entry.isSevere
    ? 'border-red-200 bg-red-50'
    : entry.severity >= 7
      ? 'border-amber-100'
      : 'border-stone-100'

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className={`w-full text-left bg-white border rounded-2xl shadow-sm p-4 transition-colors hover:border-amber-100 ${cardBorder}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-lg shrink-0">
          😣
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1">
            {entry.categories.slice(0, 3).map((cat) => {
              const info = SYMPTOM_CATEGORIES.find((c) => c.id === cat)
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-0.5 text-xs bg-stone-50 text-stone-600 border border-stone-100 rounded-full px-2 py-0.5"
                >
                  {info?.emoji} {info?.label ?? cat}
                </span>
              )
            })}
            {entry.categories.length > 3 && (
              <span className="text-xs text-stone-400">
                +{entry.categories.length - 3} more
              </span>
            )}
          </div>
          {entry.onset && (
            <p className="text-xs text-stone-400">Onset: {entry.onset}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${severityColor}`}
          >
            {entry.severity}
          </span>
          <span className="text-xs text-stone-400">{entry.time}</span>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 border-t border-stone-50 pt-3 space-y-1">
          {entry.duration && (
            <p className="text-xs text-stone-500">Duration: {entry.duration}</p>
          )}
          {entry.notes && (
            <p className="text-xs text-stone-500 leading-relaxed">{entry.notes}</p>
          )}
          {!entry.duration && !entry.notes && (
            <p className="text-xs text-stone-400">No additional notes</p>
          )}
        </div>
      )}
    </button>
  )
}

function CheckInCard({ entry }: { entry: CheckInEntry }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left bg-white border border-stone-100 rounded-2xl shadow-sm p-4 transition-colors hover:border-stone-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-lg shrink-0">
          {getFeelingEmoji(entry.feelingScore)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900">Daily Check-in</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {entry.feelingScore !== null && `Feeling ${entry.feelingScore}/10`}
            {entry.feelingScore !== null && entry.energyLevel !== null && ' · '}
            {entry.energyLevel !== null && `Energy ${entry.energyLevel}/10`}
            {entry.feelingScore === null && entry.energyLevel === null && 'Completed'}
          </p>
        </div>
        <span className="text-xs text-stone-400 shrink-0">{entry.time}</span>
      </div>
      {expanded && entry.notes && (
        <p className="mt-3 text-xs text-stone-500 leading-relaxed border-t border-stone-50 pt-3">
          {entry.notes}
        </p>
      )}
    </button>
  )
}

export default function TimelineClient({ groups }: TimelineClientProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered =
    filter === 'all'
      ? groups
      : groups
          .map((g) => ({ ...g, entries: g.entries.filter((e) => e.type === filter) }))
          .filter((g) => g.entries.length > 0)

  return (
    <div className="space-y-5">
      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={[
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150',
              filter === opt.value
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Day groups */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
          <p className="text-stone-400 text-sm">Nothing to show for this filter</p>
        </div>
      ) : (
        filtered.map((group) => (
          <div key={group.dateKey}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-semibold text-stone-700">{group.label}</h2>
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-xs text-stone-400">{group.entries.length} entries</span>
            </div>

            {/* Entries */}
            <div className="space-y-2">
              {group.entries.map((entry) => {
                if (entry.type === 'meal') return <MealCard key={entry.id} entry={entry} />
                if (entry.type === 'symptom') return <SymptomCard key={entry.id} entry={entry} />
                return <CheckInCard key={entry.id} entry={entry} />
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
