'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signup } from '@/app/actions/auth'
import Logo from '@/components/Logo'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function CheckIcon({ met }: { met: boolean }) {
  return met ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [showRequirements, setShowRequirements] = useState(false)

  const rules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { label: 'One number (0–9)', met: /[0-9]/.test(password) },
  ]
  const allMet = rules.every(r => r.met)

  return (
    <div className="w-full max-w-sm">
      {/* Wordmark */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-3">
          <Logo size={32} showText={true} />
        </div>
        <p className="text-stone-500 text-sm">Know what your body is telling you.</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <h1 className="text-xl font-semibold text-stone-900 mb-6">Create an account</h1>

        {state?.message && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 mb-4">
            {state.message}
          </div>
        )}

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">Name</label>
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

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
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

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setShowRequirements(true)}
                onBlur={() => setShowRequirements(false)}
                className={[
                  'w-full border rounded-xl px-4 py-2.5 pr-11 text-sm text-stone-900 placeholder:text-stone-400',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition',
                  password.length > 0 && !allMet
                    ? 'border-amber-300'
                    : allMet && password.length > 0
                    ? 'border-emerald-400'
                    : 'border-stone-200',
                ].join(' ')}
                placeholder="Create a password"
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {/* Requirements pop-up */}
            {showRequirements && password.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-md space-y-2">
                {rules.map(rule => (
                  <div key={rule.label} className="flex items-center gap-2">
                    <span className={rule.met ? 'text-emerald-500' : 'text-stone-300'}>
                      <CheckIcon met={rule.met} />
                    </span>
                    <span className={`text-xs font-medium ${rule.met ? 'text-emerald-700' : 'text-stone-400'}`}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={pending || !allMet}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl px-4 py-2.5 transition mt-2"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-stone-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-700 transition">
          Sign in
        </Link>
      </p>
    </div>
  )
}
