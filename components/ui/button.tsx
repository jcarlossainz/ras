import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-poppins'
  
  const variants = {
    primary: 'bg-gradient-to-r from-ras-azul to-ras-turquesa text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-ras-crema text-ras-azul border-2 border-ras-azul hover:bg-ras-azul hover:text-white',
    outline: 'border-2 border-ras-azul text-ras-azul bg-transparent hover:bg-ras-azul hover:text-white',
    ghost: 'text-ras-azul hover:bg-ras-crema',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
