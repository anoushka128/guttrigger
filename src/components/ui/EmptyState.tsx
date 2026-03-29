import { type LucideIcon } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  ctaLabel?: string
  onCtaClick?: () => void
  ctaHref?: string
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  onCtaClick,
  className = '',
}: EmptyStateProps) {
  const hasCta = ctaLabel && onCtaClick

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center px-6 py-16 gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-100">
        <Icon size={28} className="text-stone-400" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="text-base font-semibold text-stone-900">{title}</h3>
        <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
      </div>

      {hasCta && (
        <Button
          variant="primary"
          size="md"
          onClick={onCtaClick}
          className="mt-2"
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
