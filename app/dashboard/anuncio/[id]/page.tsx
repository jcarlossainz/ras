'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TopBar from '@/components/ui/topbar'
import Loading from '@/components/ui/loading'

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
  
  // Comercial
  costo_renta_mensual: number | null
  precio_noche: number | null
  amenidades_vacacional: string[] | null
  precio_venta: number | null
  
  // Espacios
  espacios: any[] | null
  
  // Estado del anuncio
  estado_anuncio: 'borrador' | 'publicado' | 'pausado' | null
  descripcion_anuncio: string | null
  
  created_at: string
  updated_at: string
}

export default function AnuncioDashboard() {
  const router = useRouter()
  const params = useParams()
  const propiedadId = params?.id as string
  
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [propiedad, setPropiedad] = useState<PropiedadData | null>(null)
  const [user, setUser] = useState<any>(null)
  const [descripcion, setDescripcion] = useState('')
  const [showCompartir, setShowCompartir] = useState(false)

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
      
      setPropiedad(propData)
      setDescripcion(propData.descripcion_anuncio || '')
      
    } catch (error) {
      console.error('Error al cargar propiedad:', error)
      alert('Error al cargar la propiedad')
    } finally {
      setLoading(false)
    }
  }

  const guardarDescripcion = async () => {
    if (!propiedad) return
    
    setGuardando(true)
    
    try {
      const { error } = await supabase
        .from('propiedades')
        .update({ descripcion_anuncio: descripcion })
        .eq('id', propiedadId)
      
      if (error) throw error
      
      alert('✅ Descripción guardada correctamente')
      cargarPropiedad()
      
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('❌ Error al guardar la descripción')
    } finally {
      setGuardando(false)
    }
  }

  const toggleEstadoAnuncio = async () => {
    if (!propiedad) return
    
    let nuevoEstado: 'publicado' | 'pausado' = 'publicado'
    
    if (propiedad.estado_anuncio === 'publicado') {
      nuevoEstado = 'pausado'
    }
    
    const { error } = await supabase
      .from('propiedades')
      .update({ estado_anuncio: nuevoEstado })
      .eq('id', propiedadId)
    
    if (error) {
      alert('Error al actualizar estado')
      return
    }
    
    cargarPropiedad()
  }

  const verVistaPrevia = () => {
    window.open(`/anuncio/${propiedadId}`, '_blank')
  }

  const compartirAnuncio = () => {
    setShowCompartir(true)
  }

  const copiarLink = () => {
    const url = `${window.location.origin}/anuncio/${propiedadId}`
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Link copiado al portapapeles! 📋\n\n' + url)
    })
  }

  const compartirWhatsApp = () => {
    if (!propiedad) return
    const url = `${window.location.origin}/anuncio/${propiedadId}`
    const mensaje = `¡Mira esta propiedad! 🏠\n\n*${propiedad.nombre}*\n\n${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    window.open(whatsappUrl, '_blank')
  }

  const compartirFacebook = () => {
    const url = `${window.location.origin}/anuncio/${propiedadId}`
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const compartirTwitter = () => {
    if (!propiedad) return
    const url = `${window.location.origin}/anuncio/${propiedadId}`
    const texto = `¡Mira esta propiedad! 🏠 ${propiedad.nombre}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  const getEstadoBadge = () => {
    if (!propiedad) return null
    
    if (propiedad.estado_anuncio === 'publicado') {
      return { bg: 'bg-green-100', text: 'text-green-800', label: '🟢 Publicado' }
    } else if (propiedad.estado_anuncio === 'pausado') {
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: '🟠 Pausado' }
    } else {
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: '⚪ Borrador' }
    }
  }

  if (loading) {
    return <Loading message="Cargando anuncio..." />
  }

  if (!propiedad) {
    return <div>Propiedad no encontrada</div>
  }

  const estadoBadge = getEstadoBadge()

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title={`Anuncio: ${propiedad.nombre}`}
        showBackButton={true}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header con estado y acciones principales */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2v1.5a7 7 0 0 1 4.5 6.196V15a3 3 0 0 0 1.5 2.598v.902H4v-.902A3 3 0 0 0 5.5 15v-3.304A7 7 0 0 1 10 5.5V4a2 2 0 0 1 2-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{propiedad.nombre}</h1>
                <p className="text-sm text-gray-500">Gestiona tu anuncio y compártelo</p>
              </div>
              {estadoBadge && (
                <span className={`px-4 py-2 rounded-full font-semibold text-sm ${estadoBadge.bg} ${estadoBadge.text}`}>
                  {estadoBadge.label}
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={verVistaPrevia}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Vista Previa
              </button>
              
              <button
                onClick={toggleEstadoAnuncio}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  propiedad.estado_anuncio === 'publicado'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {propiedad.estado_anuncio === 'publicado' ? '⏸ Pausar Anuncio' : '▶ Publicar Anuncio'}
              </button>
            </div>
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna principal - Información */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Descripción del anuncio */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Descripción del Anuncio</h2>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Esta descripción aparecerá en la landing page pública del anuncio. Describe lo mejor de la propiedad para atraer clientes.
              </p>
              
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Hermosa casa de 3 recámaras en zona residencial, cerca de escuelas y centros comerciales. Cuenta con jardín amplio, cochera para 2 autos y acabados de primera calidad..."
                className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none font-roboto"
              />
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  {descripcion.length} caracteres
                </span>
                <button
                  onClick={guardarDescripcion}
                  disabled={guardando}
                  className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? 'Guardando...' : '💾 Guardar Descripción'}
                </button>
              </div>
            </div>

            {/* Información de la propiedad */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Información General</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Tipo</span>
                  <p className="font-semibold text-gray-900">{propiedad.tipo_propiedad}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Mobiliario</span>
                  <p className="font-semibold text-gray-900">{propiedad.mobiliario}</p>
                </div>
                
                {propiedad.capacidad_personas && (
                  <div>
                    <span className="text-sm text-gray-600">Capacidad</span>
                    <p className="font-semibold text-gray-900">{propiedad.capacidad_personas} personas</p>
                  </div>
                )}
                
                {propiedad.tamano_construccion && (
                  <div>
                    <span className="text-sm text-gray-600">Construcción</span>
                    <p className="font-semibold text-gray-900">
                      {propiedad.tamano_construccion} {propiedad.tamano_construccion_unit}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ubicación */}
            {(propiedad.calle || propiedad.colonia || propiedad.ciudad) && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Ubicación</h2>
                </div>
                
                <p className="text-gray-700">
                  {propiedad.calle} {propiedad.numero_exterior} {propiedad.numero_interior && `Int. ${propiedad.numero_interior}`}
                  <br />
                  {propiedad.colonia && `Col. ${propiedad.colonia}, `}
                  {propiedad.ciudad && `${propiedad.ciudad}, `}
                  {propiedad.estado}
                  <br />
                  {propiedad.codigo_postal && `CP: ${propiedad.codigo_postal}`}
                </p>
              </div>
            )}

            {/* Espacios */}
            {propiedad.espacios && propiedad.espacios.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Espacios</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propiedad.espacios.map((espacio: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="font-semibold text-gray-900">{espacio.nombre}</p>
                      <p className="text-sm text-gray-600">{espacio.categoria}</p>
                      {espacio.cantidad > 1 && (
                        <p className="text-xs text-gray-500">Cantidad: {espacio.cantidad}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Acciones y Precios */}
          <div className="space-y-6">
            
            {/* Compartir */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border-2 border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Compartir Anuncio</h3>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={copiarLink}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Copiar Link
                </button>
                
                <button
                  onClick={compartirWhatsApp}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                
                <button
                  onClick={compartirFacebook}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                
                <button
                  onClick={compartirTwitter}
                  className="w-full px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
              </div>
            </div>

            {/* Precios */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Precios</h3>
              </div>
              
              <div className="space-y-3">
                {propiedad.precio_venta && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-orange-600 text-sm font-medium">💰 Venta</span>
                    <p className="text-2xl font-bold text-orange-900">
                      ${propiedad.precio_venta.toLocaleString('es-MX')} MXN
                    </p>
                  </div>
                )}
                
                {propiedad.costo_renta_mensual && (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-emerald-600 text-sm font-medium">🏘️ Renta Mensual</span>
                    <p className="text-2xl font-bold text-emerald-900">
                      ${propiedad.costo_renta_mensual.toLocaleString('es-MX')} MXN
                    </p>
                  </div>
                )}
                
                {propiedad.precio_noche && (
                  <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <span className="text-cyan-600 text-sm font-medium">🏖️ Por Noche</span>
                    <p className="text-2xl font-bold text-cyan-900">
                      ${propiedad.precio_noche.toLocaleString('es-MX')} MXN
                    </p>
                  </div>
                )}
                
                {!propiedad.precio_venta && !propiedad.costo_renta_mensual && !propiedad.precio_noche && (
                  <p className="text-gray-500 text-center py-4">Sin precios definidos</p>
                )}
              </div>
            </div>

            {/* Link del anuncio */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Link del Anuncio</h3>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-blue-300 break-all text-sm font-mono text-gray-700">
                {window.location.origin}/anuncio/{propiedadId}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
