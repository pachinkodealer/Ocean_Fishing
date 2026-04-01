import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { direction, target_price } = body

  if (!direction || !['bull', 'bear'].includes(direction)) {
    return NextResponse.json({ error: 'direction must be "bull" or "bear"' }, { status: 400 })
  }

  // Verify game exists and is pending
  const { data: gameData } = await supabase
    .from('games')
    .select('id, status')
    .eq('id', gameId)
    .single()

  const game = gameData as { id: string; status: string } | null
  if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  if (game.status !== 'pending') {
    return NextResponse.json({ error: 'Game already scored' }, { status: 409 })
  }

  // Check for duplicate prediction
  const { data: existing } = await supabase
    .from('predictions')
    .select('id')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already submitted a prediction for this game' }, { status: 409 })
  }

  const service = createServiceClient()
  const { data: prediction, error } = await (service as any)
    .from('predictions')
    .insert({
      game_id: gameId,
      user_id: user.id,
      direction,
      target_price: target_price ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save prediction' }, { status: 500 })
  }

  return NextResponse.json(prediction, { status: 201 })
}
