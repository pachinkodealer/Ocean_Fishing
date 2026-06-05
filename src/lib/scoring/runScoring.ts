import { createServiceClient } from '@/lib/supabase/server'
import { getKlineAtTime } from '@/lib/binance/price'
import { scoreGame, recalculateAccuracy } from '@/lib/scoring/engine'

const TIMEFRAME_TO_INTERVAL: Record<string, string> = {
  '15M': '15m',
  '30M': '30m',
  '1H':  '1h',
  '4H':  '4h',
  '1D':  '1d',
  '1W':  '1w',
}

export async function runScoring(): Promise<{ scored: number; errors: string[] }> {
  const service = createServiceClient()
  const errors: string[] = []

  const { data: games, error } = await service
    .from('games')
    .select('*')
    .eq('status', 'pending')
    .lte('resolve_at', new Date().toISOString())

  if (error) throw new Error('DB error fetching pending games')
  if (!games || games.length === 0) return { scored: 0, errors: [] }

  let scored = 0

  for (const game of games) {
    try {
      const resolveMs = new Date(game.resolve_at).getTime()
      const interval = TIMEFRAME_TO_INTERVAL[game.timeframe] ?? '4h'
      const kline = await getKlineAtTime(game.ticker, interval, resolveMs)

      const { data: predictions } = await service
        .from('predictions')
        .select('*')
        .eq('game_id', game.id)

      if (predictions) {
        for (const prediction of predictions) {
          const { data: profile } = await service
            .from('profiles')
            .select('streak, correct_calls, total_calls, points')
            .eq('id', prediction.user_id)
            .single()

          const result = scoreGame({
            entryPrice: game.current_price,
            resolvedClose: kline.close,
            resolvedHigh: kline.high,
            resolvedLow: kline.low,
            direction: prediction.direction,
            targetPrice: prediction.target_price,
            currentStreak: profile?.streak ?? 0,
          })

          await service
            .from('predictions')
            .update({
              points_earned: result.pointsEarned,
              is_correct: result.isCorrect,
              hit_target: result.hitTarget,
              scored_at: new Date().toISOString(),
            })
            .eq('id', prediction.id)

          const newTotalCalls = (profile?.total_calls ?? 0) + 1
          const newCorrectCalls = (profile?.correct_calls ?? 0) + (result.isCorrect ? 1 : 0)

          await service
            .from('profiles')
            .update({
              points: (profile?.points ?? 0) + result.pointsEarned,
              streak: result.newStreak,
              correct_calls: newCorrectCalls,
              total_calls: newTotalCalls,
              accuracy_pct: recalculateAccuracy(newCorrectCalls, newTotalCalls),
            })
            .eq('id', prediction.user_id)

          if (result.newStreak >= 5) {
            await service.from('badges').upsert({
              user_id: prediction.user_id,
              badge_type: 'hot_streak',
              metadata: { streak: result.newStreak },
            }).match({ user_id: prediction.user_id, badge_type: 'hot_streak' })
          }
        }
      }

      await service
        .from('games')
        .update({ status: 'scored', resolved_price: kline.close })
        .eq('id', game.id)

      scored++
    } catch (err) {
      const msg = `Failed to score game ${game.id}: ${err}`
      console.error(msg)
      errors.push(msg)
    }
  }

  try {
    await service.rpc('refresh_leaderboard')
  } catch (err) {
    console.error('Failed to refresh leaderboard:', err)
  }

  return { scored, errors }
}
