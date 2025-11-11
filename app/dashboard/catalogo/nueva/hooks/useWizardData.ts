/**
 * useWizardData
 * 
 * Hook personalizado para manejar los datos del formulario del wizard
 * 
 * Responsabilidades:
 * - Gestión del estado de formData
 * - Sincronización con datos iniciales
 * - Detección de cambios (isDirty)
 * - Guardado de borradores
 * - Guardado final de propiedad
 * - Carga de datos existentes (modo edición)
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PropertyFormData, INITIAL_PROPERTY_DATA } from '@/types/property';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/lib/logger';

export interface UseWizardDataProps {
  initialData?: Partial<PropertyFormData>;
  onSave: (data: PropertyFormData) => Promise<void>;
  onSaveDraft?: (data: PropertyFormData) => Promise<void>;
  mode?: 'create' | 'edit';
  propertyId?: string;
}

export interface UseWizardDataReturn {
  // Estado
  formData: PropertyFormData;
  initialFormData: PropertyFormData;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  
  // Acciones de datos
  updateData: (updates: Partial<PropertyFormData>) => void;
  setFormData: (data: PropertyFormData) => void;
  resetData: () => void;
  
  // Acciones de guardado
  saveDraft: () => Promise<void>;
  saveProperty: () => Promise<void>;
  
  // Utilidades
  hasUnsavedChanges: () => boolean;
}

export function useWizardData({
  initialData,
  onSave,
  onSaveDraft,
  mode = 'create',
  propertyId
}: UseWizardDataProps): UseWizardDataReturn {
  
  const toast = useToast();
  
  // Estado del formulario
  const [formData, setFormDataState] = useState<PropertyFormData>(() => ({
    ...INITIAL_PROPERTY_DATA,
    ...initialData
  }));
  
  // Guardar datos iniciales para comparar cambios
  const [initialFormData] = useState<PropertyFormData>(() => ({
    ...INITIAL_PROPERTY_DATA,
    ...initialData
  }));
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Flag para detectar cambios
  const [isDirty, setIsDirty] = useState(false);
  
  // Referencia para evitar guardados múltiples
  const isSavingRef = useRef(false);
  
  /**
   * Actualiza los datos del formulario
   * Marca como "dirty" automáticamente
   */
  const updateData = useCallback((updates: Partial<PropertyFormData>) => {
    setFormDataState(prev => {
      const newData = { ...prev, ...updates };
      return newData;
    });
    setIsDirty(true);
  }, []);
  
  /**
   * Establece los datos del formulario completos
   * Útil para cargar datos existentes
   */
  const setFormData = useCallback((data: PropertyFormData) => {
    setFormDataState(data);
    setIsDirty(false);
  }, []);
  
  /**
   * Resetea los datos al estado inicial
   */
  const resetData = useCallback(() => {
    setFormDataState(initialFormData);
    setIsDirty(false);
  }, [initialFormData]);
  
  /**
   * Verifica si hay cambios sin guardar
   */
  const hasUnsavedChanges = useCallback((): boolean => {
    return isDirty;
  }, [isDirty]);
  
  /**
   * Guarda el formulario como borrador
   */
  const saveDraft = useCallback(async () => {
    if (!onSaveDraft) {
      logger.warn('onSaveDraft no está definido');
      return;
    }
    
    // Evitar guardados múltiples simultáneos
    if (isSavingRef.current) {
      logger.debug('Ya hay un guardado en progreso, omitiendo...');
      return;
    }
    
    isSavingRef.current = true;
    setIsSaving(true);
    
    try {
      const draftData: PropertyFormData = {
        ...formData,
        is_draft: true,
        updated_at: new Date().toISOString()
      };
      
      await onSaveDraft(draftData);
      
      setIsDirty(false);
      toast.success('💾 Borrador guardado correctamente');
      
      logger.info('Borrador guardado exitosamente');
      
    } catch (error) {
      logger.error('Error al guardar borrador:', error);
      toast.error('❌ Error al guardar el borrador');
      throw error;
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [formData, onSaveDraft, toast]);
  
  /**
   * Guarda la propiedad (publicación final)
   */
  const saveProperty = useCallback(async () => {
    // Evitar guardados múltiples simultáneos
    if (isSavingRef.current) {
      logger.debug('Ya hay un guardado en progreso, omitiendo...');
      return;
    }
    
    isSavingRef.current = true;
    setIsSaving(true);
    
    try {
      const propertyData: PropertyFormData = {
        ...formData,
        is_draft: false,
        published_at: formData.published_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await onSave(propertyData);
      
      setIsDirty(false);
      toast.success('✅ Propiedad guardada y publicada correctamente');
      
      logger.info('Propiedad guardada exitosamente');
      
    } catch (error) {
      logger.error('Error al guardar propiedad:', error);
      toast.error('❌ Error al guardar la propiedad');
      throw error;
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [formData, onSave, toast]);
  
  /**
   * Efecto para cargar datos en modo edición
   */
  useEffect(() => {
    if (mode === 'edit' && propertyId && !isLoading) {
      // Aquí podrías cargar los datos desde Supabase
      // Por ahora solo usamos initialData
      logger.debug(`Modo edición - ID: ${propertyId}`);
    }
  }, [mode, propertyId, isLoading]);
  
  /**
   * Efecto para auto-guardado (opcional)
   * Puedes activarlo si quieres auto-guardar cada X segundos
   */
  useEffect(() => {
    // Deshabilitado por ahora - se guarda al cambiar de step
    // Si quieres habilitar auto-guardado cada 30 segundos:
    /*
    if (isDirty && onSaveDraft) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000); // 30 segundos
      
      return () => clearTimeout(timer);
    }
    */
  }, [isDirty, onSaveDraft]);
  
  return {
    // Estado
    formData,
    initialFormData,
    isDirty,
    isLoading,
    isSaving,
    
    // Acciones de datos
    updateData,
    setFormData,
    resetData,
    
    // Acciones de guardado
    saveDraft,
    saveProperty,
    
    // Utilidades
    hasUnsavedChanges
  };
}