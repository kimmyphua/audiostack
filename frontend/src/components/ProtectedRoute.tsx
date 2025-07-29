import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth()
  const { user, loading } = auth || { user: null, loading: true }
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  return children
} 