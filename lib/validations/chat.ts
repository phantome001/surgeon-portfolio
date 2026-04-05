import { z } from 'zod'

export const messageSchema = z.object({
  content: z.string().min(1, 'الرسالة فارغة').max(1000).trim(),
  conversationId: z.string().uuid('معرف محادثة غير صالح'),
})

export type MessageInput = z.infer<typeof messageSchema>
