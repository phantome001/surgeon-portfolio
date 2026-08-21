'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Send, MessageCircle } from 'lucide-react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface Message {
  id: string
  sender_id: string | null
  content: string
  sent_at: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseClient()

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // مهلة آمنة: أي طلب يعلّق لأكثر من 8 ثوانٍ يُعتبر فشلاً
  const withTimeout = <T,>(promise: Promise<T>, ms = 8000): Promise<T | null> =>
    new Promise<T | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), ms)
      promise.finally(() => clearTimeout(timer)).then(resolve)
    })

  // استخراج توكن الجلسة الحالي من الكوكيز (احتياطي إذا علق supabase client)
  const getSessionToken = (): string | null => {
    const raw = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('sb-bvxqtzqkauonfyxobpih-auth-token='))
      ?.split('=')[1]
    if (!raw) return null
    try {
      return JSON.parse(decodeURIComponent(atob(raw.replace(/^base64-/, '')))).access_token || null
    } catch {
      return null
    }
  }

  // جلب المستخدم عبر REST مباشر أولاً (سريع وموثوق)، ثم supabase client عند غياب التوكن
  const getUser = useCallback(async () => {
    try {
      const token = getSessionToken()
      if (token) {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 4000)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            },
            signal: controller.signal,
          }
        )
        clearTimeout(timer)
        if (res.ok) return (await res.json()) as { id: string; email?: string }
      }
      // احتياطي: supabase client مع مهلة قصيرة
      const result = await withTimeout(supabase.auth.getUser(), 4000)
      return result?.data?.user || null
    } catch {
      return null
    }
  }, [supabase])

  const loadChat = useCallback(async () => {
    try {
      const user = await getUser()
      if (!user) {
        // إما غير مسجل أو تعذر التحقق -- لا نعلق الصفحة نهائياً
        setLoading(false)
        if (!getSessionToken()) setUserId(null)
        return
      }
      setUserId(user.id)

      // جلب المحادثة عبر REST (أسرع وأكثر موثوقية من supabase client في الإنتاج)
      const token = getSessionToken()
      const sbUrl = 'https://bvxqtzqkauonfyxobpih.supabase.co/rest/v1'
      const headers: Record<string, string> = {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      }
      if (token) headers['Authorization'] = `Bearer ${token}`

      let finalConvId: string | null = null
      const convRes = await withTimeout(
        fetch(`${sbUrl}/conversations?select=id&patient_id=eq.${user.id}`, {
          headers,
        })
      )
      if (convRes?.ok) {
        const convs = await convRes.json()
        finalConvId = convs[0]?.id || null
      }

      if (!finalConvId) {
        const insertRes = await withTimeout(
          fetch(`${sbUrl}/conversations?select=id`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient_id: user.id }),
          })
        )
        if (insertRes?.ok) {
          const created = await insertRes.json()
          finalConvId = Array.isArray(created) ? created[0]?.id : created?.id || null
        }
      }

      if (finalConvId) {
        setConversationId(finalConvId)

        // Load messages via API (server decrypts)
        const res = await fetch(`/api/chat?conversationId=${finalConvId}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      }

      setLoading(false)
    } catch (err) {
      console.error('[chat] فشل تحميل المحادثة:', err)
      setLoading(false)
      setError('حدث خطأ أثناء تحميل المحادثة. حاول مرة أخرى.')
    }
  }, [getUser])

  useEffect(() => {
    loadChat()
    // حماية من التعليق الأبدي: مهلة 10 ثوانٍ توقف التحميل وتعرض رسالة خطأ مع بديل واتساب
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          setError('تعذّر فتح المحادثة. جرّب الاتصال مباشرة عبر واتساب.')
          return false
        }
        return prev
      })
    }, 10000)
    return () => clearTimeout(timer)
  }, [loadChat])

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return

    let channel: RealtimeChannel

    channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          // Refetch from server to get decrypted content
          const res = await fetch(`/api/chat?conversationId=${conversationId}`)
          if (res.ok) {
            const data = await res.json()
            setMessages(data.messages || [])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || sending) return

    setSending(true)
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage.trim(), conversationId }),
    })

    if (res.ok) {
      setNewMessage('')
      // إعادة تحميل الرسائل لعرض رسالة المستخدم ورد الذكاء الاصطناعي التلقائي
      setTimeout(() => loadChat(), 500)
    } else {
      toast.error('تعذر إرسال الرسالة. حاول مرة أخرى.')
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card text-center py-10 max-w-md w-full">
          <p className="text-text font-semibold mb-2">⚠️ تعذّر فتح المحادثة</p>
          <p className="text-sm text-muted mb-4">{error}</p>
          <p className="text-sm text-muted mb-4">يمكنك أيضاً التواصل مباشرة مع العيادة:</p>
          <a href="https://wa.me/213550000000" target="_blank" rel="noopener noreferrer"
            className="btn-teal inline-block">تواصل عبر واتساب</a>
          <button onClick={() => { setError(''); setLoading(true); setTimeout(() => loadChat(), 300) }}
            className="btn-secondary mt-3 block w-full">إعادة المحاولة</button>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card text-center py-10 max-w-md w-full">
          <p className="text-text font-semibold mb-2">يجب تسجيل الدخول لاستخدام المحادثة</p>
          <p className="text-sm text-muted mb-4">أنشئ حساب مريض أو سجّل دخولك للمتابعة</p>
          <a href="/login" className="btn-primary">تسجيل الدخول</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h2 className="font-semibold text-text">محادثة مع الطبيب</h2>
          <p className="text-xs text-muted">د. غنوش زين الدين — جراح اختصاصي</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-surface2 mx-auto mb-4" />
            <p className="text-muted">لا توجد رسائل بعد</p>
            <p className="text-sm text-muted mt-1">أرسل رسالتك الأولى للطبيب</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-gold/15 border border-gold/20 rounded-bl-sm'
                      : 'bg-surface border border-surface2 rounded-br-sm'
                  }`}
                >
                  <p className="text-sm text-text">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-gold/60' : 'text-muted'}`}>
                    {new Date(msg.sent_at).toLocaleTimeString('ar-DZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="glass border-t border-white/5 p-4 flex items-center gap-3"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 input-field !py-2.5"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="w-10 h-10 rounded-xl bg-gold hover:bg-gold-light text-navy-900 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5 rotate-180" />
        </button>
      </form>
    </div>
  )
}
