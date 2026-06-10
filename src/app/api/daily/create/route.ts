import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getFuturesKlines } from '@/lib/binance/price'
import { analyzeDailyChallenge } from '@/lib/ai/analyzeDailyChallenge'

const DAILY_TICKER = 'BTCUSDT'
const DAILY_TIMEFRAME = '4h'
const KLINE_LOOKBACK = 50 // 50 candles of context for analysis

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const service = createServiceClient()

  // Today's date in UTC (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]

  // Check if today's challenge already exists
  const { data: existing } = await service
    .from('daily_challenges')
    .select('id')
    .eq('challenge_date', today)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ message: 'Challenge already exists for today', id: existing.id })
  }

  // Fetch recent 4H candles from Binance (lookback from now)
  const startMs = Date.now() - KLINE_LOOKBACK * 4 * 60 * 60 * 1000
  const klines = await getFuturesKlines(DAILY_TICKER, DAILY_TIMEFRAME, startMs, KLINE_LOOKBACK)

  if (klines.length < 10) {
    return NextResponse.json({ error: 'Insufficient kline data from Binance' }, { status: 502 })
  }

  // Run text-based AI analysis
  const analysis = await analyzeDailyChallenge(DAILY_TICKER, DAILY_TIMEFRAME, klines)

  // Resolve at 8pm UTC today — gives users all day to participate
  const resolveAt = new Date(`${today}T20:00:00Z`).toISOString()

  const { data: challenge, error } = await service
    .from('daily_challenges')
    .insert({
      challenge_date: today,
      ticker: DAILY_TICKER,
      timeframe: DAILY_TIMEFRAME,
      current_price: analysis.current_price,
      key_levels: analysis.key_levels,
      bull_scenario: analysis.bull_scenario,
      bear_scenario: analysis.bear_scenario,
      ai_call: analysis.ai_call,
      ai_target: analysis.ai_target,
      ai_reasoning: analysis.ai_reasoning,
      confidence: analysis.confidence,
      resolve_at: resolveAt,
    })
    .select()
    .single()

  if (error) {
    // If unique constraint violated (race condition), return existing
    if (error.code === '23505') {
      const { data: race } = await service
        .from('daily_challenges')
        .select('id')
        .eq('challenge_date', today)
        .single()
      return NextResponse.json({ message: 'Challenge already exists', id: race?.id })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: challenge.id, ticker: DAILY_TICKER, current_price: analysis.current_price }, { status: 201 })
}
