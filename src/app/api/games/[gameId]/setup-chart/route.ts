import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFuturesKlines } from '@/lib/binance/price'
import { byDisplay } from '@/lib/timeframes'

const CANDLE_COUNT = 30

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data: gameData } = await supabase
    .from('games')
    .select('ticker, current_price, created_at, key_levels, timeframe, setup_klines')
    .eq('id', gameId)
    .single()

  if (!gameData) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

  const game = gameData as {
    ticker: string
    current_price: number
    created_at: string
    key_levels: Array<{ label: string; price: number; type: string }>
    timeframe: string
    setup_klines: Array<{ time: number; open: number; high: number; low: number; close: number }> | null
  }

  // Prefer the frozen snapshot stored at creation — guarantees the chart
  // matches the stored entry price and key levels. Older games have none,
  // so fall back to a live fetch of the creation-time window.
  let klines = game.setup_klines ?? []
  if (klines.length === 0) {
    const tf      = byDisplay(game.timeframe)
    const endMs   = new Date(game.created_at).getTime()
    const startMs = endMs - CANDLE_COUNT * tf.candleMs
    klines = await getFuturesKlines(game.ticker, tf.interval, startMs, CANDLE_COUNT)
  }

  return NextResponse.json({
    klines,
    entryPrice: game.current_price,
    keyLevels: game.key_levels,
    timeframe: game.timeframe,
  })
}
