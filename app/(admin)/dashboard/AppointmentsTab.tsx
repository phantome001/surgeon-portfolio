'use client'

import { useState } from 'react'
import { CalendarDays, Check, X, Plus } from 'lucide-react'

interface Appointment {
  id: string
  date: string
  time_slot: string
  full_name: string
  phone: string
  reason: string
  status: string
}

export function AppointmentsTab({
  appointments, fetchAppointments, loading
}: {
  appointments: Appointment[], fetchAppointments: () => void, loading: boolean
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '', phone: '', reason: '', date: '', timeSlot: '09:00'
  })

  const handleStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchAppointments()
  }

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      setIsAdding(false)
      setFormData({ fullName: '', phone: '', reason: '', date: '', timeSlot: '09:00' })
      fetchAppointments()
    } else {
      const data = await res.json()
      alert(data.error || 'حدث خطأ أثناء إضافة الموعد')
    }
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
        <h2 className="text-xl font-bold font-display text-text">إدارة المواعيد</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'إلغاء' : 'إضافة موعد'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddAppointment} className="card space-y-4 border-l-4 border-gold">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">الاسم الكامل</label>
              <input required type="text" className="input-field" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="الاسم الكامل" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">رقم الهاتف</label>
              <input required type="tel" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+212..." dir="ltr" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">سبب الزيارة</label>
              <input required type="text" className="input-field" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="سبب الزيارة" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">التاريخ</label>
              <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">الوقت</label>
              <select required className="input-field" value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})}>
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-2">حفظ الموعد</button>
        </form>
      )}

      {appointments.length === 0 && !isAdding ? (
        <div className="card text-center py-12">
          <CalendarDays className="w-12 h-12 text-surface2 mx-auto mb-3" />
          <p className="text-muted">لا توجد مواعيد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-surface">
              <div>
                <p className="font-semibold text-text">{apt.full_name}</p>
                <p className="text-sm text-muted" dir="ltr">{apt.phone}</p>
                <p className="text-sm text-muted mt-1">{apt.reason}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                  <span className="text-gold flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {apt.date}</span>
                  <span className="text-teal">{apt.time_slot}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    apt.status === 'confirmed' ? 'bg-teal/10 text-teal'
                      : apt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400'
                      : apt.status === 'completed' ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'pending' ? 'قيد الانتظار' : apt.status === 'completed' ? 'مكتمل' : 'ملغي'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {apt.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatus(apt.id, 'confirmed')}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-teal/10 text-teal rounded-lg text-sm hover:bg-teal/20 transition-all">
                      <Check className="w-4 h-4" /> تأكيد
                    </button>
                    <button onClick={() => handleStatus(apt.id, 'cancelled')}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-all">
                      <X className="w-4 h-4" /> إلغاء
                    </button>
                  </>
                )}
                {apt.status === 'confirmed' && (
                  <button onClick={() => handleStatus(apt.id, 'completed')}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-all">
                    <Check className="w-4 h-4" /> اكتمال الفحص
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
