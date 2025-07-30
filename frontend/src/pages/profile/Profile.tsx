import { useState } from 'react'
import toast from 'react-hot-toast'
import { API_ENDPOINTS } from '../../constants'
import { useAuth } from '../../hooks/useAuth'
import { storage } from '../../utils'
import styles from './Profile.module.scss'
import { AxiosError } from 'axios'
import getErrorMessages from '../../hooks/getErrorMessages'
import { Icon } from '../../components/Icon'

export default function Profile() {
  const auth = useAuth()
  const { user, updateUserMutation, logout } = auth || { 
    user: null, 
    updateUserMutation: null, 
    logout: () => {} 
  }
  const { isLoading: updateLoading, mutateAsync: updateUser } = updateUserMutation || {}
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string> | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateUser({ username, email, ...(password ? { password } : {}) })
      toast.success('Profile updated successfully!')
      setPassword('') // Clear password field after successful update
    } catch (error: any) {
      console.log('Profile update error caught in component:', error)
      setErrors(getErrorMessages(error as AxiosError<any>))
    }
  }
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    setDeleting(true)
    try {
      const token = storage.get('token')
      await fetch(API_ENDPOINTS.USERS.PROFILE(user?.id || ''), { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      })
      toast.success('Account deleted successfully!')
      logout()
    } catch (error: any) {
      console.log('Account deletion error:', error)
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>
          Manage your account information and settings.
        </p>
      </div>
      <form onSubmit={handleUpdate} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            className={`${styles.input} ${errors?.username ? styles.error : ''}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
            {errors?.username && (
              <span className={styles.errorMessage}>{errors.username}</span>
            )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`${styles.input} ${errors?.email ? styles.error : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors?.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            New Password
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className={`${styles.input} ${errors?.password ? styles.error : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
            <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Icon name="EyeOff" />
                ) : (
                  <Icon name="Eye" />
                )}
              </button>
          {errors?.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={styles.deleteButton}
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
          <button
            type="submit"
            disabled={updateLoading}
            className={styles.saveButton}
          >
            {updateLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 