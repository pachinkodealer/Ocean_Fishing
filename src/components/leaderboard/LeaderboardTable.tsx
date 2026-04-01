import { Badge } from '@/components/ui/badge'

interface LeaderboardEntry {
  rank: number
  user_id: string
  points: number
  accuracy: number
  correct: number
  total: number
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

const rankColors = ['text-yellow-400', 'text-gray-400', 'text-orange-400']

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No entries yet. Be the first!</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left">
            <th className="pb-3 w-12">#</th>
            <th className="pb-3">Trader</th>
            <th className="pb-3 text-right">Points</th>
            <th className="pb-3 text-right">Accuracy</th>
            <th className="pb-3 text-right">Calls</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.map((entry) => {
            const isMe = entry.user_id === currentUserId
            return (
              <tr key={entry.user_id} className={`py-3 ${isMe ? 'bg-primary/5' : ''}`}>
                <td className={`py-3 font-bold ${rankColors[entry.rank - 1] || 'text-muted-foreground'}`}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.profiles?.username ?? 'Unknown'}</span>
                    {entry.profiles?.plan === 'pro' && (
                      <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/40">PRO</Badge>
                    )}
                    {isMe && <Badge variant="outline" className="text-xs">You</Badge>}
                  </div>
                </td>
                <td className="py-3 text-right font-mono font-semibold">{entry.points.toLocaleString()}</td>
                <td className="py-3 text-right font-mono">
                  <span className={entry.accuracy >= 60 ? 'text-green-400' : entry.accuracy >= 40 ? 'text-yellow-400' : 'text-muted-foreground'}>
                    {entry.accuracy.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 text-right text-muted-foreground">{entry.total}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
