'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TopBar from '@/components/ui/topbar'
import Loading from '@/components/ui/loading'
import CompartirPropiedad from '@/components/CompartirPropiedad'

interface Contacto {
  id: string
  nombre: string
  telefono: string
  email: string
}

interface Espacio {
  id: string
  name: string
  type: string
  details?: {
    camas?: Array<{ id: number; tipo: string }>
    equipamiento?: string[]
    notas?: string
    capacidadPersonas?: number
    tieneBanoPrivado?: boolean
    banoPrivadoId?: string | null
  }
}

interface PropiedadData {
  id: string
  user_id: string
  nombre: string
  tipo_propiedad: string
  estados: string[]
  mobiliario: string
  capacidad_personas: number | null
  tamano_terreno: number | null
  tamano_terreno_unit: string | null
  tamano_construccion: number | null
  tamano_construccion_unit: string | null
  
  // Ubicación
  calle: string | null
  numero_exterior: string | null
  numero_interior: string | null
  colonia: string | null
  codigo_postal: string | null
  ciudad: string | null
  estado: string | null
  pais: string | null
  
  // Contactos (IDs)
  propietario_id: string | null
  supervisor_id: string | null
  inquilino_id: string | null
  
  // Condicionales
  fecha_inicio_contrato: string | null
  costo_renta_mensual: number | null
  precio_noche: number | null
  amenidades_vacacional: string[] | null
  precio_venta: number | null
  
  // Espacios
  espacios: Espacio[] | null
  
  created_at: string
  updated_at: string
  es_propio: boolean
}

