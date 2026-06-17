import { SYSTEM_PROMPT, buildUserPrompt } from './prompts'
import { runAnalysis } from './claudeAnalysis'
import type { AIAnalysis } from '@/types/ai'

export async function analyzeChart(
  imageBuffer: Buffer,
  mediaType: string,
  ticker: string,
  timeframe: string,
  currentPrice: number
): Promise<AIAnalysis> {
  return runAnalysis(SYSTEM_PROMPT, [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: imageBuffer.toString('base64'),
      },
    },
    { type: 'text', text: buildUserPrompt(ticker, timeframe, currentPrice) },
  ])
}
