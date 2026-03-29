'use client'

import { useState, useTransition } from 'react'
import { triggerAnalysisForUser } from '@/app/actions/analysis'
import { Sparkles, CheckCircle } from 'lucide-react'

export default function RunAnalysisButton() {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  function handleClick() {
    setDone(false)
    startTransition(async () => {
      await triggerAnalysisForUser()
      setDone(true)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={[
        'w-full inline-flex items-center justify-center gap-2 font-medium text-sm rounded-xl px-4 py-3 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        done
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-300 disabled:cursor-not-allowed',
      ].join(' ')}
    >
      {isPending ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          Analysing your data…
        </>
      ) : done ? (
        <>
          <CheckCircle size={16} />
          Analysis complete — results updated
        </>
      ) : (
        <>
          <Sparkles size={16} />
          Run Analysis
        </>
      )}
    </button>
  )
}
