import {
  Home,
  LogOut,
  Menu,
  Music,
  Upload,
  User,
  X
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Layout.module.scss'

export default function Layout() {
  const auth = useAuth()
  const { user, logout } = auth || { user: null, logout: () => {} }
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Upload Audio', href: '/upload', icon: Upload },
    { name: 'My Files', href: '/files', icon: Music },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={styles.container}>
      {/* Mobile sidebar */}
      <div className={`${styles.mobileSidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
        <div className={styles.mobileSidebarContent}>
          <div className={styles.mobileHeader}>
            <h1 className={styles.title}>AudioStack</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className={styles.mobileNav}>
            <div className={styles.navList}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={styles.icon} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
          <div className={styles.mobileUserSection}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                <div className={styles.avatarCircle}>
                  <span className={styles.avatarText}>
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.userDetails}>
                <p className={styles.username}>{user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              <LogOut className={styles.icon} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={styles.desktopSidebar}>
        <div className={styles.desktopHeader}>
          <h1 className={styles.title}>AudioStack</h1>
        </div>
        <nav className={styles.desktopNav}>
          <div className={styles.navList}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <item.icon className={styles.icon} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
        <div className={styles.desktopUserSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <div className={styles.avatarCircle}>
                <span className={styles.avatarText}>
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className={styles.userDetails}>
              <p className={styles.username}>{user?.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <LogOut className={styles.icon} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className={styles.content}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
} 