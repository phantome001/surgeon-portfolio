import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireDoctor } from '@/lib/security'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET: Fetch all settings (public)
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await (supabase
      .from('site_settings') as any)
      .select('key, value')

    if (error) throw error

    const settings: Record<string, string> = {}
    for (const row of (data || [])) {
      settings[row.key] = row.value
    }

    return NextResponse.json({ settings }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' }
    })
  } catch (error: any) {
    console.error('[SETTINGS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH: Update a setting (doctor only)
export async function PATCH(request: Request) {
  try {
    const auth = await requireDoctor()
    if ('response' in auth) return auth.response

    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await (supabase
      .from('site_settings') as any)
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[SETTINGS_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
