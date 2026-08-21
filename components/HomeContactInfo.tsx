'use client'

import { useState, useEffect } from 'react'
import { Phone, MapPin } from 'lucide-react'

export function HomeContactInfo() {
  const [settings, setSettings] = useState({ 
    clinic_phone: '', 
    clinic_address: '',
    google_maps_embed: ''
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

  return (
    <div className="space-y-8 mt-8 max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
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

      {/* Google Maps Embed */}
      <div className="card-glow p-2 overflow-hidden aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-navy-800 border border-white/5">
        {settings.google_maps_embed ? (
          <iframe
            src={settings.google_maps_embed}
            className="w-full h-full rounded-xl grayscale invert opacity-80 contrast-125"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
            <MapPin className="w-8 h-8 opacity-20" />
            <p className="text-sm italic">خريطة العيادة ستظهر هنا</p>
          </div>
        )}
      </div>
    </div>
  )
}
