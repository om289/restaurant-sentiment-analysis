import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, FileSpreadsheet, FileText, Download, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { Restaurant } from '../types';
import { ExportPanel } from './ExportPanel';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  filteredCount?: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  filteredCount
}) => {
  if (!isOpen) return null;

  const handleCSVDownload = () => {
    toast.success('CSV export started! Downloading now...', {
      duration: 3000,
      icon: '📊',
    });
    // The actual download link will handle the download
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close export modal"
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <Download size={20} />
          </div>
          <div>
            <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Export Data &amp; Analytics Report
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Download complete dataset or generated executive analytics summary
            </p>
          </div>
        </div>

        {/* Dataset Stats preview */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Records</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{restaurants.length.toLocaleString()}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Attributes per Record</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>19 Columns (incl. XAI)</strong>
          </div>
        </div>

        {/* Export Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '14px 16px',
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileSpreadsheet size={24} color="#10b981" />
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem', display: 'block' }}>CSV Spreadsheet</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Full tabular data with ratings, coordinates, reviews &amp; SHAP drivers
                </span>
              </div>
            </div>
            <ExportPanel restaurants={restaurants} filteredCount={filteredCount} />
          </div>
        </div>

        {/* Security & Integrity Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>Client-side generation &bull; No third-party data tracking &bull; Instant download</span>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
