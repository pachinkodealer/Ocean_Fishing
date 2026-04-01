import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'alltime'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const offset = (page - 1) * limit

  if (!['weekly', 'monthly', 'alltime'].includes(period)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error, count } = await supabase
    .from('leaderboard_snapshots')
    .select('*, profiles(username, avatar_url, plan)', { count: 'exact' })
    .eq('period', period)
    .order('rank', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit })
}
