'use client'

/**
 * CALENDARIO - Vista Consolidada
 * Vista de calendario mensual con todos los pagos de todas las propiedades
 * Dashboard global de calendario del sistema RAS
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import TopBar from '@/components/ui/topbar'
import Loading from '@/components/ui/loading'

interface Pago {
  id: string
  fecha_pago: string
  monto_estimado: number
  servicio_nombre: string
  tipo_servicio: string
  propiedad_id: string
  propiedad_nombre: string
}

interface DiaCalendario {
  fecha: Date
  dia: number
  esHoy: boolean
  esMesActual: boolean
  pagos: Pago[]
  montoTotal: number
}

export default function CalendarioGlobalPage() {
  const router = useRouter()
  const toast = useToast()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [mesActual, setMesActual] = useState(new Date())
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([])
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (pagos.length > 0) {
      generarCalendario()
    }
  }, [mesActual, pagos])

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

      if (todasPropiedades.length === 0) {
        setPagos([])
        return
      }

      // Cargar pagos de los próximos 3 meses
      const hoy = new Date()
      const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
      const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 3, 0)

      const propIds = todasPropiedades.map(p => p.id)
      const { data: pagosData, error: pagosError } = await supabase
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
        .gte('fecha_pago', fechaInicio.toISOString().split('T')[0])
        .lte('fecha_pago', fechaFin.toISOString().split('T')[0])
        .order('fecha_pago', { ascending: true })

      if (pagosError) {
        console.error('Error cargando pagos:', pagosError)
        return
      }

      const pagosTransformados = (pagosData || []).map(pago => {
        const propiedad = todasPropiedades.find(p => p.id === pago.propiedad_id)
        return {
          id: pago.id,
          fecha_pago: pago.fecha_pago,
          monto_estimado: pago.monto_estimado,
          servicio_nombre: pago.servicios_inmueble.nombre,
          tipo_servicio: pago.servicios_inmueble.tipo_servicio,
          propiedad_id: pago.propiedad_id,
          propiedad_nombre: propiedad?.nombre || 'Sin nombre'
        }
      })

      setPagos(pagosTransformados)

    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar calendario')
    }
  }

  const generarCalendario = () => {
    const año = mesActual.getFullYear()
    const mes = mesActual.getMonth()
    
    // Primer día del mes
    const primerDia = new Date(año, mes, 1)
    const diaSemana = primerDia.getDay() // 0 = domingo
    
    // Último día del mes
    const ultimoDia = new Date(año, mes + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    
    // Días del mes anterior para completar la primera semana
    const diasMesAnterior = diaSemana === 0 ? 6 : diaSemana - 1
    const primerDiaVisible = new Date(año, mes, 1 - diasMesAnterior)
    
    // Generar 42 días (6 semanas)
    const dias: DiaCalendario[] = []
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 42; i++) {
      const fecha = new Date(primerDiaVisible)
      fecha.setDate(primerDiaVisible.getDate() + i)
      
      const esMesActual = fecha.getMonth() === mes
      const esHoy = fecha.getTime() === hoy.getTime()
      
      // Filtrar pagos de este día
      const pagosDelDia = pagos.filter(pago => {
        const fechaPago = new Date(pago.fecha_pago)
        return fechaPago.getDate() === fecha.getDate() &&
               fechaPago.getMonth() === fecha.getMonth() &&
               fechaPago.getFullYear() === fecha.getFullYear()
      })
      
      const montoTotal = pagosDelDia.reduce((sum, p) => sum + p.monto_estimado, 0)
      
      dias.push({
        fecha,
        dia: fecha.getDate(),
        esHoy,
        esMesActual,
        pagos: pagosDelDia,
        montoTotal
      })
    }
    
    setDiasCalendario(dias)
  }

  const cambiarMes = (incremento: number) => {
    const nuevaFecha = new Date(mesActual)
    nuevaFecha.setMonth(mesActual.getMonth() + incremento)
    setMesActual(nuevaFecha)
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

  const nombreMes = mesActual.toLocaleDateString('es-MX', { 
    month: 'long', 
    year: 'numeric' 
  })

  const estadisticasMes = {
    totalPagos: diasCalendario.reduce((sum, dia) => sum + dia.pagos.length, 0),
    montoTotal: diasCalendario.reduce((sum, dia) => sum + dia.montoTotal, 0),
    diasConPagos: diasCalendario.filter(dia => dia.pagos.length > 0 && dia.esMesActual).length
  }

  if (loading) {
    return <Loading message="Cargando calendario..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar
        title="📅 Calendario"
        showBackButton
        onBackClick={() => router.push('/dashboard')}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-5 py-5">
        
        {/* Header con navegación de mes */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {nombreMes}
            </h2>

            <button
              onClick={() => cambiarMes(1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Estadísticas del mes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{estadisticasMes.totalPagos}</div>
              <div className="text-xs text-gray-600">Pagos programados</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                ${(estadisticasMes.montoTotal / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-gray-600">Monto total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{estadisticasMes.diasConPagos}</div>
              <div className="text-xs text-gray-600">Días con pagos</div>
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
              <div key={dia} className="text-center font-bold text-gray-600 text-sm py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {diasCalendario.map((dia, index) => {
              const colorDia = dia.esHoy 
                ? 'bg-orange-500 text-white' 
                : dia.esMesActual 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-gray-50 text-gray-400'

              const tienePagos = dia.pagos.length > 0

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 rounded-lg border-2 transition-all ${
                    dia.esMesActual ? 'border-gray-200' : 'border-gray-100'
                  } ${tienePagos && dia.esMesActual ? 'hover:border-orange-400 cursor-pointer hover:shadow-md' : ''}`}
                >
                  <div className={`text-center text-sm font-bold mb-1 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${colorDia}`}>
                    {dia.dia}
                  </div>

                  {tienePagos && dia.esMesActual && (
                    <div className="space-y-1">
                      {dia.pagos.slice(0, 2).map(pago => (
                        <div
                          key={pago.id}
                          onClick={() => setPagoSeleccionado(pago)}
                          className="text-xs p-1 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-all"
                        >
                          <div className="flex items-center gap-1">
                            <span>{getTipoIcon(pago.tipo_servicio)}</span>
                            <span className="truncate flex-1 font-medium">
                              {pago.servicio_nombre}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-600 truncate">
                            {pago.propiedad_nombre}
                          </div>
                        </div>
                      ))}
                      {dia.pagos.length > 2 && (
                        <div className="text-[10px] text-center text-gray-500 font-semibold">
                          +{dia.pagos.length - 2} más
                        </div>
                      )}
                      <div className="text-[10px] text-center font-bold text-gray-700 mt-1">
                        ${(dia.montoTotal / 1000).toFixed(1)}K
                      </div>
                    </div>
                  )}

                  {tienePagos && !dia.esMesActual && (
                    <div className="flex justify-center">
                      <span className="text-xs text-gray-400">{dia.pagos.length}📋</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Modal de detalle de pago */}
        {pagoSeleccionado && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPagoSeleccionado(null)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
                    {getTipoIcon(pagoSeleccionado.tipo_servicio)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {pagoSeleccionado.servicio_nombre}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pagoSeleccionado.propiedad_nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPagoSeleccionado(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600">Fecha de pago</span>
                  <span className="text-sm font-bold">
                    {new Date(pagoSeleccionado.fecha_pago).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600">Monto</span>
                  <span className="text-lg font-bold text-green-600">
                    ${pagoSeleccionado.monto_estimado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => {
                    router.push(`/dashboard/propiedad/${pagoSeleccionado.propiedad_id}/tickets`)
                    setPagoSeleccionado(null)
                  }}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
                >
                  Ver todos los pagos de esta propiedad →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}