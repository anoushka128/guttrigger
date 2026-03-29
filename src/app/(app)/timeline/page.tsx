import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'
import { subDays, format, startOfDay, isToday, isYesterday } from 'date-fns'
import { formatTime } from '@/lib/utils'
import TimelineClient, { type DayGroup } from './_components/TimelineClient'

function dayLabel(date: Date): string {
  const d = startOfDay(date)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

interface MealRaw {
  id: string
  date: Date
  mealType: string
  title: string
  location: string
  notes: string | null
  foods: { id: string; name: string }[]
}

interface SymptomRaw {
  id: string
  timeStarted: Date
  severity: number
  categories: string[]
  onset: string | null
  duration: string | null
  notes: string | null
  isSevere: boolean
}

interface CheckInRaw {
  id: string
  timestamp: Date
  feelingScore: number | null
  energyLevel: number | null
  notes: string | null
}

export default async function TimelinePage() {
  const user = await requireDbUser()
  const since = subDays(new Date(), 30)

  const [mealsRaw, symptomsRaw, checkInsRaw] = await Promise.all([
    prisma.meal.findMany({
      where: { userId: user.id, date: { gte: since } },
      include: { foods: true },
      orderBy: { date: 'desc' },
    }),
    prisma.symptom.findMany({
      where: { userId: user.id, timeStarted: { gte: since } },
      orderBy: { timeStarted: 'desc' },
    }),
    prisma.checkIn.findMany({
      where: { userId: user.id, timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
    }),
  ])

  const meals = mealsRaw as unknown as MealRaw[]
  const symptoms = symptomsRaw as unknown as SymptomRaw[]
  const checkIns = checkInsRaw as unknown as CheckInRaw[]

  // Combine into a single chronological list
  type RawEntry =
    | { kind: 'meal'; at: Date; data: MealRaw }
    | { kind: 'symptom'; at: Date; data: SymptomRaw }
    | { kind: 'checkin'; at: Date; data: CheckInRaw }

  const raw: RawEntry[] = [
    ...meals.map((m: MealRaw) => ({ kind: 'meal' as const, at: m.date, data: m })),
    ...symptoms.map((s: SymptomRaw) => ({ kind: 'symptom' as const, at: s.timeStarted, data: s })),
    ...checkIns.map((c: CheckInRaw) => ({ kind: 'checkin' as const, at: c.timestamp, data: c })),
  ]

  // Sort descending (newest first)
  raw.sort((a, b) => b.at.getTime() - a.at.getTime())

  // Group by day
  const dayMap = new Map<string, DayGroup>()
  for (const entry of raw) {
    const dayKey = format(startOfDay(entry.at), 'yyyy-MM-dd')
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        label: dayLabel(entry.at),
        dateKey: dayKey,
        entries: [],
      })
    }
    const group = dayMap.get(dayKey)!

    if (entry.kind === 'meal') {
      const m = entry.data
      group.entries.push({
        type: 'meal',
        id: m.id,
        time: formatTime(m.date),
        title: m.title,
        mealType: m.mealType,
        foodCount: m.foods.length,
        location: m.location,
        notes: m.notes ?? null,
      })
    } else if (entry.kind === 'symptom') {
      const s = entry.data
      group.entries.push({
        type: 'symptom',
        id: s.id,
        time: formatTime(s.timeStarted),
        severity: s.severity,
        categories: s.categories,
        onset: s.onset ?? null,
        duration: s.duration ?? null,
        notes: s.notes ?? null,
        isSevere: s.isSevere,
      })
    } else {
      const c = entry.data
      group.entries.push({
        type: 'checkin',
        id: c.id,
        time: formatTime(c.timestamp),
        feelingScore: c.feelingScore,
        energyLevel: c.energyLevel,
        notes: c.notes ?? null,
      })
    }
  }

  const groups = Array.from(dayMap.values())
  const totalEntries = raw.length

  return (
    <div className="pt-6 pb-8 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Timeline</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {totalEntries === 0
            ? 'No entries in the last 30 days'
            : `${totalEntries} entries over the last 30 days`}
        </p>
      </div>

      {totalEntries === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-10 text-center">
          <p className="text-4xl mb-3">&#128203;</p>
          <p className="text-stone-700 font-medium mb-1">Nothing logged yet</p>
          <p className="text-sm text-stone-400">
            Start by logging a meal, symptom, or daily check-in.
          </p>
        </div>
      ) : (
        <TimelineClient groups={groups} />
      )}
    </div>
  )
}
