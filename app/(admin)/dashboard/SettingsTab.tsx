'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Phone, MapPin, Mail, Building2, CheckCircle2, UserCircle, Star, HeartPulse, LineChart, ChevronDown, HelpCircle } from 'lucide-react'
import { FaqSettings } from './FaqSettings'

interface SiteSettings {
  whatsapp_number: string
  clinic_name: string
  clinic_address: string
  clinic_email: string
  clinic_phone: string
  google_maps_embed?: string
  doctor_name?: string
  doctor_specialty?: string
  doctor_description?: string
  stat_experience?: string
  stat_operations?: string
  stat_patients?: string
}

const FIELDS = [
  { key: 'whatsapp_number', label: 'رقم واتساب', icon: Phone, placeholder: '+213555123456', dir: 'ltr' },
  { key: 'clinic_phone', label: 'رقم الهاتف', icon: Phone, placeholder: '+213555123456', dir: 'ltr' },
  { key: 'clinic_name', label: 'اسم العيادة', icon: Building2, placeholder: 'عيادة الجراحة العامة', dir: 'rtl' },
  { key: 'clinic_email', label: 'البريد الإلكتروني', icon: Mail, placeholder: 'contact@dr-ghanoush.dz', dir: 'ltr' },
  { key: 'clinic_address', label: 'عنوان العيادة', icon: MapPin, placeholder: 'حيدرة، الجزائر العاصمة', dir: 'rtl' },
  { key: 'google_maps_embed', label: 'رابط خريطة جوجل (Embed)', icon: MapPin, placeholder: 'https://www.google.com/maps/embed?...', dir: 'ltr' },
] as const

const PROFILE_FIELDS = [
  { key: 'doctor_name', label: 'اسم الطبيب', icon: UserCircle, placeholder: 'د. غنوش زين الدين', dir: 'rtl' },
  { key: 'doctor_specialty', label: 'التخصص الدقيق', icon: Star, placeholder: 'جراح اختصاصي في أمراض الجهاز الهضمي', dir: 'rtl' },
  { key: 'doctor_description', label: 'النبذة التعريفية (تظهر في الواجهة)', icon: HeartPulse, placeholder: 'خبرة تزيد عن 15 سنة في الجراحة...', dir: 'rtl', isTextarea: true },
] as const

const STATS_FIELDS = [
  { key: 'stat_experience', label: 'سنوات الخبرة', icon: LineChart, placeholder: '+15', dir: 'ltr' },
  { key: 'stat_operations', label: 'عدد العمليات', icon: LineChart, placeholder: '+5000', dir: 'ltr' },
  { key: 'stat_patients', label: 'عدد المرضى', icon: LineChart, placeholder: '+10000', dir: 'ltr' },
] as const

interface CollapsibleSectionProps {
  id: string
  title: string
  icon: any
  isOpen: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
  accentColor?: string
}

function CollapsibleSection({ id, title, icon: Icon, isOpen, onToggle, children, accentColor = 'gold' }: CollapsibleSectionProps) {
  return (
    <div className={`card overflow-hidden transition-all duration-500 border-l-2 ${isOpen ? `shadow-glow border-${accentColor}` : 'hover:bg-surface2/50 border-transparent'}`}>
      <button
        onClick={() => onToggle(id)}
        className="w-full px-6 py-5 flex items-center justify-between group transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isOpen ? `bg-${accentColor}/20` : 'bg-surface2 group-hover:bg-surface'}`}>
            <Icon className={`w-6 h-6 transition-colors ${isOpen ? `text-${accentColor}` : 'text-muted group-hover:text-gold'}`} />
          </div>
          <div className="text-right">
            <h3 className={`font-bold transition-colors ${isOpen ? 'text-text' : 'text-muted'}`}>{title}</h3>
            {isOpen && <p className="text-[10px] text-gold/60 animate-fade-in">تعديل البيانات النشطة</p>}
          </div>
        </div>
        <div className={`p-2 rounded-full transition-all duration-500 ${isOpen ? 'bg-gold/10 rotate-180' : 'bg-surface2 group-hover:bg-gold/10'}`}>
          <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-gold' : 'text-muted'}`} />
        </div>
      </button>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-6 pb-8 pt-2 border-t border-surface2/50 animate-slide-up-subtle">
          {children}
        </div>
      </div>
    </div>
  )
}

