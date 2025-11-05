/**
 * TOAST COMPONENT - Notificación Individual Mejorada
 * ===================================================
 * 
 * Componente para mostrar notificaciones tipo toast con:
 * - 4 tipos: success, error, warning, info
 * - Animaciones suaves
 * - Auto-dismiss configurable
 * - Acción opcional
 * - Diseño profesional
 * 
 * USO:
 * Este componente generalmente NO se usa directamente.
 * Se usa a través del ToastProvider y useToast hook.
 */

'use client'

import { useEffect, useState } from 'react'
import type { ToastProps, NotificationType } from '@/types/notifications'
import { colors } from '@/lib/constants/design-tokens'

// ============================================================================
// CONFIGURACIÓN DE ESTILOS POR TIPO
// ============================================================================

const toastStyles = {
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-800',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-800',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round"/>
        <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round"/>
      </svg>
    ),
  },
  warning: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-800',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
      </svg>
    ),
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-800',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round"/>
        <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round"/>
      </svg>
    ),
  },
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  const style = toastStyles[toast.type]
  const duration = toast.duration || 5000
  const showProgress = duration > 0 && toast.dismissible !== false

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Auto-dismiss con countdown
  useEffect(() => {
    if (duration === 0) return

    let startTime = Date.now()
    let animationFrame: number
    let timeout: NodeJS.Timeout

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      const progressPercent = (remaining / duration) * 100
      
      setProgress(progressPercent)
      
      if (remaining > 0) {
        animationFrame = requestAnimationFrame(updateProgress)
      }
    }

    // Iniciar countdown visual
    animationFrame = requestAnimationFrame(updateProgress)

    // Auto-dismiss al terminar
    timeout = setTimeout(() => {
      handleDismiss()
    }, duration)

    return () => {
      cancelAnimationFrame(animationFrame)
      clearTimeout(timeout)
    }
  }, [duration])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDismiss = () => {
    setIsExiting(true)
    // Esperar a que termine la animación antes de remover
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300)
  }

  const handleAction = () => {
    if (toast.action?.onClick) {
      toast.action.onClick()
      handleDismiss()
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`
        relative
        min-w-[320px] max-w-md w-full
        ${style.bgColor}
        border-l-4 ${style.borderColor}
        rounded-xl shadow-xl
        overflow-hidden
        transition-all duration-300 ease-out
        ${isExiting 
          ? 'opacity-0 translate-x-full scale-95' 
          : 'opacity-100 translate-x-0 scale-100'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Barra de progreso */}
      {showProgress && (
        <div 
          className={`absolute top-0 left-0 h-1 ${style.borderColor.replace('border-', 'bg-')} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Contenido principal */}
      <div className="p-4 pt-5">
        <div className="flex items-start gap-3">
          {/* Ícono */}
          <div className={`
            flex-shrink-0
            w-10 h-10
            ${style.iconBg}
            rounded-lg
            flex items-center justify-center
            ${style.iconColor}
          `}>
            {style.icon}
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h3 className={`
                font-semibold font-poppins
                ${style.textColor}
                text-sm mb-1
              `}>
                {toast.title}
              </h3>
            )}
            <p className={`
              ${style.textColor}
              text-sm
              ${toast.title ? 'opacity-90' : 'font-medium'}
            `}>
              {toast.message}
            </p>

            {/* Acción opcional */}
            {toast.action && (
              <button
                onClick={handleAction}
                className={`
                  mt-3
                  text-sm font-semibold
                  ${style.textColor}
                  hover:underline
                  focus:outline-none focus:underline
                `}
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Botón cerrar */}
          {toast.dismissible !== false && (
            <button
              onClick={handleDismiss}
              className={`
                flex-shrink-0
                w-8 h-8
                rounded-lg
                ${style.textColor} opacity-50
                hover:opacity-100 hover:bg-black/5
                transition-all duration-200
                flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-offset-1
                ${style.borderColor.replace('border-', 'focus:ring-')}
              `}
              aria-label="Cerrar notificación"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ESTILOS DE ANIMACIÓN PARA TAILWIND
// ============================================================================

/**
 * NOTA: Agregar estas animaciones a tu tailwind.config.ts:
 * 
 * theme: {
 *   extend: {
 *     keyframes: {
 *       'slide-in-right': {
 *         '0%': { 
 *           transform: 'translateX(100%)',
 *           opacity: '0',
 *         },
 *         '100%': { 
 *           transform: 'translateX(0)',
 *           opacity: '1',
 *         },
 *       },
 *       'slide-out-right': {
 *         '0%': { 
 *           transform: 'translateX(0)',
 *           opacity: '1',
 *         },
 *         '100%': { 
 *           transform: 'translateX(100%)',
 *           opacity: '0',
 *         },
 *       },
 *     },
 *     animation: {
 *       'slide-in': 'slide-in-right 0.3s ease-out',
 *       'slide-out': 'slide-out-right 0.3s ease-in',
 *     },
 *   },
 * }
 */

// ============================================================================
// EJEMPLOS DE USO DIRECTO (poco común)
// ============================================================================

/**
 * Generalmente NO usas este componente directamente.
 * En su lugar, usa el hook useToast:
 * 
 * import { useToast } from '@/hooks/useToast'
 * 
 * function MyComponent() {
 *   const toast = useToast()
 *   
 *   return (
 *     <button onClick={() => toast.success('¡Guardado!')}>
 *       Guardar
 *     </button>
 *   )
 * }
 * 
 * 
 * Pero si necesitas usarlo directamente:
 * 
 * import Toast from '@/components/ui/toast'
 * 
 * <Toast
 *   toast={{
 *     id: '1',
 *     type: 'success',
 *     title: 'Éxito',
 *     message: 'Operación completada',
 *     duration: 5000,
 *     dismissible: true,
 *   }}
 *   onDismiss={(id) => console.log('Toast cerrado:', id)}
 * />
 */
