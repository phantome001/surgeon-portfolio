import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getClientIP, sanitizeInput } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // CVE-02 FIX: Rate limit - 3 messages per minute per IP
    const ip = getClientIP(request)
    const limit = rateLimit(`contact:${ip}`, 3, 60_000)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'طلبات كثيرة جداً. حاول بعد دقيقة.' }, { status: 429 })
    }

    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // CVE-06 FIX: Sanitize all inputs
    const cleanName = sanitizeInput(name, 100)
    const cleanEmail = sanitizeInput(email, 200)
    const cleanSubject = sanitizeInput(subject, 200)
    const cleanMessage = sanitizeInput(message, 5000)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'بريد إلكتروني غير صالح' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error: insertErr } = await supabase
      .from('contact_requests')
      .insert({ name: cleanName, email: cleanEmail, subject: cleanSubject, message: cleanMessage, status: 'pending' } as any)

    if (insertErr) throw insertErr

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // CVE-04 FIX: Never expose internal error details
    console.error('[CONTACT_API_ERROR]', error)
    return NextResponse.json({ error: 'خطأ في معالجة الرسالة' }, { status: 500 })
  }
}
