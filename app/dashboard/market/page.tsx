'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TopBar from '@/components/ui/topbar'
import Loading from '@/components/ui/loading'
import EmptyState from '@/components/ui/emptystate'

interface Propiedad {
  id: string
  user_id: string
  nombre: string
  tipo_propiedad: string
  estados: string[]
  codigo_postal: string | null
  costo_renta_mensual: number | null
  precio_noche: number | null
  precio_venta: number | null
  estado_anuncio: 'borrador' | 'publicado' | 'pausado' | null
  created_at: string
  es_propio: boolean
}

export default function MarketPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  
  // Estados para búsqueda y filtro
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'publicado' | 'pausado' | 'borrador'>('todos')
  const [filtroOperacion, setFiltroOperacion] = useState<'todos' | 'venta' | 'renta' | 'vacacional'>('todos')

  useEffect(() => { 
    checkUser()
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
      .select('id, user_id, nombre, tipo_propiedad, estados, codigo_postal, costo_renta_mensual, precio_noche, precio_venta, estado_anuncio, created_at')
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
        .select('id, user_id, nombre, tipo_propiedad, estados, codigo_postal, costo_renta_mensual, precio_noche, precio_venta, estado_anuncio, created_at')
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

  const toggleEstadoAnuncio = async (propiedadId: string, estadoActual: string | null) => {
    let nuevoEstado: 'publicado' | 'pausado' = 'publicado'
    
    if (estadoActual === 'publicado') {
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
    
    // Recargar propiedades
    if (user?.id) cargarPropiedades(user.id)
  }

  const abrirAnuncio = (propiedadId: string) => {
    router.push(`/dashboard/anuncio/${propiedadId}`)
  }

  const compartirAnuncio = (propiedadId: string) => {
    const url = `${window.location.origin}/anuncio/${propiedadId}`
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Link copiado al portapapeles! 📋\n\n' + url)
    }).catch(() => {
      alert('Link del anuncio:\n\n' + url)
    })
  }

  const compartirWhatsApp = (propiedadId: string, nombrePropiedad: string) => {
    const url = `${window.location.origin}/anuncio/${propiedadId}`
    const mensaje = `¡Mira esta propiedad! 🏠\n\n*${nombrePropiedad}*\n\n${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  const getOperacionTipo = (prop: Propiedad): string[] => {
    const tipos: string[] = []
    if (prop.precio_venta) tipos.push('venta')
    if (prop.costo_renta_mensual) tipos.push('renta')
    if (prop.precio_noche) tipos.push('vacacional')
    return tipos
  }

  const getEstadoBadge = (estado: string | null) => {
    if (estado === 'publicado') {
      return { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Publicado', icon: '🟢' }
    } else if (estado === 'pausado') {
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: '⏸ Pausado', icon: '🟠' }
    } else {
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: '📝 Borrador', icon: '⚪' }
    }
  }

  if (loading) {
    return <Loading message="Cargando anuncios..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title="Market - Anuncios"
        onClick={() => router.push('/dashboard/market')}
        showBackButton={true}
        showAddButton={false}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header con descripción */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a2 2 0 0 1 2 2v1.5a7 7 0 0 1 4.5 6.196V15a3 3 0 0 0 1.5 2.598v.902H4v-.902A3 3 0 0 0 5.5 15v-3.304A7 7 0 0 1 10 5.5V4a2 2 0 0 1 2-2z"/>
                <path d="M9 19a3 3 0 0 0 6 0"/>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Impulsa tus propiedades</h2>
              <p className="text-gray-600">
                Publica y comparte tus anuncios fácilmente. Cada propiedad tiene su propia landing page lista para promocionar en redes sociales, WhatsApp o donde quieras. 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar propiedad
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o código postal..."
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              />
            </div>

            {/* Filtro Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              >
                <option value="todos">Todos</option>
                <option value="publicado">Publicados</option>
                <option value="pausado">Pausados</option>
                <option value="borrador">Borradores</option>
              </select>
            </div>

            {/* Filtro Operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operación
              </label>
              <select
                value={filtroOperacion}
                onChange={(e) => setFiltroOperacion(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              >
                <option value="todos">Todas</option>
                <option value="venta">Venta</option>
                <option value="renta">Renta</option>
                <option value="vacacional">Vacacional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de propiedades */}
        {propiedades.filter(prop => {
          // Filtro búsqueda
          const matchBusqueda = busqueda === '' || 
            prop.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (prop.codigo_postal && prop.codigo_postal.includes(busqueda))
          
          // Filtro estado
          const matchEstado = 
            filtroEstado === 'todos' ||
            (filtroEstado === 'borrador' && !prop.estado_anuncio) ||
            prop.estado_anuncio === filtroEstado
          
          // Filtro operación
          const operaciones = getOperacionTipo(prop)
          const matchOperacion = 
            filtroOperacion === 'todos' ||
            operaciones.includes(filtroOperacion)
          
          return matchBusqueda && matchEstado && matchOperacion
        }).length > 0 ? (
          <div className="space-y-4">
            {propiedades.filter(prop => {
              const matchBusqueda = busqueda === '' || 
                prop.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                (prop.codigo_postal && prop.codigo_postal.includes(busqueda))
              
              const matchEstado = 
                filtroEstado === 'todos' ||
                (filtroEstado === 'borrador' && !prop.estado_anuncio) ||
                prop.estado_anuncio === filtroEstado
              
              const operaciones = getOperacionTipo(prop)
              const matchOperacion = 
                filtroOperacion === 'todos' ||
                operaciones.includes(filtroOperacion)
              
              return matchBusqueda && matchEstado && matchOperacion
            }).map((prop) => {
              const estadoBadge = getEstadoBadge(prop.estado_anuncio)
              const operaciones = getOperacionTipo(prop)
              
              return (
                <div 
                  key={prop.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-5 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div 
                      onClick={() => abrirAnuncio(prop.id)}
                      className="cursor-pointer"
                    >
                      <img 
                        src="https://via.placeholder.com/160x120/f3f4f6/9ca3af?text=Sin+foto"
                        alt={prop.nombre}
                        className="w-40 h-28 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 
                          onClick={() => abrirAnuncio(prop.id)}
                          className="text-xl font-bold text-gray-800 font-poppins cursor-pointer hover:text-purple-600"
                        >
                          {prop.nombre}
                        </h3>
                        
                        {/* Badge estado */}
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${estadoBadge.bg} ${estadoBadge.text}`}>
                          {estadoBadge.label}
                        </span>

                        {/* Badge propio/compartido */}
                        <span 
                          className="text-xs px-2 py-1 rounded-lg font-semibold" 
                          style={{ 
                            background: prop.es_propio ? '#f0fdf4' : '#f3f4f6', 
                            color: prop.es_propio ? '#16a34a' : '#6b7280' 
                          }}
                        >
                          {prop.es_propio ? '🏠 Propio' : '👥 Compartido'}
                        </span>
                      </div>

                      {/* Tipo de operación */}
                      <div className="flex items-center gap-2 mb-2">
                        {operaciones.length > 0 ? (
                          operaciones.map(op => (
                            <span key={op} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">
                              {op === 'venta' && '💰 Venta'}
                              {op === 'renta' && '🏘️ Renta'}
                              {op === 'vacacional' && '🏖️ Vacacional'}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">
                            Sin precio definido
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 font-roboto">
                        {prop.codigo_postal && (
                          <span>📍 CP: {prop.codigo_postal}</span>
                        )}
                        <span className="text-xs text-gray-400 ml-3">
                          ID: {prop.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col gap-2">
                      {/* Toggle Publicar/Pausar */}
                      <button
                        onClick={() => toggleEstadoAnuncio(prop.id, prop.estado_anuncio)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          prop.estado_anuncio === 'publicado'
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {prop.estado_anuncio === 'publicado' ? '⏸ Pausar' : '▶ Publicar'}
                      </button>

                      {/* Botón Editar */}
                      <button
                        onClick={() => abrirAnuncio(prop.id)}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-medium"
                      >
                        ✏️ Editar
                      </button>

                      {/* Botón Compartir */}
                      <button
                        onClick={() => compartirAnuncio(prop.id)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium"
                      >
                        🔗 Copiar link
                      </button>

                      {/* Botón WhatsApp */}
                      <button
                        onClick={() => compartirWhatsApp(prop.id, prop.nombre)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium"
                      >
                        📱 WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState 
            icon={
              <svg className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a2 2 0 0 1 2 2v1.5a7 7 0 0 1 4.5 6.196V15a3 3 0 0 0 1.5 2.598v.902H4v-.902A3 3 0 0 0 5.5 15v-3.304A7 7 0 0 1 10 5.5V4a2 2 0 0 1 2-2z"/>
              </svg>
            }
            title={propiedades.length === 0 ? "No tienes propiedades para anunciar" : "No se encontraron resultados"}
            description={propiedades.length === 0 ? "Ve al catálogo para crear tu primera propiedad" : "Intenta con otra búsqueda o cambia los filtros"}
            actionLabel={propiedades.length === 0 ? "Ir al Catálogo" : undefined}
            onAction={propiedades.length === 0 ? () => router.push('/dashboard/catalogo') : undefined}
          />
        )}
      </main>
    </div>
  )
}
