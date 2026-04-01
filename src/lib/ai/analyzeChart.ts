import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { SYSTEM_PROMPT, buildUserPrompt, RETRY_PROMPT } from './prompts'
import type { AIAnalysis } from '@/types/ai'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const AIAnalysisSchema = z.object({
  current_price: z.number().positive(),
  key_levels: z.array(z.object({
    label: z.string(),
    price: z.number().positive(),
    type: z.enum(['resistance', 'support', 'fib', 'pivot']),
  })).min(1).max(7),
  bull_scenario: z.object({
    target: z.number().positive(),
    invalidation: z.number().positive(),
    reasoning: z.string().max(500),
  }),
  bear_scenario: z.object({
    target: z.number().positive(),
    invalidation: z.number().positive(),
    reasoning: z.string().max(500),
  }),
  ai_call: z.enum(['bull', 'bear']),
  ai_target: z.number().positive(),
  ai_reasoning: z.string().max(700),
  confidence: z.number().min(0).max(100),
})

async function callClaude(
  imageBase64: string,
  mediaType: string,
  userPrompt: string
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          { type: 'text', text: userPrompt },
        ],
      },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

export async function analyzeChart(
  imageBuffer: Buffer,
  mediaType: string,
  ticker: string,
  timeframe: string,
  currentPrice: number
): Promise<AIAnalysis> {
  const imageBase64 = imageBuffer.toString('base64')
  const userPrompt = buildUserPrompt(ticker, timeframe, currentPrice)

  let rawText = await callClaude(imageBase64, mediaType, userPrompt)

  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    // Retry once with stricter prompt
    rawText = await callClaude(imageBase64, mediaType, RETRY_PROMPT)
    try {
      parsed = JSON.parse(rawText)
    } catch {
      throw new Error('Claude returned invalid JSON after retry')
    }
  }

  const result = AIAnalysisSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`AI response validation failed: ${result.error.message}`)
  }

  return result.data
}
