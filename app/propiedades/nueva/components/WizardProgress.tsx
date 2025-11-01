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
}

export default function WizardProgress({ steps, currentStep, onStepClick }: WizardProgressProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Paso {currentStep} de {steps.length}
          </span>
          <span className="text-sm font-medium text-ras-azul">
            {Math.round((currentStep / steps.length) * 100)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-ras-azul to-ras-celeste h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                p-4 rounded-lg border-2 transition-all duration-200 text-left
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
              <div className="flex items-start gap-3">
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-xs font-medium mb-0.5
                    ${isActive ? 'text-ras-azul' : isCompleted ? 'text-green-700' : 'text-gray-500'}
                  `}>
                    Paso {step.id}
                  </div>
                  <div className={`
                    font-semibold text-sm mb-1 font-poppins
                    ${isActive ? 'text-gray-900' : isCompleted ? 'text-green-900' : 'text-gray-600'}
                  `}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 font-roboto line-clamp-2 hidden md:block">
                    {step.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current step info (mobile) */}
      <div className="mt-4 md:hidden">
        <div className="bg-ras-azul/5 rounded-lg p-4 border border-ras-azul/20">
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {steps[currentStep - 1].icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-poppins">
                {steps[currentStep - 1].name}
              </h3>
              <p className="text-sm text-gray-600 font-roboto">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
