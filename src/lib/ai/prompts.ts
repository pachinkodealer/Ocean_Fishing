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
