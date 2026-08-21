'use client'

import { useState } from 'react'
import { Download, CheckCircle2, AlertTriangle, Info, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const GUIDES = [
  {
    id: 'pre-op',
    title: 'نصائح ما قبل العملية',
    description: 'كل ما تحتاج معرفته للاستعداد للعملية الجراحية بأمان.',
    icon: Info,
    color: 'teal',
    sections: [
      {
        title: 'الصيام قبل العملية',
        content: 'يجب التوقف عن الأكل والشرب تماماً قبل 8 ساعات من موعد العملية (بما في ذلك الماء والعلكة).',
        type: 'warning'
      },
      {
        title: 'الأدوية',
        content: 'أخبر الطبيب عن جميع الأدوية التي تتناولها، خاصة مسيلات الدم (Aspirin, Plavix) التي يجب توقيفها قبل 5-7 أيام.',
        type: 'info'
      },
      {
        title: 'الفحوصات المطلوبة',
        content: 'تأكد من إحضار جميع التحاليل المخبرية، تخطيط القلب، وأشعة الصدر في يوم العملية.',
        type: 'check'
      }
    ]
  },
  {
    id: 'post-op',
    title: 'نصائح ما بعد العملية',
    description: 'إرشادات التعافي السريع والعناية بالجروح بعد الجراحة.',
    icon: CheckCircle2,
    color: 'gold',
    sections: [
      {
        title: 'النشاط البدني',
        content: 'المشي الخفيف مطلوب من اليوم الأول لتجنب الجلطات، لكن تجنب حمل الأوزان الثقيلة لمدة 4-6 أسابيع.',
        type: 'info'
      },
      {
        title: 'النظام الغذائي',
        content: 'ابدأ بسوائل خفيفة ثم انتقل تدريجياً للأكل اللين حسب تعليمات الطبيب.',
        type: 'check'
      },
      {
        title: 'علامات الخطر',
        content: 'اتصل بالعيادة فوراً في حال حدوث حمى عالية، ألم شديد لا يستجيب للمسكنات، أو نزيف من الجرح.',
        type: 'warning'
      }
    ]
  }
]

export default function PatientGuidesPage() {
  const [activeTab, setActiveTab] = useState('pre-op')

  const activeGuide = GUIDES.find(g => g.id === activeTab) || GUIDES[0]

  if (!activeGuide) return null

  return (
    <div className="py-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-full bg-surface hover:bg-surface2 text-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-display text-text">دليل المريض</h1>
            <p className="text-muted text-sm">إرشادات طبية شاملة لسلامتك وتعافيك</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-surface rounded-2xl mb-8">
          {GUIDES.map(guide => (
            <button
              key={guide.id}
              onClick={() => setActiveTab(guide.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === guide.id
                  ? 'bg-navy-800 text-gold shadow-lg border border-white/5'
                  : 'text-muted hover:text-text'
              }`}
            >
              <guide.icon className="w-4 h-4" />
              {guide.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6 animate-fade-in">
          <div className="card border-gold/10">
            <h2 className="text-xl font-bold text-text mb-2">{activeGuide.title}</h2>
            <p className="text-muted mb-6">{activeGuide.description}</p>

            <div className="space-y-4">
              {activeGuide.sections.map((section, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-navy-900/50 border border-white/5 flex gap-4">
                  <div className="mt-1">
                    {section.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                    {section.type === 'info' && <Info className="w-5 h-5 text-teal" />}
                    {section.type === 'check' && <CheckCircle2 className="w-5 h-5 text-gold" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-text mb-1">{section.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{section.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-xs text-muted">
                * هذه التعليمات عامة، يرجى اتباع توجيهات الطبيب الخاصة بحالتك.
              </p>
              <button className="btn-secondary text-xs flex items-center gap-2 py-2">
                <Download className="w-4 h-4" />
                تحميل الدليل (PDF)
              </button>
            </div>
          </div>

          {/* Contact Card */}
          <div className="card bg-teal/5 border-teal/10 text-center py-8">
            <h3 className="font-bold text-text mb-2">هل لديك استفسار آخر؟</h3>
            <p className="text-sm text-muted mb-6">فريقنا الطبي متاح للإجابة على جميع تساؤلاتك</p>
            <div className="flex gap-4 justify-center">
              <Link href="/chat" className="btn-teal text-sm">💬 المحادثة الطبية</Link>
              <a href="tel:+213550000000" className="btn-secondary text-sm">📞 اتصل بنا</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
