import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getKlineAtTime } from '@/lib/binance/price'
import { scoreGame, recalculateAccuracy } from '@/lib/scoring/engine'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const service = createServiceClient()

  // Fetch all pending games past their resolve_at
  const { data: games, error } = await service
    .from('games')
    .select('*')
    .eq('status', 'pending')
    .lte('resolve_at', new Date().toISOString())

  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  if (!games || games.length === 0) {
    return NextResponse.json({ scored: 0 })
  }

  let scored = 0

  for (const game of games) {
    try {
      const resolveMs = new Date(game.resolve_at).getTime()
      const kline = await getKlineAtTime(game.ticker, '4h', resolveMs)

      // Fetch predictions for this game
      const { data: predictions } = await service
        .from('predictions')
        .select('*')
        .eq('game_id', game.id)

      if (predictions) {
        for (const prediction of predictions) {
          // Fetch current streak for user
          const { data: profile } = await service
            .from('profiles')
            .select('streak, correct_calls, total_calls')
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

          // Update prediction
          await service
            .from('predictions')
            .update({
              points_earned: result.pointsEarned,
              is_correct: result.isCorrect,
              hit_target: result.hitTarget,
              scored_at: new Date().toISOString(),
            })
            .eq('id', prediction.id)

          // Update profile
          const newTotalCalls = (profile?.total_calls ?? 0) + 1
          const newCorrectCalls = (profile?.correct_calls ?? 0) + (result.isCorrect ? 1 : 0)

          // Get current points first then add earned
          const currentPoints = (profile as any)?.points ?? 0
          await service
            .from('profiles')
            .update({
              points: currentPoints + result.pointsEarned,
              streak: result.newStreak,
              correct_calls: newCorrectCalls,
              total_calls: newTotalCalls,
              accuracy_pct: recalculateAccuracy(newCorrectCalls, newTotalCalls),
            })
            .eq('id', prediction.user_id)

          // Award badges
          if (result.newStreak >= 5) {
            await service.from('badges').upsert({
              user_id: prediction.user_id,
              badge_type: 'hot_streak',
              metadata: { streak: result.newStreak },
            }).match({ user_id: prediction.user_id, badge_type: 'hot_streak' })
          }
        }
      }

      // Mark game as scored
      await service
        .from('games')
        .update({ status: 'scored', resolved_price: kline.close })
        .eq('id', game.id)

      scored++
    } catch (err) {
      console.error(`Failed to score game ${game.id}:`, err)
    }
  }

  // Refresh leaderboard
  try {
    await service.rpc('refresh_leaderboard')
  } catch (err) {
    console.error('Failed to refresh leaderboard:', err)
  }

  return NextResponse.json({ scored })
}
