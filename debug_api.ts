import { createClient } from './lib/supabase/server'
import { decrypt } from './lib/encryption'

async function debug() {
  try {
    const supabase = createClient()
    const { data: convs, error } = await supabase
      .from('conversations')
      .select(`
        id, 
        patient_id, 
        ai_enabled,
        created_at
      `)
    
    if (error) {
      console.error('Supabase Error:', error)
      return
    }

    console.log('Fetched conversations:', convs?.length)
    
    for (const conv of (convs || [])) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', conv.patient_id)
        .single()
      
      console.log(`Conv ${conv.id} - Patient: ${profile?.name}`)
    }
  } catch (e) {
    console.error('Catch Error:', e)
  }
}

debug()
