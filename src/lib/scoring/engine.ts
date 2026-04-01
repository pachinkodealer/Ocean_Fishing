export interface ScoringParams {
  entryPrice: number
  resolvedClose: number
  resolvedHigh: number
  resolvedLow: number
  direction: 'bull' | 'bear'
  targetPrice?: number | null
  currentStreak: number
}

export interface ScoringResult {
  pointsEarned: number
  isCorrect: boolean
  hitTarget: boolean
  newStreak: number
  streakBonus: number
  breakdown: { direction: number; target: number; streak: number }
}

export function scoreDirection(
  entryPrice: number,
  resolvedClose: number,
  direction: 'bull' | 'bear'
): { isCorrect: boolean; points: number } {
  const isCorrect =
    direction === 'bull' ? resolvedClose > entryPrice : resolvedClose < entryPrice
  return { isCorrect, points: isCorrect ? 10 : 0 }
}

export function scoreTarget(
  resolvedHigh: number,
  resolvedLow: number,
  targetPrice: number,
  direction: 'bull' | 'bear'
): { hitTarget: boolean; points: number } {
  const hitTarget =
    direction === 'bull' ? resolvedHigh >= targetPrice : resolvedLow <= targetPrice
  return { hitTarget, points: hitTarget ? 25 : 0 }
}

export function calculateStreakBonus(streak: number): number {
  if (streak >= 10) return 20
  if (streak >= 5) return 10
  if (streak >= 3) return 5
  return 0
}

export function updateStreak(currentStreak: number, isCorrect: boolean): number {
  return isCorrect ? currentStreak + 1 : 0
}

export function scoreGame(params: ScoringParams): ScoringResult {
  const { isCorrect, points: dirPoints } = scoreDirection(
    params.entryPrice,
    params.resolvedClose,
    params.direction
  )

  let targetPoints = 0
  let hitTarget = false
  if (params.targetPrice != null) {
    const result = scoreTarget(
      params.resolvedHigh,
      params.resolvedLow,
      params.targetPrice,
      params.direction
    )
    targetPoints = result.points
    hitTarget = result.hitTarget
  }

  const newStreak = updateStreak(params.currentStreak, isCorrect)
  const streakBonus = isCorrect ? calculateStreakBonus(newStreak) : 0
  const total = dirPoints + targetPoints + streakBonus

  return {
    pointsEarned: total,
    isCorrect,
    hitTarget,
    newStreak,
    streakBonus,
    breakdown: { direction: dirPoints, target: targetPoints, streak: streakBonus },
  }
}

export function recalculateAccuracy(correctCalls: number, totalCalls: number): number {
  if (totalCalls === 0) return 0
  return Math.round((correctCalls / totalCalls) * 100 * 100) / 100
}
