import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireDoctor } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: Fetch all published gallery cases (public)
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await (supabase
      .from('gallery_cases') as any)
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ cases: data || [] }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    })
  } catch (error: any) {
    console.error('[GALLERY_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Add a new gallery case (doctor only)
export async function POST(request: Request) {
  try {
    const auth = await requireDoctor()
    if ('response' in auth) return auth.response

    const body = await request.json()
    const { title, description, category, before_image_url, after_image_url } = body

    if (!title || !before_image_url || !after_image_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await (supabase
      .from('gallery_cases') as any)
      .insert({ title, description: description || '', category: category || 'general', before_image_url, after_image_url })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, case: data })
  } catch (error: any) {
    console.error('[GALLERY_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Remove a gallery case (doctor only)
export async function DELETE(request: Request) {
  try {
    const auth = await requireDoctor()
    if ('response' in auth) return auth.response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await (supabase.from('gallery_cases') as any).delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[GALLERY_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
