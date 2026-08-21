'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

// Note on coordinates:
// x: % from left (viewer's left = patient's right)
// y: % from top
const bodyParts = [
  {
    id: 'thyroid',
    label: 'جراحة الغدة الدرقية',
    x: 50,
    y: 15,
    description: 'استئصال كُلّي أو جزئي للغدة الدرقية جراحياً مع الحفاظ الدقيق على الأحبال الصوتية باستخدام أحدث التقنيات، لضمان أعلى نسبة نجاح وأفضل نتيجة تجميلية للرقبة.',
    advice: 'يُنصح المريض بالراحة التامة لمدة 48 ساعة بعد العملية وتجنب المجهود العضلي الشديد للرقبة لمدة أسبوعين.'
  },
  {
    id: 'gallbladder',
    label: 'استئصال المرارة بالمنظار',
    x: 35, // Patient's right side (viewer's left)
    y: 40,
    description: 'جراحة متطورة لاستئصال الحصوات والمرارة عبر شقوق دقيقة جداً لا تتجاوز 1 سم (بالمنظار الكاميرا)، مما يقلل الألم ويسرّع العودة للحياة الطبيعية.',
    advice: 'يجب اتباع حمية قليلة الدهون لمدة شهر بعد العملية لمساعدة الجهاز الهضمي على التكيف مع غياب المرارة.'
  },
  {
    id: 'bariatric',
    label: 'جراحات السمنة (التكميم / تحويل المسار)',
    x: 50,
    y: 50,
    description: 'علاج السمنة المفرطة جراحياً بالمنظار (مثل تكميم المعدة Manga / Sleeve أو تحويل المسار)، لمساعدة المريض على إنقاص وزنه والتخلص من أمراض السكر والضغط.',
    advice: 'الالتزام بنظام السوائل في الأسبوعين الأولين ضروري جداً لضمان التئام جدار المعدة الجديد بأمان.'
  },
  {
    id: 'hernia',
    label: 'جراحات الفتق جدار البطن',
    x: 65, // Groin or lower abdomen
    y: 65,
    description: 'إصلاح دقيق لجميع أنواع الفتق (السري، الإربي، أو ما بعد الجراحة الأصيلة) باستخدام أحدث الشبكات الطبية لضمان عدم رجوع الفتق، سواء بالجراحة المفتوحة أو بالمنظار.',
    advice: 'تجنب حمل الأوزان الثقيلة (أكثر من 5 كغ) لمدة 6 أسابيع على الأقل لضمان ثبات الشبكة الطبية والتحام الأنسجة.'
  },
  {
    id: 'proctology',
    label: 'جراحات الشرج، البواسير والناسور',
    x: 50,
    y: 85,
    description: 'تشخيص وعلاج دقيق لجميع أمراض منطقة الشرج (البواسير، الناصور، الشق الشرجي) بأقل تدخل جراحي ممكن لتفادي الآلام وتسريع الاستشفاء البعدي.',
    advice: 'الإكثار من الألياف وشرب الماء بانتظام يمنع الإمساك، وهو العامل الأهم لنجاح العملية وعدم عودة البواسير.'
  }
]

export function InteractiveAnatomy() {
  const [activePart, setActivePart] = useState<string | null>(bodyParts[2]?.id || null)

  const activeInfo = bodyParts.find(p => p.id === activePart)

  return (
    <div className="w-full flex flex-col lg:flex-row items-center gap-12 mt-12 bg-surface-light/30 border border-surface2 p-6 md:p-12 rounded-3xl">
      
      {/* Interactive Graphic Side */}
      <div className="relative w-full max-w-sm mx-auto aspect-[3/4] flex-shrink-0">
        
        {/* Glow behind the body */}
        <div className="absolute inset-0 bg-gold/5 blur-[80px] rounded-full" />
        
        {/* Abstract Stylized Torso SVG */}
        <svg 
          viewBox="0 0 200 300" 
          className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Grid / Futuristic look inside body */}
          <path d="M50 80 Q 20 120 30 180 Q 40 250 50 280 L 150 280 Q 160 250 170 180 Q 180 120 150 80 Q 180 40 100 20 Q 20 40 50 80 Z" fill="rgba(8, 28, 48, 0.4)" stroke="#1a2f4c" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Main Body Silhouette */}
          <path d="M100 10 C 115 10 120 20 120 35 C 120 50 140 60 160 70 C 180 80 180 110 170 140 C 160 170 165 220 145 280 C 140 295 60 295 55 280 C 35 220 40 170 30 140 C 20 110 20 80 40 70 C 60 60 80 50 80 35 C 80 20 85 10 100 10 Z" fill="rgba(14, 165, 233, 0.05)" stroke="#0ea5e9" strokeWidth="1" />
          
          {/* Inner Accent Lines */}
          <path d="M100 35 L 100 280 M 60 100 Q 100 120 140 100 M 55 150 Q 100 170 145 150 M 50 200 Q 100 220 150 200" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="1" />
          
        </svg>

        {/* Hotspots */}
        {bodyParts.map((part) => {
          const isActive = activePart === part.id
          
          return (
            <button
              key={part.id}
              onClick={() => setActivePart(part.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group outline-none"
              style={{ left: `${part.x}%`, top: `${part.y}%` }}
              aria-label={part.label}
            >
              {/* Pulsing ring */}
              <div className={`absolute inset-0 bg-gold rounded-full ${isActive ? 'animate-ping opacity-50' : 'group-hover:animate-ping opacity-20'}`} />
              
              {/* Core dot */}
              <div className={`relative w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive ? 'border-gold bg-navy-900 scale-125' : 'border-teal bg-navy-900 group-hover:border-gold scale-100 z-10'}`}>
                {isActive && <div className="w-2 h-2 bg-gold rounded-full shadow-[0_0_8px_#c2a265]" />}
                {!isActive && <Plus className="w-3 h-3 text-teal group-hover:text-gold" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Info Content Side */}
      <div className="flex-1 text-center lg:text-right">
        {activeInfo ? (
          <div className="animate-fade-in bg-surface p-8 max-w-lg mx-auto lg:mx-0 rounded-2xl border border-surface2 relative overflow-hidden">
            {/* Accents */}
            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-gold to-transparent" />
            
            <h3 className="text-2xl font-bold font-display text-gold mb-4 relative z-10">
              {activeInfo?.label}
            </h3>
            <p className="text-muted text-base leading-relaxed relative z-10 mb-4">
              {activeInfo?.description}
            </p>
            {activeInfo?.advice && (
              <div className="bg-gold/10 border-r-4 border-gold p-4 rounded-l-xl relative z-10 animate-slide-in">
                <p className="text-sm font-bold text-gold mb-1">💡 نصيحة الدكتور للمريض:</p>
                <p className="text-sm text-text italic">{activeInfo.advice}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted italic">الرجاء اختيار منطقة من الجسم لمعرفة المزيد عن الجراحات المختصة.</div>
        )}
      </div>
      
    </div>
  )
}
