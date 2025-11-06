'use client'

/**
 * CUENTAS - Vista Consolidada
 * Muestra resumen financiero y tabla de movimientos (egresos e ingresos)
 * Dashboard global de cuentas del sistema RAS
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import TopBar from '@/components/ui/topbar'
import Loading from '@/components/ui/loading'
import EmptyState from '@/components/ui/emptystate'

interface Movimiento {
  id: string
  propiedad_nombre: string
  tipo: 'egreso' | 'ingreso'
  titulo: string
  monto: number
  responsable: string
  fecha: string
  propiedad_id: string
}

export default function CuentasGlobalPage() {
  const router = useRouter()
  const toast = useToast()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [propiedades, setPropiedades] = useState<{ id: string; nombre: string }[]>([])
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<string>('todas')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'egreso' | 'ingreso'>('todos')
  const [busqueda, setBusqueda] = useState('')

  // Estadísticas
  const [stats, setStats] = useState({
    totalEgresos: 0,
    totalIngresos: 0,
    balance: 0,
    propiedades: 0
  })

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
      // Cargar propiedades
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
        setMovimientos([])
        return
      }

      // Cargar EGRESOS (pagos pendientes)
      const propIds = todasPropiedades.map(p => p.id)
      const { data: pagos } = await supabase
        .from('fechas_pago_servicios')
        .select(`
          id,
          fecha_pago,
          monto_estimado,
          propiedad_id,
          servicios_inmueble!inner(
            nombre,
            tipo_servicio
          )
        `)
        .in('propiedad_id', propIds)
        .eq('pagado', false)
        .order('fecha_pago', { ascending: false })
        .limit(50)

      // Transformar pagos a movimientos (egresos)
      const movimientosEgresos: Movimiento[] = (pagos || []).map(pago => {
        const propiedad = todasPropiedades.find(p => p.id === pago.propiedad_id)
        return {
          id: pago.id,
          propiedad_nombre: propiedad?.nombre || 'Sin nombre',
          tipo: 'egreso' as const,
          titulo: pago.servicios_inmueble.nombre,
          monto: pago.monto_estimado,
          responsable: 'Sistema', // Placeholder
          fecha: pago.fecha_pago,
          propiedad_id: pago.propiedad_id
        }
      })

      // TODO: Aquí agregarás los INGRESOS cuando estén en la BD
      const movimientosIngresos: Movimiento[] = [
        // Ejemplo de ingreso (placeholder)
        // {
        //   id: 'ing-1',
        //   propiedad_nombre: 'Casa Example',
        //   tipo: 'ingreso',
        //   titulo: 'Renta Mensual',
        //   monto: 15000,
        //   responsable: 'Juan Pérez',
        //   fecha: '2024-12-01',
        //   propiedad_id: 'xxx'
        // }
      ]

      const todosMovimientos = [...movimientosEgresos, ...movimientosIngresos]
      setMovimientos(todosMovimientos)

      // Calcular estadísticas
      const totalEgresos = movimientosEgresos.reduce((sum, m) => sum + m.monto, 0)
      const totalIngresos = movimientosIngresos.reduce((sum, m) => sum + m.monto, 0)
      
      setStats({
        totalEgresos,
        totalIngresos,
        balance: totalIngresos - totalEgresos,
        propiedades: todasPropiedades.length
      })

    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar cuentas')
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto)
  }

  const movimientosFiltrados = movimientos.filter(mov => {
    // Filtro por propiedad
    if (propiedadSeleccionada !== 'todas' && mov.propiedad_id !== propiedadSeleccionada) return false
    
    // Filtro por tipo
    if (filtroTipo !== 'todos' && mov.tipo !== filtroTipo) return false
    
    // Búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase()
      return (
        mov.propiedad_nombre.toLowerCase().includes(searchLower) ||
        mov.titulo.toLowerCase().includes(searchLower) ||
        mov.responsable.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })

  // Calcular estadísticas filtradas
  const statsFiltrados = {
    totalEgresos: movimientosFiltrados.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0),
    totalIngresos: movimientosFiltrados.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0),
    balance: 0,
    totalMovimientos: movimientosFiltrados.length
  }
  statsFiltrados.balance = statsFiltrados.totalIngresos - statsFiltrados.totalEgresos

  if (loading) {
    return <Loading message="Cargando cuentas..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar
        title="💰 Cuentas"
        showBackButton
        onBackClick={() => router.push('/dashboard')}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtros arriba - Búsqueda y Dropdown de Propiedades */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border-2 border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por propiedad, título o responsable..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Dropdown Propiedades */}
            <div>
              <select
                value={propiedadSeleccionada}
                onChange={(e) => setPropiedadSeleccionada(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="todas">Todas las propiedades</option>
                {propiedades.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.nombre}</option>
                ))}
              </select>
            </div>

            {/* Filtro Tipo */}
            <div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="w-full md:w-48 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="egreso">Egresos</option>
                <option value="ingreso">Ingresos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumen Compacto - 4 tarjetas pequeñas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md border-2 border-red-200 p-4">
            <div className="text-xs font-semibold text-gray-500 mb-1">Egresos</div>
            <div className="text-2xl font-bold text-red-600">
              ${(statsFiltrados.totalEgresos / 1000).toFixed(1)}K
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-4">
            <div className="text-xs font-semibold text-gray-500 mb-1">Ingresos</div>
            <div className="text-2xl font-bold text-green-600">
              ${(statsFiltrados.totalIngresos / 1000).toFixed(1)}K
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-4">
            <div className="text-xs font-semibold text-gray-500 mb-1">Balance</div>
            <div className={`text-2xl font-bold ${statsFiltrados.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ${(statsFiltrados.balance / 1000).toFixed(1)}K
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-4">
            <div className="text-xs font-semibold text-gray-500 mb-1">Movimientos</div>
            <div className="text-2xl font-bold text-purple-600">
              {statsFiltrados.totalMovimientos}
            </div>
          </div>
        </div>

        {/* Tabla de Movimientos */}
        {movimientosFiltrados.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Propiedad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Responsable
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movimientosFiltrados.map((mov) => (
                    <tr 
                      key={mov.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {mov.propiedad_nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mov.tipo === 'egreso' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                            ↓ Egreso
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                            ↑ Ingreso
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{mov.titulo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`text-sm font-bold ${mov.tipo === 'egreso' ? 'text-red-600' : 'text-green-600'}`}>
                          {mov.tipo === 'egreso' ? '-' : '+'}{formatearMonto(mov.monto)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{mov.responsable}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatearFecha(mov.fecha)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => router.push(`/dashboard/propiedad/${mov.propiedad_id}/cuentas`)}
                          className="text-orange-600 hover:text-orange-700 font-semibold text-sm hover:underline"
                        >
                          Ver →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen al final de la tabla */}
            <div className="bg-gray-50 border-t-2 border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold text-gray-600">
                  Mostrando {movimientosFiltrados.length} movimiento{movimientosFiltrados.length !== 1 ? 's' : ''}
                </div>
                <div className="flex gap-6">
                  <div className="text-sm">
                    <span className="text-gray-600">Total Egresos: </span>
                    <span className="font-bold text-red-600">
                      -{formatearMonto(movimientosFiltrados.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0))}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Total Ingresos: </span>
                    <span className="font-bold text-green-600">
                      +{formatearMonto(movimientosFiltrados.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={
              <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            title="No hay movimientos"
            description={movimientos.length === 0 
              ? "Aún no tienes movimientos registrados"
              : "No se encontraron movimientos con los filtros aplicados"
            }
          />
        )}
      </main>
    </div>
  )
}