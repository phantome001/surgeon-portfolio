import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    const { data: categories, error: catError } = await (supabase
      .from('video_categories') as any)
      .select('*, videos(count)')
      .order('sort_order')

    if (catError) throw catError

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('[VIDEOS_GET]', error)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}
