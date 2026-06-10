import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ScenarioCard } from '@/components/chart/ScenarioCard'
import { PriceLevels } from '@/components/chart/PriceLevels'
import { AIvsYou } from '@/components/game/AIvsYou'
import { CountdownTimer } from '@/components/game/CountdownTimer'
import { GamePredictionSection } from './GamePredictionSection'
import { ResultsChartDynamic as ResultsChart } from '@/components/game/ResultsChartDynamic'
import { SetupChartDynamic as SetupChart } from '@/components/game/SetupChartDynamic'
import { ShareButton } from '@/components/game/ShareButton'
import type { Database } from '@/types/database'

type Game = Database['public']['Tables']['games']['Row']
type Prediction = Database['public']['Tables']['predictions']['Row']

export default async function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: gameData } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()

  const game = gameData as Game | null
  if (!game) notFound()

  const { data: predictionData } = await supabase
    .from('predictions')
    .select('*')
    .eq('game_id', gameId)
    .eq('user_id', user!.id)
    .maybeSingle()

  const prediction = predictionData as Prediction | null

  // Determine AI correctness if scored
  let aiIsCorrect: boolean | null = null
  if (game.status === 'scored' && game.resolved_price) {
    aiIsCorrect = game.ai_call === 'bull'
      ? game.resolved_price > game.current_price
      : game.resolved_price < game.current_price
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight">{game.ticker}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              {game.timeframe}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">Entry ${game.current_price.toLocaleString()}</p>
        </div>
        {game.status === 'pending' && (
          <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Resolves in</p>
            <CountdownTimer resolveAt={game.resolve_at} />
          </div>
        )}
        {game.status === 'scored' && (
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Resolved at</p>
              <p className="font-mono font-bold text-lg leading-tight">${game.resolved_price?.toLocaleString()}</p>
            </div>
            {prediction && <ShareButton gameId={gameId} />}
          </div>
        )}
      </div>

      {game.screenshot_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={game.screenshot_url}
          alt={`${game.ticker} chart`}
          loading="lazy"
          decoding="async"
          className="w-full rounded-xl border border-border object-contain max-h-96"
        />
      ) : (
        <SetupChart gameId={gameId} />
      )}

      {/* Key levels */}
      <PriceLevels levels={game.key_levels as any[]} currentPrice={game.current_price} />

      {/* Scenarios */}
      <div className="grid md:grid-cols-2 gap-4">
        <ScenarioCard type="bull" scenario={game.bull_scenario as any} currentPrice={game.current_price} />
        <ScenarioCard type="bear" scenario={game.bear_scenario as any} currentPrice={game.current_price} />
      </div>

      {/* Results chart — only when scored */}
      {game.status === 'scored' && prediction && (
        <ResultsChart
          gameId={gameId}
          userCall={(prediction.direction ?? null) as 'bull' | 'bear' | null}
          isCorrect={prediction.is_correct ?? null}
          pointsEarned={prediction.points_earned ?? null}
          hitTarget={prediction.hit_target ?? null}
        />
      )}

      {/* Prediction section */}
      {!prediction && game.status === 'pending' ? (
        <GamePredictionSection gameId={gameId} currentPrice={game.current_price} />
      ) : (
        <AIvsYou
          aiCall={game.ai_call as 'bull' | 'bear'}
          aiTarget={game.ai_target}
          aiReasoning={game.ai_reasoning}
          confidence={game.confidence}
          userCall={(prediction?.direction ?? null) as 'bull' | 'bear' | null}
          userTarget={prediction?.target_price ?? null}
          isCorrect={prediction?.is_correct ?? null}
          aiIsCorrect={aiIsCorrect}
          pointsEarned={prediction?.points_earned ?? null}
          resolvedPrice={game.resolved_price ?? null}
          scored={game.status === 'scored'}
        />
      )}
    </div>
  )
}
