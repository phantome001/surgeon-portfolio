'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Send, MessageCircle } from 'lucide-react'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  sender_id: string
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

  const loadChat = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // غير مسجل: أوقف التحميل ووجّه لصفحة الدخول
        setLoading(false)
        return
      }
      setUserId(user.id)

    // Check for existing conversation
    const convRes: any = await supabase
      .from('conversations')
      .select('id')
      .eq('patient_id', user.id)
      .single()

    let finalConvId = convRes.data?.id

    if (!finalConvId) {
      // Workaround for some Supabase CLI generated type mismatches where insert requires any cast structurally
      // We typecast it to unknown then to the expected structure and extract id safely.
      const res: any = await supabase
        .from('conversations')
        .insert([{ patient_id: user.id }] as any)
        .select('id')
        .single()
      
      finalConvId = res.data?.id
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
  }, [supabase])

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
