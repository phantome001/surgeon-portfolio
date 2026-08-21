'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Clock, Check, AlertCircle, ChevronRight, ChevronLeft, User, Phone as PhoneIcon, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

export default function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [step, setStep] = useState<'calendar' | 'form' | 'success'>('calendar')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = getSupabaseClient()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthName = currentDate.toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' })

  const days: (number | null)[] = []
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  useEffect(() => {
    if (!selectedDate) return
    const fetchSlots = async () => {
      const { data } = await supabase
        .from('appointments')
        .select('time_slot')
        .eq('date', selectedDate)
        .in('status', ['pending', 'confirmed'])

      setBookedSlots(data?.map((d: { time_slot: string }) => d.time_slot) || [])
    }
    fetchSlots()
  }, [selectedDate, supabase])

  const handleDayClick = (day: number) => {
    const d = new Date(year, month, day)
    if (d < today) return
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setSelectedSlot(null)
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) return
    setError('')
    setLoading(true)

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        timeSlot: selectedSlot,
        fullName: fullName.trim(),
        phone: phone.trim(),
        reason: reason.trim(),
      }),
    })

    if (res.ok) {
      toast.success('تم إرسال طلب الحجز بنجاح')
      setStep('success')
    } else {
      const data = await res.json()
      const errorMsg = data.error || 'حدث خطأ أثناء الحجز'
      setError(errorMsg)
      toast.error(errorMsg)
    }
    setLoading(false)
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center py-12 max-w-md w-full border-teal/20">
          <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-teal" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">✓ تم تأكيد حجز موعدك</h1>
          <p className="text-muted mb-1">التاريخ: {selectedDate}</p>
          <p className="text-muted mb-4">الوقت: {selectedSlot}</p>
          <p className="text-sm text-muted">سيتم إعلامك عند تأكيد الموعد من قبل الطبيب</p>
          <button onClick={() => { setStep('calendar'); setSelectedDate(null); setSelectedSlot(null) }}
            className="btn-primary mt-6">حجز موعد آخر</button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="section-heading text-center mb-2">📅 حجز موعد</h1>
        <p className="section-subheading text-center">اختر التاريخ والوقت المناسب لموعدك</p>

        {/* Clinic info */}
        <div className="card mb-8 border-gold/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gold flex-shrink-0" />
            <p className="text-sm text-muted">
              مواعيد العيادة: الأحد إلى الخميس — الصباح (09:00-12:00) والمساء (14:00-17:00)
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentDate(new Date(year, month - 1))}
                className="p-2 rounded-lg hover:bg-surface text-muted hover:text-text transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-text">{monthName}</h3>
              <button onClick={() => setCurrentDate(new Date(year, month + 1))}
                className="p-2 rounded-lg hover:bg-surface text-muted hover:text-text transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <div dir="rtl" className="grid grid-cols-7 gap-1 text-center mb-2">
              {['إث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'].map((d) => (
                <div key={d} className="text-xs text-muted py-1">{d}</div>
              ))}
            </div>

            <div dir="rtl" className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (day === null) return <div key={i} className="aspect-square" />
                const d = new Date(year, month, day)
                const isToday = d.toDateString() === new Date().toDateString()
                const isPast = d < today
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isSelected = selectedDate === dateStr

                return (
                  <button
                    key={i}
                    disabled={isPast}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all duration-200 ${
                      isPast
                        ? 'text-muted/30 cursor-not-allowed'
                        : isSelected
                        ? 'bg-gold text-navy-900'
                        : isToday
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-text hover:bg-surface'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Slots + Form */}
          <div>
            {selectedDate && step === 'calendar' && (
              <div className="card mb-4">
                <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold" />
                  اختر الوقت — {selectedDate}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedSlots.includes(slot)
                    const isSelected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isBooked
                            ? 'bg-surface text-muted/40 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-teal text-navy-900'
                            : 'bg-surface hover:bg-surface2 text-text'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>

                {selectedSlot && (
                  <button onClick={() => setStep('form')} className="btn-primary w-full mt-4">
                    متابعة الحجز
                  </button>
                )}
              </div>
            )}

            {step === 'form' && (
              <div className="card">
                <h3 className="font-semibold text-text mb-4">بيانات الحجز</h3>
                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted mb-1">الاسم الكامل</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="input-field pr-9 text-sm" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1">رقم الهاتف</label>
                    <div className="relative">
                      <PhoneIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="input-field pr-9 text-sm" dir="ltr" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1">سبب الزيارة</label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-3 w-4 h-4 text-muted" />
                      <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                        className="input-field pr-9 text-sm min-h-[80px] resize-none" required />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep('calendar')}
                      className="btn-secondary flex-1">رجوع</button>
                    <button type="submit" disabled={loading}
                      className="btn-teal flex-1 disabled:opacity-50">
                      {loading ? 'جارٍ الحجز...' : 'تأكيد الحجز'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
