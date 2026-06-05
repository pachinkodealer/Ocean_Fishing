import type { KlinePoint } from '@/lib/binance/price'

export type SetupType =
  | 'resistance_retest'
  | 'support_retest'
  | 'range_compression'
  | 'momentum_setup'
  | 'general_analysis'

export interface SetupResult {
  type: SetupType
  label: string
  description: string
  quality: number
}

export function detectSetup(candles: KlinePoint[]): SetupResult {
  if (candles.length < 10) {
    return { type: 'general_analysis', label: 'Live Analysis', description: 'ETH Perps — live 4H analysis', quality: 50 }
  }

  const last = candles[candles.length - 1]
  const lookback = candles.slice(-20)
  const currentPrice = last.close

  const swingHigh = Math.max(...lookback.map(c => c.high))
  const swingLow = Math.min(...lookback.map(c => c.low))

  // Resistance retest: price within 0.8% below swing high
  const distToHighPct = (swingHigh - currentPrice) / currentPrice
  if (distToHighPct >= 0 && distToHighPct < 0.008) {
    return {
      type: 'resistance_retest',
      label: 'Resistance Retest',
      description: `ETH approaching key resistance at $${swingHigh.toFixed(0)}`,
      quality: Math.round(100 - (distToHighPct / 0.008) * 40),
    }
  }

  // Support retest: price within 0.8% above swing low
  const distToLowPct = (currentPrice - swingLow) / currentPrice
  if (distToLowPct >= 0 && distToLowPct < 0.008) {
    return {
      type: 'support_retest',
      label: 'Support Retest',
      description: `ETH testing key support at $${swingLow.toFixed(0)}`,
      quality: Math.round(100 - (distToLowPct / 0.008) * 40),
    }
  }

  // Range compression: avg range of last 5 candles < 12% of 20-candle range
  const last5 = candles.slice(-5)
  const avgRange5 = last5.reduce((sum, c) => sum + (c.high - c.low), 0) / 5
  const totalRange = swingHigh - swingLow
  if (totalRange > 0 && avgRange5 / totalRange < 0.12) {
    return {
      type: 'range_compression',
      label: 'Coiling Setup',
      description: 'ETH range-compressing — volatility expansion expected',
      quality: Math.round((1 - (avgRange5 / totalRange) / 0.12) * 60 + 40),
    }
  }

  // Momentum: last 3 candles same direction
  const last3 = candles.slice(-3)
  const allGreen = last3.every(c => c.close > c.open)
  const allRed = last3.every(c => c.close < c.open)
  if (allGreen || allRed) {
    return {
      type: 'momentum_setup',
      label: 'Momentum Setup',
      description: allGreen
        ? 'ETH: 3 consecutive bullish candles — continuation or reversal?'
        : 'ETH: 3 consecutive bearish candles — continuation or reversal?',
      quality: 70,
    }
  }

  return {
    type: 'general_analysis',
    label: 'Live Setup',
    description: 'ETH Perps 4H — fresh setup detected',
    quality: 55,
  }
}
