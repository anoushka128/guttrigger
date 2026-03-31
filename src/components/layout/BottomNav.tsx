'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// SVG icon components
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 9.5L12 3L21 9.5V20a1 1 0 01-1 1H15v-6h-6v6H4a1 1 0 01-1-1V9.5z"
        stroke={active ? '#059669' : '#a8a29e'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? '#d1fae5' : 'none'}
      />
    </svg>
  )
}

function TimelineIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke={active ? '#059669' : '#a8a29e'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InsightsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 20V10M12 20V4M6 20v-6"
        stroke={active ? '#059669' : '#a8a29e'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke={active ? '#059669' : '#a8a29e'}
        strokeWidth="1.75"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={active ? '#059669' : '#a8a29e'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const LEFT_ITEMS = [
  { href: '/dashboard', label: 'Home', Icon: HomeIcon },
  { href: '/timeline', label: 'Timeline', Icon: TimelineIcon },
]

const RIGHT_ITEMS = [
  { href: '/insights', label: 'Insights', Icon: InsightsIcon },
  { href: '/settings', label: 'Settings', Icon: SettingsIcon },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-100 pb-safe"
      aria-label="Main navigation"
    >
      <div className="flex items-end h-16 relative max-w-2xl mx-auto">
        {/* Left items */}
        <div className="flex flex-1 items-stretch h-full">
          {LEFT_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all duration-150 focus-visible:outline-none focus-visible:bg-stone-50 group"
              >
                <span className={['transition-transform duration-150', active ? 'scale-110' : 'group-hover:scale-105'].join(' ')}>
                  <Icon active={active} />
                </span>
                <span
                  className={[
                    'text-[10px] leading-none font-medium transition-colors',
                    active ? 'text-emerald-600' : 'text-stone-400 group-hover:text-stone-600',
                  ].join(' ')}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-0 h-0.5 w-8 rounded-t-full bg-emerald-500" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Center FAB */}
        <div className="flex items-end justify-center pb-2 px-3 flex-shrink-0">
          <Link
            href="/log"
            aria-label="Log something"
            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 flex items-center justify-center shadow-lg shadow-emerald-200 transition-all duration-150 -translate-y-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        {/* Right items */}
        <div className="flex flex-1 items-stretch h-full">
          {RIGHT_ITEMS.map(({ href, label, Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all duration-150 focus-visible:outline-none focus-visible:bg-stone-50 group"
              >
                <span className={['transition-transform duration-150', active ? 'scale-110' : 'group-hover:scale-105'].join(' ')}>
                  <Icon active={active} />
                </span>
                <span
                  className={[
                    'text-[10px] leading-none font-medium transition-colors',
                    active ? 'text-emerald-600' : 'text-stone-400 group-hover:text-stone-600',
                  ].join(' ')}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-0 h-0.5 w-8 rounded-t-full bg-emerald-500" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
