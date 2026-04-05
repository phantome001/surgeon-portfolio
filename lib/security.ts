import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Verify user is authenticated AND has 'doctor' role.
 * Returns { user, isDoctor: true } on success, or a 401/403 NextResponse on failure.
 */
export async function requireDoctor(): Promise<
  { user: any; isDoctor: true } | { response: NextResponse }
> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const adminClient = createAdminClient()
  const { data: profile } = await (adminClient
    .from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'doctor') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, isDoctor: true }
}

/**
 * Simple in-memory rate limiter.
 * Tracks requests per IP with a sliding window.
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60_000 // 1 minute
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    const entries = Array.from(rateLimitStore.entries())
    for (const [key, val] of entries) {
      if (now > val.resetTime) rateLimitStore.delete(key)
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  record.count++

  if (record.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: maxRequests - record.count }
}

/**
 * Get client IP from request headers (works on Vercel and locally)
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || '127.0.0.1'
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return '127.0.0.1'
}

/**
 * Sanitize user input - strip HTML tags and limit length
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .replace(/<[^>]*>/g, '')        // Strip HTML tags
    .replace(/javascript:/gi, '')    // Remove javascript: protocol
    .replace(/on\w+=/gi, '')        // Remove event handlers
    .trim()
    .slice(0, maxLength)
}
