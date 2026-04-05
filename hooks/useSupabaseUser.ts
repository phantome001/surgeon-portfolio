'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'

interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
}

export function useSupabaseUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const authUser = session?.user

      if (authUser) {
        // Set basic info first so UI isn't stuck
        setUser({
          id: authUser.id,
          email: authUser.email ?? '',
          name: authUser.email?.split('@')[0] ?? 'مستخدم',
          role: 'patient', // Default role
        })

        const { data: profile } = await (supabase
          .from('profiles') as any)
          .select('name, role')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          setUser({
            id: authUser.id,
            email: authUser.email ?? '',
            name: profile.name,
            role: profile.role,
          })
        }
      }

      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (session?.user) {
        const authUser = session.user
        
        // Update basic info immediately
        setUser(prev => ({
          id: authUser.id,
          email: authUser.email ?? '',
          name: prev?.name ?? authUser.email?.split('@')[0] ?? 'مستخدم',
          role: prev?.role ?? 'patient',
        }))

        const { data: profile } = await (supabase
          .from('profiles') as any)
          .select('name, role')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          setUser({
            id: authUser.id,
            email: authUser.email ?? '',
            name: profile.name,
            role: profile.role,
          })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading }
}
