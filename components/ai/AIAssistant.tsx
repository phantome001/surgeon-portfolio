'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, AlertTriangle, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [pulled, setPulled] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'مرحباً بك! أنا المساعد الطبي الذكي للدكتور غنوش زين الدين، جراح اختصاصي في أمراض الجهاز الهضمي والعمليات الجراحية المتقدمة (مثل عمليات السمنة والسليف، المرارة، والفتق). كيف يمكنني مساعدتك اليوم؟' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })
      const data = await response.json()
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'نعتذر، المساعد مشغول حالياً. تواصل عبر واتساب.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'نعتذر، المساعد مشغول حالياً. تواصل عبر واتساب.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const renderMessages = () => (
    <>
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
            m.role === 'user' ? 'bg-surface2 text-text rounded-tr-none' : 'bg-gold/10 text-gold border border-gold/20 rounded-tl-none'
          }`}>
            <div className="flex items-center gap-2 mb-1 opacity-60">
              {m.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              <span className="text-[9px] font-bold uppercase tracking-widest">{m.role === 'user' ? 'أنت' : 'المساعد'}</span>
            </div>
            <div className="leading-relaxed">{m.content}</div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-end">
          <div className="bg-gold/5 border border-gold/10 rounded-2xl rounded-tl-none px-4 py-3">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </>
  )

  const renderInput = () => (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="اكتب رسالتك هنا..."
        className="w-full bg-navy-800 text-text rounded-2xl py-3 pr-4 pl-12 text-sm focus:ring-2 focus:ring-gold/30 outline-none transition-all placeholder:text-muted/50"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className="absolute left-2 top-1.5 w-9 h-9 bg-gold hover:bg-gold-light text-navy-900 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
      </button>
    </div>
  )

  const renderChatWindow = (isMobile: boolean) => (
    <div className={isMobile
      ? "fixed inset-0 z-[9999] bg-navy-900 flex flex-col"
      : "absolute bottom-20 right-0 w-[380px] h-[550px] max-h-[80vh] flex flex-col bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
    }>
      <div className="p-4 bg-gradient-to-r from-gold/20 to-transparent border-b border-white/10 flex items-center gap-3">
        {isMobile && (
          <button onClick={() => { setIsOpen(false); setPulled(false) }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-5 h-5 text-gold" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
          <Bot className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-text">مساعد د. غنوش الذكي</h4>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-muted font-medium">متصل</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">{renderMessages()}</div>
      <div className="px-4 py-2 bg-red-500/5 border-t border-red-500/10 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <p className="text-[9px] text-red-300">للإرشاد الأولي فقط. في الحالات الحرجة توجه للمستشفى.</p>
      </div>
      <div className="p-4 border-t border-white/5">{renderInput()}</div>
    </div>
  )

  return (
    <div dir="rtl">

      {/* ====== DESKTOP: Floating gold button ====== */}
      <div className="hidden md:block fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
            isOpen ? 'bg-navy-800 rotate-90 scale-90' : 'bg-gold hover:bg-gold-light hover:scale-110'
          }`}
        >
          {isOpen ? <X className="text-gold w-6 h-6" /> : <MessageSquare className="text-navy-900 w-6 h-6 fill-navy-900" />}
          {!isOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-navy-900 animate-pulse" />}
        </button>
        {isOpen && renderChatWindow(false)}
      </div>

      {/* ====== MOBILE: Half-hidden gold button on right edge ====== */}
      {!isOpen && (
        <div className="md:hidden fixed bottom-24 z-[9999]">
          <button
            onClick={() => { if (pulled) { setIsOpen(true) } else { setPulled(true) } }}
            className={`relative w-14 h-14 bg-gold rounded-2xl flex items-center justify-center shadow-2xl shadow-gold/30 active:scale-95 transition-all duration-300 ${
              pulled ? 'right-4' : '-right-7'
            }`}
            style={{ position: 'fixed', bottom: '6rem' }}
          >
            {!pulled && <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />}
            <MessageSquare className="text-navy-900 w-6 h-6 fill-navy-900" />
          </button>
        </div>
      )}

      {/* Mobile: tap-away to hide pulled button */}
      {pulled && !isOpen && (
        <div className="md:hidden fixed inset-0 z-[9998]" onClick={() => setPulled(false)} />
      )}

      {/* Mobile: Full screen chat */}
      {isOpen && <div className="md:hidden">{renderChatWindow(true)}</div>}
    </div>
  )
}
