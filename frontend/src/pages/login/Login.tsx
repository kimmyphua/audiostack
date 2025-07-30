import { AxiosError } from 'axios'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { DEFAULT_CREDENTIALS } from '../../constants'
import getErrorMessages from '../../hooks/getErrorMessages'
import { useAuth } from '../../hooks/useAuth'
import styles from './Login.module.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const auth = useAuth()
  const { loginMutation } = auth || {}
  const { isLoading: loginLoading, mutateAsync: login, reset: clearErrors } = loginMutation || {}
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string> | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ username, password })
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      const fieldErrors = getErrorMessages(error as AxiosError<any>)
      setErrors(fieldErrors)
    }
  }
console.log({errors});

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
              className={`${styles.input} ${errors?.username ? styles.error : ''}`}
              placeholder="Username or Email"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors?.username) {
                  clearErrors?.()
                  setErrors(null)
                }
              }}
            />
            {errors?.username && (
              <span className={styles.errorMessage}>{errors.username}</span>
            )}
            <div className={styles.passwordContainer}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className={`${styles.input} ${errors?.password ? styles.error : ''}`}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors?.password) {
                    clearErrors?.()
                    setErrors(null)
                  }
                }}
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
            </div>

            {errors?.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className={styles.submitButton}
          >
            {loginLoading ? 'Signing in...' : 'Sign in'}
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