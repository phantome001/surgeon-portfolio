import { createAdminClient } from '@/lib/supabase/server'
import type { AuditAction } from '@/types/database'

interface AuditLogInput {
  userId: string | null
  action: AuditAction
  ipAddress?: string | null
  userAgent?: string | null
  metadata?: any
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const adminClient = createAdminClient()
    await (adminClient.from('audit_logs') as any).insert({
      user_id: input.userId,
      action: input.action,
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
      metadata: input.metadata as any,
    })
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error)
  }
}
