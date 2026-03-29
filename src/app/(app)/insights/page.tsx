import { prisma } from '@/lib/prisma'
import { requireDbUser } from '@/lib/auth'
import { subDays, format, startOfDay } from 'date-fns'
import { SYMPTOM_CATEGORIES } from '@/lib/utils'
import PeriodSelector from './_components/PeriodSelector'
import InsightCharts from './_components/InsightCharts'
import TriggerFoodCard from './_components/TriggerFoodCard'
import RunAnalysisButton from './_components/RunAnalysisButton'
import Badge from '@/components/ui/Badge'

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

function generateSummaries(
  results: AnalysisResultRow[],
  meals: MealRow[],
): string[] {
  const summaries: string[] = []

  for (const result of results.slice(0, 5)) {
    if (result.suspicionLevel === 'high' || result.suspicionLevel === 'moderate') {
      const linkedText = result.linkedSymptoms.slice(0, 2).join(' and ')
      summaries.push(
        `${capitalize(result.foodName)} appeared in ${result.exposureCount} meals with symptoms in ${result.symptomCount} cases${linkedText ? `, often linked to ${linkedText}` : ''}.`,
      )
    } else if (result.suspicionLevel === 'probably_safe') {
      summaries.push(
        `${capitalize(result.foodName)} appears low risk — ${result.exposureCount} exposures with minimal symptoms.`,
      )
    } else if (result.exposureCount === 1) {
      summaries.push(
        `Not enough data on ${capitalize(result.foodName)} yet. Try logging more meals that include it.`,
      )
    }
  }

  const restaurantMeals = meals.filter((m: MealRow) => m.location === 'restaurant')
  if (restaurantMeals.length >= 3) {
    summaries.push(
      'Consider tracking whether symptoms differ between home-cooked and restaurant meals.',
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
    (r: AnalysisResultRow) => r.suspicionLevel === 'high' || r.suspicionLevel === 'moderate',
  )
  const safeFoods = analysisResults.filter(
    (r: AnalysisResultRow) => r.suspicionLevel === 'probably_safe',
  )

  const summaries = generateSummaries(analysisResults, allMeals)

  return (
    <div className="pt-6 pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Your Insights</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Patterns from the last {days} days
          </p>
        </div>
        <PeriodSelector current={period} />
      </div>

      {/* Charts */}
      <InsightCharts symptomTrend={symptomTrend} symptomBreakdown={symptomBreakdown} />

      {/* Top Trigger Foods */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-900">Possible Trigger Foods</h2>
          <span className="text-xs text-stone-400">{triggerFoods.length} found</span>
        </div>
        {triggerFoods.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-6">
            No trigger foods identified yet — keep logging meals and symptoms
          </p>
        ) : (
          <div className="space-y-3">
            {triggerFoods.map((food: AnalysisResultRow) => (
              <TriggerFoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </div>

      {/* Food-symptom connections */}
      {triggerFoods.some((f: AnalysisResultRow) => f.linkedSymptoms.length > 0) && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-stone-900 mb-4">
            Food&ndash;Symptom Connections
          </h2>
          <div className="space-y-4">
            {triggerFoods
              .filter((f: AnalysisResultRow) => f.linkedSymptoms.length > 0)
              .slice(0, 5)
              .map((food: AnalysisResultRow) => (
                <div key={food.id}>
                  <p className="text-sm font-medium text-stone-800 capitalize mb-1.5">
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

      {/* Safe Foods */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-900">Safe Foods</h2>
          <span className="text-xs text-stone-400">{safeFoods.length} identified</span>
        </div>
        {safeFoods.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-6">
            Keep logging to identify your safe foods
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {safeFoods.map((food: AnalysisResultRow) => (
              <div
                key={food.id}
                className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 capitalize truncate">
                    {capitalize(food.foodName)}
                  </p>
                  <p className="text-xs text-stone-500">
                    {food.exposureCount} exposures &middot; avg severity{' '}
                    {food.avgSeverity.toFixed(1)}/10
                  </p>
                </div>
                <Badge level="probably_safe" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI-style summaries */}
      {summaries.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">&#10024;</span>
            <h2 className="text-base font-semibold text-stone-900">Observations</h2>
          </div>
          <ul className="space-y-3">
            {summaries.map((summary, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-emerald-500 mt-0.5 shrink-0 text-sm">&bull;</span>
                <p className="text-sm text-stone-600 leading-relaxed">{summary}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Run Analysis */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Refresh Analysis
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          Re-run the analysis to incorporate your latest logs.
        </p>
        <RunAnalysisButton />
      </div>
    </div>
  )
}
