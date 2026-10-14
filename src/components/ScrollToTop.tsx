import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)',
            zIndex: 1000,
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{
            scale: 1.1,
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.6)',
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
