import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFuturesKlines } from '@/lib/binance/price'

const CANDLE_COUNT = 30

const TIMEFRAME_TO_MS: Record<string, number> = {
  '15M': 15 * 60 * 1000,
  '30M': 30 * 60 * 1000,
  '1H':  60 * 60 * 1000,
  '4H':  4 * 60 * 60 * 1000,
}

const TIMEFRAME_TO_INTERVAL: Record<string, string> = {
  '15M': '15m',
  '30M': '30m',
  '1H':  '1h',
  '4H':  '4h',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data: gameData } = await supabase
    .from('games')
    .select('ticker, current_price, created_at, key_levels, timeframe')
    .eq('id', gameId)
    .single()

  if (!gameData) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

  const game = gameData as {
    ticker: string
    current_price: number
    created_at: string
    key_levels: Array<{ label: string; price: number; type: string }>
    timeframe: string
  }

  const intervalMs = TIMEFRAME_TO_MS[game.timeframe] ?? TIMEFRAME_TO_MS['4H']
  const binanceInterval = TIMEFRAME_TO_INTERVAL[game.timeframe] ?? '4h'

  const endMs = new Date(game.created_at).getTime()
  const startMs = endMs - CANDLE_COUNT * intervalMs

  const klines = await getFuturesKlines(game.ticker, binanceInterval, startMs, CANDLE_COUNT)

  return NextResponse.json({
    klines,
    entryPrice: game.current_price,
    keyLevels: game.key_levels,
    timeframe: game.timeframe,
  })
}
