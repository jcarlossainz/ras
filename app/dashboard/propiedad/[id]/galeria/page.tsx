// 📁 src/app/dashboard/propiedad/[id]/galeria/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPropertyImages } from '@/lib/supabase/supabase-storage';
import { supabase } from '@/lib/supabase/client';
import { compressImageDual } from '@/lib/supabase/image-compression';
import { uploadPropertyImageDual } from '@/lib/supabase/supabase-storage';
import TopBar from '@/components/ui/topbar';
import Loading from '@/components/ui/loading';
import EmptyState from '@/components/ui/emptystate';
import type { PropertyFormData, PropertyImage } from '@/types/property';

export default function GaleriaPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [property, setProperty] = useState<PropertyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PropertyImage[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState('');

  useEffect(() => {
    checkUser();
  }, [propertyId]);

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { 
      router.push('/login'); 
      return; 
    }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
    setUser({ ...profile, id: authUser.id });
    loadProperty();
  };

  const loadProperty = async () => {
    try {
      setLoading(true);
      
      // 1. Cargar propiedad desde tabla propiedades
      console.log('🔍 Cargando propiedad:', propertyId);
      const { data: propertyData, error: propertyError } = await supabase
        .from('propiedades')
        .select('*')
        .eq('id', propertyId)
        .single();

      // 2. Si no existe, mostrar error
      if (propertyError) {
        console.error('❌ Propiedad no encontrada:', propertyError);
        throw propertyError;
      }

      // 3. Cargar fotos
      console.log('📸 Cargando fotos...');
      const photosData = await getPropertyImages(propertyId);
      console.log(`✅ ${photosData.length} fotos encontradas`);

      // 4. Preparar espacios desde la BD
      let propertySpaces = [];
      
      if (propertyData?.espacios && Array.isArray(propertyData.espacios) && propertyData.espacios.length > 0) {
        // Mapear espacios reales del usuario
        propertySpaces = propertyData.espacios.map((espacio: any) => ({
          id: espacio.id || espacio.type,
          name: espacio.name,
          type: espacio.type,
          icon: getEspacioIcon(espacio.type)
        }));
        console.log('✅ Usando espacios reales del usuario:', propertySpaces.length);
      } else {
        // Espacios por defecto solo si no hay ninguno
        propertySpaces = [
          { id: 'sala', name: 'Sala', type: 'Sala', icon: '🛋️' },
          { id: 'cocina', name: 'Cocina', type: 'Cocina', icon: '🍳' },
          { id: 'recamara', name: 'Recámara', type: 'Habitación', icon: '🛏️' },
          { id: 'bano', name: 'Baño', type: 'Baño completo', icon: '🚿' },
        ];
        console.log('⚠️ Usando espacios por defecto');
      }
      
      // Agregar "Sin espacio" y "General" al inicio
      const espaciosConOpciones = [
        { id: 'all', name: 'Todos', type: 'all', icon: '📋' },
        { id: 'sin-espacio', name: 'Sin espacio', type: 'sin-espacio', icon: '📦' },
        { id: 'general', name: 'General', type: 'general', icon: '🏠' },
        ...propertySpaces
      ];

      // 5. Actualizar estado
      const propertyComplete = {
        id: propertyId,
        nombre_propiedad: propertyData?.nombre || 'Mi Propiedad',
        tipo_propiedad: propertyData?.tipo_propiedad || 'Casa',
        estado_propiedad: propertyData?.estados?.[0] || 'Disponible',
        photos: photosData,
        espacios: espaciosConOpciones,
      } as PropertyFormData;

      setProperty(propertyComplete);
      setPhotos(photosData);
      console.log('✅ Propiedad cargada exitosamente con espacios:', espaciosConOpciones);

    } catch (error) {
      console.error('❌ Error en loadProperty:', error);
      alert('Error al cargar la propiedad. Verifica que existe en la base de datos.');
      router.push('/dashboard/catalogo');
    } finally {
      setLoading(false);
    }
  };

  // Función helper para obtener iconos según el tipo de espacio
  const getEspacioIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      'Habitación': '🛏️',
      'Baño completo': '🚿',
      'Medio baño': '🚽',
      'Cocina': '🍳',
      'Sala': '🛋️',
      'Comedor': '🍽️',
      'Cuarto de lavado': '🧺',
      'Estacionamiento': '🚗',
      'Terraza': '🌿',
      'Jardín': '🌳',
      'Piscina': '🏊',
      'Gimnasio': '💪',
      'Oficina': '💼',
      'Estudio': '📚',
      'Bodega': '📦',
      'Garaje': '🚙',
    };
    return iconMap[type] || '📍';
  };

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newPhotos: PropertyImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          console.log(`📸 Procesando ${file.name}...`);
          
          // 1. Comprimir imagen
          const compressed = await compressImageDual(file);
          console.log(`✅ Comprimido: ${file.name}`);

          // 2. Subir a Supabase Storage
          const uploaded = await uploadPropertyImageDual(
            compressed.thumbnail,
            compressed.display,
            propertyId,
            file.name
          );
          console.log(`✅ Subido: ${file.name}`);

          // 3. Agregar a la lista
          newPhotos.push({
            id: uploaded.id,
            url: uploaded.urls.display,
            url_thumbnail: uploaded.urls.thumbnail,
            is_cover: photos.length === 0 && i === 0,
            order_index: photos.length + i,
            space_type: null,
            caption: file.name,
            uploaded_at: uploaded.metadata.uploadedAt,
          });

        } catch (fileError) {
          console.error(`❌ Error procesando ${file.name}:`, fileError);
          alert(`Error con ${file.name}: ${fileError instanceof Error ? fileError.message : 'Error desconocido'}`);
        }
      }

      if (newPhotos.length > 0) {
        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        alert(`✅ ${newPhotos.length} foto(s) subida(s) exitosamente`);
      }

    } catch (error) {
      console.error('❌ Error general:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetCover = async (photoId: string) => {
    try {
      // Desmarcar todas las fotos de portada
      await supabase
        .from('property_images')
        .update({ is_cover: false })
        .eq('property_id', propertyId);

      // Marcar la nueva foto como portada
      await supabase
        .from('property_images')
        .update({ is_cover: true })
        .eq('id', photoId);

      // Actualizar estado local
      setPhotos(photos.map(p => ({
        ...p,
        is_cover: p.id === photoId
      })));

      alert('✅ Foto de portada actualizada');
    } catch (error) {
      console.error('Error al establecer portada:', error);
      alert('Error al establecer la foto de portada');
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('¿Estás seguro que deseas eliminar esta foto?')) return;

    try {
      await supabase
        .from('property_images')
        .delete()
        .eq('id', photoId);

      setPhotos(photos.filter(p => p.id !== photoId));
      alert('✅ Foto eliminada');
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      alert('Error al eliminar la foto');
    }
  };

  const handleAssignSpace = async (photoId: string, spaceType: string) => {
    try {
      await supabase
        .from('property_images')
        .update({ space_type: spaceType === 'sin-espacio' ? null : spaceType })
        .eq('id', photoId);

      setPhotos(photos.map(p => 
        p.id === photoId 
          ? { ...p, space_type: spaceType === 'sin-espacio' ? null : spaceType }
          : p
      ));

      const espacioNombre = property?.espacios?.find(e => e.id === spaceType)?.name || 'Sin espacio';
      alert(`✅ Foto asignada a: ${espacioNombre}`);
    } catch (error) {
      console.error('Error al asignar espacio:', error);
      alert('Error al asignar espacio');
    }
  };

  const handleStartEdit = (photo: PropertyImage) => {
    setEditingPhotoId(photo.id);
    setEditingCaption(photo.caption || '');
  };

  const handleSaveCaption = async (photoId: string) => {
    if (!editingCaption.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    try {
      await supabase
        .from('property_images')
        .update({ caption: editingCaption.trim() })
        .eq('id', photoId);

      setPhotos(photos.map(p => 
        p.id === photoId 
          ? { ...p, caption: editingCaption.trim() }
          : p
      ));

      setEditingPhotoId(null);
      setEditingCaption('');
      alert('✅ Nombre actualizado');
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      alert('Error al actualizar el nombre');
    }
  };

  const handleCancelEdit = () => {
    setEditingPhotoId(null);
    setEditingCaption('');
  };

  const filteredPhotos = photos.filter(photo => {
    const matchSpace = selectedSpace === 'all' || 
                      (selectedSpace === 'sin-espacio' && !photo.space_type) ||
                      photo.space_type === selectedSpace;
    
    const matchSearch = !searchQuery || 
                       photo.caption?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchSpace && matchSearch;
  });

  if (loading) {
    return <Loading message="Cargando galería..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title={`Galería - ${property?.nombre_propiedad || ''}`}
        showBackButton={true}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="px-6 py-3 bg-gradient-to-r from-ras-azul to-ras-turquesa text-white rounded-xl cursor-pointer hover:shadow-xl transition-all font-semibold shadow-lg">
              {isUploading ? 'Subiendo...' : 'Subir Fotos'}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total de Fotos</h3>
              <p className="text-4xl font-bold text-ras-azul">{photos.length}</p>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-300 p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Buscador */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar fotos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-ras-turquesa focus:outline-none transition-colors"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>

            {/* Filtro por espacio */}
            <div className="relative">
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-2 pr-10 font-medium text-gray-700 hover:border-ras-turquesa focus:border-ras-turquesa focus:outline-none transition-colors cursor-pointer"
              >
                {property?.espacios?.map((espacio) => (
                  <option key={espacio.id} value={espacio.id}>
                    {espacio.name}
                  </option>
                ))}
              </select>
              <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Grid de fotos */}
        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                {/* Imagen con dropdown y badge */}
                <div className="relative aspect-square">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Foto'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badge de portada */}
                  {photo.is_cover && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                      ⭐ PORTADA
                    </div>
                  )}

                  {/* Dropdown de espacios dentro de la imagen */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <select
                      value={photo.space_type || 'sin-espacio'}
                      onChange={(e) => handleAssignSpace(photo.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-lg text-sm font-medium focus:border-ras-turquesa focus:outline-none transition-colors cursor-pointer"
                    >
                      {property?.espacios?.map((espacio) => (
                        <option key={espacio.id} value={espacio.id}>
                          {espacio.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nombre de la foto (editable) */}
                <div className="p-4">
                  {editingPhotoId === photo.id ? (
                    <div className="mb-3">
                      <input
                        type="text"
                        value={editingCaption}
                        onChange={(e) => setEditingCaption(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-ras-turquesa rounded-lg text-sm font-medium focus:outline-none mb-2"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveCaption(photo.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveCaption(photo.id)}
                          className="flex-1 px-3 py-1 bg-gradient-to-r from-ras-azul to-ras-turquesa text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 mb-3 font-medium truncate">
                      {photo.caption}
                    </p>
                  )}

                  {/* 3 Botones de acción */}
                  {editingPhotoId !== photo.id && (
                    <div className="flex gap-2 justify-center">
                      {/* Botón Portada (solo si no es portada) */}
                      {!photo.is_cover && (
                        <button
                          onClick={() => handleSetCover(photo.id)}
                          className="w-10 h-10 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-400 hover:scale-110 transition-all flex items-center justify-center group"
                          title="Establecer como portada"
                        >
                          <svg className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      )}

                      {/* Botón Editar */}
                      <button
                        onClick={() => handleStartEdit(photo)}
                        className="w-10 h-10 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 hover:scale-110 transition-all flex items-center justify-center group"
                        title="Editar nombre"
                      >
                        <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>

                      {/* Botón Eliminar */}
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="w-10 h-10 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-400 hover:scale-110 transition-all flex items-center justify-center group"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={
              <svg className="w-12 h-12 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            }
            title={photos.length === 0 ? "No hay fotos en la galería" : "No se encontraron resultados"}
            description={photos.length === 0 ? "Sube la primera foto de tu propiedad" : "Intenta con otra búsqueda o cambia los filtros"}
            actionLabel={photos.length === 0 ? "📸 Subir Fotos" : undefined}
            onAction={photos.length === 0 ? () => document.querySelector('input[type="file"]')?.click() : undefined}
          />
        )}

        {/* Input oculto para cuando no hay fotos */}
        {photos.length === 0 && (
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        )}
      </main>
    </div>
  );
}