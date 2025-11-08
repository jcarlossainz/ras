/**
 * WizardProgress.tsx
 * Plan C - Componente de progreso del wizard con barra de progreso y pasos visuales
 * 
 * Funcionalidades:
 * - Muestra progreso visual con porcentaje
 * - Calcula completitud basada en campos obligatorios por paso
 * - Permite navegación entre pasos accesibles
 * - Estados visuales: activo, completado, accesible, bloqueado
 * - Responsive y adaptable
 */

'use client';

interface WizardStep {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  formData?: any; // Para calcular el porcentaje real
}

export default function WizardProgress({ 
  steps, 
  currentStep, 
  onStepClick, 
  formData 
}: WizardProgressProps) {
  
  /**
   * Calcula el porcentaje de progreso basado en campos completados
   * Si no hay formData, usa el progreso lineal por pasos
   */
  const calculateProgress = (): number => {
    if (!formData) return (currentStep / steps.length) * 100;
    
    // Campos obligatorios por paso
    const requiredFields: Record<number, string[]> = {
      1: ['nombre_propiedad', 'estados', 'propietario_id'], // Paso 1: 3 campos
      2: ['calle', 'colonia', 'codigo_postal', 'ciudad', 'estado', 'pais'], // Paso 2: 6 campos
      3: [], // Paso 3: condicional según estados
      4: ['espacios'] // Paso 4: 1 campo (debe tener al menos 1 espacio)
    };
    
    // Agregar campos condicionales del paso 3 según estados seleccionados
    if (formData.estados?.includes('Renta largo plazo')) {
      requiredFields[3].push('costo_renta_mensual');
    }
    if (formData.estados?.includes('Renta vacacional')) {
      requiredFields[3].push('precio_noche');
    }
    if (formData.estados?.includes('Venta')) {
      requiredFields[3].push('precio_venta');
    }
    
    // Contar total de campos requeridos
    const totalFields = 
      requiredFields[1].length + 
      requiredFields[2].length + 
      requiredFields[3].length + 
      requiredFields[4].length;
    
    // Contar campos completados
    let completedFields = 0;
    
    // Paso 1: Datos Generales
    if (formData.nombre_propiedad?.trim()) completedFields++;
    if (formData.estados?.length > 0) completedFields++;
    if (formData.propietario_id) completedFields++;
    
    // Paso 2: Ubicación
    if (formData.calle?.trim()) completedFields++;
    if (formData.colonia?.trim()) completedFields++;
    if (formData.codigo_postal?.trim()) completedFields++;
    if (formData.ciudad?.trim()) completedFields++;
    if (formData.estado?.trim()) completedFields++;
    if (formData.pais?.trim()) completedFields++;
    
    // Paso 3: Datos Específicos (condicionales)
    if (formData.estados?.includes('Renta largo plazo') && formData.costo_renta_mensual) {
      completedFields++;
    }
    if (formData.estados?.includes('Renta vacacional') && formData.precio_noche) {
      completedFields++;
    }
    if (formData.estados?.includes('Venta') && formData.precio_venta) {
      completedFields++;
    }
    
    // Paso 4: Espacios
    if (formData.espacios?.length > 0) completedFields++;
    
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };
  
  const progressPercentage = calculateProgress();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Barra de progreso superior */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Paso {currentStep} de {steps.length}
          </span>
          <span className="text-sm font-medium text-ras-azul">
            {progressPercentage}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-ras-azul to-ras-celeste h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Grid de pasos - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isAccessible = step.id <= currentStep;

          return (
            <button
              key={step.id}
              onClick={() => isAccessible && onStepClick(step.id)}
              disabled={!isAccessible}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200
                ${isActive 
                  ? 'border-ras-azul bg-ras-azul/5 ring-2 ring-ras-azul/20' 
                  : isCompleted
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : isAccessible
                      ? 'border-gray-300 hover:border-ras-azul/50 hover:bg-gray-50'
                      : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {/* Ícono o checkmark */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg
                  ${isActive 
                    ? 'bg-ras-azul text-white' 
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {isCompleted ? '✓' : step.icon}
                </div>

                {/* Título del paso */}
                <div className={`
                  font-semibold text-sm font-poppins text-left
                  ${isActive ? 'text-gray-900' : isCompleted ? 'text-green-900' : 'text-gray-600'}
                `}>
                  {step.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
