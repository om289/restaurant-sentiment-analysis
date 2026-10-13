import React, { useMemo } from 'react';
import { TrendingUp, Gem, Flame, Star, MapPin, ArrowRight } from 'lucide-react';
import { Restaurant } from '../types';

interface TrendingInsightsProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const TrendingInsights: React.FC<TrendingInsightsProps> = React.memo(({ restaurants, onSelectRestaurant }) => {
  if (restaurants.length === 0) return null;

  // Compute insights from the dataset
  const insights = useMemo(() => {
    // Top rated restaurants (highest rating + most reviews)
    const topRated = [...restaurants]
      .filter(r => Number(r.rating) >= 4.5 && Number(r.total_reviews) >= 100)
      .sort((a, b) => (Number(b.rating) * Math.log10(Number(b.total_reviews) || 1)) - (Number(a.rating) * Math.log10(Number(a.total_reviews) || 1)))
      .slice(0, 5);

    // Hidden gems: high rating but low review count (underrated)
    const hiddenGems = [...restaurants]
      .filter(r => Number(r.rating) >= 4.3 && Number(r.total_reviews) < 100 && r.sentiment_label === 'Positive')
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 5);

    // Highest negative sentiment areas
    const areaMap: Record<string, { total: number; negative: number; positive: number }> = {};
    restaurants.forEach(r => {
      const area = r.area || 'Unknown';
      if (!areaMap[area]) areaMap[area] = { total: 0, negative: 0, positive: 0 };
      areaMap[area].total++;
      if (r.sentiment_label === 'Negative') areaMap[area].negative++;
      if (r.sentiment_label === 'Positive') areaMap[area].positive++;
    });

    const hotAreas = Object.entries(areaMap)
      .filter(([, v]) => v.total >= 20)
      .sort((a, b) => (b[1].positive / b[1].total) - (a[1].positive / a[1].total))
      .slice(0, 5)
      .map(([area, stats]) => ({
        area,
        positiveRate: ((stats.positive / stats.total) * 100).toFixed(1),
        total: stats.total,
      }));

    // Most reviewed cuisines
    const cuisineMap: Record<string, { count: number; avgRating: number; totalRating: number }> = {};
    restaurants.forEach(r => {
      const c = r.cuisine_type || 'Other';
      if (!cuisineMap[c]) cuisineMap[c] = { count: 0, avgRating: 0, totalRating: 0 };
      cuisineMap[c].count++;
      cuisineMap[c].totalRating += Number(r.rating) || 0;
    });
    const topCuisines = Object.entries(cuisineMap)
      .map(([cuisine, stats]) => ({ cuisine, count: stats.count, avgRating: (stats.totalRating / stats.count).toFixed(2) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { topRated, hiddenGems, hotAreas, topCuisines };
  }, [restaurants]);

  return (
    <div style={{ margin: '0 20px 24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={18} color="#fff" />
        </div>
        <div>
          <h2 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            Trending <span className="gradient-text">Insights</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Auto-computed analytics from {restaurants.length.toLocaleString()} venues
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Top Rated Venues */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Flame size={16} color="#f59e0b" /> Top Rated Venues
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.topRated.map((r, i) => (
              <button
                key={r.restaurant_id}
                onClick={() => onSelectRestaurant(r)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  color: 'var(--text-main)', transition: 'all 0.15s', textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.area} · {r.cuisine_type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Star size={12} fill="#fbbf24" /> {r.rating}
                  </span>
                  <ArrowRight size={13} color="var(--text-muted)" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hidden Gems */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Gem size={16} color="#a855f7" /> Hidden Gems
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            High rated but low review count — underrated picks
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.hiddenGems.map((r, i) => (
              <button
                key={r.restaurant_id}
                onClick={() => onSelectRestaurant(r)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  color: 'var(--text-main)', transition: 'all 0.15s', textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.15)'; }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.area} · {r.total_reviews || 0} reviews</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="badge-pos">{r.rating} ★</span>
                  <ArrowRight size={13} color="var(--text-muted)" />
                </div>
              </button>
            ))}
            {insights.hiddenGems.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                No hidden gems detected in current dataset
              </p>
            )}
          </div>
        </div>

        {/* Best Neighborhoods */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <MapPin size={16} color="#10b981" /> Top Neighborhoods
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            Highest positive sentiment concentration
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.hotAreas.map((area, i) => (
              <div
                key={area.area}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                  padding: '10px 12px', borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{area.area}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{area.total} venues</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>{area.positiveRate}%</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>positive</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cuisines */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Star size={16} color="#ec4899" /> Popular Cuisines
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.topCuisines.map((c, i) => {
              const barWidth = Math.max(15, (c.count / (insights.topCuisines[0]?.count || 1)) * 100);
              return (
                <div key={c.cuisine} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.cuisine}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.count} venues · {c.avgRating} ★</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${barWidth}%`, height: '100%',
                      background: `linear-gradient(90deg, #ec4899, #f472b6)`,
                      borderRadius: '3px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
