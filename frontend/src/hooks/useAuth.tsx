import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, email: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Checking auth, token:', token ? 'exists' : 'not found')
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await api.get('/auth/me')
        console.log('Auth check response:', response.data)
        setUser(response.data.user)
      }
    } catch (error) {
      console.log('Auth check error:', error)
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    console.log('Login attempt for:', username)
    const response = await api.post('/auth/login', { username, password })
    console.log('Full login response:', response)
    console.log('Response data:', response.data)
    const { token, user } = response.data
    console.log('Login response:', { token: token ? 'exists' : 'missing', user })
    
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    console.log('User state set to:', user)
  }

  const register = async (username: string, password: string, email: string) => {
    const response = await api.post('/auth/register', { username, password, email })
    const { token, user } = response.data
    
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = async (data: Partial<User>) => {
    if (!user) return
    
    const response = await api.put(`/users/${user.id}`, data)
    setUser(response.data.user)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
} 