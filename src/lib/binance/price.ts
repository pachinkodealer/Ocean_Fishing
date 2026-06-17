const BINANCE_BASE = 'https://api.binance.com/api/v3'
const BINANCE_US_BASE = 'https://api.binance.us/api/v3'
const BINANCE_FUTURES_BASE = 'https://fapi.binance.com/fapi/v1'

// Map common USDT pairs to CoinGecko IDs
const COINGECKO_MAP: Record<string, string> = {
  BTCUSDT: 'bitcoin',
  ETHUSDT: 'ethereum',
  SOLUSDT: 'solana',
  BNBUSDT: 'binancecoin',
  XRPUSDT: 'ripple',
  ADAUSDT: 'cardano',
  DOGEUSDT: 'dogecoin',
  AVAXUSDT: 'avalanche-2',
  DOTUSDT: 'polkadot',
  LINKUSDT: 'chainlink',
  MATICUSDT: 'matic-network',
  LTCUSDT: 'litecoin',
  UNIUSDT: 'uniswap',
  ATOMUSDT: 'cosmos',
  NEARUSDT: 'near',
}

// Parse a Binance interval string ("15m", "1h", "4h", "1d", "1w") to milliseconds.
// Used to compute correct start times when falling back from the futures API.
function intervalToMs(interval: string): number {
  const m = interval.match(/^(\d+)([mhdw])$/)
  if (!m) return 60 * 60 * 1000 // default 1h
  const n = Number(m[1])
  const unit = m[2]
  const mult =
    unit === 'm' ? 60_000 :
    unit === 'h' ? 3_600_000 :
    unit === 'd' ? 86_400_000 :
    604_800_000 // w
  return n * mult
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    return res
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

export async function getCurrentPrice(ticker: string): Promise<number> {
  const sym = ticker.toUpperCase()

  // Try Binance.com first
  try {
    const res = await fetchWithTimeout(`${BINANCE_BASE}/ticker/price?symbol=${sym}`)
    if (res.ok) {
      const data = await res.json()
      return parseFloat(data.price)
    }
  } catch { /* fall through */ }

  // Try Binance.US (for US users)
  try {
    const res = await fetchWithTimeout(`${BINANCE_US_BASE}/ticker/price?symbol=${sym}`)
    if (res.ok) {
      const data = await res.json()
      return parseFloat(data.price)
    }
  } catch { /* fall through */ }

  // Fall back to CoinGecko
  const geckoId = COINGECKO_MAP[sym]
  if (geckoId) {
    try {
      const res = await fetchWithTimeout(
        `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`
      )
      if (res.ok) {
        const data = await res.json()
        return data[geckoId]?.usd ?? 0
      }
    } catch { /* fall through */ }
  }

  // Final fallback: return 0 and let AI read the price from the chart image
  return 0
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
  const sym = ticker.toUpperCase()

  // Try futures first (not geo-blocked), then spot, then Binance.US
  const endpoints = [
    `${BINANCE_FUTURES_BASE}/klines?symbol=${sym}&interval=${interval}&startTime=${startTimeMs}&limit=1`,
    `${BINANCE_BASE}/klines?symbol=${sym}&interval=${interval}&startTime=${startTimeMs}&limit=1`,
    `${BINANCE_US_BASE}/klines?symbol=${sym}&interval=${interval}&startTime=${startTimeMs}&limit=1`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetchWithTimeout(url)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
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
      }
    } catch { /* try next */ }
  }

  throw new Error(`Could not fetch kline data for ${sym} from any source`)
}

export interface KlinePoint {
  time: number   // unix ms
  open: number
  high: number
  low: number
  close: number
}

export async function getKlines(
  ticker: string,
  interval: string,
  startTimeMs: number,
  limit: number = 16
): Promise<KlinePoint[]> {
  const sym = ticker.toUpperCase()

  for (const base of [BINANCE_BASE, BINANCE_US_BASE]) {
    try {
      const url = `${base}/klines?symbol=${sym}&interval=${interval}&startTime=${startTimeMs}&limit=${limit}`
      const res = await fetchWithTimeout(url, 10000)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          return data.map((k: unknown[]) => ({
            time: Number(k[0]),
            open: parseFloat(k[1] as string),
            high: parseFloat(k[2] as string),
            low: parseFloat(k[3] as string),
            close: parseFloat(k[4] as string),
          }))
        }
      }
    } catch { /* try next */ }
  }

  return []
}

export async function getRecentFuturesKlines(
  ticker: string,
  interval: string,
  limit: number = 30
): Promise<KlinePoint[]> {
  const sym = ticker.toUpperCase()
  try {
    const url = `${BINANCE_FUTURES_BASE}/klines?symbol=${sym}&interval=${interval}&limit=${limit}`
    const res = await fetchWithTimeout(url, 10000)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.map((k: unknown[]) => ({
          time: Number(k[0]),
          open: parseFloat(k[1] as string),
          high: parseFloat(k[2] as string),
          low: parseFloat(k[3] as string),
          close: parseFloat(k[4] as string),
        }))
      }
    }
  } catch { /* fall through to spot */ }
  // Reach back limit candles of the ACTUAL interval — not a hardcoded 4h —
  // so fallback data is the most recent candles, not stale ones from days ago.
  return getKlines(ticker, interval, Date.now() - limit * intervalToMs(interval), limit)
}

export async function getFuturesKlines(
  ticker: string,
  interval: string,
  startTimeMs: number,
  limit: number = 30
): Promise<KlinePoint[]> {
  const sym = ticker.toUpperCase()
  try {
    const url = `${BINANCE_FUTURES_BASE}/klines?symbol=${sym}&interval=${interval}&startTime=${startTimeMs}&limit=${limit}`
    const res = await fetchWithTimeout(url, 10000)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.map((k: unknown[]) => ({
          time: Number(k[0]),
          open: parseFloat(k[1] as string),
          high: parseFloat(k[2] as string),
          low: parseFloat(k[3] as string),
          close: parseFloat(k[4] as string),
        }))
      }
    }
  } catch { /* fall through to spot */ }
  return getKlines(ticker, interval, startTimeMs, limit)
}
