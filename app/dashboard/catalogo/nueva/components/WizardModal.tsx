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
import { useConfirm } from '@/components/ui/confirm-modal';
import { logger } from '@/lib/logger';
import WizardContainer from '@/app/dashboard/catalogo/nueva/components/WizardContainer';
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
  const confirm = useConfirm();

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

  const handleClose = async () => {
    // Confirmar si quiere cerrar
    const confirmed = await confirm.warning(
      '¿Cerrar el formulario?',
      'Los cambios se guardarán como borrador automáticamente.'
    );
    
    if (confirmed) {
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
      logger.error('Error en handleSaveSuccess:', error);
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
        <div className="sticky top-0 z-10 bg-gradient-to-b from-ras-azul/70 to-ras-turquesa/70 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Nueva Propiedad</h2>
                <p className="text-xs text-white/80">Completa los 3 pasos del formulario</p>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center group"
              aria-label="Cerrar"
            >
              <svg 
                className="w-5 h-5 text-white transition-colors" 
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
