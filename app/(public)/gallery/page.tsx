'use client'

import { useState, useEffect } from 'react'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { Camera, Sparkles, X } from 'lucide-react'

interface GalleryCase {
  id: string
  title: string
  description: string
  category: string
  before_image_url: string
  after_image_url: string
}

export default function GalleryPage() {
  const [cases, setCases] = useState<GalleryCase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCase, setSelectedCase] = useState<GalleryCase | null>(null)

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/gallery', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setCases(data.cases || [])
        }
      } catch (e) {
        console.error('Failed to fetch gallery:', e)
      }
      setLoading(false)
    }
    fetchCases()
  }, [])

  // Build dynamic categories from actual data
  const uniqueCategories = Array.from(new Set(cases.map(c => c.category)))

  const filteredCases = selectedCategory === 'all'
    ? cases
    : cases.filter(c => c.category === selectedCategory)

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            <span>النتائج تتحدث عن نفسها</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display gold-gradient mb-4">
            قبل و بعد
          </h1>
          <p className="section-subheading max-w-2xl mx-auto">
            شاهد نتائج العمليات الجراحية التي أجراها الدكتور — حرّك المؤشر لمقارنة الصور
          </p>
        </div>

        {/* Category Filter - Dynamic */}
        {uniqueCategories.length > 1 && (
          <div className="flex gap-2 mb-10 justify-center flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20'
                  : 'bg-surface text-muted hover:text-text hover:bg-surface2'
              }`}
            >
              الكل
            </button>
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20'
                    : 'bg-surface text-muted hover:text-text hover:bg-surface2'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">لا توجد حالات حالياً</h3>
            <p className="text-muted">سيتم إضافة حالات جديدة قريباً</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredCases.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer"
                onClick={() => setSelectedCase(item)}
              >
                <div className="card hover:border-gold/30 transition-all hover:shadow-xl hover:shadow-gold/5 p-3">
                  <BeforeAfterSlider
                    beforeImage={item.before_image_url}
                    afterImage={item.after_image_url}
                    title={item.title}
                  />
                  <div className="mt-4 px-2 pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-text group-hover:text-gold transition-colors">{item.title}</h3>
                      <span className="text-xs bg-surface text-muted px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted mt-1.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedCase && (
          <div
            className="fixed inset-0 z-50 bg-navy-900/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedCase(null)}
          >
            <div
              className="max-w-4xl w-full animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-text">{selectedCase.title}</h2>
                  {selectedCase.description && (
                    <p className="text-sm text-muted mt-1">{selectedCase.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted hover:text-text hover:bg-surface2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <BeforeAfterSlider
                beforeImage={selectedCase.before_image_url}
                afterImage={selectedCase.after_image_url}
                title={selectedCase.title}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16 py-12 border-t border-surface">
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display gold-gradient mb-3">هل تريد نتائج مماثلة؟</h2>
          <p className="text-muted mb-6">احجز موعدك الآن للحصول على استشارة شخصية مجانية</p>
          <a href="/appointments" className="btn-primary inline-flex items-center gap-2">
            📅 حجز موعد
          </a>
        </div>
      </div>
    </div>
  )
}
