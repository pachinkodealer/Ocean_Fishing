import { Badge } from '@/components/ui/badge'

interface LeaderboardEntry {
  rank: number
  user_id: string
  points: number
  accuracy: number
  correct: number
  total: number
  streak: number
  profiles: {
    username: string
    avatar_url: string | null
    plan: string
  } | null
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const MEDALS = ['🥇', '🥈', '🥉']

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-2xl">🏆</p>
        <p className="font-medium">No entries yet</p>
        <p className="text-sm text-muted-foreground">Make some predictions to appear here</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left">
            <th className="pb-3 w-10">#</th>
            <th className="pb-3">Trader</th>
            <th className="pb-3 text-right">Points</th>
            <th className="pb-3 text-right">Accuracy</th>
            <th className="pb-3 text-right">W/L</th>
            <th className="pb-3 text-right">Streak</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.map((entry) => {
            const isMe = entry.user_id === currentUserId
            return (
              <tr
                key={entry.user_id}
                className={`${isMe ? 'bg-primary/5' : 'hover:bg-muted/30'} transition-colors`}
              >
                <td className="py-3 font-bold text-base">
                  {entry.rank <= 3
                    ? MEDALS[entry.rank - 1]
                    : <span className="text-muted-foreground text-sm">{entry.rank}</span>}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.profiles?.username ?? 'Unknown'}</span>
                    {entry.profiles?.plan === 'pro' && (
                      <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/40 py-0">PRO</Badge>
                    )}
                    {isMe && (
                      <Badge variant="outline" className="text-xs py-0">You</Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {entry.points.toLocaleString()}
                </td>
                <td className="py-3 text-right font-mono">
                  <span className={
                    entry.accuracy >= 60 ? 'text-green-500' :
                    entry.accuracy >= 40 ? 'text-yellow-500' :
                    'text-muted-foreground'
                  }>
                    {Number(entry.accuracy).toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 text-right text-muted-foreground font-mono">
                  {entry.correct}/{entry.total}
                </td>
                <td className="py-3 text-right font-mono">
                  {entry.streak > 0
                    ? <span className="text-orange-500">🔥{entry.streak}</span>
                    : <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
