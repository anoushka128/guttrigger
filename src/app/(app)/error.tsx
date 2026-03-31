'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="pt-16 pb-32 flex flex-col items-center text-center px-4">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6">
        <span className="text-4xl" role="img" aria-label="Warning">⚠️</span>
      </div>

      {/* Text */}
      <h1 className="text-xl font-bold text-stone-900 mb-2">This page couldn&apos;t load</h1>
      <p className="text-sm text-stone-500 leading-relaxed max-w-xs mb-1">
        Something went wrong fetching your data. This is usually temporary.
      </p>
      {error.digest && (
        <p className="text-xs text-stone-400 font-mono mb-6">ref: {error.digest}</p>
      )}
      {!error.digest && <div className="mb-6" />}

      {/* Actions */}
      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={unstable_retry}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-2xl px-4 py-3.5 transition"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="block w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-sm rounded-2xl px-4 py-3.5 transition text-center"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
