import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireDbUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatTime } from '@/lib/utils'
import WeeklyChart from './_components/WeeklyChart'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

interface TriggerFood {
  foodName: string
  suspicionLevel: string
  confidenceScore: number
  exposureCount: number
  symptomCount: number
  avgSeverity: number
}

function getInsightBanner(triggers: TriggerFood[], totalMeals: number, totalSymptoms: number) {
  if (totalMeals === 0) return { type: 'empty', text: 'Log your first meal to start building your food map.' }
  if (totalMeals < 3) return { type: 'progress', text: `Log ${3 - totalMeals} more meal${3 - totalMeals !== 1 ? 's' : ''} to unlock your first food pattern analysis.` }
  if (totalSymptoms === 0) return { type: 'progress', text: 'Log symptoms when you feel off to start identifying triggers.' }

  const top = triggers[0]
  if (!top) return { type: 'progress', text: 'Keep logging meals and symptoms — patterns will emerge with more data.' }

  if (top.suspicionLevel === 'high') {
    return { type: 'warning', text: `${top.foodName} appeared in ${top.exposureCount} meals before symptoms in ${top.symptomCount} — worth watching.` }
  }
  if (top.suspicionLevel === 'moderate') {
    return { type: 'caution', text: `${top.foodName} shows a possible pattern with your symptoms (${top.symptomCount}/${top.exposureCount} exposures). More data needed to confirm.` }
  }
  return { type: 'progress', text: 'No strong trigger patterns detected yet. Keep logging consistently.' }
}

