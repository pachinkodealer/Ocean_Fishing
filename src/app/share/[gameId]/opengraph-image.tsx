import { ImageResponse } from 'next/og'
import { createServiceClient } from '@/lib/supabase/server'

export const alt = 'CallTheCandle result — can you beat the AI?'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-dynamic'

const BG = '#0a0e12'
const BULL = '#00ba74'
const BEAR = '#fa2050'
const MUTED = '#6b7280'

export default async function Image({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params
  const service = createServiceClient()

  const { data: game } = await service
    .from('games')
    .select('ticker, timeframe, ai_call, status, resolved_price, current_price, user_id')
    .eq('id', gameId)
    .maybeSingle()

  // Graceful fallback card if the game can't be loaded
  if (!game) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', background: BG, color: '#e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 700 }}>
          <div style={{ display: 'flex' }}>CallTheCandle</div>
          <div style={{ display: 'flex', fontSize: 32, color: MUTED, marginTop: 16 }}>Read the chart. Beat the AI.</div>
        </div>
      ),
      { ...size }
    )
  }

  const { data: prediction } = await service
    .from('predictions')
    .select('direction, is_correct, points_earned')
    .eq('game_id', gameId)
    .eq('user_id', game.user_id)
    .maybeSingle()

  const isScored = game.status === 'scored' && game.resolved_price != null
  const aiCorrect = isScored
    ? (game.ai_call === 'bull' ? game.resolved_price! > game.current_price : game.resolved_price! < game.current_price)
    : null
  const userCorrect = prediction?.is_correct ?? null

  // The verdict is the hook — lead with the human-vs-AI outcome
  let verdict = 'Live setup — can you call it?'
  let verdictColor = '#e8e8e8'
  if (isScored && prediction) {
    if (userCorrect && !aiCorrect) { verdict = 'You beat the AI.'; verdictColor = BULL }
    else if (!userCorrect && aiCorrect) { verdict = 'The AI won this one.'; verdictColor = BEAR }
    else if (userCorrect && aiCorrect) { verdict = 'You both nailed it.'; verdictColor = BULL }
    else { verdict = 'You both missed.'; verdictColor = MUTED }
  } else if (isScored) {
    verdict = aiCorrect ? 'The AI called it right.' : 'The AI got it wrong.'
    verdictColor = aiCorrect ? BULL : BEAR
  }

  const pill = (label: string, call: string | null, correct: boolean | null, pts?: number | null) => {
    const isBull = call === 'bull'
    const color = call ? (isBull ? BULL : BEAR) : MUTED
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#11161c', border: `2px solid ${color}33`, borderRadius: 20, padding: '28px 32px', gap: 10 }}>
        <div style={{ display: 'flex', fontSize: 24, color: MUTED }}>{label}</div>
        <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, color }}>
          {call ? (isBull ? '▲ BULL' : '▼ BEAR') : '— no call'}
        </div>
        {isScored && correct != null && (
          <div style={{ display: 'flex', fontSize: 26, color: correct ? BULL : BEAR }}>
            {correct ? `Correct${pts ? `  +${pts} pts` : ''}` : 'Wrong'}
          </div>
        )}
      </div>
    )
  }

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: BG, color: '#e8e8e8', display: 'flex', flexDirection: 'column', padding: 64, fontFamily: 'sans-serif' }}>
        {/* brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', width: 16, height: 16, borderRadius: 16, background: BULL }} />
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700 }}>CallTheCandle</div>
        </div>

        {/* main */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, letterSpacing: -1 }}>{game.ticker}</div>
            <div style={{ display: 'flex', fontSize: 28, color: MUTED, background: '#1a212a', borderRadius: 12, padding: '6px 18px' }}>{game.timeframe}</div>
          </div>

          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: verdictColor }}>{verdict}</div>

          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            {pill('AI called', game.ai_call, aiCorrect)}
            {pill('You called', prediction?.direction ?? null, userCorrect, prediction?.points_earned)}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 26, color: MUTED }}>
          <div style={{ display: 'flex' }}>Read the chart. Beat the AI.</div>
          <div style={{ display: 'flex', color: BULL }}>playoceancatch.com</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
