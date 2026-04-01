const BINANCE_BASE = 'https://api.binance.com/api/v3'

export async function getCurrentPrice(ticker: string): Promise<number> {
  const res = await fetch(`${BINANCE_BASE}/ticker/price?symbol=${ticker.toUpperCase()}`)
  if (!res.ok) {
    throw new Error(`Binance price fetch failed for ${ticker}: ${res.status}`)
  }
  const data = await res.json()
  return parseFloat(data.price)
}

export interface KlineData {
  open: number
  high: number
  low: number
  close: number
  openTime: number
  closeTime: number
}

export async function getKlineAtTime(
  ticker: string,
  interval: string,
  startTimeMs: number
): Promise<KlineData> {
  const url = `${BINANCE_BASE}/klines?symbol=${ticker.toUpperCase()}&interval=${interval}&startTime=${startTimeMs}&limit=1`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Binance klines fetch failed: ${res.status}`)
  }
  const data = await res.json()
  if (!data || data.length === 0) {
    throw new Error(`No kline data found for ${ticker} at ${startTimeMs}`)
  }
  const [openTime, open, high, low, close, , closeTime] = data[0]
  return {
    openTime: Number(openTime),
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    closeTime: Number(closeTime),
  }
}

export async function validateTicker(ticker: string): Promise<boolean> {
  try {
    await getCurrentPrice(ticker)
    return true
  } catch {
    return false
  }
}