export default async function DashboardPage() {
  let user
  try { user = await requireDbUser() } catch { redirect('/login') }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    todayMeals,
    todaySymptoms,
    todayCheckIn,
    triggerFoods,
    safeFoods,
    allMealCount,
    allSymptomCount,
    weekData,
  ] = await Promise.all([
    prisma.meal.findMany({
      where: { userId: user.id, date: { gte: today, lt: tomorrow } },
      include: { foods: true },
      orderBy: { date: 'desc' },
    }),
    prisma.symptom.findMany({
      where: { userId: user.id, timeStarted: { gte: today, lt: tomorrow } },
      orderBy: { timeStarted: 'desc' },
    }),
    prisma.checkIn.findFirst({
      where: { userId: user.id, timestamp: { gte: today, lt: tomorrow } },
    }),
    prisma.analysisResult.findMany({
      where: { userId: user.id, suspicionLevel: { in: ['high', 'moderate'] } },
      orderBy: [{ suspicionLevel: 'asc' }, { confidenceScore: 'desc' }],
      take: 4,
    }),
    prisma.analysisResult.findMany({
      where: { userId: user.id, suspicionLevel: 'probably_safe' },
      orderBy: { exposureCount: 'desc' },
      take: 5,
    }),
    prisma.meal.count({ where: { userId: user.id } }),
    prisma.symptom.count({ where: { userId: user.id } }),
    prisma.symptom.findMany({
      where: { userId: user.id, timeStarted: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { timeStarted: true, severity: true },
    }),
  ])

  const insight = getInsightBanner(triggerFoods as TriggerFood[], allMealCount, allSymptomCount)

  // Build weekly chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    const dayEnd = new Date(d)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const daySymptoms = weekData.filter(
      (s: { timeStarted: Date; severity: number }) => s.timeStarted >= d && s.timeStarted < dayEnd
    )
    const count = daySymptoms.length
    return {
      date: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      count,
    }
  })

  const MEAL_EMOJI: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  }

  const SEV_COLOR = (s: number) =>
    s >= 7 ? 'text-red-600 bg-red-50' : s >= 4 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'

  const SUSPICION_STYLES: Record<string, { label: string; badge: string; bar: string }> = {
    high: { label: 'High risk', badge: 'text-red-600 bg-red-50 border border-red-100', bar: 'bg-red-400' },
    moderate: { label: 'Moderate', badge: 'text-amber-600 bg-amber-50 border border-amber-100', bar: 'bg-amber-400' },
    low: { label: 'Low', badge: 'text-stone-500 bg-stone-50 border border-stone-100', bar: 'bg-stone-300' },
    probably_safe: { label: 'Safe', badge: 'text-emerald-600 bg-emerald-50 border border-emerald-100', bar: 'bg-emerald-400' },
    insufficient_data: { label: 'Insufficient data', badge: 'text-stone-400 bg-stone-50 border border-stone-100', bar: 'bg-stone-200' },
  }

  return (
    <div className="pt-6 pb-32 space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {getGreeting()}, {user.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/settings"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-500 hover:bg-stone-50 transition text-lg"
        >
          ⚙️
        </Link>
      </div>

      {/* Insight banner */}
      {insight.type === 'warning' && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Possible trigger detected</p>
              <p className="text-sm text-stone-700 leading-relaxed">{insight.text}</p>
              <Link href="/insights" className="text-xs font-semibold text-red-600 mt-2 inline-block">View full analysis →</Link>
            </div>
          </div>
        </div>
      )}
      {insight.type === 'caution' && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">🔍</span>
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Pattern detected</p>
              <p className="text-sm text-stone-700 leading-relaxed">{insight.text}</p>
              <Link href="/insights" className="text-xs font-semibold text-amber-600 mt-2 inline-block">View analysis →</Link>
            </div>
          </div>
        </div>
      )}
      {(insight.type === 'empty' || insight.type === 'progress') && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">🌱</span>
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Building your food map</p>
              <p className="text-sm text-stone-700 leading-relaxed">{insight.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's progress */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Today&apos;s progress</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className={`rounded-xl p-3 text-center ${todayMeals.length > 0 ? 'bg-emerald-50' : 'bg-stone-50'}`}>
            <p className="text-2xl font-bold text-stone-900">{todayMeals.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">Meals</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${todaySymptoms.length > 0 ? 'bg-amber-50' : 'bg-stone-50'}`}>
            <p className="text-2xl font-bold text-stone-900">{todaySymptoms.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">Symptoms</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${todayCheckIn ? 'bg-emerald-50' : 'bg-stone-50'}`}>
            <p className="text-2xl font-bold text-stone-900">{todayCheckIn ? '✓' : '—'}</p>
            <p className="text-xs text-stone-500 mt-0.5">Check-in</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/log-meal', emoji: '🍽️', label: 'Log Meal' },
          { href: '/log-symptom', emoji: '😣', label: 'Log Symptom' },
          { href: '/check-in', emoji: '📋', label: 'Check-in' },
        ].map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/40 transition"
          >
            <span className="text-2xl">{a.emoji}</span>
            <span className="text-xs font-semibold text-stone-700">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Trigger foods */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Possible triggers</h2>
            <p className="text-xs text-stone-400 mt-0.5">Foods that may be causing symptoms</p>
          </div>
          <Link href="/insights" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">View all</Link>
        </div>

        {triggerFoods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm font-medium text-stone-600 mb-1">No triggers identified yet</p>
            <p className="text-xs text-stone-400">
              {allMealCount < 3
                ? `Log ${3 - allMealCount} more meal${3 - allMealCount !== 1 ? 's' : ''} and some symptoms to start finding patterns`
                : 'Log symptoms when you feel unwell to identify possible triggers'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(triggerFoods as (typeof triggerFoods[0] & { avgSeverity: number })[]).map(food => {
              const style = SUSPICION_STYLES[food.suspicionLevel] ?? SUSPICION_STYLES.insufficient_data
              const pct = Math.round(food.confidenceScore * 100)
              return (
                <div key={food.foodName} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-stone-800 capitalize">{food.foodName}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>{style.label}</span>
                    </div>
                    <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-stone-400 mt-1.5">
                      {food.exposureCount} exposures · {food.symptomCount} with symptoms · severity {food.avgSeverity.toFixed(1)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Safe foods */}
      {safeFoods.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-1">Safe foods so far</h2>
          <p className="text-xs text-stone-400 mb-3">Eaten without symptoms</p>
          <div className="flex flex-wrap gap-2">
            {safeFoods.map(f => (
              <span
                key={f.foodName}
                className="bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-xl border border-emerald-100 capitalize"
              >
                ✓ {f.foodName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weekly trend */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-stone-900 mb-1">7-day symptom trend</h2>
        <p className="text-xs text-stone-400 mb-4">Symptoms logged per day</p>
        {weekData.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-stone-400">No symptom data yet this week</p>
          </div>
        ) : (
          <WeeklyChart data={chartData} />
        )}
      </div>

      {/* Today's meals */}
      {todayMeals.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-900">Today&apos;s meals</h2>
            <Link href="/timeline" className="text-xs font-semibold text-emerald-600">Full timeline</Link>
          </div>
          <div className="space-y-2">
            {todayMeals.map(meal => (
              <div key={meal.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
                <span className="text-xl">{MEAL_EMOJI[meal.mealType] ?? '🍽️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{meal.title}</p>
                  {meal.foods.length > 0 && (
                    <p className="text-xs text-stone-400 mt-0.5 truncate">
                      {meal.foods.map((f: { name: string }) => f.name).join(', ')}
                    </p>
                  )}
                </div>
                <p className="text-xs text-stone-400 flex-shrink-0">{formatTime(meal.date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's symptoms */}
      {todaySymptoms.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-3">Today&apos;s symptoms</h2>
          <div className="space-y-2">
            {todaySymptoms.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50">
                <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${SEV_COLOR(s.severity)}`}>
                  {s.severity}/10
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 truncate capitalize">
                    {s.categories.map((c: string) => c.replace(/_/g, ' ')).join(', ')}
                  </p>
                </div>
                <p className="text-xs text-stone-400">{formatTime(s.timeStarted)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
        <p className="text-xs text-stone-400 leading-relaxed">
          ⚕️ GutTrigger shows correlations in your personal data. These are not medical diagnoses. Always consult a doctor about digestive concerns.
        </p>
      </div>
    </div>
  )
}
