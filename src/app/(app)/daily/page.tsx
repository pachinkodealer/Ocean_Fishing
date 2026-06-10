import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ScenarioCard } from '@/components/chart/ScenarioCard'
import { PriceLevels } from '@/components/chart/PriceLevels'
import { AIvsYou } from '@/components/game/AIvsYou'
import { CountdownTimer } from '@/components/game/CountdownTimer'
import { ResultsChartDynamic as ResultsChart } from '@/components/game/ResultsChartDynamic'
import { ShareButton } from '@/components/game/ShareButton'
import { JoinDailyButton } from '@/components/daily/JoinDailyButton'
import { DailyLeaderboard } from '@/components/daily/DailyLeaderboard'
import { TodayPlayers } from '@/components/daily/TodayPlayers'
import Link from 'next/link'

export default async function DailyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const service = createServiceClient()

  const today = new Date().toISOString().split('T')[0]

  // Get today's challenge
  const { data: challenge } = await service
    .from('daily_challenges')
    .select('*')
    .eq('challenge_date', today)
    .maybeSingle()

  // Get user's game for today (if joined)
  const userGame = user && challenge ? await (async () => {
    const { data } = await service
      .from('games')
      .select('*, predictions(*)')
      .eq('user_id', user.id)
      .eq('daily_challenge_id', challenge.id)
      .maybeSingle()
    return data
  })() : null

  const userPrediction = userGame?.predictions?.[0] ?? null
  const isResolved = challenge ? new Date(challenge.resolve_at) <= new Date() : false
  const isScored = userGame?.status === 'scored'

  // AI correctness
  let aiIsCorrect: boolean | null = null
  if (isScored && userGame?.resolved_price && challenge) {
    aiIsCorrect = challenge.ai_call === 'bull'
      ? userGame.resolved_price > challenge.current_price
      : userGame.resolved_price < challenge.current_price
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold bg-gold/10 text-gold border border-gold/25 px-2.5 py-0.5 rounded-full">
              ⚡ Daily Challenge
            </span>
            <span className="text-xs text-muted-foreground font-mono">{today}</span>
          </div>
          {challenge ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight">{challenge.ticker}</h1>
              <p className="text-muted-foreground text-sm">
                {challenge.timeframe} · Entry ${challenge.current_price.toLocaleString()}
              </p>
            </>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">No challenge today yet</h1>
          )}
        </div>

        {challenge && (
          <div className="text-center">
            {isResolved ? (
              isScored && userGame?.resolved_price ? (
                <div>
                  <p className="text-xs text-muted-foreground">Resolved at</p>
                  <p className="font-mono font-bold text-xl">${userGame.resolved_price.toLocaleString()}</p>
                </div>
              ) : userGame ? (
                <span className="text-xs text-muted-foreground">Scoring...</span>
              ) : (
                <span className="text-xs text-muted-foreground">Closed</span>
              )
            ) : (
              <div>
                <p className="text-xs text-center text-muted-foreground mb-1">Closes in</p>
                <CountdownTimer resolveAt={challenge.resolve_at} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        {[
          { step: '1', title: 'AI picks BTC', desc: 'New challenge every day at midnight UTC' },
          { step: '2', title: 'You call it', desc: 'Bull or Bear — submit before 8pm UTC (4pm EST)' },
          { step: '3', title: 'Score & rank', desc: 'Scored at 8pm UTC · beat the AI to win' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="rounded-xl border border-border bg-card px-4 py-3.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold font-mono mb-2">
              {step}
            </span>
            <p className="font-semibold text-xs">{title}</p>
            <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* No challenge state */}
      {!challenge && (
        <div className="rounded-xl border border-border bg-card p-14 text-center space-y-1">
          <p className="font-semibold">Today's challenge is being prepared</p>
          <p className="text-sm text-muted-foreground">Check back soon — a new challenge drops at midnight UTC.</p>
        </div>
      )}

      {challenge && (
        <>
          {/* Key levels */}
          <PriceLevels levels={challenge.key_levels as any[]} currentPrice={challenge.current_price} />

          {/* Scenarios */}
          <div className="grid md:grid-cols-2 gap-4">
            <ScenarioCard type="bull" scenario={challenge.bull_scenario as any} currentPrice={challenge.current_price} />
            <ScenarioCard type="bear" scenario={challenge.bear_scenario as any} currentPrice={challenge.current_price} />
          </div>

          {/* Results chart — only when scored */}
          {isScored && userPrediction && userGame && (
            <ResultsChart
              gameId={userGame.id}
              userCall={(userPrediction.direction ?? null) as 'bull' | 'bear' | null}
              isCorrect={userPrediction.is_correct ?? null}
              pointsEarned={userPrediction.points_earned ?? null}
              hitTarget={userPrediction.hit_target ?? null}
            />
          )}

          {/* Prediction / AI vs You */}
          {!userGame && !isResolved ? (
            <div className="rounded-xl border border-gold/25 bg-gold/5 p-6 text-center space-y-3">
              <p className="font-semibold">Ready to play today's challenge?</p>
              <p className="text-sm text-muted-foreground">
                Bull or Bear on {challenge.ticker}? Outscore the AI and climb the daily board.
              </p>
              <JoinDailyButton />
            </div>
          ) : userGame ? (
            <div className="space-y-3">
              {isScored && (
                <div className="flex justify-end">
                  <ShareButton gameId={userGame.id} />
                </div>
              )}
              <AIvsYou
                aiCall={challenge.ai_call as 'bull' | 'bear'}
                aiTarget={challenge.ai_target}
                aiReasoning={challenge.ai_reasoning}
                confidence={challenge.confidence}
                userCall={(userPrediction?.direction ?? null) as 'bull' | 'bear' | null}
                userTarget={userPrediction?.target_price ?? null}
                isCorrect={userPrediction?.is_correct ?? null}
                aiIsCorrect={aiIsCorrect}
                pointsEarned={userPrediction?.points_earned ?? null}
                resolvedPrice={userGame.resolved_price ?? null}
                scored={isScored}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-muted-foreground text-sm">Today's challenge has closed. Come back tomorrow!</p>
              <Link href="/play" className="text-primary text-sm mt-2 inline-block hover:underline">
                Play a regular game →
              </Link>
            </div>
          )}

          {/* Daily Leaderboard */}
          <DailyLeaderboard challengeId={challenge.id} />

          {/* Today's Players */}
          <TodayPlayers />
        </>
      )}
    </div>
  )
}
