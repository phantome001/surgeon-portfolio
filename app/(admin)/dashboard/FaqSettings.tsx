'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  sort_order: number
}

export function FaqSettings() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ question: string, answer: string, sort_order: number }>({ question: '', answer: '', sort_order: 0 })
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/faqs')
      if (res.ok) {
        const data = await res.json()
        setFaqs(data.faqs)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return
    
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFaqs(faqs.filter(f => f.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async (id?: string) => {
    try {
      if (id) {
        // Update existing
        const res = await fetch('/api/faqs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...editForm })
        })
        if (res.ok) {
          setFaqs(faqs.map(f => f.id === id ? { ...f, ...editForm } : f))
          setEditingId(null)
        }
      } else {
        // Add new
        const res = await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm)
        })
        if (res.ok) {
          const { data } = await res.json()
          setFaqs([...faqs, data])
          setIsAdding(false)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="py-10 text-center text-muted">جاري تحميل الأسئلة الشائعة...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="font-bold text-text text-sm">إدارة الأسئلة الشائعة (FAQ)</h3>
          <p className="text-xs text-muted mt-1">تستطيع هنا تعديل، إضافة أو حذف الأسئلة التي تظهر في الصفحة الرئيسية للموقع</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true)
            setEditForm({ question: '', answer: '', sort_order: faqs.length + 1 })
          }}
          disabled={isAdding || editingId !== null}
          className="btn-primary py-2 px-4 text-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> إضافة سؤال جديد
        </button>
      </div>

      <div className="space-y-4">
        {isAdding && (
          <div className="bg-surface-light border border-gold/30 rounded-xl p-4 space-y-3">
            <input
              type="text"
              placeholder="اكتب السؤال هنا..."
              value={editForm.question}
              onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
              className="input-field w-full text-sm font-bold"
            />
            <textarea
              placeholder="اكتب الجواب النموذجي هنا..."
              value={editForm.answer}
              onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
              className="input-field w-full text-sm h-24 resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-surface2 text-muted">
                إلغاء
              </button>
              <button 
                onClick={() => handleSave()} 
                disabled={!editForm.question || !editForm.answer}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gold text-navy-900 flex items-center gap-1 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> حفظ السؤال
              </button>
            </div>
          </div>
        )}

        {faqs.sort((a, b) => a.sort_order - b.sort_order).map((faq) => {
          const isEditing = editingId === faq.id
          
          if (isEditing) {
            return (
              <div key={faq.id} className="bg-surface-light border border-gold/30 rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  value={editForm.question}
                  onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                  className="input-field w-full text-sm font-bold"
                />
                <textarea
                  value={editForm.answer}
                  onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                  className="input-field w-full text-sm h-24 resize-none"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted">الترتيب:</label>
                  <input 
                    type="number" 
                    value={editForm.sort_order} 
                    onChange={e => setEditForm({ ...editForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="input-field w-20 text-center py-1 px-2 text-xs" 
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-surface hover:bg-surface2 text-muted">
                    إلغاء
                  </button>
                  <button 
                    onClick={() => handleSave(faq.id)} 
                    disabled={!editForm.question || !editForm.answer}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gold text-navy-900 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> تحديث
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={faq.id} className="bg-surface/50 border border-surface2 rounded-xl p-4 flex gap-4 group">
              <div className="flex-1">
                <h4 className="font-bold text-sm text-text mb-1">{faq.question}</h4>
                <p className="text-xs text-muted leading-relaxed">{faq.answer}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditingId(faq.id)
                    setEditForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order })
                    setIsAdding(false)
                  }}
                  className="p-2 hover:bg-surface2 text-muted hover:text-gold rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 hover:bg-red-500/10 text-muted hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}

        {faqs.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted text-sm border-2 border-dashed border-surface2 rounded-xl">
            لا يوجد أسئلة شائعة مضافة حالياً.
          </div>
        )}
      </div>
    </div>
  )
}
