import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { ExternalLink, Star, MapPin } from 'lucide-react';
import { Restaurant } from '../types';

interface InteractiveMapProps {
  restaurants: Restaurant[];
  onSelectRestaurant?: (restaurant: Restaurant) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = React.memo(({ restaurants, onSelectRestaurant }) => {
  const [activeMarker, setActiveMarker] = useState<Restaurant | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<'All' | 'Positive' | 'Neutral' | 'Negative'>('All');

  // Filter valid coordinates and optional sentiment filter
  const displayMarkers = useMemo(() => {
    return restaurants.filter(r => {
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      if (isNaN(lat) || isNaN(lng) || lat < 18.0 || lat > 20.0 || lng < 72.0 || lng > 73.5) {
        return false;
      }
      if (sentimentFilter !== 'All' && r.sentiment_label !== sentimentFilter) {
        return false;
      }
      return true;
    });
  }, [restaurants, sentimentFilter]);

  return (
    <div className="glass-panel" style={{ margin: '0 20px 24px 20px', padding: '16px', height: '620px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
        <div>
          <h2 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
            Geospatial Sentiment Map — Mumbai
          </h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {displayMarkers.length.toLocaleString()} venues plotted • High-performance HTML5 Canvas
          </p>
        </div>

        {/* Sentiment Filter Pills + Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {(['All', 'Positive', 'Neutral', 'Negative'] as const).map(s => {
            const color = s === 'Positive' ? '#10b981' : s === 'Neutral' ? '#f59e0b' : s === 'Negative' ? '#ef4444' : '#818cf8';
            const isActive = sentimentFilter === s;
            return (
              <button
                key={s}
                onClick={() => setSentimentFilter(s)}
                style={{
                  background: isActive ? `${color}33` : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isActive ? color : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isActive ? color : 'var(--text-muted)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s',
                }}
              >
                {s !== 'All' && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />}
                <span>{s}</span>
              </button>
            );
          })}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: '6px' }}>OpenStreetMap • No API Key</span>
        </div>
      </div>

      {/* Dark-styled map wrapper using CSS filter over free OSM tiles */}
      <div style={{ flex: 1, width: '100%', minHeight: '520px', borderRadius: '12px', overflow: 'hidden', filter: 'invert(1) hue-rotate(200deg) brightness(0.85) contrast(0.9)' }}>
        <MapContainer
          center={[19.0760, 72.8777]}
          zoom={11}
          preferCanvas={true}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Free OpenStreetMap tiles — no API key required */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render circle markers efficiently without heavy popup DOM trees */}
          {displayMarkers.map((r, i) => {
            const color = r.sentiment_label === 'Negative' ? '#ef4444'
              : r.sentiment_label === 'Neutral' ? '#f59e0b'
              : '#10b981';

            return (
              <CircleMarker
                key={`${r.restaurant_id || i}`}
                center={[Number(r.latitude) || 19.076, Number(r.longitude) || 72.877]}
                radius={4}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.8,
                  stroke: false,
                }}
                eventHandlers={{
                  click: () => setActiveMarker(r),
                }}
              />
            );
          })}

          {/* Single active popup when clicked — eliminates 10,000 unneeded DOM nodes */}
          {activeMarker && (
            <Popup
              position={[Number(activeMarker.latitude) || 19.076, Number(activeMarker.longitude) || 72.877]}
              eventHandlers={{
                remove: () => setActiveMarker(null),
              }}
            >
              <div style={{ color: '#0f172a', minWidth: '220px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{activeMarker.name}</strong>
                  <span style={{
                    background: activeMarker.sentiment_label === 'Positive' ? '#d1fae5' : activeMarker.sentiment_label === 'Neutral' ? '#fef3c7' : '#fee2e2',
                    color: activeMarker.sentiment_label === 'Positive' ? '#065f46' : activeMarker.sentiment_label === 'Neutral' ? '#92400e' : '#991b1b',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {activeMarker.sentiment_label}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <MapPin size={12} />
                  <span>{activeMarker.area} &bull; {activeMarker.cuisine_type || 'Multi-Cuisine'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: '#d97706', fontWeight: 700 }}>
                    <Star size={13} fill="#d97706" style={{ marginRight: '2px' }} />
                    {activeMarker.rating || 4.2} ★
                  </span>
                  <span style={{ color: '#475569', fontSize: '0.75rem' }}>{activeMarker.price_range || 'Moderate'}</span>
                </div>

                {activeMarker.customer_comment && (
                  <p style={{ fontSize: '0.78rem', color: '#334155', fontStyle: 'italic', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', margin: '6px 0' }}>
                    "{activeMarker.customer_comment.slice(0, 110)}..."
                  </p>
                )}

                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {activeMarker.maps_link ? (
                    <a
                      href={activeMarker.maps_link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#4f46e5', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Google Maps <ExternalLink size={11} />
                    </a>
                  ) : <span />}

                  {onSelectRestaurant && (
                    <button
                      onClick={() => {
                        onSelectRestaurant(activeMarker);
                        setActiveMarker(null);
                      }}
                      style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Inspect XAI Page →
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </MapContainer>
      </div>
    </div>
  );
});
