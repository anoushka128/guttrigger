'use client'

import Link from 'next/link'

interface QuickActionCardProps {
  href: string
  emoji: string
  title: string
  subtitle: string
}

export default function QuickActionCard({
  href,
  emoji,
  title,
  subtitle,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={[
        'flex flex-col items-start gap-1.5 p-4',
        'bg-white rounded-2xl border border-stone-100 shadow-sm',
        'transition-all duration-150 active:scale-95',
        'hover:shadow-md hover:border-stone-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
      ].join(' ')}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="text-sm font-semibold text-stone-900 leading-tight">
        {title}
      </span>
      <span className="text-xs text-stone-500 leading-tight">{subtitle}</span>
    </Link>
  )
}
