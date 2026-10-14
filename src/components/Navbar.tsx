import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, MapPin, Database, Menu, X, FileDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Theme } from '../hooks/useTheme';

interface NavbarProps {
  totalCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  onOpenExport
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: '📊 Dashboard' },
    { id: 'compare', label: '⚔️ Compare' },
    { id: 'map', label: '🗺️ Mumbai Map' },
    { id: 'xai', label: '🧠 XAI (SHAP/LIME)' },
    { id: 'gemini', label: '✨ Gemini Copilot' },
    { id: 'search', label: '🔍 Restaurant Profile' },
    { id: 'explorer', label: '📋 Data Explorer' },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      className="glass-panel"
      style={{
        margin: '16px 20px',
        padding: '14px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        position: 'relative'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.div
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            flexShrink: 0
          }}
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Utensils size={22} color="#ffffff" />
        </motion.div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              Mumbai <span className="gradient-text">DVSMA &amp; XAI</span>
            </h1>
            <motion.span
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              {totalCount > 0 ? `${totalCount.toLocaleString()} Venues` : 'Mumbai Dataset'}
            </motion.span>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Data Visualization, Sentiment Media Analytics &amp; Gemini AI
          </p>
        </div>
      </div>

      {/* Desktop Tabs */}
      <nav style={{
        display: 'flex',
        flexWrap: 'wrap',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '4px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        gap: '2px',
      }}>
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              padding: '7px 13px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </nav>

      {/* Right Actions: Theme Toggle, Export, CSV Download, Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Theme Toggle */}
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        {/* Export / Report Trigger */}
        <motion.button
          onClick={onOpenExport}
          title="Export CSV or Summary Report"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--accent-primary)',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FileDown size={14} />
          <span>Export</span>
        </motion.button>

        {/* Download CSV */}
        <motion.a
          href="/mumbai_restaurants.csv"
          download="mumbai_restaurants.csv"
          title="Download Raw CSV"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            textDecoration: 'none',
            fontWeight: 500,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Database size={14} />
          <span>CSV</span>
        </motion.a>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            padding: '7px',
            cursor: 'pointer',
          }}
          className="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)'
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--text-main)',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

