'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  title: string
  showBackButton?: boolean
  showAddButton?: boolean
  showUserInfo?: boolean
  userEmail?: string
  onLogout?: () => void
}

export default function TopBar({ 
  title, 
  showBackButton = false, 
  showAddButton = false,
  showUserInfo = false,
  userEmail,
  onLogout 
}: TopBarProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  
  const hoy = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })

  return (
    <>
      <div className="sticky top-0 z-50 bg-gradient-to-b from-ras-azul to-ras-turquesa border-b border-opacity-20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          
          {/* Botón Atrás */}
          {showBackButton && (
            <button 
              onClick={() => router.back()} 
              className="w-11 h-11 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              aria-label="Volver"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Botón + con Dropdown */}
          {showAddButton && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-11 h-11 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                aria-label="Crear nuevo"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute top-14 left-0 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50">
                  <button 
                    onClick={() => {
                      setShowDropdown(false)
                      // Navegar a catálogo y disparar evento para abrir wizard
                      router.push('/dashboard/catalogo')
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('openWizard'))
                      }, 100)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="font-medium text-gray-800">Agregar propiedad</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="3" width="14" height="18" rx="2"/>
                        <path d="M19 7h2M19 12h2M19 17h2" strokeLinecap="round"/>
                        <circle cx="11" cy="9" r="2"/>
                      </svg>
                    </div>
                    <span className="font-medium text-gray-800">Agregar contacto</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <span className="font-medium text-gray-800">Nuevo ticket</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Título */}
          <h1 className="text-xl font-bold text-ras-crema font-poppins">{title}</h1>
          
          <div className="flex-1"></div>
          
          {/* Botones circulares primero */}
          {/* Botón Configuración */}
          {showUserInfo && (
            <button 
              onClick={() => router.push('/perfil')}
              className="w-11 h-11 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              aria-label="Configuración"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
            </button>
          )}

          {/* Botón Logout */}
          {showUserInfo && onLogout && (
            <button 
              onClick={onLogout}
              className="w-11 h-11 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              aria-label="Cerrar sesión"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round"/>
                <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Badges rectangulares después */}
          {/* Info del usuario */}
          {showUserInfo && userEmail && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/30 bg-white/10 text-ras-crema text-xs font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="5"/>
                <path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round"/>
              </svg>
              <span>{userEmail.split('@')[0]}</span>
            </div>
          )}

          {/* Versión RAS */}
          <div className="hidden sm:block px-3 py-1.5 rounded-full border border-white/30 bg-white/10 text-ras-crema text-xs font-medium">
            RAS V_1.0
          </div>

          {/* Fecha */}
          <div className="hidden sm:block px-3 py-1.5 rounded-full border border-white/30 bg-white/10 text-ras-crema text-xs font-medium">
            {hoy}
          </div>
        </div>
      </div>

      {/* Click fuera para cerrar dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </>
  )
}