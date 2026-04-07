import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ai_enabled } = await request.json()

    const { data, error } = await ((supabase.from('conversations') as any)
      .update({ ai_enabled })
      .eq('id', params.id)
      .select()
      .single())

    if (error) throw error

    return NextResponse.json({ success: true, conversation: data })
  } catch (error) {
    console.error('[CONVERSATION_PATCH]', error)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}
