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
  nombre: string
  categoria: string
  cantidad?: number
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
      // Cargar datos de la propiedad
      const { data: propData, error } = await supabase
        .from('propiedades')
        .select('*')
        .eq('id', propiedadId)
        .single()

      if (error) throw error
      
      // Verificar si el usuario tiene acceso (propietario o colaborador)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const esPropio = propData.user_id === authUser?.id
      
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

      // Cargar contactos si existen
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

  const duplicarPropiedad = async () => {
    if (!nombreDuplicado.trim()) {
      alert('Por favor ingresa un nombre para la propiedad duplicada')
      return
    }

    if (!propiedad || !user?.id) return

    setDuplicando(true)

    try {
      // Crear copia de la propiedad (sin ID, con nuevo nombre y user_id actual)
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

          {/* Botones de acción */}
          <div className="flex gap-3 flex-wrap">
            {/* Compartir */}
            <button
              onClick={() => setShowCompartir(true)}
              className="px-4 py-2 rounded-lg border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span className="font-medium text-purple-700">Compartir</span>
            </button>

            {/* Editar */}
            <button
              onClick={editarPropiedad}
              className="px-4 py-2 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span className="font-medium text-green-700">Editar</span>
            </button>

            {/* Cuentas */}
            <button
              onClick={abrirCuentas}
              className="px-4 py-2 rounded-lg border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span className="font-medium text-emerald-700">Cuentas</span>
            </button>

            {/* Duplicar */}
            <button
              onClick={abrirModalDuplicar}
              className="px-4 py-2 rounded-lg border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span className="font-medium text-amber-700">Duplicar</span>
            </button>
          </div>
        </div>

        {/* Grid de secciones */}
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
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Mobiliario:</span>
                <span className="text-gray-900 font-semibold">{propiedad.mobiliario || 'N/A'}</span>
              </div>
              
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
              {propiedad.calle && (
                <div>
                  <span className="text-gray-600 text-sm">Dirección</span>
                  <p className="text-gray-900 font-medium">
                    {propiedad.calle} {propiedad.numero_exterior}
                    {propiedad.numero_interior && ` Int. ${propiedad.numero_interior}`}
                  </p>
                </div>
              )}
              
              {propiedad.colonia && (
                <div>
                  <span className="text-gray-600 text-sm">Colonia</span>
                  <p className="text-gray-900 font-medium">{propiedad.colonia}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {propiedad.codigo_postal && (
                  <div>
                    <span className="text-gray-600 text-sm">C.P.</span>
                    <p className="text-gray-900 font-medium">{propiedad.codigo_postal}</p>
                  </div>
                )}
                
                {propiedad.ciudad && (
                  <div>
                    <span className="text-gray-600 text-sm">Ciudad</span>
                    <p className="text-gray-900 font-medium">{propiedad.ciudad}</p>
                  </div>
                )}
              </div>
              
              {propiedad.estado && (
                <div>
                  <span className="text-gray-600 text-sm">Estado</span>
                  <p className="text-gray-900 font-medium">{propiedad.estado}</p>
                </div>
              )}
              
              {propiedad.pais && (
                <div>
                  <span className="text-gray-600 text-sm">País</span>
                  <p className="text-gray-900 font-medium">{propiedad.pais}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contactos */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded font-medium">
                      Propietario
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold">{propietario.nombre}</p>
                  {propietario.telefono && (
                    <p className="text-gray-600 text-sm">📞 {propietario.telefono}</p>
                  )}
                  {propietario.email && (
                    <p className="text-gray-600 text-sm">✉️ {propietario.email}</p>
                  )}
                </div>
              )}
              
              {supervisor && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                      Supervisor
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold">{supervisor.nombre}</p>
                  {supervisor.telefono && (
                    <p className="text-gray-600 text-sm">📞 {supervisor.telefono}</p>
                  )}
                  {supervisor.email && (
                    <p className="text-gray-600 text-sm">✉️ {supervisor.email}</p>
                  )}
                </div>
              )}
              
              {inquilino && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">
                      Inquilino
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold">{inquilino.nombre}</p>
                  {inquilino.telefono && (
                    <p className="text-gray-600 text-sm">📞 {inquilino.telefono}</p>
                  )}
                  {inquilino.email && (
                    <p className="text-gray-600 text-sm">✉️ {inquilino.email}</p>
                  )}
                </div>
              )}
              
              {!propietario && !supervisor && !inquilino && (
                <p className="text-gray-500 text-center py-4">No hay contactos registrados</p>
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
                  <span className="text-emerald-600 text-sm font-medium">Renta Mensual</span>
                  <p className="text-2xl font-bold text-emerald-900">
                    ${propiedad.costo_renta_mensual.toLocaleString('es-MX')} MXN
                  </p>
                  {propiedad.fecha_inicio_contrato && (
                    <p className="text-gray-600 text-sm mt-1">
                      Inicio: {new Date(propiedad.fecha_inicio_contrato).toLocaleDateString('es-MX')}
                    </p>
                  )}
                </div>
              )}
              
              {propiedad.precio_noche && (
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <span className="text-cyan-600 text-sm font-medium">Renta por Noche</span>
                  <p className="text-2xl font-bold text-cyan-900">
                    ${propiedad.precio_noche.toLocaleString('es-MX')} MXN
                  </p>
                  {propiedad.amenidades_vacacional && propiedad.amenidades_vacacional.length > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-xs">Amenidades:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {propiedad.amenidades_vacacional.map((amenidad, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-xs rounded">
                            {amenidad}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {propiedad.precio_venta && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-orange-600 text-sm font-medium">Precio de Venta</span>
                  <p className="text-2xl font-bold text-orange-900">
                    ${propiedad.precio_venta.toLocaleString('es-MX')} MXN
                  </p>
                </div>
              )}
              
              {!propiedad.costo_renta_mensual && !propiedad.precio_noche && !propiedad.precio_venta && (
                <p className="text-gray-500 text-center py-4">No hay información comercial registrada</p>
              )}
            </div>
          </div>

          {/* Espacios - ocupará 2 columnas */}
          {propiedad.espacios && propiedad.espacios.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-poppins">Espacios</h2>
                <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {propiedad.espacios.length} espacios
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {propiedad.espacios.map((espacio, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-600 font-bold text-sm">
                          {espacio.cantidad || 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-semibold text-sm truncate">{espacio.nombre}</p>
                        <p className="text-gray-500 text-xs truncate">{espacio.categoria}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información del Sistema */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border-2 border-gray-200 p-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600 text-sm">ID de Propiedad</span>
                <p className="text-gray-900 font-mono text-sm">{propiedad.id}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Creada</span>
                <p className="text-gray-900 font-medium">
                  {new Date(propiedad.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Última actualización</span>
                <p className="text-gray-900 font-medium">
                  {new Date(propiedad.updated_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
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
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Duplicar Propiedad</h2>
                <p className="text-sm text-gray-500">¿Estás seguro que deseas duplicar esta propiedad?</p>
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none transition-colors"
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
                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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