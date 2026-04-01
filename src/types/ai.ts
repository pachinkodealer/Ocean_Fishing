import type { KeyLevel, Scenario } from './database'

export interface AIAnalysis {
  current_price: number
  key_levels: KeyLevel[]
  bull_scenario: Scenario
  bear_scenario: Scenario
  ai_call: 'bull' | 'bear'
  ai_target: number
  ai_reasoning: string
  confidence: number
}
