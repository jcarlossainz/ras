'use client';

import Button from '@/components/ui/Button';

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
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

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
                <>💾 Guardar Borrador</>
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
                <>✅ Guardar y Publicar</>
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
            onClick={() => {
              if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
                window.history.back();
              }
            }}
            disabled={isLoading}
            className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:border-red-300"
          >
            ✕ Cancelar
          </Button>
        </div>
      </div>

      {/* Tips según el paso */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <span className="text-base">💡</span>
          <div className="flex-1">
            {currentStep === 1 && (
              <p>
                <strong>Tip:</strong> Los campos marcados con * son obligatorios. Asegúrate de seleccionar al menos un estado.
              </p>
            )}
            {currentStep === 2 && (
              <p>
                <strong>Tip:</strong> El propietario es obligatorio. El supervisor es opcional pero recomendado.
              </p>
            )}
            {currentStep === 3 && (
              <p>
                <strong>Tip:</strong> Solo necesitas completar los campos del tipo de renta o venta que seleccionaste en Paso 1.
              </p>
            )}
            {currentStep === 4 && (
              <p>
                <strong>Tip:</strong> Puedes usar templates rápidos o agregar espacios individualmente. Recuerda agregar baños antes de asignarlos a habitaciones.
              </p>
            )}
            {currentStep === 5 && (
              <p>
                <strong>Tip:</strong> La primera foto será la portada. Puedes arrastrar para reordenar y marcar la mejor foto de cada espacio.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
