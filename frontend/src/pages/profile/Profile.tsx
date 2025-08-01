import { AxiosError } from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '../../components/Icon';
import { API_ENDPOINTS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { storage } from '../../utils/apiHelpers';
import getErrorMessages from '../../utils/getErrorMessages';
import styles from './Profile.module.scss';
import { useMutation, useQueryClient } from 'react-query';
import { User } from '../../types';
import { api } from '../../lib/api';

export default function Profile() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: updateUser, isLoading: updateUserLoading } = useMutation(
    async (data: Partial<User>) => {
      if (!user) {
        throw new Error('No user logged in');
      }
      const response = await api.put(
        API_ENDPOINTS.USERS.PROFILE(user.id),
        data
      );
      return response.data.user;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user']);
        toast.success('Profile updated successfully!');
        setPassword(''); // Clear password field after successful update
      },
      onError: (error: any) => {
        console.error('Update user error:', error);
        setErrors(getErrorMessages(error as AxiosError<any>));
      },
    }
  );

  const { mutate: handleDelete, isLoading: isDeleting } = useMutation(
    async () => {
      const token = storage.get('token');
      await fetch(API_ENDPOINTS.USERS.PROFILE(user?.id || ''), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    {
      onSuccess: () => {
        toast.success('Account deleted successfully! Sad to see you go 😢');
        queryClient.invalidateQueries(['user']);
        logout();
      },
      onError: (error: any) => {
        console.error('Delete user error:', error);
        toast.error('Failed to delete account');
      },
    }
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>
          Manage your account information and settings.
        </p>
      </div>
      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor='username' className={styles.label}>
            Username
          </label>
          <input
            id='username'
            name='username'
            type='text'
            required
            className={`${styles.input} ${errors?.username ? styles.error : ''}`}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          {errors?.username && (
            <span className={styles.errorMessage}>{errors.username}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor='email' className={styles.label}>
            Email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            className={`${styles.input} ${errors?.email ? styles.error : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {errors?.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor='password' className={styles.label}>
            New Password
          </label>
          <input
            id='password'
            name='password'
            type={showPassword ? 'text' : 'password'}
            className={`${styles.input} ${errors?.password ? styles.error : ''}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Leave blank to keep current password'
          />
          <button
            type='button'
            className={styles.toggleButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Icon name='EyeOff' /> : <Icon name='Eye' />}
          </button>
          {errors?.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type='button'
            onClick={() => {
              if (
                !confirm(
                  'Are you sure you want to delete your account? This action cannot be undone.'
                )
              ) {
                return;
              }
              handleDelete();
            }}
            disabled={isDeleting}
            className={styles.deleteButton}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
          <button
            onClick={() =>
              updateUser({ username, email, ...(password ? { password } : {}) })
            }
            type='submit'
            disabled={updateUserLoading}
            className={styles.saveButton}
          >
            {updateUserLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
