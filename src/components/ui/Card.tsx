interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  clickable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export default function Card({
  children,
  className = '',
  onClick,
  clickable = false,
  padding = 'md',
}: CardProps) {
  const isClickable = clickable || !!onClick

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          'w-full text-left bg-white rounded-2xl shadow-sm border border-stone-100',
          'transition-all duration-150',
          'hover:shadow-md hover:border-stone-200 active:scale-[0.99] active:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
          paddingClasses[padding],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </button>
    )
  }

  return (
    <div
      className={[
        'bg-white rounded-2xl shadow-sm border border-stone-100',
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
