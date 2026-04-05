'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Check, X } from 'lucide-react'
import { registerSchema } from '@/lib/validations/auth'

export default function RegisterPage() {
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: [] }))
    setError('')
  }

  const passwordChecks = [
    { label: '8 أحرف على الأقل', valid: formData.password.length >= 8 },
    { label: 'حرف كبير', valid: /[A-Z]/.test(formData.password) },
    { label: 'رقم واحد', valid: /[0-9]/.test(formData.password) },
    { label: 'رمز خاص', valid: /[^A-Za-z0-9]/.test(formData.password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const parsed = registerSchema.safeParse(formData)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: {
          name: formData.name.trim(),
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('هذا البريد الإلكتروني مسجل بالفعل')
      } else {
        setError('حدث خطأ أثناء إنشاء الحساب')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="card text-center py-10 border-teal/20">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-teal" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">تم إنشاء الحساب بنجاح!</h1>
            <p className="text-muted">
              تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك لتفعيل حسابك.
            </p>
            <Link href="/login" className="btn-primary inline-block mt-6">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card border-gold/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-2xl font-bold font-display gold-gradient">إنشاء حساب جديد</h1>
            <p className="text-muted mt-2 text-sm">سجل كمريض جديد</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="input-field pr-10" placeholder="محمد أحمد" required />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="input-field pr-10" placeholder="example@email.com" dir="ltr" required />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">رقم الهاتف (جزائري)</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="input-field pr-10" placeholder="+213 555 123 456" dir="ltr" required />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  className="input-field pr-10 pl-10" placeholder="••••••••" dir="ltr" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password strength */}
            {formData.password && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-navy-700 rounded-xl">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-1.5 text-xs">
                    {check.valid ? (
                      <Check className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    )}
                    <span className={check.valid ? 'text-teal' : 'text-muted'}>{check.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input type="password" name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                  className="input-field pr-10" placeholder="••••••••" dir="ltr" required />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword[0]}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary disabled:opacity-50">
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-gold hover:text-gold-light font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
