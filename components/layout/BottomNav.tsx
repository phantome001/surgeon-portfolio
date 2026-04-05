'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Film, Camera, CalendarDays } from 'lucide-react'

const tabs = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/gallery', label: 'الحالات', icon: Camera },
  { href: '/videos', label: 'الفيديوهات', icon: Film },
  { href: '/appointments', label: 'المواعيد', icon: CalendarDays },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 relative transition-colors duration-200 ${
                isActive ? 'text-gold' : 'text-muted hover:text-text'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
