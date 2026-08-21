import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic, Playfair_Display } from 'next/font/google'
import './globals.css'
import { PWARegister } from '@/components/PWARegister'
import { Toaster } from 'react-hot-toast'
import ClientLayout from '@/components/layout/ClientLayout'

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
  title: 'د. غنوش زين الدين — جراح اختصاصي في أمراض الجهاز الهضمي والسمنة',
  description: 'الموقع الرسمي للدكتور غنوش زين الدين بجاية الجزائر. متخصص في جراحة السمنة، المنظار، والجراحة العامة. احجز موعدك الآن واستشر خبير الجراحة.',
  keywords: [
    'دكتور غنوش زين الدين', 
    'جراح في الجزائر', 
    'جراحة السمنة الجزائر', 
    'تكميم المعدة الجزائر', 
    'جراحة المنظار بجاية', 
    'أفضل جراح جهاز هضمي الجزائر',
    'المرارة بالمنظار',
    'الفتق بالمنظار',
    'حجز موعد طبيب جراح'
  ],
  authors: [{ name: 'د. غنوش زين الدين' }],
  openGraph: {
    title: 'د. غنوش زين الدين — جراح اختصاصي في أمراض الجهاز الهضمي والسمنة',
    description: 'جراحة السمنة والمنظار بأحدث التقنيات العالمية في الجزائر.',
    type: 'website',
    locale: 'ar_DZ',
    siteName: 'د. غنوش زين الدين',
  },
  robots: { 
    index: true, 
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-placeholder',
  },
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
        <ClientLayout>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ClientLayout>
        <PWARegister />
        <Toaster position="bottom-left" reverseOrder={false} />
      </body>
    </html>
  )
}
