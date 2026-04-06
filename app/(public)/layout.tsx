import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { InstallPwaPrompt } from '@/components/InstallPwaPrompt'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <BottomNav />
      <InstallPwaPrompt />
    </>
  )
}
