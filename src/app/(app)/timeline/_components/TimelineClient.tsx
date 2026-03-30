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

const FILTER_OPTIONS: { value: FilterType; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '📋' },
  { value: 'meal', label: 'Meals', emoji: '🍽️' },
  { value: 'symptom', label: 'Symptoms', emoji: '😣' },
  { value: 'checkin', label: 'Check-ins', emoji: '✅' },
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

// Parse time strings like "2:30 PM" to minutes since midnight for proximity check
function parseTimeToMinutes(timeStr: string): number | null {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i)
  if (!match) return null
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const ampm = match[3]?.toUpperCase()
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function MealCard({ entry }: { entry: MealEntry }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left bg-white border border-emerald-100 rounded-2xl shadow-sm p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg shrink-0">
          {getMealTypeEmoji(entry.mealType)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900 truncate">{entry.title}</p>
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
        <p className="mt-3 text-xs text-stone-500 leading-relaxed border-t border-emerald-50 pt-3">
          {entry.notes}
        </p>
      )}
    </button>
  )
}

function SymptomCard({ entry, nearMeal }: { entry: SymptomEntry; nearMeal: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const severityColor =
    entry.severity >= 7
      ? 'bg-red-100 text-red-700 border-red-200'
      : entry.severity >= 4
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
  const cardBorder = entry.isSevere
    ? 'border-red-200 bg-red-50/50'
    : entry.severity >= 7
      ? 'border-amber-200'
      : 'border-amber-100'

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`w-full text-left bg-white border rounded-2xl shadow-sm p-4 transition-colors hover:border-amber-200 ${cardBorder}`}
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
                    className="inline-flex items-center gap-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5"
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
          <div className="mt-3 border-t border-amber-50 pt-3 space-y-1">
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

      {/* Possible connection hint */}
      {nearMeal && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
          <span className="text-xs">🔗</span>
          <p className="text-xs text-amber-700 font-medium">Symptoms appeared close to a meal — possible connection</p>
        </div>
      )}
    </div>
  )
}

function CheckInCard({ entry }: { entry: CheckInEntry }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left bg-white border border-blue-100 rounded-2xl shadow-sm p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/20"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg shrink-0">
          {getFeelingEmoji(entry.feelingScore)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900">Daily Check-in</p>
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
        <p className="mt-3 text-xs text-stone-500 leading-relaxed border-t border-blue-50 pt-3">
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
              'shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150',
              filter === opt.value
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300',
            ].join(' ')}
          >
            <span className="text-base leading-none">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Day groups */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-10 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm font-medium text-stone-600 mb-1">Nothing to show</p>
          <p className="text-xs text-stone-400">No entries match this filter</p>
        </div>
      ) : (
        filtered.map((group) => {
          const mealCount = group.entries.filter(e => e.type === 'meal').length
          const symptomCount = group.entries.filter(e => e.type === 'symptom').length
          const checkinCount = group.entries.filter(e => e.type === 'checkin').length

          const summaryParts: string[] = []
          if (mealCount > 0) summaryParts.push(`${mealCount} meal${mealCount !== 1 ? 's' : ''}`)
          if (symptomCount > 0) summaryParts.push(`${symptomCount} symptom${symptomCount !== 1 ? 's' : ''}`)
          if (checkinCount > 0) summaryParts.push(`${checkinCount} check-in${checkinCount !== 1 ? 's' : ''}`)

          // Build a set of meal times for proximity detection
          const mealTimesInMinutes = group.entries
            .filter((e): e is MealEntry => e.type === 'meal')
            .map(e => parseTimeToMinutes(e.time))
            .filter((t): t is number => t !== null)

          return (
            <div key={group.dateKey}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <h2 className="text-sm font-bold text-stone-800">{group.label}</h2>
                  <p className="text-xs text-stone-400">{summaryParts.join(' · ')}</p>
                </div>
                <div className="flex-1 h-px bg-stone-100" />
              </div>

              {/* Timeline entries with left line */}
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-stone-100 rounded-full" />

                <div className="space-y-2 pl-10">
                  {group.entries.map((entry) => {
                    // Dot color by type
                    const dotColor =
                      entry.type === 'meal'
                        ? 'bg-emerald-400 border-emerald-200'
                        : entry.type === 'symptom'
                          ? 'bg-amber-400 border-amber-200'
                          : 'bg-blue-400 border-blue-200'

                    // Check if this symptom is within 3 hours of a meal
                    let nearMeal = false
                    if (entry.type === 'symptom') {
                      const sympTime = parseTimeToMinutes(entry.time)
                      if (sympTime !== null) {
                        nearMeal = mealTimesInMinutes.some(
                          mealTime => Math.abs(sympTime - mealTime) <= 180
                        )
                      }
                    }

                    return (
                      <div key={entry.id} className="relative">
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-7 top-4 w-3 h-3 rounded-full border-2 ${dotColor}`}
                          style={{ transform: 'translateX(-50%)' }}
                        />
                        {entry.type === 'meal' && <MealCard entry={entry} />}
                        {entry.type === 'symptom' && <SymptomCard entry={entry} nearMeal={nearMeal} />}
                        {entry.type === 'checkin' && <CheckInCard entry={entry} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
