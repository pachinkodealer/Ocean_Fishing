import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFuturesKlines } from '@/lib/binance/price'
import { byDisplay } from '@/lib/timeframes'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data: gameData } = await supabase
    .from('games')
    .select('ticker, timeframe, current_price, resolve_at, resolved_price, ai_call, ai_target, key_levels, bull_scenario, bear_scenario, created_at, status')
    .eq('id', gameId)
    .single()

  if (!gameData) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  const game = gameData as {
    ticker: string
    timeframe: string
    current_price: number
    resolve_at: string
    resolved_price: number | null
    ai_call: string
    ai_target: number
    key_levels: Array<{ label: string; price: number; type: string }>
    bull_scenario: { target: number; invalidation: number; reasoning: string }
    bear_scenario: { target: number; invalidation: number; reasoning: string }
    created_at: string
    status: string
  }

  const startMs = new Date(game.created_at).getTime()

  // Result candles sized to the game's timeframe (e.g. 15M game → 15 × 1m)
  const tf = byDisplay(game.timeframe)
  const klines = await getFuturesKlines(game.ticker, tf.resultInterval, startMs, tf.resultLimit)

  return NextResponse.json({
    klines,
    entryPrice: game.current_price,
    resolvedPrice: game.resolved_price,
    aiCall: game.ai_call,
    aiTarget: game.ai_target,
    keyLevels: game.key_levels,
    bullTarget: (game.bull_scenario as { target: number })?.target ?? null,
    bearTarget: (game.bear_scenario as { target: number })?.target ?? null,
    status: game.status,
  })
}
