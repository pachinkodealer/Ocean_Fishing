import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PERIODS = [
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'alltime', label: 'All Time' },
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

  const { data: entries } = await supabase
    .from('leaderboard_snapshots')
    .select('*, profiles(username, avatar_url, plan)')
    .eq('period', period)
    .order('rank', { ascending: true })
    .limit(50)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <div className="flex gap-2">
        {PERIODS.map(({ value, label }) => (
          <a
            key={value}
            href={`/leaderboard?period=${value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${period === value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {label}
          </a>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground capitalize">{period} Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={(entries as any[]) ?? []} currentUserId={user?.id} />
        </CardContent>
      </Card>
    </div>
  )
}
