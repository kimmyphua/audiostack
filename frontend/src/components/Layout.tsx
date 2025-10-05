import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/formatters';
import { Icon } from './Icon';
import styles from './Layout.module.scss';

// User Info Component
function UserInfo() {
  const { user } = useAuth();

  return (
    <div className={styles.userInfo}>
      <div className={styles.avatar}>
        <div className={styles.avatarCircle}>
          <span className={styles.avatarText}>
            {getInitials(user?.username || '')}
          </span>
        </div>
      </div>
      <div className={styles.userDetails}>
        <p className={styles.username}>{user?.username}</p>
      </div>
    </div>
  );
}

// User Actions Component (GitHub link and logout button)
function UserActions({ onCloseSidebar }: { onCloseSidebar?: () => void }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Close mobile sidebar if provided
      onCloseSidebar?.();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <button onClick={handleLogout} className={styles.logoutButton}>
        <Icon name='LogOut' className={styles.icon} />
        Logout
      </button>
      <a
        href='https://github.com/kimmyphua'
        target='_blank'
        rel='noopener noreferrer'
        className={styles.githubLink}
      >
        <Icon name='Github' className={styles.icon} />
        Made by kimmyphua
      </a>
    </>
  );
}

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* Mobile sidebar */}
      <div
        className={`${styles.mobileSidebar} ${sidebarOpen ? styles.open : styles.closed}`}
      >
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
        <div className={styles.mobileSidebarContent}>
          <div className={styles.mobileHeader}>
            <h1 className={styles.title}>AudioStack</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <Icon name='X' className={styles.closeIcon} />
            </button>
          </div>
          <nav className={styles.mobileNav}>
            <div className={styles.navList}>
              {NAVIGATION_ITEMS.map(item => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon name={item.icon as any} className={styles.icon} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className={styles.mobileUserSection}>
            <UserInfo />
            <UserActions onCloseSidebar={() => setSidebarOpen(false)} />
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
            {NAVIGATION_ITEMS.map(item => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <Icon name={item.icon as any} className={styles.icon} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className={styles.desktopUserSection}>
          <UserInfo />
          <UserActions />
        </div>
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <button
            type='button'
            className={styles.menuButton}
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name='Menu' className={styles.menuIcon} />
          </button>
        </div>

        <main className={styles.content}>
          <div className={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
