import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { analyzeChart } from '@/lib/ai/analyzeChart'
import { getCurrentPrice, validateTicker } from '@/lib/binance/price'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const FREE_DAILY_LIMIT = 3

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check rate limit for free users
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())

    if ((count ?? 0) >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Daily limit reached. Upgrade to Pro for unlimited calls.' },
        { status: 403 }
      )
    }
  }

  const formData = await request.formData()
  const screenshot = formData.get('screenshot') as File | null
  const ticker = (formData.get('ticker') as string)?.toUpperCase().trim()
  const timeframe = (formData.get('timeframe') as string)?.trim()

  if (!screenshot || !ticker || !timeframe) {
    return NextResponse.json({ error: 'screenshot, ticker, and timeframe are required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(screenshot.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, or GIF images are allowed' }, { status: 400 })
  }

  if (screenshot.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 })
  }

  // Validate ticker against Binance
  const isValidTicker = await validateTicker(ticker)
  if (!isValidTicker) {
    return NextResponse.json({ error: `Invalid ticker: ${ticker}` }, { status: 400 })
  }

  // Upload screenshot to Supabase Storage
  const service = createServiceClient()
  const arrayBuffer = await screenshot.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileName = `${user.id}/${Date.now()}.${screenshot.type.split('/')[1]}`

  const { error: uploadError } = await service.storage
    .from('chart-screenshots')
    .upload(fileName, buffer, { contentType: screenshot.type })

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 })
  }

  const { data: { publicUrl } } = service.storage
    .from('chart-screenshots')
    .getPublicUrl(fileName)

  // Fetch current price from Binance
  const currentPrice = await getCurrentPrice(ticker)

  // Run AI analysis
  const analysis = await analyzeChart(buffer, screenshot.type, ticker, timeframe, currentPrice)

  // Insert game into DB
  const resolveAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()

  const { data: game, error: gameError } = await service
    .from('games')
    .insert({
      user_id: user.id,
      ticker,
      timeframe,
      screenshot_url: publicUrl,
      current_price: analysis.current_price,
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

  return NextResponse.json(game, { status: 201 })
}
