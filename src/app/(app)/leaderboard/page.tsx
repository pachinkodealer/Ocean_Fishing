import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <div className="flex gap-2">
        {PERIODS.map(({ value, label }) => (
          <a
            key={value}
            href={`/leaderboard?period=${value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${period === value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {label}
          </a>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">{periodLabel} Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={entries} currentUserId={user?.id} />
        </CardContent>
      </Card>
    </div>
  )
}
