'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import { useConfirm } from '@/components/ui/confirm-modal'
import { logger } from '@/lib/logger'
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
  foto_portada?: string | null
  colaboradores?: { user_id: string; nombre: string; email: string }[]
}

export default function CatalogoPage() {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [showCompartir, setShowCompartir] = useState(false)
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Propiedad | null>(null)
  
  const [busqueda, setBusqueda] = useState('')
  const [filtroPropiedad, setFiltroPropiedad] = useState<'todos' | 'propios' | 'compartidos'>('todos')
  
  const draftIdRef = useRef<string | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => { 
    checkUser()
    
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
      .select('id, user_id, nombre, created_at')
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
        .select('id, user_id, nombre, created_at')
        .in('id', idsCompartidos)
      propiedadesCompartidasData = datosCompartidos || []
    }
    
    const todasPropiedades = [
      ...(propiedadesPropias || []).map(p => ({ ...p, es_propio: true })),
      ...(propiedadesCompartidasData || []).map(p => ({ ...p, es_propio: false }))
    ]
    
    for (const prop of todasPropiedades) {
      const { data: colaboradores } = await supabase
        .from('propiedades_colaboradores')
        .select(`
          user_id,
          profiles:user_id (
            nombre:nombre,
            email:email
          )
        `)
        .eq('propiedad_id', prop.id)
      
      prop.colaboradores = colaboradores?.map(c => ({
        user_id: c.user_id,
        nombre: (c as any).profiles?.nombre || 'Sin nombre',
        email: (c as any).profiles?.email || 'Sin email'
      })) || []
      
      const { data: fotoPortada } = await supabase
        .from('property_images')
        .select('url_thumbnail')
        .eq('property_id', prop.id)
        .eq('is_cover', true)
        .single()
      
      prop.foto_portada = fotoPortada?.url_thumbnail || null
    }
    
    setPropiedades(todasPropiedades)
  }

  const abrirCompartir = (propiedad: Propiedad) => {
    setPropiedadSeleccionada(propiedad)
    setShowCompartir(true)
  }

  const abrirHome = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}/home`)
  }

  const abrirGaleria = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}/galeria`)
  }

  const abrirInventario = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}/inventario`)
  }

  const abrirTickets = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}/tickets`)
  }

  const abrirCalendario = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}/calendario`)
  }

  const abrirBalance = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}/cuentas`)
  }

  const abrirAnuncio = (propiedadId: string) => {
    router.push(`/dashboard/anuncio/${propiedadId}`)
  }

  const editarPropiedad = (propiedadId: string) => {
    toast.info('Función de edición en desarrollo')
    logger.log('Editar propiedad:', propiedadId)
  }

  const eliminarPropiedad = async (propiedadId: string, nombrePropiedad: string) => {
    if (!user?.id) return

    const confirmed = await confirm.danger(
      `¿Eliminar "${nombrePropiedad}"?`,
      'Esta acción NO se puede deshacer. Se eliminarán todos los datos, colaboradores, fotos, tickets y todo el historial.'
    )

    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('propiedades')
        .delete()
        .eq('id', propiedadId)
        .eq('user_id', user.id)

      if (error) throw error

      await cargarPropiedades(user.id)
      toast.success(`Propiedad "${nombrePropiedad}" eliminada correctamente`)
    } catch (error: any) {
      logger.error('Error al eliminar propiedad:', error)
      toast.error('Error al eliminar la propiedad')
    }
  }

  const handleLogout = async () => {
    const confirmed = await confirm.warning('¿Cerrar sesión?')
    if (!confirmed) return
    
    await supabase.auth.signOut()
    router.push('/login')
  }


  // ====================================
  // 🔧 HELPER: Convertir formato antiguo a nuevo
  // ====================================
  const convertirANuevoFormato = (data: any) => {
    // Construir ubicacion (nuevo o desde campos sueltos)
    const ubicacionFinal = data.ubicacion && typeof data.ubicacion === 'object' 
      ? data.ubicacion 
      : {
          calle: data.calle || null,
          numero_exterior: data.numero_exterior || null,
          numero_interior: data.numero_interior || null,
          colonia: data.colonia || null,
          codigo_postal: data.codigo_postal || null,
          ciudad: data.ciudad || null,
          estado: data.estado || null,
          pais: data.pais || null,
          referencias: data.referencias || null,
          google_maps_link: data.google_maps_link || null,
          es_complejo: data.es_complejo || false,
          nombre_complejo: data.nombre_complejo || null,
          amenidades_complejo: data.amenidades_complejo || []
        };

    // ✅ NUEVO: Construir objeto precios consolidado
    const preciosFinal = data.precios || {
      mensual: data.precios?.mensual || null,
      noche: data.precios?.noche || null,
      venta: data.precios?.venta || null
    };

    // Convertir formato antiguo a nuevo
    return {
      ...data,
      ubicacion: ubicacionFinal,
      
      // ✅ NUEVO: Campo precios consolidado
      precios: preciosFinal,
      
      // Construir datos condicionales desde campos sueltos
      datos_renta_largo_plazo: data.datos_renta_largo_plazo || (data.inquilino_id ? {
        inquilino_id: data.inquilino_id || null,
        fecha_inicio_contrato: data.fecha_inicio_contrato || null,
        duracion_contrato: data.duracion_contrato || null,
        frecuencia_pago: data.frecuencia_pago || null,
        dia_pago: data.dia_pago || null,
        precio_renta_disponible: data.precio_renta_disponible || null,
        requisitos_renta: data.requisitos_renta || [],
        requisitos_renta_custom: data.requisitos_renta_custom || []
      } : null),
      datos_renta_vacacional: data.datos_renta_vacacional || (data.amenidades_vacacional?.length > 0 ? {
        amenidades_vacacional: data.amenidades_vacacional || [],
        estancia_minima: data.estancia_minima || null,
        politicas: data.politicas || null
      } : null),
      datos_venta: data.datos_venta || null
    };
  };

  // ====================================
  // ✅ FUNCIÓN DE GUARDADO FINAL - ESTRUCTURA JSON OPTIMIZADA
  // ====================================
  const handleWizardSave = async (data: PropertyFormData) => {
    if (!user?.id) {
      logger.warn('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    try {
      // 🔧 Convertir a nuevo formato si es necesario
      const dataConvertida = convertirANuevoFormato(data);
      
      // ✅ ESTRUCTURA OPTIMIZADA CON JSON (25 columnas en vez de 50+)
      const propiedadData = {
        user_id: user.id,
        nombre: dataConvertida.nombre_propiedad,
        tipo_propiedad: dataConvertida.tipo_propiedad,
        estados: dataConvertida.estados,
        
        // Datos básicos
        mobiliario: dataConvertida.mobiliario,
        capacidad_personas: dataConvertida.capacidad_personas || null,
        tamano_terreno: dataConvertida.tamano_terreno || null,
        tamano_construccion: dataConvertida.tamano_construccion || null,
        
        // ✅ UBICACIÓN como JSON (toda la dirección en un solo campo)
        ubicacion: dataConvertida.ubicacion || null,
        
        // Espacios
        espacios: dataConvertida.espacios || [],
        
        // ✅ PRECIOS consolidados en un solo JSON
        precios: dataConvertida.precios || null,
        
        // ✅ Datos condicionales según estados (también JSON)
        datos_renta_largo_plazo: dataConvertida.datos_renta_largo_plazo || null,
        datos_renta_vacacional: dataConvertida.datos_renta_vacacional || null,
        datos_venta: dataConvertida.datos_venta || null,
        
        // Contactos
        propietario_id: dataConvertida.propietario_id || null,
        supervisor_id: dataConvertida.supervisor_id || null,
        
        // Control
        is_draft: false,
        updated_at: new Date().toISOString()
      };

      let propiedadId: string;

      // Actualizar o crear propiedad
      if (draftIdRef.current) {
        const { error } = await supabase
          .from('propiedades')
          .update(propiedadData)
          .eq('id', draftIdRef.current);
        
        if (error) throw error;
        propiedadId = draftIdRef.current;
        
      } else {
        const { data: propiedad, error } = await supabase
          .from('propiedades')
          .insert({
            ...propiedadData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        propiedadId = propiedad.id;
      }

      // ========================================
      // GUARDAR SERVICIOS
      // ========================================
      if (data.servicios && data.servicios.length > 0) {
        logger.log('Guardando servicios...', data.servicios.length);
        
        // Preparar servicios para insertar
        const serviciosParaInsertar = data.servicios.map(servicio => ({
          propiedad_id: propiedadId,
          tipo_servicio: servicio.tipo_servicio,
          nombre: servicio.nombre,
          numero_contrato: servicio.numero_contrato || null,
          monto: servicio.monto,
          es_fijo: servicio.es_fijo,
          ultima_fecha_pago: servicio.ultima_fecha_pago,
          frecuencia_valor: servicio.frecuencia_valor,
          frecuencia_unidad: servicio.frecuencia_unidad,
          link_pago: servicio.link_pago || null,
          activo: true,
          notas: servicio.notas || null
        }));

        // Insertar servicios en Supabase
        const { error: errorServicios } = await supabase
          .from('servicios_inmueble')
          .insert(serviciosParaInsertar);

        if (errorServicios) {
          logger.error('Error al guardar servicios:', errorServicios);
          toast.error('Propiedad guardada pero hubo un error al guardar los servicios');
        } else {
          logger.log('✅ Servicios guardados correctamente');
        }
      }

      draftIdRef.current = null;
      cargarPropiedades(user.id);
      toast.success('Propiedad guardada correctamente');
      
    } catch (error) {
      logger.error('Error al guardar propiedad:', error);
      toast.error('Error al guardar la propiedad');
      throw error;
    }
  };

  // ====================================
  // ✅ FUNCIÓN DE GUARDADO BORRADOR - ESTRUCTURA JSON OPTIMIZADA
  // ====================================
  const handleWizardSaveDraft = async (data: PropertyFormData) => {
    if (!user?.id) {
      logger.warn('Usuario no autenticado');
      return;
    }

    if (isSavingRef.current) {
      logger.log('Ya hay un guardado en proceso');
      return;
    }

    isSavingRef.current = true;

    try {
      // 🔧 Convertir a nuevo formato si es necesario
      const dataConvertida = convertirANuevoFormato(data);
      
      // ✅ ESTRUCTURA OPTIMIZADA CON JSON (25 columnas en vez de 50+)
      const draftData = {
        user_id: user.id,
        nombre: dataConvertida.nombre_propiedad || 'Borrador sin nombre',
        tipo_propiedad: dataConvertida.tipo_propiedad,
        estados: dataConvertida.estados,
        
        // Datos básicos
        mobiliario: dataConvertida.mobiliario,
        capacidad_personas: dataConvertida.capacidad_personas || null,
        tamano_terreno: dataConvertida.tamano_terreno || null,
        tamano_construccion: dataConvertida.tamano_construccion || null,
        
        // ✅ UBICACIÓN como JSON
        ubicacion: dataConvertida.ubicacion || null,
        
        // Espacios
        espacios: dataConvertida.espacios || [],
        
        // ✅ PRECIOS consolidados en un solo JSON
        precios: dataConvertida.precios || null,
        
        // ✅ Datos condicionales
        datos_renta_largo_plazo: dataConvertida.datos_renta_largo_plazo || null,
        datos_renta_vacacional: dataConvertida.datos_renta_vacacional || null,
        datos_venta: dataConvertida.datos_venta || null,
        
        // Contactos
        propietario_id: dataConvertida.propietario_id || null,
        supervisor_id: dataConvertida.supervisor_id || null,
        
        // Control
        is_draft: true,
        updated_at: new Date().toISOString()
      };

      let propiedadId: string;

      if (draftIdRef.current) {
        const { error } = await supabase
          .from('propiedades')
          .update(draftData)
          .eq('id', draftIdRef.current);

        if (error) throw error;
        propiedadId = draftIdRef.current;
        logger.log(`Borrador actualizado: ${draftIdRef.current}`);
        
      } else {
        const { data: nuevoBorrador, error } = await supabase
          .from('propiedades')
          .insert({
            ...draftData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (error) throw error;
        
        draftIdRef.current = nuevoBorrador.id;
        propiedadId = nuevoBorrador.id;
        logger.log(`Borrador creado: ${nuevoBorrador.id}`);
      }

      // Guardar servicios en borrador (opcional)
      if (data.servicios && data.servicios.length > 0) {
        logger.log('Guardando servicios en borrador...', data.servicios.length);
        
        // Primero eliminar servicios existentes del borrador
        await supabase
          .from('servicios_inmueble')
          .delete()
          .eq('propiedad_id', propiedadId);

        // Insertar servicios actualizados
        const serviciosParaInsertar = data.servicios.map(servicio => ({
          propiedad_id: propiedadId,
          tipo_servicio: servicio.tipo_servicio,
          nombre: servicio.nombre,
          numero_contrato: servicio.numero_contrato || null,
          monto: servicio.monto,
          es_fijo: servicio.es_fijo,
          ultima_fecha_pago: servicio.ultima_fecha_pago,
          frecuencia_valor: servicio.frecuencia_valor,
          frecuencia_unidad: servicio.frecuencia_unidad,
          link_pago: servicio.link_pago || null,
          activo: true,
          notas: servicio.notas || null
        }));

        await supabase
          .from('servicios_inmueble')
          .insert(serviciosParaInsertar);
        
        logger.log('✅ Servicios de borrador guardados');
      }

    } catch (error) {
      logger.error('Error al guardar borrador:', error);
    } finally {
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
    }
  };

  const handleCloseWizard = () => {
    draftIdRef.current = null;
    isSavingRef.current = false;
    setShowWizard(false);
  };

  const propiedadesFiltradas = propiedades.filter(prop => {
    const cumpleBusqueda = prop.nombre.toLowerCase().includes(busqueda.toLowerCase())
    
    const cumpleFiltro = 
      filtroPropiedad === 'todos' ||
      (filtroPropiedad === 'propios' && prop.es_propio) ||
      (filtroPropiedad === 'compartidos' && !prop.es_propio)
    
    return cumpleBusqueda && cumpleFiltro
  })

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
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-300 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-ras-primary focus:outline-none transition-colors"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={filtroPropiedad}
                onChange={(e) => setFiltroPropiedad(e.target.value as 'todos' | 'propios' | 'compartidos')}
                className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-2 pr-10 font-medium text-gray-700 hover:border-ras-primary focus:border-ras-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="todos">📋 Todos</option>
                <option value="propios">🏠 Propios</option>
                <option value="compartidos">👥 Compartidos</option>
              </select>
              <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>

        {propiedadesFiltradas.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Encabezados de la tabla */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-3">
              <div className="flex items-center gap-4">
                <div className="w-20"></div>
                <div className="flex-1"></div>
                <div className="flex gap-4">
                  <div className="w-12 text-center text-xs font-semibold text-green-600">Home</div>
                  <div className="w-12 text-center text-xs font-semibold text-cyan-600">Calendario</div>
                  <div className="w-12 text-center text-xs font-semibold text-orange-600">Tickets</div>
                  <div className="w-12 text-center text-xs font-semibold text-gray-600">Inventario</div>
                  <div className="w-12 text-center text-xs font-semibold text-pink-600">Galería</div>
                  <div className="w-12 text-center text-xs font-semibold text-yellow-600">Anuncio</div>
                  <div className="w-12 text-center text-xs font-semibold text-emerald-600">Balance</div>
                </div>
              </div>
            </div>

            {/* Filas de propiedades */}
            <div className="divide-y divide-gray-100">
              {propiedadesFiltradas.map((prop) => (
                <div 
                  key={prop.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Foto thumbnail */}
                    <div>
                      <img 
                        src={prop.foto_portada || "https://via.placeholder.com/80x60/f3f4f6/9ca3af?text=Sin+foto"}
                        alt={prop.nombre}
                        className="w-20 h-16 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80x60/f3f4f6/9ca3af?text=Sin+foto"
                        }}
                      />
                    </div>

                    {/* Info de la propiedad */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-800 font-poppins">
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
                      
                      <div className="text-xs text-gray-400">
                        ID: {prop.id.slice(0, 8)}...
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-4">
                      {/* Home */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirHome(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-green-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      </button>

                      {/* Calendario */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirCalendario(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-cyan-200 bg-cyan-50 hover:bg-cyan-100 hover:border-cyan-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-cyan-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </button>

                      {/* Tickets */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirTickets(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-orange-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="9" y1="15" x2="15" y2="15"/>
                          <line x1="9" y1="12" x2="12" y2="12"/>
                        </svg>
                      </button>

                      {/* Inventario */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirInventario(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-gray-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                          <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                      </button>

                      {/* Galería */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirGaleria(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 hover:border-pink-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-pink-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </button>

                      {/* Anuncio */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirAnuncio(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-yellow-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                      </button>

                      {/* Balance */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirBalance(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C6.5 2 2 4.5 2 7.5v1C2 11.5 6.5 14 12 14s10-2.5 10-5.5v-1C22 4.5 17.5 2 12 2z"/><path d="M2 12c0 3 4.5 5.5 10 5.5S22 15 22 12"/><path d="M2 16.5c0 3 4.5 5.5 10 5.5s10-2.5 10-5.5"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState 
            icon={
              <svg className="w-12 h-12 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            }
            title={propiedades.length === 0 ? "No tienes propiedades" : "No se encontraron resultados"}
            description={propiedades.length === 0 ? "Usa el botón + para crear tu primera propiedad" : "Intenta con otra búsqueda o cambia los filtros"}
            actionLabel={propiedades.length === 0 ? "+ Crear Propiedad" : undefined}
            onAction={propiedades.length === 0 ? () => setShowWizard(true) : undefined}
          />
        )}
      </main>

      {showCompartir && propiedadSeleccionada && (
        <CompartirPropiedad
          isOpen={showCompartir}
          onClose={() => {
            setShowCompartir(false)
            setPropiedadSeleccionada(null)
            if (user?.id) cargarPropiedades(user.id)
          }}
          propiedadId={propiedadSeleccionada.id}
          propiedadNombre={propiedadSeleccionada.nombre}
          userId={user.id}
          esPropio={propiedadSeleccionada.es_propio}
        />
      )}

      {showWizard && (
        <WizardModal
          isOpen={showWizard}
          onClose={handleCloseWizard}
          onSave={handleWizardSave}
          onSaveDraft={handleWizardSaveDraft}
        />
      )}
    </div>
  )
}