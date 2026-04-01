const BINANCE_BASE = 'https://api.binance.com/api/v3'
const BINANCE_US_BASE = 'https://api.binance.us/api/v3'

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

  // Try Binance.com then Binance.US
  for (const base of [BINANCE_BASE, BINANCE_US_BASE]) {
    try {
      const url = `${base}/klines?symbol=${sym}&interval=${interval}&startTime=${startTimeMs}&limit=1`
      const res = await fetchWithTimeout(url)
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
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
