import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic, Playfair_Display } from 'next/font/google'
import './globals.css'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { PWARegister } from '@/components/PWARegister'

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-ibm-plex-sans-arabic',
})

const playfairDisplay = Playfair_Display({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair-display',
})

export const metadata: Metadata = {
  title: 'د. غنوش زين الدين — جراح اختصاصي',
  description: 'المرافق الرقمي وخبير الجراحة المتطور للدكتور غنوش زين الدين — جراحة السمنة والمنظار.',
  keywords: ['جراح', 'أمراض الجهاز الهضمي', 'عمليات بالمنظار', 'حجز موعد', 'الجزائر'],
  authors: [{ name: 'د. غنوش زين الدين' }],
  openGraph: {
    title: 'د. غنوش زين الدين — جراح اختصاصي في أمراض الجهاز الهضمي',
    description: 'حجز المواعيد والاستشارات الطبية عبر الإنترنت',
    type: 'website',
    locale: 'ar_DZ',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0f1c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dr. Ganouche" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${ibmPlexSansArabic.className} ${ibmPlexSansArabic.variable} ${playfairDisplay.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        <WhatsAppButton />
        <AIAssistant />
        <PWARegister />
      </body>
    </html>
  )
}

