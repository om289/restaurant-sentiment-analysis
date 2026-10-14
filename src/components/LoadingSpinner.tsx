import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = '#6366f1',
  message
}) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 60,
  };

  const circleSize = sizeMap[size];
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    }}>
      <motion.svg
        width={circleSize}
        height={circleSize}
        viewBox="0 0 50 50"
        style={{ overflow: 'visible' }}
      >
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.svg>
      {message && (
        <motion.p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
            textAlign: 'center'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};
