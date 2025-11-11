/**
 * WizardNavigation - VERSIÓN OPTIMIZADA
 * 
 * Componente de navegación mejorado para el wizard
 * 
 * Features nuevas:
 * - Integración con hooks de validación
 * - Indicador de progreso inline
 * - Tooltips informativos
 * - Botón "Guardar y Cerrar"
 * - Shortcuts de teclado
 * - Estados de carga más detallados
 * - Mejor feedback visual
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useConfirm } from '@/components/ui/confirm-modal';
import Button from '@/components/ui/button';

export interface WizardNavigationProps {
  // Estado del wizard
  currentStep: number;
  totalSteps: number;
  
  // Estados de navegación
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  
  // Estados de carga
  isLoading?: boolean;
  isSaving?: boolean;
  
  // Progreso
  progress?: number;
  completedSteps?: Set<number>;
  
  // Callbacks de navegación
  onPrevious: () => void;
  onNext: () => void;
  
  // Callbacks de guardado
  onSaveDraft?: () => void | Promise<void>;
  onSaveAndClose?: () => void | Promise<void>;
  onFinalSave?: () => void | Promise<void>;
  
  // Opciones
  showProgress?: boolean;
  showKeyboardHints?: boolean;
  enableKeyboardShortcuts?: boolean;
}

export default function WizardNavigation({
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  canGoNext,
  canGoPrev,
  isLoading = false,
  isSaving = false,
  progress = 0,
  completedSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  onSaveAndClose,
  onFinalSave,
  showProgress = true,
  showKeyboardHints = false,
  enableKeyboardShortcuts = true
}: WizardNavigationProps) {
  
  const confirm = useConfirm();
  const [showHints, setShowHints] = useState(false);
  
  /**
   * Maneja el click en cancelar con confirmación
   */
  const handleCancel = async () => {
    const confirmed = await confirm.warning(
      '¿Cancelar formulario?',
      'Los cambios no guardados se perderán.'
    );
    
    if (confirmed) {
      window.history.back();
    }
  };
  
  /**
   * Maneja guardar y cerrar
   */
  const handleSaveAndClose = async () => {
    if (onSaveAndClose) {
      await onSaveAndClose();
    } else if (onSaveDraft) {
      await onSaveDraft();
      window.history.back();
    }
  };
  
  /**
   * Shortcuts de teclado
   */
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + → = Siguiente
      if (e.altKey && e.key === 'ArrowRight' && canGoNext && !isLoading) {
        e.preventDefault();
        onNext();
      }
      
      // Alt + ← = Anterior
      if (e.altKey && e.key === 'ArrowLeft' && canGoPrev && !isLoading) {
        e.preventDefault();
        onPrevious();
      }
      
      // Ctrl/Cmd + S = Guardar borrador
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && onSaveDraft && !isLoading) {
        e.preventDefault();
        onSaveDraft();
      }
      
      // Ctrl/Cmd + Enter = Guardar y publicar (último step)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isLastStep && onFinalSave && !isLoading) {
        e.preventDefault();
        onFinalSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    enableKeyboardShortcuts,
    canGoNext,
    canGoPrev,
    isLoading,
    isLastStep,
    onNext,
    onPrevious,
    onSaveDraft,
    onFinalSave
  ]);
  
  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border-2 border-gray-200">
      {/* Barra de progreso inline (opcional) */}
      {showProgress && (
        <div className="px-6 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">
              Progreso del formulario
            </span>
            <span className="text-xs font-bold text-ras-azul">
              {progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ras-azul to-ras-turquesa rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Botones de navegación */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Sección izquierda: Botón Anterior */}
          <div className="w-full sm:w-auto">
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading || !canGoPrev}
                className="w-full sm:w-auto group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Anterior
                {showKeyboardHints && (
                  <span className="ml-2 text-xs opacity-60">Alt+←</span>
                )}
              </Button>
            )}
          </div>
          
          {/* Sección central: Botones de guardado */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            
            {/* Guardar Borrador */}
            {onSaveDraft && !isLastStep && (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isLoading || isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Guardar Borrador
                    {showKeyboardHints && (
                      <span className="ml-2 text-xs opacity-60">Ctrl+S</span>
                    )}
                  </>
                )}
              </Button>
            )}
            
            {/* Guardar y Cerrar */}
            {onSaveAndClose && !isLastStep && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndClose}
                disabled={isLoading || isSaving}
                className="w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Guardar y Cerrar
              </Button>
            )}
            
            {/* Botón principal: Siguiente o Guardar Final */}
            {isLastStep && onFinalSave ? (
              <Button
                type="button"
                variant="primary"
                onClick={onFinalSave}
                disabled={isLoading || isSaving}
                className="w-full sm:w-auto font-bold shadow-lg hover:shadow-xl"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Guardar y Publicar
                    {showKeyboardHints && (
                      <span className="ml-2 text-xs opacity-80">Ctrl+Enter</span>
                    )}
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={onNext}
                disabled={isLoading || !canGoNext}
                className="w-full sm:w-auto group"
              >
                Siguiente
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {showKeyboardHints && (
                  <span className="ml-2 text-xs opacity-80">Alt+→</span>
                )}
              </Button>
            )}
          </div>
          
          {/* Sección derecha: Cancelar */}
          <div className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || isSaving}
              className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cancelar
            </Button>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Info de pasos */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-roboto">
              Paso <strong>{currentStep}</strong> de <strong>{totalSteps}</strong>
              {completedSteps && (
                <> • <strong>{completedSteps.size}</strong> completado{completedSteps.size !== 1 ? 's' : ''}</>
              )}
            </span>
          </div>
          
          {/* Auto-guardado indicator */}
          {onSaveDraft && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-roboto">
                Los cambios se guardan automáticamente al cambiar de paso
              </span>
            </div>
          )}
          
          {/* Mostrar/ocultar hints de teclado */}
          {enableKeyboardShortcuts && (
            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              className="text-xs text-ras-azul hover:text-ras-turquesa underline font-roboto"
            >
              {showHints ? 'Ocultar' : 'Ver'} atajos de teclado
            </button>
          )}
        </div>
        
        {/* Panel de shortcuts */}
        {showHints && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-bold text-blue-900 mb-2">⌨️ Atajos de teclado:</p>
            <ul className="space-y-1 text-xs text-blue-800 font-roboto">
              <li><kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">Alt</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">→</kbd> Siguiente paso</li>
              <li><kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">Alt</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">←</kbd> Paso anterior</li>
              {onSaveDraft && <li><kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">S</kbd> Guardar borrador</li>}
              {isLastStep && onFinalSave && <li><kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">Enter</kbd> Guardar y publicar</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}