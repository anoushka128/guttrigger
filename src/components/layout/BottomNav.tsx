'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart2, Calendar } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/log', label: 'Log', icon: Plus },
  { href: '/insights', label: 'Insights', icon: BarChart2 },
  { href: '/timeline', label: 'Timeline', icon: Calendar },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={[
        'md:hidden fixed bottom-0 inset-x-0 z-50',
        'bg-white border-t border-stone-100',
        'pb-safe', // env(safe-area-inset-bottom) via Tailwind v4
      ].join(' ')}
      aria-label="Main navigation"
    >
      <ul className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={[
                  'flex flex-col items-center justify-center gap-0.5 h-full w-full',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:bg-stone-50',
                  isActive
                    ? 'text-emerald-600'
                    : 'text-stone-400 hover:text-stone-600 active:text-stone-700',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  aria-hidden="true"
                />
                <span className={['text-[10px] leading-none font-medium', isActive ? 'text-emerald-600' : ''].join(' ')}>
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
