'use client'

import { useEffect, useState } from 'react'
import { Star, MessageSquareQuote, ChevronRight, ChevronLeft, Plus, X, Loader2, CheckCircle2 } from 'lucide-react'

interface Testimonial {
  id: string
  patient_name: string
  content: string
  rating: number
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  const [form, setForm] = useState({
    patient_name: '',
    content: '',
    rating: 5
  })

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials')
        if (res.ok) {
          const data = await res.json()
          setTestimonials(data.testimonials || [])
        }
      } catch (e) {
        console.error('Failed to load testimonials:', e)
      }
    }
    fetchTestimonials()
  }, [])

  if (testimonials.length === 0) return null

  const next = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const prev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          is_published: false // Force to false so admin must approve
        })
      })

      if (res.ok) {
        setSubmitSuccess(true)
        setForm({ patient_name: '', content: '', rating: 5 })
        // Close modal after 3 seconds showing success message
        setTimeout(() => {
          setIsModalOpen(false)
          setSubmitSuccess(false)
        }, 3000)
      } else {
        alert('حدث خطأ أثناء إرسال تقييمك. يرجى المحاولة لاحقاً.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('حدث خطأ أثناء الإرسال.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative max-w-4xl mx-auto px-4 mt-8">
      {/* Testimonial Card */}
      <div className="card bg-navy-800/80 backdrop-blur-sm p-8 text-center relative min-h-[250px] flex flex-col justify-center animate-fade-in border border-gold/10 shadow-2xl">
        <MessageSquareQuote className="w-12 h-12 text-gold/20 absolute top-4 right-4 rotate-180" />
        <MessageSquareQuote className="w-12 h-12 text-gold/20 absolute bottom-4 left-4" />
        
        <p className="text-lg md:text-xl text-text leading-relaxed font-medium mb-6 relative z-10 px-8">
          &quot;{testimonials[activeIndex]?.content}&quot;
        </p>
        
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${star <= (testimonials[activeIndex]?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
              />
            ))}
          </div>
          <h4 className="font-bold text-gold text-lg">
            {testimonials[activeIndex]?.patient_name}
          </h4>
        </div>
      </div>

      {/* Controls */}
      {testimonials.length > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={next}
            className="w-10 h-10 rounded-full bg-surface border border-surface2 flex items-center justify-center text-text hover:text-gold hover:border-gold transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all rounded-full ${idx === activeIndex ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-surface hover:bg-gold/50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button 
            onClick={prev}
            className="w-10 h-10 rounded-full bg-surface border border-surface2 flex items-center justify-center text-text hover:text-gold hover:border-gold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Add Review Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>أضف تقييمك</span>
        </button>
      </div>

      {/* Add Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md relative bg-navy-800 border-gold/20 p-6 animate-slide-up shadow-2xl">
            <button
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-teal/20 rounded-full flex items-center justify-center mx-auto text-teal">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-text">شكراً لك!</h3>
                <p className="text-muted">تم استلام تقييمك بنجاح. ستتم مراجعته ثم نشره قريباً.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light mb-2">أضف تقييمك</h3>
                <p className="text-sm text-muted mb-6">رأيك يهمنا ويساعدنا على تحسين خدماتنا</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1 text-right">الاسم</label>
                    <input
                      type="text"
                      value={form.patient_name}
                      onChange={e => setForm({ ...form, patient_name: e.target.value })}
                      placeholder="كيف تحب أن يظهر اسمك؟"
                      className="input-field text-right"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-1 text-right">التقييم</label>
                    <div className="flex items-center gap-2 h-[42px] bg-surface rounded-xl px-4 border border-surface flex-row-reverse justify-end">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm({ ...form, rating: star })}
                          disabled={isSubmitting}
                          className={`transition-colors hover:scale-110 ${star <= form.rating ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400/50'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-1 text-right">رأيك وتجربتك</label>
                    <textarea
                      value={form.content}
                      onChange={e => setForm({ ...form, content: e.target.value })}
                      placeholder="كيف كانت تجربتك مع العيادة والدكتور؟"
                      className="input-field min-h-[100px] text-right"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !form.patient_name || !form.content}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال التقييم'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
