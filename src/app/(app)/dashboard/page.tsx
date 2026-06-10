import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, gamesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase
      .from('games')
      .select('*, predictions(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileResult.data as Profile | null
  const recentGames = gamesResult.data

  const stats = [
    { label: 'Points', value: profile?.points?.toLocaleString() ?? '0', accent: 'text-primary' },
    { label: 'Accuracy', value: `${profile?.accuracy_pct ?? 0}%`, accent: '' },
    { label: 'Streak', value: `${profile?.streak ?? 0}`, accent: (profile?.streak ?? 0) > 0 ? 'text-orange-400' : '', suffix: (profile?.streak ?? 0) > 0 ? ' 🔥' : '' },
    { label: 'Calls Made', value: String(profile?.total_calls ?? 0), accent: '' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${profile?.username ?? 'trader'}`}>
        <Link
          href="/play"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Make a Call
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{stat.label}</p>
            <p className={`text-2xl font-bold font-mono ${stat.accent}`}>
              {stat.value}{stat.suffix ?? ''}
            </p>
          </div>
        ))}
      </div>

      {/* Recent games */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Recent Games</h2>
        {!recentGames || recentGames.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center space-y-2">
              <p className="text-muted-foreground">No games yet.</p>
              <Link href="/play" className="text-primary text-sm font-medium hover:underline">
                Make your first call →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
            {(recentGames as any[]).map((game) => {
              const prediction = game.predictions?.[0]
              return (
                <Link
                  key={game.id}
                  href={`/play/${game.id}`}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-semibold text-sm">{game.ticker}</span>
                    <span className="text-muted-foreground text-xs">{game.timeframe}</span>
                    {prediction && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border
                        ${prediction.direction === 'bull'
                          ? 'text-bull border-bull/30 bg-bull/5'
                          : 'text-bear border-bear/30 bg-bear/5'}`}>
                        {prediction.direction === 'bull' ? '▲ LONG' : '▼ SHORT'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    {game.status === 'scored' && prediction && (
                      <span className={`font-mono font-semibold ${prediction.is_correct ? 'text-bull' : 'text-bear'}`}>
                        {prediction.is_correct ? '+' : ''}{prediction.points_earned} pts
                      </span>
                    )}
                    <Badge variant={game.status === 'scored' ? 'secondary' : 'outline'} className="text-xs">
                      {game.status}
                    </Badge>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {profile?.plan === 'free' && (
        <div className="rounded-xl border border-gold/25 bg-gold/5 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-sm">Free Plan — 3 calls/day</p>
            <p className="text-sm text-muted-foreground">Upgrade for unlimited calls + advanced analysis</p>
          </div>
          <Link
            href="/upgrade"
            className="inline-flex items-center justify-center rounded-lg border border-gold/30 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 shrink-0"
          >
            Upgrade · $3/mo
          </Link>
        </div>
      )}
    </div>
  )
}
