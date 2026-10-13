import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, ExternalLink, ThumbsUp, MessageSquare, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Restaurant } from '../types';
import { explainRestaurantSentimentWithGemini, getPreloadedRestaurantExplanation } from '../services/gemini';
import { renderMarkdown } from '../utils/renderMarkdown';

interface DetailModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ restaurant, onClose }) => {
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(() =>
    restaurant ? getPreloadedRestaurantExplanation(restaurant) : null
  );
  const [loadingGemini, setLoadingGemini] = useState<boolean>(false);

  useEffect(() => {
    if (restaurant) {
      setGeminiExplanation(getPreloadedRestaurantExplanation(restaurant));
    }
  }, [restaurant]);

  if (!restaurant) return null;

  const posDrivers = (restaurant.xai_positive_drivers || 'none')
    .split(',')
    .map(w => w.trim())
    .filter(w => w && w !== 'none');

  const negDrivers = (restaurant.xai_negative_drivers || 'none')
    .split(',')
    .map(w => w.trim())
    .filter(w => w && w !== 'none');

  const handleAskGemini = async () => {
    setLoadingGemini(true);
    try {
      const explanation = await explainRestaurantSentimentWithGemini(restaurant);
      setGeminiExplanation(explanation);
    } catch (e: any) {
      setGeminiExplanation(`Error fetching explanation: ${e.message}`);
    } finally {
      setLoadingGemini(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          position: 'relative',
          background: '#131b2e',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className={restaurant.sentiment_label === 'Positive' ? 'badge-pos' : restaurant.sentiment_label === 'Neutral' ? 'badge-neu' : 'badge-neg'}>
              {restaurant.sentiment_label} Sentiment
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              {restaurant.area || 'Mumbai'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{restaurant.restaurant_id}</span>
          </div>

          <h2 className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 700, margin: '4px 0', color: '#fff' }}>
            {restaurant.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <MapPin size={14} color="#6366f1" />
            <span>{restaurant.address || restaurant.area}, {restaurant.city}</span>
            <span>&bull;</span>
            <span>{restaurant.cuisine_type || 'Multi-Cuisine'}</span>
            <span>&bull;</span>
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>{restaurant.price_range || 'Moderate'}</span>
          </div>
        </div>

        {/* Aspect Scores Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
              <Star size={16} fill="#fbbf24" />
              {restaurant.rating || 4.2}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Food Quality</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>
              {restaurant.food_rating || 4.5} ★
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Service Speed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8' }}>
              {restaurant.service_rating || 4.2} ★
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ambience & Decor</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f472b6' }}>
              {restaurant.ambience_rating || 4.3} ★
            </div>
          </div>
        </div>

        {/* Customer Comment & Social Media Stats */}
        <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <MessageSquare size={14} color="#6366f1" />
              <strong style={{ color: '#fff' }}>{restaurant.reviewer_name || 'Verified Reviewer'}</strong>
              <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '1px 6px', borderRadius: '4px' }}>
                {restaurant.reviewer_badge || 'Local Guide'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {restaurant.review_date || 'Recent Visit'}
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
            "{restaurant.customer_comment || restaurant.review_text}"
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ThumbsUp size={12} color="#10b981" /> {restaurant.likes_count || 14} Likes
            </span>
            <span>{restaurant.helpful_votes || 8} users found this helpful</span>
            <span>Source: {restaurant.comment_source || 'Google Maps / Verified'}</span>
          </div>
        </div>

        {/* Gemini AI On-Demand Explainer */}
        <div style={{ marginBottom: '20px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#818cf8" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>
                Gemini 2.5 Flash XAI Sentiment Reasoner
              </h4>
            </div>

            <button
              onClick={handleAskGemini}
              disabled={loadingGemini}
              className="gradient-btn"
              style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {loadingGemini ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
              <span>{loadingGemini ? 'Analyzing...' : 'Re-analyze with Live Gemini'}</span>
            </button>
          </div>

          {geminiExplanation && (
            <div style={{ background: '#090d16', padding: '16px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {renderMarkdown(geminiExplanation)}
            </div>
          )}
          {!geminiExplanation && !loadingGemini && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Click above to let Gemini 2.5 Flash analyze this customer review and provide a zero-shot XAI token rationale explaining the score.
            </p>
          )}
        </div>

        {/* XAI Attribution Tags */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Sparkles size={16} color="#818cf8" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>
              XAI (Explainable AI) Token Drivers
            </h4>
          </div>

          {posDrivers.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <CheckCircle size={13} /> Positive Attribution Keywords:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {posDrivers.map((w, idx) => (
                  <span key={idx} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
                    +{w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {negDrivers.length > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <AlertCircle size={13} /> Negative Attribution Keywords:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {negDrivers.map((w, idx) => (
                  <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>
                    -{w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {restaurant.maps_link ? (
            <a
              href={restaurant.maps_link}
              target="_blank"
              rel="noreferrer"
              className="gradient-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontSize: '0.85rem' }}
            >
              <span>Open in Google Maps</span>
              <ExternalLink size={14} />
            </a>
          ) : <span />}

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
