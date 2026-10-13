import React from 'react';
import { Filter, X, RotateCcw, Search, Star, DollarSign, MessageSquare } from 'lucide-react';
import { Restaurant } from '../types';

export interface AdvancedFilterState {
  searchQuery: string;
  area: string;
  cuisine: string;
  sentiment: string;
  minRating: number;
  priceRange: string;
  minReviews: number;
}

interface AdvancedFiltersProps {
  restaurants: Restaurant[];
  filters: AdvancedFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedFilterState>>;
  isOpen: boolean;
  onToggle: () => void;
  filteredCount: number;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  restaurants,
  filters,
  setFilters,
  isOpen,
  onToggle,
  filteredCount
}) => {
  // Extract unique areas
  const areas = React.useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => { if (r.area) set.add(r.area); });
    return Array.from(set).sort();
  }, [restaurants]);

  // Extract unique cuisines
  const cuisines = React.useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => { if (r.cuisine_type) set.add(r.cuisine_type); });
    return Array.from(set).sort();
  }, [restaurants]);

  // Extract unique price ranges
  const priceRanges = React.useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => { if (r.price_range) set.add(r.price_range); });
    return Array.from(set).sort();
  }, [restaurants]);

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      area: '',
      cuisine: '',
      sentiment: '',
      minRating: 0,
      priceRange: '',
      minReviews: 0,
    });
  };

  const activeCount = [
    filters.searchQuery,
    filters.area,
    filters.cuisine,
    filters.sentiment,
    filters.minRating > 0 ? filters.minRating : '',
    filters.priceRange,
    filters.minReviews > 0 ? filters.minReviews : '',
  ].filter(Boolean).length;

  return (
    <div style={{ margin: '0 20px 20px 20px' }}>
      {/* Trigger & Quick Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--card-glass)',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isOpen ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: isOpen ? '#ffffff' : 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Filter size={16} />
            <span>Advanced Filters</span>
            {activeCount > 0 && (
              <span style={{
                background: '#ec4899',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {activeCount}
              </span>
            )}
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredCount.toLocaleString()}</strong> of <strong>{restaurants.length.toLocaleString()}</strong> restaurants
          </span>
        </div>

        {activeCount > 0 && (
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            <RotateCcw size={14} />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Expanded Filter Drawer */}
      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{
          marginTop: '12px',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {/* 1. Search Query */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Search Keywords
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search venue, cuisine, area..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 2. Neighborhood / Area */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Neighborhood (Area)
            </label>
            <select
              value={filters.area}
              onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
              style={{
                width: '100%',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">All Neighborhoods ({areas.length})</option>
              {areas.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* 3. Cuisine */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Cuisine Type
            </label>
            <select
              value={filters.cuisine}
              onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
              style={{
                width: '100%',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">All Cuisines ({cuisines.length})</option>
              {cuisines.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 4. Sentiment Label */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Sentiment Label
            </label>
            <select
              value={filters.sentiment}
              onChange={(e) => setFilters(prev => ({ ...prev, sentiment: e.target.value }))}
              style={{
                width: '100%',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">All Sentiments</option>
              <option value="Positive">Positive Sentiment</option>
              <option value="Neutral">Neutral Sentiment</option>
              <option value="Negative">Negative Sentiment</option>
            </select>
          </div>

          {/* 5. Minimum Rating */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Min Rating: {filters.minRating > 0 ? `${filters.minRating} ★` : 'Any'}
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>0★</span>
              <span>2.5★</span>
              <span>4.0★</span>
              <span>5.0★</span>
            </div>
          </div>

          {/* 6. Price Range */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Price Range
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              style={{
                width: '100%',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Any Price Range</option>
              {priceRanges.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* 7. Minimum Reviews */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Min Reviews: {filters.minReviews > 0 ? filters.minReviews : 'Any'}
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={filters.minReviews}
              onChange={(e) => setFilters(prev => ({ ...prev, minReviews: parseInt(e.target.value, 10) }))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>0</span>
              <span>250</span>
              <span>500</span>
              <span>1,000+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
