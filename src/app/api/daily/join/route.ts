import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  // Get today's challenge
  const today = new Date().toISOString().split('T')[0]
  const { data: challenge } = await service
    .from('daily_challenges')
    .select('*')
    .eq('challenge_date', today)
    .maybeSingle()

  if (!challenge) {
    return NextResponse.json({ error: 'No daily challenge available yet. Check back soon!' }, { status: 404 })
  }

  // Check if challenge has already resolved
  if (new Date(challenge.resolve_at) <= new Date()) {
    return NextResponse.json({ error: 'Today\'s challenge has already closed.' }, { status: 410 })
  }

  // Check if user already joined
  const { data: existingGame } = await service
    .from('games')
    .select('id')
    .eq('user_id', user.id)
    .eq('daily_challenge_id', challenge.id)
    .maybeSingle()

  if (existingGame) {
    return NextResponse.json({ gameId: existingGame.id, alreadyJoined: true })
  }

  // Create a game for this user from the daily challenge data
  const { data: game, error } = await service
    .from('games')
    .insert({
      user_id: user.id,
      ticker: challenge.ticker,
      timeframe: challenge.timeframe,
      screenshot_url: '',
      current_price: challenge.current_price,
      key_levels: challenge.key_levels,
      bull_scenario: challenge.bull_scenario,
      bear_scenario: challenge.bear_scenario,
      ai_call: challenge.ai_call,
      ai_target: challenge.ai_target,
      ai_reasoning: challenge.ai_reasoning,
      confidence: challenge.confidence,
      status: 'pending',
      resolve_at: challenge.resolve_at,
      is_daily: true,
      daily_challenge_id: challenge.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ gameId: game.id }, { status: 201 })
}
