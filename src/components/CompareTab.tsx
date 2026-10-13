import React, { useState, useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Search, GitCompareArrows, Plus, X, Star, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Restaurant } from '../types';

interface CompareTabProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const COMPARE_COLORS = ['#6366f1', '#ec4899', '#10b981'];

export const CompareTab: React.FC<CompareTabProps> = ({ restaurants, onSelectRestaurant }) => {
  const [selected, setSelected] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const suggestions = useMemo(() => {
    if (searchTerm.trim().length < 2) return [];
    const q = searchTerm.toLowerCase();
    return restaurants
      .filter(r =>
        !selected.find(s => s.restaurant_id === r.restaurant_id) &&
        ((r.name || '').toLowerCase().includes(q) ||
         (r.area || '').toLowerCase().includes(q) ||
         (r.cuisine_type || '').toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [searchTerm, restaurants, selected]);

  const addRestaurant = (r: Restaurant) => {
    if (selected.length < 3 && !selected.find(s => s.restaurant_id === r.restaurant_id)) {
      setSelected(prev => [...prev, r]);
    }
    setSearchTerm('');
  };

  const removeRestaurant = (id: string) => {
    setSelected(prev => prev.filter(r => r.restaurant_id !== id));
  };

  // Radar chart data
  const radarData = useMemo(() => {
    if (selected.length === 0) return [];
    return [
      { metric: 'Food', ...Object.fromEntries(selected.map((r, i) => [`r${i}`, Number(r.food_rating) || 3.5])) },
      { metric: 'Service', ...Object.fromEntries(selected.map((r, i) => [`r${i}`, Number(r.service_rating) || 3.5])) },
      { metric: 'Ambience', ...Object.fromEntries(selected.map((r, i) => [`r${i}`, Number(r.ambience_rating) || 3.5])) },
      { metric: 'Value', ...Object.fromEntries(selected.map((r, i) => [`r${i}`, Number(r.value_rating) || 3.5])) },
      { metric: 'Rating', ...Object.fromEntries(selected.map((r, i) => [`r${i}`, Number(r.rating) || 3.5])) },
    ];
  }, [selected]);

  // Bar chart comparison data
  const barData = useMemo(() => {
    return selected.map(r => ({
      name: r.name.length > 18 ? r.name.slice(0, 18) + '…' : r.name,
      Rating: Number(r.rating) || 0,
      Reviews: Number(r.total_reviews) || 0,
    }));
  }, [selected]);

  const sentimentColor = (s: string) =>
    s === 'Positive' ? '#10b981' : s === 'Neutral' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ margin: '0 20px 24px 20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
            <GitCompareArrows size={22} color="#fff" />
          </div>
          <div>
            <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Comparative <span className="gradient-text">Analytics</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Compare up to 3 restaurants side-by-side with radar charts & benchmarking
            </p>
          </div>
        </div>

        {/* Search + Selected Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={selected.length >= 3 ? 'Maximum 3 restaurants selected' : 'Search restaurant to add...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={selected.length >= 3}
              style={{
                width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155',
                padding: '10px 12px 10px 36px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none',
                opacity: selected.length >= 3 ? 0.5 : 1,
              }}
            />

            {suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden', zIndex: 300, boxShadow: '0 12px 30px rgba(0,0,0,0.6)' }}>
                {suggestions.map(r => (
                  <div
                    key={r.restaurant_id}
                    onClick={() => addRestaurant(r)}
                    style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{r.name}</strong>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{r.area} · {r.cuisine_type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>★ {r.rating}</span>
                      <Plus size={14} color="#6366f1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Chips */}
          {selected.map((r, i) => (
            <div key={r.restaurant_id} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: `${COMPARE_COLORS[i]}18`,
              border: `1px solid ${COMPARE_COLORS[i]}44`,
              padding: '6px 12px', borderRadius: '20px',
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COMPARE_COLORS[i] }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{r.name}</span>
              <button
                onClick={() => removeRestaurant(r.restaurant_id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {selected.length === 0 && (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <GitCompareArrows size={48} color="#334155" style={{ marginBottom: '16px' }} />
          <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Select Restaurants to Compare
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '400px', margin: '0 auto' }}>
            Search and add up to 3 restaurants above to see side-by-side radar charts, sentiment comparison, and aspect benchmarking.
          </p>
        </div>
      )}

      {/* Comparison Grid */}
      {selected.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: selected.length >= 2 ? '1fr 1fr' : '1fr', gap: '20px' }}>
          {/* Radar Chart */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 className="font-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>
              Aspect Performance Radar
            </h3>
            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  {selected.map((_, i) => (
                    <Radar
                      key={i}
                      name={selected[i].name}
                      dataKey={`r${i}`}
                      stroke={COMPARE_COLORS[i]}
                      fill={COMPARE_COLORS[i]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <RechartsTooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
              {selected.map((r, i) => (
                <div key={r.restaurant_id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COMPARE_COLORS[i] }} />
                  <span style={{ color: 'var(--text-muted)' }}>{r.name.length > 20 ? r.name.slice(0, 20) + '…' : r.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Head-to-Head Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selected.map((r, i) => (
              <div key={r.restaurant_id} className="glass-panel" style={{
                padding: '18px', borderLeft: `3px solid ${COMPARE_COLORS[i]}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onClick={() => onSelectRestaurant(r)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = COMPARE_COLORS[i])}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{r.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <MapPin size={12} /> {r.area} · {r.cuisine_type} · {r.price_range || 'Moderate'}
                    </div>
                  </div>
                  <span style={{
                    background: `${sentimentColor(r.sentiment_label)}18`,
                    color: sentimentColor(r.sentiment_label),
                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {r.sentiment_label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
                  {[
                    { label: 'Overall', value: r.rating, color: '#fbbf24' },
                    { label: 'Food', value: r.food_rating || 'N/A', color: '#10b981' },
                    { label: 'Service', value: r.service_rating || 'N/A', color: '#6366f1' },
                    { label: 'Ambience', value: r.ambience_rating || 'N/A', color: '#f472b6' },
                    { label: 'Value', value: r.value_rating || 'N/A', color: '#a855f7' },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 4px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{m.label}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: m.color }}>{m.value} ★</div>
                    </div>
                  ))}
                </div>

                {r.customer_comment && (
                  <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{r.customer_comment.slice(0, 120)}…"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
