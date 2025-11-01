'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import WizardModal from './components/WizardModal'
import CompartirPropiedad from '@/components/CompartirPropiedad'
import TopBar from '@/components/ui/topbar'
import Loading from '@/components/ui/loading'
import EmptyState from '@/components/ui/emptystate'
import { PropertyFormData } from '@/types/property'

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
  const [showCompartir, setShowCompartir] = useState(false)
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Propiedad | null>(null)

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
    // Cargar propiedades propias
    const { data: propiedadesPropias } = await supabase
      .from('propiedades')
      .select('id, user_id, nombre, codigo_postal, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    // Cargar propiedades compartidas
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

  const abrirCompartir = (propiedad: Propiedad) => {
    setPropiedadSeleccionada(propiedad)
    setShowCompartir(true)
  }

  const abrirHome = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}`)
  }

  const editarPropiedad = (propiedadId: string) => {
    alert('Editar propiedad: ' + propiedadId)
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  // Guardar propiedad desde el wizard
  const handleWizardSave = async (data: PropertyFormData) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Preparar datos para Supabase
      const propiedadData = {
        user_id: user.id,
        
        // Datos básicos
        nombre: data.nombre_propiedad,
        tipo_propiedad: data.tipo_propiedad,
        estados: data.estados,
        mobiliario: data.mobiliario,
        capacidad_personas: data.capacidad_personas ? parseInt(data.capacidad_personas) : null,
        tamano_terreno: data.tamano_terreno ? parseFloat(data.tamano_terreno) : null,
        tamano_terreno_unit: data.tamano_terreno_unit,
        tamano_construccion: data.tamano_construccion ? parseFloat(data.tamano_construccion) : null,
        tamano_construccion_unit: data.tamano_construccion_unit,

        // Asignaciones
        propietario_id: data.propietario_id,
        supervisor_id: data.supervisor_id || null,

        // Condicionales - Renta largo plazo
        inquilino_id: data.inquilino_id || null,
        fecha_inicio_contrato: data.fecha_inicio_contrato || null,
        costo_renta_mensual: data.costo_renta_mensual ? parseFloat(data.costo_renta_mensual) : null,

        // Condicionales - Renta vacacional
        precio_noche: data.precio_noche ? parseFloat(data.precio_noche) : null,
        amenidades_vacacional: data.amenidades_vacacional || [],

        // Condicionales - Venta
        precio_venta: data.precio_venta ? parseFloat(data.precio_venta) : null,

        // Espacios (guardar como JSON)
        espacios: data.espacios,

        // Metadata
        is_draft: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: propiedad, error } = await supabase
        .from('propiedades')
        .insert(propiedadData)
        .select()
        .single();

      if (error) throw error;

      // Recargar propiedades
      cargarPropiedades(user.id);
      
      // Opcional: Redirigir al home de la propiedad
      // router.push(`/dashboard/propiedad/${propiedad.id}`);
      
    } catch (error) {
      console.error('Error al guardar propiedad:', error);
      throw error;
    }
  };

  // Guardar borrador desde el wizard
  const handleWizardSaveDraft = async (data: PropertyFormData) => {
    if (!user?.id) {
      console.warn('Usuario no autenticado');
      return;
    }

    try {
      const draftData = {
        user_id: user.id,
        nombre: data.nombre_propiedad || 'Borrador sin nombre',
        tipo_propiedad: data.tipo_propiedad,
        estados: data.estados,
        mobiliario: data.mobiliario,
        capacidad_personas: data.capacidad_personas ? parseInt(data.capacidad_personas) : null,
        tamano_terreno: data.tamano_terreno ? parseFloat(data.tamano_terreno) : null,
        tamano_terreno_unit: data.tamano_terreno_unit,
        tamano_construccion: data.tamano_construccion ? parseFloat(data.tamano_construccion) : null,
        tamano_construccion_unit: data.tamano_construccion_unit,
        propietario_id: data.propietario_id || null,
        supervisor_id: data.supervisor_id || null,
        inquilino_id: data.inquilino_id || null,
        fecha_inicio_contrato: data.fecha_inicio_contrato || null,
        costo_renta_mensual: data.costo_renta_mensual ? parseFloat(data.costo_renta_mensual) : null,
        precio_noche: data.precio_noche ? parseFloat(data.precio_noche) : null,
        amenidades_vacacional: data.amenidades_vacacional || [],
        precio_venta: data.precio_venta ? parseFloat(data.precio_venta) : null,
        espacios: data.espacios,
        is_draft: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('propiedades')
        .upsert(draftData);

      if (error) throw error;

      console.log('✅ Borrador guardado');

    } catch (error) {
      console.error('Error al guardar borrador:', error);
    }
  };

  if (loading) {
    return <Loading message="Cargando propiedades..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title="Catálogo"
        showBackButton={true}
        showAddButton={true}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {propiedades.length > 0 ? (
          <div className="space-y-4">
            {propiedades.map((prop) => (
              <div 
                key={prop.id} 
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-all flex items-center gap-5"
              >
                {/* Foto thumbnail */}
                <img 
                  src="https://via.placeholder.com/120x90/f3f4f6/9ca3af?text=Sin+foto"
                  alt={prop.nombre}
                  className="w-32 h-24 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0"
                />

                {/* Info de la propiedad */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-800 font-poppins truncate">
                      {prop.nombre}
                    </h3>
                    <span 
                      className="text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0" 
                      style={{ 
                        background: prop.es_propio ? '#f0fdf4' : '#f3f4f6', 
                        color: prop.es_propio ? '#16a34a' : '#6b7280' 
                      }}
                    >
                      {prop.es_propio ? '🏠 Propio' : '👥 Compartido'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 font-roboto space-y-1">
                    {prop.codigo_postal && (
                      <div>📍 CP: {prop.codigo_postal}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      ID: {prop.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 flex-shrink-0">
                  {/* Botón Compartir */}
                  <button
                    onClick={() => abrirCompartir(prop)}
                    className="w-12 h-12 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all flex items-center justify-center group"
                    title="Compartir"
                  >
                    <svg className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>

                  {/* Botón Home */}
                  <button
                    onClick={() => abrirHome(prop.id)}
                    className="w-12 h-12 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all flex items-center justify-center group"
                    title="Ver Home"
                  >
                    <svg className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Botón Editar */}
                  <button
                    onClick={() => editarPropiedad(prop.id)}
                    className="w-12 h-12 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-all flex items-center justify-center group"
                    title="Editar"
                  >
                    <svg className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
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

      {/* Componente Compartir Propiedad */}
      {showCompartir && propiedadSeleccionada && (
        <CompartirPropiedad
          isOpen={showCompartir}
          onClose={() => {
            setShowCompartir(false)
            setPropiedadSeleccionada(null)
          }}
          propiedadId={propiedadSeleccionada.id}
          propiedadNombre={propiedadSeleccionada.nombre}
          userId={user.id}
          esPropio={propiedadSeleccionada.es_propio}
        />
      )}

      {/* Wizard Modal - NUEVO WIZARD LIMPIO */}
      <WizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={handleWizardSave}
        onSaveDraft={handleWizardSaveDraft}
      />
    </div>
  )
}
