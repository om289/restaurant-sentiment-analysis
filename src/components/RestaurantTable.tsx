import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ExternalLink, Star, ChevronLeft, ChevronRight, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Restaurant, FilterState } from '../types';

type SortField = 'name' | 'rating' | 'sentiment' | 'area' | 'cuisine';
type SortDirection = 'asc' | 'desc' | null;

interface RestaurantTableProps {
  restaurants: Restaurant[];
  filters?: FilterState;
  setFilters?: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const RestaurantTable: React.FC<RestaurantTableProps> = React.memo(({
  restaurants,
  filters: propFilters,
  setFilters: propSetFilters,
  onSelectRestaurant,
}) => {
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    searchQuery: '',
    areaFilter: '',
    sentimentFilter: '',
    cuisineFilter: '',
    minRating: 0,
  });

  const filters = propFilters || internalFilters;
  const setFilters = propSetFilters || setInternalFilters;

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const pageSize = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    if (sortDirection === 'asc') return <ArrowUp size={14} />;
    if (sortDirection === 'desc') return <ArrowDown size={14} />;
    return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
  };

  // Filter options
  const areas = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => { if (r.area) set.add(r.area); });
    return Array.from(set).sort();
  }, [restaurants]);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => { if (r.cuisine_type) set.add(r.cuisine_type); });
    return Array.from(set).sort();
  }, [restaurants]);

  // Filtered and sorted dataset
  const filtered = useMemo(() => {
    let result = restaurants.filter(r => {
      // 1. Search Query — searches name, area, cuisine, comment
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = (r.name || '').toLowerCase().includes(q);
        const matchesArea = (r.area || '').toLowerCase().includes(q);
        const matchesCuisine = (r.cuisine_type || '').toLowerCase().includes(q);
        const matchesComment = (r.customer_comment || '').toLowerCase().includes(q);
        if (!matchesName && !matchesArea && !matchesCuisine && !matchesComment) return false;
      }

      // 2. Area Filter
      if (filters.areaFilter && r.area !== filters.areaFilter) return false;

      // 3. Sentiment Filter
      if (filters.sentimentFilter && r.sentiment_label !== filters.sentimentFilter) return false;

      // 4. Cuisine Filter
      if (filters.cuisineFilter && r.cuisine_type !== filters.cuisineFilter) return false;

      // 5. Rating Filter
      if (filters.minRating > 0 && (Number(r.rating) || 0) < filters.minRating) return false;

      return true;
    });

    // Apply sorting
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortField) {
          case 'name':
            aVal = (a.name || '').toLowerCase();
            bVal = (b.name || '').toLowerCase();
            break;
          case 'rating':
            aVal = Number(a.rating) || 0;
            bVal = Number(b.rating) || 0;
            break;
          case 'sentiment':
            const sentimentOrder = { 'Positive': 3, 'Neutral': 2, 'Negative': 1 };
            aVal = sentimentOrder[a.sentiment_label as keyof typeof sentimentOrder] || 0;
            bVal = sentimentOrder[b.sentiment_label as keyof typeof sentimentOrder] || 0;
            break;
          case 'area':
            aVal = (a.area || '').toLowerCase();
            bVal = (b.area || '').toLowerCase();
            break;
          case 'cuisine':
            aVal = (a.cuisine_type || '').toLowerCase();
            bVal = (b.cuisine_type || '').toLowerCase();
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [restaurants, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 20px 24px 20px', padding: '20px' }}>
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            Restaurant Explorer & Sentiment Logs
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length.toLocaleString()} matching venues out of {restaurants.length.toLocaleString()} total entries
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', gridColumn: 'span 2' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search restaurant, dish, comment, or area..."
            value={filters.searchQuery}
            onChange={e => {
              setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              background: 'var(--bg-field)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Area Filter */}
        <select
          value={filters.areaFilter}
          onChange={e => {
            setFilters(prev => ({ ...prev, areaFilter: e.target.value }));
            setCurrentPage(1);
          }}
          style={{ background: 'var(--bg-field)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
        >
          <option value="">All Areas ({areas.length})</option>
          {areas.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Sentiment Filter */}
        <select
          value={filters.sentimentFilter}
          onChange={e => {
            setFilters(prev => ({ ...prev, sentimentFilter: e.target.value }));
            setCurrentPage(1);
          }}
          style={{ background: 'var(--bg-field)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
        >
          <option value="">All Sentiments</option>
          <option value="Positive">Positive (⭐⭐⭐⭐+)</option>
          <option value="Neutral">Neutral (⭐⭐⭐)</option>
          <option value="Negative">Negative (&lt;⭐⭐⭐)</option>
        </select>

        {/* Cuisine Filter */}
        <select
          value={filters.cuisineFilter}
          onChange={e => {
            setFilters(prev => ({ ...prev, cuisineFilter: e.target.value }));
            setCurrentPage(1);
          }}
          style={{ background: 'var(--bg-field)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
        >
          <option value="">All Cuisines</option>
          {cuisines.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Reset */}
        <button
          onClick={() => {
            setFilters({
              searchQuery: '',
              areaFilter: '',
              sentimentFilter: '',
              cuisineFilter: '',
              minRating: 0,
            });
            setCurrentPage(1);
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #334155',
            color: 'var(--text-muted)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => handleSort('name')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.83rem'
                  }}
                >
                  Restaurant Name {getSortIcon('name')}
                </button>
              </th>
              <th style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => handleSort('area')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.83rem'
                  }}
                >
                  Neighborhood {getSortIcon('area')}
                </button>
              </th>
              <th style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => handleSort('cuisine')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.83rem'
                  }}
                >
                  Cuisine {getSortIcon('cuisine')}
                </button>
              </th>
              <th style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => handleSort('rating')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.83rem'
                  }}
                >
                  Rating {getSortIcon('rating')}
                </button>
              </th>
              <th style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => handleSort('sentiment')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.83rem'
                  }}
                >
                  Sentiment {getSortIcon('sentiment')}
                </button>
              </th>
              <th style={{ padding: '12px 14px' }}>Aspect Scores</th>
              <th style={{ padding: '12px 14px' }}>Customer Review Comment</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No restaurants match your filter criteria.
                </td>
              </tr>
            ) : (
              pageData.map((r, i) => {
                return (
                  <motion.tr
                    key={`${r.restaurant_id}-${i}`}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    whileHover={{
                      background: 'rgba(99, 102, 241, 0.06)',
                      transition: { duration: 0.15 }
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {r.name}
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>{r.restaurant_id}</div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {r.area}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      {r.cuisine_type || 'Multi-Cuisine'}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 700, color: '#fbbf24' }}>
                        <Star size={13} fill="#fbbf24" />
                        {r.rating || 4.2}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span className={r.sentiment_label === 'Positive' ? 'badge-pos' : r.sentiment_label === 'Neutral' ? 'badge-neu' : 'badge-neg'}>
                        {r.sentiment_label}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '4px', fontSize: '0.72rem' }}>
                        <span title="Food" style={{ background: 'var(--bg-inset)', padding: '2px 5px', borderRadius: '4px', color: '#047857' }}>F:{r.food_rating || 4.5}</span>
                        <span title="Service" style={{ background: 'var(--bg-inset)', padding: '2px 5px', borderRadius: '4px', color: 'var(--accent-primary)' }}>S:{r.service_rating || 4.2}</span>
                        <span title="Ambience" style={{ background: 'var(--bg-inset)', padding: '2px 5px', borderRadius: '4px', color: '#b45309' }}>A:{r.ambience_rating || 4.3}</span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', maxWidth: '320px', color: 'var(--text-secondary)' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        "{r.customer_comment || r.review_text}"
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        By {r.reviewer_name || 'Verified Diner'} &bull; {r.review_date || 'Recent'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => onSelectRestaurant(r)}
                          title="View Details & XAI"
                          style={{
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>

                        {r.maps_link && (
                          <a
                            href={r.maps_link}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Google Maps"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#94a3b8',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>
          Page {currentPage} of {totalPages} ({filtered.length.toLocaleString()} total venues)
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              background: 'var(--bg-field)',
              border: '1px solid var(--border-color)',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              background: 'var(--bg-field)',
              border: '1px solid var(--border-color)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});
