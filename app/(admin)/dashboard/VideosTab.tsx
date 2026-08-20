'use client'

import { useState, useEffect } from 'react'
import { Film, Plus, Trash2, Check, X } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Video {
  id: string
  title_ar: string
  title_fr: string
  desc_ar: string
  desc_fr: string
  description_ar: string
  description_fr: string
  embed_url: string
  thumbnail_url: string
  duration: string
  consent_approved: boolean
  is_published: boolean
  category_id: string
}

interface Category {
  id: string
  name_ar: string
  name_fr: string
}

export function VideosTab() {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    title_ar: '',
    title_fr: '',
    desc_ar: '',
    embed_url: '',
    thumbnail_url: '',
    duration: '',
    category_id: '',
    consent_approved: false,
  })

  const fetchData = async () => {
    setLoading(true)
    const { data: vids } = await (supabase.from('videos') as any).select('*').order('created_at', { ascending: false })
    const { data: cats } = await (supabase.from('video_categories') as any).select('*').order('sort_order', { ascending: true })
    if (vids) setVideos(vids)
    if (cats) setCategories(cats)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    // Short URL: youtu.be/VIDEO_ID
    // Embed URL: youtube.com/embed/VIDEO_ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    const videoId = (match && match[2]?.length === 11) ? match[2] : null
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url // Return as is if not a YouTube URL
  }

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use a local object for insertion to avoid mutating state directly
    const categoryId = formData.category_id || (categories[0]?.id)
    if (!categoryId) {
      alert('الرجاء اختيار تصنيف للفيديو')
      return
    }

    const embedUrl = getYouTubeEmbedUrl(formData.embed_url)

    if (!formData.consent_approved) {
      alert('⚠️ لا يمكن نشر فيديو عملية دون موافقة المريض المكتوبة — هذا إلزامي قانونياً')
      return
    }

    const { error } = await (supabase.from('videos') as any).insert({
      title_ar: formData.title_ar,
      title_fr: formData.title_fr,
      desc_ar: formData.desc_ar,
      description_ar: formData.desc_ar,
      embed_url: embedUrl,
      thumbnail_url: formData.thumbnail_url || null,
      duration: formData.duration || null,
      category_id: categoryId,
      consent_approved: true,
      is_published: true
    })
    
    if (!error) {
      setIsAdding(false)
      setFormData({ title_ar: '', title_fr: '', desc_ar: '', embed_url: '', thumbnail_url: '', duration: '', category_id: '', consent_approved: false })
      fetchData()
    } else {
      alert('حدث خطأ أثناء إضافة الفيديو: ' + (error?.message || 'خطأ غير معروف'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return
    const { error } = await (supabase.from('videos') as any).delete().eq('id', id)
    if (!error) fetchData()
  }

  const handleTogglePublish = async (id: string, current: boolean) => {
    const { error } = await (supabase.from('videos') as any).update({ is_published: !current }).eq('id', id)
    if (!error) fetchData()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-display text-text">إدارة الفيديوهات</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'إلغاء' : 'إضافة فيديو جديد'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddVideo} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">العنوان (بالعربية)</label>
              <input required type="text" className="input-field" value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} placeholder="مثال: عملية استئصال المرارة" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">العنوان (بالفرنسية)</label>
              <input required type="text" className="input-field" value={formData.title_fr} onChange={e => setFormData({...formData, title_fr: e.target.value})} placeholder="Ex: Cholecystectomie" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">التصنيف</label>
              <select required className="input-field" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                <option value="" disabled>اختر التصنيف...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">رابط الفيديو (YouTube link)</label>
              <input required type="url" className="input-field" value={formData.embed_url} onChange={e => setFormData({...formData, embed_url: e.target.value})} placeholder="https://www.youtube.com/watch?v=..." title="يمكنك وضع رابط يوتيوب العادي وسنقوم بتحويله تلقائياً" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">الوصف بالدارجة الجزائرية (يُعرض تحت الفيديو)</label>
              <input type="text" className="input-field" value={formData.desc_ar} onChange={e => setFormData({...formData, desc_ar: e.target.value})} placeholder="مثال: عملية بالمنظار، المريض رجع لدارو في نفس النهار" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">مدة الفيديو</label>
              <input type="text" className="input-field" dir="ltr" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="12:34" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">رابط الصورة المصغّرة (اختياري)</label>
              <input type="url" className="input-field" value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} placeholder="https://...jpg" />
            </div>
          </div>
          <label className="flex items-start gap-3 p-4 rounded-xl border border-gold/30 bg-gold/5">
            <input type="checkbox" checked={formData.consent_approved} onChange={e => setFormData({...formData, consent_approved: e.target.checked})}
              className="w-5 h-5 mt-0.5 accent-teal" />
            <span className="text-sm text-muted">أؤكد أن لدي <strong className="text-text">موافقة مكتوبة من المريض</strong> على تصوير ونشر هذا الفيديو، وهذا إلزامي قبل النشر (قانون 18-11 المتعلق بحماية الأشخاص في مجال الصحة)</span>
          </label>
          <button type="submit" className="btn-primary w-full py-2">حفظ الفيديو</button>
        </form>
      )}

      {videos.length === 0 && !isAdding ? (
        <div className="card text-center py-12">
          <Film className="w-12 h-12 text-surface2 mx-auto mb-3" />
          <p className="text-muted">لا توجد فيديوهات حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(vid => (
            <div key={vid.id} className="card flex flex-col gap-4">
              <div className="aspect-video bg-navy-900 rounded-lg overflow-hidden">
                <iframe src={vid.embed_url} className="w-full h-full" allowFullScreen></iframe>
              </div>
              <div>
                <h3 className="font-bold text-text truncate">{vid.title_ar}</h3>
                <p className="text-sm text-muted truncate">{vid.title_fr}</p>
                {vid.desc_ar && <p className="text-xs text-muted mt-1 line-clamp-2">{vid.desc_ar}</p>}
                {vid.duration && <p className="text-xs text-gold/70 mt-1">⏱ {vid.duration}</p>}
                {vid.consent_approved && <p className="text-xs text-teal mt-1">✓ موافقة المريض مصادق عليها</p>}
              </div>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-surface">
                <button
                  onClick={() => !vid.consent_approved ? alert('لا يمكن نشر هذا الفيديو: موافقة المريض غير مصادق عليها') : handleTogglePublish(vid.id, vid.is_published)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${vid.is_published ? 'bg-teal/10 text-teal hover:bg-teal/20' : 'bg-surface2 text-muted hover:text-text'}`}
                >
                  <Check className="w-4 h-4" /> {vid.is_published ? 'منشور' : 'مسودة'}
                </button>
                <button
                  onClick={() => handleDelete(vid.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
