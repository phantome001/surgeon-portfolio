import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  let initialUser = null
  if (authUser) {
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('name, role')
      .eq('id', authUser.id)
      .single()
    
    if (profile) {
      initialUser = {
        id: authUser.id,
        email: authUser.email ?? '',
        name: profile.name,
        role: profile.role,
      }
    }
  }

  return (
    <>
      <Navbar initialUser={initialUser} />
      <main className="flex-1">{children}</main>
    </>
  )
}
