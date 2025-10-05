import { AxiosError } from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import getErrorMessages from '../../utils/getErrorMessages';
import styles from './Register.module.scss';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const {
    mutate: register,
    isLoading: registerLoading,
    reset: clearErrors,
  } = useMutation(
    async ({
      username,
      password,
      email,
    }: {
      username: string;
      password: string;
      email: string;
    }) => {
      return await registerUser({ username, password, email });
    },
    {
      onSuccess: () => {
        toast.success(`Registration successful! Welcome ${username} 🥳`);
        navigate('/dashboard');
      },
      onError: (error: any) => {
        console.error('Register error:', error);
        setErrors(getErrorMessages(error as AxiosError<any>));
      },
    }
  );

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <Icon name='Music' className={styles.icon} />
          </div>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>
            Or{' '}
            <Link to='/login' className={styles.link}>
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <label htmlFor='username' className={styles.label}>
                Username
              </label>
              <input
                id='username'
                name='username'
                type='text'
                required
                className={`${styles.input} ${errors?.username ? styles.error : ''}`}
                placeholder='Enter username'
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  clearErrors();
                }}
              />
              {errors?.username && (
                <span className={styles.errorMessage}>{errors.username}</span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor='email' className={styles.label}>
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                required
                className={`${styles.input} ${errors?.email ? styles.error : ''}`}
                placeholder='Enter email'
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  clearErrors();
                }}
              />
              {errors?.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor='password' className={styles.label}>
                Password
              </label>
              <div className={styles.passwordContainer}>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`${styles.input} ${errors?.password ? styles.error : ''}`}
                  placeholder='Enter password'
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    clearErrors();
                  }}
                />
                <button
                  type='button'
                  className={styles.toggleButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Icon name='EyeOff' /> : <Icon name='Eye' />}
                </button>
              </div>
              {errors?.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>
          </div>

          <button
            type='submit'
            onClick={() => register({ username, password, email })}
            disabled={registerLoading}
            className={styles.submitButton}
          >
            {registerLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
