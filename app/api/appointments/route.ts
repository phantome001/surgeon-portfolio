import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { appointmentSchema } from '@/lib/validations/appointment'
import { encrypt, decrypt } from '@/lib/encryption'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const { data: profile } = await (adminClient
      .from('profiles') as any)
      .select('role')
      .eq('id', user.id)
      .single()

    let query = (adminClient
      .from('appointments') as any)
      .select('*')
      .order('date', { ascending: true })

    if (profile?.role !== 'doctor') {
      query = query.eq('user_id', user.id)
    }

    const { data: appointments, error } = await query

    if (error) throw error

    const decrypted = (appointments || []).map((apt: any) => ({
      id: apt.id,
      user_id: apt.user_id,
      date: apt.date,
      time_slot: apt.time_slot,
      full_name: safeDecrypt(apt.full_name_encrypted),
      phone: safeDecrypt(apt.phone_encrypted),
      reason: safeDecrypt(apt.reason_encrypted),
      status: apt.status,
      doctor_notes: apt.doctor_notes,
      created_at: apt.created_at,
    }))

    return NextResponse.json({ appointments: decrypted })
  } catch (error) {
    console.error('[APPOINTMENTS_GET]', error)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}


export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }

    const parsed = appointmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { fullName, phone, reason, date, timeSlot } = parsed.data

    // Use admin client to bypass RLS for all DB operations
    const adminClient = createAdminClient()

    // Check availability
    const { data: isAvailable } = await (adminClient as any).rpc('is_slot_available', {
      p_date: date,
      p_time_slot: timeSlot,
    })

    if (!isAvailable) {
      return NextResponse.json({ error: 'هذا الموعد محجوز بالفعل' }, { status: 409 })
    }

    const { data: appointment, error: insertError } = await (adminClient
      .from('appointments') as any)
      .insert({
        user_id: user.id,
        date,
        time_slot: timeSlot,
        full_name_encrypted: encrypt(fullName),
        phone_encrypted: encrypt(phone),
        reason_encrypted: encrypt(reason),
      })
      .select('id, status, date, time_slot')
      .single()

    if (insertError) throw insertError

    // Audit log
    if (appointment) {
      await (adminClient.from('audit_logs') as any).insert({
        user_id: user.id,
        action: 'appointment_created',
        metadata: { appointment_id: appointment.id, date, time_slot: timeSlot },
      })
    }

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('[APPOINTMENTS_POST]', error)
    return NextResponse.json({ error: 'خطأ داخلي في الخادم' }, { status: 500 })
  }
}


function safeDecrypt(value: string): string {
  try {
    return decrypt(value)
  } catch {
    return '[غير متاح]'
  }
}
