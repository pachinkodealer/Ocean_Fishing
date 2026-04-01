import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/play" className={buttonVariants()}>Make a Call</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Points', value: profile?.points?.toLocaleString() ?? '0' },
          { label: 'Accuracy', value: `${profile?.accuracy_pct ?? 0}%` },
          { label: 'Streak', value: `${profile?.streak ?? 0} 🔥` },
          { label: 'Calls Made', value: profile?.total_calls ?? 0 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-muted-foreground font-normal">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent games */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
        {!recentGames || recentGames.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No games yet.{' '}
              <Link href="/play" className="underline text-foreground">Make your first call!</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(recentGames as any[]).map((game) => {
              const prediction = game.predictions?.[0]
              return (
                <Link key={game.id} href={`/play/${game.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold">{game.ticker}</span>
                        <span className="text-muted-foreground text-sm">{game.timeframe}</span>
                        {prediction && (
                          <Badge variant="outline" className={prediction.direction === 'bull' ? 'text-green-400 border-green-400/40' : 'text-red-400 border-red-400/40'}>
                            {prediction.direction === 'bull' ? '▲' : '▼'} {prediction.direction.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {game.status === 'scored' && prediction && (
                          <span className={prediction.is_correct ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {prediction.is_correct ? '+' : ''}{prediction.points_earned} pts
                          </span>
                        )}
                        <Badge variant={game.status === 'scored' ? 'secondary' : 'outline'}>
                          {game.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {profile?.plan === 'free' && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Free Plan — 3 calls/day</p>
              <p className="text-sm text-muted-foreground">Upgrade for unlimited calls + advanced analysis</p>
            </div>
            <Link href="/upgrade" className={buttonVariants({ variant: 'outline' }) + ' border-yellow-500/40 text-yellow-400'}>Upgrade $9/mo</Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
