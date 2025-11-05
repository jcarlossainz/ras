/**
 * useToast HOOK - Interface Simple para Notificaciones
 * =====================================================
 * 
 * Hook personalizado para usar el sistema de toast de forma sencilla.
 * Proporciona una API limpia y fácil de usar en cualquier componente.
 * 
 * CARACTERÍSTICAS:
 * - API simple y directa
 * - Métodos de conveniencia (success, error, warning, info)
 * - Type-safe con TypeScript
 * - Acceso completo al sistema de toast
 * 
 * USO BÁSICO:
 * const toast = useToast()
 * toast.success('¡Éxito!')
 * toast.error('Error')
 */

'use client'

import { useToastContext } from '@/components/ui/toast-provider'
import type { UseToastReturn, ToastOptions, SimpleToastOptions } from '@/types/notifications'

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para acceder al sistema de notificaciones toast
 * 
 * @returns {UseToastReturn} Objeto con métodos para mostrar toasts
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToast()
 *   
 *   const handleClick = () => {
 *     toast.success('¡Operación exitosa!')
 *   }
 *   
 *   return <button onClick={handleClick}>Hacer algo</button>
 * }
 * ```
 */
export function useToast(): UseToastReturn {
  const context = useToastContext()

  // Retornar la API del context
  return {
    // Método genérico
    show: context.show,
    
    // Métodos de conveniencia
    success: context.success,
    error: context.error,
    warning: context.warning,
    info: context.info,
    
    // Métodos de control
    dismiss: context.dismiss,
    dismissAll: context.dismissAll,
    
    // Estado
    toasts: context.toasts,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useToast

// ============================================================================
// EJEMPLOS DE USO COMPLETOS
// ============================================================================

/**
 * EJEMPLO 1: USO BÁSICO
 * =====================
 * 
 * import { useToast } from '@/hooks/useToast'
 * 
 * export default function SaveButton() {
 *   const toast = useToast()
 *   
 *   const handleSave = async () => {
 *     try {
 *       await saveData()
 *       toast.success('Datos guardados correctamente')
 *     } catch (error) {
 *       toast.error('Error al guardar los datos')
 *     }
 *   }
 *   
 *   return (
 *     <button onClick={handleSave}>
 *       Guardar
 *     </button>
 *   )
 * }
 */

/**
 * EJEMPLO 2: CON TÍTULOS Y OPCIONES
 * ==================================
 * 
 * import { useToast } from '@/hooks/useToast'
 * 
 * export default function DeleteButton({ itemName }) {
 *   const toast = useToast()
 *   
 *   const handleDelete = async () => {
 *     try {
 *       await deleteItem()
 *       
 *       toast.success(`${itemName} eliminado correctamente`, {
 *         title: 'Éxito',
 *         duration: 3000,
 *       })
 *     } catch (error) {
 *       toast.error('No se pudo eliminar el elemento', {
 *         title: 'Error',
 *         duration: 5000,
 *       })
 *     }
 *   }
 *   
 *   return <button onClick={handleDelete}>Eliminar</button>
 * }
 */

/**
 * EJEMPLO 3: CON ACCIÓN DE DESHACER
 * ==================================
 * 
 * import { useToast } from '@/hooks/useToast'
 * 
 * export default function DeleteWithUndo({ item, onDelete, onUndo }) {
 *   const toast = useToast()
 *   
 *   const handleDelete = async () => {
 *     // Guardar estado para deshacer
 *     const deletedItem = { ...item }
 *     
 *     // Eliminar
 *     await onDelete(item.id)
 *     
 *     // Mostrar toast con opción de deshacer
 *     toast.success('Elemento eliminado', {
 *       action: {
 *         label: 'Deshacer',
 *         onClick: () => {
 *           onUndo(deletedItem)
 *           toast.info('Eliminación cancelada')
 *         }
 *       },
 *       duration: 8000, // Más tiempo para dar chance de deshacer
 *     })
 *   }
 *   
 *   return <button onClick={handleDelete}>Eliminar</button>
 * }
 */

/**
 * EJEMPLO 4: DIFERENTES POSICIONES
 * =================================
 * 
 * import { useToast } from '@/hooks/useToast'
 * 
 * export default function NotificationDemo() {
 *   const toast = useToast()
 *   
 *   return (
 *     <div>
 *       <button onClick={() => 
 *         toast.info('Arriba izquierda', { position: 'top-left' })
 *       }>
 *         Top Left
 *       </button>
 *       
 *       <button onClick={() => 
 *         toast.info('Arriba centro', { position: 'top-center' })
 *       }>
 *         Top Center
 *       </button>
 *       
 *       <button onClick={() => 
 *         toast.info('Arriba derecha', { position: 'top-right' })
 *       }>
 *         Top Right
 *       </button>
 *       
 *       <button onClick={() => 
 *         toast.info('Abajo izquierda', { position: 'bottom-left' })
 *       }>
 *         Bottom Left
 *       </button>
 *       
 *       <button onClick={() => 
 *         toast.info('Abajo centro', { position: 'bottom-center' })
 *       }>
 *         Bottom Center
 *       </button>
 *       
 *       <button onClick={() => 
 *         toast.info('Abajo derecha', { position: 'bottom-right' })
 *       }>
 *         Bottom Right
 *       </button>
 *     </div>
 *   )
 * }
 */

/**
 * EJEMPLO 5: TOAST PERSISTENTE (SIN AUTO-DISMISS)
 * ================================================
 * 
 * import { useToast } from '@/hooks/useToast'
 * 
 * export default function ImportantUpdate() {
 *   const toast = useToast()
 *   
 *   const showUpdate = () => {
 *     const toastId = toast.show({
 *       type: 'warning',
 *       title: 'Actualización importante',
 *       message: 'Hay una nueva versión disponible. Se recomienda actualizar.',
 *       duration: 0, // No auto-dismiss
 *       action: {
 *         label: 'Actualizar ahora',
 *         onClick: () => {
 *           window.location.reload()
 *         }
 *       }
 *     })
 *     
 *     // Guardar el ID si necesitas cerrarlo programáticamente después
 *     return toastId
 *   }
 *   
 *   return <button onClick={showUpdate}>Mostrar actualización</button>
 * }
 */

/**
 * EJEMPLO 6: TOAST CON LOADING (PROMESA)
 * =======================================
 * 
 * import { useToast } from '@/hooks/useToast'
 * 
 * export default function UploadFile() {
 *   const toast = useToast()
 *   
 *   const handleUpload = async (file: File) => {
 *     // Mostrar toast de loading
 *     const loadingId = toast.info('Subiendo archivo...', {
 *       duration: 0, // No auto-dismiss
 *     })
 *     
 *     try {
 *       await uploadFile(file)
 *       
 *       // Cerrar loading
 *       toast.dismiss(loadingId)
 *       
 *       // Mostrar éxito
 *       toast.success('Archivo subido correctamente', {
 *         title: 'Éxito',
 *       })
 *     } catch (error) {
 *       // Cerrar loading
 *       toast.dismiss(loadingId)
 *       
 *       // Mostrar error
 *       toast.error('Error al subir el archivo', {
 *         title: 'Error',
 *       })
 *     }
 *   }
 *   
 *   return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
 * }
 */

/**
 * EJEMPLO 7: TOAST EN RESPUESTA A API
 * ====================================
 * 
 * import { useToast } from '@/hooks/useToast'
 * import { supabase } from '@/lib/supabase/client'
 * 
 * export default function UpdateProfile() {
 *   const toast = useToast()
 *   
 *   const handleUpdate = async (data: any) => {
 *     const { error } = await supabase
 *       .from('profiles')
 *       .update(data)
 *       .eq('id', userId)
 *     
 *     if (error) {
 *       toast.error(`Error: ${error.message}`, {
 *         title: 'No se pudo actualizar el perfil',
 *       })
 *       return
 *     }
 *     
 *     toast.success('Perfil actualizado correctamente', {
 *       title: 'Cambios guardados',
 *     })
 *   }
 *   
 *   return <button onClick={handleUpdate}>Actualizar</button>
 * }
 */

/**
 * EJEMPLO 8: CERRAR TODOS LOS TOASTS
 * ===================================
 * 
 * import { useToast } from '@/hooks/useToast'
 * 
 * export default function ClearNotifications() {
 *   const toast = useToast()
 *   
 *   return (
 *     <button onClick={() => toast.dismissAll()}>
 *       Cerrar todas las notificaciones
 *     </button>
 *   )
 * }
 */

/**
 * EJEMPLO 9: MIGRACIÓN DESDE alert()
 * ===================================
 * 
 * ANTES (con alert nativo):
 * -------------------------
 * const handleSave = async () => {
 *   try {
 *     await saveData()
 *     alert('✅ Guardado correctamente')
 *   } catch (error) {
 *     alert('❌ Error: ' + error.message)
 *   }
 * }
 * 
 * 
 * DESPUÉS (con useToast):
 * -----------------------
 * import { useToast } from '@/hooks/useToast'
 * 
 * const toast = useToast()
 * 
 * const handleSave = async () => {
 *   try {
 *     await saveData()
 *     toast.success('Guardado correctamente')
 *   } catch (error) {
 *     toast.error(`Error: ${error.message}`)
 *   }
 * }
 */

/**
 * EJEMPLO 10: USO CON FORMULARIOS
 * ================================
 * 
 * import { useToast } from '@/hooks/useToast'
 * import { useForm } from 'react-hook-form'
 * 
 * export default function ContactForm() {
 *   const toast = useToast()
 *   const { register, handleSubmit, formState: { errors } } = useForm()
 *   
 *   const onSubmit = async (data: any) => {
 *     try {
 *       await sendContactForm(data)
 *       
 *       toast.success('Mensaje enviado correctamente', {
 *         title: 'Gracias por contactarnos',
 *       })
 *       
 *     } catch (error) {
 *       toast.error('No se pudo enviar el mensaje', {
 *         title: 'Error',
 *       })
 *     }
 *   }
 *   
 *   // Mostrar errores de validación
 *   useEffect(() => {
 *     if (Object.keys(errors).length > 0) {
 *       toast.warning('Por favor corrige los errores del formulario', {
 *         title: 'Validación fallida',
 *       })
 *     }
 *   }, [errors])
 *   
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       {/* Form fields */}
 *     </form>
 *   )
 * }
 */

/**
 * PATRONES COMUNES DE USO
 * ========================
 * 
 * 1. CRUD Operations:
 *    - Create: toast.success('Creado correctamente')
 *    - Update: toast.success('Actualizado correctamente')
 *    - Delete: toast.success('Eliminado correctamente', { action: undo })
 *    - Error: toast.error('Error en la operación')
 * 
 * 2. Async Operations:
 *    - Start: toast.info('Procesando...', { duration: 0 })
 *    - Success: toast.dismiss(loadingId) + toast.success('Completado')
 *    - Error: toast.dismiss(loadingId) + toast.error('Error')
 * 
 * 3. User Feedback:
 *    - Success: toast.success('Acción completada')
 *    - Warning: toast.warning('Cuidado con esto')
 *    - Info: toast.info('Información importante')
 *    - Error: toast.error('Algo salió mal')
 * 
 * 4. With Actions:
 *    - Delete: { action: { label: 'Deshacer', onClick: undo } }
 *    - Update: { action: { label: 'Ver cambios', onClick: navigate } }
 *    - Info: { action: { label: 'Más info', onClick: showDetails } }
 */
