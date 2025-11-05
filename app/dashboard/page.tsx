'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/Lib/supabase/client'
import { logger } from '@/Lib/logger'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/components/ui/confirm-modal'
import TopBar from '@/components/ui/topbar'
import Card from '@/components/ui/card'
import Loading from '@/components/ui/loading'

export default function DashboardPage() {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
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
      logger.error('Error en checkUser:', error)
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    const confirmed = await confirm.warning(
      '¿Estás seguro que deseas cerrar sesión?',
      'Se cerrará tu sesión actual'
    )
    
    if (!confirmed) return

    try {
      await supabase.auth.signOut()
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
    } catch (error: any) {
      logger.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  if (loading) {
    return <Loading message="Cargando dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title="Inicio"
        showAddButton={false}
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
              <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-ras-crema to-white border-2 border-ras-crema/50 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#4285F4" opacity="0.8" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#EA4335" opacity="0.8" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#FBBC04" opacity="0.8" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#34A853" opacity="0.8" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
              </div>
            }
          />

          {/* ANUNCIOS */}
          <Card 
            title="Market"
            onClick={() => router.push('/dashboard/market')}
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-ras-crema to-white border-2 border-ras-crema/50 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a2 2 0 0 1 2 2v1.5a7 7 0 0 1 4.5 6.196V15a3 3 0 0 0 1.5 2.598v.902H4v-.902A3 3 0 0 0 5.5 15v-3.304A7 7 0 0 1 10 5.5V4a2 2 0 0 1 2-2z" fill="#c1666b" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M9 19a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
            }
          />

          {/* TICKETS */}
          <Card 
            title="Tickets"
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-ras-crema to-white border-2 border-ras-crema/50 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="18" rx="2" fill="#fb8500" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M2 8h20M7 12h7M7 16h4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
            }
          />

          {/* CALENDARIO */}
          <Card 
            title="Calendario"
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-ras-crema to-white border-2 border-ras-crema/50 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" fill="#5f7c8a" stroke="currentColor" strokeWidth="1.6"/>
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
            onClick={() => router.push('/dashboard/directorio')}
            icon={
              <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-ras-crema to-white border-2 border-ras-crema/50 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="3" width="14" height="18" rx="2" fill="#fbbf24" stroke="currentColor" strokeWidth="1.6"/>
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
              <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-ras-crema to-white border-2 border-ras-crema/50 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" fill="#6b8e23" stroke="currentColor" strokeWidth="1.6"/>
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