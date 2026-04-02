import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getKlines } from '@/lib/binance/price'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data: gameData } = await supabase
    .from('games')
    .select('ticker, current_price, resolve_at, resolved_price, ai_call, ai_target, key_levels, bull_scenario, bear_scenario, created_at, status')
    .eq('id', gameId)
    .single()

  if (!gameData) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  const game = gameData as {
    ticker: string
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

  // Fetch 15-min candles for the 4H window (16 candles = 4 hours)
  const klines = await getKlines(game.ticker, '15m', startMs, 16)

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
