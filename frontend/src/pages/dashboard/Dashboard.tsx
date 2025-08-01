import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { GETTING_STARTED_STEPS, QUICK_ACTIONS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import styles from './Dashboard.module.scss';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, {user?.username}!</h1>
        <p className={styles.subtitle}>
          Manage your audio files and enjoy your music collection.
        </p>
      </div>

      <div className={styles.quickActions}>
        {QUICK_ACTIONS.map(action => (
          <Link
            key={action.name}
            to={action.href}
            className={styles.actionCard}
          >
            <div className={styles.actionContent}>
              <div
                className={`${styles.iconContainer} ${styles[action.color]}`}
              >
                <Icon name={action.icon as any} className={styles.icon} />
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
          {GETTING_STARTED_STEPS.map(step => (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepNumber}>
                <div className={styles.numberCircle}>
                  <span className={styles.number}>{step.number}</span>
                </div>
              </div>
              <div className={styles.stepContent}>
                <p className={styles.stepText}>
                  <span className={styles.highlight}>{step.text}</span> -{' '}
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
