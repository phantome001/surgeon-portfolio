import { z } from 'zod'

export const appointmentSchema = z.object({
  fullName: z.string().min(2, 'الاسم مطلوب').max(100).trim()
    .regex(/^[\u0600-\u06FFa-zA-Z\s'\-]+$/),
  phone: z.string().min(8, 'رقم الهاتف مطلوب').max(20).regex(/^[\+]?[0-9\s\-]{8,20}$/, 'رقم هاتف غير صالح'),
  reason: z.string().min(5, 'سبب الزيارة مطلوب').max(500).trim(),
  date: z.string().date(),
  timeSlot: z.enum(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
