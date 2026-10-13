import React from 'react';
import { Utensils, Heart, Github, Share2, Layers, Cpu, Database, MapPin } from 'lucide-react';

interface FooterProps {
  totalRestaurants: number;
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ totalRestaurants, onSelectTab }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mumbai Restaurant Sentiment & DVSMA Analytics Dashboard',
        text: 'Explore sentiment analysis, geospatial mapping, and Explainable AI across 10,000+ Mumbai restaurants.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'var(--card-glass)',
      backdropFilter: 'blur(16px)',
      marginTop: 'auto',
      padding: '40px 24px 24px',
      color: 'var(--text-muted)',
      fontSize: '0.85rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '32px',
        marginBottom: '32px'
      }}>
        {/* Col 1: About */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Utensils size={18} />
            </div>
            <span className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Mumbai <span className="gradient-text">DVSMA &amp; XAI</span>
            </span>
          </div>
          <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
            A state-of-the-art Big Data Analytics (BDA) &amp; Data Visualization and Social Media Analytics (DVSMA) platform analysing 10,000+ Mumbai food establishments with deep Explainable AI (SHAP &amp; LIME) and Gemini 2.5 Flash intelligence.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600
            }}>
              v2.4.0 Production Ready
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600
            }}>
              {totalRestaurants > 0 ? `${totalRestaurants.toLocaleString()} Active Records` : '10,000+ Records'}
            </span>
          </div>
        </div>

        {/* Col 2: Navigation Shortcuts */}
        <div>
          <h4 className="font-heading" style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Navigation
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'overview', label: '📊 Dashboard Overview' },
              { id: 'compare', label: '⚔️ Compare Restaurants' },
              { id: 'map', label: '🗺️ Geospatial Mumbai Map' },
              { id: 'xai', label: '🧠 Explainable AI (SHAP/LIME)' },
              { id: 'gemini', label: '✨ Gemini Copilot' },
              { id: 'explorer', label: '📋 Full Data Explorer' },
            ].map(item => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onSelectTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    padding: '2px 0',
                    transition: 'color 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#818cf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Tech Stack & Architecture */}
        <div>
          <h4 className="font-heading" style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tech Stack Architecture
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { label: 'React 18', icon: Layers },
              { label: 'TypeScript', icon: Cpu },
              { label: 'Vite 5', icon: Layers },
              { label: 'Recharts', icon: Layers },
              { label: 'Leaflet Maps', icon: MapPin },
              { label: 'Gemini 2.5 Flash', icon: Cpu },
              { label: 'SHAP & LIME XAI', icon: Database },
              { label: 'PapaParse CSV', icon: Database },
            ].map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    color: 'var(--text-main)',
                  }}
                >
                  <Icon size={12} color="#6366f1" />
                  {badge.label}
                </span>
              );
            })}
          </div>
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#818cf8',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              <Share2 size={13} />
              <span>Share Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.78rem'
      }}>
        <div>
          Mumbai Restaurant Sentiment &amp; DVSMA Project &bull; Academic &amp; Deployment Grade Analytics
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>OpenStreetMap &bull; Google Maps Review Dataset &bull; Explainable AI</span>
        </div>
      </div>
    </footer>
  );
};
