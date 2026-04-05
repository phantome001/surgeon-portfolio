import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireDoctor, rateLimit, getClientIP, sanitizeInput } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET: Public sees published only. Admin mode requires doctor auth.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdminMode = searchParams.get('admin') === 'true'

    // CVE-05 FIX: Admin mode now requires doctor authentication
    if (isAdminMode) {
      const auth = await requireDoctor()
      if ('response' in auth) return auth.response
    }

    const supabase = createAdminClient()
    let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false })

    if (!isAdminMode) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ testimonials: data || [] }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    })
  } catch (error: any) {
    console.error('[TESTIMONIALS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Add a testimonial (rate limited, sanitized)
export async function POST(request: Request) {
  try {
    // Rate limit: 3 testimonials per minute per IP
    const ip = getClientIP(request)
    const limit = rateLimit(`testimonial:${ip}`, 3, 60_000)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'طلبات كثيرة. حاول لاحقاً.' }, { status: 429 })
    }

    const body = await request.json()
    const { patient_name, content, rating, is_published } = body

    if (!patient_name || !content || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Sanitize inputs
    const cleanName = sanitizeInput(patient_name, 100)
    const cleanContent = sanitizeInput(content, 2000)

    let publishStatus = false
    if (is_published === true) {
      const auth = await requireDoctor()
      if (!('response' in auth)) publishStatus = true
    }

    const supabase = createAdminClient()
    const { data, error } = await (supabase.from('testimonials') as any)
      .insert({ patient_name: cleanName, content: cleanContent, rating: Math.min(5, Math.max(1, parseInt(rating))), is_published: publishStatus })
      .select().single()

    if (error) throw error
    return NextResponse.json({ success: true, testimonial: data })
  } catch (error: any) {
    console.error('[TESTIMONIALS_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH: Update publish status (doctor only)
export async function PATCH(request: Request) {
  try {
    const auth = await requireDoctor()
    if ('response' in auth) return auth.response

    const body = await request.json()
    const { id, is_published } = body

    if (!id || typeof is_published !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await (supabase.from('testimonials') as any).update({ is_published }).eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[TESTIMONIALS_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Remove a testimonial (doctor only)
export async function DELETE(request: Request) {
  try {
    const auth = await requireDoctor()
    if ('response' in auth) return auth.response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await (supabase.from('testimonials') as any).delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[TESTIMONIALS_DELETE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
