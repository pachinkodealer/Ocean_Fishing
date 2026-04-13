import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export async function TodayPlayers() {
  const service = createServiceClient()

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  // All games created today with profile + prediction data
  const { data: games } = await service
    .from('games')
    .select(`
      id,
      user_id,
      is_daily,
      status,
      profiles!inner(username),
      predictions(points_earned, is_correct)
    `)
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: true })

  if (!games || games.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span>👥</span> Today's Players
        </h3>
        <p className="text-muted-foreground text-sm text-center py-4">
          No activity yet today.
        </p>
      </div>
    )
  }

  // Aggregate by user
  const userMap = new Map<string, {
    username: string
    totalCalls: number
    dailyCalls: number
    pointsToday: number
  }>()

  for (const game of games as any[]) {
    const uid = game.user_id
    const username = game.profiles?.username ?? 'Unknown'
    const pred = game.predictions?.[0]
    const pts = pred?.points_earned ?? 0

    if (!userMap.has(uid)) {
      userMap.set(uid, { username, totalCalls: 0, dailyCalls: 0, pointsToday: 0 })
    }

    const entry = userMap.get(uid)!
    entry.totalCalls += 1
    if (game.is_daily) entry.dailyCalls += 1
    entry.pointsToday += pts
  }

  const entries = Array.from(userMap.values())
    .sort((a, b) => b.pointsToday - a.pointsToday || b.totalCalls - a.totalCalls)

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span>👥</span> Today's Players
        <span className="ml-auto text-xs text-muted-foreground font-normal">
          {entries.length} active today
        </span>
      </h3>

      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30">
            <span className="text-sm font-mono text-muted-foreground w-5 text-right">
              {i + 1}
            </span>
            <Link
              href={`/profile/${entry.username}`}
              className="flex-1 font-medium text-sm hover:text-primary transition-colors"
            >
              {entry.username}
            </Link>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span title="Total calls today" className="flex items-center gap-1">
                🎯 {entry.totalCalls} call{entry.totalCalls !== 1 ? 's' : ''}
              </span>
              {entry.dailyCalls > 0 && (
                <span title="Daily challenge" className="text-yellow-400 flex items-center gap-1">
                  ⚡ Daily
                </span>
              )}
            </div>
            <span className="font-mono font-semibold text-sm min-w-[3.5rem] text-right">
              {entry.pointsToday > 0 ? (
                <span className="text-green-400">+{entry.pointsToday} pts</span>
              ) : (
                <span className="text-muted-foreground">— pts</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
