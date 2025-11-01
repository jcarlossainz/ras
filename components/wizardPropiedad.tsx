'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface WizardProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export default function WizardPropiedad({ userId, onClose, onSuccess }: WizardProps) {
  const [paso, setPaso] = useState(1)
  const [guardando, setGuardando] = useState(false)

  const [nombre, setNombre] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      alert('El nombre es requerido')
      return
    }

    setGuardando(true)
    try {
      const { error } = await supabase.from('propiedades').insert({
        user_id: userId,
        nombre: nombre.trim(),
        codigo_postal: codigoPostal.trim() || null
      })

      if (error) throw error

      alert('✅ Propiedad creada exitosamente')
      onSuccess()
      onClose()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-5 overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 md:p-10"
      >
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-gray-900 mb-3">
            {paso === 1 && 'Nombre de la propiedad'}
            {paso === 2 && 'Ubicación'}
          </h2>
          <div className="flex gap-2 mt-4">
            <div className={`flex-1 h-1.5 rounded-full transition-all ${paso >= 1 ? 'bg-ras-azul' : 'bg-gray-200'}`}></div>
            <div className={`flex-1 h-1.5 rounded-full transition-all ${paso >= 2 ? 'bg-ras-azul' : 'bg-gray-200'}`}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Paso {paso} de 2</p>
        </div>

        {/* Paso 1: Nombre */}
        {paso === 1 && (
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              ¿Cómo se llama tu propiedad?
            </label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Ej: Casa en Polanco, Departamento Centro..."
              required 
              autoFocus 
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-2xl outline-none focus:border-ras-azul transition-colors"
            />
          </div>
        )}

        {/* Paso 2: Código Postal */}
        {paso === 2 && (
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              ¿Cuál es el código postal?
            </label>
            <input 
              type="text" 
              value={codigoPostal} 
              onChange={(e) => setCodigoPostal(e.target.value)} 
              placeholder="Ej: 11560"
              autoFocus
              maxLength={10}
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-2xl outline-none focus:border-ras-azul transition-colors"
            />
            <p className="text-sm text-gray-500 mt-2">Opcional - Puedes dejarlo en blanco</p>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex gap-3">
          {paso === 1 ? (
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 border-2 border-gray-300 rounded-2xl bg-white text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => setPaso(1)} 
              className="flex-1 py-4 border-2 border-gray-300 rounded-2xl bg-white text-gray-700 font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              ← Atrás
            </button>
          )}

          {paso === 1 ? (
            <button 
              type="button" 
              onClick={() => setPaso(2)} 
              disabled={!nombre.trim()}
              className="flex-1 py-4 rounded-2xl font-semibold text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: nombre.trim() ? 'linear-gradient(135deg, #00768E 0%, #00CC99 100%)' : '#d1d5db'
              }}
            >
              Siguiente →
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={guardando}
              className="flex-1 py-4 rounded-2xl font-semibold text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: guardando ? '#d1d5db' : 'linear-gradient(135deg, #00CC99 0%, #00768E 100%)'
              }}
            >
              {guardando ? 'Guardando...' : '✓ Crear Propiedad'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}