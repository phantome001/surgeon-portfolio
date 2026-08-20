import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/encryption'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const AI_MODEL = 'gemini-2.5-flash'

// route تشخيص مؤقت — يكشف حالة flow الرد الآلي خطوة بخطوة
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('k')
  if (key !== 'debug-ganoush-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const conversationId = request.nextUrl.searchParams.get('c')
  const content = request.nextUrl.searchParams.get('q') || 'اختبار تشخيص'
  const steps: Record<string, unknown> = {}

  // 1) المصادقة
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  steps.auth = user ? { ok: true, id: user.id } : { ok: false }

  // 2) المحادثة
  steps.conversation = conversationId ? { id: conversationId } : null

  // 3) Gemini
  steps.geminiKey = GEMINI_API_KEY ? { len: GEMINI_API_KEY.length, prefix: GEMINI_API_KEY.slice(0, 8) } : null
  let aiText = ''
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: 'مساعد جراح. رد باختصار.' }] },
        contents: [{ role: 'user', parts: [{ text: content }] }],
      }),
    })
    steps.geminiHttp = { status: res.status }
    const data = await res.json()
    steps.geminiError = data?.error || null
    aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    steps.aiTextLen = aiText.length
  } catch (e: any) {
    steps.geminiException = String(e)
  }

  // 4) إدراج رسالة المستخدم
  if (user && conversationId) {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?select=id`
    const resUser = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: user.id,
        content: encrypt ? encrypt(content) : content,
      }),
    })
    steps.userInsert = { status: resUser.status, ok: resUser.ok }
  }

  // 5) إدراج رد AI
  if (user && conversationId && aiText) {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?select=id`
    const resAi = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: null,
        content: encrypt ? encrypt(aiText) : aiText,
      }),
    })
    steps.aiInsert = { status: resAi.status, ok: resAi.ok }
  } else {
    steps.aiInsert = { skipped: !aiText ? 'empty aiText' : 'no conv/user' }
  }

  return NextResponse.json(steps)
}

