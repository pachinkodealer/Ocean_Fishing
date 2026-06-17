import { DAILY_SYSTEM_PROMPT, buildDailyUserPrompt, type KlineRow } from './prompts'
import { runAnalysis } from './claudeAnalysis'
import type { AIAnalysis } from '@/types/ai'

export async function analyzeDailyChallenge(
  ticker: string,
  interval: string,
  klines: KlineRow[]
): Promise<AIAnalysis> {
  return runAnalysis(DAILY_SYSTEM_PROMPT, [
    { type: 'text', text: buildDailyUserPrompt(ticker, interval, klines) },
  ])
}
