import React from 'react'

interface CardProps {
  title: string
  icon: React.ReactNode
  onClick?: () => void
  badge?: string
  badgeColor?: 'green' | 'gray'
  className?: string
}

export default function Card({ 
  title, 
  icon, 
  onClick, 
  badge, 
  badgeColor = 'gray',
  className = '' 
}: CardProps) {
  
  const badgeColors = {
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-100 text-gray-600'
  }
  
  return (
    <button 
      onClick={onClick}
      className={`group aspect-square bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all p-6 flex flex-col items-center justify-center gap-4 relative ${className}`}
    >
      {badge && (
        <div 
          className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-lg font-semibold ${badgeColors[badgeColor]}`}
        >
          {badge}
        </div>
      )}
      
      <div className="group-hover:scale-110 transition-transform">
        {icon}
      </div>
      
      <span className="text-2xl font-bold text-gray-800 font-poppins text-center">
        {title}
      </span>
    </button>
  )
}
