import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'
import { subDays, format, startOfDay } from 'date-fns'
import { SYMPTOM_CATEGORIES } from '@/lib/utils'
import PeriodSelector from './_components/PeriodSelector'
import InsightCharts from './_components/InsightCharts'
import TriggerFoodCard from './_components/TriggerFoodCard'
import RunAnalysisButton from './_components/RunAnalysisButton'

function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

interface AnalysisResultRow {
  id: string
  foodName: string
  foodCategory: string | null
  exposureCount: number
  symptomCount: number
  avgSeverity: number
  confidenceScore: number
  suspicionLevel: string
  linkedSymptoms: string[]
  consistency: number
  dominantOnset: string | null
  updatedAt: Date
}

interface MealRow {
  id: string
  location: string
  foods: { id: string; name: string }[]
}

interface SymptomRow {
  id: string
  timeStarted: Date
  severity: number
  categories: string[]
}

function generateSummaries(results: AnalysisResultRow[], meals: MealRow[]): string[] {
  const summaries: string[] = []

  for (const result of results.slice(0, 5)) {
    if (result.suspicionLevel === 'high' || result.suspicionLevel === 'moderate') {
      const linkedText = result.linkedSymptoms
        .slice(0, 2)
        .map(s => s.replace(/_/g, ' '))
        .join(' and ')
      const onsetMap: Record<string, string> = {
        immediate: 'immediately after eating',
        within_1hr: 'within 1 hour',
        within_2_4hr: '2–4 hours later',
        later_that_day: 'later the same day',
        next_morning: 'the next morning',
      }
      const onset = result.dominantOnset ? onsetMap[result.dominantOnset] : null
      summaries.push(
        `${capitalize(result.foodName)} appeared in ${result.exposureCount} meal${result.exposureCount !== 1 ? 's' : ''} and was followed by symptoms in ${result.symptomCount} of them${onset ? ', typically ' + onset : ''}${linkedText ? ' — mainly ' + linkedText : ''}.`
      )
    } else if (result.suspicionLevel === 'probably_safe') {
      summaries.push(
        `${capitalize(result.foodName)} has been eaten ${result.exposureCount} time${result.exposureCount !== 1 ? 's' : ''} without triggering notable symptoms — looks safe so far.`
      )
    } else if (result.exposureCount === 1) {
      summaries.push(
        `Only one logged exposure to ${capitalize(result.foodName)}. Log more meals containing it to build a pattern.`
      )
    }
  }

  const restaurantMeals = meals.filter((m: MealRow) => m.location === 'restaurant')
  if (restaurantMeals.length >= 3) {
    summaries.push(
      'Consider tracking whether symptoms differ between home-cooked and restaurant meals — hidden ingredients may be a factor.'
    )
  }

  return summaries
}

