'use client'

import { useEffect, useState, useRef } from 'react'
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
  foto_portada?: string | null
  colaboradores?: { user_id: string; nombre: string; email: string }[]
}

export default function CatalogoPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [showCompartir, setShowCompartir] = useState(false)
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState<Propiedad | null>(null)
  
  // Estados para búsqueda y filtro
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
    
    // Cargar colaboradores y foto de portada para cada propiedad
    for (const prop of todasPropiedades) {
      // Cargar colaboradores
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
        nombre: c.profiles?.nombre || 'Sin nombre',
        email: c.profiles?.email || ''
      })) || []

      // Cargar foto de portada (is_cover = true)
      const { data: fotoPortada } = await supabase
        .from('property_images')
        .select('url_thumbnail')
        .eq('property_id', prop.id)
        .eq('is_cover', true)
        .single()
      
      prop.foto_portada = fotoPortada?.url_thumbnail || null
    }
    
    todasPropiedades.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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

  const abrirCuentas = (propiedadId: string) => {
    router.push(`/dashboard/propiedad/${propiedadId}/cuentas`)
  }

  const editarPropiedad = (propiedadId: string) => {
    alert('Editar propiedad: ' + propiedadId)
  }

  const eliminarPropiedad = async (propiedadId: string, nombrePropiedad: string) => {
    if (!user?.id) return

    const confirmar = confirm(
      `¿Estás seguro que deseas eliminar la propiedad "${nombrePropiedad}"?\n\n` +
      'Esta acción NO se puede deshacer y se eliminarán:\n' +
      '• Todos los datos de la propiedad\n' +
      '• Colaboradores asociados\n' +
      '• Fotos y documentos\n' +
      '• Tickets y servicios\n' +
      '• Todo el historial'
    )

    if (!confirmar) return

    try {
      // Eliminar la propiedad (las eliminaciones en cascada están configuradas en la BD)
      const { error } = await supabase
        .from('propiedades')
        .delete()
        .eq('id', propiedadId)
        .eq('user_id', user.id) // Solo puede eliminar el propietario

      if (error) throw error

      // Recargar propiedades
      await cargarPropiedades(user.id)
      
      alert(`✅ Propiedad "${nombrePropiedad}" eliminada correctamente`)
    } catch (error: any) {
      console.error('Error al eliminar propiedad:', error)
      alert('❌ Error al eliminar la propiedad: ' + error.message)
    }
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  const handleWizardSave = async (data: PropertyFormData) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const propiedadData = {
        user_id: user.id,
        nombre: data.nombre_propiedad,
        tipo_propiedad: data.tipo_propiedad,
        estados: data.estados,
        mobiliario: data.mobiliario,
        capacidad_personas: data.capacidad_personas ? parseInt(data.capacidad_personas) : null,
        tamano_terreno: data.tamano_terreno ? parseFloat(data.tamano_terreno) : null,
        tamano_terreno_unit: data.tamano_terreno_unit,
        tamano_construccion: data.tamano_construccion ? parseFloat(data.tamano_construccion) : null,
        tamano_construccion_unit: data.tamano_construccion_unit,
        propietario_id: data.propietario_id,
        supervisor_id: data.supervisor_id || null,
        inquilino_id: data.inquilino_id || null,
        fecha_inicio_contrato: data.fecha_inicio_contrato || null,
        costo_renta_mensual: data.costo_renta_mensual ? parseFloat(data.costo_renta_mensual) : null,
        precio_noche: data.precio_noche ? parseFloat(data.precio_noche) : null,
        amenidades_vacacional: data.amenidades_vacacional || [],
        precio_venta: data.precio_venta ? parseFloat(data.precio_venta) : null,
        espacios: data.espacios,
        is_draft: false,
        updated_at: new Date().toISOString()
      };

      if (draftIdRef.current) {
        const { error } = await supabase
          .from('propiedades')
          .update(propiedadData)
          .eq('id', draftIdRef.current);
        
        if (error) throw error;
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
      }

      draftIdRef.current = null;
      cargarPropiedades(user.id);
      
    } catch (error) {
      console.error('Error al guardar propiedad:', error);
      throw error;
    }
  };

  const handleWizardSaveDraft = async (data: PropertyFormData) => {
    if (!user?.id) {
      console.warn('Usuario no autenticado');
      return;
    }

    if (isSavingRef.current) {
      console.log('⏳ Ya hay un guardado en proceso, saltando...');
      return;
    }

    isSavingRef.current = true;

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

      if (draftIdRef.current) {
        const { error } = await supabase
          .from('propiedades')
          .update(draftData)
          .eq('id', draftIdRef.current);

        if (error) throw error;
        console.log(`✅ Borrador actualizado (ID: ${draftIdRef.current})`);
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
        console.log(`✅ Nuevo borrador creado (ID: ${nuevoBorrador.id})`);
      }

    } catch (error) {
      console.error('Error al guardar borrador:', error);
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
        {/* Barra con búsqueda, filtro y títulos (sin sticky) */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-300 p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Buscador tamaño completo */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o código postal..."
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

            {/* Dropdown de filtro */}
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

        {propiedades.filter(prop => {
          // Filtrar por búsqueda
          const matchBusqueda = busqueda === '' || 
            prop.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (prop.codigo_postal && prop.codigo_postal.includes(busqueda))
          
          // Filtrar por tipo
          const matchTipo = 
            filtroPropiedad === 'todos' ||
            (filtroPropiedad === 'propios' && prop.es_propio) ||
            (filtroPropiedad === 'compartidos' && !prop.es_propio)
          
          return matchBusqueda && matchTipo
        }).length > 0 ? (
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
                  <div className="w-12 text-center text-xs font-semibold text-amber-600">Inventario</div>
                  <div className="w-12 text-center text-xs font-semibold text-pink-600">Galería</div>
                </div>
              </div>
            </div>

            {/* Filas de propiedades */}
            <div className="divide-y divide-gray-100">
              {propiedades.filter(prop => {
                // Filtrar por búsqueda
                const matchBusqueda = busqueda === '' || 
                  prop.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                  (prop.codigo_postal && prop.codigo_postal.includes(busqueda))
                
                // Filtrar por tipo
                const matchTipo = 
                  filtroPropiedad === 'todos' ||
                  (filtroPropiedad === 'propios' && prop.es_propio) ||
                  (filtroPropiedad === 'compartidos' && !prop.es_propio)
                
                return matchBusqueda && matchTipo
              }).map((prop) => (
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
                      {/* 0. Home */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirHome(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-green-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      </button>

                      {/* 1. Calendario */}
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

                      {/* 2. Tickets */}
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

                      {/* 3. Inventario */}
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirInventario(prop.id); }}
                        className="w-12 h-12 rounded-lg border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 hover:scale-110 transition-all flex items-center justify-center group"
                      >
                        <svg className="w-7 h-7 text-amber-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                          <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                      </button>

                      {/* 4. Galería */}
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

      {/* Componente Compartir Propiedad */}
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

      {/* Wizard Modal */}
      <WizardModal
        isOpen={showWizard}
        onClose={handleCloseWizard}
        onSave={handleWizardSave}
        onSaveDraft={handleWizardSaveDraft}
      />
    </div>
  )
}