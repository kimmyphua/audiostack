import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { DEFAULT_CREDENTIALS } from '../../constants'
import { useAuth } from '../../hooks'
import styles from './Login.module.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const { login } = auth || { login: async () => {} }
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Attempting login...')
      await login(username, password)
      console.log('Login successful, navigating to dashboard...')
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error: any) {
      console.log('Login error:', error)
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <Icon name="Music" className={styles.icon} />
          </div>
          <h2 className={styles.title}>
            Sign in to AudioStack
          </h2>
          <p className={styles.subtitle}>
            Or{' '}
            <Link to="/register" className={styles.link}>
              create a new account
            </Link>
          </p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className={styles.passwordContainer}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Icon name="EyeOff" className="h-5 w-5" />
                ) : (
                  <Icon name="Eye" className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className={styles.credentials}>
            <p className={styles.text}>
              Default credentials: {DEFAULT_CREDENTIALS.username} / {DEFAULT_CREDENTIALS.password}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 