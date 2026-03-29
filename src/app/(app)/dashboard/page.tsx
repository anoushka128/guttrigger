import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'
import { MEAL_TYPES, SYMPTOM_CATEGORIES } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import WeeklyChart from './_components/WeeklyChart'
import QuickActionCard from './_components/QuickActionCard'

type MealRow = {
  id: string
  date: Date
  mealType: string
  title: string
  foods: { id: string }[]
}

type SymptomRow = {
  id: string
  timeStarted: Date
  severity: number
  categories: string[]
}

type AnalysisRow = {
  id: string
  foodName: string
  foodCategory: string | null
  suspicionLevel: string
  confidenceScore: number
  exposureCount: number
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getMealTypeEmoji(mealType: string): string {
  return MEAL_TYPES.find((t) => t.id === mealType)?.emoji ?? '🍽️'
}

export default async function DashboardPage() {
  const user = await requireDbUser()
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  // Fetch all data in parallel
  const [
    todayMeals,
    todaySymptoms,
    todayCheckIn,
    triggerFoods,
    safeFoods,
    weeklySymptoms,
  ] = await Promise.all([
    prisma.meal.findMany({
      where: {
        userId: user.id,
        date: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { date: 'desc' },
      include: { foods: true },
    }),
    prisma.symptom.findMany({
      where: {
        userId: user.id,
        timeStarted: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { timeStarted: 'desc' },
    }),
    prisma.checkIn.findFirst({
      where: {
        userId: user.id,
        timestamp: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.analysisResult.findMany({
      where: {
        userId: user.id,
        suspicionLevel: { in: ['high', 'moderate'] },
      },
      orderBy: { confidenceScore: 'desc' },
      take: 3,
    }),
    prisma.analysisResult.findMany({
      where: {
        userId: user.id,
        suspicionLevel: 'probably_safe',
      },
      orderBy: { exposureCount: 'desc' },
      take: 3,
    }),
    // Fetch last 7 days of symptoms
    prisma.symptom.findMany({
      where: {
        userId: user.id,
        timeStarted: {
          gte: startOfDay(subDays(now, 6)),
          lte: todayEnd,
        },
      },
      select: { timeStarted: true },
    }),
  ])

  // Build weekly chart data (last 7 days including today)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i)
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)
    const count = weeklySymptoms.filter(
      (s: { timeStarted: Date }) =>
        s.timeStarted >= dayStart && s.timeStarted <= dayEnd,
    ).length
    return {
      date: format(day, 'EEE'),
      count,
    }
  })

  const firstName = user.name?.split(' ')[0] ?? 'there'
  const todayFormatted = format(now, 'EEEE, MMMM d')

  return (
    <div className="pt-6 pb-4 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">{todayFormatted}</p>
      </div>

      {/* Today's summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-emerald-600">
            {todayMeals.length}
          </span>
          <span className="text-xs text-stone-500 text-center leading-tight">
            Meals logged
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-amber-500">
            {todaySymptoms.length}
          </span>
          <span className="text-xs text-stone-500 text-center leading-tight">
            Symptoms
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col items-center gap-1">
          {todayCheckIn ? (
            <span className="text-2xl font-bold text-emerald-600">✓</span>
          ) : (
            <span className="text-2xl font-bold text-stone-300">—</span>
          )}
          <span className="text-xs text-stone-500 text-center leading-tight">
            Check-in
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickActionCard
          href="/log-meal"
          emoji="🍽️"
          title="Log Meal"
          subtitle="Record what you ate"
        />
        <QuickActionCard
          href="/log-symptom"
          emoji="😣"
          title="Log Symptom"
          subtitle="Track how you feel"
        />
        <QuickActionCard
          href="/check-in"
          emoji="✓"
          title="Check In"
          subtitle="Daily wellness check"
        />
        <QuickActionCard
          href="/insights"
          emoji="💡"
          title="Insights"
          subtitle="See your patterns"
        />
      </div>

      {/* Today's meals card */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-900">
            Today&apos;s Meals
          </h2>
          <Link
            href="/log-meal"
            className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
          >
            + Add
          </Link>
        </div>
        {todayMeals.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">
            No meals logged yet today
          </p>
        ) : (
          <ul className="divide-y divide-stone-50 -mx-1">
            {(todayMeals as MealRow[]).map((meal) => (
              <li key={meal.id} className="flex items-center gap-3 py-2.5 px-1">
                <span className="text-xl shrink-0">
                  {getMealTypeEmoji(meal.mealType)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {meal.title}
                  </p>
                  <p className="text-xs text-stone-400 capitalize">
                    {MEAL_TYPES.find((t) => t.id === meal.mealType)?.label ??
                      meal.mealType}
                  </p>
                </div>
                <span className="text-xs text-stone-400 shrink-0">
                  {formatTime(meal.date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Today's symptoms card */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-900">
            Today&apos;s Symptoms
          </h2>
          <Link
            href="/log-symptom"
            className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
          >
            + Add
          </Link>
        </div>
        {todaySymptoms.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">
            No symptoms today 🎉
          </p>
        ) : (
          <ul className="divide-y divide-stone-50 -mx-1">
            {(todaySymptoms as SymptomRow[]).map((symptom) => (
              <li
                key={symptom.id}
                className="flex items-center gap-3 py-2.5 px-1"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {symptom.categories.slice(0, 3).map((cat: string) => {
                      const info = SYMPTOM_CATEGORIES.find(
                        (c) => c.id === cat,
                      )
                      return (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-0.5 text-xs bg-stone-50 text-stone-600 rounded-full px-2 py-0.5 border border-stone-100"
                        >
                          {info?.emoji}{' '}
                          {info?.label ?? cat}
                        </span>
                      )
                    })}
                    {symptom.categories.length > 3 && (
                      <span className="text-xs text-stone-400">
                        +{symptom.categories.length - 3} more
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400">
                    {formatTime(symptom.timeStarted)}
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={[
                      'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                      symptom.severity >= 7
                        ? 'bg-red-100 text-red-700'
                        : symptom.severity >= 4
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-yellow-100 text-yellow-700',
                    ].join(' ')}
                  >
                    {symptom.severity}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Possible Trigger Foods */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-900">
            Possible Trigger Foods
          </h2>
          <Link
            href="/insights"
            className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
          >
            See all
          </Link>
        </div>
        {triggerFoods.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">
            Keep logging to unlock insights
          </p>
        ) : (
          <ul className="space-y-2">
            {(triggerFoods as AnalysisRow[]).map((food) => (
              <li key={food.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 capitalize truncate">
                    {food.foodName}
                  </p>
                  {food.foodCategory && (
                    <p className="text-xs text-stone-400 capitalize">
                      {food.foodCategory}
                    </p>
                  )}
                </div>
                <Badge
                  level={food.suspicionLevel as 'high' | 'moderate'}
                />
              </li>
            ))}
            {triggerFoods.length < 3 && (
              <p className="text-xs text-stone-400 pt-1">
                Keep logging to unlock more insights
              </p>
            )}
          </ul>
        )}
      </div>

      {/* Safe Foods */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-900">
            Safe Foods
          </h2>
          <Link
            href="/insights"
            className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
          >
            See all
          </Link>
        </div>
        {safeFoods.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">
            You&apos;re doing great — keep logging meals and we&apos;ll identify
            your safe foods soon 🥦
          </p>
        ) : (
          <ul className="space-y-2">
            {(safeFoods as AnalysisRow[]).map((food) => (
              <li key={food.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 capitalize truncate">
                    {food.foodName}
                  </p>
                  {food.foodCategory && (
                    <p className="text-xs text-stone-400 capitalize">
                      {food.foodCategory}
                    </p>
                  )}
                </div>
                <Badge level="probably_safe" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Weekly symptom trend */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-stone-900 mb-4">
          Weekly Symptom Trend
        </h2>
        <WeeklyChart data={weeklyData} />
      </div>
    </div>
  )
}
