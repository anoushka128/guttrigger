'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LEFT_ITEMS = [
  { href: '/dashboard', emoji: '🏠', label: 'Dashboard' },
  { href: '/timeline', emoji: '📅', label: 'Timeline' },
]

const RIGHT_ITEMS = [
  { href: '/insights', emoji: '📊', label: 'Insights' },
  { href: '/settings', emoji: '⚙️', label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-stone-100 pb-safe"
      aria-label="Main navigation"
    >
      <div className="flex items-end h-16 relative">
        {/* Left items */}
        <div className="flex flex-1 items-stretch h-full">
          {LEFT_ITEMS.map(({ href, emoji, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors duration-150 focus-visible:outline-none focus-visible:bg-stone-50"
              >
                <span className="text-[22px] leading-none">{emoji}</span>
                <span
                  className={[
                    'text-[10px] leading-none font-medium',
                    active ? 'text-emerald-600' : 'text-stone-400',
                  ].join(' ')}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-500" style={{ left: `calc(${LEFT_ITEMS.indexOf({ href, emoji, label })} * 25% + 12.5%)` }} />
                )}
              </Link>
            )
          })}
        </div>

        {/* Center FAB */}
        <div className="flex items-end justify-center pb-2 px-2">
          <Link
            href="/log"
            aria-label="Log something"
            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-200 transition -translate-y-2"
          >
            <span className="text-white font-bold text-3xl leading-none pb-0.5">+</span>
          </Link>
        </div>

        {/* Right items */}
        <div className="flex flex-1 items-stretch h-full">
          {RIGHT_ITEMS.map(({ href, emoji, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors duration-150 focus-visible:outline-none focus-visible:bg-stone-50"
              >
                <span className="text-[22px] leading-none">{emoji}</span>
                <span
                  className={[
                    'text-[10px] leading-none font-medium',
                    active ? 'text-emerald-600' : 'text-stone-400',
                  ].join(' ')}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
