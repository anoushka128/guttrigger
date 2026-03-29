interface ScoreBarProps {
  score: number // 1–10
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 7) return 'bg-red-500'
  if (score >= 4) return 'bg-amber-400'
  return 'bg-emerald-500'
}

function getScoreLabel(score: number): string {
  if (score >= 7) return 'Severe'
  if (score >= 4) return 'Moderate'
  return 'Mild'
}

export default function ScoreBar({
  score,
  showLabel = true,
  size = 'md',
  className = '',
}: ScoreBarProps) {
  const clamped = Math.max(1, Math.min(10, score))
  const percentage = (clamped / 10) * 100
  const color = getScoreColor(clamped)
  const label = getScoreLabel(clamped)
  const trackHeight = size === 'sm' ? 'h-1.5' : 'h-2.5'

  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500">
            Severity
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-stone-900">
              {clamped}
              <span className="text-xs font-normal text-stone-400">/10</span>
            </span>
            <span className="text-xs text-stone-500">{label}</span>
          </div>
        </div>
      )}
      <div
        className={['w-full rounded-full bg-stone-100 overflow-hidden', trackHeight].join(' ')}
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-label={`Severity score ${clamped} out of 10`}
      >
        <div
          className={['h-full rounded-full transition-all duration-500', color].join(' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
