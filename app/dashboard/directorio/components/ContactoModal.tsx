'use client'

import { useEffect, useState } from 'react'

interface ContactoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ContactoFormData) => void
  contacto?: {
    id: string
    nombre: string
    telefono: string
    correo: string
    tipo: 'inquilino' | 'proveedor'
  } | null
}

interface ContactoFormData {
  nombre: string
  telefono: string
  correo: string
  tipo: 'inquilino' | 'proveedor'
}

export default function ContactoModal({ isOpen, onClose, onSave, contacto }: ContactoModalProps) {
  const [formData, setFormData] = useState<ContactoFormData>({
    nombre: '',
    telefono: '',
    correo: '',
    tipo: 'inquilino'
  })

  const [errors, setErrors] = useState<Partial<ContactoFormData>>({})

  // Cargar datos del contacto si está en modo edición
  useEffect(() => {
    if (contacto) {
      setFormData({
        nombre: contacto.nombre,
        telefono: contacto.telefono,
        correo: contacto.correo,
        tipo: contacto.tipo
      })
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        correo: '',
        tipo: 'inquilino'
      })
    }
    setErrors({})
  }, [contacto, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactoFormData> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido'
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleChange = (field: keyof ContactoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">
            {contacto ? '✏️ Editar Contacto' : '➕ Nuevo Contacto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-300 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo de contacto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de contacto *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('tipo', 'inquilino')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                  formData.tipo === 'inquilino'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Inquilino
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleChange('tipo', 'proveedor')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                  formData.tipo === 'proveedor'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7h-9" />
                    <path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" />
                    <circle cx="7" cy="7" r="3" />
                  </svg>
                  Proveedor
                </div>
              </button>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Juan Pérez"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors ${
                errors.nombre
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-yellow-400'
              }`}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="Ej: +52 998 123 4567"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors ${
                errors.telefono
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-yellow-400'
              }`}
            />
            {errors.telefono && (
              <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo electrónico *
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => handleChange('correo', e.target.value)}
              placeholder="Ej: contacto@ejemplo.com"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors ${
                errors.correo
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-yellow-400'
              }`}
            />
            {errors.correo && (
              <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md hover:shadow-lg"
            >
              {contacto ? 'Guardar Cambios' : 'Agregar Contacto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}