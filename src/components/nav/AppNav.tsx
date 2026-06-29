'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AppNavProps {
  username: string
  points: number
  streak: number
}

const LINKS = [
  { href: '/play', label: 'Play' },
  { href: '/daily', label: 'Daily' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

export function AppNav({ username, points, streak }: AppNavProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 group">
          <span className="w-2 h-2 rounded-full bg-primary group-hover:shadow-[0_0_8px_var(--primary)] transition-shadow" />
          <span className="font-bold text-base tracking-tight">CallTheCandle</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 text-sm">
          {LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-1.5 rounded-lg font-medium transition-colors
                  ${active
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Stats + profile */}
        <div className="flex items-center gap-2 shrink-0 text-sm">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 font-mono font-semibold text-primary text-xs">
            {points.toLocaleString()} pts
          </span>
          {streak > 0 && (
            <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              {streak} 🔥
            </span>
          )}
          <Link
            href={`/profile/${username}`}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors
              ${pathname.startsWith('/profile')
                ? 'text-foreground bg-muted'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            {username}
          </Link>
        </div>
      </nav>
    </header>
  )
}
