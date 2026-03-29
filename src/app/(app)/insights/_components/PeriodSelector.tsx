'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const PERIODS = [
  { value: '7', label: '7d' },
  { value: '30', label: '30d' },
  { value: '90', label: '90d' },
]

export default function PeriodSelector({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', value)
    router.push(`/insights?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => select(p.value)}
          className={[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
            current === p.value
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700',
          ].join(' ')}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