export function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp_number: '',
    clinic_name: '',
    clinic_address: '',
    clinic_email: '',
    clinic_phone: '',
    doctor_name: '',
    doctor_specialty: '',
    doctor_description: '',
    stat_experience: '',
    stat_operations: '',
    stat_patients: '',
    google_maps_embed: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>('whatsapp')

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id)
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setSettings(prev => ({ ...prev, ...data.settings }))
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async (key: string) => {
    setSaving(key)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key as keyof SiteSettings] })
      })
      if (res.ok) {
        setSaved(key)
        setTimeout(() => setSaved(null), 2000)
      }
    } catch (e) {
      console.error('Failed to save:', e)
    }
    setSaving(null)
  }

  const handleSaveAll = async () => {
    setSaving('all')
    for (const field of FIELDS) {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: field.key, value: settings[field.key as keyof SiteSettings] })
      })
    }
    setSaved('all')
    setTimeout(() => setSaved(null), 2000)
    setSaving(null)
  }

  if (loading) return <div className="py-20 text-center text-gold italic">جاري تحميل الإعدادات...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-text flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold" />
            إعدادات الموقع
          </h2>
          <p className="text-sm text-muted mt-1">قم بتحديث بياناتك هنا وستتغير تلقائياً في جميع صفحات الموقع</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving === 'all'}
          className="btn-primary py-2 px-5 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {saved === 'all' ? (
            <><CheckCircle2 className="w-4 h-4" /> تم الحفظ</>
          ) : (
            <><Save className="w-4 h-4" /> {saving === 'all' ? 'جاري الحفظ...' : 'حفظ الكل'}</>
          )}
        </button>
      </div>

      <CollapsibleSection
        id="whatsapp"
        title="رقم واتساب العيادة"
        icon={Phone}
        isOpen={activeSection === 'whatsapp'}
        onToggle={toggleSection}
        accentColor="green-500"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted mb-1">هذا الرقم يظهر في زر واتساب العائم على كل الصفحات ليتمكن المرضى من مراسلتك السریعة.</p>
          <div className="flex gap-2">
            <input
              type="tel"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              className="input-field flex-1 text-sm font-mono ltr text-right"
              dir="ltr"
              placeholder="+213555123456"
            />
            <button
              onClick={() => handleSave('whatsapp_number')}
              disabled={saving === 'whatsapp_number'}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
                saved === 'whatsapp_number'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-surface text-text hover:bg-surface2 border border-surface'
              }`}
            >
              {saved === 'whatsapp_number' ? <><CheckCircle2 className="w-4 h-4" /> تم</> : <><Save className="w-4 h-4" /> حفظ</>}
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="clinic"
        title="معلومات العيادة العامة"
        icon={Building2}
        isOpen={activeSection === 'clinic'}
        onToggle={toggleSection}
      >
        <div className="space-y-6">
          {FIELDS.filter(f => f.key !== 'whatsapp_number').map((field) => {
            const Icon = field.icon
            return (
              <div key={field.key}>
                <label className="block text-sm text-muted mb-1.5 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {field.label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings[field.key as keyof SiteSettings] || ''}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    className="input-field flex-1 text-sm"
                    dir={field.dir}
                    placeholder={field.placeholder}
                  />
                  <button
                    onClick={() => handleSave(field.key)}
                    disabled={saving === field.key}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 shrink-0 ${
                      saved === field.key
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-surface text-text hover:bg-surface2 border border-surface'
                    }`}
                  >
                    {saved === field.key ? <><CheckCircle2 className="w-4 h-4" /> تم</> : <><Save className="w-4 h-4" /> حفظ</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="profile"
        title="الملف الشخصي (الواجهة)"
        icon={UserCircle}
        isOpen={activeSection === 'profile'}
        onToggle={toggleSection}
      >
        <div className="space-y-6">
          {PROFILE_FIELDS.map((field) => {
            const Icon = field.icon
            return (
              <div key={field.key}>
                <label className="block text-sm text-muted mb-1.5 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {field.label}
                </label>
                <div className="flex gap-2">
                  {('isTextarea' in field && field.isTextarea) ? (
                    <textarea
                      value={settings[field.key as keyof SiteSettings] || ''}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                      className="input-field flex-1 text-sm h-24 resize-none"
                      dir={field.dir}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      type="text"
                      value={settings[field.key as keyof SiteSettings] || ''}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                      className="input-field flex-1 text-sm"
                      dir={field.dir}
                      placeholder={field.placeholder}
                    />
                  )}
                  <button
                    onClick={() => handleSave(field.key)}
                    disabled={saving === field.key}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 shrink-0 h-fit ${
                      saved === field.key
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-surface text-text hover:bg-surface2 border border-surface'
                    }`}
                  >
                    {saved === field.key ? <><CheckCircle2 className="w-4 h-4" /> تم</> : <><Save className="w-4 h-4" /> حفظ</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="stats"
        title="أرقام وإحصائيات النجاح"
        icon={LineChart}
        isOpen={activeSection === 'stats'}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATS_FIELDS.map((field) => {
            const Icon = field.icon
            return (
              <div key={field.key} className="bg-surface-light border border-surface2 p-4 rounded-xl">
                <label className="block text-xs text-muted mb-2 flex items-center justify-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {field.label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings[field.key as keyof SiteSettings] || ''}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    className="input-field flex-1 text-center font-bold text-lg font-display"
                    dir={field.dir}
                    placeholder={field.placeholder}
                  />
                  <button
                    onClick={() => handleSave(field.key)}
                    disabled={saving === field.key}
                    className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 ${
                      saved === field.key
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-surface text-text hover:bg-surface2'
                    }`}
                  >
                    {saved === field.key ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="faq"
        title="الأسئلة الشائعة (FAQ)"
        icon={HelpCircle}
        isOpen={activeSection === 'faq'}
        onToggle={toggleSection}
      >
        <FaqSettings />
      </CollapsibleSection>
    </div>
  )
}
