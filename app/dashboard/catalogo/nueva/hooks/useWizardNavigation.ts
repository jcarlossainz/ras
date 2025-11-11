/**
 * useWizardNavigation
 * 
 * Hook personalizado para manejar la navegación del wizard
 * 
 * Responsabilidades:
 * - Gestión del step actual
 * - Navegación entre steps (siguiente, anterior, ir a)
 * - Tracking de steps visitados y completados
 * - Cálculo de progreso
 * - Restricciones de navegación
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { PropertyFormData } from '@/types/property';
import { 
  WizardStepKey, 
  WIZARD_STEPS,
  getStepConfig,
  calculateProgress,
  isStepComplete,
  getNextIncompleteStep
} from '../config/wizardConfig';
import { logger } from '@/lib/logger';

export interface UseWizardNavigationReturn {
  // Estado actual
  currentStep: number;
  currentStepKey: WizardStepKey;
  currentStepConfig: any;
  
  // Estados de navegación
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  
  // Steps tracking
  visitedSteps: Set<number>;
  completedSteps: Set<number>;
  
  // Progreso
  progress: number;
  progressPercentage: string;
  
  // Métodos de navegación
  goToStep: (stepId: number) => boolean;
  nextStep: () => boolean;
  prevStep: () => boolean;
  jumpToStep: (stepKey: WizardStepKey) => boolean;
  
  // Verificaciones
  isStepComplete: (stepId: number) => boolean;
  isStepVisited: (stepId: number) => boolean;
  canNavigateToStep: (stepId: number) => boolean;
  
  // Utilidades
  getNextIncompleteStepId: () => number | null;
  resetNavigation: () => void;
}

export interface UseWizardNavigationProps {
  formData: PropertyFormData;
  initialStep?: number;
  allowSkipSteps?: boolean;
  onStepChange?: (newStep: number, oldStep: number) => void | Promise<void>;
  validateBeforeNext?: boolean;
  validateStep?: (stepKey: WizardStepKey) => boolean;
}

export function useWizardNavigation({
  formData,
  initialStep = 1,
  allowSkipSteps = false,
  onStepChange,
  validateBeforeNext = true,
  validateStep
}: UseWizardNavigationProps): UseWizardNavigationReturn {
  
  // Step actual
  const [currentStep, setCurrentStep] = useState(initialStep);
  
  // Steps visitados
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(
    new Set([initialStep])
  );
  
  // Steps completados (calculado dinámicamente)
  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    WIZARD_STEPS.forEach(step => {
      // Solo marcar como completo si:
      // 1. Ha sido visitado (el usuario estuvo ahí)
      // 2. Pasa las validaciones
      const hasBeenVisited = visitedSteps.has(step.id);
      const passesValidation = isStepComplete(step.key, formData);
      
      if (hasBeenVisited && passesValidation) {
        completed.add(step.id);
      }
    });
    return completed;
  }, [formData, visitedSteps]);
  
  // Configuración del step actual
  const currentStepConfig = useMemo(() => {
    return WIZARD_STEPS.find(s => s.id === currentStep);
  }, [currentStep]);
  
  // Key del step actual
  const currentStepKey = useMemo(() => {
    return currentStepConfig?.key || 'general';
  }, [currentStepConfig]);
  
  // Flags de posición
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === WIZARD_STEPS.length;
  
  // Progreso
  const progress = useMemo(() => {
    // Calcular progreso basado en steps realmente completados
    // No usar calculateProgress porque no tiene acceso a visitedSteps
    return Math.round((completedSteps.size / WIZARD_STEPS.length) * 100);
  }, [completedSteps]);
  
  const progressPercentage = useMemo(() => {
    return `${progress}%`;
  }, [progress]);
  
  /**
   * Verifica si un step está completado
   */
  const isStepCompleted = useCallback((stepId: number): boolean => {
    return completedSteps.has(stepId);
  }, [completedSteps]);
  
  /**
   * Verifica si un step ha sido visitado
   */
  const isStepVisited = useCallback((stepId: number): boolean => {
    return visitedSteps.has(stepId);
  }, [visitedSteps]);
  
  /**
   * Verifica si se puede navegar a un step específico
   */
  const canNavigateToStep = useCallback((targetStep: number): boolean => {
    // Siempre se puede ir hacia atrás
    if (targetStep < currentStep) {
      return true;
    }
    
    // Si permite saltar steps
    if (allowSkipSteps) {
      return true;
    }
    
    // Solo se puede avanzar un step a la vez
    if (targetStep === currentStep + 1) {
      return true;
    }
    
    // No se puede saltar steps
    return false;
  }, [currentStep, allowSkipSteps]);
  
  /**
   * Puede avanzar al siguiente step
   */
  const canGoNext = useMemo(() => {
    if (isLastStep) return false;
    
    // Si requiere validación, verificar que el step actual esté completo
    if (validateBeforeNext && validateStep) {
      return validateStep(currentStepKey);
    }
    
    return true;
  }, [isLastStep, validateBeforeNext, validateStep, currentStepKey]);
  
  /**
   * Puede retroceder al step anterior
   */
  const canGoPrev = useMemo(() => {
    return !isFirstStep;
  }, [isFirstStep]);
  
  /**
   * Navega a un step específico por ID
   */
  const goToStep = useCallback((targetStep: number): boolean => {
    // Validar que el step exista
    if (targetStep < 1 || targetStep > WIZARD_STEPS.length) {
      logger.warn(`Step ${targetStep} no existe`);
      return false;
    }
    
    // Verificar si se puede navegar
    if (!canNavigateToStep(targetStep)) {
      logger.warn(`No se puede navegar al step ${targetStep}`);
      return false;
    }
    
    // Validar step actual si es necesario (al avanzar)
    if (targetStep > currentStep && validateBeforeNext && validateStep) {
      if (!validateStep(currentStepKey)) {
        logger.warn(`Step ${currentStep} no válido, no se puede avanzar`);
        return false;
      }
    }
    
    const oldStep = currentStep;
    
    // Actualizar step actual
    setCurrentStep(targetStep);
    
    // Marcar como visitado
    setVisitedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(targetStep);
      return newSet;
    });
    
    // Callback de cambio
    if (onStepChange) {
      Promise.resolve(onStepChange(targetStep, oldStep)).catch(error => {
        logger.error('Error en onStepChange:', error);
      });
    }
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    logger.debug(`Navegando de step ${oldStep} a step ${targetStep}`);
    
    return true;
  }, [
    currentStep, 
    currentStepKey,
    validateBeforeNext, 
    validateStep, 
    onStepChange,
    canNavigateToStep
  ]);
  
  /**
   * Avanza al siguiente step
   */
  const nextStep = useCallback((): boolean => {
    if (!canGoNext) {
      logger.warn('No se puede avanzar al siguiente step');
      return false;
    }
    
    return goToStep(currentStep + 1);
  }, [currentStep, canGoNext, goToStep]);
  
  /**
   * Retrocede al step anterior
   */
  const prevStep = useCallback((): boolean => {
    if (!canGoPrev) {
      logger.warn('No se puede retroceder al step anterior');
      return false;
    }
    
    return goToStep(currentStep - 1);
  }, [currentStep, canGoPrev, goToStep]);
  
  /**
   * Salta a un step específico por key
   */
  const jumpToStep = useCallback((stepKey: WizardStepKey): boolean => {
    const stepConfig = getStepConfig(stepKey);
    if (!stepConfig) {
      logger.warn(`Step con key ${stepKey} no encontrado`);
      return false;
    }
    
    return goToStep(stepConfig.id);
  }, [goToStep]);
  
  /**
   * Obtiene el ID del siguiente step incompleto
   */
  const getNextIncompleteStepId = useCallback((): number | null => {
    const nextIncomplete = getNextIncompleteStep(currentStep, formData);
    return nextIncomplete?.id || null;
  }, [currentStep, formData]);
  
  /**
   * Resetea la navegación al estado inicial
   */
  const resetNavigation = useCallback(() => {
    setCurrentStep(initialStep);
    setVisitedSteps(new Set([initialStep]));
    logger.debug('Navegación reseteada');
  }, [initialStep]);
  
  /**
   * Efecto para logging de cambios de step
   */
  useEffect(() => {
    logger.debug(`Step actual: ${currentStep} (${currentStepKey})`);
    logger.debug(`Progreso: ${progress}%`);
    logger.debug(`Steps completados: ${Array.from(completedSteps).join(', ')}`);
  }, [currentStep, currentStepKey, progress, completedSteps]);
  
  return {
    // Estado actual
    currentStep,
    currentStepKey,
    currentStepConfig,
    
    // Estados de navegación
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrev,
    
    // Steps tracking
    visitedSteps,
    completedSteps,
    
    // Progreso
    progress,
    progressPercentage,
    
    // Métodos de navegación
    goToStep,
    nextStep,
    prevStep,
    jumpToStep,
    
    // Verificaciones
    isStepComplete: isStepCompleted,
    isStepVisited,
    canNavigateToStep,
    
    // Utilidades
    getNextIncompleteStepId,
    resetNavigation
  };
}

/**
 * UTILIDADES ADICIONALES PARA NAVEGACIÓN
 */

/**
 * Hook para manejar confirmación antes de salir
 */
export function useNavigationGuard(
  isDirty: boolean,
  message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.'
) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);
}

/**
 * Hook para navegación con teclado
 */
export function useKeyboardNavigation(
  canGoNext: boolean,
  canGoPrev: boolean,
  onNext: () => void,
  onPrev: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + Flecha Derecha = Siguiente
      if (e.altKey && e.key === 'ArrowRight' && canGoNext) {
        e.preventDefault();
        onNext();
      }
      
      // Alt + Flecha Izquierda = Anterior
      if (e.altKey && e.key === 'ArrowLeft' && canGoPrev) {
        e.preventDefault();
        onPrev();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [enabled, canGoNext, canGoPrev, onNext, onPrev]);
}