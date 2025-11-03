// 📁 src/app/dashboard/propiedad/[id]/galeria/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import PhotoGalleryManager from '@/components/property/PhotoGalleryManager';
import type { PropertyFormData } from '@/types/property';

export default function GaleriaPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cargar propiedad desde Supabase
  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      
      // Cargar desde Supabase
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          espacios:spaces(*)
        `)
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      
      setProperty(data);

    } catch (error) {
      console.error('Error cargando propiedad:', error);
      alert('Error al cargar la propiedad');
      router.push('/dashboard/catalogo');
    } finally {
      setLoading(false);
    }
  };

  // Auto-guardar después de 2 segundos de inactividad
  const scheduleAutoSave = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      handleSave(true); // true = auto-save silencioso
    }, 2000);

    setAutoSaveTimeout(timeout);
  };

  // Guardar cambios
  const handleSave = async (isAutoSave = false) => {
    if (!property || !hasChanges) return;

    try {
      if (!isAutoSave) setSaving(true);

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { error } = await supabase
        .from('properties')
        .update({ 
          photos: property.photos,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (error) throw error;

      setHasChanges(false);
      
      if (!isAutoSave) {
        // Mostrar notificación de éxito
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right';
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="font-semibold">✅ Galería guardada exitosamente</span>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }

    } catch (error) {
      console.error('Error guardando:', error);
      if (!isAutoSave) {
        alert('Error al guardar la galería');
      }
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  // Manejar actualización de fotos
  const handlePhotosUpdate = (photos: PropertyFormData['photos']) => {
    if (!property) return;
    
    setProperty({ ...property, photos });
    setHasChanges(true);
    scheduleAutoSave();
  };

  // Volver atrás
  const handleBack = () => {
    if (hasChanges) {
      if (confirm('¿Salir sin guardar los cambios manualmente?\n\nNota: Los cambios se auto-guardan automáticamente.')) {
        router.push(`/dashboard/propiedad/${propertyId}/home`);
      }
    } else {
      router.push(`/dashboard/propiedad/${propertyId}/home`);
    }
  };

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-ras-azul/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-ras-azul border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-semibold">Cargando galería...</p>
          <p className="text-sm text-gray-400 mt-1">Un momento por favor</p>
        </div>
      </div>
    );
  }

  // Error
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error al cargar la propiedad
          </h3>
          <p className="text-gray-600 mb-6">
            No se pudo encontrar la información de la propiedad solicitada.
          </p>
          <button
            onClick={() => router.push('/dashboard/catalogo')}
            className="px-6 py-3 bg-ras-azul text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-md"
          >
            ← Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con Navegación */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Lado Izquierdo: Botón Volver + Info */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 text-gray-600 hover:text-ras-azul font-semibold transition-all"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-ras-azul/10 transition-colors">
                  <span className="text-xl">←</span>
                </div>
                Volver
              </button>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📸</span>
                  <h1 className="text-xl font-bold text-gray-900">
                    Galería de Fotos
                  </h1>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {property.nombre_propiedad || 'Propiedad'} • {property.photos?.length || 0} fotos
                </p>
              </div>
            </div>

            {/* Lado Derecho: Estado + Acciones */}
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              {hasChanges && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="relative">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-sm text-orange-700 font-medium">
                    Guardando automáticamente...
                  </span>
                </div>
              )}

              {/* Manual Save Button */}
              <button
                onClick={() => handleSave(false)}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ras-azul to-ras-turquesa text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                    </svg>
                    Guardar Ahora
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PhotoGalleryManager Component */}
      <div className="flex-1 overflow-hidden">
        <PhotoGalleryManager
          propertyId={propertyId}
          photos={property.photos || []}
          spaces={property.espacios || []}
          onPhotosUpdate={handlePhotosUpdate}
        />
      </div>

      {/* Footer con Tips */}
      <div className="bg-white border-t-2 border-gray-200 py-3">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span>Arrastra fotos para organizarlas por espacios</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <span>Marca la mejor foto como portada</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💾</span>
                <span>Los cambios se guardan automáticamente</span>
              </div>
            </div>
            <div className="text-gray-400">
              RAS V_1.0 • Sistema de Gestión de Propiedades
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
