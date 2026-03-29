interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  label = 'Loading…',
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={['flex items-center justify-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'rounded-full border-stone-200 border-t-emerald-600 animate-spin',
          sizeClasses[size],
        ].join(' ')}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
