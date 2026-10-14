// Modern Design System for Mumbai Restaurant Analytics Dashboard

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  
  // Accent Colors
  accent: {
    indigo: '#6366f1',
    purple: '#a855f7',
    pink: '#ec4899',
    blue: '#3b82f6',
    cyan: '#06b6d4',
  },

  // Sentiment Colors
  sentiment: {
    positive: '#10b981',
    neutral: '#f59e0b',
    negative: '#ef4444',
  },

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const borderRadius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  full: '9999px',
};

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Outfit', 'Inter', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  glowHover: '0 0 30px rgba(99, 102, 241, 0.5)',
};

// Animation presets using Framer Motion
export const animations = {
  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 }
  },

  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      }
    }
  },

  // Hover scale
  hoverScale: {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 }
  },

  // Card hover
  cardHover: {
    whileHover: {
      y: -4,
      boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.2)',
      transition: { duration: 0.25, ease: 'easeOut' }
    }
  },
};

// Transition presets
export const transitions = {
  default: { duration: 0.3, ease: 'easeInOut' },
  fast: { duration: 0.15, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
};

// Gradient presets
export const gradients = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
  secondary: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  purple: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
  blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  rainbow: 'linear-gradient(135deg, #6366f1 0%, #a855f7 33%, #ec4899 66%, #f59e0b 100%)',
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  animations,
  transitions,
  gradients,
};

export type Theme = typeof theme;
