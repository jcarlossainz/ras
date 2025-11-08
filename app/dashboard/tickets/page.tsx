'use client'

/**
 * TICKETS - Vista Consolidada
 * Lista de todos los pagos pendientes de todas las propiedades del usuario
 * Dashboard global de pagos del sistema RAS
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/components/ui/confirm-modal'
import TopBar from '@/components/ui/topbar'
import Loading from '@/components/ui/loading'
import EmptyState from '@/components/ui/emptystate'

interface Pago {
  id: string
  fecha_pago: string
  monto_estimado: number
  pagado: boolean
  servicio_id: string
  servicio_nombre: string
  tipo_servicio: string
  numero_contrato: string
  propiedad_id: string
  propiedad_nombre: string
  dias_restantes: number
}

interface Propiedad {
  id: string
  nombre: string
}

export default function TicketsGlobalPage() {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [filtroUrgencia, setFiltroUrgencia] = useState<'todos' | 'vencido' | 'hoy' | 'proximo' | 'futuro'>('todos')
  const [filtroProp, setFiltroProp] = useState<string>('todas')
  const [busqueda, setBusqueda] = useState('')

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
    await cargarDatos(authUser.id)
    setLoading(false)
  }

  const cargarDatos = async (userId: string) => {
    try {
      // Cargar todas las propiedades del usuario
      const { data: propsPropias } = await supabase
        .from('propiedades')
        .select('id, nombre')
        .eq('user_id', userId)

      const { data: propsCompartidas } = await supabase
        .from('propiedades_colaboradores')
        .select('propiedad_id')
        .eq('user_id', userId)

      let propsCompartidasData: any[] = []
      if (propsCompartidas && propsCompartidas.length > 0) {
        const ids = propsCompartidas.map(p => p.propiedad_id)
        const { data } = await supabase
          .from('propiedades')
          .select('id, nombre')
          .in('id', ids)
        propsCompartidasData = data || []
      }

      const todasPropiedades = [
        ...(propsPropias || []),
        ...propsCompartidasData
      ]
      setPropiedades(todasPropiedades)

      if (todasPropiedades.length === 0) {
        setPagos([])
        return
      }

      // Cargar todos los pagos pendientes de todas las propiedades
      const propIds = todasPropiedades.map(p => p.id)
      const { data: pagosData, error: pagosError } = await supabase
        .from('fechas_pago_servicios')
        .select(`
          id,
          fecha_pago,
          monto_estimado,
          pagado,
          servicio_id,
          propiedad_id,
          servicios_inmueble!inner(
            nombre,
            tipo_servicio,
            numero_contrato
          )
        `)
        .in('propiedad_id', propIds)
        .eq('pagado', false)
        .order('fecha_pago', { ascending: true })
        .limit(200)

      if (pagosError) {
        console.error('Error cargando pagos:', pagosError)
        setPagos([])
        return
      }

      // Transformar y agregar información de propiedad
      const pagosTransformados = (pagosData || []).map(pago => {
        const propiedad = todasPropiedades.find(p => p.id === pago.propiedad_id)
        const diasRestantes = getDiasRestantes(pago.fecha_pago)
        
        return {
          id: pago.id,
          fecha_pago: pago.fecha_pago,
          monto_estimado: pago.monto_estimado,
          pagado: pago.pagado,
          servicio_id: pago.servicio_id,
          servicio_nombre: pago.servicios_inmueble.nombre,
          tipo_servicio: pago.servicios_inmueble.tipo_servicio,
          numero_contrato: pago.servicios_inmueble.numero_contrato,
          propiedad_id: pago.propiedad_id,
          propiedad_nombre: propiedad?.nombre || 'Sin nombre',
          dias_restantes: diasRestantes
        }
      })

      setPagos(pagosTransformados)

    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar tickets')
    }
  }

  const getDiasRestantes = (fechaPago: string): number => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fecha = new Date(fechaPago)
    fecha.setHours(0, 0, 0, 0)
    return Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getEstadoUrgencia = (diasRestantes: number): 'vencido' | 'hoy' | 'proximo' | 'futuro' => {
    if (diasRestantes < 0) return 'vencido'
    if (diasRestantes === 0) return 'hoy'
    if (diasRestantes <= 7) return 'proximo'
    return 'futuro'
  }

  const getUrgenciaColor = (diasRestantes: number): string => {
    const estado = getEstadoUrgencia(diasRestantes)
    switch (estado) {
      case 'vencido':
        return 'bg-red-50 border-2 border-red-400 text-red-700'
      case 'hoy':
        return 'bg-orange-50 border-2 border-orange-400 text-orange-700'
      case 'proximo':
        return 'bg-yellow-50 border-2 border-yellow-400 text-yellow-700'
      default:
        return 'bg-blue-50 border border-blue-300 text-blue-600'
    }
  }

  const getTipoIcon = (tipo: string) => {
    const iconos: { [key: string]: string } = {
      agua: '💧',
      gas: '🔥',
      luz: '💡',
      internet: '📡',
      predial: '🏛️',
      cuota_condominio: '🏘️',
      mantenimiento_alberca: '🏊',
      cctv: '📹',
      seguro: '🛡️',
      fumigacion: '🐛',
      mantenimiento_aires: '❄️',
      impermeabilizacion: '☔'
    }
    return iconos[tipo] || '📋'
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleMarcarPagado = async (pagoId: string, monto: number) => {
    const confirmed = await confirm.success(
      '¿Marcar este pago como realizado?',
      'Se registrará la fecha de hoy como fecha de pago'
    )

    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('fechas_pago_servicios')
        .update({
          pagado: true,
          fecha_pago_real: new Date().toISOString().split('T')[0],
          monto_real: monto
        })
        .eq('id', pagoId)

      if (error) throw error

      toast.success('Pago marcado como realizado')
      if (user?.id) await cargarDatos(user.id)
    } catch (error) {
      console.error('Error marcando pago:', error)
      toast.error('Error al marcar el pago')
    }
  }

  const handleVerPropiedad = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}/tickets`)
  }

  const pagosFiltrados = pagos.filter(pago => {
    // Filtro por urgencia
    if (filtroUrgencia !== 'todos' && getEstadoUrgencia(pago.dias_restantes) !== filtroUrgencia) return false
    
    // Filtro por propiedad
    if (filtroProp !== 'todas' && pago.propiedad_id !== filtroProp) return false
    
    // Búsqueda por texto
    if (busqueda) {
      const searchLower = busqueda.toLowerCase()
      return (
        pago.servicio_nombre.toLowerCase().includes(searchLower) ||
        pago.propiedad_nombre.toLowerCase().includes(searchLower) ||
        pago.numero_contrato.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })

  const estadisticas = {
    total: pagos.length,
    vencidos: pagos.filter(p => getEstadoUrgencia(p.dias_restantes) === 'vencido').length,
    hoy: pagos.filter(p => getEstadoUrgencia(p.dias_restantes) === 'hoy').length,
    proximos: pagos.filter(p => getEstadoUrgencia(p.dias_restantes) === 'proximo').length,
    montoTotal: pagos.reduce((sum, p) => sum + p.monto_estimado, 0)
  }

  if (loading) {
    return <Loading message="Cargando tickets..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar
        title="📋 Tickets - Pagos Pendientes"
        showBackButton
        onBackClick={() => router.push('/dashboard')}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-xs font-semibold opacity-90 mb-1">Vencidos</div>
            <div className="text-3xl font-bold">{estadisticas.vencidos}</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-xs font-semibold opacity-90 mb-1">Hoy</div>
            <div className="text-3xl font-bold">{estadisticas.hoy}</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-xs font-semibold opacity-90 mb-1">Esta semana</div>
            <div className="text-3xl font-bold">{estadisticas.proximos}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-xs font-semibold opacity-90 mb-1">Total pendientes</div>
            <div className="text-3xl font-bold">{estadisticas.total}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-xs font-semibold opacity-90 mb-1">Monto total</div>
            <div className="text-xl font-bold">
              ${(estadisticas.montoTotal / 1000).toFixed(1)}K
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Servicio, propiedad, contrato..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Urgencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Urgencia</label>
              <select
                value={filtroUrgencia}
                onChange={(e) => setFiltroUrgencia(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="vencido">Vencidos</option>
                <option value="hoy">Vence hoy</option>
                <option value="proximo">Esta semana</option>
                <option value="futuro">Futuros</option>
              </select>
            </div>

            {/* Filtro Propiedad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Propiedad</label>
              <select
                value={filtroProp}
                onChange={(e) => setFiltroProp(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="todas">Todas las propiedades</option>
                {propiedades.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Pagos */}
        {pagosFiltrados.length > 0 ? (
          <div className="space-y-3">
            {pagosFiltrados.map(pago => (
              <div
                key={pago.id}
                className={`rounded-xl shadow-lg p-5 transition-all hover:shadow-xl ${getUrgenciaColor(pago.dias_restantes)}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  
                  {/* Icono */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-lg bg-white/80 flex items-center justify-center text-3xl border-2 border-white shadow-sm">
                      {getTipoIcon(pago.tipo_servicio)}
                    </div>
                  </div>

                  {/* Info del pago */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {pago.servicio_nombre}
                      </h3>
                      <span className="text-xs font-mono bg-white/60 px-2 py-1 rounded border border-current">
                        {pago.numero_contrato}
                      </span>
                    </div>
                    
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      🏠 {pago.propiedad_nombre}
                    </p>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold">
                        📅 {formatearFecha(pago.fecha_pago)}
                      </span>
                      <span className="font-bold">
                        💵 ${pago.monto_estimado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Días restantes y acciones */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold mb-1">
                      {pago.dias_restantes < 0 
                        ? `${Math.abs(pago.dias_restantes)} días atrasado` 
                        : pago.dias_restantes === 0 
                        ? '¡Hoy!' 
                        : `${pago.dias_restantes} días`}
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleMarcarPagado(pago.id, pago.monto_estimado)}
                        className="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold border-2 border-green-600 hover:bg-green-600 hover:text-white transition-all text-sm"
                      >
                        ✓ Pagado
                      </button>
                      <button
                        onClick={() => handleVerPropiedad(pago.propiedad_id)}
                        className="px-4 py-2 bg-white/80 rounded-lg font-semibold hover:bg-white transition-all text-sm border-2 border-current"
                      >
                        Ver →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title={pagos.length === 0 ? "No hay pagos pendientes" : "No se encontraron pagos"}
            description={pagos.length === 0 
              ? "¡Excelente! No tienes pagos pendientes en este momento"
              : "Intenta ajustar los filtros de búsqueda"
            }
          />
        )}
      </main>
    </div>
  )
}
