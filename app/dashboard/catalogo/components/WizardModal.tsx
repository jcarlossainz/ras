'use client';

/**
 * WIZARD MODAL
 * 
 * Archivo: app/dashboard/catalogo/components/WizardModal.tsx
 * 
 * Modal full-screen que envuelve el WizardContainer
 * - Animaciones suaves de entrada/salida
 * - Previene scroll del body cuando está abierto
 * - Confirmación antes de cerrar
 * - Cierra automáticamente al guardar exitosamente
 */

import { useEffect, useState } from 'react';
import WizardContainer from '../../../propiedades/nueva/components/WizardContainer';
import { PropertyFormData } from '@/types/property';

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PropertyFormData) => Promise<void>;
  onSaveDraft?: (data: PropertyFormData) => Promise<void>;
  initialData?: Partial<PropertyFormData>;
}

export default function WizardModal({
  isOpen,
  onClose,
  onSave,
  onSaveDraft,
  initialData
}: WizardModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    // Confirmar si quiere cerrar
    if (confirm('¿Cerrar el formulario? Los cambios se guardarán como borrador automáticamente.')) {
      setIsAnimating(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleSaveSuccess = async (data: PropertyFormData) => {
    try {
      await onSave(data);
      // Animación de salida
      setIsAnimating(false);
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      // El error ya fue manejado en onSave
      console.error('Error en handleSaveSuccess:', error);
    }
  };

  // No renderizar si no está abierto
  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Overlay oscuro */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Contenedor del Modal */}
      <div 
        className={`
          absolute inset-0 overflow-y-auto
          transition-transform duration-300 ease-out
          ${isAnimating ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Header flotante con botón cerrar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ras-azul/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-ras-azul" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nueva Propiedad</h2>
                <p className="text-xs text-gray-500">Completa los 3 pasos del formulario</p>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center group"
              aria-label="Cerrar"
            >
              <svg 
                className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del Wizard */}
        <div className="relative min-h-[calc(100vh-80px)] bg-gray-50">
          <WizardContainer
            initialData={initialData}
            onSave={handleSaveSuccess}
            onSaveDraft={onSaveDraft}
          />
        </div>
      </div>
    </div>
  );
}
