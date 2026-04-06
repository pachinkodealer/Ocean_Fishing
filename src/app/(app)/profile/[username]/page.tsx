import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profileData) notFound()

  const profile = profileData as {
    id: string
    username: string
    plan: string
    points: number
    accuracy_pct: number
    streak: number
    best_streak: number
    total_calls: number
    correct_calls: number
    created_at: string
  }

  const isMe = user?.id === profile.id

  const { data: gamesData } = await supabase
    .from('games')
    .select('id, ticker, timeframe, ai_call, status, created_at, predictions(*)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: badgesData } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', profile.id)

  const games = gamesData ?? []
  const badges = badgesData ?? []

  const BADGE_INFO: Record<string, { icon: string; label: string }> = {
    beat_the_ai: { icon: '🤖', label: 'Beat the AI' },
    hot_streak: { icon: '🔥', label: 'Hot Streak' },
    sharp_shooter: { icon: '🎯', label: 'Sharp Shooter' },
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                {profile.plan === 'pro' && (
                  <Badge className="bg-yellow-400 text-black hover:bg-yellow-400 text-xs">PRO</Badge>
                )}
                {isMe && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </p>
            </div>
            {isMe && (
              <Link href="/upgrade" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {profile.plan === 'pro' ? 'Manage subscription →' : 'Upgrade to Pro →'}
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Points', value: (profile.points ?? 0).toLocaleString() },
          { label: 'Accuracy', value: `${Number(profile.accuracy_pct ?? 0).toFixed(1)}%` },
          { label: 'Streak', value: `${profile.streak ?? 0} 🔥` },
          { label: 'Best Streak', value: `${profile.best_streak ?? 0} 🏆` },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground font-normal">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold font-mono">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* W/L record */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Win / Loss record</span>
            <span className="font-mono font-semibold">
              <span className="text-green-500">{profile.correct_calls ?? 0}W</span>
              {' / '}
              <span className="text-red-500">{(profile.total_calls ?? 0) - (profile.correct_calls ?? 0)}L</span>
              <span className="text-muted-foreground ml-2">({profile.total_calls ?? 0} total)</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((b: any) => {
              const info = BADGE_INFO[b.badge_type] ?? { icon: '🏅', label: b.badge_type }
              return (
                <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm">
                  <span className="text-lg">{info.icon}</span>
                  <span className="font-medium">{info.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent games */}
      <div className="space-y-3">
        <h2 className="font-semibold">Recent Games</h2>
        {games.length === 0 ? (
          <p className="text-sm text-muted-foreground">No games yet.</p>
        ) : (
          <div className="space-y-2">
            {games.map((game: any) => {
              const prediction = game.predictions?.[0]
              return (
                <Link key={game.id} href={`/play/${game.id}`}>
                  <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-sm">{game.ticker}</span>
                      <span className="text-xs text-muted-foreground">{game.timeframe}</span>
                      {prediction && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          prediction.direction === 'bull' ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'
                        }`}>
                          {prediction.direction === 'bull' ? '▲ BULL' : '▼ BEAR'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {game.status === 'scored' && prediction && (
                        <span className={`text-sm font-mono font-semibold ${prediction.points_earned > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {prediction.points_earned > 0 ? `+${prediction.points_earned}` : '0'} pts
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        game.status === 'scored' ? 'bg-muted text-muted-foreground' : 'bg-yellow-500/15 text-yellow-500'
                      }`}>
                        {game.status}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
