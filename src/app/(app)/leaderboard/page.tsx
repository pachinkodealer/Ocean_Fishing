import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { PageHeader } from '@/components/ui/page-header'

const PERIODS = [
  { value: 'alltime', label: 'All Time' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
]

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: rawPeriod } = await searchParams
  const period = ['weekly', 'monthly', 'alltime'].includes(rawPeriod ?? '') ? rawPeriod! : 'alltime'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let entries: any[] = []

  if (period === 'alltime') {
    // Query profiles directly — always up to date, no snapshot dependency
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
    // Weekly / Monthly — from snapshots
    const { data } = await supabase
      .from('leaderboard_snapshots')
      .select('*, profiles(username, plan)')
      .eq('period', period)
      .order('rank', { ascending: true })
      .limit(50)

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
    </div>
  )
}
