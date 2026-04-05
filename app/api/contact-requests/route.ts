import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Auth check
    const authSupabase = createClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient()

    const { data, error } = await (supabase
      .from('contact_requests') as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ requests: data || [] })
  } catch (error: any) {
    console.error('[CONTACT_REQUESTS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    // Auth check
    const authSupabase = createClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    // Use admin client to bypass RLS
    const supabase = createAdminClient()

    const { error } = await (supabase
      .from('contact_requests') as any)
      .update({ status })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[CONTACT_REQUESTS_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const authSupabase = createClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const supabase = createAdminClient()

    if (id === 'all') {
      // Delete all
      const { error } = await (supabase
        .from('contact_requests') as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // deletes everything
    
      if (error) throw error
    } else if (id) {
      // Delete single
      const { error } = await (supabase
        .from('contact_requests') as any)
        .delete()
        .eq('id', id)

      if (error) throw error
    } else {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[CONTACT_REQUESTS_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
