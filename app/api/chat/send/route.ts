import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { messageSchema } from '@/lib/validations/chat'
import { encrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }

    const parsed = messageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 422 })
    }

    const { content, conversationId } = parsed.data

    const { data: message, error } = await (supabase
      .from('messages') as any)
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content_encrypted: encrypt(content),
      })
      .select('id, sender_id, sent_at')
      .single()

    if (error) throw error

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('[CHAT_SEND]', error)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}
