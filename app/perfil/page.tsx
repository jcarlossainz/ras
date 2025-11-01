'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TopBar from '@/components/ui/topbar'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import Loading from '@/components/ui/loading'

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  
  // Estados para el formulario
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  
  // Estados para cambio de contraseña
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')
  const [cambiandoPassword, setCambiandoPassword] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setUser({ ...profile, id: user.id })
      setNombre(profile.full_name || '')
      setEmail(profile.email || user.email || '')
    }
    
    setLoading(false)
  }

  const handleGuardarNombre = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: nombre })
        .eq('id', user.id)

      if (error) throw error

      alert('✅ Nombre actualizado correctamente')
      setUser({ ...user, full_name: nombre })
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (passwordNueva !== passwordConfirmar) {
      alert('❌ Las contraseñas no coinciden')
      return
    }

    if (passwordNueva.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres')
      return
    }

    setCambiandoPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordNueva
      })

      if (error) throw error

      alert('✅ Contraseña actualizada correctamente')
      setPasswordNueva('')
      setPasswordConfirmar('')
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setCambiandoPassword(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  if (loading) {
    return <Loading message="Cargando perfil..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ras-crema via-white to-ras-crema">
      <TopBar 
        title="Configuración"
        showBackButton={true}
        showUserInfo={true}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Sección: Información Personal */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-6">Información Personal</h2>
          
          <form onSubmit={handleGuardarNombre} className="space-y-5">
            <Input
              label="Nombre completo"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              disabled
              helperText="El email no se puede modificar"
            />

            <Button
              type="submit"
              disabled={guardando}
              variant="primary"
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </div>

        {/* Sección: Cambiar Contraseña */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-2">Cambiar Contraseña</h2>
          <p className="text-sm text-gray-500 mb-6 font-roboto">
            Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
          </p>
          
          <form onSubmit={handleCambiarPassword} className="space-y-5">
            <Input
              label="Nueva contraseña"
              type="password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              value={passwordConfirmar}
              onChange={(e) => setPasswordConfirmar(e.target.value)}
              placeholder="Repite la nueva contraseña"
              required
              error={passwordNueva && passwordConfirmar && passwordNueva !== passwordConfirmar ? 'Las contraseñas no coinciden' : undefined}
            />

            {/* Mensaje de validación positivo */}
            {passwordNueva && passwordConfirmar && passwordNueva === passwordConfirmar && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-600 font-medium">✅ Las contraseñas coinciden</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={cambiandoPassword || passwordNueva !== passwordConfirmar || !passwordNueva}
              variant="primary"
            >
              {cambiandoPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </form>
        </div>

      </main>
    </div>
  )
}