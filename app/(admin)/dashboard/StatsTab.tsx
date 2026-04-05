'use client'

import { useState, useEffect } from 'react'
import { Users, Film, CalendarDays, Activity, Video, Clock } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface StatsData {
  totalPatients: number
  totalVideos: number
  totalViews: number
  appointments: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
  categories: { id: string; name: string; count: number }[]
  timeline: { id: string; text: string; subtext: string; date: Date; type: 'patient' | 'appointment' | 'video' }[]
}

export function StatsTab() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)

      // Fetch profiles (patients)
      const { data: patients } = await (supabase
        .from('profiles') as any)
        .select('id, name, created_at')
        .eq('role', 'patient')

      // Fetch appointments
      const { data: appointments } = await (supabase
        .from('appointments') as any)
        .select('*')

      // Fetch videos
      const { data: videos } = await (supabase
        .from('videos') as any)
        .select('*')

      // Fetch categories
      const { data: categories } = await (supabase
        .from('video_categories') as any)
        .select('id, name_ar')

      const pts: any[] = patients || []
      const apts: any[] = appointments || []
      const vids: any[] = videos || []
      const cats: any[] = categories || []

      // 1. KPIs
      const totalPatients = pts.length
      const totalVideos = vids.length
      const totalViews = vids.reduce((acc, v) => acc + (v.views || 0), 0)

      // 2. Appointment Distribution
      const aptStats = {
        total: apts.length,
        pending: apts.filter(a => a.status === 'pending').length,
        confirmed: apts.filter(a => a.status === 'confirmed').length,
        completed: apts.filter(a => a.status === 'completed').length,
        cancelled: apts.filter(a => a.status === 'cancelled').length,
      }

      // 3. Videos per Category
      const catStats = cats.map(c => {
        return {
          id: c.id,
          name: c.name_ar,
          count: vids.filter(v => v.category_id === c.id).length
        }
      }).sort((a, b) => b.count - a.count)

      // 4. Timeline (Merge latest 5 of each, sort by date desc, take top 10)
      let timeline: any[] = []
      pts.forEach(p => timeline.push({
        id: `p-${p.id}`,
        text: 'انضمام مريض جديد',
        subtext: p.name,
        date: new Date(p.created_at),
        type: 'patient'
      }))
      apts.forEach(a => timeline.push({
        id: `a-${a.id}`,
        text: 'تم حجز موعد',
        subtext: `للتاريخ ${a.date}`,
        date: new Date(a.created_at),
        type: 'appointment'
      }))
      vids.forEach(v => timeline.push({
        id: `v-${v.id}`,
        text: 'إضافة فيديو جديد',
        subtext: v.title_ar,
        date: new Date(v.created_at),
        type: 'video'
      }))

      timeline.sort((a, b) => b.date.getTime() - a.date.getTime())
      timeline = timeline.slice(0, 10)

      setData({
        totalPatients,
        totalVideos,
        totalViews,
        appointments: aptStats,
        categories: catStats,
        timeline,
      })

      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  // Calculate percentages for appointments
  const getPct = (val: number) => data.appointments.total > 0 ? (val / data.appointments.total) * 100 : 0
  const pendingPct = getPct(data.appointments.pending)
  const confirmedPct = getPct(data.appointments.confirmed)
  const completedPct = getPct(data.appointments.completed)
  const cancelledPct = getPct(data.appointments.cancelled)

  // Max video count for progress bars
  const maxVidCount = Math.max(...data.categories.map(c => c.count), 1)

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. KPIs */}
      <h2 className="text-xl font-bold font-display text-text border-b border-surface pb-2">نظرة عامة على العيادة</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-navy-800 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1 font-medium">إجمالي المرضى (المسجلين)</p>
              <h3 className="text-4xl font-bold text-text">{data.totalPatients}</h3>
            </div>
            <div className="bg-surface2 p-3 rounded-xl border border-surface shadow-inner">
              <Users className="w-8 h-8 text-gold" />
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-navy-800 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <CalendarDays className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1 font-medium">المواعيد المكتملة (الزيارات)</p>
              <h3 className="text-4xl font-bold text-text">{data.appointments.completed}</h3>
            </div>
            <div className="bg-surface2 p-3 rounded-xl border border-surface shadow-inner">
              <Activity className="w-8 h-8 text-teal" />
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-navy-800 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <Film className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1 font-medium">مكتبة الفيديوهات</p>
              <h3 className="text-4xl font-bold text-text">{data.totalVideos}</h3>
            </div>
            <div className="bg-surface2 p-3 rounded-xl border border-surface shadow-inner">
              <Video className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Appointments Distribution */}
      <div className="card mb-8">
        <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gold" /> حالة المواعيد الكلية ({data.appointments.total})
        </h3>
        
        {/* Multi-color Progress Bar */}
        <div className="relative w-full h-8 flex rounded-full overflow-hidden shadow-inner bg-navy-900 mb-6">
          {completedPct > 0 && <div style={{width: `${completedPct}%`}} className="h-full bg-green-500 transition-all duration-1000 ease-out" title="مكتملة" />}
          {confirmedPct > 0 && <div style={{width: `${confirmedPct}%`}} className="h-full bg-teal transition-all duration-1000 ease-out border-r border-navy-800" title="مؤكدة" />}
          {pendingPct > 0 && <div style={{width: `${pendingPct}%`}} className="h-full bg-yellow-400 transition-all duration-1000 ease-out border-r border-navy-800" title="قيد الانتظار" />}
          {cancelledPct > 0 && <div style={{width: `${cancelledPct}%`}} className="h-full bg-red-500 transition-all duration-1000 ease-out border-r border-navy-800" title="ملغاة" />}
        </div>

        {/* Legend Map */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
          <div className="flex flex-col items-center p-3 bg-surface rounded-xl">
            <span className="w-3 h-3 rounded-full bg-green-500 mb-2 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            <span className="text-sm text-muted">مكتملة</span>
            <span className="text-lg font-bold text-text">{data.appointments.completed}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-surface rounded-xl">
            <span className="w-3 h-3 rounded-full bg-teal mb-2 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span>
            <span className="text-sm text-muted">مؤكدة</span>
            <span className="text-lg font-bold text-text">{data.appointments.confirmed}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-surface rounded-xl">
            <span className="w-3 h-3 rounded-full bg-yellow-400 mb-2 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
            <span className="text-sm text-muted">انتظار</span>
            <span className="text-lg font-bold text-text">{data.appointments.pending}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-surface rounded-xl">
            <span className="w-3 h-3 rounded-full bg-red-500 mb-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            <span className="text-sm text-muted">ملغاة</span>
            <span className="text-lg font-bold text-text">{data.appointments.cancelled}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Categories & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3. Videos per Category */}
        <div className="card h-fit">
          <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
            <Film className="w-5 h-5 text-gold" /> توزيع مكتبة الفيديوهات
          </h3>
          <div className="space-y-5">
            {data.categories.map(cat => (
              <div key={cat.id}>
                <div className="flex justify-between text-sm mb-1 pb-1">
                  <span className="text-muted">{cat.name}</span>
                  <span className="font-bold text-text">{cat.count} فيديو</span>
                </div>
                <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal transition-all duration-1000 ease-out" 
                    style={{ width: `${maxVidCount > 0 ? (cat.count / maxVidCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {data.categories.length === 0 && <p className="text-muted text-center text-sm">لا توجد تصنيفات فيديوهات حالياً</p>}
          </div>
        </div>

        {/* 4. Recent Activity Timeline */}
        <div className="card h-fit border border-surface shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-teal via-gold to-teal"></div>
          <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold" /> أحدث النشاطات
          </h3>
          
          <div className="flex-1 relative">
            {/* The Vertical Line */}
            <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-surface2"></div>
            
            <div className="space-y-6 relative z-10">
              {data.timeline.length === 0 ? (
                 <p className="text-muted text-sm text-center py-10">لا يوجد أي نشاط حتى الآن</p>
              ) : (
                 data.timeline.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-4 group">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-navy-900 shrink-0 shadow relative z-10
                      ${item.type === 'appointment' ? 'bg-gold/20 text-gold' : item.type === 'patient' ? 'bg-teal/20 text-teal' : 'bg-blue-400/20 text-blue-400'}`}>
                      {item.type === 'appointment' ? <CalendarDays className="w-4 h-4" /> : item.type === 'patient' ? <Users className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 card bg-surface/50 p-3 rounded-xl border border-surface group-hover:bg-surface transition-colors">
                      <time className="mb-1 text-xs font-semibold text-gold/80 flex items-center gap-1">
                        {item.date.toLocaleDateString('ar-MA')} <span className="opacity-50">|</span> {item.date.toLocaleTimeString('ar-MA', {hour: '2-digit', minute:'2-digit'})}
                      </time>
                      <div className="text-sm font-bold text-text">{item.text}</div>
                      <div className="text-xs text-muted mt-1">{item.subtext}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
