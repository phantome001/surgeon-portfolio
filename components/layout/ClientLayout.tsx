'use client'

import { usePathname } from 'next/navigation'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { AIAssistant } from '@/components/ai/AIAssistant'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide AI and WhatsApp buttons on login and dashboard pages
  const hideWidgets = pathname === '/login' || pathname?.startsWith('/dashboard')

  return (
    <>
      {children}
      {!hideWidgets && (
        <>
          <WhatsAppButton />
          <AIAssistant />
        </>
      )}
    </>
  )
}
