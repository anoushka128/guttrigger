'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <span className="text-4xl" role="img" aria-label="Warning">⚠️</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-stone-900">Something went wrong</h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            This page couldn&apos;t load. This is usually a temporary issue — try refreshing or tap the button below.
          </p>
          {error.digest && (
            <p className="text-xs text-stone-400 font-mono mt-1">Error: {error.digest}</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={unstable_retry}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-2xl px-4 py-3.5 transition"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="block w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-sm rounded-2xl px-4 py-3.5 transition"
          >
            Back to Dashboard
          </a>
        </div>

        {/* Medical note */}
        <p className="text-xs text-stone-400">
          If you&apos;re tracking a serious symptom, log it when you&apos;re back online.
          If it&apos;s a medical emergency, call emergency services now.
        </p>
      </div>
    </div>
  )
}
