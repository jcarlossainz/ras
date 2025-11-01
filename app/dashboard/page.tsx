'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TopBar from '@/components/ui/topbar'
import Card from '@/components/ui/card'
import Loading from '@/components/ui/loading'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setProfile(profileData)
      setLoading(false)
    } catch (error) {
      console.error('Error en checkUser:', error)
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  if (loading) {
    return <Loading message="Cargando dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title="Inicio"
        showAddButton={true}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* CATÁLOGO */}
          <Card 
            title="Catálogo"
            onClick={() => router.push('/dashboard/catalogo')}
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-red-50 to-red-100/30 border-2 border-red-200/50 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#e57373" opacity="0.7" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#64b5f6" opacity="0.7" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#fff176" opacity="0.7" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#81c784" opacity="0.7" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
              </div>
            }
          />

          {/* ANUNCIOS */}
          <Card 
            title="Anuncios"
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="18" rx="2" fill="#64b5f6" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M2 8h20M7 12h7M7 16h4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
            }
          />

          {/* TICKETS */}
          <Card 
            title="Tickets"
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-300 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8a2 2 0 0 1 2-2h8.5a1.5 1.5 0 0 0 0 3H21v6h-6.5a1.5 1.5 0 0 0 0 3H6a2 2 0 0 1-2-2V8Z" fill="#fdd835" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M9 8h3M9 12h6M9 16h4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
            }
          />

          {/* CALENDARIO */}
          <Card 
            title="Calendario"
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 border-2 border-purple-200 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" fill="#ba68c8" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M3 10h18M8 2v4M16 2v4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="8" cy="15" r="1" fill="white"/>
                  <circle cx="12" cy="15" r="1" fill="white"/>
                  <circle cx="16" cy="15" r="1" fill="white"/>
                </svg>
              </div>
            }
          />

          {/* DIRECTORIO */}
          <Card 
            title="Directorio"
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-200 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="3" width="14" height="18" rx="2" fill="#ff9800" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M19 7h2M19 12h2M19 17h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="11" cy="9" r="2" stroke="white" strokeWidth="1.4" fill="none"/>
                  <path d="M8 16a3 3 0 0 1 6 0" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
            }
          />

          {/* CUENTAS */}
          <Card 
            title="Cuentas"
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" fill="#81c784" stroke="currentColor" strokeWidth="1.6"/>
                  <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.6"/>
                </svg>
              </div>
            }
          />

        </div>
      </main>
    </div>
  )
}