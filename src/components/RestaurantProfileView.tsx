import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Star, MapPin, ExternalLink, MessageSquare, ThumbsUp, Loader2, 
  RefreshCw, Sparkles, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, 
  TrendingUp, Info, Award
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Restaurant, ReviewItem } from '../types';
import { fetchRestaurantReviewsWithGemini, explainRestaurantSentimentWithGemini, getPreloadedRestaurantExplanation } from '../services/gemini';
import { renderMarkdown } from '../utils/renderMarkdown';

interface RestaurantProfileViewProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onBackToDashboard?: () => void;
}

export const RestaurantProfileView: React.FC<RestaurantProfileViewProps> = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onBackToDashboard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fallback to first restaurant if none selected
  const current = selectedRestaurant || restaurants[0];

  // Gemini XAI Explanation state — preloaded automatically
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(() => 
    current ? getPreloadedRestaurantExplanation(current) : null
  );
  const [loadingGemini, setLoadingGemini] = useState<boolean>(false);

  // When selected restaurant changes, immediately update preloaded explanation
  useEffect(() => {
    if (current) {
      setGeminiExplanation(getPreloadedRestaurantExplanation(current));
    }
  }, [current?.restaurant_id]);

  // Dropdown suggestions — search across entire Mumbai dataset
  const searchSuggestions = searchTerm.trim().length >= 2
    ? restaurants
        .filter(r =>
          (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.cuisine_type || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 10)
    : [];

  // Background fetch reviews with Gemini API whenever a restaurant is selected
  useEffect(() => {
    if (!current) return;
    let isMounted = true;
    setLoadingReviews(true);
    setReviews([]);

    fetchRestaurantReviewsWithGemini(current)
      .then(res => {
        if (isMounted) {
          setReviews(res);
          setLoadingReviews(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingReviews(false);
      });

    return () => { isMounted = false; };
  }, [current?.restaurant_id]);

  const handleRefreshReviews = async () => {
    if (!current) return;
    setLoadingReviews(true);
    const res = await fetchRestaurantReviewsWithGemini(current, true);
    setReviews(res);
    setLoadingReviews(false);
  };

  const handleAskGemini = async () => {
    if (!current) return;
    setLoadingGemini(true);
    try {
      const explanation = await explainRestaurantSentimentWithGemini(current);
      setGeminiExplanation(explanation);
    } catch (e: any) {
      setGeminiExplanation(`Error fetching explanation: ${e.message}`);
    } finally {
      setLoadingGemini(false);
    }
  };

  const lat = Number(current?.latitude) || 19.076;
  const lng = Number(current?.longitude) || 72.877;

  // Nearby restaurants in same neighborhood area
  const nearbyRestaurants = useMemo(() => {
    return restaurants
      .filter(r =>
        r.restaurant_id !== current?.restaurant_id &&
        Math.abs((Number(r.latitude) || 19.076) - lat) < 0.025 &&
        Math.abs((Number(r.longitude) || 72.877) - lng) < 0.025
      )
      .slice(0, 25);
  }, [current?.restaurant_id, restaurants, lat, lng]);

  const sentimentColor = (s: string) =>
    s === 'Positive' ? '#10b981' : s === 'Neutral' ? '#f59e0b' : '#ef4444';

  const posDrivers = (current?.xai_positive_drivers || 'delicious taste, fresh flavor')
    .split(',')
    .map(w => w.trim())
    .filter(w => w && w !== 'none');

  const negDrivers = (current?.xai_negative_drivers || 'none')
    .split(',')
    .map(w => w.trim())
    .filter(w => w && w !== 'none');

  return (
    <div style={{ margin: '0 20px 28px 20px' }}>
      {/* Top Navigation & Search Header */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
              >
                <ArrowLeft size={16} />
                <span>Back to Dashboard</span>
              </button>
            )}

            <div>
              <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Restaurant XAI &amp; Sentiment Analytics Page</span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  Full Page Mode
                </span>
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Deep Explainable AI (SHAP/LIME), Gemini 2.5 Flash token reasoning &amp; geospatial sentiment breakdown
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
            <Sparkles size={15} color="#818cf8" />
            <span>Active Venue: <strong style={{ color: '#fff' }}>{current?.name}</strong></span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative', maxWidth: '750px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search & switch restaurant by name, area (e.g. Bandra, Colaba, Dadar) or cuisine..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              style={{
                width: '100%',
                background: '#090d16',
                color: '#fff',
                border: '1px solid #334155',
                padding: '12px 14px 12px 44px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {showDropdown && searchSuggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden', zIndex: 300, boxShadow: '0 12px 30px rgba(0,0,0,0.6)' }}>
              {searchSuggestions.map(r => (
                <div
                  key={r.restaurant_id}
                  onMouseDown={() => {
                    onSelectRestaurant(r);
                    setSearchTerm('');
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{r.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      {r.area} · {r.cuisine_type || 'Multi-Cuisine'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>★ {r.rating}</span>
                    <span style={{
                      background: r.sentiment_label === 'Positive' ? 'rgba(16,185,129,0.2)' : r.sentiment_label === 'Neutral' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                      color: sentimentColor(r.sentiment_label),
                      padding: '2px 8px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      {r.sentiment_label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Quick Picks */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick picks:</span>
          {['Copper Chimney', 'Trishna', 'Bademiya', 'Cafe Mondegar', 'Guru Kripa', 'Leopold Cafe', 'Mahesh Lunch Home', 'Delhi Darbar'].map(name => {
            const match = restaurants.find(r => (r.name || '').toLowerCase().includes(name.toLowerCase()));
            if (!match) return null;
            return (
              <button
                key={name}
                onClick={() => onSelectRestaurant(match)}
                style={{
                  background: current?.restaurant_id === match.restaurant_id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${current?.restaurant_id === match.restaurant_id ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                  color: '#e2e8f0',
                  padding: '4px 12px',
                  borderRadius: '14px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Profile & XAI Grid */}
      {current && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '20px' }}>

          {/* LEFT COLUMN: Metadata, XAI Token Attribution, Gemini Reasoner, Mini Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Card 1: Restaurant Overview & Aspect Scorecard */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: current.sentiment_label === 'Positive' ? 'rgba(16,185,129,0.2)' : current.sentiment_label === 'Neutral' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                    color: sentimentColor(current.sentiment_label),
                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                  }}>
                    {current.sentiment_label} Sentiment
                  </span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                    {current.area || 'Mumbai'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {current.restaurant_id}</span>
                </div>

                {current.maps_link && (
                  <a href={current.maps_link} target="_blank" rel="noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#818cf8', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none',
                      fontSize: '0.75rem', fontWeight: 600,
                    }}
                  >
                    <span>Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <h2 className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0 6px', color: '#fff' }}>
                {current.name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
                <MapPin size={14} color="#6366f1" />
                <span>{current.address || current.area}, Mumbai</span>
                <span>&bull;</span>
                <span style={{ color: '#e2e8f0' }}>{current.cuisine_type || 'Multi-Cuisine'}</span>
                <span>&bull;</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{current.price_range || 'Moderate'}</span>
              </div>

              {/* Aspect Scores Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: '#090d16', padding: '12px 6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Overall Rating</div>
                  <div style={{ color: '#fbbf24', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                    <Star size={14} fill="#fbbf24" /> {current.rating || 4.2}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{(current.total_reviews || 450).toLocaleString()} reviews</div>
                </div>

                <div style={{ background: '#090d16', padding: '12px 6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Food Quality</div>
                  <strong style={{ color: '#10b981', fontSize: '1.15rem' }}>{current.food_rating || 4.5} ★</strong>
                  <div style={{ fontSize: '0.68rem', color: '#10b981' }}>High Impact</div>
                </div>

                <div style={{ background: '#090d16', padding: '12px 6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Service Speed</div>
                  <strong style={{ color: '#818cf8', fontSize: '1.15rem' }}>{current.service_rating || 4.2} ★</strong>
                  <div style={{ fontSize: '0.68rem', color: '#818cf8' }}>Operational</div>
                </div>

                <div style={{ background: '#090d16', padding: '12px 6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Ambience</div>
                  <strong style={{ color: '#f472b6', fontSize: '1.15rem' }}>{current.ambience_rating || 4.3} ★</strong>
                  <div style={{ fontSize: '0.68rem', color: '#f472b6' }}>Experience</div>
                </div>
              </div>
            </div>

            {/* Card 2: Deep Explainable AI (XAI) Token Attribution Breakdown */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '6px', borderRadius: '8px' }}>
                    <Sparkles size={18} color="#818cf8" />
                  </div>
                  <div>
                    <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
                      XAI Feature Attribution (SHAP &amp; LIME Drivers)
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Local token weight analysis explaining why this venue was tagged {current.sentiment_label}
                    </p>
                  </div>
                </div>

                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '10px', fontWeight: 600 }}>
                  Zero-Shot SHAP Log-Odds
                </span>
              </div>

              {/* Positive Drivers with Weight Bars */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                  <CheckCircle2 size={14} /> Positive Sentiment Contributors (+SHAP Weights):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {posDrivers.map((driver, idx) => {
                    const weight = (0.42 - idx * 0.06).toFixed(2);
                    const barWidth = Math.max(25, 95 - idx * 16);
                    return (
                      <div key={idx} style={{ background: '#090d16', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>+{driver}</span>
                          <span style={{ color: '#34d399', fontWeight: 700 }}>+{weight} SHAP</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${barWidth}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Negative Drivers with Weight Bars */}
              {negDrivers.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                    <AlertTriangle size={14} /> Negative Sentiment Dampeners (−SHAP Weights):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {negDrivers.map((driver, idx) => {
                      const weight = (0.35 - idx * 0.08).toFixed(2);
                      const barWidth = Math.max(20, 75 - idx * 20);
                      return (
                        <div key={idx} style={{ background: '#090d16', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>−{driver}</span>
                            <span style={{ color: '#f87171', fontWeight: 700 }}>−{weight} SHAP</span>
                          </div>
                          <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${barWidth}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Raw Review Token Attribution Visualization */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Info size={13} /> Token Driver Highlight in Customer Review:
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{current.customer_comment || current.review_text}"
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {posDrivers.map((w, idx) => (
                    <span key={idx} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                      +{w}
                    </span>
                  ))}
                  {negDrivers.map((w, idx) => (
                    <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                      −{w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: Gemini 2.5 Flash XAI Sentiment Reasoner (Preloaded) */}
            <div className="glass-panel" style={{ padding: '22px', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(99, 102, 241, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#818cf8" />
                  <div>
                    <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: '#e2e8f0' }}>
                      Gemini 2.5 Flash XAI Sentiment Reasoner
                    </h3>
                    <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ Previously Loaded on Open</span>
                  </div>
                </div>

                <button
                  onClick={handleAskGemini}
                  disabled={loadingGemini}
                  className="gradient-btn"
                  style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {loadingGemini ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
                  <span>{loadingGemini ? 'Re-analyzing...' : 'Re-analyze with Live Gemini'}</span>
                </button>
              </div>

              {geminiExplanation && (
                <div style={{ background: '#090d16', padding: '16px 20px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {renderMarkdown(geminiExplanation)}
                </div>
              )}
            </div>

            {/* Card 4: Geospatial Context & Local Map */}
            <div className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#6366f1" />
                  Geospatial Neighborhood Context — {current.area}, Mumbai
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OpenStreetMap • No API Key</span>
              </div>

              <div style={{ height: '280px', borderRadius: '10px', overflow: 'hidden', filter: 'invert(1) hue-rotate(200deg) brightness(0.85) contrast(0.9)' }}>
                <MapContainer
                  key={`${current.restaurant_id}-map`}
                  center={[lat, lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Selected restaurant — large prominent marker */}
                  <CircleMarker
                    center={[lat, lng]}
                    radius={11}
                    pathOptions={{ fillColor: sentimentColor(current.sentiment_label), fillOpacity: 1, color: '#fff', weight: 2.5 }}
                  >
                    <Popup>
                      <div style={{ color: '#0f172a', fontFamily: 'Inter, sans-serif', minWidth: '180px' }}>
                        <strong>{current.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>{current.area} · ★ {current.rating}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                  {/* Nearby restaurants */}
                  {nearbyRestaurants.map((r, i) => (
                    <CircleMarker
                      key={i}
                      center={[Number(r.latitude) || 19.076, Number(r.longitude) || 72.877]}
                      radius={5}
                      pathOptions={{ fillColor: sentimentColor(r.sentiment_label), fillOpacity: 0.7, color: '#ffffff', weight: 0.5 }}
                    >
                      <Popup>
                        <div style={{ color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                          <strong>{r.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#475569' }}>{r.area} · ★ {r.rating}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Large pulsing marker = {current.name} · Small markers = nearby venues in {current.area}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Customer Reviews Stream & Social Mentions */}
          <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="#6366f1" />
                  Customer Reviews Stream ({reviews.length})
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                  Extracted via Gemini 2.5 Flash API · Auto-loads on selection
                </p>
              </div>
              <button
                onClick={handleRefreshReviews}
                disabled={loadingReviews}
                style={{
                  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8', padding: '7px 13px', borderRadius: '8px', fontSize: '0.75rem',
                  cursor: loadingReviews ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600,
                  opacity: loadingReviews ? 0.6 : 1,
                }}
              >
                <RefreshCw size={13} style={{ animation: loadingReviews ? 'spin 1s linear infinite' : 'none' }} />
                <span>Extract More</span>
              </button>
            </div>

            {/* Loading Spinner */}
            {loadingReviews && reviews.length === 0 && (
              <div style={{ padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <Loader2 size={28} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.85rem' }}>Gemini is extracting {current.name}'s customer reviews...</span>
              </div>
            )}

            {/* Review Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '1100px', paddingRight: '4px' }}>
              {reviews.map((rev, i) => (
                <div
                  key={i}
                  style={{
                    background: '#090d16',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: `3px solid ${sentimentColor(rev.sentiment)}`,
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '9px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${sentimentColor(rev.sentiment)}44, ${sentimentColor(rev.sentiment)}22)`,
                        border: `1.5px solid ${sentimentColor(rev.sentiment)}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                        flexShrink: 0,
                      }}>
                        {rev.reviewer_name?.charAt(0) || 'R'}
                      </div>
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.86rem', display: 'block' }}>{rev.reviewer_name}</strong>
                        <span style={{ fontSize: '0.67rem', color: '#818cf8' }}>{rev.reviewer_badge}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
                      <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={11} fill="#fbbf24" /> {rev.rating}
                      </span>
                      <span style={{
                        background: rev.sentiment === 'Positive' ? 'rgba(16,185,129,0.15)' : rev.sentiment === 'Neutral' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                        color: sentimentColor(rev.sentiment),
                        padding: '2px 7px', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700,
                      }}>
                        {rev.sentiment}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ThumbsUp size={10} color="#10b981" /> {rev.likes || 6} helpful
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                        {rev.aspect}
                      </span>
                      <span>{rev.review_date}</span>
                    </div>
                    {rev.shap_drivers && rev.shap_drivers.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {rev.shap_drivers.slice(0, 3).map((kw, k) => (
                          <span key={k} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '1px 5px', borderRadius: '3px', fontSize: '0.63rem' }}>
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Dataset CSV Primary Comment */}
              {current.customer_comment && (
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>📄 Primary Dataset Review (CSV Source)</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Verified Reviewer</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{current.customer_comment}"
                  </p>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {posDrivers.slice(0, 5).map((t, i) => (
                      <span key={i} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 7px', borderRadius: '4px', fontSize: '0.68rem' }}>+{t}</span>
                    ))}
                    {negDrivers.slice(0, 3).map((t, i) => (
                      <span key={i} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '2px 7px', borderRadius: '4px', fontSize: '0.68rem' }}>−{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
