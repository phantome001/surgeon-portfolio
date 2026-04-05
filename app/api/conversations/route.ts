import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/encryption'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.warn('[CONVERSATIONS_GET] Unauthorized or missing user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch Conversations
    const { data: convs, error: convErr } = await (supabase
      .from('conversations')
      .select('id, patient_id, ai_enabled, created_at')
      .order('created_at', { ascending: false }) as any)

    if (convErr) {
      console.error('[CONVERSATIONS_GET] Supabase convErr:', convErr)
      return NextResponse.json({ error: 'Database error', details: convErr }, { status: 500 })
    }

    if (!convs || convs.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    // 2. Fetch Profiles
    const patientIds = Array.from(new Set((convs as any[]).map(c => c.patient_id))).filter(Boolean)
    const { data: profiles, error: profErr } = await (supabase
      .from('profiles')
      .select('id, name, phone_encrypted')
      .in('id', patientIds) as any)

    if (profErr) {
      console.warn('[CONVERSATIONS_GET] Supabase profErr (non-fatal):', profErr)
    }

    const profileMap = new Map((profiles as any[] || []).map(p => [p.id, p]))

    // 3. Fetch Last Message snippets with individual catch
    const conversationsWithLastMessage = await Promise.all((convs as any[]).map(async (conv) => {
      try {
        const { data: lastMsg } = await (supabase
          .from('messages')
          .select('content_encrypted, sent_at')
          .eq('conversation_id', conv.id)
          .order('sent_at', { ascending: false })
          .limit(1)
          .maybeSingle() as any)

        let lastContent = ''
        if (lastMsg) {
          try {
            lastContent = decrypt((lastMsg as any).content_encrypted)
          } catch (e) {
            console.warn(`[CONVERSATIONS_GET] Decrypt fail for conv ${conv.id}:`, e)
            lastContent = '[رسالة مشفرة]'
          }
        }

        const prof = profileMap.get(conv.patient_id)

        return {
          ...conv,
          patient_name: (prof as any)?.name || 'مريض غير معروف',
          phone: (prof as any)?.phone_encrypted,
          last_message: lastContent,
          last_time: (lastMsg as any)?.sent_at || conv.created_at
        }
      } catch (err) {
        console.error(`[CONVERSATIONS_GET] Error processing conv ${conv?.id}:`, err)
        return {
          ...conv,
          patient_name: 'خطأ في التحميل',
          last_message: '',
          last_time: conv?.created_at
        }
      }
    }))

    return NextResponse.json({ conversations: conversationsWithLastMessage })
  } catch (error: any) {
    console.error('[CONVERSATIONS_GET] Critical Error:', error.message || error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
