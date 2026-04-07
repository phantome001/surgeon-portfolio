'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquareQuote, Check, X, Loader2, Trash2, Plus } from 'lucide-react'

interface Testimonial {
  id: string
  patient_name: string
  content: string
  rating: number
  is_published: boolean
  created_at: string
}

export function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const [form, setForm] = useState({
    patient_name: '',
    content: '',
    rating: 5,
    is_published: true // Admin adds them directly as published by default
  })

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/testimonials?admin=true', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.testimonials || [])
      }
    } catch (e) {
      console.error('Failed to fetch testimonials:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.patient_name || !form.content) {
      alert('يرجى تعبئة اسم المريض ونص التقييم')
      return
    }

    setAdding(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      })

      if (res.ok) {
        setForm({ patient_name: '', content: '', rating: 5, is_published: true })
        fetchTestimonials()
      } else {
        alert('فشل إضافة التقييم')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('حدث خطأ أثناء الحفظ')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id))
        setConfirmDeleteId(null)
      } else {
        alert('فشل حذف التقييم')
        setConfirmDeleteId(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('حدث خطأ أثناء الحذف')
      setConfirmDeleteId(null)
    } finally {
      setDeleting(null)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setToggling(id)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_published: !currentStatus }),
        credentials: 'include'
      })

      if (res.ok) {
        setTestimonials(prev => prev.map(t => 
          t.id === id ? { ...t, is_published: !currentStatus } : t
        ))
      } else {
        alert('فشل تغيير حالة النشر')
      }
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">تقييمات وآراء المرضى</h2>
          <p className="text-sm text-muted mt-1">إدارة التقييمات التي تظهر في الصفحة الرئيسية</p>
        </div>
      </div>

      {/* Add New Testimonial Form */}
      <div className="card border-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-gold" />
        <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-gold" />
          إضافة تقييم جديد يدوياً
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">اسم المريض</label>
              <input
                type="text"
                value={form.patient_name}
                onChange={e => setForm({ ...form, patient_name: e.target.value })}
                placeholder="أحمد مثال..."
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">التقييم بالنجوم</label>
              <div className="flex items-center gap-2 h-[42px] bg-surface rounded-xl px-4 border border-surface">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className={`transition-colors ${star <= form.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">وصف التجربة / التقييم</label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="اكتب التقييم هنا..."
              className="input-field min-h-[100px]"
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={adding || !form.patient_name || !form.content}
              className="btn-primary flex items-center gap-2 min-w-[150px] justify-center disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? 'جاري الحفظ...' : 'نشر التقييم'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Testimonials */}
      <h3 className="text-lg font-bold text-text pt-4">التقييمات الحالية</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.length === 0 ? (
          <div className="col-span-2 text-center py-12 card bg-surface/10 border-dashed border-surface">
            <MessageSquareQuote className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="text-lg font-bold text-text mb-1">لا توجد تقييمات بعد</h3>
            <p className="text-muted">أضف تقييمات للمرضى لتعزيز الثقة في عيادتك</p>
          </div>
        ) : (
          testimonials.map(item => (
            <div key={item.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text flex items-center gap-2">
                    {item.patient_name}
                    {item.is_published ? (
                      <span className="text-[10px] bg-teal/20 text-teal px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> منشور
                      </span>
                    ) : (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Loader2 className="w-3 h-3" /> مسودة
                      </span>
                    )}
                  </h4>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 ${star <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* Publish Toggle Button */}
                  <button
                    onClick={() => handleTogglePublish(item.id, item.is_published)}
                    disabled={toggling === item.id}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                      item.is_published 
                        ? 'bg-surface text-muted hover:bg-surface2' 
                        : 'bg-teal/20 text-teal hover:bg-teal hover:text-white'
                    }`}
                  >
                    {toggling === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                      item.is_published ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />
                    )}
                    {item.is_published ? 'إلغاء النشر' : 'نشر بالموقع'}
                  </button>

                  {/* Delete Button */}
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
                      <span className="text-[10px] text-red-400 font-medium whitespace-nowrap px-1">حذف؟</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-1 bg-surface text-muted rounded-md hover:bg-surface2 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="حذف التقييم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-navy-900 rounded-xl p-4 relative">
                <MessageSquareQuote className="w-8 h-8 text-surface absolute top-2 left-2 rotate-180 opacity-50" />
                <p className="text-muted text-sm leading-relaxed relative z-10 break-words">
                  &quot;{item.content}&quot;
                </p>
                <div className="text-xs text-muted/50 mt-3 text-left">
                  {new Date(item.created_at).toLocaleDateString('ar-LY')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
