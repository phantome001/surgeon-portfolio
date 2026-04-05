import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح').max(254).toLowerCase().trim(),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جداً').max(100).trim()
    .regex(/^[\u0600-\u06FFa-zA-Z\s'\-]+$/, 'أحرف فقط'),
  email: z.string().email('بريد إلكتروني غير صالح').max(254).toLowerCase().trim(),
  phone: z.string().regex(/^(\+213|0)(5|6|7)[0-9]{8}$/, 'رقم هاتف جزائري غير صالح'),
  password: z.string().min(8, '8 أحرف على الأقل').max(128)
    .regex(/[A-Z]/, 'حرف كبير مطلوب')
    .regex(/[0-9]/, 'رقم مطلوب')
    .regex(/[^A-Za-z0-9]/, 'رمز خاص مطلوب'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
