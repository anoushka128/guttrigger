'use client'

interface TriggerFoodCardProps {
  foodName: string
  suspicionLevel: string
  exposureCount: number
  symptomCount: number
  avgSeverity: number
  confidenceScore: number
  consistency: number
  linkedSymptoms: string[]
  dominantOnset?: string | null
}

const LEVEL_CONFIG: Record<string, { label: string; icon: string; bg: string; border: string; text: string; bar: string }> = {
  high:             { label: 'High risk',         icon: '⚠️',  bg: 'bg-red-50',     border: 'border-red-100',     text: 'text-red-600',     bar: 'bg-red-400' },
  moderate:         { label: 'Moderate risk',      icon: '🔍',  bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-600',   bar: 'bg-amber-400' },
  low:              { label: 'Low risk',           icon: '📊',  bg: 'bg-stone-50',   border: 'border-stone-100',   text: 'text-stone-500',   bar: 'bg-stone-300' },
  probably_safe:    { label: 'Probably safe',      icon: '✅',  bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', bar: 'bg-emerald-400' },
  insufficient_data:{ label: 'Insufficient data',  icon: '📋',  bg: 'bg-stone-50',   border: 'border-stone-100',   text: 'text-stone-400',   bar: 'bg-stone-200' },
}

const ONSET_LABEL: Record<string, string> = {
  immediate:     'immediately after',
  within_1hr:    'within 1 hour',
  within_2_4hr:  '2–4 hours later',
  later_that_day:'later that day',
  next_morning:  'the next morning',
}

export default function TriggerFoodCard({
  foodName,
  suspicionLevel,
  exposureCount,
  symptomCount,
  avgSeverity,
  confidenceScore,
  consistency,
  linkedSymptoms,
  dominantOnset,
}: TriggerFoodCardProps) {
  const cfg = LEVEL_CONFIG[suspicionLevel] ?? LEVEL_CONFIG.insufficient_data
  const pct = Math.round(confidenceScore * 100)
  const consistencyPct = Math.round(consistency * 100)

  const getInsightText = () => {
    if (suspicionLevel === 'insufficient_data')
      return `Only ${exposureCount} exposure${exposureCount !== 1 ? 's' : ''} recorded — not enough data to identify a pattern yet.`
    if (suspicionLevel === 'probably_safe')
      return `Eaten ${exposureCount} time${exposureCount !== 1 ? 's' : ''} without triggering symptoms. Looks safe based on current data.`
    const onset = dominantOnset ? ONSET_LABEL[dominantOnset] ?? '' : ''
    const syms = linkedSymptoms.slice(0, 2).map(s => s.replace(/_/g, ' ')).join(' and ')
    return `${foodName.charAt(0).toUpperCase() + foodName.slice(1)} appeared in ${exposureCount} meal${exposureCount !== 1 ? 's' : ''} and was followed by symptoms${onset ? ' ' + onset : ''} in ${symptomCount} of them${syms ? ` — mainly ${syms}` : ''}.`
  }

  const getRecommendation = () => {
    if (suspicionLevel === 'high')
      return 'Worth testing: try eliminating from your diet for 2 weeks and observe whether symptoms improve.'
    if (suspicionLevel === 'moderate')
      return 'Consider tracking this food more closely. A few more logged exposures will increase confidence.'
    if (suspicionLevel === 'probably_safe')
      return 'Continue eating this food and keep logging to maintain confidence.'
    return null
  }

  const rec = getRecommendation()

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cfg.icon}</span>
          <h3 className="text-base font-bold text-stone-900 capitalize">{foodName}</h3>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.text} bg-white border ${cfg.border} flex-shrink-0`}>
          {cfg.label}
        </span>
      </div>

      {/* Insight text */}
      <p className="text-sm text-stone-700 leading-relaxed mb-4">{getInsightText()}</p>

      {/* Stats grid */}
      {suspicionLevel !== 'insufficient_data' && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Exposures', value: exposureCount },
            { label: 'With symptoms', value: symptomCount },
            { label: 'Avg severity', value: avgSeverity.toFixed(1) },
          ].map(s => (
            <div key={s.label} className="bg-white/70 rounded-xl p-2.5 text-center">
              <p className="text-base font-bold text-stone-800">{s.value}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Confidence bar */}
      {suspicionLevel !== 'insufficient_data' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-xs font-semibold text-stone-600">Pattern confidence</p>
            <p className={`text-xs font-bold ${cfg.text}`}>{pct}%</p>
          </div>
          <div className="h-2 bg-white/80 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">{consistencyPct}% of exposures were followed by symptoms</p>
        </div>
      )}

      {/* Linked symptoms */}
      {linkedSymptoms.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-stone-500 mb-2">Linked symptoms</p>
          <div className="flex flex-wrap gap-1.5">
            {linkedSymptoms.map(s => (
              <span
                key={s}
                className="bg-white/80 text-stone-600 text-xs px-2.5 py-1 rounded-lg capitalize border border-white"
              >
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {rec && (
        <div className="bg-white/60 rounded-xl p-3 border border-white">
          <p className="text-xs text-stone-600 leading-relaxed">💡 {rec}</p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-stone-400 mt-3">
        This is a correlation in your data, not a medical diagnosis. Consult a healthcare provider before making dietary changes.
      </p>
    </div>
  )
}
