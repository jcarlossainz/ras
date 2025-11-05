/**
 * WizardContainer.tsx
 * Contenedor principal del wizard de registro de propiedades
 * 
 * Funcionalidades:
 * - Maneja estado global del formulario multi-paso
 * - Validaciones por paso antes de avanzar
 * - Auto-guardado de borradores al cambiar de paso
 * - Navegación entre pasos con validación
 * - Renderiza componentes de paso dinámicamente
 * - Gestión de loading states
 * 
 * Flujo de pasos (5 pasos):
 * 1. Datos Generales - Información básica y asignaciones
 * 2. Ubicación - Dirección y complejo
 * 3. Espacios - Habitaciones, baños y áreas
 * 4. Datos Específicos - Precios según estados
 * 5. Servicios - Servicios del inmueble y pagos
 */

'use client';

import { useState, useCallback } from 'react';
import { PropertyFormData } from '@/types/property';
import WizardProgress from './WizardProgress';
import WizardNavigation from './WizardNavigation';
import Step1_DatosGenerales from '../steps/Step1_DatosGenerales';
import Step2_Ubicacion from '../steps/Step2_Ubicacion';
import Step3_Espacios from '../steps/Step3_Espacios';
import Step4_Condicionales from '../steps/Step4_Condicionales';
import Step5_Servicios from '../steps/Step5_Servicios';

// Definición de los pasos del wizard (5 pasos)
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
    name: 'Ubicación', 
    component: Step2_Ubicacion,
    icon: '📍',
    description: 'Dirección y complejo'
  },
  { 
    id: 3, 
    name: 'Espacios', 
    component: Step3_Espacios,
    icon: '🏠',
    description: 'Habitaciones, baños y áreas'
  },
  { 
    id: 4, 
    name: 'Datos Específicos', 
    component: Step4_Condicionales,
    icon: '💼',
    description: 'Asignaciones y precios'
  },
  { 
    id: 5, 
    name: 'Servicios', 
    component: Step5_Servicios,
    icon: '💳',
    description: 'Servicios del inmueble'
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
    
    // Asignaciones
    propietario_id: '',
    supervisor_id: '',
    
    // Ubicación
    calle: '',
    colonia: '',
    codigo_postal: '',
    ciudad: '',
    estado: '',
    pais: '',
    referencias: '',
    google_maps_link: '',
    es_complejo: false,
    nombre_complejo: '',
    amenidades_complejo: [],
    
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
    
    // Servicios (NUEVO)
    servicios: [],
    
    // Metadata
    is_draft: true,
    
    // Sobrescribir con datos iniciales si existen
    ...initialData,
  });

  /**
   * Valida los campos requeridos del paso actual
   * @param step Número del paso a validar
   * @returns Objeto con resultado de validación y errores
   */
  const validateStep = useCallback((step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Datos Generales - SOLO nombre es obligatorio
        if (!formData.nombre_propiedad?.trim()) {
          errors.push('El nombre de la propiedad es obligatorio');
        }
        break;
        
      case 2: // Ubicación - TODO opcional por ahora
        // Agregar validaciones cuando sea necesario
        break;
        
      case 3: // Espacios - TODO opcional por ahora
        // Agregar validaciones cuando sea necesario
        break;
        
      case 4: // Datos Específicos - TODO opcional por ahora
        // Agregar validaciones cuando sea necesario
        break;
        
      case 5: // Servicios - TODO opcional por ahora
        // Validaciones opcionales para servicios
        // Por ejemplo: verificar que los servicios tengan datos completos
        if (formData.servicios && formData.servicios.length > 0) {
          formData.servicios.forEach((servicio, index) => {
            if (!servicio.nombre) {
              errors.push(`Servicio #${index + 1}: El nombre es obligatorio`);
            }
            if (!servicio.ultima_fecha_pago) {
              errors.push(`Servicio #${index + 1}: La fecha de último pago es obligatoria`);
            }
            if (servicio.monto <= 0) {
              errors.push(`Servicio #${index + 1}: El monto debe ser mayor a 0`);
            }
          });
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData]);

  /**
   * Actualiza los datos del formulario desde cualquier paso
   * @param stepData Datos parciales a actualizar
   */
  const updateFormData = useCallback((stepData: Partial<PropertyFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  /**
   * Navega a un paso específico con validación
   * @param targetStep Número del paso destino
   */
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
      
      // Scroll al inicio suave
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, formData, validateStep, onSaveDraft]);

  /**
   * Avanza al siguiente paso
   */
  const handleNext = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  /**
   * Retrocede al paso anterior
   */
  const handlePrevious = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  /**
   * Guarda el formulario como borrador
   */
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

  /**
   * Guarda y publica la propiedad (validación completa)
   */
  const handleFinalSave = useCallback(async () => {
    // Validar todos los pasos antes de guardar
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
      // Aquí podrías redirigir o limpiar el formulario
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

        {/* Barra de progreso */}
        <WizardProgress 
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={goToStep}
          formData={formData}
        />

        {/* Contenido del paso actual */}
        <div className="mt-8">
          <CurrentStepComponent
            data={formData}
            onUpdate={updateFormData}
          />
        </div>

        {/* Navegación inferior */}
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          isLoading={isLoading}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onFinalSave={handleFinalSave}
        />

        {/* Indicador de auto-guardado */}
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