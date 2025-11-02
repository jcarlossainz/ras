'use client';

import React, { useState } from 'react';
import { PropertyFormData, Space } from '@/types/property';
import Button from '@/components/ui/button';
import SpaceCard from '../components/SpaceCard';
import SpaceCategories from '../components/SpaceCategories';
import SpaceTemplates from '../components/SpaceTemplates';

interface Step3Props {
  data: PropertyFormData;
  onUpdate: (data: Partial<PropertyFormData>) => void;
}

export default function Step3_Espacios({ data, onUpdate }: Step3Props) {
  const [mostrarTemplates, setMostrarTemplates] = useState(false);
  const espacios = data.espacios || [];

  // Agregar espacio individual
  const agregarEspacio = (tipo: string) => {
    const nuevoEspacio: Space = {
      id: `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${tipo} ${espacios.filter(s => s.type === tipo).length + 1}`,
      type: tipo,
      details: {
        equipamiento: [],
        camas: [],
        tieneBanoPrivado: false,
        banoPrivadoId: null,
        notas: ''
      }
    };

    onUpdate({ espacios: [...espacios, nuevoEspacio] });
  };

  // Aplicar template
  const aplicarTemplate = (templateEspacios: Space[]) => {
    // Generar IDs únicos para cada espacio del template
    const espaciosConIds = templateEspacios.map(espacio => ({
      ...espacio,
      id: `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    onUpdate({ espacios: espaciosConIds });
    setMostrarTemplates(false);
  };

  // Actualizar espacio
  const actualizarEspacio = (id: string, updates: Partial<Space>) => {
    const nuevosEspacios = espacios.map(espacio =>
      espacio.id === id ? { ...espacio, ...updates } : espacio
    );
    onUpdate({ espacios: nuevosEspacios });
  };

  // Eliminar espacio
  const eliminarEspacio = (id: string) => {
    if (confirm('¿Eliminar este espacio?')) {
      const nuevosEspacios = espacios.filter(espacio => espacio.id !== id);
      onUpdate({ espacios: nuevosEspacios });
    }
  };

  // Duplicar espacio
  const duplicarEspacio = (espacio: Space) => {
    const espacioDuplicado: Space = {
      ...espacio,
      id: `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${espacio.name} (copia)`,
      details: {
        ...espacio.details,
        // Si tenía baño privado, resetear porque no puede ser el mismo
        tieneBanoPrivado: false,
        banoPrivadoId: null
      }
    };

    onUpdate({ espacios: [...espacios, espacioDuplicado] });
  };

  // Resumen de espacios
  const conteoEspacios = espacios.reduce((acc, espacio) => {
    acc[espacio.type] = (acc[espacio.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 font-poppins mb-2 flex items-center gap-2">
              <span>🏠</span>
              Espacios de la Propiedad
            </h2>
            <p className="text-gray-600 mb-4">
              Define todos los espacios: habitaciones, baños, áreas comunes y más
            </p>

            {/* Resumen */}
            {Object.keys(conteoEspacios).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(conteoEspacios).map(([tipo, cantidad]) => (
                  <span
                    key={tipo}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-ras-azul/10 border border-ras-azul/30 rounded-full text-xs font-semibold text-ras-azul"
                  >
                    {cantidad} {tipo}{cantidad > 1 ? 's' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Botón de templates */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setMostrarTemplates(!mostrarTemplates)}
            className="whitespace-nowrap"
          >
            {mostrarTemplates ? '✕ Cerrar' : '⚡ Templates'}
          </Button>
        </div>

        {/* Templates */}
        {mostrarTemplates && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <SpaceTemplates
              onAplicarTemplate={aplicarTemplate}
              onCerrar={() => setMostrarTemplates(false)}
            />
          </div>
        )}
      </div>

      {/* Agregar espacios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>➕</span>
          Agregar Espacios
        </h3>
        <SpaceCategories onSelectType={agregarEspacio} />
      </div>

      {/* Lista de espacios */}
      {espacios.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📝</span>
              Espacios Agregados ({espacios.length})
            </h3>
          </div>

          <div className="space-y-4">
            {espacios.map(espacio => (
              <SpaceCard
                key={espacio.id}
                space={espacio}
                allSpaces={espacios}
                onUpdate={actualizarEspacio}
                onDelete={eliminarEspacio}
                onDuplicate={duplicarEspacio}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No hay espacios agregados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando espacios usando las categorías de arriba o aplica un template rápido
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => setMostrarTemplates(true)}
              className="mx-auto"
            >
              ⚡ Ver Templates
            </Button>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Tips importantes</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Agrega primero los baños si las habitaciones tienen baño privado</li>
              <li>Puedes duplicar espacios similares para ahorrar tiempo</li>
              <li>Usa los templates para configuraciones comunes</li>
              <li>El equipamiento es opcional pero ayuda a describir mejor la propiedad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}