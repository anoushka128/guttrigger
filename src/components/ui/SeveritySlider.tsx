'use client'

interface SeveritySliderProps {
  value: number
  onChange: (value: number) => void
  label?: string
  className?: string
}

function getSliderColor(value: number): string {
  if (value >= 7) return 'text-red-500'
  if (value >= 4) return 'text-amber-500'
  return 'text-emerald-600'
}

function getSeverityLabel(value: number): string {
  if (value >= 9) return 'Unbearable'
  if (value >= 7) return 'Severe'
  if (value >= 5) return 'Moderate'
  if (value >= 3) return 'Mild'
  return 'Minimal'
}

export default function SeveritySlider({
  value,
  onChange,
  label = 'Severity',
  className = '',
}: SeveritySliderProps) {
  const clamped = Math.max(1, Math.min(10, value))
  const valueColor = getSliderColor(clamped)
  const severityLabel = getSeverityLabel(clamped)

  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={['text-3xl font-bold tabular-nums leading-none', valueColor].join(' ')}>
            {clamped}
          </span>
          <span className="text-sm text-stone-400 leading-none">/10</span>
          <span className={['text-xs font-medium ml-1', valueColor].join(' ')}>
            {severityLabel}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={clamped}
        className="w-full"
      />

      <div className="flex justify-between px-0.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`Set severity to ${n}`}
            className={[
              'w-6 h-6 rounded-full text-[10px] font-semibold transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
              n === clamped
                ? n >= 7
                  ? 'bg-red-500 text-white scale-110'
                  : n >= 4
                  ? 'bg-amber-400 text-white scale-110'
                  : 'bg-emerald-500 text-white scale-110'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
            ].join(' ')}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
