export interface TimeframeConfig {
  display: string        // stored on games.timeframe, e.g. '15M'
  interval: string       // Binance kline interval, e.g. '15m'
  candleMs: number       // duration of one candle = game resolve window
  resultInterval: string // sub-interval for the results chart
  resultLimit: number    // number of result candles covering the window
}

export const TIMEFRAMES: Record<string, TimeframeConfig> = {
  '15M': { display: '15M', interval: '15m', candleMs: 15 * 60 * 1000, resultInterval: '1m', resultLimit: 15 },
  '30M': { display: '30M', interval: '30m', candleMs: 30 * 60 * 1000, resultInterval: '1m', resultLimit: 30 },
  '1H':  { display: '1H',  interval: '1h',  candleMs: 60 * 60 * 1000, resultInterval: '5m', resultLimit: 12 },
  '4H':  { display: '4H',  interval: '4h',  candleMs: 4 * 60 * 60 * 1000, resultInterval: '15m', resultLimit: 16 },
  '1D':  { display: '1D',  interval: '1d',  candleMs: 24 * 60 * 60 * 1000, resultInterval: '1h', resultLimit: 24 },
  '1W':  { display: '1W',  interval: '1w',  candleMs: 7 * 24 * 60 * 60 * 1000, resultInterval: '4h', resultLimit: 42 },
}

export const DEFAULT_TIMEFRAME = TIMEFRAMES['4H']

export function byDisplay(timeframe: string | null | undefined): TimeframeConfig {
  return TIMEFRAMES[(timeframe ?? '').toUpperCase()] ?? DEFAULT_TIMEFRAME
}

export function byInterval(interval: string | null | undefined): TimeframeConfig | undefined {
  return Object.values(TIMEFRAMES).find(t => t.interval === interval)
}
