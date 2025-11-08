'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TopBar from '@/components/ui/topbar'
import Loading from '@/components/ui/loading'
import EmptyState from '@/components/ui/emptystate'
import ContactoModal from './components/ContactoModal'

interface Contacto {
  id: string
  user_id: string
  nombre: string
  telefono: string
  correo: string
  tipo: 'inquilino' | 'proveedor'
  created_at: string
}

export default function DirectorioPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [showModal, setShowModal] = useState(false)
  const [contactoEditar, setContactoEditar] = useState<Contacto | null>(null)
  
  // Estados para búsqueda y filtro
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'inquilino' | 'proveedor'>('todos')

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
    cargarContactos(authUser.id)
    setLoading(false)
  }

  const cargarContactos = async (userId: string) => {
    const { data, error } = await supabase
      .from('contactos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error cargando contactos:', error)
      return
    }
    
    setContactos(data || [])
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  const handleAgregarContacto = () => {
    setContactoEditar(null)
    setShowModal(true)
  }

  const handleEditarContacto = (contacto: Contacto, e: React.MouseEvent) => {
    e.stopPropagation()
    setContactoEditar(contacto)
    setShowModal(true)
  }

  const handleEliminarContacto = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('¿Estás seguro que deseas eliminar este contacto?')) {
      return
    }

    const { error } = await supabase
      .from('contactos')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error al eliminar contacto')
      console.error(error)
      return
    }

    if (user?.id) {
      cargarContactos(user.id)
    }
  }

  const handleGuardarContacto = async (data: Omit<Contacto, 'id' | 'user_id' | 'created_at'>) => {
    if (!user?.id) {
      alert('Usuario no autenticado')
      return
    }

    if (contactoEditar) {
      // Editar contacto existente
      const { error } = await supabase
        .from('contactos')
        .update({
          nombre: data.nombre,
          telefono: data.telefono,
          correo: data.correo,
          tipo: data.tipo
        })
        .eq('id', contactoEditar.id)

      if (error) {
        alert('Error al actualizar contacto')
        console.error(error)
        return
      }
    } else {
      // Crear nuevo contacto
      const { error } = await supabase
        .from('contactos')
        .insert({
          user_id: user.id,
          nombre: data.nombre,
          telefono: data.telefono,
          correo: data.correo,
          tipo: data.tipo
        })

      if (error) {
        alert('Error al crear contacto')
        console.error(error)
        return
      }
    }

    setShowModal(false)
    setContactoEditar(null)
    cargarContactos(user.id)
  }

  const contactosFiltrados = contactos.filter(contacto => {
    const matchBusqueda = busqueda === '' || 
      contacto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      contacto.telefono.includes(busqueda) ||
      contacto.correo.toLowerCase().includes(busqueda.toLowerCase())
    
    const matchTipo = filtroTipo === 'todos' || contacto.tipo === filtroTipo
    
    return matchBusqueda && matchTipo
  })

  if (loading) {
    return <Loading message="Cargando directorio..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title="Directorio"
        showBackButton={true}
        showAddButton={false}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtroTipo === 'todos'
                  ? 'bg-yellow-400 text-gray-800 shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('inquilino')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtroTipo === 'inquilino'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Inquilinos
            </button>
            <button
              onClick={() => setFiltroTipo('proveedor')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtroTipo === 'proveedor'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Proveedores
            </button>
          </div>
        </div>

        {/* Lista de contactos */}
        {contactosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactosFiltrados.map((contacto) => (
              <div
                key={contacto.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-all"
              >
                {/* Header con tipo */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar con icono */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      contacto.tipo === 'inquilino' 
                        ? 'bg-blue-100' 
                        : 'bg-purple-100'
                    }`}>
                      {contacto.tipo === 'inquilino' ? (
                        <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 7h-9" />
                          <path d="M14 17H5" />
                          <circle cx="17" cy="17" r="3" />
                          <circle cx="7" cy="7" r="3" />
                        </svg>
                      )}
                    </div>

                    {/* Nombre y badge */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {contacto.nombre}
                      </h3>
                      <span className={`inline-block text-xs px-2 py-1 rounded-md font-semibold ${
                        contacto.tipo === 'inquilino'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {contacto.tipo === 'inquilino' ? '🏠 Inquilino' : '🔧 Proveedor'}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleEditarContacto(contacto, e)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleEliminarContacto(contacto.id, e)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="space-y-2">
                  {/* Teléfono */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <a href={`tel:${contacto.telefono}`} className="hover:text-yellow-600 transition-colors">
                      {contacto.telefono}
                    </a>
                  </div>

                  {/* Correo */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <a href={`mailto:${contacto.correo}`} className="hover:text-yellow-600 transition-colors truncate">
                      {contacto.correo}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={
              <svg className="w-12 h-12 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            title={contactos.length === 0 ? "No tienes contactos" : "No se encontraron resultados"}
            description={contactos.length === 0 ? "Usa el botón + para agregar tu primer contacto" : "Intenta con otra búsqueda o cambia los filtros"}
            actionLabel={contactos.length === 0 ? "+ Agregar Contacto" : undefined}
            onAction={contactos.length === 0 ? handleAgregarContacto : undefined}
          />
        )}
      </main>

      {/* Modal para agregar/editar contacto */}
      <ContactoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setContactoEditar(null)
        }}
        onSave={handleGuardarContacto}
        contacto={contactoEditar}
      />

      {/* Botón flotante para agregar contacto */}
      <button
        onClick={handleAgregarContacto}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
        title="Agregar contacto"
      >
        <svg className="w-8 h-8 text-gray-800 group-hover:rotate-90 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}
