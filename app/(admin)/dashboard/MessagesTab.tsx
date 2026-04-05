'use client'

import { useState, useEffect } from 'react'
import { Mail, User, Clock, MessageSquare, Trash2 } from 'lucide-react'

interface ContactRequest {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'pending' | 'read'
  created_at: string
}

export function MessagesTab() {
  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact-requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (e) {
      console.error('Failed to fetch requests:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/contact-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'read' })
      })
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'read' } : r))
      }
    } catch (e) {
      console.error('Failed to mark as read:', e)
    }
  }

  const deleteOne = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/contact-requests?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id))
        if (selectedId === id) setSelectedId(null)
      }
    } catch (e) {
      console.error('Failed to delete:', e)
    }
    setDeleting(false)
  }

  const deleteAll = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الرسائل؟ لا يمكن التراجع عن هذا الإجراء.')) return
    setDeleting(true)
    try {
      const res = await fetch('/api/contact-requests?id=all', { method: 'DELETE' })
      if (res.ok) {
        setRequests([])
        setSelectedId(null)
      }
    } catch (e) {
      console.error('Failed to delete all:', e)
    }
    setDeleting(false)
  }

  const selectedRequest = requests.find(r => r.id === selectedId)

  if (loading) return <div className="py-20 text-center text-gold italic">جاري تحميل الرسائل...</div>

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]" dir="rtl">
      {/* Sidebar List */}
      <div className="md:col-span-1 card p-0 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-surface bg-surface/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold" />
              صندوق الوارد
              <span className="bg-gold/10 text-gold text-[10px] px-2 py-0.5 rounded-full">
                {requests.filter(r => r.status === 'pending').length} جديدة
              </span>
            </h3>
            {requests.length > 0 && (
              <button
                onClick={deleteAll}
                disabled={deleting}
                className="text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                title="حذف الكل"
              >
                <Trash2 className="w-3 h-3" />
                حذف الكل
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {requests.map((r) => (
            <div
              key={r.id}
              className={`relative group rounded-xl transition-all border ${
                selectedId === r.id 
                  ? 'bg-gold/10 border-gold/30' 
                  : 'hover:bg-surface/50 border-transparent'
              }`}
            >
              <button
                onClick={() => {
                  setSelectedId(r.id)
                  if (r.status === 'pending') markAsRead(r.id)
                }}
                className="w-full text-right p-3"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold ${r.status === 'pending' ? 'text-text' : 'text-muted'}`}>
                    {r.name}
                  </span>
                  <span className="text-[10px] text-muted">
                    {new Date(r.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <p className="text-xs text-muted truncate">{r.subject}</p>
              </button>
              {/* Delete button on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteOne(r.id) }}
                disabled={deleting}
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                title="حذف الرسالة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="py-10 text-center text-muted">
              <MessageSquare className="w-8 h-8 opacity-20 mx-auto mb-2" />
              <p className="text-sm">لا توجد رسائل حالياً</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="md:col-span-2 card p-0 flex flex-col overflow-hidden bg-surface/5">
        {selectedRequest ? (
          <>
            <div className="p-6 border-b border-surface bg-surface/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-text mb-1">{selectedRequest.subject}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {selectedRequest.name}</span>
                    <span className="flex items-center gap-1" dir="ltr"><Mail className="w-3 h-3" /> {selectedRequest.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(selectedRequest.created_at).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="bg-navy-900/50 rounded-2xl p-6 border border-surface min-h-[200px]">
                <p className="text-text leading-relaxed whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>
            </div>
            <div className="p-4 border-t border-surface flex justify-between items-center">
              <button 
                onClick={() => deleteOne(selectedRequest.id)}
                disabled={deleting}
                className="text-sm flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> حذف الرسالة
              </button>
              <button 
                onClick={() => window.location.href = `mailto:${selectedRequest.email}`}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> الرد عبر البريد
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted">
            <div className="w-16 h-16 rounded-full bg-surface/20 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 opacity-20" />
            </div>
            <p>اختر رسالة لعرض تفاصيلها</p>
          </div>
        )}
      </div>
    </div>
  )
}
