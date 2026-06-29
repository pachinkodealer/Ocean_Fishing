import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata(
  { params }: { params: Promise<{ gameId: string }> }
): Promise<Metadata> {
  const { gameId } = await params
  const service = createServiceClient()

  const { data: game } = await service
    .from('games')
    .select('ticker, ai_call, status, resolved_price, current_price')
    .eq('id', gameId)
    .maybeSingle()

  if (!game) return { title: 'CallTheCandle' }

  const outcome = game.status === 'scored' && game.resolved_price
    ? (game.resolved_price > game.current_price ? '🐂 Bullish' : '🐻 Bearish')
    : 'Pending'

  return {
    title: `${game.ticker} · ${outcome} — CallTheCandle`,
    description: `AI called ${game.ai_call?.toUpperCase()} on ${game.ticker}. Can you beat the AI?`,
    openGraph: {
      title: `${game.ticker} · ${outcome} — CallTheCandle`,
      description: `AI called ${game.ai_call?.toUpperCase()} on ${game.ticker}. Can you beat the AI?`,
      siteName: 'CallTheCandle',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${game.ticker} · ${outcome} — CallTheCandle`,
      description: `AI called ${game.ai_call?.toUpperCase()} on ${game.ticker}. Can you beat the AI?`,
    },
  }
}

export default async function SharePage(
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const service = createServiceClient()

  const { data: game } = await service
    .from('games')
    .select('*')
    .eq('id', gameId)
    .maybeSingle()

  if (!game) notFound()

  // Fetch the owner's prediction
  const { data: prediction } = await service
    .from('predictions')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', game.user_id)
    .maybeSingle()

  // Fetch owner username
  const { data: profile } = await service
    .from('profiles')
    .select('username')
    .eq('id', game.user_id)
    .maybeSingle()

  const isScored = game.status === 'scored'
  const priceUp = game.resolved_price ? game.resolved_price > game.current_price : null
  const userCorrect = prediction?.is_correct ?? null
  const aiCorrect = isScored && game.resolved_price
    ? (game.ai_call === 'bull' ? game.resolved_price > game.current_price : game.resolved_price < game.current_price)
    : null

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            CallTheCandle
          </Link>
        </div>

        {/* Result card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 space-y-5">
          {/* Ticker + status */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {game.is_daily && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                    ⚡ Daily
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isScored ? 'bg-zinc-700 text-zinc-300' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {isScored ? 'Scored' : 'Live'}
                </span>
              </div>
              <h1 className="text-3xl font-bold font-mono text-white">{game.ticker}</h1>
              <p className="text-zinc-400 text-sm">{game.timeframe} · Entry ${game.current_price.toLocaleString()}</p>
            </div>
            {isScored && game.resolved_price && (
              <div className="text-right">
                <p className="text-xs text-zinc-500">Resolved</p>
                <p className={`font-mono font-bold text-xl ${priceUp ? 'text-green-400' : 'text-red-400'}`}>
                  ${game.resolved_price.toLocaleString()}
                </p>
                <p className={`text-xs font-semibold ${priceUp ? 'text-green-400' : 'text-red-400'}`}>
                  {priceUp ? '▲ Bullish' : '▼ Bearish'}
                </p>
              </div>
            )}
          </div>

          {/* AI vs User calls */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl border p-3 ${
              aiCorrect === true ? 'border-green-500/40 bg-green-500/10' :
              aiCorrect === false ? 'border-red-500/40 bg-red-500/10' :
              'border-white/10 bg-zinc-800/50'
            }`}>
              <p className="text-xs text-zinc-500 mb-1">AI called</p>
              <p className={`font-bold text-lg ${game.ai_call === 'bull' ? 'text-green-400' : 'text-red-400'}`}>
                {game.ai_call === 'bull' ? '🐂 BULL' : '🐻 BEAR'}
              </p>
              {isScored && (
                <p className="text-xs mt-1">
                  {aiCorrect === true ? '✅ Correct' : aiCorrect === false ? '❌ Wrong' : ''}
                </p>
              )}
            </div>

            <div className={`rounded-xl border p-3 ${
              userCorrect === true ? 'border-green-500/40 bg-green-500/10' :
              userCorrect === false ? 'border-red-500/40 bg-red-500/10' :
              'border-white/10 bg-zinc-800/50'
            }`}>
              <p className="text-xs text-zinc-500 mb-1">
                {profile?.username ?? 'Player'} called
              </p>
              {prediction ? (
                <>
                  <p className={`font-bold text-lg ${prediction.direction === 'bull' ? 'text-green-400' : 'text-red-400'}`}>
                    {prediction.direction === 'bull' ? '🐂 BULL' : '🐻 BEAR'}
                  </p>
                  {isScored && (
                    <p className="text-xs mt-1">
                      {userCorrect === true ? `✅ +${prediction.points_earned} pts` : userCorrect === false ? '❌ Wrong' : ''}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-zinc-500 text-sm">No prediction</p>
              )}
            </div>
          </div>

          {/* AI reasoning snippet */}
          {game.ai_reasoning && (
            <div className="border border-white/10 bg-zinc-800/50 rounded-xl p-3">
              <p className="text-xs text-zinc-500 mb-1">AI reasoning</p>
              <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">{game.ai_reasoning}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center space-y-2">
          <p className="text-zinc-500 text-sm">Think you can beat the AI?</p>
          <Link
            href="/play"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Play CallTheCandle →
          </Link>
        </div>
      </div>
    </div>
  )
}
