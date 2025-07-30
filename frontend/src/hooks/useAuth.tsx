import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { API_ENDPOINTS } from '../constants'
import { api } from '../lib/api'
import { AuthContextType, User } from '../types'
import { storage } from '../utils'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  // Check for existing token on mount
  useEffect(() => {
    const token = storage.get('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // You could fetch user data here if needed
    }
    setLoading(false)
  }, [])

  // Login mutation
  const loginMutation = useMutation(
    async ({ username, password }: { username: string; password: string }) => {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password })
      const { token, user } = response.data
      
      if (!token) {
        throw new Error('No token received from server')
      }
      
      storage.set('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return { token, user }
    },
    {
      onSuccess: (data) => {
        setUser(data.user)
      },
      onError: (error: any) => {
        console.error('Login error:', error)
      }
    }
  )

  // Register mutation
  const registerMutation = useMutation(
    async ({ username, password, email }: { username: string; password: string; email: string }) => {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, { username, password, email })
      const { token, user } = response.data
      
      if (!token) {
        throw new Error('No token received from server')
      }
      
      storage.set('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return { token, user }
    },
    {
      onSuccess: (data) => {
        setUser(data.user)
      },
      onError: (error: any) => {
        console.error('Register error:', error)
      }
    }
  )

  // Update user mutation
  const updateUserMutation = useMutation(
    async (data: Partial<User>) => {
      if (!user) {
        throw new Error('No user logged in')
      }
      
      const response = await api.put(API_ENDPOINTS.USERS.PROFILE(user.id), data)
      return response.data.user
    },
    {
      onSuccess: (updatedUser) => {
        setUser(updatedUser)
        queryClient.invalidateQueries(['user'])
      },
      onError: (error: any) => {
        console.error('Update user error:', error)
      }
    }
  )

  const login = async (username: string, password: string) => {
    return loginMutation.mutateAsync({ username, password })
  }

  const register = async (username: string, password: string, email: string) => {
    return registerMutation.mutateAsync({ username, password, email })
  }

  const logout = () => {
    storage.remove('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    queryClient.clear()
  }

  const updateUser = async (data: Partial<User>) => {
    return updateUserMutation.mutateAsync(data)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      login, 
      register, 
      logout, 
      updateUser,
      loginMutation,
      registerMutation,
      updateUserMutation,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 