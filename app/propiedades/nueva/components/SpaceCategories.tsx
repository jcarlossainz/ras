'use client';

import React from 'react';
import { SpaceType } from '@/types/property';

interface SpaceCategoriesProps {
  onSelectType: (type: SpaceType) => void;
}

// Categorías organizadas con iconos y nombres
const CATEGORIES = [
  {
    id: 'habitaciones',
    name: '🛏️ Habitaciones',
    spaces: ['Habitación', 'Lock-off', 'Cuarto de servicio'] as SpaceType[]
  },
  {
    id: 'banos',
    name: '🚿 Baños',
    spaces: ['Baño completo', 'Medio baño'] as SpaceType[]
  },
  {
    id: 'areas-comunes',
    name: '🍳 Áreas Comunes',
    spaces: ['Cocina', 'Sala', 'Comedor', 'Cuarto de lavado'] as SpaceType[]
  },
  {
    id: 'exteriores',
    name: '🌳 Exteriores',
    spaces: ['Terraza', 'Rooftop', 'Patio', 'Jardín', 'Alberca'] as SpaceType[]
  },
  {
    id: 'adicionales',
    name: '📦 Adicionales',
    spaces: ['Bodega', 'Estacionamiento', 'Gimnasio', 'Bar', 'Cine / Tv Room', 'Oficina'] as SpaceType[]
  }
];

const SpaceCategories: React.FC<SpaceCategoriesProps> = ({ onSelectType }) => {
  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => (
        <div
          key={category.id}
          className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50"
        >
          {/* Category Header */}
          <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-gray-200">
            <h4 className="font-bold text-gray-900 font-poppins">
              {category.name}
            </h4>
          </div>

          {/* Space Buttons */}
          <div className="flex flex-wrap gap-2">
            {category.spaces.map((spaceType) => (
              <button
                key={spaceType}
                type="button"
                onClick={() => onSelectType(spaceType)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-ras-azul/30 text-ras-azul rounded-lg text-sm font-medium hover:bg-ras-azul/5 hover:border-ras-azul/50 transition-all duration-150 hover:shadow-sm"
              >
                {spaceType}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpaceCategories;