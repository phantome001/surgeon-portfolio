import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const profileRes: any = await (adminClient
      .from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileRes.data?.role !== 'doctor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let body: { status?: string }
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }

    if (!body.status || !['confirmed', 'cancelled', 'completed'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 422 })
    }

    const updateRes: any = await (adminClient
      .from('appointments') as any)
      .update({ status: body.status })
      .eq('id', params.id)
      .select('id, status')
      .single()

    if (updateRes.error) throw updateRes.error

    return NextResponse.json(updateRes.data)
  } catch (error) {
    console.error('[APPOINTMENT_PATCH]', error)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}

