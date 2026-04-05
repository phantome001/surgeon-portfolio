'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [settings, setSettings] = useState({
    clinic_phone: '',
    clinic_email: '',
    clinic_address: '',
    whatsapp_number: '',
  })

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
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center py-12 max-w-md w-full border-teal/20">
          <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-teal" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">تم إرسال رسالتك!</h2>
          <p className="text-muted">سنرد عليك في أقرب وقت ممكن</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-heading">📞 اتصل بنا</h1>
          <p className="section-subheading">يسعدنا تلقي استفساراتكم</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card-glow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted">الهاتف</p>
              <p className="font-semibold text-text" dir="ltr">{settings.clinic_phone || '...'}</p>
            </div>
          </div>
          <div className="card-glow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-teal" />
            </div>
            <div>
              <p className="text-sm text-muted">البريد الإلكتروني</p>
              <p className="font-semibold text-text text-sm" dir="ltr">{settings.clinic_email || '...'}</p>
            </div>
          </div>
          <div className="card-glow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted">العنوان</p>
              <p className="font-semibold text-text text-sm">{settings.clinic_address || '...'}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card border-gold/10">
            <h2 className="text-xl font-bold text-text mb-6">أرسل لنا رسالة</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">الاسم</label>
                  <input type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">البريد الإلكتروني</label>
                  <input type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field" dir="ltr" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">الموضوع</label>
                <input type="text" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">الرسالة</label>
                <textarea value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field min-h-[120px] resize-none" required />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4 rotate-180" />
                {loading ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

