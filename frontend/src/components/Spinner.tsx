import React from 'react';
import styles from './Spinner.module.scss';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  className = '',
}) => {
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${className}`}
      role='status'
      aria-label='Loading'
    ></div>
  );
};

export default Spinner;
