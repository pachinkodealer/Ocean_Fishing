import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { PageHeader } from '@/components/ui/page-header'
import { AppNav } from '@/components/nav/AppNav'
import { AmbientBackground } from '@/components/ui/ambient-background'

const PERIODS = [
  { value: 'alltime', label: 'All Time' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
]

function PublicHeader() {
  return (
    <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-primary group-hover:shadow-[0_0_8px_var(--primary)] transition-shadow" />
          <span className="font-bold text-base tracking-tight">CallTheCandle</span>
        </Link>
        <div className="flex gap-2 text-sm">
          <Link href="/login" className="px-3 py-1.5 rounded-lg font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-3 py-1.5 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: rawPeriod } = await searchParams
  const period = ['weekly', 'monthly', 'alltime'].includes(rawPeriod ?? '') ? rawPeriod! : 'alltime'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Logged-in visitors keep the full app nav with their stats
  type NavProfile = { username: string; points: number; streak: number }
  let navProfile: NavProfile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, points, streak')
      .eq('id', user.id)
      .single()
    navProfile = (data as NavProfile | null) ?? null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let entries: any[] = []

  if (period === 'alltime') {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, plan, points, accuracy_pct, correct_calls, total_calls, streak')
      .gt('total_calls', 0)
      .order('points', { ascending: false })
      .limit(50)

    entries = (data ?? []).map((p, i) => ({
      rank: i + 1,
      user_id: p.id,
      points: p.points ?? 0,
      accuracy: p.accuracy_pct ?? 0,
      correct: p.correct_calls ?? 0,
      total: p.total_calls ?? 0,
      streak: p.streak ?? 0,
      profiles: { username: p.username, plan: p.plan, avatar_url: null },
    }))
  } else {
    const { data } = await supabase
      .from('leaderboard_snapshots')
      .select('*, profiles(username, plan)')
      .eq('period', period)
      .order('rank', { ascending: true })
      .limit(50)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries = (data ?? []).map((e: any) => ({
      rank: e.rank,
      user_id: e.user_id,
      points: e.points ?? 0,
      accuracy: e.accuracy ?? 0,
      correct: e.correct ?? 0,
      total: e.total ?? 0,
      streak: 0,
      profiles: e.profiles ?? null,
    }))
  }

  const periodLabel = PERIODS.find(p => p.value === period)?.label ?? 'All Time'

  return (
    <div className="relative min-h-screen bg-background">
      <AmbientBackground />

      {user && navProfile ? (
        <AppNav username={navProfile.username ?? 'trader'} points={navProfile.points ?? 0} streak={navProfile.streak ?? 0} />
      ) : (
        <PublicHeader />
      )}

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <PageHeader title="Leaderboard" subtitle="Top traders ranked by points" />

          <div className="inline-flex p-1 rounded-lg bg-muted/60 border border-border gap-0.5">
            {PERIODS.map(({ value, label }) => (
              <a
                key={value}
                href={`/leaderboard?period=${value}`}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${period === value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'}`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-muted-foreground">{periodLabel} Rankings</h2>
            </div>
            <div className="px-5 py-2">
              <LeaderboardTable entries={entries} currentUserId={user?.id} />
            </div>
          </div>

          {!user && (
            <div className="text-center pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Think you can top the board? Play free →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
