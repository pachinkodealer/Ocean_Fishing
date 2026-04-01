export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          plan: string
          points: number
          accuracy_pct: number
          streak: number
          best_streak: number
          total_calls: number
          correct_calls: number
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          plan?: string
          points?: number
          accuracy_pct?: number
          streak?: number
          best_streak?: number
          total_calls?: number
          correct_calls?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      games: {
        Row: {
          id: string
          user_id: string
          ticker: string
          timeframe: string
          screenshot_url: string
          current_price: number
          key_levels: Json
          bull_scenario: Json
          bear_scenario: Json
          ai_call: string
          ai_target: number
          ai_reasoning: string
          confidence: number
          status: string
          resolve_at: string
          resolved_price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ticker: string
          timeframe: string
          screenshot_url: string
          current_price: number
          key_levels: Json
          bull_scenario: Json
          bear_scenario: Json
          ai_call: string
          ai_target: number
          ai_reasoning: string
          confidence: number
          status?: string
          resolve_at: string
          resolved_price?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['games']['Insert']>
      }
      predictions: {
        Row: {
          id: string
          game_id: string
          user_id: string
          direction: string
          target_price: number | null
          points_earned: number
          is_correct: boolean | null
          hit_target: boolean | null
          scored_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          direction: string
          target_price?: number | null
          points_earned?: number
          is_correct?: boolean | null
          hit_target?: boolean | null
          scored_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['predictions']['Insert']>
      }
      leaderboard_snapshots: {
        Row: {
          id: string
          period: string
          week_start: string | null
          month_start: string | null
          user_id: string
          rank: number
          points: number
          accuracy: number
          correct: number
          total: number
          refreshed_at: string
        }
        Insert: {
          id?: string
          period: string
          week_start?: string | null
          month_start?: string | null
          user_id: string
          rank: number
          points: number
          accuracy: number
          correct: number
          total: number
          refreshed_at?: string
        }
        Update: Partial<Database['public']['Tables']['leaderboard_snapshots']['Insert']>
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          awarded_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          awarded_at?: string
          metadata?: Json | null
        }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface KeyLevel {
  label: string
  price: number
  type: 'resistance' | 'support' | 'fib' | 'pivot'
}

export interface Scenario {
  target: number
  invalidation: number
  reasoning: string
}