export default function HomePropiedad() {
  const router = useRouter()
  const params = useParams()
  const propiedadId = params?.id as string
  
  const [loading, setLoading] = useState(true)
  const [propiedad, setPropiedad] = useState<PropiedadData | null>(null)
  const [propietario, setPropietario] = useState<Contacto | null>(null)
  const [supervisor, setSupervisor] = useState<Contacto | null>(null)
  const [inquilino, setInquilino] = useState<Contacto | null>(null)
  const [user, setUser] = useState<any>(null)
  
  // Estados para modales
  const [showCompartir, setShowCompartir] = useState(false)
  const [showDuplicarModal, setShowDuplicarModal] = useState(false)
  const [nombreDuplicado, setNombreDuplicado] = useState('')
  const [duplicando, setDuplicando] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { 
      router.push('/login')
      return 
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    setUser({ ...profile, id: authUser.id })
    cargarPropiedad()
  }

  const cargarPropiedad = async () => {
    try {
      const { data: propData, error } = await supabase
        .from('propiedades')
        .select('*')
        .eq('id', propiedadId)
        .single()

      if (error) throw error
      
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const esPropio = propData.user_id === authUser?.id
      
      console.log('=== DATOS DE PROPIEDAD ===')
      console.log('Propiedad completa:', propData)
      console.log('Espacios:', propData.espacios)
      
      let esColaborador = false
      if (!esPropio) {
        const { data: colabData } = await supabase
          .from('propiedades_colaboradores')
          .select('user_id')
          .eq('propiedad_id', propiedadId)
          .eq('user_id', authUser?.id)
          .single()
        
        esColaborador = !!colabData
      }
      
      setPropiedad({ ...propData, es_propio: esPropio })

      if (propData.propietario_id) {
        const { data: propietarioData } = await supabase
          .from('contactos')
          .select('*')
          .eq('id', propData.propietario_id)
          .single()
        setPropietario(propietarioData)
      }

      if (propData.supervisor_id) {
        const { data: supervisorData } = await supabase
          .from('contactos')
          .select('*')
          .eq('id', propData.supervisor_id)
          .single()
        setSupervisor(supervisorData)
      }

      if (propData.inquilino_id) {
        const { data: inquilinoData } = await supabase
          .from('contactos')
          .select('*')
          .eq('id', propData.inquilino_id)
          .single()
        setInquilino(inquilinoData)
      }

    } catch (error) {
      console.error('Error al cargar propiedad:', error)
      alert('Error al cargar la propiedad')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  const volverCatalogo = () => {
    router.push('/dashboard/catalogo')
  }

  const abrirCuentas = () => {
    router.push(`/dashboard/propiedad/${propiedadId}/cuentas`)
  }

  const editarPropiedad = () => {
    alert('Función de editar en desarrollo')
  }

  const abrirModalDuplicar = () => {
    setNombreDuplicado(`${propiedad?.nombre} (Copia)`)
    setShowDuplicarModal(true)
  }

  const eliminarPropiedad = async () => {
    if (!user?.id || !propiedad) return

    if (!propiedad.es_propio) {
      alert('⚠️ Solo el propietario puede eliminar esta propiedad')
      return
    }

    const confirmarNombre = prompt(
      `⚠️ ADVERTENCIA: Esta acción es PERMANENTE\n\n` +
      `Para confirmar la eliminación, escribe el nombre exacto de la propiedad:\n` +
      `"${propiedad.nombre}"\n\n` +
      `Se eliminarán TODOS los datos relacionados:\n` +
      `• Espacios y habitaciones\n` +
      `• Colaboradores y permisos\n` +
      `• Fotografías y documentos\n` +
      `• Servicios registrados\n` +
      `• Tickets y mantenimientos\n` +
      `• Cuentas y pagos\n` +
      `• Histórico completo`
    )

    if (!confirmarNombre) {
      return
    }

    if (confirmarNombre !== propiedad.nombre) {
      alert('❌ El nombre no coincide. Eliminación cancelada.')
      return
    }

    try {
      console.log('🗑️ Iniciando eliminación de propiedad:', propiedad.id)
      
      const { data, error, status, statusText } = await supabase
        .from('propiedades')
        .delete()
        .eq('id', propiedad.id)
      
      console.log('Respuesta:', { status, statusText, data, error })

      if (error) {
        if (error.code === '23503') {
          throw new Error('No se puede eliminar: existen registros relacionados.')
        } else if (error.code === '42501') {
          throw new Error('Sin permisos: verifica las políticas RLS.')
        } else {
          throw error
        }
      }

      console.log('✅ Eliminación exitosa')
      alert(`✅ La propiedad "${propiedad.nombre}" ha sido eliminada permanentemente`)
      window.location.href = '/dashboard/catalogo'
      
    } catch (error: any) {
      console.error('❌ ERROR:', error)
      alert(`❌ Error al eliminar:\n\n${error.message}`)
    }
  }

  const duplicarPropiedad = async () => {
    if (!nombreDuplicado.trim()) {
      alert('Por favor ingresa un nombre para la propiedad duplicada')
      return
    }

    if (!propiedad || !user?.id) return

    setDuplicando(true)

    try {
      const { id, created_at, updated_at, es_propio, ...propiedadSinId } = propiedad
      
      const nuevaPropiedad = {
        ...propiedadSinId,
        nombre: nombreDuplicado,
        user_id: user.id,
        is_draft: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: propiedadCreada, error } = await supabase
        .from('propiedades')
        .insert([nuevaPropiedad])
        .select()
        .single()

      if (error) throw error

      alert('¡Propiedad duplicada exitosamente!')
      setShowDuplicarModal(false)
      router.push('/dashboard/catalogo')
      
    } catch (error) {
      console.error('Error al duplicar propiedad:', error)
      alert('Error al duplicar la propiedad')
    } finally {
      setDuplicando(false)
    }
  }

  if (loading) return <Loading message="Cargando propiedad..." />
  
  if (!propiedad) return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h2>
        <button
          onClick={volverCatalogo}
          className="px-6 py-3 bg-ras-primary text-white rounded-lg hover:bg-ras-secondary transition-colors"
        >
          Volver al Catálogo
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title="Home Propiedad"
        showBackButton={true}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header con título y botones de acción */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-poppins">
                {propiedad.nombre}
              </h1>
              <p className="text-gray-500 mt-2 font-roboto">
                Vista general y resumen de la propiedad
              </p>
            </div>
            
            <div className="flex gap-3">
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium text-sm">
                {propiedad.tipo_propiedad}
              </span>
              {propiedad.estados && propiedad.estados.length > 0 && (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm">
                  {propiedad.estados.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3">
            {/* Compartir */}
            <button
              onClick={() => setShowCompartir(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Compartir
            </button>

            {/* Editar */}
            <button
              onClick={editarPropiedad}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Editar
            </button>

            {/* Duplicar */}
            <button
              onClick={abrirModalDuplicar}
              className="flex items-center gap-2 px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Duplicar
            </button>

            {/* Cuentas */}
            <button
              onClick={abrirCuentas}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Cuentas
            </button>
          </div>
        </div>

        {/* LAYOUT REORGANIZADO */}
        <div className="space-y-6">
          
          {/* FILA 1: Datos Básicos e Información Comercial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Datos Básicos */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins">Datos Básicos</h2>
              </div>
              
              <div className="space-y-4">
                {propiedad.mobiliario && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Mobiliario:</span>
                    <span className="text-gray-900 font-semibold">{propiedad.mobiliario}</span>
                  </div>
                )}

                {propiedad.espacios && propiedad.espacios.length > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Habitaciones:</span>
                      <span className="text-gray-900 font-semibold">
                        {propiedad.espacios.filter(e => e.type === 'Habitación').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Baños:</span>
                      <span className="text-gray-900 font-semibold">
                        {propiedad.espacios.filter(e => e.type === 'Baño completo' || e.type === 'Medio baño').length}
                      </span>
                    </div>
                  </>
                )}
                
                {propiedad.capacidad_personas && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Capacidad:</span>
                    <span className="text-gray-900 font-semibold">{propiedad.capacidad_personas} personas</span>
                  </div>
                )}
                
                {propiedad.tamano_terreno && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Terreno:</span>
                    <span className="text-gray-900 font-semibold">
                      {propiedad.tamano_terreno} {propiedad.tamano_terreno_unit || 'm²'}
                    </span>
                  </div>
                )}
                
                {propiedad.tamano_construccion && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Construcción:</span>
                    <span className="text-gray-900 font-semibold">
                      {propiedad.tamano_construccion} {propiedad.tamano_construccion_unit || 'm²'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Información Comercial */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins">Información Comercial</h2>
              </div>
              
              <div className="space-y-4">
                {propiedad.costo_renta_mensual && (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-sm text-emerald-700 font-medium">Renta Mensual</span>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">
                      ${propiedad.costo_renta_mensual.toLocaleString('es-MX')}
                    </p>
                    {propiedad.fecha_inicio_contrato && (
                      <p className="text-sm text-gray-600 mt-2">
                        Inicio: {new Date(propiedad.fecha_inicio_contrato).toLocaleDateString('es-MX')}
                      </p>
                    )}
                  </div>
                )}
                
                {propiedad.precio_noche && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm text-blue-700 font-medium">Precio por Noche</span>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      ${propiedad.precio_noche.toLocaleString('es-MX')}
                    </p>
                  </div>
                )}
                
                {propiedad.precio_venta && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-sm text-purple-700 font-medium">Precio de Venta</span>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      ${propiedad.precio_venta.toLocaleString('es-MX')}
                    </p>
                  </div>
                )}

                {propiedad.amenidades_vacacional && propiedad.amenidades_vacacional.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-700 font-medium block mb-2">Amenidades:</span>
                    <div className="flex flex-wrap gap-2">
                      {propiedad.amenidades_vacacional.map((amenidad, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {amenidad}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FILA 2: Espacios (si existen) */}
          {propiedad.espacios && propiedad.espacios.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins">Espacios</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propiedad.espacios.map((espacio) => (
                  <div key={espacio.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900">{espacio.name}</h3>
                    <span className="text-xs text-gray-600 font-medium">{espacio.type}</span>
                    
                    {espacio.details && (
                      <div className="mt-3 space-y-1 text-sm text-gray-700">
                        {espacio.details.capacidadPersonas && (
                          <p>Capacidad: {espacio.details.capacidadPersonas} personas</p>
                        )}
                        
                        {espacio.details.camas && espacio.details.camas.length > 0 && (
                          <p>Camas: {espacio.details.camas.map(c => c.tipo).join(', ')}</p>
                        )}
                        
                        {espacio.details.tieneBanoPrivado && (
                          <p>Baño privado</p>
                        )}
                        
                        {espacio.details.equipamiento && espacio.details.equipamiento.length > 0 && (
                          <p>Equipamiento: {espacio.details.equipamiento.join(', ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILA 3: Contactos y Ubicación */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Contactos */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins">Contactos</h2>
              </div>
              
              <div className="space-y-4">
                {propietario && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-xs text-blue-600 font-semibold uppercase">Propietario</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{propietario.nombre}</p>
                    {propietario.telefono && (
                      <p className="text-sm text-gray-600 mt-1">📱 {propietario.telefono}</p>
                    )}
                    {propietario.email && (
                      <p className="text-sm text-gray-600">✉️ {propietario.email}</p>
                    )}
                  </div>
                )}
                
                {supervisor && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-xs text-green-600 font-semibold uppercase">Supervisor</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{supervisor.nombre}</p>
                    {supervisor.telefono && (
                      <p className="text-sm text-gray-600 mt-1">📱 {supervisor.telefono}</p>
                    )}
                    {supervisor.email && (
                      <p className="text-sm text-gray-600">✉️ {supervisor.email}</p>
                    )}
                  </div>
                )}
                
                {inquilino && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-xs text-amber-600 font-semibold uppercase">Inquilino</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{inquilino.nombre}</p>
                    {inquilino.telefono && (
                      <p className="text-sm text-gray-600 mt-1">📱 {inquilino.telefono}</p>
                    )}
                    {inquilino.email && (
                      <p className="text-sm text-gray-600">✉️ {inquilino.email}</p>
                    )}
                  </div>
                )}
                
                {!propietario && !supervisor && !inquilino && (
                  <p className="text-gray-500 text-center py-8">No hay contactos registrados</p>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins">Ubicación</h2>
              </div>
              
              <div className="space-y-3">
                {(propiedad.calle || propiedad.numero_exterior) && (
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Dirección</span>
                    <p className="text-gray-900 font-semibold">
                      {[
                        propiedad.calle,
                        propiedad.numero_exterior,
                        propiedad.numero_interior ? `Int. ${propiedad.numero_interior}` : ''
                      ].filter(Boolean).join(' ')}
                    </p>
                  </div>
                )}
                
                {propiedad.colonia && (
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Colonia</span>
                    <p className="text-gray-900 font-semibold">{propiedad.colonia}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {propiedad.codigo_postal && (
                    <div>
                      <span className="text-sm text-gray-600 font-medium">C.P.</span>
                      <p className="text-gray-900 font-semibold">{propiedad.codigo_postal}</p>
                    </div>
                  )}
                  
                  {propiedad.ciudad && (
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Ciudad</span>
                      <p className="text-gray-900 font-semibold">{propiedad.ciudad}</p>
                    </div>
                  )}
                </div>
                
                {propiedad.estado && (
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Estado</span>
                    <p className="text-gray-900 font-semibold">{propiedad.estado}</p>
                  </div>
                )}
                
                {propiedad.pais && (
                  <div>
                    <span className="text-sm text-gray-600 font-medium">País</span>
                    <p className="text-gray-900 font-semibold">{propiedad.pais}</p>
                  </div>
                )}
                
                {!propiedad.calle && !propiedad.colonia && !propiedad.codigo_postal && (
                  <p className="text-gray-500 text-center py-8">No hay ubicación registrada</p>
                )}
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-gray-50 rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 font-poppins">Información del Sistema</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <span className="text-sm text-gray-600">ID de Propiedad</span>
                <p className="text-gray-900 font-mono text-sm mt-1">{propiedad.id}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Creada</span>
                <p className="text-gray-900 font-medium mt-1">
                  {new Date(propiedad.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Última actualización</span>
                <p className="text-gray-900 font-medium mt-1">
                  {new Date(propiedad.updated_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {propiedad.es_propio && (
              <div className="pt-4 border-t-2 border-gray-300">
                <button
                  onClick={eliminarPropiedad}
                  className="w-full px-4 py-3 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  Eliminar propiedad
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Modal de Compartir */}
      {showCompartir && propiedad && (
        <CompartirPropiedad
          isOpen={showCompartir}
          onClose={() => setShowCompartir(false)}
          propiedadId={propiedad.id}
          propiedadNombre={propiedad.nombre}
          userId={user.id}
          esPropio={propiedad.es_propio}
        />
      )}

      {/* Modal de Duplicar */}
      {showDuplicarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Duplicar Propiedad</h2>
                <p className="text-sm text-gray-500">Ingresa el nombre para la nueva propiedad</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la nueva propiedad
              </label>
              <input
                type="text"
                value={nombreDuplicado}
                onChange={(e) => setNombreDuplicado(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none transition-colors"
                placeholder="Nombre de la propiedad"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDuplicarModal(false)}
                disabled={duplicando}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={duplicarPropiedad}
                disabled={duplicando}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {duplicando ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Duplicando...
                  </>
                ) : (
                  'Duplicar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}