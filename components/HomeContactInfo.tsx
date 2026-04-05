'use client'

import { useState, useEffect } from 'react'
import { Phone, MapPin } from 'lucide-react'

export function HomeContactInfo() {
  const [settings, setSettings] = useState({ clinic_phone: '', clinic_address: '' })

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

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-2xl mx-auto">
      <div className="card-glow flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
          <Phone className="w-6 h-6 text-gold" />
        </div>
        <div>
          <p className="text-sm text-muted">الهاتف</p>
          <p className="font-semibold text-text" dir="ltr">{settings.clinic_phone || '...'}</p>
        </div>
      </div>
      <div className="card-glow flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-teal" />
        </div>
        <div>
          <p className="text-sm text-muted">العنوان</p>
          <p className="font-semibold text-text">{settings.clinic_address || '...'}</p>
        </div>
      </div>
    </div>
  )
}
