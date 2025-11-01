'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import WizardPropiedad from '@/components/WizardPropiedad'
import TopBar from '@/components/ui/topbar'
import Card from '@/components/ui/card'
import Loading from '@/components/ui/loading'
import EmptyState from '@/components/ui/emptystate'
import Modal from '@/components/ui/modal'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'

interface Propiedad {
  id: string
  user_id: string
  nombre: string
  codigo_postal: string | null
  created_at: string
  es_propio: boolean
}

export default function CatalogoPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [showWizard, setShowWizard] = useState(false)
  
  const [showPropiedad, setShowPropiedad] = useState(false)
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Propiedad | null>(null)
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [emailColaborador, setEmailColaborador] = useState('')
  const [agregandoColab, setAgregandoColab] = useState(false)

  useEffect(() => { 
    checkUser()
    
    // Listener para abrir wizard desde TopBar
    const handleOpenWizard = () => setShowWizard(true)
    window.addEventListener('openWizard', handleOpenWizard)
    
    return () => window.removeEventListener('openWizard', handleOpenWizard)
  }, [])

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
    setUser({ ...profile, id: authUser.id })
    cargarPropiedades(authUser.id)
    setLoading(false)
  }

  const cargarPropiedades = async (userId: string) => {
    const { data: propiedadesPropias } = await supabase
      .from('propiedades')
      .select('id, user_id, nombre, codigo_postal, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    const { data: propiedadesCompartidas } = await supabase
      .from('propiedades_colaboradores')
      .select('propiedad_id')
      .eq('user_id', userId)
    
    let propiedadesCompartidasData: any[] = []
    if (propiedadesCompartidas && propiedadesCompartidas.length > 0) {
      const idsCompartidos = propiedadesCompartidas.map(p => p.propiedad_id)
      const { data: datosCompartidos } = await supabase
        .from('propiedades')
        .select('id, user_id, nombre, codigo_postal, created_at')
        .in('id', idsCompartidos)
      propiedadesCompartidasData = datosCompartidos || []
    }
    
    const todasPropiedades = [
      ...(propiedadesPropias || []).map(p => ({ ...p, es_propio: true })),
      ...(propiedadesCompartidasData || []).map(p => ({ ...p, es_propio: false }))
    ]
    todasPropiedades.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setPropiedades(todasPropiedades)
  }

  const abrirPropiedad = async (propiedad: Propiedad) => {
    setPropiedadSeleccionada(propiedad)
    setShowPropiedad(true)
    if (propiedad.es_propio) {
      const { data } = await supabase
        .from('propiedades_colaboradores')
        .select('id, user_id, profiles:user_id(email, full_name)')
        .eq('propiedad_id', propiedad.id)
      setColaboradores((data || []).map(c => ({
        id: c.id,
        user_id: c.user_id,
        email: (c.profiles as any)?.email || '',
        full_name: (c.profiles as any)?.full_name
      })))
    }
  }

  const agregarColaborador = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propiedadSeleccionada) return
    setAgregandoColab(true)
    try {
      const emailBuscar = emailColaborador.trim().toLowerCase()
      const { data: perfilData, error: perfilError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', emailBuscar)
        .single()
      
      if (perfilError || !perfilData) {
        alert('Usuario no encontrado')
        setAgregandoColab(false)
        return
      }
      if (perfilData.id === user.id) {
        alert('No puedes agregarte a ti mismo')
        setAgregandoColab(false)
        return
      }
      
      const { error: insertError } = await supabase
        .from('propiedades_colaboradores')
        .insert({
          propiedad_id: propiedadSeleccionada.id,
          user_id: perfilData.id,
          agregado_por: user.id
        })
      
      if (insertError) {
        if (insertError.code === '23505') alert('Ya es colaborador')
        else alert('Error: ' + insertError.message)
      } else {
        alert('✅ Colaborador agregado')
        setEmailColaborador('')
        abrirPropiedad(propiedadSeleccionada)
      }
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setAgregandoColab(false)
    }
  }

  const eliminarColaborador = async (colaboradorId: string) => {
    if (!confirm('¿Eliminar colaborador de la propiedad?')) return
    try {
      const { error } = await supabase
        .from('propiedades_colaboradores')
        .delete()
        .eq('id', colaboradorId)
      if (error) throw error
      alert('✅ Colaborador eliminado')
      if (propiedadSeleccionada) abrirPropiedad(propiedadSeleccionada)
    } catch (err) {
      alert('Error al eliminar')
    }
  }

  if (loading) {
    return <Loading message="Cargando propiedades..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title="Propiedades"
        showBackButton={true}
        showAddButton={true}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={async () => {
          if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            await supabase.auth.signOut()
            router.push('/login')
          }
        }}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {propiedades.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {propiedades.map(prop => (
              <Card 
                key={prop.id}
                title={prop.nombre}
                badge={prop.es_propio ? '🏠' : '👥'}
                badgeColor={prop.es_propio ? 'green' : 'gray'}
                onClick={() => abrirPropiedad(prop)}
                icon={
                  <div className="w-20 h-20 rounded-xl bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center">
                    <svg className="w-10 h-10 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={
              <svg className="w-12 h-12 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            title="No tienes propiedades"
            description="Usa el botón + para crear tu primera propiedad"
            actionLabel="+ Crear Propiedad"
            onAction={() => setShowWizard(true)}
          />
        )}
      </main>

      {/* Modal Ver Propiedad */}
      <Modal 
        isOpen={showPropiedad}
        onClose={() => { setShowPropiedad(false); setPropiedadSeleccionada(null) }}
        maxWidth="2xl"
      >
        {propiedadSeleccionada && (
          <>
            <h2 className="text-3xl font-bold mb-2 font-poppins">{propiedadSeleccionada.nombre}</h2>
            <p className="text-gray-500 mb-8 font-roboto">
              {propiedadSeleccionada.es_propio ? '🏠 Tu propiedad' : '👥 Compartido contigo'}
            </p>
            
            {propiedadSeleccionada.es_propio && (
              <>
                <h3 className="text-xl font-semibold mb-4 font-poppins">Colaboradores</h3>
                <form onSubmit={agregarColaborador} className="flex gap-2 mb-5">
                  <Input 
                    type="email" 
                    value={emailColaborador} 
                    onChange={(e) => setEmailColaborador(e.target.value)} 
                    placeholder="Email del colaborador" 
                    required 
                  />
                  <Button 
                    type="submit" 
                    disabled={agregandoColab}
                    size="md"
                  >
                    {agregandoColab ? '...' : 'Agregar'}
                  </Button>
                </form>
                
                {colaboradores.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {colaboradores.map(colab => (
                      <div key={colab.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-semibold font-roboto">{colab.email}</div>
                          {colab.full_name && <div className="text-sm text-gray-500 font-roboto">{colab.full_name}</div>}
                        </div>
                        <Button 
                          onClick={() => eliminarColaborador(colab.id)}
                          variant="danger"
                          size="sm"
                        >
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8 font-roboto">Sin colaboradores</p>
                )}
              </>
            )}
          </>
        )}
      </Modal>

      {/* Wizard */}
      {showWizard && (
        <WizardPropiedad 
          userId={user.id} 
          onClose={() => setShowWizard(false)} 
          onSuccess={() => cargarPropiedades(user.id)} 
        />
      )}
    </div>
  )
}