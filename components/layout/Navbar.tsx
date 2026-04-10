'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Stethoscope, LogOut, LayoutDashboard, Home, Camera, Video, Phone, UserPlus, LogIn } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

interface NavbarProps {
  initialUser?: {
    id: string
    email: string
    name: string
    role: string
  } | null
}

export function Navbar({ initialUser }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { user: clientUser } = useSupabaseUser()
  const user = clientUser || initialUser
  const supabase = getSupabaseClient()

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const navItems = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/gallery', label: 'الحالات', icon: Camera },
    { href: '/videos', label: 'الفيديوهات', icon: Video },
    { href: '/contact', label: 'اتصل بنا', icon: Phone },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-900/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Right: Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20 transition-transform group-hover:rotate-12">
                  <Stethoscope className="w-5 h-5 text-navy-900" />
                </div>
                <span className="text-xl font-bold text-gold font-display tracking-tight">
                  د. غنوش زين الدين
                </span>
              </Link>

              {/* Desktop Center Links */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'text-gold bg-gold/10'
                        : 'text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Left: Auth / User Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3 bg-white/5 p-1.5 pr-4 rounded-2xl border border-white/10">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted uppercase tracking-widest font-bold">مرحباً دكتور</span>
                    <span className="text-xs font-semibold text-text truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <div className="w-px h-8 bg-white/10 mx-1" />
                  <div className="flex items-center gap-2">
                    <Link 
                      href="/dashboard" 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                        pathname === '/dashboard' 
                          ? 'bg-gold text-navy-900' 
                          : 'bg-white/5 text-gold hover:bg-white/10'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      لوحة التحكم
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2.5 text-muted hover:text-red-400 hover:bg-red-500/10 transition-all rounded-xl"
                      title="تسجيل الخروج"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden relative w-11 h-11 flex items-center justify-center rounded-xl text-gold bg-white/5 border border-white/10 active:scale-90 transition-all duration-200"
              aria-label="القائمة"
            >
              <span className={`absolute transition-all duration-300 ${open ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}>
                <Menu className="w-5 h-5" />
              </span>
              <span className={`absolute transition-all duration-300 ${open ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}>
                <X className="w-5 h-5" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ===== MOBILE DRAWER OVERLAY ===== */}
      <div 
        className={`md:hidden fixed inset-0 z-[60] transition-all duration-300 ${open ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        
        {/* Drawer Panel - slides from right (RTL) */}
        <div 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-navy-900 border-l border-white/10 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="px-5 pt-6 pb-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20">
                <Stethoscope className="w-6 h-6 text-navy-900" />
              </div>
              <div>
                <p className="text-lg font-bold text-gold font-display">د. غنوش زين الدين</p>
                <p className="text-xs text-muted">جراح اختصاصي</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="px-3 py-4 space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-navy-900 bg-gradient-to-l from-gold to-gold-light shadow-md shadow-gold/20'
                      : 'text-muted hover:text-text hover:bg-white/5'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-navy-900/20' : 'bg-white/5'
                  }`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Separator */}
          <div className="mx-5 h-px bg-white/5" />

          {/* Auth Section */}
          <div className="px-3 py-4">
            {user ? (
              <div className="space-y-1">
                {/* User Info */}
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 mb-3">
                  <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">مرحباً دكتور</p>
                  <p className="text-sm font-semibold text-text truncate">{user.email}</p>
                </div>
                
                <Link 
                  href="/dashboard" 
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/dashboard'
                      ? 'text-navy-900 bg-gradient-to-l from-gold to-gold-light shadow-md shadow-gold/20'
                      : 'text-gold hover:bg-gold/10'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    pathname === '/dashboard' ? 'bg-navy-900/20' : 'bg-gold/10'
                  }`}>
                    <LayoutDashboard className="w-[18px] h-[18px]" />
                  </div>
                  لوحة التحكم
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500/10">
                    <LogOut className="w-[18px] h-[18px]" />
                  </div>
                  تسجيل الخروج
                </button>
              </div>
              ) : null}
          </div>

          {/* Bottom Branding */}
          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-white/5">
            <p className="text-[11px] text-center text-muted/50">
              © 2024 عيادة د. غنوش زين الدين — لنتألق معاً بصحة وحياة أفضل       </p>
          </div>
        </div>
      </div>
    </>
  )
}
