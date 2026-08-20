import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { messageSchema } from '@/lib/validations/chat'
import { encrypt } from '@/lib/encryption'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const AI_MODEL = 'gemini-2.5-flash'
const GEMINI_SYSTEM_PROMPT =
  'أنت مساعد جراح محترف وخبير. وظيفتك هي الرد على تساؤلات المرضى وتوجيههم بلطف ومهنية باللغة العربية. ' +
  'إذا سأل المريض عن أعراض مقلقة، وجهه فوراً لحجز موعد في العيادة للفحص البدني. ' +
  'لا تصف أدوية قوية، بل قدم نصائح رعاية أولية فقط. أنت تمثل الدكتور وتنسق مع المرضى.'

async function generateAiReply(content: string): Promise<string> {
  if (!GEMINI_API_KEY) return ''
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: content }] }],
        generationConfig: { temperature: 0.7 },
      }),
    })
    const aiData = await response.json()
    if (aiData?.error?.message) console.error('[GEMINI]', aiData.error.code, aiData.error.message)
    return aiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (e) {
    console.error('[GEMINI_EXCEPTION]', e)
    return ''
  }
}

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

    // توليد رد الذكاء الاصطناعي التلقائي
    const { data: conv } = await supabase
      .from('conversations')
      .select('ai_enabled')
      .eq('id', conversationId)
      .single()

    const aiEnabled = (conv as any)?.ai_enabled !== false
    if (aiEnabled) {
      const aiText = await generateAiReply(content)
      if (aiText) {
        const admin = createAdminClient()
        await admin
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: null,
            content_encrypted: encrypt(aiText),
          } as any)
      }
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('[CHAT_SEND]', error)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}
