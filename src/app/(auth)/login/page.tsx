'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { login } from '@/app/actions/auth'
import Logo from '@/components/Logo'

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const searchParams = useSearchParams()
  const dbError = searchParams.get('error') === 'db'

  return (
    <div className="w-full max-w-sm">
      {/* Wordmark */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-3">
          <Logo size={32} showText={true} />
        </div>
        <p className="text-stone-500 text-sm">
          Know what your body is telling you.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <h1 className="text-xl font-semibold text-stone-900 mb-6">
          Sign in
        </h1>

        <form action={action} className="space-y-4">
          {/* Error message */}
          {(state?.error || dbError) && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {dbError
                ? 'Something went wrong on our end. Please try again in a moment.'
                : state?.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
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
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl px-4 py-2.5 transition mt-2"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-stone-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-emerald-600 font-medium hover:text-emerald-700 transition">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
