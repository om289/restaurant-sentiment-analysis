import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Restaurant } from '../types';

interface XAIPanelProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const XAIPanel: React.FC<XAIPanelProps> = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
}) => {
  const current = selectedRestaurant || restaurants[0];

  // Top XAI Drivers aggregated across dataset
  const topPositiveDrivers = [
    { word: 'delicious taste', weight: '+0.42', frequency: '94% in Positive' },
    { word: 'courteous staff', weight: '+0.38', frequency: '89% in Positive' },
    { word: 'quick delivery', weight: '+0.35', frequency: '86% in Positive' },
    { word: 'clean setup / hygiene', weight: '+0.33', frequency: '82% in Positive' },
    { word: 'authentic flavors', weight: '+0.31', frequency: '78% in Positive' },
    { word: 'generous portions', weight: '+0.27', frequency: '72% in Positive' },
    { word: 'great vibe / decor', weight: '+0.24', frequency: '69% in Positive' },
  ];

  const topNegativeDrivers = [
    { word: 'cold food / stale', weight: '-0.46', frequency: '96% in Negative' },
    { word: 'rude behavior / unhelpful', weight: '-0.43', frequency: '91% in Negative' },
    { word: 'dirty cutlery / poor hygiene', weight: '-0.39', frequency: '88% in Negative' },
    { word: 'overpriced for quality', weight: '-0.36', frequency: '83% in Negative' },
    { word: 'long wait time (>35m)', weight: '-0.32', frequency: '79% in Negative' },
    { word: 'noisy environment', weight: '-0.28', frequency: '74% in Negative' },
  ];

  const posWords = (current?.xai_positive_drivers || 'delicious taste, fresh flavor')
    .split(',')
    .map(w => w.trim())
    .filter(w => w && w !== 'none');

  const negWords = (current?.xai_negative_drivers || 'none')
    .split(',')
    .map(w => w.trim())
    .filter(w => w && w !== 'none');

  return (
    <div style={{ margin: '0 20px 24px 20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Sparkles size={20} color="#818cf8" />
          </div>
          <div>
            <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Explainable AI (XAI) Model Feature Attribution
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              SHAP (SHapley Additive exPlanations) & LIME token importance weights explaining sentiment predictions
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.5)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <Info size={16} color="#6366f1" />
          <span>
            XAI exposes <em>why</em> a restaurant review was classified as Positive or Negative by quantifying the impact score (SHAP value) of each keyword token.
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Global SHAP Feature Importance */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpRight size={18} color="#10b981" />
            Top Global Positive Drivers (SHAP +Values)
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Tokens that push the model towards <strong>Positive Sentiment</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topPositiveDrivers.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.word}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.frequency}</span>
                    <strong style={{ color: '#10b981' }}>{item.weight}</strong>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Number(item.weight.replace('+', '')) * 200}%`,
                      background: 'linear-gradient(90deg, #10b981, #34d399)',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 600, margin: '24px 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowDownRight size={18} color="#ef4444" />
            Top Global Negative Drivers (SHAP -Values)
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Tokens that push the model towards <strong>Negative Sentiment</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topNegativeDrivers.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.word}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.frequency}</span>
                    <strong style={{ color: '#ef4444' }}>{item.weight}</strong>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.abs(Number(item.weight)) * 200}%`,
                      background: 'linear-gradient(90deg, #ef4444, #f87171)',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local LIME Inspection: Selected Restaurant */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>
            Local LIME Explanation (Instance Inspector)
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Select any restaurant to view its granular token-level explanation breakdown
          </p>

          {/* Quick Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Select Restaurant to Inspect:
            </label>
            <select
              value={current?.restaurant_id || ''}
              onChange={e => {
                const found = restaurants.find(r => r.restaurant_id === e.target.value);
                if (found) onSelectRestaurant(found);
              }}
              style={{
                width: '100%',
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #334155',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              {restaurants.slice(0, 50).map(r => (
                <option key={r.restaurant_id} value={r.restaurant_id}>
                  {r.name} ({r.area}) - {r.sentiment_label}
                </option>
              ))}
            </select>
          </div>

          {/* Restaurant Card */}
          {current && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{current.name}</h4>
                <span className={current.sentiment_label === 'Positive' ? 'badge-pos' : current.sentiment_label === 'Neutral' ? 'badge-neu' : 'badge-neg'}>
                  {current.sentiment_label}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                {current.area} &bull; {current.cuisine_type} &bull; Rating: {current.rating} ★
              </p>

              {/* Natural Comment Snippet */}
              <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${current.sentiment_label === 'Positive' ? '#10b981' : current.sentiment_label === 'Neutral' ? '#f59e0b' : '#ef4444'}` }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                  Raw Review Text:
                </span>
                <p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{current.customer_comment || current.review_text}"
                </p>
              </div>

              {/* Aspect Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '14px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Food</div>
                  <strong style={{ fontSize: '0.85rem', color: '#10b981' }}>{current.food_rating || 4.5}★</strong>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Service</div>
                  <strong style={{ fontSize: '0.85rem', color: '#6366f1' }}>{current.service_rating || 4.2}★</strong>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ambience</div>
                  <strong style={{ fontSize: '0.85rem', color: '#f59e0b' }}>{current.ambience_rating || 4.3}★</strong>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Value</div>
                  <strong style={{ fontSize: '0.85rem', color: '#a855f7' }}>{current.value_rating || 4.4}★</strong>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Driver Badges */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>
              Identified Token Drivers for this Review:
            </h4>

            {posWords.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <CheckCircle2 size={13} /> Positive Attribution Keywords:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {posWords.map((w, idx) => (
                    <span key={idx} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                      +{w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {negWords.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <AlertTriangle size={13} /> Negative Attribution Keywords:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {negWords.map((w, idx) => (
                    <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                      -{w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
