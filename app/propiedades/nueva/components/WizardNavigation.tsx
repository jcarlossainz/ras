'use client';

import { useConfirm } from '@/components/ui/confirm-modal';
import Button from '@/components/ui/button';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onFinalSave: () => void;
}

export default function WizardNavigation({
  currentStep,
  totalSteps,
  isLoading = false,
  onPrevious,
  onNext,
  onSaveDraft,
  onFinalSave,
}: WizardNavigationProps) {
  const confirm = useConfirm();
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const handleCancel = async () => {
    const confirmed = await confirm.warning(
      '¿Cancelar formulario?',
      'Los cambios no guardados se perderán.'
    );
    
    if (confirmed) {
      window.history.back();
    }
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Botón Anterior */}
        <div className="w-full sm:w-auto">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              ← Anterior
            </Button>
          )}
        </div>

        {/* Botones centrales */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Guardar borrador (disponible en todos los pasos) */}
          {onSaveDraft && !isLastStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Guardando...
                </>
              ) : (
                <>Guardar Borrador</>
              )}
            </Button>
          )}

          {/* Botón Siguiente o Finalizar */}
          {isLastStep ? (
            <Button
              type="button"
              variant="primary"
              onClick={onFinalSave}
              disabled={isLoading}
              className="w-full sm:w-auto font-bold"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Guardando...
                </>
              ) : (
                <>Guardar y Publicar</>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={onNext}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Siguiente →
            </Button>
          )}
        </div>

        {/* Cancelar (siempre visible) */}
        <div className="w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:border-red-300"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
