import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/encryption'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
// يمكنك اختيار الموديل الذي تريده هنا، مثلاً: google/gemini-flash-1.5-exp:free أو claude-3-haiku-20240307
const AI_MODEL = "google/gemini-flash-1.5-exp:free" 

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, sender_id, content_encrypted, sent_at, read_at')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true })

    if (error) throw error

    const decrypted = (messages as any[] || []).map((msg) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      content: safeDecrypt(msg.content_encrypted),
      sent_at: msg.sent_at,
      read_at: msg.read_at,
    }))

    return NextResponse.json({ messages: decrypted })
  } catch (error) {
    console.error('[CHAT_GET]', error)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { conversationId, content } = await request.json()
    if (!conversationId || !content) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    const encryptedContent = encrypt(content)

    const { data: msg, error: msgErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content_encrypted: encryptedContent
      } as any)
      .select()
      .single()

    if (msgErr) throw msgErr

    // Logic for AI Response if enabled in conversation
    const { data: conv } = await supabase
      .from('conversations')
      .select('ai_enabled, patient_id')
      .eq('id', conversationId)
      .single()

    // --- AI RESPONSE VIA OPENROUTER ---
    if ((conv as any)?.ai_enabled && OPENROUTER_API_KEY) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://surgeon-portfolio.vercel.app", // اختياري لترتيبك في OpenRouter
            "X-Title": "Surgeon Portfolio AI",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": AI_MODEL,
            "messages": [
              {
                "role": "system",
                "content": "أنت مساعد جراح محترف وخبير. وظيفتك هي الرد على تساؤلات المرضى وتوجيههم بلطف ومهنية باللغة العربية. إذا سأل المريض عن أعراض مقلقة، وجهه فوراً لحجز موعد في العيادة للفحص البدني. لا تصف أدوية قوية، بل قدم نصائح رعاية أولية فقط. أنت تمثل الدكتور وتنسق مع المرضى."
              },
              { "role": "user", "content": content }
            ],
            "temperature": 0.7
          })
        });

        const aiData = await response.json();
        const aiText = aiData.choices?.[0]?.message?.content || "عذراً، هناك مشكلة في معالجة طلبك حالياً.";
        const encryptedAiText = encrypt(aiText)

        const admin = createAdminClient()
        await admin.from('messages').insert({
          conversation_id: conversationId,
          sender_id: null, 
          content_encrypted: encryptedAiText
        } as any)
      } catch (aiErr) {
        console.error('OpenRouter AI Error:', aiErr)
      }
    }

    return NextResponse.json({ success: true, messageId: (msg as any).id })
  } catch (error) {
    console.error('[CHAT_POST]', error)
    return NextResponse.json({ error: 'خطأ في الإرسال' }, { status: 500 })
  }
}

function safeDecrypt(value: string): string {
  try {
    return decrypt(value)
  } catch {
    return '[غير متاح]'
  }
}
