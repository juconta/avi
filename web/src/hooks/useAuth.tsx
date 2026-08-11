import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import type { User } from '../../../shared/src/types/user'
import { authService } from '../services/auth.service'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getUser())
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    if (!authService.isAuthenticated()) return
    try {
      const me = await authService.me()
      setUser(me)
    } catch {
      authService.logout()
      setUser(null)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password })
    setUser(result.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const result = await authService.register({ name, email, password })
    setUser(result.user)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