interface InsightsPageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const user = await requireDbUser()
  const { period: periodParam } = await searchParams
  const period = ['7', '30', '90'].includes(periodParam ?? '') ? (periodParam ?? '30') : '30'
  const days = parseInt(period, 10)
  const since = subDays(new Date(), days)

  const [analysisResultsRaw, allSymptomsRaw, allMealsRaw] = await Promise.all([
    prisma.analysisResult.findMany({
      where: { userId: user.id },
      orderBy: { confidenceScore: 'desc' },
    }),
    prisma.symptom.findMany({
      where: { userId: user.id, timeStarted: { gte: since } },
      orderBy: { timeStarted: 'asc' },
    }),
    prisma.meal.findMany({
      where: { userId: user.id, date: { gte: since } },
      include: { foods: true },
    }),
  ])

  const analysisResults = analysisResultsRaw as unknown as AnalysisResultRow[]
  const allSymptoms = allSymptomsRaw as unknown as SymptomRow[]
  const allMeals = allMealsRaw as unknown as MealRow[]

  // Build symptom trend: group by date, calculate avg severity
  const trendMap = new Map<string, { total: number; count: number }>()
  for (const symptom of allSymptoms) {
    const day = format(startOfDay(symptom.timeStarted), 'MMM d')
    const existing = trendMap.get(day)
    if (existing) {
      existing.total += symptom.severity
      existing.count += 1
    } else {
      trendMap.set(day, { total: symptom.severity, count: 1 })
    }
  }
  const symptomTrend = Array.from(trendMap.entries()).map(([date, { total, count }]) => ({
    date,
    avgSeverity: parseFloat((total / count).toFixed(1)),
    count,
  }))

  // Build symptom breakdown: count by category
  const breakdownMap = new Map<string, number>()
  for (const symptom of allSymptoms) {
    for (const cat of symptom.categories) {
      breakdownMap.set(cat, (breakdownMap.get(cat) ?? 0) + 1)
    }
  }
  const symptomBreakdown = Array.from(breakdownMap.entries())
    .map(([id, count]) => ({
      name: SYMPTOM_CATEGORIES.find((c) => c.id === id)?.label ?? id,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const triggerFoods = analysisResults.filter(
    (r) => r.suspicionLevel === 'high' || r.suspicionLevel === 'moderate'
  )
  const safeFoods = analysisResults.filter((r) => r.suspicionLevel === 'probably_safe')
  const insufficientFoods = analysisResults.filter((r) => r.suspicionLevel === 'insufficient_data')
  const summaries = generateSummaries(analysisResults, allMeals)

  // Last analysis timestamp
  const lastAnalyzed = analysisResults[0]?.updatedAt
    ? format(new Date(analysisResults[0].updatedAt), 'MMM d, h:mm a')
    : null

  const totalMeals = await prisma.meal.count({ where: { userId: user.id } })
  const totalSymptoms = await prisma.symptom.count({ where: { userId: user.id } })

  return (
    <div className="pt-6 pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Your Insights</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {lastAnalyzed ? `Last analyzed ${lastAnalyzed}` : `Patterns from the last ${days} days`}
          </p>
        </div>
        <PeriodSelector current={period} />
      </div>

      {/* Data completeness nudge */}
      {(totalMeals < 5 || totalSymptoms < 3) && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">🌱</span>
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Still building your data</p>
              <p className="text-sm text-stone-700 leading-relaxed">
                {totalMeals < 5
                  ? `Log at least ${5 - totalMeals} more meal${5 - totalMeals !== 1 ? 's' : ''} to start seeing patterns.`
                  : `Log symptoms when you feel unwell — you need at least 3 symptom events to identify triggers.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <InsightCharts symptomTrend={symptomTrend} symptomBreakdown={symptomBreakdown} />

      {/* Observations */}
      {summaries.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">✨</span>
            <h2 className="text-sm font-semibold text-stone-900">Observations</h2>
          </div>
          <p className="text-xs text-stone-400 mb-4">Patterns detected in your logged data</p>
          <ul className="space-y-3">
            {summaries.map((summary, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0 text-sm">•</span>
                <p className="text-sm text-stone-600 leading-relaxed">{summary}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trigger Foods */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-stone-900">Possible trigger foods</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Foods correlated with your symptoms — not confirmed triggers
          </p>
        </div>

        {triggerFoods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-medium text-stone-700 mb-2">No trigger patterns found yet</p>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
              {totalMeals < 3
                ? 'Log at least 3 meals containing specific foods to begin analysis.'
                : totalSymptoms < 2
                  ? 'Log symptoms when you feel unwell — the app needs symptom data to find correlations.'
                  : 'Keep logging consistently. Patterns typically emerge after 1–2 weeks of daily tracking.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {triggerFoods.map((food) => (
              <TriggerFoodCard
                key={food.id}
                foodName={food.foodName}
                suspicionLevel={food.suspicionLevel}
                exposureCount={food.exposureCount}
                symptomCount={food.symptomCount}
                avgSeverity={food.avgSeverity}
                confidenceScore={food.confidenceScore}
                consistency={food.consistency}
                linkedSymptoms={food.linkedSymptoms}
                dominantOnset={food.dominantOnset}
              />
            ))}
          </div>
        )}
      </div>

      {/* Safe Foods */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-stone-900">Safe foods</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Eaten multiple times without notable symptoms
          </p>
        </div>

        {safeFoods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-medium text-stone-600 mb-1">No safe foods confirmed yet</p>
            <p className="text-xs text-stone-400">
              Foods you eat regularly without symptoms will appear here as you log more data.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {safeFoods.map((food) => (
              <div
                key={food.id}
                className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 capitalize">{capitalize(food.foodName)}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {food.exposureCount} exposures · avg severity {food.avgSeverity.toFixed(1)}/10
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-white border border-emerald-100 px-2.5 py-1 rounded-full">
                  Probably safe
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insufficient data foods */}
      {insufficientFoods.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-1">Needs more data</h2>
          <p className="text-xs text-stone-400 mb-3">Log more meals containing these foods to build a pattern</p>
          <div className="flex flex-wrap gap-2">
            {insufficientFoods.slice(0, 8).map(food => (
              <span
                key={food.id}
                className="bg-stone-50 border border-stone-100 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-xl capitalize"
              >
                {capitalize(food.foodName)} ({food.exposureCount}×)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Food-symptom connections */}
      {triggerFoods.some((f) => f.linkedSymptoms.length > 0) && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-900 mb-1">Food–symptom connections</h2>
          <p className="text-xs text-stone-400 mb-4">Which symptoms each food is associated with</p>
          <div className="space-y-4">
            {triggerFoods
              .filter((f) => f.linkedSymptoms.length > 0)
              .slice(0, 5)
              .map((food) => (
                <div key={food.id}>
                  <p className="text-sm font-semibold text-stone-800 capitalize mb-2">
                    {capitalize(food.foodName)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {food.linkedSymptoms.map((symptomId: string) => {
                      const info = SYMPTOM_CATEGORIES.find((c) => c.id === symptomId)
                      return (
                        <span
                          key={symptomId}
                          className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-100 rounded-full px-2.5 py-0.5"
                        >
                          {info?.emoji} {info?.label ?? symptomId}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Run Analysis */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-stone-900 mb-1">Refresh analysis</h2>
        <p className="text-sm text-stone-500 mb-4">
          Re-run the analysis to incorporate your latest logs.
        </p>
        <RunAnalysisButton />
      </div>

      {/* Disclaimer */}
      <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
        <p className="text-xs text-stone-400 leading-relaxed">
          ⚕️ Insights show statistical correlations in your personal data. They are not medical diagnoses and should not be used to make dietary changes without consulting a qualified healthcare provider.
        </p>
      </div>
    </div>
  )
}
