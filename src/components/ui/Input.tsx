'use client'

import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = '', ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-stone-700"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          'w-full border rounded-xl px-4 py-3 text-stone-900 text-sm',
          'placeholder:text-stone-400 bg-white',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
          'disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-stone-200 hover:border-stone-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 leading-tight">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-stone-400 leading-tight">{hint}</p>
      )}
    </div>
  )
})

export default Input
