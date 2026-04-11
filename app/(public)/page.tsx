import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Award, Building2, GraduationCap, Sparkles, Heart, Users, Calendar } from 'lucide-react'
import { HomeContactInfo } from '@/components/HomeContactInfo'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { InteractiveAnatomy } from '@/components/InteractiveAnatomy'
import { FAQSection } from '@/components/FAQSection'



const credentials = [
  { title: 'دكتوراه في الطب', institution: 'جامعة الجزائر', year: '2008', icon: GraduationCap },
  { title: 'تخصص جراحة عامة', institution: 'مستشفى مصطفى باشا', year: '2013', icon: Award },
  { title: 'تخصص فرعي — جراحة الجهاز الهضمي', institution: 'CHU Mustapha', year: '2016', icon: Sparkles },
]

const hospitals = [
  { name: 'المستشفى الجامعي مصطفى باشا', role: 'جراح رئيسي' },
  { name: 'عيادة خاصة — حيدرة', role: 'مدير العيادة' },
  { name: 'مستشفى بني مسوس', role: 'استشاري جراحة' },
]

export default async function HomePage() {
  const supabase = createClient()
  const { data: faqs } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true })
  
  // Fetch site settings
  const { data: settingsData } = await supabase.from('site_settings').select('key, value')
  const settings: Record<string, string> = {}
  if (settingsData) {
    settingsData.forEach((row: { key: string, value: string }) => {
      settings[row.key] = row.value
    })
  }

  const dynamicStats = [
    { value: settings.stat_experience || '+15', label: 'سنة خبرة', icon: Calendar },
    { value: settings.stat_operations || '+5000', label: 'عملية ناجحة', icon: Heart },
    { value: settings.stat_patients || '+10000', label: 'مريض', icon: Users },
  ]



  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[600px] flex items-center justify-center">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Overlays for readability and blending */}
          <div className="absolute inset-0 bg-navy-900/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/80 to-transparent" />
        </div>

        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent z-0 pointer-events-none" />
        <div className="absolute top-20 -right-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl z-0 pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-72 h-72 bg-teal/10 rounded-full blur-3xl z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8">
          {/* Avatar */}
          <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-gold to-gold-light p-1 mb-6 animate-pulse-gold">
            <div className="w-full h-full rounded-full bg-navy-800 flex items-center justify-center">
              <span className="text-3xl font-display font-bold text-gold">G.Z.</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-display mb-4 animate-fade-in">
            <span className="gold-gradient">{settings.doctor_name || 'د. غنوش زين الدين'}</span>
          </h1>

          <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-full px-4 py-2 mb-6 animate-fade-in stagger-1">
            <Sparkles className="w-4 h-4 text-teal" />
            <span className="text-teal text-sm font-medium">
              {settings.doctor_specialty || 'جراح اختصاصي في أمراض الجهاز الهضمي'}
            </span>
          </div>

          <p className="text-muted text-lg max-w-2xl mx-auto mb-10 animate-fade-in stagger-2">
            {settings.doctor_description || 'خبرة تزيد عن 15 سنة في الجراحة بالمنظار والجراحة العامة. نلتزم بتقديم أفضل رعاية طبية لمرضانا بأحدث التقنيات الجراحية.'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto mb-10 animate-fade-in stagger-3">
            {dynamicStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="w-5 h-5 text-gold mx-auto mb-1" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gold font-display">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-4">
            <Link href="/appointments" className="btn-primary text-base">
              📅 حجز موعد
            </Link>
            <Link href="/videos" className="btn-secondary text-base">
              🎬 مشاهدة الفيديوهات
            </Link>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center">الشهادات والمؤهلات</h2>
          <p className="section-subheading text-center">تدريب أكاديمي ومهني على أعلى مستوى</p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {credentials.map((cred, i) => {
              const Icon = cred.icon
              return (
                <div key={cred.title} className={`card-glow animate-slide-up stagger-${i + 1}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text mb-1">{cred.title}</h3>
                      <p className="text-sm text-muted mb-2">{cred.institution}</p>
                      <span className="inline-block text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">
                        {cred.year}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Hospitals Section */}
      <section className="py-16 md:py-24 bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center">أماكن العمل</h2>
          <p className="section-subheading text-center">أمارس الجراحة في المؤسسات التالية</p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {hospitals.map((h) => (
              <div key={h.name} className="card-glow flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{h.name}</h3>
                  <span className="text-xs text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                    {h.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Anatomy Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center">دليل العمليات الجراحية</h2>
          <p className="section-subheading text-center">اضغط على النقاط المضيئة لمعرفة المزيد عن تخصصاتنا الدقيقة</p>
          
          <InteractiveAnatomy />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-navy-800/50">
        {/* Background glow for testimonials */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center">آراء المرضى</h2>
          <p className="section-subheading text-center">نفخر بثقة مرضانا ونسعى دائماً لتقديم أفضل رعاية</p>
          
          <TestimonialsSection />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="section-heading text-center">الأسئلة الشائعة</h2>
          <p className="section-subheading text-center mb-8">إجابات سريعة لأكثر استفسارات المرضى شيوعاً</p>
          
          <FAQSection faqs={faqs || []} />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center">تواصل معنا</h2>
          <HomeContactInfo />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-gold/10 via-gold/5 to-teal/10 border-t border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display mb-4 gold-gradient">هل تحتاج استشارة طبية؟</h2>
          <p className="text-muted mb-8">احجز موعدك الآن أو تواصل معنا مباشرة عبر المحادثة</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary">إنشاء حساب مريض</Link>
            <Link href="/contact" className="btn-secondary">اتصل بالعيادة</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} د. غنوش زين الدين — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  )
}
