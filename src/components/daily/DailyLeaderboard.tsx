import { createServiceClient } from '@/lib/supabase/server'

interface Props {
  challengeId: string
}

export async function DailyLeaderboard({ challengeId }: Props) {
  const service = createServiceClient()

  // Get all games for this challenge with their predictions and profiles
  const { data: games } = await service
    .from('games')
    .select(`
      id,
      user_id,
      status,
      profiles!inner(username),
      predictions(direction, points_earned, is_correct)
    `)
    .eq('daily_challenge_id', challengeId)
    .order('created_at', { ascending: true })

  if (!games || games.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span>🏆</span> Daily Leaderboard
        </h3>
        <p className="text-muted-foreground text-sm text-center py-4">
          No participants yet. Be the first to play!
        </p>
      </div>
    )
  }

  // Build leaderboard entries
  const entries = games.map((game: any) => {
    const pred = game.predictions?.[0]
    return {
      username: game.profiles?.username ?? 'Unknown',
      direction: pred?.direction ?? null,
      points: pred?.points_earned ?? null,
      isCorrect: pred?.is_correct ?? null,
      scored: game.status === 'scored',
    }
  })

  // Sort: scored entries first (by points desc), then pending
  const scored = entries
    .filter(e => e.scored && e.points !== null)
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
  const pending = entries.filter(e => !e.scored)

  const allEntries = [...scored, ...pending]

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span>🏆</span> Daily Leaderboard
        <span className="ml-auto text-xs text-muted-foreground font-normal">
          {allEntries.length} participant{allEntries.length !== 1 ? 's' : ''}
        </span>
      </h3>

      <div className="space-y-2">
        {allEntries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30"
          >
            <span className="text-sm font-mono text-muted-foreground w-5 text-right">
              {entry.scored ? `#${i + 1}` : '—'}
            </span>
            <span className="flex-1 font-medium text-sm">{entry.username}</span>
            {entry.direction && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                entry.direction === 'bull'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {entry.direction === 'bull' ? '🐂 BULL' : '🐻 BEAR'}
              </span>
            )}
            <span className="text-sm font-mono font-semibold min-w-[3rem] text-right">
              {entry.scored && entry.points !== null ? (
                <span className={entry.points > 0 ? 'text-green-400' : 'text-muted-foreground'}>
                  +{entry.points} pts
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">Pending</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
