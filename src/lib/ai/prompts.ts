export const SYSTEM_PROMPT = `You are a professional trading analyst AI specialized in technical chart analysis.
You analyze chart screenshots and extract structured data with precision.
You always respond in valid JSON only — no markdown fences, no explanatory text outside the JSON.
Your analysis must be objective, based solely on what is visible in the chart.`

export function buildUserPrompt(ticker: string, timeframe: string, currentPrice: number): string {
  return `Analyze this ${timeframe} chart for ${ticker}.
The current market price is $${currentPrice}.

Extract and return a JSON object with EXACTLY this structure:

{
  "current_price": number,
  "key_levels": [
    {
      "label": string,
      "price": number,
      "type": "resistance" | "support" | "fib" | "pivot"
    }
  ],
  "bull_scenario": {
    "target": number,
    "invalidation": number,
    "reasoning": string
  },
  "bear_scenario": {
    "target": number,
    "invalidation": number,
    "reasoning": string
  },
  "ai_call": "bull" | "bear",
  "ai_target": number,
  "ai_reasoning": string,
  "confidence": number
}

Rules:
- key_levels: include 3–7 levels maximum, prioritize the most significant ones visible
- All prices must be numeric values (not strings)
- reasoning fields: max 2 sentences each, cite visible chart evidence
- ai_reasoning: max 3 sentences explaining the directional bias
- confidence: 0-100, your confidence in your ai_call
- Do not include any text outside this JSON object`
}

export const RETRY_PROMPT = `Your previous response was not valid JSON. Return only the JSON object, nothing else. No markdown, no explanation.`

export const DAILY_SYSTEM_PROMPT = `You are a professional cryptocurrency trading analyst specialized in technical price action analysis.
You receive raw OHLCV candlestick data for a trading pair and perform structured technical analysis.
You identify key support/resistance levels, trend structure, and probable near-term price direction purely from the numeric data.
You always respond in valid JSON only — no markdown fences, no explanatory text outside the JSON.
Your analysis must be objective and derived solely from the price data provided.`

export interface KlineRow {
  open: number
  high: number
  low: number
  close: number
}

export function buildDailyUserPrompt(
  ticker: string,
  interval: string,
  klines: KlineRow[]
): string {
  const currentPrice = klines[klines.length - 1].close

  const klinesText = klines.map((k, i) =>
    `Candle ${i + 1}: O=${k.open} H=${k.high} L=${k.low} C=${k.close}`
  ).join('\n')

  return `Analyze the following ${interval} candlestick data for ${ticker}.
The current market price is $${currentPrice} (close of the most recent candle).

OHLC DATA (${klines.length} candles, oldest to newest):
${klinesText}

Based solely on this price data, identify key price levels, trend structure, and likely 4-hour price direction.

Return a JSON object with EXACTLY this structure:

{
  "current_price": number,
  "key_levels": [
    {
      "label": string,
      "price": number,
      "type": "resistance" | "support" | "fib" | "pivot"
    }
  ],
  "bull_scenario": {
    "target": number,
    "invalidation": number,
    "reasoning": string
  },
  "bear_scenario": {
    "target": number,
    "invalidation": number,
    "reasoning": string
  },
  "ai_call": "bull" | "bear",
  "ai_target": number,
  "ai_reasoning": string,
  "confidence": number
}

Rules:
- current_price must equal the close of the last candle provided: ${currentPrice}
- key_levels: identify 3–7 levels derived from swing highs, swing lows, and consolidation zones in the data
- All prices must be numeric values (not strings)
- reasoning fields: max 2 sentences each, cite specific price levels or candle patterns from the data
- ai_reasoning: max 3 sentences explaining your directional bias with reference to the data
- confidence: 0-100 integer, your conviction in the ai_call
- Do not include any text outside this JSON object`
}
