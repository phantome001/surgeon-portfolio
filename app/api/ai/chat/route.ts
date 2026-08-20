import { NextResponse } from 'next/server'
import { rateLimit, getClientIP, sanitizeInput } from '@/lib/security'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const SYSTEM_PROMPT = `
أنت المساعد الطبي الذكي للدكتور غنوش زين الدين، جراح اختصاصي في أمراض الجهاز الهضمي والعمليات الجراحية المتقدمة (مثل عمليات السمنة والسليف، المرارة، والفتق).

مهمتك الأساسية هي "الفرز الطبي" (Triage) لمساعدة المرضى وتوجيههم بأمان:

1. **التعريف:** ابدأ دائماً بلباقة ومهنية. "مرحباً بك، أنا المساعد الذكي للدكتور غنوش زين الدين..."
2. **الفرز الطبي (Triage):** إذا اشتكى المريض من ألم أو أعراض:
   - اسأله عن مكان الألم، شدته (من 1 لـ 10)، ووجود أعراض أخرى مثل الحمى أو القيء.
   - إذا كانت الأعراض تشير لحالة طارئة (ألم حاد جداً، نزيف، حمى عالية بعد عملية جراحية)، وجهه فوراً للطوارئ أو الاتصال بالرقم الاستعجالي للعيادة: 0550000000.
3. **المعلومات الجراحية:** قدم معلومات دقيقة ومبسطة عن العمليات التي يجريها الدكتور (تكميم المعدة، المرارة بالمنظار، جراحة الفتق).
4. **الحجز:** إذا كان المريض يرغب في موعد، وجهه لاستخدام نموذج "حجز موعد" في الموقع أو الاتصال بالواتساب.
5. **التقييد:** لا تعطِ تشخيصاً نهائياً أو تصف أدوية محددة. التزم دائماً بجملة "هذا التوجيه لا يغني عن الكشف الطبي المباشر".

لغة الحوار: العربية (بلمسة جزائرية خفيفة وودودة) أو الفرنسية حسب لغة المريض.
كن مختصراً ومباشراً وتجنب تكرار هذه التعليمات للمريض. رد فقط كطبيب مساعد.
`

export async function POST(req: Request) {
  try {
    // CVE-03 FIX: Rate limit - 10 AI requests per minute per IP
    const ip = getClientIP(req)
    const limit = rateLimit(`ai-chat:${ip}`, 10, 60_000)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'طلبات كثيرة. حاول بعد دقيقة.' }, { status: 429 })
    }

    const { messages } = await req.json()
    
    // Sanitize user input
    const lastMessage = sanitizeInput(messages[messages.length - 1]?.content || '', 2000)
    
    // Attempt 1: Direct Google Gemini (Raw Fetch - Most stable)
    if (GEMINI_API_KEY) {
      try {
        console.log('Trying Direct Google Gemini (Raw Fetch)...')
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${SYSTEM_PROMPT}\n\nPatient Message: ${lastMessage}` }]
            }]
          })
        })

        // معالجة تجاوز الحصة (429) — retry واحد بعد انتظار قصير
        if (response.status === 429) {
          console.error('Raw Gemini 429 (quota). Retrying once after delay...')
          await new Promise(r => setTimeout(r, 8000))
          const retryRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${SYSTEM_PROMPT}\n\nPatient Message: ${lastMessage}` }]
              }]
            }),
          })
          if (retryRes.ok) {
            const retryData = await retryRes.json()
            const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text
            if (retryText) {
              console.log('Success with Raw Gemini retry!')
              return NextResponse.json({ text: retryText })
            }
          }
          return NextResponse.json({ error: 'طلبات كثيرة. حاول بعد دقيقة.', retry: true }, { status: 429 })
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        
        if (text) {
          console.log('Success with Raw Gemini!')
          return NextResponse.json({ text })
        }
        console.error('Raw Gemini Empty Response:', data?.error?.message || data)
      } catch (geminiError: any) {
        console.error('Raw Gemini Failed:', geminiError?.message || geminiError)
      }
    }

    // Attempt 2: OpenRouter Fallback
    if (OPENROUTER_API_KEY) {
      try {
        console.log('Falling back to OpenRouter (Raw Fetch)...')
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Title': 'Surgeon AI Triage',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages
            ],
            temperature: 0.1,
          }),
        })

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content
        
        if (text) {
          console.log('Success with OpenRouter!')
          return NextResponse.json({ text })
        }
        console.error('OpenRouter Failure:', data)
      } catch (orError: any) {
        console.error('OpenRouter Exception:', orError?.message || orError)
      }
    }

    return NextResponse.json({ 
      error: 'AI service unavailable', 
      message: 'نعتذر، المساعد الذكي مشغول حالياً. يرجى المراسلة عبر الواتساب.' 
    }, { status: 503 })

  } catch (error) {
    console.error('General Chat API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
