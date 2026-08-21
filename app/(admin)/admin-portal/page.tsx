'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()

  // Check if already logged in
  useState(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'doctor' || profile?.role === 'admin') {
          router.push('/dashboard')
        }
      }
    }
    checkUser()
  })

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError || !authUser) {
        throw new Error('بيانات الدخول غير صحيحة')
      }

      // Check if user is admin or doctor
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()

      if (profileError || !profile || (profile.role !== 'doctor' && profile.role !== 'admin')) {
        await supabase.auth.signOut()
        throw new Error('عذراً، هذا المدخل مخصص للطبيب فقط')
      }

      toast.success('مرحباً بك دكتور، جاري توجيهك للوحة التحكم')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#0a0f18] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="mb-8 flex justify-start">
          <Link href="/" className="flex items-center gap-2 text-muted hover:text-gold transition-colors group">
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>العودة للموقع</span>
          </Link>
        </div>

        <div className="bg-surface border border-gold/20 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-6 border border-gold/20">
              <ShieldCheck className="w-10 h-10 text-gold" />
            </div>
            <h1 className="text-3xl font-bold font-display gold-gradient mb-2">بوابة الطبيب</h1>
            <p className="text-muted text-sm">منطقة وصول خاصة وحصرية للدكتور غنوش زين الدين</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">البريد الإلكتروني المهني</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-gold transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-900 border border-gold/10 rounded-2xl py-4 pr-12 pl-4 text-text focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                  placeholder="admin@docter.com"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-gold transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-900 border border-gold/10 rounded-2xl py-4 pr-12 pl-12 text-text focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gold hover:bg-gold-light text-navy-900 font-bold rounded-2xl shadow-lg shadow-gold/20 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'جاري التحقق من الصلاحيات...' : 'دخول لوحة التحكم'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gold/10 text-center">
            <p className="text-xs text-muted/50">
              هذا النظام مؤمن ومشفر بالكامل. أي محاولة دخول غير مصرح بها سيتم تسجيلها.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
