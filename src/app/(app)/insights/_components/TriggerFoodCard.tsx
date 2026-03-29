'use client'

import { SUSPICION_LEVELS, SYMPTOM_CATEGORIES } from '@/lib/utils'

interface AnalysisResultLike {
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

interface TriggerFoodCardProps {
  food: AnalysisResultLike
}

function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function TriggerFoodCard({ food }: TriggerFoodCardProps) {
  const levelKey = food.suspicionLevel as keyof typeof SUSPICION_LEVELS
  const level = SUSPICION_LEVELS[levelKey] ?? SUSPICION_LEVELS.insufficient_data
  const confidencePct = Math.round(food.confidenceScore * 100)

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${level.border}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-stone-900 capitalize truncate">
            {capitalize(food.foodName)}
          </h3>
          {food.foodCategory && (
            <p className="text-xs text-stone-400 capitalize mt-0.5">
              {food.foodCategory}
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${level.bg} ${level.color} border ${level.border}`}
        >
          {level.label}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center bg-stone-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-stone-900">{food.exposureCount}</p>
          <p className="text-xs text-stone-400 leading-tight">exposures</p>
        </div>
        <div className="text-center bg-stone-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-stone-900">{food.symptomCount}</p>
          <p className="text-xs text-stone-400 leading-tight">symptom events</p>
        </div>
        <div className="text-center bg-stone-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-stone-900">
            {food.avgSeverity.toFixed(1)}
          </p>
          <p className="text-xs text-stone-400 leading-tight">avg severity</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-stone-500">Confidence</span>
          <span className="text-xs font-medium text-stone-700">{confidencePct}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              food.suspicionLevel === 'high'
                ? 'bg-red-400'
                : food.suspicionLevel === 'moderate'
                  ? 'bg-amber-400'
                  : food.suspicionLevel === 'probably_safe'
                    ? 'bg-emerald-400'
                    : 'bg-stone-300'
            }`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Linked symptoms chips */}
      {food.linkedSymptoms.length > 0 && (
        <div>
          <p className="text-xs text-stone-500 mb-2">Linked symptoms</p>
          <div className="flex flex-wrap gap-1.5">
            {food.linkedSymptoms.map((symptomId) => {
              const info = SYMPTOM_CATEGORIES.find((c) => c.id === symptomId)
              return (
                <span
                  key={symptomId}
                  className="inline-flex items-center gap-1 text-xs bg-stone-50 text-stone-600 border border-stone-100 rounded-full px-2.5 py-0.5"
                >
                  {info?.emoji} {info?.label ?? symptomId}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
