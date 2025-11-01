import React from 'react'

interface LoadingProps {
  message?: string
}

export default function Loading({ message = 'Cargando...' }: LoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-ras-azul mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-roboto">{message}</p>
      </div>
    </div>
  )
}
