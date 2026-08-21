'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const successUrl = searchParams.get('callbackUrl')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const supabase = getSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError || !authUser) {
      if (authError?.message.includes('Invalid login')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else if (authError?.message.includes('Email not confirmed')) {
        setError('يرجى تأكيد بريدك الإلكتروني أولاً')
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول')
      }
      setLoading(false)
      return
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    const isDoctor = profile?.role === 'doctor' || profile?.role === 'admin'

    if (isAdminMode && !isDoctor) {
      toast.error('عذراً، هذا الحساب ليس له صلاحيات دخول الطبيب.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (!isAdminMode && isDoctor) {
      toast.success('مرحباً دكتور! تم توجيهك للوحة التحكم.')
      router.push('/dashboard')
      router.refresh()
      return
    }

    const targetUrl = isDoctor ? '/dashboard' : (successUrl || '/chat')
    
    router.push(targetUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-navy-900">
      <div className="w-full max-w-md">
        <div className="card border-gold/10">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl ${isAdminMode ? 'bg-red-500/10' : 'bg-gold/10'} flex items-center justify-center mx-auto mb-4 transition-colors duration-300`}>
              {isAdminMode ? <ShieldCheck className="w-8 h-8 text-red-500" /> : <LogIn className="w-8 h-8 text-gold" />}
            </div>
            <h1 className="text-2xl font-bold font-display gold-gradient">
              {isAdminMode ? 'بوابة دخول الطبيب' : 'تسجيل الدخول'}
            </h1>
            <p className="text-muted mt-2 text-sm">
              {isAdminMode ? 'يرجى إدخال بيانات المسؤول للوصول للوحة التحكم' : 'أدخل بياناتك للوصول إلى حسابك'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pr-10"
                  placeholder="example@email.com"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10 pl-10"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary ${isAdminMode ? 'bg-red-600 hover:bg-red-700' : ''} disabled:opacity-50 transition-colors duration-300`}
            >
              {loading ? 'جارٍ التحقق...' : (isAdminMode ? 'دخول المسؤول' : 'تسجيل الدخول')}
            </button>

            <div className="pt-4 border-t border-gold/5 text-center">
              <button
                type="button"
                onClick={() => setIsAdminMode(!isAdminMode)}
                className="text-sm text-gold hover:underline"
              >
                {isAdminMode ? 'العودة لتسجيل دخول المرضى' : 'هل أنت الطبيب؟ ادخل من هنا'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-navy-900 text-gold">جاري التحميل...</div>}>
      <LoginForm />
    </Suspense>
  )
}
