'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Camera, Loader2, Upload, X, AlertTriangle, ChevronDown } from 'lucide-react'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'

interface GalleryCase {
  id: string
  title: string
  description: string
  category: string
  before_image_url: string
  after_image_url: string
}

const DEFAULT_CATEGORIES = [
  'جراحة عامة',
  'جراحة بالمنظار',
  'جراحة تجميلية',
  'حالات طارئة',
]

export function GalleryTab() {
  const [cases, setCases] = useState<GalleryCase[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [customCategory, setCustomCategory] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'جراحة عامة',
    before_image_url: '',
    after_image_url: ''
  })

  const existingCategories = Array.from(new Set(cases.map(c => c.category)))
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]))

  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)

  const fetchCases = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/gallery', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCases(data.cases || [])
      }
    } catch (e) {
      console.error('Failed to fetch gallery cases:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        setForm(prev => ({
          ...prev,
          [type === 'before' ? 'before_image_url' : 'after_image_url']: data.url
        }))
      } else {
        alert('فشل رفع الصورة')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('حدث خطأ أثناء الرفع')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title || !form.before_image_url || !form.after_image_url) {
      alert('يرجى تعبئة العنوان وإضافة الصورتين (قبل وبعد)')
      return
    }

    setAdding(true)
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      })

      if (res.ok) {
        setForm({ title: '', description: '', category: form.category || 'جراحة عامة', before_image_url: '', after_image_url: '' })
        fetchCases()
      } else {
        alert('فشل إضافة الحالة')
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
      const res = await fetch(`/api/gallery?id=${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        setCases(prev => prev.filter(c => c.id !== id))
        setConfirmDeleteId(null)
      } else {
        const errData = await res.json().catch(() => ({}))
        console.error('Delete failed:', res.status, errData)
        alert(`فشل حذف الحالة: ${errData.error || res.statusText}`)
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
          <h2 className="text-xl font-bold text-text">معرض الحالات</h2>
          <p className="text-sm text-muted mt-1">إضافة وإدارة صور (قبل وبعد) للعمليات الجراحية</p>
        </div>
      </div>

      {/* Add New Case Form */}
      <div className="card border-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-gold" />
        <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-gold" />
          إضافة حالة جديدة
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">العملية / العنوان</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: استئصال المرارة بالمنظار"
                className="input-field"
                required
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-muted mb-1">التصنيف</label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="input-field w-full flex items-center justify-between text-right cursor-pointer"
              >
                <span className={form.category ? 'text-text' : 'text-muted'}>
                  {form.category || 'اختر تصنيفاً...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCategoryDropdown && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-navy-800 border border-surface rounded-xl shadow-2xl overflow-hidden">
                  {/* Existing categories */}
                  {allCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, category: cat })
                        setShowCategoryDropdown(false)
                        setCustomCategory('')
                      }}
                      className={`w-full text-right px-4 py-2.5 text-sm hover:bg-gold/10 transition-colors ${
                        form.category === cat ? 'bg-gold/10 text-gold font-bold' : 'text-text'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}

                  {/* Custom category input */}
                  <div className="border-t border-surface p-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        placeholder="أو اكتب تصنيفاً جديداً..."
                        className="input-field flex-1 text-sm !py-2"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && customCategory.trim()) {
                            e.preventDefault()
                            setForm({ ...form, category: customCategory.trim() })
                            setShowCategoryDropdown(false)
                            setCustomCategory('')
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customCategory.trim()) {
                            setForm({ ...form, category: customCategory.trim() })
                            setShowCategoryDropdown(false)
                            setCustomCategory('')
                          }
                        }}
                        disabled={!customCategory.trim()}
                        className="px-3 py-1.5 bg-gold text-navy-900 text-xs font-bold rounded-lg hover:bg-gold-light transition-colors disabled:opacity-30"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1">وصف الحالة (اختياري)</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="وصف مختصر للحالة قبل وبعد العملية..."
              className="input-field min-h-[80px]"
            />
          </div>

          {/* Image Uploaders */}
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {/* Before Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted text-center">صورة (قبل)</label>
              {form.before_image_url ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-surface bg-surface group">
                  <img src={form.before_image_url} alt="Before" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, before_image_url: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => beforeInputRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-surface hover:border-gold/50 cursor-pointer flex flex-col items-center justify-center text-muted hover:text-gold transition-colors bg-surface/30"
                >
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin mb-2" /> : <Upload className="w-6 h-6 mb-2" />}
                  <span className="text-sm font-medium">{uploading ? 'جاري الرفع...' : 'رفع صورة قبل'}</span>
                </div>
              )}
              <input type="file" ref={beforeInputRef} onChange={e => handleFileUpload(e, 'before')} accept="image/*" className="hidden" />
            </div>

            {/* After Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted text-center">صورة (بعد)</label>
              {form.after_image_url ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-surface bg-surface group">
                  <img src={form.after_image_url} alt="After" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, after_image_url: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => afterInputRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-surface hover:border-teal/50 cursor-pointer flex flex-col items-center justify-center text-muted hover:text-teal transition-colors bg-surface/30"
                >
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin mb-2" /> : <Upload className="w-6 h-6 mb-2" />}
                  <span className="text-sm font-medium">{uploading ? 'جاري الرفع...' : 'رفع صورة بعد'}</span>
                </div>
              )}
              <input type="file" ref={afterInputRef} onChange={e => handleFileUpload(e, 'after')} accept="image/*" className="hidden" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={adding || uploading || !form.title || !form.before_image_url || !form.after_image_url}
              className="btn-primary flex items-center gap-2 min-w-[150px] justify-center disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? 'جاري الحفظ...' : 'حفظ ونشر الحالة'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Cases */}
      <div className="grid md:grid-cols-2 gap-6">
        {cases.length === 0 ? (
          <div className="col-span-2 text-center py-12 card bg-surface/10 border-dashed border-surface">
            <Camera className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="text-lg font-bold text-text mb-1">لا توجد حالات مسجلة بعد</h3>
            <p className="text-muted">أضف الحالة الأولى باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          cases.map(item => (
            <div key={item.id} className="card p-4 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text">{item.title}</h4>
                  <span className="text-xs text-muted bg-surface px-2 py-1 rounded-md mt-1 inline-block">
                    {item.category}
                  </span>
                </div>

                {/* Delete with inline confirmation */}
                {confirmDeleteId === item.id ? (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-xs text-red-400 font-medium whitespace-nowrap">حذف؟</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors min-w-[36px] flex items-center justify-center"
                    >
                      {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'نعم'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1 bg-surface text-muted text-xs font-bold rounded-lg hover:bg-surface2 transition-colors"
                    >
                      لا
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors text-sm shrink-0 border border-transparent hover:border-red-400/20"
                    title="حذف الحالة"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف</span>
                  </button>
                )}
              </div>

              <BeforeAfterSlider
                beforeImage={item.before_image_url}
                afterImage={item.after_image_url}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
