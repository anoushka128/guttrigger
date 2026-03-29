type SuspicionLevel =
  | 'high'
  | 'moderate'
  | 'low'
  | 'probably_safe'
  | 'insufficient_data'

interface BadgeProps {
  level: SuspicionLevel
  label?: string
  className?: string
}

const levelConfig: Record<
  SuspicionLevel,
  { label: string; classes: string }
> = {
  high: {
    label: 'High Suspicion',
    classes: 'bg-red-100 text-red-700 border border-red-200',
  },
  moderate: {
    label: 'Moderate',
    classes: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  low: {
    label: 'Low',
    classes: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  },
  probably_safe: {
    label: 'Probably Safe',
    classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  insufficient_data: {
    label: 'Insufficient Data',
    classes: 'bg-stone-100 text-stone-500 border border-stone-200',
  },
}

export default function Badge({ level, label, className = '' }: BadgeProps) {
  const config = levelConfig[level]
  const displayLabel = label ?? config.label

  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        config.classes,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {displayLabel}
    </span>
  )
}
