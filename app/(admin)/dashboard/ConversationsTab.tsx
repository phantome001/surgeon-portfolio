'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Send, Paperclip, CheckCheck, Bot, User, Phone, Info } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Message {
  id: string
  sender_id: string | null
  content: string
  sent_at: string
}

interface Conversation {
  id: string
  patient_id: string
  ai_enabled: boolean
  patient_name?: string
  last_message?: string
  last_time?: string
  online?: boolean
}

export function ConversationsTab() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const supabase = getSupabaseClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Conversations
  const fetchConversations = async () => {
    const res = await fetch('/api/conversations')
    if (res.ok) {
      const data = await res.json()
      setConversations(data.conversations || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // 2. Fetch Messages for active conversation
  useEffect(() => {
    if (!activeId) return

    async function fetchMessages() {
      const res = await fetch(`/api/chat?conversationId=${activeId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    }
    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${activeId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${activeId}` 
      }, () => {
        fetchMessages() // Refresh messages on new insert
        fetchConversations() // Also refresh sidebar for last message
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeId])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 3. Send Message
  const handleSend = async () => {
    if (!activeId || !messageText.trim() || sending) return
    
    setSending(true)
    const currentText = messageText
    setMessageText('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeId, content: currentText })
      })
      
      if (res.ok) {
        // Success
        fetchConversations() // Update sidebar last message
      } else {
        setMessageText(currentText) // Restore if failed
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  // 4. Toggle AI
  const handleToggleAI = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_enabled: !current })
      })
      if (res.ok) {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, ai_enabled: !current } : c))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredConversations = conversations.filter(c => 
    c.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeConv = conversations.find(c => c.id === activeId)

  if (loading) return <div className="flex justify-center py-20 text-gold italic">جاري تحميل المحادثات...</div>

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6 animate-fade-in text-right" dir="rtl">
      
      {/* 1. Sidebar */}
      <div className="w-1/3 card p-0 flex flex-col h-full overflow-hidden border-surface">
        <div className="p-4 border-b border-surface">
          <h2 className="text-xl font-bold text-text mb-4 font-display">المرضى</h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="ابحث عن مريض..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface2 border border-surface rounded-xl py-2.5 pr-10 pl-4 text-sm text-text outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full text-right p-3 rounded-xl transition-all flex gap-3 items-center group ${
                activeId === conv.id ? 'bg-surface2' : 'hover:bg-surface'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 bg-navy-900 rounded-full flex items-center justify-center border border-surface">
                  <User className="w-6 h-6 text-muted" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`font-bold truncate ${activeId === conv.id ? 'text-gold' : 'text-text'}`}>
                    {conv.patient_name}
                  </h3>
                  {conv.last_time && (
                    <span className="text-[10px] text-muted">
                      {new Date(conv.last_time).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 overflow-hidden">
                  <p className="text-[10px] text-muted truncate flex-1">
                    {conv.last_message || 'لا يوجد رسائل بعد'}
                  </p>
                  {conv.ai_enabled && <Bot className="w-3 h-3 text-teal shrink-0" />}
                </div>
              </div>
            </button>
          ))}
          {conversations.length === 0 && <p className="text-center text-muted p-4 text-sm">لا توجد محادثات نشطة</p>}
        </div>
      </div>

      {/* 2. Main Chat */}
      <div className="w-2/3 card p-0 flex flex-col h-full overflow-hidden border-surface relative">
        {activeConv ? (
          <>
            <div className="px-6 py-4 border-b border-surface flex items-center justify-between bg-surface/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-navy-900 rounded-full flex items-center justify-center border border-surface">
                  <User className="w-5 h-5 text-muted" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-text">{activeConv.patient_name}</h2>
                  <p className="text-xs text-muted">ملف مريض محمي ومفرات</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleToggleAI(activeConv.id, activeConv.ai_enabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeConv.ai_enabled 
                      ? 'bg-teal/20 text-teal border border-teal/40' 
                      : 'bg-surface text-muted border border-surface hover:bg-surface2'
                  }`}
                >
                  <Bot className={`w-4 h-4 ${activeConv.ai_enabled ? 'animate-pulse' : ''}`} />
                  {activeConv.ai_enabled ? 'المساعد الذكي يعمل' : 'تشغيل المساعد الذكي'}
                </button>
                <div className="h-4 w-[1px] bg-surface mx-1" />
                <button className="p-2 text-muted hover:text-gold rounded-full transition-colors"><Phone className="w-4 h-4" /></button>
                <button className="p-2 text-muted hover:text-gold rounded-full transition-colors"><Info className="w-4 h-4" /></button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-navy-900/40 scroll-smooth">
              {messages.map((msg) => {
                const isPatient = msg.sender_id === activeConv.patient_id;
                const isAI = msg.sender_id === null;
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isPatient ? 'items-start' : 'items-end'}`}>
                    <div className={`p-4 rounded-2xl max-w-[80%] ${
                      isPatient 
                        ? 'bg-surface text-text rounded-tr-sm border border-surface2' 
                        : isAI
                          ? 'bg-teal/10 text-teal-100 rounded-tl-sm border border-teal/20'
                          : 'bg-gold/20 text-gold-100 rounded-tl-sm border border-gold/30'
                    }`}>
                      {isAI && (
                        <div className="flex items-center gap-1.5 mb-2 text-teal text-[10px] font-bold border-b border-teal/10 pb-1">
                          <Bot className="w-3.5 h-3.5" /> مساعدك الآلي
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-muted px-1">
                      {new Date(msg.sent_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                      {!isPatient && <CheckCheck className="w-3 h-3 text-teal" />}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t border-surface bg-surface/30">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {['نتائجك سليمة بحمد الله.', 'مرحباً، تفضل بحجز موعد.', 'هل الألم مستمر؟'].map((reply, i) => (
                  <button key={i} onClick={() => setMessageText(reply)} className="shrink-0 text-[10px] bg-surface border border-surface2 text-muted px-3 py-1.5 rounded-full hover:border-gold">
                    {reply}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-2">
                <button className="p-3 text-muted hover:text-gold shrink-0"><Paperclip className="w-5 h-5" /></button>
                <textarea
                  rows={1}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 bg-navy-900 border border-surface rounded-2xl py-3 px-4 text-sm text-text outline-none resize-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={sending}
                  className="p-3 bg-gold hover:bg-gold-light text-navy-900 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-5 h-5 -ml-1" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted">
            <Bot className="w-12 h-12 opacity-20 mb-4" />
            <h3 className="font-bold text-text mb-2">اختر مريضاً لبدء المحادثة</h3>
            <p className="text-xs text-center px-10">جميع الرسائل في هذا القسم مفرشة بالكامل لضمان سرية بيانات مرضاك.</p>
          </div>
        )}
      </div>
    </div>
  )
}
