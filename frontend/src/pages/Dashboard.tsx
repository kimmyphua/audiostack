import { Music, Upload, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Dashboard.module.scss'

export default function Dashboard() {
  const auth = useAuth()
  const { user } = auth || { user: null }

  const quickActions = [
    {
      name: 'Upload Audio',
      description: 'Upload a new audio file',
      href: '/upload',
      icon: Upload,
      color: 'blue',
    },
    {
      name: 'My Files',
      description: 'View and manage your audio files',
      href: '/files',
      icon: Music,
      color: 'green',
    },
    {
      name: 'Profile',
      description: 'Manage your account settings',
      href: '/profile',
      icon: User,
      color: 'purple',
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, {user?.username}!</h1>
        <p className={styles.subtitle}>
          Manage your audio files and enjoy your music collection.
        </p>
      </div>

      <div className={styles.quickActions}>
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className={styles.actionCard}
          >
            <div className={styles.actionContent}>
              <div className={`${styles.iconContainer} ${styles[action.color]}`}>
                <action.icon className={styles.icon} />
              </div>
              <div className={styles.actionDetails}>
                <h3 className={styles.actionTitle}>{action.name}</h3>
                <p className={styles.actionDescription}>{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.gettingStarted}>
        <h2 className={styles.title}>Getting Started</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>
              <div className={styles.numberCircle}>
                <span className={styles.number}>1</span>
              </div>
            </div>
            <div className={styles.stepContent}>
              <p className={styles.stepText}>
                <span className={styles.highlight}>Upload your first audio file</span> - Click on "Upload Audio" to get started with your music collection.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>
              <div className={styles.numberCircle}>
                <span className={styles.number}>2</span>
              </div>
            </div>
            <div className={styles.stepContent}>
              <p className={styles.stepText}>
                <span className={styles.highlight}>Organize your files</span> - Use categories and descriptions to keep your audio files organized.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>
              <div className={styles.numberCircle}>
                <span className={styles.number}>3</span>
              </div>
            </div>
            <div className={styles.stepContent}>
              <p className={styles.stepText}>
                <span className={styles.highlight}>Enjoy your music</span> - Use the built-in audio player to listen to your uploaded files.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 