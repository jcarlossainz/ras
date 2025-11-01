'use client';

import React from 'react';
import { PropertyTemplate, PROPERTY_TEMPLATES } from '@/types/property';

interface SpaceTemplatesProps {
  onApplyTemplate: (template: PropertyTemplate) => void;
}

const SpaceTemplates: React.FC<SpaceTemplatesProps> = ({ onApplyTemplate }) => {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-poppins">
            Templates Rápidos
          </h3>
          <p className="text-xs text-gray-600 font-roboto">
            Configura tu propiedad en segundos con plantillas predefinidas
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PROPERTY_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onApplyTemplate(template)}
            className="group relative bg-gradient-to-br from-stone-100 to-stone-50 border-2 border-stone-300 rounded-lg p-4 text-left hover:from-stone-200 hover:to-stone-100 hover:border-ras-azul hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Title */}
            <h4 className="font-bold text-gray-800 text-base mb-2 font-poppins">
              {template.name}
            </h4>
            
            {/* Description */}
            <p className="text-xs text-gray-600 font-roboto">
              {template.description}
            </p>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-ras-azul/5 to-ras-turquesa/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Info footer */}
      <div className="mt-4 pt-3 border-t border-gray-300">
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          Los templates agregan todos los espacios predefinidos. Puedes editarlos, duplicarlos o eliminarlos después.
        </p>
      </div>
    </div>
  );
};

export default SpaceTemplates;
