'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Film, BarChart3, Check, Clock, Users, Mail, Settings, Camera } from 'lucide-react'
import { AppointmentsTab } from './AppointmentsTab'
import { VideosTab } from './VideosTab'
import { StatsTab } from './StatsTab'
import { SettingsTab } from './SettingsTab'
import { MessagesTab } from './MessagesTab'
import { GalleryTab } from './GalleryTab'
import { TestimonialsTab } from './TestimonialsTab'
import { MessageSquareQuote } from 'lucide-react'

type Tab = 'appointments' | 'settings' | 'videos' | 'stats' | 'messages' | 'gallery' | 'testimonials'

interface Appointment {
  id: string
  date: string
  time_slot: string
  full_name: string
  phone: string
  reason: string
  status: string
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('appointments')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, today: 0, total: 0 })

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])

        const todayStr = new Date().toISOString().split('T')[0]
        setStats({
          pending: (data.appointments || []).filter((a: Appointment) => a.status === 'pending').length,
          confirmed: (data.appointments || []).filter((a: Appointment) => a.status === 'confirmed').length,
          today: (data.appointments || []).filter((a: Appointment) => a.date === todayStr).length,
          total: (data.appointments || []).length,
        })
      }
    } catch (e) {
      console.error('Failed to fetch appointments:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])



  const tabs = [
    { id: 'appointments' as Tab, label: 'المواعيد', icon: CalendarDays },
    { id: 'messages' as Tab, label: 'الرسائل', icon: Mail },
    { id: 'videos' as Tab, label: 'الفيديوهات', icon: Film },
    { id: 'gallery' as Tab, label: 'الحالات (قبل/بعد)', icon: Camera },
    { id: 'testimonials' as Tab, label: 'التقييمات', icon: MessageSquareQuote },
    { id: 'stats' as Tab, label: 'الإحصائيات', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'الإعدادات', icon: Settings },
  ]

  return (
    <div className="min-h-screen py-8 animate-fade-in bg-navy-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display gold-gradient mb-2">لوحة التحكم</h1>
            <p className="text-muted">مرحباً دكتور — إدارة العيادة</p>
          </div>
        </div>

        {/* Stats */}
        {tab !== 'stats' && tab !== 'settings' && tab !== 'messages' && tab !== 'gallery' && tab !== 'testimonials' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'قيد الانتظار', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
              { label: 'مؤكدة', value: stats.confirmed, icon: Check, color: 'text-teal' },
              { label: 'اليوم', value: stats.today, icon: CalendarDays, color: 'text-gold' },
              { label: 'الإجمالي', value: stats.total, icon: Users, color: 'text-text' },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="card">
                  <Icon className={`w-6 h-6 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold text-text">{s.value}</p>
                  <p className="text-sm text-muted">{s.label}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Tabs - Grid on mobile, horizontal pills on desktop */}
        <div className="mb-6">
          {/* Mobile: Icon Grid */}
          <div className="md:hidden grid grid-cols-4 gap-2 bg-navy-800 p-2 rounded-2xl border border-surface">
            {tabs.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl text-[10px] font-bold transition-all ${
                    tab === t.id
                      ? 'bg-gold text-navy-900 shadow-md shadow-gold/20'
                      : 'text-muted hover:text-text hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t.label.split(' ')[0]}
                </button>
              )
            })}
          </div>
          
          {/* Desktop: Horizontal Pills */}
          <div className="hidden md:flex gap-1 bg-navy-800 p-1 rounded-xl border border-surface overflow-x-auto mx-auto max-w-fit">
            {tabs.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    tab === t.id
                      ? 'bg-gold text-navy-900'
                      : 'text-muted hover:text-text hover:bg-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        {tab === 'appointments' ? (
          <AppointmentsTab loading={loading} appointments={appointments} fetchAppointments={fetchAppointments} />
        ) : tab === 'videos' ? (
          <VideosTab />
        ) : tab === 'messages' ? (
          <MessagesTab />
        ) : tab === 'gallery' ? (
          <GalleryTab />
        ) : tab === 'testimonials' ? (
          <TestimonialsTab />
        ) : tab === 'settings' ? (
          <SettingsTab />
        ) : tab === 'stats' ? (
          <StatsTab />
        ) : null}
      </div>
    </div>
  )
}
