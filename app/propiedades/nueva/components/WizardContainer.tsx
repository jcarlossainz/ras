'use client';

import { useState, useCallback } from 'react';
import { PropertyFormData } from '@/types/property';
import WizardProgress from './WizardProgress';
import WizardNavigation from './WizardNavigation';
import Step1_DatosGenerales from '../steps/Step1_DatosGenerales';
import Step2_Condicionales from '../steps/Step2_Condicionales';
import Step3_Espacios from '../steps/Step3_Espacios';

// Definición de los pasos del wizard (reducido a 3 pasos)
const WIZARD_STEPS = [
  { 
    id: 1, 
    name: 'Datos Generales', 
    component: Step1_DatosGenerales,
    icon: '📋',
    description: 'Información básica y asignaciones'
  },
  { 
    id: 2, 
    name: 'Datos Específicos', 
    component: Step2_Condicionales,
    icon: '💼',
    description: 'Según tipo de renta o venta'
  },
  { 
    id: 3, 
    name: 'Espacios', 
    component: Step3_Espacios,
    icon: '🏠',
    description: 'Habitaciones, baños y áreas'
  }
];

interface WizardContainerProps {
  initialData?: Partial<PropertyFormData>;
  onSave: (data: PropertyFormData) => Promise<void>;
  onSaveDraft?: (data: PropertyFormData) => Promise<void>;
}

export default function WizardContainer({ 
  initialData, 
  onSave,
  onSaveDraft 
}: WizardContainerProps) {
  // Estado principal del formulario
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    // Datos básicos
    nombre_propiedad: '',
    tipo_propiedad: 'Departamento',
    estados: [],
    mobiliario: 'Amueblada',
    capacidad_personas: '',
    tamano_terreno: '',
    tamano_terreno_unit: 'm²',
    tamano_construccion: '',
    tamano_construccion_unit: 'm²',
    
    // Asignaciones (ahora en el mismo paso)
    propietario_id: '',
    supervisor_id: '',
    
    // Condicionales - Renta largo plazo
    inquilino_id: '',
    fecha_inicio_contrato: '',
    costo_renta_mensual: '',
    
    // Condicionales - Renta vacacional
    precio_noche: '',
    amenidades_vacacional: [],
    
    // Condicionales - Venta
    precio_venta: '',
    
    // Espacios
    espacios: [],
    
    // Metadata
    is_draft: true,
    
    // Sobrescribir con datos iniciales si existen
    ...initialData,
  });

  // Validaciones por paso
  const validateStep = useCallback((step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Datos Generales (Básicos + Asignaciones)
        if (!formData.nombre_propiedad?.trim()) {
          errors.push('El nombre de la propiedad es obligatorio');
        }
        if (formData.estados.length === 0) {
          errors.push('Debes seleccionar al menos un estado (Renta largo plazo, Renta vacacional o Venta)');
        }
        if (!formData.propietario_id) {
          errors.push('Debes seleccionar un propietario');
        }
        break;
        
      case 2: // Condicionales
        if (formData.estados.includes('Renta largo plazo') && !formData.costo_renta_mensual) {
          errors.push('El costo de renta mensual es obligatorio para Renta largo plazo');
        }
        if (formData.estados.includes('Renta vacacional') && !formData.precio_noche) {
          errors.push('El precio por noche es obligatorio para Renta vacacional');
        }
        if (formData.estados.includes('Venta') && !formData.precio_venta) {
          errors.push('El precio de venta es obligatorio');
        }
        break;
        
      case 3: // Espacios
        if (formData.espacios.length === 0) {
          errors.push('Debes agregar al menos un espacio (habitación, baño, etc.)');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData]);

  // Actualizar datos desde cualquier paso
  const updateFormData = useCallback((stepData: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  // Navegar a un paso específico
  const goToStep = useCallback((targetStep: number) => {
    // Validar paso actual antes de avanzar
    if (targetStep > currentStep) {
      const validation = validateStep(currentStep);
      if (!validation.isValid) {
        alert('Por favor completa los campos requeridos:\n\n' + validation.errors.join('\n'));
        return;
      }
    }

    // Permitir navegación
    if (targetStep >= 1 && targetStep <= WIZARD_STEPS.length) {
      setCurrentStep(targetStep);
      
      // Auto-guardar borrador al cambiar de paso
      if (onSaveDraft) {
        onSaveDraft(formData).catch(console.error);
      }
      
      // Scroll al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, formData, validateStep, onSaveDraft]);

  // Siguiente paso
  const handleNext = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  // Paso anterior
  const handlePrevious = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  // Guardar como borrador
  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return;
    
    setIsLoading(true);
    try {
      await onSaveDraft({ ...formData, is_draft: true });
      alert('✅ Borrador guardado correctamente');
    } catch (error) {
      console.error('Error al guardar borrador:', error);
      alert('❌ Error al guardar el borrador');
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSaveDraft]);

  // Guardar y publicar (paso final)
  const handleFinalSave = useCallback(async () => {
    // Validar todos los pasos
    for (let step = 1; step <= WIZARD_STEPS.length; step++) {
      const validation = validateStep(step);
      if (!validation.isValid) {
        alert(`❌ Errores en paso ${step}:\n\n${validation.errors.join('\n')}`);
        setCurrentStep(step);
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSave({ ...formData, is_draft: false });
      alert('✅ Propiedad guardada y publicada correctamente');
      // Redirigir o limpiar formulario
    } catch (error) {
      console.error('Error al guardar propiedad:', error);
      alert('❌ Error al guardar la propiedad');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateStep, onSave]);

  // Componente del paso actual
  const CurrentStepComponent = WIZARD_STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
            Nueva Propiedad
          </h1>
          <p className="text-gray-600 font-roboto">
            Completa todos los pasos para registrar tu propiedad
          </p>
        </div>

        {/* Barra de progreso */}
        <WizardProgress 
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={goToStep}
        />

        {/* Contenido del paso actual */}
        <div className="mt-8">
          <CurrentStepComponent
            data={formData}
            onUpdate={updateFormData}
          />
        </div>

        {/* Navegación */}
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          isLoading={isLoading}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onFinalSave={handleFinalSave}
        />

        {/* Info de auto-guardado */}
        {onSaveDraft && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 font-roboto">
              💾 Los cambios se guardan automáticamente al cambiar de paso
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
