import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <motion.button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        background: theme === 'dark'
          ? 'rgba(251, 191, 36, 0.12)'
          : 'rgba(99, 102, 241, 0.12)',
        border: `1px solid ${theme === 'dark' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
        color: theme === 'dark' ? '#fbbf24' : '#6366f1',
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ scale: 1.05, rotate: 10 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : 180,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute' }}
      >
        <Sun size={18} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          rotate: theme === 'light' ? 0 : -180,
          opacity: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute' }}
      >
        <Moon size={18} />
      </motion.div>
    </motion.button>
  );
};
