'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div className="w-full max-w-sm">
      {/* Wordmark */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl" role="img" aria-label="leaf">🌿</span>
          <span className="text-2xl font-semibold tracking-tight text-stone-900">
            GutTrigger
          </span>
        </div>
        <p className="text-stone-500 text-sm">
          Know what your body is telling you.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <h1 className="text-xl font-semibold text-stone-900 mb-6">
          Create an account
        </h1>

        {/* Success: email confirmation needed */}
        {state?.message && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
            {state.message}
          </div>
        )}

        <form action={action} className="space-y-4">
          {/* Error message */}
          {state?.error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl px-4 py-2.5 transition mt-2"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-stone-500 mt-6">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-emerald-600 font-medium hover:text-emerald-700 transition"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
