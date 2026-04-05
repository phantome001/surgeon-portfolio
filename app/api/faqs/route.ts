import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createAdminClient()
  try {
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('Failed to fetch faqs:', error)
    return NextResponse.json({ error: 'Failed to fetch faqs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createAdminClient()
  try {
    const { question, answer, sort_order } = await request.json()
    const { data, error } = await supabase
      .from('faqs')
      .insert([{ question, answer, sort_order }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error creating active faq:', error)
    return NextResponse.json({ error: 'Failed to create faq' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = createAdminClient()
  try {
    const { id, ...updates } = await request.json()
    const { error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating active faq:', error)
    return NextResponse.json({ error: 'Failed to update faq' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}
