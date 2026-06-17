import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getRecentFuturesKlines } from '@/lib/binance/price'
import { analyzeDailyChallenge } from '@/lib/ai/analyzeDailyChallenge'
import { byInterval } from '@/lib/timeframes'
import { detectSetup } from '@/lib/setups/detector'

const FREE_DAILY_LIMIT = 3
const TICKER = 'ETHUSDT'
const CANDLE_COUNT = 30
const PLAYABLE = new Set(['15m', '30m', '1h', '4h'])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const interval = (body.timeframe as string) ?? '4h'

  const tf = byInterval(interval)
  if (!tf || !PLAYABLE.has(interval)) {
    return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 })
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (profileData as { plan: string } | null)?.plan ?? 'free'
  if (plan === 'free') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
    if ((count ?? 0) >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Daily limit reached. Upgrade to Pro for unlimited plays.' },
        { status: 403 }
      )
    }
  }

  const klines = await getRecentFuturesKlines(TICKER, interval, CANDLE_COUNT)
  if (klines.length < 10) {
    return NextResponse.json({ error: 'Unable to fetch market data. Try again.' }, { status: 503 })
  }

  const setup = detectSetup(klines)

  const analysis = await analyzeDailyChallenge(
    TICKER,
    interval,
    klines.map(k => ({ open: k.open, high: k.high, low: k.low, close: k.close }))
  )

  // Use the actual last kline close — more reliable than the AI's reported current_price
  const entryPrice = klines[klines.length - 1].close

  const resolveAt = new Date(Date.now() + tf.candleMs).toISOString()
  const service = createServiceClient()

  const { data: game, error: gameError } = await service
    .from('games')
    .insert({
      user_id: user.id,
      ticker: TICKER,
      timeframe: tf.display,
      screenshot_url: '',
      current_price: entryPrice,
      key_levels: analysis.key_levels,
      bull_scenario: analysis.bull_scenario,
      bear_scenario: analysis.bear_scenario,
      ai_call: analysis.ai_call,
      ai_target: analysis.ai_target,
      ai_reasoning: analysis.ai_reasoning,
      confidence: analysis.confidence,
      status: 'pending',
      resolve_at: resolveAt,
    })
    .select()
    .single()

  if (gameError) {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }

  return NextResponse.json(
    { id: game.id, setupType: setup.type, setupLabel: setup.label },
    { status: 201 }
  )
}
